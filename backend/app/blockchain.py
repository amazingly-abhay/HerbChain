from web3 import Web3
from app.config import settings
import json
import os
import hashlib

# Maps our string stage names to the Solidity StepType enum indices.
# enum StepType { Collection(0), Processing(1), Testing(2), Shipment(3), Retail(4) }
STEP_TYPE_MAP = {
    "collection": 0,
    "processing": 1,
    "testing": 2,
    "shipment": 3,
    "retail": 4,
}


class BlockchainManager:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
        self.contract = None
        self.account = None
        self._connected = False

        if settings.PRIVATE_KEY and (settings.PRIVATE_KEY.startswith("0x") or len(settings.PRIVATE_KEY) == 64):
            try:
                self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
            except Exception as e:
                print(f"Invalid private key format: {e}")

        # Attempt initial connection check
        try:
            self._connected = self.w3.is_connected()
            if self._connected:
                network = settings.BLOCKCHAIN_NETWORK
                print(f"✅ Connected to blockchain ({network}) via {settings.RPC_URL}")
                self.load_contract()
            else:
                print(f"⚠️  Cannot reach RPC at {settings.RPC_URL} — will use mock transactions")
        except Exception as e:
            print(f"⚠️  Blockchain connection check failed: {e}")

    def load_contract(self):
        """Load the compiled contract ABI from the build directory."""
        if not settings.CONTRACT_ADDRESS:
            print("⚠️  No CONTRACT_ADDRESS configured — smart contract calls will fall back to mock transactions")
            return
        try:
            abi_path = os.path.join(os.path.dirname(__file__), '../contracts/build/HerbChain.json')
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    contract_json = json.load(f)
                    abi = contract_json.get('abi', [])
                    checksum_addr = Web3.to_checksum_address(settings.CONTRACT_ADDRESS)
                    self.contract = self.w3.eth.contract(address=checksum_addr, abi=abi)
                    print(f"✅ Smart contract loaded at {checksum_addr}")
            else:
                print(f"⚠️  Contract ABI not found at {abi_path}")
        except Exception as e:
            print(f"Failed to load contract: {e}")

    # ------------------------------------------------------------------ #
    #  Explorer / status helpers                                          #
    # ------------------------------------------------------------------ #

    def get_explorer_tx_url(self, tx_hash: str) -> str:
        """Return the full Etherscan URL for a transaction hash.

        Returns empty string for mock hashes or if no explorer is configured.
        """
        if not tx_hash or tx_hash.startswith("mock-"):
            return ""
        base = settings.explorer_url
        if not base:
            return ""
        return f"{base}/tx/{tx_hash}"

    def get_status(self) -> dict:
        """Return current blockchain connection status for the status API."""
        connected = False
        balance = "0"
        try:
            connected = self.w3.is_connected()
            if connected and self.account:
                wei = self.w3.eth.get_balance(self.account.address)
                balance = str(round(float(self.w3.from_wei(wei, "ether")), 6))
        except Exception:
            connected = False

        self._connected = connected
        return {
            "network": settings.BLOCKCHAIN_NETWORK,
            "connected": connected,
            "wallet_address": self.account.address if self.account else "",
            "balance": balance,
            "contract_address": settings.CONTRACT_ADDRESS,
            "explorer_url": settings.explorer_url,
        }

    # ------------------------------------------------------------------ #
    #  Internal helper to build, sign, and send a transaction             #
    # ------------------------------------------------------------------ #

    def _send_tx(self, contract_fn) -> str:
        """Build, sign, and send a transaction from the platform wallet.

        ``contract_fn`` is the already-bound contract call, e.g.
        ``self.contract.functions.recordStep(...)``.
        Returns the transaction hash hex string.
        """
        tx_params = {
            "from": self.account.address,
            "nonce": self.w3.eth.get_transaction_count(self.account.address),
        }

        # For public testnets, let the node estimate gas price.
        # For local dev chains (Ganache/Hardhat), these are usually auto-set.
        if settings.BLOCKCHAIN_NETWORK != "local":
            try:
                tx_params["gasPrice"] = self.w3.eth.gas_price
            except Exception:
                pass  # Let the node decide

        tx = contract_fn.build_transaction(tx_params)
        signed = self.w3.eth.account.sign_transaction(tx, self.account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        hash_hex = tx_hash.hex()
        # Ensure 0x prefix
        if not hash_hex.startswith("0x"):
            hash_hex = f"0x{hash_hex}"
        explorer_link = self.get_explorer_tx_url(hash_hex)
        if explorer_link:
            print(f"🔗 Transaction: {explorer_link}")
        else:
            print(f"📝 Transaction hash: {hash_hex}")
        return hash_hex

    # ------------------------------------------------------------------ #
    #  Stage 1 — Collection (creates the on-chain product)                #
    # ------------------------------------------------------------------ #

    def record_collection(
        self,
        batch_id: str,
        herb_name: str,
        quantity: int,
        actor_id: str,
        quality: str,
        location: str,
        details: str,
    ) -> str:
        """Call ``recordCollection`` on the smart contract.

        Creates a new on-chain product and records the first step.
        Returns the transaction hash (real or mock).
        """
        if self.contract and self.account:
            try:
                return self._send_tx(
                    self.contract.functions.recordCollection(
                        batch_id,
                        herb_name,
                        quantity,
                        actor_id,
                        quality,
                        location,
                        details,
                    )
                )
            except Exception as e:
                print(f"Blockchain recordCollection failed, falling back to mock: {e}")

        mock = hashlib.sha256(f"collection:{batch_id}:{actor_id}".encode()).hexdigest()
        return f"mock-0x{mock[:62]}"

    # ------------------------------------------------------------------ #
    #  Stages 2-5 — Processing / Testing / Shipment / Retail              #
    # ------------------------------------------------------------------ #

    def record_step(
        self,
        batch_id: str,
        stage: str,
        actor_id: str,
        quality: str,
        location: str,
        action: str,
        details: str,
    ) -> str:
        """Call ``recordStep`` on the smart contract.

        Appends a new step to an existing on-chain product.
        ``stage`` must be one of: processing, testing, shipment, retail.
        Returns the transaction hash (real or mock).
        """
        step_type = STEP_TYPE_MAP.get(stage)
        if step_type is None or step_type == 0:
            raise ValueError(f"record_step cannot be used for stage '{stage}'. Use record_collection instead.")

        if self.contract and self.account:
            try:
                return self._send_tx(
                    self.contract.functions.recordStep(
                        batch_id,
                        step_type,
                        actor_id,
                        quality,
                        location,
                        action,
                        details,
                    )
                )
            except Exception as e:
                print(f"Blockchain recordStep ({stage}) failed, falling back to mock: {e}")

        mock = hashlib.sha256(f"{stage}:{batch_id}:{actor_id}".encode()).hexdigest()
        return f"mock-0x{mock[:62]}"

    # ------------------------------------------------------------------ #
    #  Report hash — unchanged from before                                #
    # ------------------------------------------------------------------ #

    def store_report_hash(self, batch_id: str, report_hash: str) -> str:
        """Store a report hash on-chain. Returns the tx hash.

        If blockchain is not configured, returns a mock tx hash prefixed
        with 'mock-' so the caller can distinguish it.
        """
        if self.contract and self.account:
            try:
                hash_bytes = bytes.fromhex(report_hash)

                return self._send_tx(
                    self.contract.functions.storeReportHash(
                        batch_id, hash_bytes
                    )
                )
            except Exception as e:
                print(f"Blockchain storeReportHash failed, falling back to mock: {e}")

        mock = hashlib.sha256(f"{batch_id}:{report_hash}".encode()).hexdigest()
        return f"mock-0x{mock[:62]}"


blockchain = BlockchainManager()

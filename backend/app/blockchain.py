from web3 import Web3
from app.config import settings
import json
import os

class BlockchainManager:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
        self.contract = None
        self.account = None
        
        if settings.PRIVATE_KEY and (settings.PRIVATE_KEY.startswith("0x") or len(settings.PRIVATE_KEY) == 64):
            try:
                self.account = self.w3.eth.account.from_key(settings.PRIVATE_KEY)
            except Exception as e:
                print(f"Invalid private key format: {e}")

    def load_contract(self):
        # In a real scenario, this would load the compiled ABI
        # For prototype, assuming ABI is available after compilation
        try:
            abi_path = os.path.join(os.path.dirname(__file__), '../contracts/build/HerbChain.json')
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    contract_json = json.load(f)
                    abi = contract_json.get('abi', [])
                    self.contract = self.w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=abi)
        except Exception as e:
            print(f"Failed to load contract: {e}")

    def store_report_hash(self, batch_id: str, report_hash: str) -> str:
        """Store a report hash on-chain. Returns the tx hash.

        If blockchain is not configured, returns a mock tx hash prefixed
        with 'mock-' so the caller can distinguish it.
        """
        if self.contract and self.account:
            try:
                hash_bytes = bytes.fromhex(report_hash)
                
                tx = self.contract.functions.storeReportHash(
                    batch_id, hash_bytes
                ).build_transaction({
                    "from": self.account.address,
                    "nonce": self.w3.eth.get_transaction_count(self.account.address),
                })
                signed = self.w3.eth.account.sign_transaction(tx, self.account.key)
                tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
                return tx_hash.hex()
            except Exception as e:
                print(f"Blockchain tx failed, falling back to mock: {e}")

        # Mock tx hash for prototype
        import hashlib
        mock = hashlib.sha256(f"{batch_id}:{report_hash}".encode()).hexdigest()
        return f"mock-0x{mock[:62]}"

blockchain = BlockchainManager()

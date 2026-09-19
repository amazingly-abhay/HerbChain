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

blockchain = BlockchainManager()

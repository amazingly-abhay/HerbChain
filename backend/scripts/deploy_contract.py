#!/usr/bin/env python3
"""Contract Deployment Helper for HerbChain.

Compiles `contracts/HerbChain.sol` (or loads precompiled `HerbChain.json`)
and deploys it to the configured EVM RPC network (e.g. Sepolia testnet).

Usage:
    cd backend
    python scripts/deploy_contract.py
"""

import json
import os
import sys

# Add parent dir to path to import app.config
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from web3 import Web3


def main():
    print("🚀 HerbChain Smart Contract Deployment Tool")
    print("=" * 50)
    print(f"Network: {settings.BLOCKCHAIN_NETWORK}")
    print(f"RPC URL: {settings.RPC_URL}")
    print(f"Explorer Base: {settings.explorer_url or 'None'}")

    if not settings.PRIVATE_KEY:
        print("❌ Error: PRIVATE_KEY is not set in backend/.env!")
        sys.exit(1)

    w3 = Web3(Web3.HTTPProvider(settings.RPC_URL))
    if not w3.is_connected():
        print(f"❌ Error: Unable to connect to Web3 RPC endpoint at {settings.RPC_URL}")
        sys.exit(1)

    account = w3.eth.account.from_key(settings.PRIVATE_KEY)
    balance_wei = w3.eth.get_balance(account.address)
    balance_eth = w3.from_wei(balance_wei, "ether")

    print(f"Deployer Address: {account.address}")
    print(f"Account Balance: {balance_eth:.6f} ETH")

    if balance_wei == 0:
        print("⚠️ Warning: Account balance is 0. Deployment may fail due to out-of-gas errors.")
        print("   If deploying to Sepolia, get free test ETH from a Sepolia faucet (e.g. https://cloud.google.com/application/web3/faucet/ethereum/sepolia)")

    abi_path = os.path.join(os.path.dirname(__file__), "../contracts/build/HerbChain.json")
    if not os.path.exists(abi_path):
        print(f"❌ Error: Compiled contract artifact not found at {abi_path}")
        sys.exit(1)

    with open(abi_path, "r") as f:
        artifact = json.load(f)

    abi = artifact.get("abi")
    bytecode = artifact.get("bytecode")

    if not abi:
        print("❌ Error: Invalid ABI in HerbChain.json")
        sys.exit(1)

    if not bytecode:
        print("⚠️ Note: HerbChain.json contains ABI only. Attempting to compile HerbChain.sol with py-solc-x...")
        try:
            from solcx import compile_standard, install_solc

            install_solc("0.8.19")
            sol_path = os.path.join(os.path.dirname(__file__), "../contracts/HerbChain.sol")
            with open(sol_path, "r") as sf:
                sol_source = sf.read()

            compiled_sol = compile_standard(
                {
                    "language": "Solidity",
                    "sources": {"HerbChain.sol": {"content": sol_source}},
                    "settings": {
                        "outputSelection": {
                            "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]}
                        }
                    },
                },
                solc_version="0.8.19",
            )
            bytecode = compiled_sol["contracts"]["HerbChain.sol"]["HerbChain"]["evm"]["bytecode"]["object"]
            abi = compiled_sol["contracts"]["HerbChain.sol"]["HerbChain"]["abi"]

            # Save full artifact for future use
            with open(abi_path, "w") as out_f:
                json.dump({"abi": abi, "bytecode": bytecode}, out_f, indent=2)
            print("✅ Successfully compiled HerbChain.sol")
        except Exception as e:
            print(f"❌ Failed to compile contract: {e}")
            print("   Please ensure solc or py-solc-x is installed, or provide bytecode in HerbChain.json.")
            sys.exit(1)

    print("\n📦 Deploying HerbChain contract...")
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    tx_params = {
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
    }

    if settings.BLOCKCHAIN_NETWORK != "local":
        try:
            tx_params["gasPrice"] = w3.eth.gas_price
        except Exception:
            pass

    tx = contract.constructor().build_transaction(tx_params)
    signed_tx = w3.eth.account.sign_transaction(tx, account.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    tx_hex = tx_hash.hex()
    if not tx_hex.startswith("0x"):
        tx_hex = f"0x{tx_hex}"

    print(f"Transaction submitted! Hash: {tx_hex}")
    if settings.explorer_url:
        print(f"🔗 Etherscan Link: {settings.explorer_url}/tx/{tx_hex}")

    print("Waiting for transaction receipt...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    contract_address = tx_receipt.contractAddress
    print("\n" + "=" * 50)
    print("🎉 CONTRACT SUCCESSFULLY DEPLOYED!")
    print(f"Contract Address: {contract_address}")
    if settings.explorer_url:
        print(f"🔗 View on Etherscan: {settings.explorer_url}/address/{contract_address}")
    print("=" * 50)

    print("\nNext step: Update CONTRACT_ADDRESS in backend/.env with:")
    print(f"CONTRACT_ADDRESS={contract_address}")


if __name__ == "__main__":
    main()

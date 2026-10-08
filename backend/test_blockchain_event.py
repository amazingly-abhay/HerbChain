from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch
from app.blockchain import blockchain

client = TestClient(app)

def run_test():
    print("=== Testing Blockchain Transaction on Event Addition ===")
    
    # 1. Register and onboard collector & processor
    reg1 = client.post('/api/auth/register', json={'username': 'col_tx', 'email': 'col_tx@test.com', 'password': 'pwd'})
    token1 = client.post('/api/auth/login', data={'username': 'col_tx@test.com', 'password': 'pwd'}).json()['access_token']
    col_headers = {'Authorization': f'Bearer {token1}'}
    client.post('/api/auth/onboarding', json={'role': 'collector', 'location': 'Loc', 'government_id_type': 'aadhar', 'government_id_number': '1'}, headers=col_headers)
    
    reg2 = client.post('/api/auth/register', json={'username': 'proc_tx', 'email': 'proc_tx@test.com', 'password': 'pwd'})
    token2 = client.post('/api/auth/login', data={'username': 'proc_tx@test.com', 'password': 'pwd'}).json()['access_token']
    proc_headers = {'Authorization': f'Bearer {token2}'}
    client.post('/api/auth/onboarding', json={'role': 'processor', 'location': 'Loc', 'government_id_type': 'aadhar', 'government_id_number': '2'}, headers=proc_headers)

    # 2. Create batch
    res = client.post('/api/batches', json={'herbName': 'Tulsi', 'quantity': 50}, headers=col_headers)
    assert res.status_code == 201
    batch = res.json()
    batch_id = batch['id']
    print(f"Batch created: {batch_id}")
    print(f"Initial Collection Tx Hash: {batch.get('blockchainTxHash')}")

    # 3. Add event and verify record_step is called
    with patch.object(blockchain, 'record_step', wraps=blockchain.record_step) as mock_record_step:
        event_res = client.post(f'/api/batches/{batch_id}/events', json={
            'stage': 'processing',
            'actorId': 'proc_tx',
            'actorName': 'Processor One',
            'actorRole': 'processor',
            'location': {'latitude': 12.97, 'longitude': 77.59, 'address': 'Bangalore Unit'},
            'notes': 'Herbs dried and sorted'
        }, headers=proc_headers)
        
        assert event_res.status_code == 200, f"Event creation failed: {event_res.text}"
        updated_batch = event_res.json()
        
        # Verify blockchain.record_step was invoked
        assert mock_record_step.called, "blockchain.record_step was NOT called!"
        print(f"✅ blockchain.record_step() was called with args:\n   batch_id='{mock_record_step.call_args.kwargs.get('batch_id')}'\n   stage='{mock_record_step.call_args.kwargs.get('stage')}'\n   actor_id='{mock_record_step.call_args.kwargs.get('actor_id')}'")
        
        # Extract event from updated batch
        proc_event = next(e for e in updated_batch['events'] if e['stage'] == 'processing')
        tx_hash = proc_event.get('blockchainTxHash')
        explorer_url = proc_event.get('blockchainExplorerUrl')
        
        print(f"✅ Event recorded with Blockchain Tx Hash: {tx_hash}")
        print(f"✅ Explorer URL: {explorer_url if explorer_url else '(mock hash generated because RPC is unconfigured/offline)'}")
        assert tx_hash is not None, "Event is missing blockchainTxHash!"

    print("\nRESULT: YES, adding an event runs a blockchain transaction (or generates a mock tx hash in offline/fallback mode).")

if __name__ == '__main__':
    run_test()

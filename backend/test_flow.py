from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_user(role, email):
    reg = client.post('/api/auth/register', json={
        'username': email.split('@')[0],
        'email': email,
        'password': 'password123'
    })
    
    login = client.post('/api/auth/login', data={
        'username': email,
        'password': 'password123'
    })
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    client.post('/api/auth/onboarding', json={
        'role': role,
        'location': 'Test Location',
        'government_id_type': 'aadhar',
        'government_id_number': '1234'
    }, headers=headers)
    
    return headers

# 1. Create Users
print("Setting up users...")
collector_headers = create_user("collector", "collector@test.com")
processor_headers = create_user("processor", "processor@test.com")
tester_headers = create_user("tester", "tester@test.com")
shipper_headers = create_user("shipper", "shipper@test.com")

# 2. Create Batch
print("Creating Batch as collector...")
batch_res = client.post('/api/batches', json={
    'herbName': 'Tulsi',
    'quantity': 100
}, headers=collector_headers)
assert batch_res.status_code == 201, f"Failed to create batch: {batch_res.text}"
batch_id = batch_res.json()['id']
print(f"Batch created: {batch_id}")

# 3. Try to add processing event as collector (Should Fail)
print("Attempting to process as collector...")
fail_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'processing',
    'actorId': 'collector',
    'actorName': 'Collector',
    'actorRole': 'collector',
    'location': {'latitude': 0, 'longitude': 0, 'address': ''},
    'notes': 'test'
}, headers=collector_headers)
assert fail_res.status_code == 403, "Role restriction failed!"
print("Role restriction successfully blocked unauthorized event.")

# 4. Processing Event
print("Adding processing event as processor...")
proc_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'processing',
    'actorId': 'processor',
    'actorName': 'Processor',
    'actorRole': 'processor',
    'location': {'latitude': 0, 'longitude': 0, 'address': ''},
    'notes': 'Processed nicely'
}, headers=processor_headers)
assert proc_res.status_code == 200, f"Processing failed: {proc_res.text}"

# 5. Testing Event (Lab Test)
print("Adding testing event as tester...")
test_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'testing',
    'actorId': 'tester',
    'actorName': 'Tester',
    'actorRole': 'tester',
    'location': {'latitude': 0, 'longitude': 0, 'address': ''},
    'notes': 'Lab results are good',
    'labResult': 'passed',
    'labParameters': {'moistureContent': '10', 'purity': '99'}
}, headers=tester_headers)
assert test_res.status_code == 200, f"Testing failed: {test_res.text}"
batch_data = test_res.json()
assert batch_data.get('mainReport') is not None, "Main Report was not generated!"
assert batch_data['mainReport']['hash'] is not None, "Main Report hash missing!"
assert batch_data['mainReport']['blockchainTxHash'] is not None, "Blockchain Tx Hash missing!"
print(f"Main Report generated successfully. Hash: {batch_data['mainReport']['hash']}")

# 6. Shipment Event (Secondary Report)
print("Adding shipment event as shipper...")
ship_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'shipment',
    'actorId': 'shipper',
    'actorName': 'Shipper',
    'actorRole': 'shipper',
    'location': {'latitude': 0, 'longitude': 0, 'address': ''},
    'notes': 'Shipped out'
}, headers=shipper_headers)
assert ship_res.status_code == 200, f"Shipment failed: {ship_res.text}"
batch_data = ship_res.json()
assert len(batch_data.get('reports', [])) == 1, "Secondary Report was not generated!"
print(f"Secondary Report generated successfully.")

print("All integration tests passed perfectly!")

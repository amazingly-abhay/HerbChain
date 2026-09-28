from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)

# 1. Create User
print("Setting up user...")
email = f"retailer_{int(time.time())}@test.com"
client.post('/api/auth/register', json={'username': 'retailer', 'email': email, 'password': 'pwd'})
login = client.post('/api/auth/login', data={'username': email, 'password': 'pwd'})
token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

client.post('/api/auth/onboarding', json={
    'role': 'admin', # Using admin to bypass batch creation role checks for this test
    'location': 'Loc',
    'government_id_type': 'aadhar',
    'government_id_number': '1234'
}, headers=headers)

# 2. Create Batch
print("Creating Batch...")
batch_res = client.post('/api/batches', json={'herbName': 'Mint', 'quantity': 50}, headers=headers)
assert batch_res.status_code == 201
batch_id = batch_res.json()['id']
print(f"Batch created: {batch_id}")

# 3. Generate Labels
print("Generating 3 Retail Labels...")
label_res = client.post(f'/api/batches/{batch_id}/labels', json={'count': 3}, headers=headers)
assert label_res.status_code == 200, f"Failed: {label_res.text}"
units = label_res.json()['units']
assert len(units) == 3
unit_1 = units[0]['id']
unit_2 = units[1]['id']
print(f"Labels generated successfully. Example ID: {unit_1}")

# 4. First Scan (Should be authentic)
print(f"Scanning unit {unit_1} for the first time...")
verify_1 = client.get(f'/api/verify/{unit_1}')
assert verify_1.status_code == 200
v1_data = verify_1.json()
assert v1_data['unit']['isScanned'] == False, "Unit should not be marked scanned on first view"
print("First scan returned Authentic (isScanned=False)")

# 5. Second Scan (Should trigger warning)
print(f"Scanning unit {unit_1} for the second time...")
verify_2 = client.get(f'/api/verify/{unit_1}')
assert verify_2.status_code == 200
v2_data = verify_2.json()
assert v2_data['unit']['isScanned'] == True, "Unit should be marked scanned on subsequent views"
assert v2_data['unit']['scannedAt'] is not None
print("Second scan returned Warning (isScanned=True)")

# 6. Verify Batch Level (General QR)
print(f"Scanning main batch {batch_id} (No unit tracking)...")
verify_3 = client.get(f'/api/verify/{batch_id}')
assert verify_3.status_code == 200
assert verify_3.json()['unit'] is None

print("All Anti-Counterfeiting Retail Tests Passed Perfectly!")

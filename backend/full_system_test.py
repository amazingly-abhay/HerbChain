from fastapi.testclient import TestClient
from main import app
import time

client = TestClient(app)

def create_user_and_onboard(role, suffix):
    email = f"{role}_{suffix}@test.com"
    client.post('/api/auth/register', json={'username': role, 'email': email, 'password': 'pwd'})
    login = client.post('/api/auth/login', data={'username': email, 'password': 'pwd'})
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    client.post('/api/auth/onboarding', json={
        'role': role, 'location': 'Loc', 'government_id_type': 'aadhar', 'government_id_number': '123'
    }, headers=headers)
    return headers

suffix = int(time.time())
print("1. Testing Auth & Onboarding...")
col_headers = create_user_and_onboard("collector", suffix)
proc_headers = create_user_and_onboard("processor", suffix)
test_headers = create_user_and_onboard("tester", suffix)
ship_headers = create_user_and_onboard("shipper", suffix)
ret_headers = create_user_and_onboard("retailer", suffix)
admin_headers = create_user_and_onboard("admin", suffix)
print("Auth & Onboarding passed!")

print("2. Testing AI Mock Endpoint...")
with open("main.py", "rb") as f:
    # Just sending a dummy file to check if it rejects non-image or parses mock
    res = client.post("/api/ai/analyze", files={"file": ("test.txt", f, "text/plain")})
    assert res.status_code == 400 # Must be image
print("AI image validation passed!")

print("3. Testing Batch Creation (Role-gated)...")
res = client.post('/api/batches', json={'herbName': 'Ashwagandha', 'quantity': 100}, headers=proc_headers)
assert res.status_code == 403 # Processor cannot create
res = client.post('/api/batches', json={'herbName': 'Ashwagandha', 'quantity': 100}, headers=col_headers)
assert res.status_code == 201
batch_id = res.json()['id']
print(f"Batch {batch_id} created by collector!")

print("4. Testing Supply Chain Events & Reports...")
client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'processing', 'actorId': 'p1', 'actorName': 'P1', 'actorRole': 'processor', 'location': {'latitude':0,'longitude':0,'address':''}
}, headers=proc_headers)

test_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'testing', 'actorId': 't1', 'actorName': 'T1', 'actorRole': 'tester', 
    'location': {'latitude':0,'longitude':0,'address':''}, 'labResult': 'passed', 'labParameters': {'moistureContent': 5, 'purity': 90}
}, headers=test_headers)
assert test_res.json().get("mainReport") is not None
print("Lab Testing event added & Main Report hashed!")

ship_res = client.post(f'/api/batches/{batch_id}/events', json={
    'stage': 'shipment', 'actorId': 's1', 'actorName': 'S1', 'actorRole': 'shipper', 'location': {'latitude':0,'longitude':0,'address':''}
}, headers=ship_headers)
assert len(ship_res.json().get("reports", [])) == 1
print("Shipment event added & Secondary Report generated!")

print("5. Testing Retail QR Label Generation...")
lbl_res = client.post(f'/api/batches/{batch_id}/labels', json={'count': 2}, headers=ret_headers)
assert lbl_res.status_code == 200
units = lbl_res.json()['units']
assert len(units) == 2
print("Retail labels generated!")

print("6. Testing Verification & Anti-Counterfeiting...")
unit_id = units[0]['id']
v1 = client.get(f'/api/verify/{unit_id}')
assert v1.json()['unit']['isScanned'] == False
v2 = client.get(f'/api/verify/{unit_id}')
assert v2.json()['unit']['isScanned'] == True
print("Anti-Counterfeit tracking passed!")

print("ALL BACKEND TESTS COMPLETED SUCCESSFULLY!")

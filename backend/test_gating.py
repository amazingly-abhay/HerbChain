import requests
import time
import sys

BASE_URL = "http://localhost:8000/api"

print("Starting E2E API Test for Gating Features...")
time.sleep(2)

try:
    print("1. Registering collector...")
    user_payload = {
        "username": "testcollector_gating",
        "email": "testgating@collector.com",
        "password": "password",
        "role": "collector",
        "location": "Test Location"
    }
    
    requests.post(f"{BASE_URL}/auth/register", json=user_payload)
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "testcollector_gating", "password": "password"})
    token = login_res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create batch with low AI confidence
    print("2. Creating batch with low AI confidence...")
    batch_payload = {
        "herbName": "TestHerb",
        "quantity": 100,
        "origin": {"latitude": 0, "longitude": 0, "address": "Test"},
        "aiAnalysis": {
            "plantIdentification": {
                "name": "Unknown Weed",
                "confidence": 0.45  # LOW CONFIDENCE
            }
        }
    }
    res = requests.post(f"{BASE_URL}/batches", json=batch_payload, headers=headers)
    batch = res.json()
    batch_id = batch["id"]
    print(f"Batch created: {batch_id}")
    if batch.get("manualCheckRequired"):
        print("✅ manualCheckRequired flag correctly set to True")
    else:
        print("❌ manualCheckRequired flag missing or False")

    # 3. Setup admin
    print("3. Setting up admin...")
    admin_payload = {
        "username": "admin_gating",
        "password": "adminpassword",
        "role": "admin",
        "email": "admingating@a.com",
        "location": "HQ"
    }
    requests.post(f"{BASE_URL}/auth/register", json=admin_payload)
    login_admin = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin_gating", "password": "adminpassword"})
    admin_token = login_admin.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    loc_data = {"latitude": 0, "longitude": 0, "address": "Test"}

    # Add processing event
    print("3. Adding processing event...")
    proc_res = requests.post(f"{BASE_URL}/batches/{batch_id}/events", json={
        "stage": "processing", "actorId": "admin_gating", "actorName": "Admin", 
        "actorRole": "admin", "location": loc_data, "notes": ""
    }, headers=admin_headers)

    # 4. Add testing event that FAILS
    print("4. Adding testing event (FAIL)...")
    test_res = requests.post(f"{BASE_URL}/batches/{batch_id}/events", json={
        "stage": "testing", 
        "actorId": "admin_gating", 
        "actorName": "Admin", 
        "actorRole": "admin",
        "location": loc_data,
        "notes": "Testing",
        "labParameters": {"purity": 60, "moistureContent": 20} # FAILING SCORES
    }, headers=admin_headers)

    batch_after_test = test_res.json()
    if batch_after_test.get("testingStatus") == "failed":
        print("✅ testingStatus correctly set to failed")
    else:
        print("❌ testingStatus is not failed")

    if batch_after_test.get("mainReport"):
        print("✅ Main Report generated even on failure!")
    else:
        print("❌ Main Report missing")

    # 5. Try adding shipment event
    print("5. Attempting to ship a failed batch...")
    ship_res = requests.post(f"{BASE_URL}/batches/{batch_id}/events", json={
        "stage": "shipment", "actorId": "admin_gating", "actorName": "Admin",
        "actorRole": "admin", "location": loc_data, "notes": ""
    }, headers=admin_headers)

    if ship_res.status_code == 403:
        print("✅ Shipment blocked! 403 Forbidden received.")
    else:
        print(f"❌ Shipment allowed! Status: {ship_res.status_code}")

    print("Test complete.")
except Exception as e:
    print(f"Error: {e}")


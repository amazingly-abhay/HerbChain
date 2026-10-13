from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_profile_and_settings():
    email = "profile_test@test.com"
    reg = client.post('/api/auth/register', json={
        'username': 'profiletest',
        'email': email,
        'password': 'password123'
    })
    
    login = client.post('/api/auth/login', data={
        'username': email,
        'password': 'password123'
    })
    assert login.status_code == 200, f"Login failed: {login.text}"
    token = login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    onboard_res = client.post('/api/auth/onboarding', json={
        'role': 'collector',
        'location': 'Wayanad, Kerala',
        'government_id_type': 'aadhaar',
        'government_id_number': '123456789012'
    }, headers=headers)
    assert onboard_res.status_code == 200, f"Onboarding failed: {onboard_res.text}"
    user_data = onboard_res.json()
    assert user_data['government_id_type'] == 'aadhaar'
    assert user_data['government_id_number'] == '123456789012'
    print("✓ Onboarding passed")

    prof_res = client.put('/api/auth/profile', json={
        'name': 'Ayush Sharma',
        'phone': '+91 98765 43210',
        'organization': 'Himalayan Organic Farms',
        'bio': 'Organic herbal cultivation and harvesting',
        'location': 'Dehradun, Uttarakhand',
        'avatar': 'https://example.com/avatar.png'
    }, headers=headers)
    assert prof_res.status_code == 200, f"Profile update failed: {prof_res.text}"
    prof_data = prof_res.json()
    assert prof_data['name'] == 'Ayush Sharma'
    assert prof_data['phone'] == '+91 98765 43210'
    assert prof_data['organization'] == 'Himalayan Organic Farms'
    assert prof_data['avatar'] == 'https://example.com/avatar.png'
    print("✓ Profile update passed")

    kyc_res = client.post('/api/auth/kyc', json={
        'government_id_type': 'pan',
        'government_id_number': 'ABCDE1234F',
        'document_hash': 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    }, headers=headers)
    assert kyc_res.status_code == 200, f"KYC update failed: {kyc_res.text}"
    kyc_data = kyc_res.json()
    assert kyc_data['government_id_type'] == 'pan'
    assert kyc_data['government_id_number'] == 'ABCDE1234F'
    assert kyc_data['kyc_document_hash'] == 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
    assert kyc_data['kyc_status'] == 'verified'
    print("✓ KYC update passed")

    settings_res = client.put('/api/auth/settings', json={
        'settings': {
            'language': 'hi',
            'emailNotifications': True,
            'criticalAlerts': True,
            'preferredNetwork': 'polygon_amoy',
            'autoGasEstimate': True
        }
    }, headers=headers)
    assert settings_res.status_code == 200, f"Settings update failed: {settings_res.text}"
    settings_data = settings_res.json()
    assert settings_data['settings']['language'] == 'hi'
    assert settings_data['settings']['preferredNetwork'] == 'polygon_amoy'
    print("✓ Settings update passed")

    bad_pw = client.post('/api/auth/change-password', json={
        'current_password': 'wrongpassword',
        'new_password': 'newpassword123'
    }, headers=headers)
    assert bad_pw.status_code == 400
    print("✓ Change password wrong credential rejection passed")

    good_pw = client.post('/api/auth/change-password', json={
        'current_password': 'password123',
        'new_password': 'newpassword123'
    }, headers=headers)
    assert good_pw.status_code == 200
    print("✓ Change password success passed")

    new_login = client.post('/api/auth/login', data={
        'username': email,
        'password': 'newpassword123'
    })
    assert new_login.status_code == 200
    print("✓ Login with new password passed")

    new_token = new_login.json()['access_token']
    me_res = client.get('/api/auth/me', headers={'Authorization': f'Bearer {new_token}'})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data['name'] == 'Ayush Sharma'
    assert me_data['settings']['language'] == 'hi'
    print("✓ /api/auth/me persistence verified")
    print("\nALL PROFILE & SETTINGS BACKEND TESTS PASSED!")

if __name__ == '__main__':
    test_profile_and_settings()

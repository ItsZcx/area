import pytest
import requests

BASE_URL = 'http://area-core-api:8080/api/v1/users'

@pytest.fixture(scope='module')
def auth_token():
    # Register and login a test user to get an auth token
    user_data = {
        "email": "usertest@example.com",
        "first_name": "User",
        "last_name": "Test",
        "password": "userpassword",
        "phone_number": "1234567890",
        "role": "user",
        "username": "usertest"
    }
    # Register
    requests.post(f'http://area-core-api:8080/api/v1/auth/register', json=user_data)
    # Login
    login_payload = {
        'grant_type': 'password',
        'username': user_data['username'],
        'password': user_data['password']
    }
    response = requests.post(f'http://area-core-api:8080/api/v1/auth/login', data=login_payload)
    token = response.json().get('access_token')
    yield token
    # Clean up: Delete user
    headers = {'Authorization': f'Bearer {token}'}
    requests.delete(f'{BASE_URL}', headers=headers)

def test_get_users(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = requests.get(BASE_URL, headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_user(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    payload = {
        "email": "anotheruser@example.com",
        "first_name": "Another",
        "last_name": "User",
        "password": "anotherpassword",
        "phone_number": "0987654321",
        "role": "user",
        "username": "anotheruser"
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    assert response.status_code == 201 or response.status_code == 200
    assert 'id' in response.json()
    # Clean up
    user_id = response.json()['id']
    requests.delete(f'{BASE_URL}/{user_id}', headers=headers)

def test_get_user_by_id(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    # Get own user data
    response = requests.get(f'{BASE_URL}/me', headers=headers)
    user_id = response.json()['id']
    response = requests.get(f'{BASE_URL}/{user_id}', headers=headers)
    assert response.status_code == 200
    assert response.json()['id'] == user_id

def test_get_user_invalid_id(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    invalid_user_id = 999999  # Assuming this ID does not exist
    response = requests.get(f'{BASE_URL}/{invalid_user_id}', headers=headers)
    assert response.status_code == 404
    assert 'detail' in response.json()

def test_update_user(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = requests.get(f'{BASE_URL}/me', headers=headers)
    user_id = response.json()['id']
    payload = {
        "first_name": "UpdatedName",
        "phone_number": "1112223333"
    }
    response = requests.patch(f'{BASE_URL}/{user_id}', json=payload, headers=headers)
    assert response.status_code == 200
    # Verify the update
    response = requests.get(f'{BASE_URL}/{user_id}', headers=headers)
    assert response.json()['first_name'] == "UpdatedName"
    assert response.json()['phone_number'] == "1112223333"

def test_delete_user(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    # Create a user to delete
    payload = {
        "email": "deleteuser@example.com",
        "first_name": "Delete",
        "last_name": "User",
        "password": "deletepassword",
        "phone_number": "5555555555",
        "role": "user",
        "username": "deleteuser"
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    user_id = response.json()['id']
    # Delete the user
    response = requests.delete(f'{BASE_URL}/{user_id}', headers=headers)
    assert response.status_code == 200
    # Verify deletion
    response = requests.get(f'{BASE_URL}/{user_id}', headers=headers)
    assert response.status_code == 404

def test_get_user_me(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = requests.get(f'{BASE_URL}/me', headers=headers)
    assert response.status_code == 200
    assert 'id' in response.json()
    assert 'username' in response.json()

def test_get_user_me_unauthorized():
    response = requests.get(f'{BASE_URL}/me')
    assert response.status_code == 401
    assert 'detail' in response.json()

def test_update_gmail_watch_info(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    email = "usertest@example.com"
    payload = {
        "gmail_expiration_date": "2024-10-22T14:30:36.270296",
        "gmail_history_id": 123456
    }
    response = requests.put(f'{BASE_URL}/gmail/watch_info/{email}', json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json() == {"detail": "Gmail watch info updated"}

def test_get_services_for_user(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    user_id = 1  # Replace with actual user_id or fetch from /me
    response = requests.get(f'{BASE_URL}/services/{user_id}', headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

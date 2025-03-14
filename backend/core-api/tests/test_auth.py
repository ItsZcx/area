import pytest
import requests

BASE_URL = 'http://area-core-api:8080/api/v1/auth'

@pytest.fixture(scope='module')
def user_data():
    return {
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "password123",
        "phone_number": "1234567890",
        "role": "user",
        "username": "testuser"
    }

@pytest.fixture(scope='module')
def register_user(user_data):
    # Register the user before tests
    requests.post(f'{BASE_URL}/register', json=user_data)
    yield
    # Clean up after tests
    requests.delete(f'http://area-core-api:8080/api/v1/users')

def test_register_user_success(user_data):
    payload = user_data.copy()
    payload['username'] = 'newtestuser'
    payload['email'] = 'newtestuser@example.com'
    response = requests.post(f'{BASE_URL}/register', json=payload)
    assert response.status_code == 201 or response.status_code == 200
    assert 'id' in response.json()
    # Clean up
    requests.delete(f'http://area-core-api:8080/api/v1/users', json={"username": payload['username']})

def test_register_user_missing_fields():
    payload = {
        "email": "incomplete@example.com",
        "password": "password123"
        # Missing other required fields
    }
    response = requests.post(f'{BASE_URL}/register', json=payload)
    assert response.status_code == 422  # Unprocessable Entity
    assert 'detail' in response.json()

def test_register_user_invalid_email():
    payload = {
        "email": "invalidemail",
        "first_name": "Test",
        "last_name": "User",
        "password": "password123",
        "phone_number": "1234567890",
        "role": "user",
        "username": "invalidemailuser"
    }
    response = requests.post(f'{BASE_URL}/register', json=payload)
    assert response.status_code == 422
    assert 'detail' in response.json()

def test_login_user_success(register_user, user_data):
    payload = {
        'grant_type': 'password',
        'email': user_data['email'],
        'username': user_data['email'],
        'password': user_data['password']
    }
    response = requests.post(f'{BASE_URL}/login', data=payload)
    assert response.status_code == 200
    assert 'access_token' in response.json()
    assert response.json()['token_type'] == 'bearer'

def test_login_user_invalid_credentials():
    payload = {
        'grant_type': 'password',
        'username': 'nonexistentuser',
        'password': 'wrongpassword'
    }
    response = requests.post(f'{BASE_URL}/login', data=payload)
    assert response.status_code == 401
    assert 'detail' in response.json()

def test_login_user_missing_fields():
    payload = {
        'grant_type': 'password',
        'username': 'testuser'
        # Missing 'password'
    }
    response = requests.post(f'{BASE_URL}/login', data=payload)
    assert response.status_code == 422
    assert 'detail' in response.json()

def test_login_user_invalid_grant_type():
    payload = {
        'grant_type': 'invalid',
        'username': 'testuser',
        'password': 'password123'
    }
    response = requests.post(f'{BASE_URL}/login', data=payload)
    assert response.status_code == 422
    assert 'detail' in response.json()

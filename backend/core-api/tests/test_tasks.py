import pytest
import requests

BASE_URL = 'http://area-core-api:8080/api/v1/tasks'

@pytest.fixture(scope='module')
def auth_token():
    # Register and login a test user (difficult to programmatically get a valid token)
    user_data = {
        "email": "taskusertest@example.com",
        "first_name": "TaskUser",
        "last_name": "Test",
        "password": "taskuserpassword",
        "phone_number": "1234567890",
        "role": "user",
        "username": "taskusertest"
    }
    # Register
    requests.post(f'http://area-core-api:8080/api/v1/auth/register', json=user_data)
    # Login
    login_payload = {
        'grant_type': 'password',
        'username': user_data['email'],
        'email': user_data['email'],
        'password': user_data['password']
    }
    response = requests.post(f'http://area-core-api:8080/api/v1/auth/login', data=login_payload)
    token = response.json().get('access_token')
    yield token
    # Clean up: Delete user
    headers = {'Authorization': f'Bearer {token}'}
    requests.delete(f'http://area-core-api:8080/api/v1/users', headers=headers)

def test_get_tasks(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    params = {'service': 'github'}
    response = requests.get(BASE_URL, params=params, headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_tasks_no_service(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = requests.get(BASE_URL, headers=headers)
    assert response.status_code == 422  # Missing required parameter 'service'
    assert 'detail' in response.json()

def test_create_task_success(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    payload = {
        "service": "github",
        "trigger": "push_event",
        "trigger_args": ["arg1", "arg2"],
        "action_name": "send_email",
        "user_id": 1,
        "requires_oauth": False,
        "oauth_token": ""
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    assert response.status_code == 201 or response.status_code == 200
    assert 'task_id' in response.json()
    # Clean up
    task_id = response.json()['task_id']
    requests.delete(f'{BASE_URL}/{task_id}', headers=headers)

def test_create_task_invalid_params(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    payload = {
        "trigger": "invalid_event",
        "trigger_args": [],
        "action_name": "nonexistent_action",
        "user_id": 1,
        "requires_oauth": False
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    assert response.status_code == 422
    assert 'detail' in response.json()

def test_update_task(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    # First, create a task
    payload = {
        "trigger": "push_event",
        "trigger_args": ["arg1", "arg2"],
        "action_name": "send_email",
        "user_id": 1,
        "requires_oauth": False
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    task_id = response.json()['task_id']
    # Now, update the task
    update_payload = {
        "action_name": "send_sms",
        "action_params": ["+1234567890", "Test message"]
    }
    response = requests.put(f'{BASE_URL}/tasks/{task_id}', json=update_payload, headers=headers)
    assert response.status_code == 200
    # Clean up
    requests.delete(f'{BASE_URL}/{task_id}', headers=headers)

def test_delete_task(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    # Create a task to delete
    payload = {
        "trigger": "push_event",
        "trigger_args": ["arg1", "arg2"],
        "action_name": "send_email",
        "user_id": 1,
        "requires_oauth": False
    }
    response = requests.post(BASE_URL, json=payload, headers=headers)
    task_id = response.json()['task_id']
    # Delete the task
    response = requests.delete(f'{BASE_URL}/{task_id}', headers=headers)
    assert response.status_code == 200
    assert response.json() == {"detail": "Task deleted"}
    # Verify deletion
    response = requests.get(f'{BASE_URL}/{task_id}', headers=headers)
    assert response.status_code == 404

def test_get_services():
    response = requests.get(f'{BASE_URL}/services')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_reactions_for_service():
    service = 'github'
    response = requests.get(f'{BASE_URL}/reactions/{service}')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_events_for_service():
    service = 'github'
    response = requests.get(f'{BASE_URL}/events/{service}')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_params_for_event():
    event = 'push_event'
    response = requests.get(f'{BASE_URL}/params/event/{event}')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_params_for_reaction():
    reaction = 'send_email'
    response = requests.get(f'{BASE_URL}/params/reaction/{reaction}')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_tasks_for_user(auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    user_id = 1  # Replace with actual user ID
    response = requests.get(f'{BASE_URL}/{user_id}', headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

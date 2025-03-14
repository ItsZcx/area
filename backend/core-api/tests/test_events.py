import pytest
import requests

BASE_URL = 'http://area-core-api:8080/api/v1/events'

# No events
def test_get_events():
    response = requests.get(BASE_URL)
    assert response.status_code == 404
    assert isinstance(response.json(), list)

def test_handle_event_success():
    payload = {
        "context_params": {
            "author": "testuser",
            "commit_msg": "Initial commit"
        },
        "event_name": "push_event",
        "params": {
            "branch": "main",
            "repo": "test-repo"
        },
        "service": "github"
    }
    response = requests.post(BASE_URL, json=payload)
    assert response.status_code == 200
    assert response.json() == {"detail": "Event handled"}

def test_handle_event_missing_fields():
    payload = {
        "event_name": "push_event",
        # Missing other required fields
    }
    response = requests.post(BASE_URL, json=payload)
    assert response.status_code == 422
    assert 'detail' in response.json()

def test_get_last_event():
    response = requests.get(f'{BASE_URL}/last')
    assert response.status_code == 200
    if response.json():
        assert 'event_name' in response.json()
    else:
        assert response.json() == {}

# def test_list_messages():
#     response = requests.get(f'{BASE_URL}/list_messages')
#     assert response.status_code == 200
#     assert isinstance(response.json(), list)

def test_list_messages_no_messages():
    # Assuming the database is empty or messages are cleared
    response = requests.get(f'{BASE_URL}/list_messages')
    assert response.status_code == 404
    assert response.json() == []

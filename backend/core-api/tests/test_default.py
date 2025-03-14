import pytest
import requests

BASE_URL = 'http://area-core-api:8080/'

def test_read_root():
    response = requests.get(f'{BASE_URL}/')
    assert response.status_code == 200
    assert response.json()['msg'] == "Server is running"

def test_read_root_wrong_method():
    response = requests.post(f'{BASE_URL}/')
    assert response.status_code == 405  # Method Not Allowed
    assert 'detail' in response.json()

def test_about_json():
    response = requests.get(f'{BASE_URL}/about.json')
    assert response.status_code == 200
    json_data = response.json()
    assert 'server' in json_data
    assert 'current_time' in json_data['server']
    assert 'services' in json_data['server']
    assert isinstance(json_data['server']['services'], list)

def test_about_json_content():
    response = requests.get(f'{BASE_URL}/about.json')
    json_data = response.json()
    services = json_data['server']['services']
    for service in services:
        assert 'name' in service
        assert 'actions' in service
        assert 'reactions' in service
        assert isinstance(service['actions'], list)
        assert isinstance(service['reactions'], list)

def test_request_mock_usdc():
    payload = {"address": "0x1234567890abcdef1234567890abcdef12345678"}
    response = requests.post(f'{BASE_URL}/request_mock_usdc/{payload["address"]}')
    assert response.status_code == 200
    assert response.json().get('message') == 'USDC sent to address.'
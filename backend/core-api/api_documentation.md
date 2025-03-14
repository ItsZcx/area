# Core-API API Docs

## Authentication
- [Create a user](#create-a-user) - `POST /api/v1/auth/register`
- [Login with email and password](#login-with-email-and-password) - `POST /api/v1/auth/login`

### GitHub Authentication
- [Login with GitHub](#login-with-github) - `GET /api/v1/auth/github`
- [GitHub callback](#github-callback) - `GET /api/v1/auth/github/callback`
- [GitHub callback for mobile](#github-callback-for-mobile) - `POST /api/v1/auth/github/callback/mobile`
- [Get GitHub token](#get-github-token--needs-security-fix) - `GET /api/v1/auth/github/token/{user_id}`

### Google Authentication
- [Login with Google](#login-with-google) - `GET /api/v1/auth/google`
- [Google callback](#google-callback) - `GET /api/v1/auth/google/callback`
- [Google callback for mobile](#google-callback-for-mobile) - `POST /api/v1/auth/google/callback/mobile`
- [Get Google token by user ID](#get-google-token-by-user-id--needs-security-fix) - `GET /api/v1/auth/google/token/{user_id}`
- [Get Google token by email](#get-google-token-by-email--needs-security-fix) - `GET /api/v1/auth/google/token/email/{email}`

## User Management
- [Get all users](#get-all-users) - `GET /api/v1/users`
- [Create a user](#create-a-user-1) - `POST /api/v1/users`
- [Delete all users](#delete-all-users) - `DELETE /api/v1/users`
- [Get logged in user](#get-loged-in-user) - `GET /api/v1/users/me`
- [Get user by id](#get-user-by-id) - `GET /api/v1/users/{user_id}`
- [Update user by id](#update-user-by-id) - `PUT /api/v1/users/{user_id}`
- [Patch user by id](#patch-user-by-id) - `PATCH /api/v1/users/{user_id}`
- [Delete user by id](#delete-user-by-id) - `DELETE /api/v1/users/{user_id}`

### User Services & Plans
- [Get google token of current user](#get-google-token-of-current-user) - `GET /api/v1/users/google_token`
- [Update User Plan](#update-user-plan) - `PUT /api/v1/users/plan/{user_id}`
- [Get services connected to user](#get-services-connected-to-user) - `GET /api/v1/users/services/{user_id}`

### Gmail Integration
- [Get gmail webhook info](#get-gmail-webhook-info) - `GET /api/v1/users/gmail/watch_info/{email}`
- [Update gmail webhook info](#update-gmail-webhook-info) - `PUT /api/v1/users/gmail/watch_info/{email}`
- [Get user with gmail webhook info by user id](#get-user-with-gmail-webhook-info-by-user-id) - `GET /api/v1/users/gmail/watch_info/user_id/{user_id}`

## Events
- [Get all executed events](#get-all-executed-events) - `GET /api/v1/events`
- [Handle event](#handle-event) - `POST /api/v1/events`
- [Get last executed event](#get-last-executed-event) - `GET /api/v1/events/last`
- [Get all processed messages](#get-all-processed-messages) - `GET /api/v1/events/list_messages`

## Tasks
- [Get Tasks](#get-tasks) - `GET /api/v1/tasks`
- [Create Task](#create-task) - `POST /api/v1/tasks`
- [Get Tasks by user](#get-tasks-3) - `GET /api/v1/tasks/user/{user_id}`
- [Get Task](#get-task) - `GET /api/v1/tasks/{task_id}`
- [Delete Task](#delete-task) - `DELETE /api/v1/tasks/{task_id}`
- [Update Task](#update-task) - `PUT /api/v1/tasks/tasks/{task_id}`
- [Partial Update Task](#partial-update-task) - `PATCH /api/v1/tasks/tasks/{task_id}`

### Services & Actions
- [Get Services](#get-services) - `GET /api/v1/tasks/services`
- [Get Services With Actions](#get-services-with-actions) - `GET /api/v1/tasks/services/reactions`
- [Get Services With Events](#get-services-with-events) - `GET /api/v1/tasks/services/events`
- [Get Actions](#get-actions) - `GET /api/v1/tasks/reactions/{service}`
- [Get Events](#get-events) - `GET /api/v1/tasks/events/{service}`
- [Get Reactions](#get-reactions) - `GET /api/v1/tasks/reactions`

### Parameters
- [Get Trigger Params](#get-trigger-params) - `GET /api/v1/tasks/params/event/{event}`
- [Get Reaction Params](#get-reaction-params) - `GET /api/v1/tasks/params/reaction/{reaction}`

## Miscellaneous
- [Read Root](#read-root) - `GET /`
- [Send USDC to a address](#send-usdc-to-a-address) - `POST /request_mock_usdc/{address}`
- [About Json](#about-json) - `GET /about.json`


### Create a user


Creates a new user as long as it does not exist, if it does, it will return a 400 error

| Method | URL |
|--------|-----|
| POST | /api/v1/auth/register |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| username | string |  | Required |
| password | string |  | Required |
| phone_number | N/A |  | Optional |
| email | string |  | Required |
| first_name | string |  | Required |
| last_name | string |  | Required |
| role | string |  | Optional |

##### Response (201)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| username | string |  |
| email | string |  |
| first_name | string |  |
| last_name | string |  |
| disabled | boolean |  |
| role | string |  |
| plan | N/A |  |
| phone_number | N/A |  |
| gmail_history_id | N/A |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Login with email and password


Login with email and password, returns a JWT token

| Method | URL |
|--------|-----|
| POST | /api/v1/auth/login |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| grant_type | N/A |  | Optional |
| username | string |  | Required |
| password | string |  | Required |
| scope | string |  | Optional |
| client_id | N/A |  | Optional |
| client_secret | N/A |  | Optional |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| access_token | string |  |
| token_type | string |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Login with GitHub


Redirects to GitHub OAuth login page

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/github |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| scope | query |  | Optional |

##### Response (302)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### GitHub callback


Callback URL for GitHub OAuth

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/github/callback |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### GitHub callback for mobile


Callback URL for GitHub OAuth for mobile

| Method | URL |
|--------|-----|
| POST | /api/v1/auth/github/callback/mobile |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get GitHub token | NEEDS SECURITY FIX


Get the GitHub token for a user | NEEDS SECURITY FIX

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/github/token/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Login with Google


Redirects to Google OAuth login page

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/google |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (302)
| Field | Type | Description |
|-------|------|-------------|

---

### Google callback


Callback URL for Google OAuth

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/google/callback |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Google callback for mobile


Callback URL for Google OAuth for mobile

| Method | URL |
|--------|-----|
| POST | /api/v1/auth/google/callback/mobile |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Google token by user ID | NEEDS SECURITY FIX


Get the Google token for a user with the specified user ID | NEEDS SECURITY FIX

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/google/token/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Google token by email | NEEDS SECURITY FIX


Get the Google token for a user with the specified email | NEEDS SECURITY FIX

| Method | URL |
|--------|-----|
| GET | /api/v1/auth/google/token/email/{email} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| email | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get all users


Returns a list with all the currently created users

| Method | URL |
|--------|-----|
| GET | /api/v1/users |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Create a user


Creates a new user as long as it does not exist, if it does, it will return a 400 error

| Method | URL |
|--------|-----|
| POST | /api/v1/users |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| username | string |  | Required |
| password | string |  | Required |
| phone_number | N/A |  | Optional |
| email | string |  | Required |
| first_name | string |  | Required |
| last_name | string |  | Required |
| role | string |  | Optional |

##### Response (201)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| username | string |  |
| email | string |  |
| first_name | string |  |
| last_name | string |  |
| disabled | boolean |  |
| role | string |  |
| plan | N/A |  |
| phone_number | N/A |  |
| gmail_history_id | N/A |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Delete all users


Deletes all users, if there are no users, it will return a 404 error

| Method | URL |
|--------|-----|
| DELETE | /api/v1/users |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get loged in user


Returns the user that is currently logged in, with private information

| Method | URL |
|--------|-----|
| GET | /api/v1/users/me |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| username | string |  |
| email | string |  |
| first_name | string |  |
| last_name | string |  |
| disabled | boolean |  |
| role | string |  |
| plan | N/A |  |
| phone_number | N/A |  |
| gmail_history_id | N/A |  |
| hashed_password | string |  |
| token | object |  |

---

### Get user by id


Returns the user with the specified id without highly private information, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| GET | /api/v1/users/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| username | string |  |
| email | string |  |
| first_name | string |  |
| last_name | string |  |
| disabled | boolean |  |
| role | string |  |
| plan | N/A |  |
| phone_number | N/A |  |
| gmail_history_id | N/A |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Update user by id


Update user properties by id, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| PUT | /api/v1/users/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| username | string |  | Required |
| password | string |  | Required |
| phone_number | N/A |  | Optional |
| email | string |  | Required |
| first_name | string |  | Required |
| last_name | string |  | Required |
| role | string |  | Optional |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Patch user by id


Update user properties by id

| Method | URL |
|--------|-----|
| PATCH | /api/v1/users/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Delete user by id


Deletes a user by id, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| DELETE | /api/v1/users/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get google token of current user


Returns the google token of the user that is currently logged in

| Method | URL |
|--------|-----|
| GET | /api/v1/users/google_token |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| access_token | string |  |
| refresh_token | string |  |
| token_type | string |  |
| scope | string |  |
| expires_at | N/A |  |

---

### Get gmail webhook info


Returns the gmail webhook info of the user with the specified email, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| GET | /api/v1/users/gmail/watch_info/{email} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| email | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| gmail_history_id | string |  |
| gmail_expiration_date | string |  |
| resource_id | string |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Update gmail webhook info


Update the gmail webhook info of the user with the specified email, if the user does not exist, it will return a 404 error. It returns the updated user

| Method | URL |
|--------|-----|
| PUT | /api/v1/users/gmail/watch_info/{email} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| email | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| user_id | integer |  | Required |
| resource_id | string |  | Required |
| gmail_history_id | integer |  | Required |
| gmail_expiration_date | string |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| email | string |  |
| token | N/A |  |
| gmail_webhook_info | N/A |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get user with gmail webhook info by user id


Returns the user with the specified id and the gmail webhook info, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| GET | /api/v1/users/gmail/watch_info/user_id/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| email | string |  |
| token | N/A |  |
| gmail_webhook_info | N/A |  |

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Update User Plan


Update user plan

| Method | URL |
|--------|-----|
| PUT | /api/v1/users/plan/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get services connected to user


Returns a list of the services connected to the user, if the user does not exist, it will return a 404 error

| Method | URL |
|--------|-----|
| GET | /api/v1/users/services/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get all executed events


Returns a list of all executed events since the APP release, if no events are found, a 404 error is raised

| Method | URL |
|--------|-----|
| GET | /api/v1/events |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Handle event


Handles an event by executing the associated actions

| Method | URL |
|--------|-----|
| POST | /api/v1/events |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| event_name | string |  | Required |
| service | string |  | Required |
| params | object |  | Required |
| context_params | object |  | Required |
| processed_message_info | object |  | Optional |

##### Response (202)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get last executed event


Returns the last executed event based on the timestamp, if no event is found, a 404 error is raised

| Method | URL |
|--------|-----|
| GET | /api/v1/events/last |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| id | integer |  |
| trigger | string |  |
| action_name | string |  |
| timestamp | string |  |

---

### Get all processed messages


Returns a list of all processed messages, if no messages are found, a 404 error is raised

| Method | URL |
|--------|-----|
| GET | /api/v1/events/list_messages |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Tasks




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| service | query |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Create Task




| Method | URL |
|--------|-----|
| POST | /api/v1/tasks |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| trigger | string |  | Required |
| trigger_args | N/A |  | Required |
| action_name | string |  | Required |
| action_params | N/A |  | Required |
| user_id | integer |  | Required |
| params | object |  | Required |

##### Response (201)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Services




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/services |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Services With Actions




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/services/reactions |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Services With Events




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/services/events |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Actions




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/reactions/{service} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| service | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Events




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/events/{service} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| service | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Trigger Params




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/params/event/{event} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| event | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Reaction Params




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/params/reaction/{reaction} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| reaction | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Reactions




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/reactions |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Get Tasks




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/user/{user_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| user_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Get Task




| Method | URL |
|--------|-----|
| GET | /api/v1/tasks/{task_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| task_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Delete Task




| Method | URL |
|--------|-----|
| DELETE | /api/v1/tasks/{task_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| task_id | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Update Task




| Method | URL |
|--------|-----|
| PUT | /api/v1/tasks/tasks/{task_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| task_id | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| trigger | string |  | Required |
| trigger_args | N/A |  | Required |
| action_name | string |  | Required |
| action_params | N/A |  | Required |
| user_id | integer |  | Required |
| service | string |  | Required |
| oauth_token | N/A |  | Required |
| requires_oauth | boolean |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Partial Update Task




| Method | URL |
|--------|-----|
| PATCH | /api/v1/tasks/tasks/{task_id} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| task_id | path |  | Required |

##### Request Body
| Field | Type | Description | Required |
|-------|------|-------------|----------|
| trigger | N/A |  | Optional |
| trigger_args | N/A |  | Optional |
| action_name | N/A |  | Optional |
| action_params | N/A |  | Optional |
| user_id | N/A |  | Optional |
| service | N/A |  | Optional |
| oauth_token | N/A |  | Optional |
| requires_oauth | N/A |  | Optional |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### Read Root




| Method | URL |
|--------|-----|
| GET | / |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

---

### Send USDC to a address


Sends 10 USDC to a given address

| Method | URL |
|--------|-----|
| POST | /request_mock_usdc/{address} |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|
| address | path |  | Required |

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|

##### Response (422)
| Field | Type | Description |
|-------|------|-------------|
| detail | array |  |

---

### About Json


Properties about the API

| Method | URL |
|--------|-----|
| GET | /about.json |

#### Parameters
| Name | In | Description | Required |
|------|----|-------------|----------|

##### Response (200)
| Field | Type | Description |
|-------|------|-------------|
| client | object |  |
| server | object |  |

---

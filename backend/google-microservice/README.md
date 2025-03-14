# github-microservice

## Setup

### 1. Install Dependencies with Poetry
Ensure that [Poetry](https://python-poetry.org) is installed. If you plan to use Docker and don't require IDE support for package management, you can skip this step.

1. Update project dependencies, this will also create a virtualenv and install them. (100% they are outdated):
   ```bash
   poetry update
   ```

2. To add or update a package:
   ```bash
   poetry add <package-name>
   ```
   or for development dependencies:
   ```bash
   poetry add --group=dev <package-name>
   ```

### 2. Set Up Environment Variables with dotenv
Environment variables are handled via a `.env` file. The `.env.example` file contains the essential variables required to run this project out of the box.

1. Create a `.env` file at the project root:
   ```bash
   touch .env
   ```

2. Add your environment-specific variables:

The `.env` file is used by the `pydantic-settings` package to load environment variables into the FastAPI application. To locate the PostgreSQL container's IP address, inspect the Docker network that is created.

<!-- ### 3. Run with Docker
1. Make sure [Docker](https://docs.docker.com/) is installed on your system.

2. Build and run the Docker containers:
   ```bash
   docker compose up -d
   ```

This will start both the FastAPI app and the PostgreSQL database as Docker containers.

3. To stop the containers (add --volumes to remove persistent PostgeSQL data):
   ```bash
   docker-compose down
   ```

3. Checking logs:
   ```bash
   docker compose logs --follow -t
   ``` -->

### 3. Spin up Google Cloud Pub/Sub

PROJECT_ID -> "area-epitech-437409"
TOPIC_NAME -> "Area-Epitech"

```bash
$ gcloud config set project area-epitech-437409
$ gcloud pubsub topics add-iam-policy-binding Area --member=serviceAccount:gmail-api-push@system.gserviceaccount.com --role=roles/pubsub.publisher
```

### 4. Spin up the FastAPI server
It is designed with a cron task running concurrently:

```bash
$ poetry run uvicorn src.main:app --port 8084
```

Tunneling service for webhook events from GitHub to the backend:
```bash
ngrok http 8084
```
You may need to install it locally, and then login to config it with your auth token.


# Technical Details

## Trigger names to args:

"email_received" -> ["PROJECT_ID", "TOPIC_NAME"]
"email_received_from_person" -> ["PROJECT_ID", "TOPIC_NAME", "from_email"]
"email_sent" -> ["PROJECT_ID", "TOPIC_NAME"]

## Args events returned:

- For 'email_received' It is up to the core-api to know if the email is from a specific person   

"email_received" -> ["subject", "message", "to", "from"]
"email_sent" -> ["subject", "message", "to", "from"]

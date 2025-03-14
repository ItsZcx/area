# Core-API
Core-API integrates Poetry, Alembic, SQLAlchemy, dotenv(Pydantic), Docker, and PostgreSQL for a fully functional API setup.

Docker is set up to run both a FastAPI and PostgreSQL container.

## Table of Contents
- [Project Structure](#project-structure)
- [Core-API Setup](#core-api-setup)
    - [1. Install Dependencies with Poetry](#1-install-dependencies-with-poetry)
    - [2. Set Up Environment Variables with dotenv](#2-set-up-environment-variables-with-dotenv)
    - [3. Run Core-API with Docker](#3-run-core-api-with-docker)
    - [4. Set Up Database with Alembic](#4-set-up-database-with-alembic)
- [Core-API API Docs](#core-api-api-docs)



## Project Structure
This project strucure is based on [project-structure-consistent--predictable](https://github.com/zhanymkanov/fastapi-best-practices#1-project-structure-consistent--predictable) by zhanymkanov. It has been modified to use poetry and docker instead of venv.

```
core-api
├── alembic/
├── src
│   └── package               # package
│       ├── config.py        # local configs
│       ├── dependencies.py  # specific package router dependencies
│       ├── exceptions.py    # package-specific errors
│       ├── models.py        # database models
│       ├── router.py        # package router with endpoints
│       ├── schemas.py       # pydantic models
│       ├── service.py       # package-specific business logic
│       └── utils.py         # any other non-business logic functions
│   ├── __init__.py
│   ├── config.py            # global configs (dotenv, etc)
│   ├── models.py            # global database models
│   ├── exceptions.py        # global exceptions
│   ├── pagination.py        # global module e.g. pagination
│   ├── database.py          # database connection related stuff
│   └── main.py
├── tests/
│   ├── auth
│   ├── aws
│   └── posts
├── .env.example             # Variables used/needed in this .env
├── .gitignore
├── alembic.ini
├── compose.yaml
├── Dockerfile
├── LICENSE
├── poetry.lock
├── pyproject.toml
└── README.md
```

1. Store all domain directories inside `src` folder
   1. `src/` - highest level of an app, contains common models, configs, and constants, etc.
   2. `src/main.py` - root of the project, which inits the FastAPI app

2. Each package has its own router, schemas, models, etc.
   1. `config.py` - e.g. specific env vars
   2. `dependencies.py` - router dependencies
   3. `exceptions.py` - module specific exceptions, e.g. `PostNotFound`, `InvalidUserData`
   4. `models.py` - for database models
   5. `router.py` - is a core of each module with all the endpoints
   6. `schemas.py` - for pydantic models
   7. `service.py` - module specific business logic
   8. `utils.py` - non-business logic functions, e.g. response normalization, data enrichment, etc.

3. When package requires services or dependencies or configs from other packages - import them with an explicit module name
```python
from src.auth import config as auth_config
from src.notifications import service as notification_service
from src.posts.config import ErrorCode as PostsErrorCode  # in case we have Standard ErrorCode in config module of each package
```

## Core-API Setup

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

### 3. Run Core-API with Docker
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
   ```

### 4. Set Up Database with Alembic
1. Set up the database tables:
   ```bash
   poetry run alembic upgrade head
   ```

Here are some examples of how to use alembic:
1. Create a new migration script (you can remove --autogenerate and create the change yourself):
   ```bash
   # DATABASE HAS TO BE RUNNING!
   poetry run alembic revision --autogenerate -m "description of changes"
   ```

2. Apply the migrations:
   ```bash
   poetry run alembic upgrade {REVISION_ID}
   ```

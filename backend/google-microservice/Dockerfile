FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    PIP_NO_BUILD_ISOLATION=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    autoconf \
    libtool \
    pkg-config \
    python3-dev \
    libssl-dev \
    libz-dev \
    libkrb5-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry==1.8.3

WORKDIR /google-microservice

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-root --without dev && rm -rf $POETRY_CACHE_DIR

COPY .env ./
COPY . .

EXPOSE 8084

CMD ["poetry", "run", "uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8084"]

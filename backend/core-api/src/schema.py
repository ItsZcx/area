# Pydantic general models
from pydantic import BaseModel


class Reaction(BaseModel):
    name: str
    description: str


class Action(BaseModel):
    name: str
    description: str


class Service(BaseModel):
    name: str
    actions: list[Action]
    reactions: list[Reaction]


class Server(BaseModel):
    current_time: int
    services: list[Service]


class Client(BaseModel):
    host: str


class AboutJSON(BaseModel):
    client: Client
    server: Server

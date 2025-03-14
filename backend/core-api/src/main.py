from datetime import datetime
from socket import gethostbyname
from socket import gethostname

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette import status
from starlette.middleware.sessions import SessionMiddleware

from src.auth.router import router as auth_router
from src.auth.service import send_usdc
from src.config import src_setting
from src.event.router import router as events_router
from src.schema import AboutJSON
from src.schema import Action
from src.schema import Client
from src.schema import Reaction
from src.schema import Server
from src.schema import Service
from src.task.router import router as task_router
from src.user.router import router as user_router

app = FastAPI(title="Core-API")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(task_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.add_middleware(SessionMiddleware, secret_key=src_setting.SESSION_MIDDLEWARE_SECRET_KEY)


@app.get("/")
def read_root():
    return {"msg": "Server is running"}


@app.post(
    "/request_mock_usdc/{address}",
    status_code=status.HTTP_200_OK,
    summary="Send USDC to a address",
    description="Sends 10 USDC to a given address",
)
def request_mock_usdc(address: str):
    send_usdc(address, 10)  # 10 USDC
    return {"message": "USDC sent to address."}


@app.get(
    "/about.json", description="Properties about the API", response_model=AboutJSON, status_code=status.HTTP_200_OK
)
def about_json():
    # =============================================================#
    # ================= General actions/reactions =================#
    # =============================================================#

    # Reactions
    send_email_reaction = Reaction(name="send_email", description="Send an email")
    send_sms_reaction = Reaction(name="send_sms", description="Send an SMS")

    # ============================================================#
    # ================= Github actions/reactions =================#
    # ============================================================#

    # Actions
    push_event_action = Action(
        name="push_event",
        description="Occurs when a push event is triggered",
    )
    pull_request_to_main_action = Action(
        name="pull_request_to_main",
        description="Occurs when a pull request is merged to main",
    )
    ci_cd_pipeline_action = Action(
        name="ci_cd_pipeline",
        description="Occurs when a CI/CD pipeline is triggered",
    )

    # Reactions
    create_github_issue = Reaction(name="create_github_issue", description="Create a GitHub issue")

    # ============================================================#
    # ================= Google actions/reactions =================#
    # ============================================================#

    # Actions
    any_email_received_action = Action(
        name="any_email_received",
        description="Occurs when an email is received",
    )
    any_email_sent_action = Action(
        name="any_email_sent",
        description="Occurs when an email is sent",
    )
    calendar_event_created_action = Action(
        name="calendar_event_created",
        description="Occurs when a calendar event is created",
    )

    # Reactions
    create_google_cal_event_reaction = Reaction(
        name="create_google_cal_event", description="Create a Google Calendar event"
    )

    # ============================================================#
    # ================= Reddit actions/reactions =================#
    # ============================================================#

    # Actions

    # Reactions
    send_private_message_reaction = Reaction(
        name="send_private_message", description="Send a private message to a user"
    )
    post_new_submission_reaction = Reaction(
        name="post_new_submission", description="Post a new submission to a subreddit"
    )
    post_new_comment_on_post_reaction = Reaction(
        name="post_new_comment_on_post", description="Post a new comment on a post in a subreddit"
    )

    # ============================================================#
    # ==================== Crypto reactions ======================#
    # ============================================================#

    # Reactions
    send_usdc_reaction = Reaction(name="send_usdc", description="Send USDC to a given address")

    # ============================================#
    # ================= Services =================#
    # ============================================#

    github = Service(
        name="github",
        actions=[
            push_event_action,
            pull_request_to_main_action,
            ci_cd_pipeline_action,
        ],
        reactions=[
            # create_github_issue, Not operative
            send_email_reaction,
            send_sms_reaction,
        ],
    )

    google = Service(
        name="google",
        actions=[
            any_email_received_action,
            any_email_sent_action,
            calendar_event_created_action,
        ],
        reactions=[
            create_google_cal_event_reaction,
            send_email_reaction,
            send_sms_reaction,
        ],
    )

    reddit = Service(
        name="reddit",
        actions=[],
        reactions=[
            send_private_message_reaction,
            post_new_submission_reaction,
            post_new_comment_on_post_reaction,
        ],
    )

    crypto = Service(
        name="crypto",
        actions=[],
        reactions=[
            send_usdc_reaction,
        ],
    )

    # ===================================#

    server = Server(
        current_time=int(datetime.now().timestamp()),
        services=[
            github,
            google,
            reddit,
            crypto,
        ],
    )

    client = Client(host=gethostbyname(gethostname()))

    aboutJSON = AboutJSON(client=client, server=server)

    return aboutJSON

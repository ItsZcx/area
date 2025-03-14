# Pydantic models
from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel


class EventPayload(BaseModel):
    event_name: str
    service: str
    params: Dict[str, str]
    context_params: Dict[str, str]

# PUSH_EVENT

class CommitAuthor(BaseModel):
    name: str
    email: str
    username: Optional[str]


class Commit(BaseModel):
    id: str
    tree_id: str
    distinct: bool
    message: str
    timestamp: str  # ISO 8601 format
    url: str
    author: CommitAuthor
    committer: CommitAuthor
    added: List[str]
    removed: List[str]
    modified: List[str]


class Pusher(BaseModel):
    name: str
    email: str


class Sender(BaseModel):
    login: str
    id: int
    node_id: str
    avatar_url: str
    gravatar_id: str
    url: str
    html_url: str
    followers_url: str
    following_url: str
    gists_url: str
    starred_url: str
    subscriptions_url: str
    organizations_url: str
    repos_url: str
    events_url: str
    received_events_url: str
    type: str
    site_admin: bool


class RepositoryOwner(Sender):
    pass  # Inherits all fields from Sender


class Repository(BaseModel):
    id: int
    node_id: str
    name: str
    full_name: str
    private: bool
    owner: RepositoryOwner
    html_url: str
    description: Optional[str]
    fork: bool
    url: str
    # Additional fields can be added as needed


class PushEvent(BaseModel):
    ref: str
    before: str
    after: str
    repository: Repository
    pusher: Pusher
    sender: Sender
    created: bool
    deleted: bool
    forced: bool
    base_ref: Optional[str]
    compare: str
    commits: List[Commit]
    head_commit: Commit


# PULL_REQUEST


class User(BaseModel):
    login: str
    id: int
    node_id: str
    avatar_url: str
    gravatar_id: str
    url: str
    html_url: str
    followers_url: str
    following_url: str
    gists_url: str
    starred_url: str
    subscriptions_url: str
    organizations_url: str
    repos_url: str
    events_url: str
    received_events_url: str
    type: str
    site_admin: bool
    email: Optional[str] = None  # May not always be present


class Repo(BaseModel):
    id: int
    node_id: str
    name: str
    full_name: str
    private: bool
    owner: User
    html_url: str
    description: Optional[str]
    fork: bool
    url: str
    # Add additional fields as needed


class Branch(BaseModel):
    ref: str
    sha: str
    user: User
    repo: Repo


class PullRequest(BaseModel):
    url: str
    id: int
    node_id: str
    html_url: str
    diff_url: str
    patch_url: str
    issue_url: str
    number: int
    state: str
    locked: bool
    title: str
    user: User
    body: Optional[str]
    created_at: str
    updated_at: str
    closed_at: Optional[str]
    merged_at: Optional[str]
    merge_commit_sha: Optional[str]
    assignee: Optional[User]
    assignees: List[User]
    requested_reviewers: List[User]
    requested_teams: List
    labels: List
    milestone: Optional[str]
    draft: bool
    commits_url: str
    review_comments_url: str
    review_comment_url: str
    comments_url: str
    statuses_url: str
    head: Branch
    base: Branch
    # Add additional fields as needed


class PullRequestEvent(BaseModel):
    action: str
    number: int
    pull_request: PullRequest
    repository: Repo
    sender: User
    # Add additional fields as needed


# CI_CD_PIPELINE


class WorkflowUser(BaseModel):
    login: str
    id: int
    node_id: str
    avatar_url: str
    gravatar_id: str
    url: str
    html_url: str
    followers_url: str
    following_url: str
    gists_url: str
    starred_url: str
    subscriptions_url: str
    organizations_url: str
    repos_url: str
    events_url: str
    received_events_url: str
    type: str
    site_admin: bool


class WorkflowRepository(BaseModel):
    id: int
    node_id: str
    name: str
    full_name: str
    private: bool
    owner: User
    html_url: str
    description: Optional[str]
    fork: bool
    url: str
    # Add additional fields as needed


class WorkflowRun(BaseModel):
    id: int
    name: str
    node_id: str
    head_branch: str
    head_sha: str
    run_number: int
    event: str
    status: str  # "completed", "in_progress", "queued"
    conclusion: Optional[str]  # "success", "failure", etc.
    workflow_id: int
    check_suite_id: int
    check_suite_node_id: str
    url: str
    html_url: str
    pull_requests: List  # List of pull request objects
    created_at: str
    updated_at: str
    run_attempt: int
    run_started_at: str
    triggering_actor: WorkflowUser
    # Add additional fields as needed


class WorkflowRunEvent(BaseModel):
    action: str  # "completed", "requested"
    workflow_run: WorkflowRun
    repository: WorkflowRepository
    sender: WorkflowUser

import re

import praw

from src.config import EnvFileLoader
from src.llm.llm import get_openai_client


class RedditSetting(EnvFileLoader):
    REDDIT_CLIENT_ID: str
    REDDIT_CLIENT_SECRET: str
    REDDIT_USERNAME: str
    REDDIT_PASSWORD: str


reddit_setting = RedditSetting()
aiClient = get_openai_client()


def reddit_get_post_id(post_url: str) -> str:
    """
    Extracts the post ID from a given Reddit post URL using regex, if it can't extract it, ex: post_url is already the post id, it returns post_url.

    Args:
        post_url (str): The URL of the Reddit post.

    Returns:
        str: The extracted post ID if found, otherwise the original post URL.
    """
    match = re.search(r"comments/([a-zA-Z0-9]+)/", post_url)

    if match:
        post_url = match.group(1)

    return post_url


def generate_body(prompt: str) -> str:
    """
    Generates a response body based on the given prompt using the GPT-3.5-turbo model.

    Args:
        prompt (str): The input prompt to generate the response from.

    Returns:
        str: The generated response body.
    """
    completion = aiClient.chat.completions.create(
        model="gpt-3.5-turbo", messages=[{"role": "system", "content": prompt}]
    )

    body = completion.choices[0].message.content
    return body


def send_private_message(task=None, db=None, **kwargs):
    """
    Sends a private message to a Reddit user.
    Args:
        task (optional): The task associated with sending the message.
        db (optional): The database connection or session.
        **kwargs: Additional keyword arguments.
            - username (str): The Reddit username of the recipient. Required.
            - subject (str): The subject of the private message. Required.
    Raises:
        ValueError: If 'username' or 'subject' is not provided in kwargs.
    """
    print("REDDIT: PRIVATE MESSAGE HIT...")
    username: str = task.action_params[0]
    subject: str = task.action_params[1]

    if not username:
        raise ValueError("Username is required to send a private message.")
    if not subject:
        raise ValueError("Subject is required to send a private message.")

    reddit = praw.Reddit(
        client_id=reddit_setting.REDDIT_CLIENT_ID,
        client_secret=reddit_setting.REDDIT_CLIENT_SECRET,
        password=reddit_setting.REDDIT_PASSWORD,
        username=reddit_setting.REDDIT_USERNAME,
        user_agent=f"Area/0.1 (by /u/{reddit_setting.REDDIT_USERNAME})",
    )

    prompt = (
        f"Compose a brief message to send to a user notifying the following subject.\n\n"
        f"No calls to action are needed, just notify the user about the event details. The message sender name is Area-Team\n\n"
        f"Event Details:\n{subject}"
    )

    message: str = generate_body(prompt)

    print(f"Sending private message to {username} with message: {message}")
    try:
        reddit.redditor(username).message(subject="Automated Area message", message=message)
    except Exception as e:
        print(e)


def post_new_submission(task=None, db=None, **kwargs) -> str:
    """
    Posts a new submission to a specified subreddit.

    Args:
        task: Optional; Task information, default is None.
        db: Optional; Database connection, default is None.
        **kwargs: Additional keyword arguments containing:
            - title (str): The title of the submission.
            - subreddit (str): The name of the subreddit to post to.
            - Other optional details to be included in the event details.

    Returns:
        str: The ID of the posted submission if successful, otherwise an empty string.

    Raises:
        ValueError: If the subreddit name or title is not provided.
    """

    print("REDDIT: NEW SUBMITTION HIT...")
    print("Knwoargs from reddit: ", kwargs)
    print("Task action args: ", task.action_params)

    title: str = task.action_params[0]
    subreddit: str = task.action_params[1]

    if not subreddit:
        raise ValueError("Subreddit name is required to post a new submission.")

    if not title:
        raise ValueError("Title is required to post a new submission.")

    reddit = praw.Reddit(
        client_id=reddit_setting.REDDIT_CLIENT_ID,
        client_secret=reddit_setting.REDDIT_CLIENT_SECRET,
        password=reddit_setting.REDDIT_PASSWORD,
        username=reddit_setting.REDDIT_USERNAME,
        user_agent=f"Area/0.1 (by /u/{reddit_setting.REDDIT_USERNAME})",
    )

    event_details = ", ".join([f"{key}: '{value}'" for key, value in kwargs.items()])

    prompt = (
        f"Compose a brief message to post to a subreddit. Explicitly mention the subreddit name and the message sender name is Area-Team\n\n"
        f"Event Details:\n{event_details}"
    )

    post_content: str = generate_body(prompt)

    print(f"Posting new submission to {subreddit} with title: {title} and content: {post_content}")
    try:
        submision = reddit.subreddit(subreddit).submit(title, selftext=post_content)
        return str(submision)
    except Exception as e:
        print(e)
        return ""


def post_new_comment_on_post(task=None, db=None, **kwargs):
    """
    Posts a new comment on a specified Reddit post.

    Args:
        task (optional): Task information, if any.
        db (optional): Database connection or session, if any.
        **kwargs: Arbitrary keyword arguments. Must include:
            - post_id (str): The ID of the Reddit post to comment on.
            - subject (str): The subject or content of the comment.

    Raises:
        ValueError: If 'post_id' or 'subject' is not provided in kwargs.

    Example:
        post_new_comment_on_post(post_id="abc123", subject="This is a comment")
    """

    print("REDDIT: NEW COMMENT ON POST...")
    post_id: str = reddit_get_post_id(task.action_params[0])
    subject: str = task.action_params[1]

    if not post_id:
        raise ValueError("Post ID is required to post a new comment.")
    if not subject:
        raise ValueError("Subject is required to post a new comment.")

    reddit = praw.Reddit(
        client_id=reddit_setting.REDDIT_CLIENT_ID,
        client_secret=reddit_setting.REDDIT_CLIENT_SECRET,
        password=reddit_setting.REDDIT_PASSWORD,
        username=reddit_setting.REDDIT_USERNAME,
        user_agent=f"Area/0.1 (by /u/{reddit_setting.REDDIT_USERNAME})",
    )

    prompt = (
        f"Compose a brief message to post as a comment on a Reddit post. The message sender name is Area-Team\n\n"
        f"Comment Details:\n{subject}"
    )

    comment: str = generate_body(prompt)

    print(f"Posting new comment on post {post_id} with content: {comment}")
    try:
        ret = reddit.submission(id=post_id).reply(comment)
        print(f"Comment posted successfully: {ret}")
    except Exception as e:
        print(e)


const fancyNames: Record<string, string> = {
    common: "Common",
    // Common Reactions
    send_sms: "Send SMS",
    send_email: "Send Email",

    // Google
    google: "Google",
    // Google Actions
    email_received: "Email Received",
    email_received_from_person: "Email Received from Specific Person",
    email_sent: "Email Sent",
    email_sent_to_person: "Email Sent to Specific Person",
    calendar_event_created: "Calendar Event Created",
    // Google Reactions
    create_google_cal_event: "Create Google Calendar Event",

    // Github
    github: "GitHub",
    // GitHub Actions
    push_event: "Push to Repository",
    pull_request_to_main: "Pull Request to Main Branch",
    ci_cd_pipeline: "CI/CD Pipeline Triggered",
    // GitHub Reactions
    create_github_issue: "Create GitHub Issue",

    // Crypto
    crypto: "Crypto",
    // Crypto Reactions
    send_usdc: "Send USDC",

    // Reddit
    reddit: "Reddit",
    // Reddit Reactions
    send_private_message: "Send Private Message",
    post_new_submission: "Post New Submission",
    post_new_comment: "Post New Comment",
    post_new_comment_on_post: "Post New Comment on Post",
};

export default function getFancyName(name: string): string {
    return fancyNames[name] || name;
}


const servicesReactions: { [key: string]: string[] } = {
    common: [
        'send_sms',
        'send_email',
    ],
    google: [
        'create_google_cal_event',
    ],
    github: [
        'create_github_issue',
    ],
    crypto: [
        'send_usdc',
    ],
    reddit: [
        'send_private_message',
        'post_new_submission',
        'post_new_comment',
        'post_new_comment_on_post',
    ]
}

export default function getServiceFromReaction(reaction: string): string {
    for (const [service, reactions] of Object.entries(servicesReactions)) {
        if (reactions.includes(reaction)) {
            return service;
        }
    }
    return '';
}

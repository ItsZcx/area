
export interface Template {
    id: string;
    title: string;
    actionService: string;
    action: string;
    reactionService: string;
    reaction: string;
}

export const templates: Template[] = [
    {
        id: 'template-1',
        title: 'Email to SMS notifier',
        actionService: 'google',
        action: 'email_received',
        reactionService: 'common',
        reaction: 'send_sms',
    },
    {
        id: 'template-2',
        title: 'Github PR Reviewer Alert',
        actionService: 'github',
        action: 'pull_request_to_main',
        reactionService: 'common',
        reaction: 'send_email',
    },
    {
        id: 'template-3',
        title: 'Calendar Event SMS Reminder',
        actionService: 'google',
        action: 'calendar_event_created',
        reactionService: 'common',
        reaction: 'send_sms',
    },
    {
        id: 'template-4',
        title: 'Code Push Notification',
        actionService: 'github',
        action: 'push_event',
        reactionService: 'common',
        reaction: 'send_email',
    },
    {
        id: 'template-5',
        title: 'CI/CD Status Update',
        actionService: 'github',
        action: 'ci_cd_pipeline',
        reactionService: 'common',
        reaction: 'send_sms',
    },
    {
        id: 'template-6',
        title: 'Automated Issue Creator',
        actionService: 'google',
        action: 'email_received_from_person',
        reactionService: 'github',
        reaction: 'create_github_issue',
    },
    {
        id: 'template-7',
        title: 'Reddit Post on Calendar Event',
        actionService: 'google',
        action: 'calendar_event_created',
        reactionService: 'reddit',
        reaction: 'post_new_submission',
    },
    {
        id: 'template-8',
        title: 'Email-Triggered USDC Transfer',
        actionService: 'google',
        action: 'email_received_from_person',
        reactionService: 'crypto',
        reaction: 'send_usdc',
    },
    {
        id: 'template-9',
        title: 'GitHub Activity Digest',
        actionService: 'github',
        action: 'push_event',
        reactionService: 'google',
        reaction: 'create_google_cal_event',
    },
    {
        id: 'template-10',
        title: 'Automated PR Commenter',
        actionService: 'github',
        action: 'pull_request_to_main',
        reactionService: 'reddit',
        reaction: 'post_new_submission',
    },
    {
        id: 'template-11',
        title: 'Email-to-Reddit Crosspost',
        actionService: 'google',
        action: 'email_received',
        reactionService: 'reddit',
        reaction: 'post_new_submission',
    },
    {
        id: 'template-12',
        title: 'CI/CD Success Celebration',
        actionService: 'github',
        action: 'ci_cd_pipeline',
        reactionService: 'crypto',
        reaction: 'send_usdc',
    },
    {
        id: 'template-13',
        title: 'Scheduled Reddit Posts',
        actionService: 'google',
        action: 'calendar_event_created',
        reactionService: 'reddit',
        reaction: 'post_new_submission',
    },
];

export const getTemplateById = (id: string): Template | undefined => {
    return templates.find(t => t.id === id);
}

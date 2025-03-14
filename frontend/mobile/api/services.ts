import { API_URL } from "@/config";

const fetchData = async (endpoint: string, errorMessage: string): Promise<any> => {
    try {
        const url = API_URL + endpoint;
        console.log(url);
        const response = await fetch(url);

        if (response.ok) {
            const data =  await response.json();
            return data;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorMessage);
        }
    } catch (error) {
        console.error(errorMessage, error);
        throw error;
    }
};

export const getAllServices = async (): Promise<string[]> => {
    return fetchData('/tasks/services', 'Failed to retrieve services');
};

export const getServiceActions = async (service: string): Promise<string[]> => {
    return fetchData(`/tasks/events/${service}`, 'Failed to retrieve actions');
};

export const getServicesReactions = async (service: string): Promise<string[]> => {
    try {
        // Perform both fetch operations concurrently using Promise.all
        const [serviceReactions, commonReactions, redditReaction, ...cryptoReaction] = await Promise.all([
            fetchData(`/tasks/reactions/${service}`, 'Failed to retrieve service-specific reactions'),
            fetchData(`/tasks/reactions/common`, 'Failed to retrieve common reactions'),
            fetchData(`/tasks/reactions/reddit`, 'Failed to retrieve common reactions'),
            fetchData(`/tasks/reactions/crypto  `, 'Failed to retrieve common reactions'),
        ]);
        // Concatenate the results from both fetches into a single array

        return [...serviceReactions, ...commonReactions, ...redditReaction, ...cryptoReaction];
    } catch (error) {
        console.error("Error retrieving reactions:", error);
        throw error;
    }
};

export const getActionParams = async (action: string): Promise<string[]> => {
    return fetchData(`/tasks/params/event/${action}`, 'Failed to retrieve action parameters');
};

export const getReactionParams = async (action: string): Promise<string[]> => {
    return fetchData(`/tasks/params/reaction/${action}`, 'Failed to retrieve reaction parameters');
};

export const getUserTasks = async (id: number): Promise<string[]> => {
    return fetchData(`/tasks/user/${id}`, 'Failed to retrieve user tasks');
};

export const getUserGoogleToken = async (id: number): Promise<any> => {
    return fetchData(`/auth/google/token/${id}`, 'Failed to retrieve user google token');
}
export const getUserGithubToken = async (id: number): Promise<any> => {
    return fetchData(`/auth/github/token/${id}`, 'Failed to retrieve user github token');
}

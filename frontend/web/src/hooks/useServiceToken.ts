import { useUser } from "./useUser";

export function useServiceToken(service?: string) {

    const { user } = useUser();

    const getServiceToken = (service?: string) => {
        if (user) {
            switch (service) {
                case "github":
                    return user.token.github_token.hashed_token;
                case "google":
                    return user.token.google_token.access_token;
                default:
                    return 'no-token';
            }
        }
        return null;
    }

    return { getServiceToken };

}

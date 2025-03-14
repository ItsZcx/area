import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';

export const useUserServices = () => {
    const { user } = useUser();
    const [services, setServices] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getServices = useCallback(async () => {
        if (!user) {
            return;
        }
        setLoading(true);
        setServices([]);
        if (user.token.github_token.hashed_token) {
            setServices((prev) => [...prev, 'github']);
        }
        if (user.token.google_token.access_token) {
            setServices((prev) => [...prev, 'google']);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        getServices();
    }, [getServices]);

    return { services, loading, getServices };
};

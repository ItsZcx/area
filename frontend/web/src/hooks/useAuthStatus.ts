import { useEffect, useState } from 'react';
import { isLoggedIn } from '../lib/authUtils';

export default function useAuthStatus() {
    const [isLogged, setIsLogged] = useState(isLoggedIn());

    useEffect(() => {
        const handleAuthChange = () => {
            setIsLogged(isLoggedIn());
        };

        window.addEventListener('login', handleAuthChange);
        window.addEventListener('logout', handleAuthChange);

        return () => {
            window.removeEventListener('login', handleAuthChange);
            window.removeEventListener('logout', handleAuthChange);
        };
    }, []);

    return isLogged;
}

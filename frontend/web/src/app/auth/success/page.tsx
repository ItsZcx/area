'use client';

import { setAuthToken } from '@/lib/authUtils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthSuccess() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const access_token = urlParams.get('access_token');

        if (!access_token) {
            console.error('No access token found');
            router.push('/auth/login');
            return;
        }
        setAuthToken(access_token);
        window.dispatchEvent(new Event('login'));
        router.push('/dashboard');
    }, [router]);

    return (
        <div>
            <p>Authenticating...</p>
        </div>
    );
}

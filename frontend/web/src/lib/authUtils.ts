import { useUser } from '@/hooks/useUser';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
    exp: number;
    sub: string;
}

export function getAuthToken() {
    return Cookies.get('authToken');
}

export function setAuthToken(token: string) {
    Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'strict' });
}

export function removeAuthToken() {
    Cookies.remove('authToken');
}

export function isLoggedIn() {
    return !!getDecodedToken();
}

export function getDecodedToken(): DecodedToken | null {
    const token = getAuthToken();

    if (!token) {
        return null;
    }
    try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);

        if (decoded.exp * 1000 < Date.now()) {
            removeAuthToken();
            return null;
        }

        return decoded;
    } catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}

export async function getUser() {
    const url = process.env.NEXT_PUBLIC_API_URL + '/users/me';

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
        },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch user data');
    }
    return await res.json();
}


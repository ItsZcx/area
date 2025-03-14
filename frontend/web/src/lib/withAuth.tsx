import { useEffect, useState } from 'react';
import { isLoggedIn } from './authUtils';
import { createElement } from 'react';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const Wrapper = (props: React.ComponentProps<typeof WrappedComponent>) => {
        const [loadingState, setLoadingState] = useState(true);
        const { user, loading } = useUser();

        useEffect(() => {
            if (!loading) {
                setLoadingState(true);
                if (!isLoggedIn() || !user) {
                    redirect('/auth/logIn');
                }
                setLoadingState(false);
            }
        }, [loading, user]);

        if (loadingState || loading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        return createElement(WrappedComponent, props);
    };

    return Wrapper;
};

export const withAuthAdmin = (WrappedComponent: React.ComponentType) => {
    const Wrapper = (props: React.ComponentProps<typeof WrappedComponent>) => {
        const [isLoading, setIsLoading] = useState(true);
        const { user, loading } = useUser();

        useEffect(() => {
            if (!loading) {
                if (!isLoggedIn()) {
                    redirect('/auth/logIn');
                } else if (user?.role !== 'admin') {
                    redirect('/dashboard');
                } else {
                    setIsLoading(false);
                }
            }
        }, [loading, user?.role]);

        if (isLoading || loading) {
            return (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        return createElement(WrappedComponent, props);
    };

    return Wrapper;
}

export default withAuth;

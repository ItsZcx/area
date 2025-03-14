import { useEffect, useState } from 'react';
import { isLoggedIn } from './authUtils';
import { createElement } from 'react';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const withGuest = (WrappedComponent: React.ComponentType) => {
    const Wrapper = (props: React.ComponentProps<typeof WrappedComponent>) => {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (isLoggedIn()) {
                redirect('/dashboard');
            } else {
                setLoading(false);
            }
        }, []);

        if (loading) {
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

export default withGuest;

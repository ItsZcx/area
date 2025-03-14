'use client'

import { Button } from "@/components/ui/button";
import { useAppLogo } from "@/hooks/useAppLogos";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type GoogleAuthProps = {
    onError: (errorMessage: string) => void;
};

export default function GoogleAuth({ onError }: GoogleAuthProps) {
    const url = apiUrl + "/auth/google";
    const { getAppLogo } = useAppLogo();

    async function handleGoogleAuth() {
        try {
            window.location.href = url;
        } catch (err) {
            console.error(err);
            onError("An error occurred while trying to authenticate with Github.");
        }
    }

    return (
        <Button variant="outline" size="icon" onClick={handleGoogleAuth}>
            <Image src={getAppLogo('google')} alt="Google" width={24} height={24} />
        </Button>
    )
}

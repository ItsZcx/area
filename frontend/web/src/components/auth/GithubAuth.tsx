'use client'

import { Button } from "@/components/ui/button";
import { useAppLogo } from "@/hooks/useAppLogos";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type GithubAuthProps = {
    onError: (errorMessage: string) => void;
};

export default function GithubAuth({ onError }: GithubAuthProps) {
    const url = apiUrl + "/auth/github";

    const { getAppLogo } = useAppLogo();

    async function handleGithubAuth() {
        try {
            window.location.href = url;
        } catch (err) {
            console.error(err);
            onError("An error occurred while trying to authenticate with Github.");
        }
    }

    return (
        <Button variant="outline" size="icon" onClick={handleGithubAuth}>
            <Image src={getAppLogo('github')} alt="Github" width={24} height={24} />
        </Button>
    )
}

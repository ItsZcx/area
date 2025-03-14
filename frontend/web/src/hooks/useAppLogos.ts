import { useTheme } from "next-themes";

type LogoPaths = {
    light?: string;
    dark?: string;
    [key: string]: string | undefined;
};

type AppLogos = {
    [key: string]: LogoPaths | string;
};

const appLogos: AppLogos = {
    github: {
        light: "/logos/github-light.svg",
        dark: "/logos/github-dark.svg"
    },
    google: "/logos/google.svg",
    gmail: "/logos/gmail.svg",
    google_calendar: "/logos/google-calendar.svg",
    reddit: "/logos/reddit.svg",
    crypto: {
        light: "/logos/crypto-light.svg",
        dark: "/logos/crypto-dark.svg"
    },
    common: {
        light: "/logos/common-light.svg",
        dark: "/logos/common-dark.svg"
    }
};

export function useAppLogo() {
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme ? resolvedTheme : "light";

    const getAppLogo = (service: string): string => {
        const logo = appLogos[service];
        if (typeof logo === 'string') {
            return logo;
        }

        return logo?.[theme] || (appLogos.common as LogoPaths)[theme] || "/logos/common-light.svg";
    };

    return { getAppLogo };
}

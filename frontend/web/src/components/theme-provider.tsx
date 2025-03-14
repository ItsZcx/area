"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {

    const [mounted, setMounted] = React.useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <React.Fragment>{children}</React.Fragment>

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

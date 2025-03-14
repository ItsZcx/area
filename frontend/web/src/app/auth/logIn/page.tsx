"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import LoginForm from "./components/LoginForm";
import withGuest from "@/lib/withGuest";

function LoginPage() {

    return (
        <div className="flex items-center h-full justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Login</CardTitle>
                    <CardDescription className="text-center">Choose your preferred login method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <LoginForm/>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )

}

export default withGuest(LoginPage)

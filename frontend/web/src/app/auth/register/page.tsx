"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import RegisterForm from "./components/RegisterForm";
import RegisteredDialog from "./components/RegisteredDialog";
import withGuest from "@/lib/withGuest";

function RegisterPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Create an account</CardTitle>
                        <CardDescription className="text-center">Choose your preferred login method</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RegisterForm onSuccess={() => setIsDialogOpen(true)} />
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/logIn" className="text-primary hover:underline">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
            <RegisteredDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
}

export default withGuest(RegisterPage);

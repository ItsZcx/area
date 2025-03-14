"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { setAuthToken } from "@/lib/authUtils";
import { useRouter } from "next/navigation";
import GithubAuth from "@/components/auth/GithubAuth";
import GoogleAuth from "@/components/auth/GoogleAuth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
})

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const url = apiUrl + "/auth/login";

        setError(null);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(values).toString(),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.detail);
                console.error(errorData);
                return;
            }
            const resData = await res.json();
            setAuthToken(resData.access_token);
            window.dispatchEvent(new Event('login'));
            router.push("/dashboard");
        } catch (err) {
            setError("An error occurred. Please try again later.");
            console.error(err);
        }
    }

    return (
        <>
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="username">Email</FormLabel>
                                <FormControl>
                                    <Input id="username" type="text" placeholder="JohnDoe77" {...field} />
                                </FormControl>
                                <FormDescription hidden>Enter your username</FormDescription>
                                <FormMessage hidden={!fieldState.isDirty} />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <FormControl>
                                    <Input id="password" type="password" placeholder="password" {...field} />
                                </FormControl>
                                <FormDescription hidden>Enter your password</FormDescription>
                                <FormMessage hidden={!fieldState.isDirty} />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Form>
            <Separator />
            <div className="flex justify-evenly space-x-3">
                <GoogleAuth onError={(errorMessage) => { setError(errorMessage) }}/>
                <GithubAuth onError={(errorMessage) => { setError(errorMessage) }}/>
            </div>
        </>
    )

}

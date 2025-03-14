"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import GoogleAuth from "@/components/auth/GoogleAuth";
import GithubAuth from "@/components/auth/GithubAuth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
    first_name: z.string().min(2, "Name must contain at least 2 characters").max(64, "Name must contain at most 64 characters"),
    last_name: z.string().min(2, "Last name must contain at least 2 characters").max(64, "Last name must contain at most 64 characters"),
    username: z.string().min(2, "Username must contain at least 2 characters").max(64, "Username must contain at most 64 characters"),
    email: z.string().email(),
    password: z.string().min(6, "Password must contain at least 6 characters").max(64, "Password must contain at most 64 characters"),
    passwordConfirmation: z.string().min(6, "Password must contain at least 6 characters").max(64, "Password must contain at most 64 characters"),
});

interface RegisterFormProps {
    onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {

    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
            passwordConfirmation: "",
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const url = apiUrl + "/auth/register";
        const { passwordConfirmation, ...data } = values;

        setError(null);

        if (values.password !== passwordConfirmation) {
            form.setError("passwordConfirmation", {
                type: "manual",
                message: "Passwords do not match"
            });
            return;
        }

        const finalData = { ...data, role: "user" };
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(finalData)
            });
            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.detail === "Username already exists") {
                    form.setError("username", {
                        type: "manual",
                        message: "Username already exists"
                    });
                    return;
                }
                if (errorData.detail === "Email already in use") {
                    form.setError("email", {
                        type: "manual",
                        message: "Email already exists"
                    });
                    return;
                }
                setError(errorData.detail);
                console.error(errorData);
                return;
            }
            onSuccess();
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
                    <div className="flex space-x-3">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel htmlFor="first_name">First Name</FormLabel>
                                    <FormControl>
                                        <Input id="first_name" type="text" placeholder="John"{...field} />
                                    </FormControl>
                                    <FormDescription hidden >Enter your first name</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel htmlFor="last_name">Last Name</FormLabel>
                                    <FormControl>
                                        <Input id="last_name" type="text" placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormDescription hidden >Enter your last name</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="username">Username</FormLabel>
                                <FormControl>
                                    <Input id="username" type="text" placeholder="JohnDoe77" {...field} />
                                </FormControl>
                                <FormDescription hidden >Enter a username</FormDescription>
                                <FormMessage hidden={!fieldState.isDirty} />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <FormControl>
                                    <Input id="email" type="email" placeholder="m@example.com" {...field} />
                                </FormControl>
                                <FormDescription hidden >Enter your email</FormDescription>
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
                                <FormDescription hidden >Enter a password</FormDescription>
                                <FormMessage hidden={!fieldState.isDirty} />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passwordConfirmation"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor="passwordConfirmation">Confirm Password</FormLabel>
                                <FormControl>
                                    <Input id="passwordConfirmation" type="password" placeholder="password" {...field} />
                                </FormControl>
                                <FormDescription hidden >Repeat the password</FormDescription>
                                <FormMessage hidden={!fieldState.isDirty} />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Sign Up</Button>
                </form>
            </Form>
            <Separator />
            <div className="flex justify-evenly space-x-3">
                <GoogleAuth onError={(errorMessage) => { setError(errorMessage) }} />
                <GithubAuth onError={(errorMessage) => { setError(errorMessage) }} />
            </div>
        </>
    );
}

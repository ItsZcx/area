"use client";

import withAuth from "@/lib/withAuth";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    disabled: z.boolean(),
    username: z.string().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone_number: z.string().nullable(),
})

function ProfilePage() {
    const { user, setUser, loading, error: userError } = useUser();

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            disabled: false,
            username: "",
            first_name: "",
            last_name: "",
            email: "",
            phone_number: null,
        }
    });

    useEffect(() => {
        if (user) {
            form.reset({
                disabled: user.disabled ?? false,
                username: user.username ?? "",
                first_name: user.first_name ?? "",
                last_name: user.last_name ?? "",
                email: user.email ?? "",
                phone_number: user.phone_number ?? null,
            });
        }
    }, [user, form]);

    if (loading) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
                            <CardDescription>Loading profile information...</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="h-10 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (userError || !user) {
        return (
            <div className="text-center text-red-500 mt-10">
                Error loading user data
            </div>
        );
    }

    const updateUser = async (data: z.infer<typeof formSchema>) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorResponse = await res.json();
                setError(errorResponse.detail);
                return;
            }
            setUser((prevUser) => {
                if (!prevUser) return null;
                return {
                    ...prevUser,
                    ...data,
                    phone_number: data.phone_number ?? undefined
                };
            });
            setIsEditing(false);
        } catch (error) {
            setError("An error occurred. Please try again later.");
            console.error(error);
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
                        <CardDescription>View and edit your profile information</CardDescription>
                    </div>
                    <Button
                        variant={isEditing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Save' : 'Edit'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(updateUser)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Badge variant={user.disabled ? 'destructive' : 'default'}>
                                    {user.disabled ? 'Inactive' : 'Active'}
                                </Badge>
                                <FormField
                                    control={form.control}
                                    name="disabled"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={!field.value}
                                                        onCheckedChange={(checked) => field.onChange(!checked)}
                                                        disabled={!isEditing}
                                                    />
                                                </FormControl>
                                                <FormLabel htmlFor="status-switch">Active</FormLabel>
                                            </div>
                                            <FormDescription hidden>User status</FormDescription>
                                            <FormMessage hidden />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!isEditing} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!isEditing} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" disabled={!isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            disabled={!isEditing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="text-red-500 mt-2">
                                {error}
                            </div>
                        )}

                        {isEditing && (
                            <Button type="submit" className="w-full">
                                Save Changes
                            </Button>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default withAuth(ProfilePage);

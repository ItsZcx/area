import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Edit } from "lucide-react";
import { User } from "../page";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EditUserDialogProps {
    user?: User;
    isCreating?: boolean;
    onUpdate: (updatedUser: User) => void;
}

const formSchema = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    phone_number: z.string().min(9).nullable(),
    role: z.enum(["admin", "user"]),
    password: z.string().min(1).optional(),
    disabled: z.boolean()
})

const initialUser: User = {
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: null,
    role: "user",
    disabled: false
};

const EditUserDialog = ({ user = initialUser, isCreating = false, onUpdate }: EditUserDialogProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number || null,
            role: user.role,
            disabled: user.disabled
        }
    });

    const updateUser = async (data: z.infer<typeof formSchema>) => {
        if (!data.password) {
            delete data.password;
        }

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
            onUpdate({ ...data, id: user.id });
            setIsOpen(false);
        } catch (error) {
            setError("An error occurred. Please try again later.");
            console.error(error);
        }
    }

    const createUser = async (data: z.infer<typeof formSchema>) => {

        if (!data.password) {
            form.setError("password", {
                type: "manual",
                message: "Password is required"
            });
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const errorResponse = await res.json();
                switch (errorResponse.detail) {
                    case "Username already exists": {
                        form.setError("username", {
                            type: "manual",
                            message: "Username already exists"
                        });
                        return;
                    }
                    case "Email already in use": {
                        form.setError("email", {
                            type: "manual",
                            message: "Email already exists"
                        });
                        return;
                    }
                }
                setError(errorResponse.detail);
                return;
            }
            setIsOpen(false);
            // TODO get the new user id from the response
            // onUpdate(await res.json());
            onUpdate({ ...data, id: -1 });
        } catch (error) {
            setError("An error occurred. Please try again later.");
            console.error(error);
        }
    }

    const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
        setError(null);
        if (isCreating) {
            createUser(data);
        } else {
            updateUser(data);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {isCreating ? (
                    <Button>Create user</Button>
                ) : (
                    <Button variant="outline" size="icon">
                        <Edit size={16} />
                        <span className="sr-only">Edit user {user.username}</span>
                    </Button>
                )
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isCreating ? 'Create' : 'Edit'} user</DialogTitle>
                    <DialogDescription>
                        {isCreating ?
                            'Create a new user' :
                            'Edit user details and permissions'
                        }
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription hidden>Enter a username</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription hidden>Enter an email</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription hidden>Enter the first nameº</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription hidden>Enter the last name</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormDescription hidden>Enter a phone number</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <FormDescription hidden>Enter a username</FormDescription>
                                        <FormMessage hidden={!fieldState.isDirty} />
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Password {!isCreating && '(leave blank to keep current)'}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormDescription hidden>Enter a password</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="disabled"
                            render={({ field, fieldState }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Disabled
                                        </FormLabel>
                                        <FormDescription>
                                            This will prevent the user from logging in.
                                        </FormDescription>
                                    </div>
                                    <FormDescription hidden>Enter a password</FormDescription>
                                    <FormMessage hidden={!fieldState.isDirty} />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog;

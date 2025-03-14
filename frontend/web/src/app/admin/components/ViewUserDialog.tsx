import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Mail, Phone, Shield, User as UserIcon } from "lucide-react"
import { User } from "../page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { useAppLogo } from "@/hooks/useAppLogos"
import { useEffect, useState } from "react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface ViewUserDialogProps {
    user: User
}

export default function ViewUserDialog({ user }: ViewUserDialogProps) {

    const { getAppLogo } = useAppLogo();
    const connectedServices = ['github', 'google'];

    const [nbTasks, setNbTasks] = useState(0);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user)
                return;
            const url = `${apiUrl}/tasks/${user.id}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error('Failed to fetch tasks');
                    return;
                }
                const data = await res.json();
                setNbTasks(data.length);
            } catch (err) {
                console.error('Failed to fetch tasks', err);
            }
        };

        fetchTasks();
    }, [user]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details {user.username}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">User Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <h2 className="text-xl font-semibold">{`${user.first_name} ${user.last_name}`}</h2>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <Badge variant={user.disabled ? "destructive" : "default"} className="mt-2">
                            {user.disabled ? 'Disabled' : 'Active'}
                        </Badge>
                    </div>
                    <Separator />
                    <div className="grid gap-2">
                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>Email adress</TooltipContent>
                                </Tooltip>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>Phone number</TooltipContent>
                                </Tooltip>
                                <span>{user.phone_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>User role</TooltipContent>
                                </Tooltip>
                                <span>{user.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>User ID</TooltipContent>
                                </Tooltip>
                                <span>{user.id}</span>
                            </div>
                        </TooltipProvider>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-semibold mb-2">Connected Services</h3>
                        <TooltipProvider>
                            <div className="flex gap-2">
                                {connectedServices.map((service) => (
                                    <Tooltip key={service}>
                                        <TooltipTrigger asChild>
                                            <Image src={getAppLogo(service)} alt={service} width={24} height={24} />
                                        </TooltipTrigger>
                                        <TooltipContent>{service}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Tasks</h3>
                        <p className="text-sm text-muted-foreground">{nbTasks} active tasks</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
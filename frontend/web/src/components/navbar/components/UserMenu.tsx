import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { removeAuthToken } from "@/lib/authUtils";

export default function UserMenu() {
    const router = useRouter();

    function onLogout() {
        removeAuthToken();
        window.dispatchEvent(new Event('logout'));
        router.push("/");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
                    <AvatarFallback>XD</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="w-4 h-4 mr-2" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <Link href="#">
                        <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

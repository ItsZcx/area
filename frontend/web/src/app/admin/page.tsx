'use client'

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { withAuthAdmin } from "@/lib/withAuth";
import { Search } from "lucide-react";
import UserActions from "./components/UserActions";
import EditUserDialog from "./components/EditUserDialog";

export interface User {
    id: number;
    disabled: boolean;
    role: 'admin' | 'user';
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    password?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 10;

function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${apiUrl}/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getFullName = (user: User) => {
        return `${user.first_name} ${user.last_name}`.trim() || "N/A";
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getFullName(user).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const onDeleteUser = (userId: number) => {
        setUsers(users.filter((user) => user.id !== userId));
    }

    const onUpdateUser = (updatedUser: User) => {
        if (updatedUser.id == -1) {
            fetchUsers();
        } else {
            setUsers(users.map((user) => user.id === updatedUser.id ? updatedUser : user));
        }
    }

    return (
        <div className="pb-20">
            <h2 className="text-3xl font-bold mb-12">User management</h2>

            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2 ">
                    <Search size={20} className="text-gray-500" />
                    <label htmlFor="search-users" className="sr-only">Search users</label>
                    <Input
                        id="search-users"
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="mr-5">
                    <EditUserDialog isCreating onUpdate={onUpdateUser} />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Full name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{getFullName(user)}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.disabled ? 'destructive' : 'secondary'}>
                                    {user.disabled ? 'Disabled' : 'Active'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <UserActions onUpdate={onUpdateUser} onDelete={onDeleteUser} user={user} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination className="py-5">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            role="button"
                            onClick={() => setCurrentPage(currentPage - 1 < 1 ? 1 : currentPage - 1)}
                            className={currentPage === 1 ? "opacity-50 cursor-default" : ""}
                            aria-disabled={currentPage === 1}
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, index) => {
                        if (index + 1 === currentPage || index + 1 === currentPage - 1 || index + 1 === currentPage + 1 || index + 1 === 1 || index + 1 === totalPages) {
                            return (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        role="button"
                                        onClick={() => setCurrentPage(index + 1)}
                                        isActive={currentPage === index + 1}
                                        aria-current={currentPage === index + 1 ? "page" : undefined}
                                    >{index + 1}</PaginationLink>
                                </PaginationItem>
                            );
                        } else if (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) {
                            return <PaginationItem key={index}>...</PaginationItem>;
                        } else {
                            return null;
                        }
                    })}

                    <PaginationItem>
                        <PaginationNext
                            role="button"
                            onClick={() => setCurrentPage(currentPage + 1 > totalPages ? totalPages : currentPage + 1)}
                            className={currentPage === totalPages ? "opacity-50 cursor-default" : ""}
                            aria-disabled={currentPage === totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default withAuthAdmin(AdminPage);

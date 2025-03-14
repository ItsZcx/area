import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User } from "../page";
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface DeleteUserDialogProps {
    user: User;
    onDelete: (userId: number) => void;
}

const DeleteUserDialog = ({ user, onDelete }: DeleteUserDialogProps) => {

    const { user: currentUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const onConfirmDelete = async (userId: number) => {
        try {
            const res = await fetch(`${apiUrl}/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                throw new Error("Failed to delete user");
            }
            setIsOpen(false);
            onDelete(userId);
            if (currentUser?.id === userId) {
                window.location.href = "/login";
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-red-600">
                    <Trash2 size={16} />
                    <span className='sr-only'>Delete user {user.username}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete user</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete user {user.username}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirmDelete(user.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteUserDialog;

"use client"

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";

interface RegisteredDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function RegisteredDialog({ isOpen, onOpenChange }: RegisteredDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Account Created!</AlertDialogTitle>
                    <AlertDialogDescription>Your account has been created successfully. Please log in.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction asChild>
                        <Link href="/auth/logIn">Login</Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

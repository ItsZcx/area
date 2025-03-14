'use client';

import { useCallback, useEffect, useState } from "react";
import { ThemePicker } from "../theme-button";
import Link from "next/link";
import useAuthStatus from "@/hooks/useAuthStatus";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react"; // Icons for the hamburger menu
import DesktopMenu from "./components/DesktopMenu";
import UserMenu from "./components/UserMenu";
import MobileMenu from "./components/MobileMenu";
import { useUser } from "@/hooks/useUser";

export default function Navbar() {
    const [showNavbar, setShowNavbar] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const isLogged = useAuthStatus();
    const { user } = useUser();

    const [navItems, setNavItems] = useState([
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Services', href: '/services' },
        { title: 'Pricing', href: '/pricing' },
        { title: 'Create', href: '/editor/new' }
    ]);

    const controlNavbar = useCallback(() => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);
        }
    }, [lastScrollY]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);

            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [controlNavbar]);

    useEffect(() => {
        if (user?.role === 'admin') {
            setNavItems((prev) => [...prev, { title: 'Admin', href: '/admin' }]);
        } else {
            setNavItems((prev) => prev.filter((item) => item.title !== 'Admin'));
        }
        setLoading(false);
    }, [user?.role]);

    if (loading) {
        return null;
    }

    return (
        <div className={`fixed top-0 left-0 w-full h-16 bg-inherit shadow-md transition-transform duration-300 ${showNavbar ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
            <div className="container mx-auto my-3 flex items-center justify-between px-4">
                <Link href="/" className="mr-10">
                    <h1 className="text-2xl font-bold">AREA</h1>
                </Link>
                <DesktopMenu navItems={navItems} isLogged={isLogged} />
                <div className="flex space-x-4">
                    <ThemePicker />
                    {isLogged ? (
                        <>
                            <UserMenu />
                            <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="secondary">
                                <Link href="/auth/logIn">Login</Link>
                            </Button><Button asChild>
                                <Link href="/auth/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <MobileMenu navItems={navItems} isMobileMenuOpen={isMobileMenuOpen} isLogged={isLogged} />
        </div>
    );
}

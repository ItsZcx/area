import { navigationMenuTriggerStyle, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";

type NavItemProps = {
    title: string;
    href: string;
};

export default function NavItem({ title, href }: NavItemProps) {
    const pathname = usePathname();
    return (
        <NavigationMenuItem>
            <NavigationMenuLink
                href={href}
                active={pathname === href}
                className={navigationMenuTriggerStyle()}
            >
                {title}
            </NavigationMenuLink>
        </NavigationMenuItem>
    );
}

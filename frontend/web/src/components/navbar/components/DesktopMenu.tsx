import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import NavItem from "./NavItem";

type DesktopMenuProps = {
    navItems: { title: string; href: string }[];
    isLogged: boolean;
};

export default function DesktopMenu({ navItems, isLogged }: DesktopMenuProps) {
    if (!isLogged) return null;

    return (
        <NavigationMenu className="hidden md:flex items-center justify-between">
            <NavigationMenuList className="flex space-x-4">
                {navItems.map((item, index) => (
                    <NavItem key={index} title={item.title} href={item.href} />
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

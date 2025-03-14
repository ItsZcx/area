import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import NavItem from "./NavItem";

type MobileMenuProps = {
    navItems: { title: string; href: string }[];
    isMobileMenuOpen: boolean;
    isLogged: boolean;
};

export default function MobileMenu({ navItems, isMobileMenuOpen, isLogged }: MobileMenuProps) {
    if (!isLogged || !isMobileMenuOpen) return null;

    return (
        <NavigationMenu className="md:hidden bg-inherit shadow-md">
            <NavigationMenuList className="flex flex-col space-y-2 p-4">
                {navItems.map((item, index) => (
                    <NavItem key={index} title={item.title} href={item.href} />
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

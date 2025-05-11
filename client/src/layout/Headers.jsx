import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/features/ModeToggle";
import { useAuth } from "@/contexts/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

export const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderDesktopNav = () => (
    <>
      {!user?.isAdmin && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/my-section" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  My Section
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/payments/history" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Payment History
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
      {/* Navigation menu for all users (both admin and non-admin) */}
      <NavigationMenu>
        <NavigationMenuList className="list-none">
          <NavigationMenuItem>
            <Link to="/death-reports" onClick={closeMobileMenu}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Death Reports
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {user?.isAdmin && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/admin" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Admin Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/admin/pendingReports" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Review Reports
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/communities" onClick={closeMobileMenu}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Communities
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </>
  );

  const renderMobileNav = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 pt-6">
          <NavigationMenu>
            <NavigationMenuList className="flex flex-col gap-6 pt-6">
              {!user?.isAdmin && (
                <>
                  <NavigationMenuItem>
                    <Link to="/dashboard" onClick={closeMobileMenu}>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/my-section" onClick={closeMobileMenu}>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        My Section
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/death-reports" onClick={closeMobileMenu}>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Death Reports
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/payments/history" onClick={closeMobileMenu}>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        Payment History
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}

              {user?.isAdmin && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">
                      Admin
                    </h3>
                    <NavigationMenuItem>
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="text-lg font-medium transition-colors hover:text-primary block mb-3"
                      >
                        Admin Dashboard
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link
                        to="/death-reports"
                        onClick={closeMobileMenu}
                        className="text-lg font-medium transition-colors hover:text-primary block mb-3"
                      >
                        Death Reports
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link
                        to="/admin/pendingReports"
                        onClick={closeMobileMenu}
                        className="text-lg font-medium transition-colors hover:text-primary block"
                      >
                        Review Reports
                      </Link>
                    </NavigationMenuItem>
                  </div>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="font-bold text-lg">
            Community Funeral Aid
          </Link>

          {user && <>{isDesktop ? renderDesktopNav() : renderMobileNav()}</>}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/avatars/default.png"
                      alt={user?.firstName}
                    />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" onClick={closeMobileMenu}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/register">Register</Link>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[200px]">
                  <div className="flex flex-col gap-4 pt-6">
                    <Button asChild variant="outline">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register">Register</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

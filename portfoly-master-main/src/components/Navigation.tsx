import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  Home, 
  BarChart, 
  Trophy, 
  FolderOpen, 
  Users,
  ChevronDown,
  LogOut,
  BookOpen,
  Compass,
  Menu,
  User,
  Settings,
  Sun,
  Moon,
  ListOrdered,
  Flag
} from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getNavItems = () => {
    if (!profile) return [];
    
    if (profile.role === 'student') {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: BarChart },
        { path: "/compete", label: "Compete", icon: Flag },
        { path: "/achievements", label: "Achievements", icon: Trophy },
        { path: "/academic-results", label: "Academic Results", icon: BookOpen },
        { path: "/career-guidance", label: "Career Guidance", icon: Compass },
        { path: "/portfolio", label: "Portfolio", icon: FolderOpen },
      ];
    } else {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/faculty", label: "Faculty Panel", icon: Users },
      ];
    }
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={mobile ? () => setMobileMenuOpen(false) : undefined}
          >
            <Button
              variant={location.pathname === item.path ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${mobile ? 'w-full justify-start' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  if (!user || !profile) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Team Pinnacle</span>
            <span className="font-bold text-lg sm:hidden">SSH</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-6">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {profile.role === 'student' && (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Score: 85
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
              <DropdownMenuItem asChild>
                <Link to="/leaderboard" className="cursor-pointer">
                  <ListOrdered className="mr-2 h-4 w-4" />
                  Leaderboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
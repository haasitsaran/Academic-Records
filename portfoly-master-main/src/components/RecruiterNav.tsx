import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Home, Users } from "lucide-react";

export const RecruiterNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/recruiter", label: "Recruiter Panel", icon: Users },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Team Pinnacle</span>
          </Link>

          <div className="flex items-center space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Sign Out</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RecruiterNav;



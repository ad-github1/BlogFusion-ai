import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PenSquare, Moon, Sun, LogOut, User, BookOpen } from 'lucide-react';

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-3 py-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">BlogFusion</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/explore" data-testid="link-explore">
            <span className={`cursor-pointer hover:text-foreground transition-colors ${location === '/explore' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Explore
            </span>
          </Link>
          {user && (
            <Link href="/dashboard" data-testid="link-dashboard">
              <span className={`cursor-pointer hover:text-foreground transition-colors ${location === '/dashboard' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Dashboard
              </span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {user ? (
            <>
              <Link href="/write" data-testid="link-write">
                <Button className="hidden sm:flex gap-2">
                  <PenSquare className="h-4 w-4" />
                  Write
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-testid="button-user-menu">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/dashboard')} data-testid="menu-dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" data-testid="link-login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register" data-testid="link-register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

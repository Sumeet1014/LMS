import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Users, BookOpen, Trophy, Mail, GraduationCap, Moon, Sun, ArrowLeft } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about', icon: <Users className="w-4 h-4" /> },
    { label: 'How It Works', href: '#projects', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Subjects', href: '#skills', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Join Now', href: '#contact', icon: <Mail className="w-4 h-4" /> },
  ];

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border/50' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between h-16">
          {/* Back Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-primary)' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Learning Management System
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <Button className="btn-primary ml-2">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50">
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="pt-2 space-y-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-left text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-300"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Button className="btn-primary w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
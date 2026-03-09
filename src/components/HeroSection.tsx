import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, TrendingUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Beautiful gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        {/* Professional floating bubbles */}
        <div className="floating-bubbles"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="space-y-16">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-scaleIn">
            <div className="p-4 rounded-full shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-heading text-foreground dark:text-foreground font-black">
              Study Circle
            </h1>
          </div>

          {/* Main Content */}
          <div className="space-y-8 animate-slideInUp">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground dark:text-foreground leading-tight">
              Connect. Learn. <br />
              <span className="text-magic animate-gradient-shift">
                Excel Together.
              </span>
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground dark:text-muted-foreground max-w-5xl mx-auto leading-relaxed font-medium">
              Peer-to-peer study sessions that help college students learn faster with accountability and clarity.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slideInUp">
            <Button className="btn-primary" onClick={handleGetStarted}>
              {user ? 'Go to Dashboard' : 'Join Study Circle'}
            </Button>
            <Button className="btn-outline" onClick={scrollToAbout}>
              Learn More
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 animate-slideInUp">
            <div className="card-clean p-10 text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-500">
                  <Users className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-5xl font-black text-foreground dark:text-foreground mb-3 text-magic">18+</h3>
              <p className="text-muted-foreground dark:text-muted-foreground font-bold text-lg">Learners Onboarded</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 opacity-80">Growing every week</p>
            </div>
            
            <div className="card-clean p-10 text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 rounded-full bg-gradient-to-r from-secondary/20 to-accent/20 group-hover:from-secondary/30 group-hover:to-accent/30 transition-all duration-500">
                  <BookOpen className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-5xl font-black text-foreground dark:text-foreground mb-3 text-magic">12</h3>
              <p className="text-muted-foreground dark:text-muted-foreground font-bold text-lg">Study Sessions Completed</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 opacity-80">Active learning</p>
            </div>
            
            <div className="card-clean p-10 text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 rounded-full bg-gradient-to-r from-accent/20 to-success/20 group-hover:from-accent/30 group-hover:to-success/30 transition-all duration-500">
                  <TrendingUp className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-5xl font-black text-foreground dark:text-foreground mb-3 text-magic">4</h3>
              <p className="text-muted-foreground dark:text-muted-foreground font-bold text-lg">Subjects Open</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 opacity-80">C, Python, DS, Math</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div 
            className="flex flex-col items-center gap-3 cursor-pointer group mt-20 animate-slideInUp"
            onClick={scrollToAbout}
          >
            <span className="text-lg text-muted-foreground dark:text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-all duration-300 font-semibold">Discover How It Works</span>
            <ArrowDown className="w-6 h-6 text-primary dark:text-primary animate-bounce group-hover:scale-125 group-hover:text-secondary transition-all duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
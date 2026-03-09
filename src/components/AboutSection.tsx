import { Users, BookOpen, Trophy, Clock, Globe, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

const AboutSection = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Find Study Partners",
      description: "Connect with fellow students who share your academic interests and goals",
      gradient: "from-primary to-secondary"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Expert Mentors",
      description: "Learn from senior students and subject experts who've mastered the topics",
      gradient: "from-secondary to-accent"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Scheduling",
      description: "Book study sessions that fit your schedule, anytime, anywhere",
      gradient: "from-accent to-success"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Achievement System",
      description: "Earn points, badges, and recognition for your learning progress",
      gradient: "from-success to-primary"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Community",
      description: "Join a worldwide network of students committed to academic excellence",
      gradient: "from-primary to-accent"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Supportive Environment",
      description: "Learn in a safe, encouraging space where questions are always welcome",
      gradient: "from-secondary to-success"
    }
  ];

  return (
    <section id="about" className="py-32 relative overflow-hidden" style={{ background: 'var(--gradient-bg)' }}>
      {/* Floating decoration */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl animate-float-bubbles"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-accent/10 to-success/10 rounded-full blur-2xl animate-float-bubbles" style={{ animationDelay: '-5s' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 animate-slideInUp">
          <h2 className="text-4xl md:text-6xl font-black text-foreground dark:text-foreground mb-8">
            Why <span className="text-magic">Study Circle?</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            We believe that the best learning happens when students support each other. 
            Our platform connects you with the perfect study partner through accountability, 
            focused sessions, and friendly mentorship.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slideInUp">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-clean p-8 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-all duration-500 shadow-md`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground dark:text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-slideInUp">
          <div className="text-center group">
            <div className="text-4xl font-black text-magic mb-3 group-hover:scale-110 transition-transform">18+</div>
            <div className="text-muted-foreground dark:text-muted-foreground font-semibold">Active Students</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-black text-magic mb-3 group-hover:scale-110 transition-transform">12</div>
            <div className="text-muted-foreground dark:text-muted-foreground font-semibold">Sessions Completed</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-black text-magic mb-3 group-hover:scale-110 transition-transform">4</div>
            <div className="text-muted-foreground dark:text-muted-foreground font-semibold">Subjects Open</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-black text-magic mb-3 group-hover:scale-110 transition-transform">24/7</div>
            <div className="text-muted-foreground dark:text-muted-foreground font-semibold">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
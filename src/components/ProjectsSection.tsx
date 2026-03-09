import { Search, Calendar, Star, Users, BookOpen, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      description: "Sign up and tell us what you want to learn or teach. Add your skills, interests, and availability to help us find your perfect study match.",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-electric-blue to-neon-purple",
      features: ["Skills Assessment", "Learning Goals", "Schedule Setup"]
    },
    {
      step: "02", 
      title: "Find Study Partners",
      description: "Browse through our community of learners and mentors. Use smart filters to find students who match your learning style and academic needs.",
      icon: <Search className="w-8 h-8" />,
      gradient: "from-neon-purple to-neon-magenta",
      features: ["Smart Matching", "Skill Filters", "Availability Check"]
    },
    {
      step: "03",
      title: "Book Sessions",
      description: "Schedule study sessions that work for both you and your study partner. Our integrated calendar system makes coordination seamless.",
      icon: <Calendar className="w-8 h-8" />,
      gradient: "from-neon-magenta to-soft-orange",
      features: ["Calendar Integration", "Reminder System", "Flexible Timing"]
    },
    {
      step: "04",
      title: "Learn & Grow",
      description: "Attend your study sessions, collaborate on projects, and track your progress. Rate your experience and earn points for active participation.",
      icon: <Star className="w-8 h-8" />,
      gradient: "from-soft-orange to-electric-blue",
      features: ["Progress Tracking", "Achievement System", "Community Rating"]
    }
  ];

  return (
    <section id="projects" className="py-32 relative overflow-hidden" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 animate-slideInUp">
          <h2 className="text-4xl md:text-6xl font-black text-foreground dark:text-foreground mb-8">
            How It <span className="text-magic">Works</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            Getting started is simple. Join → Get matched → Study together with voice and notes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {steps.map((stepData, index) => (
            <Card 
              key={stepData.step}
              className="card-glow group cursor-pointer overflow-hidden relative p-8"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Header */}
              <div className={`h-20 bg-gradient-to-br ${stepData.gradient} relative overflow-hidden rounded-lg mb-6`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="text-white/90 font-bold text-sm bg-black/20 px-2 py-1 rounded">
                    STEP {stepData.step}
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 text-white">
                  {stepData.icon}
                </div>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-float" />
                </div>
              </div>

              {/* Step Content */}
              <div>
                <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-4">
                  {stepData.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {stepData.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {stepData.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stepData.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-lg`} />
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="card-glow p-8 neon-border bg-gradient-to-br from-card to-muted/50">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-electric bg-clip-text text-transparent">
                Why Choose Study Circle?
              </span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a community that's transforming how students learn together
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-lg bg-gradient-electric shadow-glow-blue mb-4">
                <BookOpen className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Personalized Learning</h4>
              <p className="text-muted-foreground text-sm">
                AI-powered matching connects you with the perfect study partners based on your learning style and goals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-lg bg-gradient-to-br from-neon-purple to-neon-magenta shadow-glow-purple mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Global Community</h4>
              <p className="text-muted-foreground text-sm">
                Connect with students from around the world and gain diverse perspectives on your subjects.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-lg bg-gradient-to-br from-neon-magenta to-soft-orange shadow-glow-magenta mb-4">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Track Progress</h4>
              <p className="text-muted-foreground text-sm">
                Earn points, unlock achievements, and see your learning journey unfold with detailed analytics.
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button className="btn-glow">
            <Users className="w-4 h-4 mr-2" />
            Start Your Learning Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
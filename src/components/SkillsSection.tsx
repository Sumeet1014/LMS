import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, Calculator, Code, Palette, Globe, 
  Brain, Microscope, Music, Beaker, Users, Trophy, Computer
} from 'lucide-react';

interface Subject {
  name: string;
  mentors: number;
  students: number;
  category: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const SubjectsSection = () => {
  const [visibleSubjects, setVisibleSubjects] = useState<boolean[]>([]);

  const subjects: Subject[] = [
    // Engineering & Computer Science
    { name: "Data Structures & Algorithms", mentors: 45, students: 320, category: "Computer Science", icon: <Code className="w-5 h-5" />, color: "electric-blue", difficulty: "Intermediate" },
    { name: "Machine Learning", mentors: 32, students: 180, category: "Computer Science", icon: <Brain className="w-5 h-5" />, color: "neon-purple", difficulty: "Advanced" },
    { name: "Web Development", mentors: 58, students: 420, category: "Computer Science", icon: <Globe className="w-5 h-5" />, color: "neon-magenta", difficulty: "Beginner" },
    { name: "Database Management", mentors: 28, students: 150, category: "Computer Science", icon: <Computer className="w-5 h-5" />, color: "soft-orange", difficulty: "Intermediate" },
    
    // Mathematics & Sciences
    { name: "Calculus", mentors: 40, students: 250, category: "Mathematics", icon: <Calculator className="w-5 h-5" />, color: "electric-blue", difficulty: "Intermediate" },
    { name: "Linear Algebra", mentors: 25, students: 140, category: "Mathematics", icon: <Calculator className="w-5 h-5" />, color: "neon-purple", difficulty: "Advanced" },
    { name: "Physics", mentors: 35, students: 200, category: "Science", icon: <Beaker className="w-5 h-5" />, color: "neon-magenta", difficulty: "Intermediate" },
    { name: "Chemistry", mentors: 30, students: 180, category: "Science", icon: <Microscope className="w-5 h-5" />, color: "soft-orange", difficulty: "Beginner" },
    
    // Languages & Arts
    { name: "English Literature", mentors: 22, students: 160, category: "Languages", icon: <BookOpen className="w-5 h-5" />, color: "electric-blue", difficulty: "Intermediate" },
    { name: "Creative Writing", mentors: 18, students: 120, category: "Languages", icon: <Palette className="w-5 h-5" />, color: "neon-purple", difficulty: "Beginner" },
    { name: "Digital Design", mentors: 26, students: 140, category: "Arts", icon: <Palette className="w-5 h-5" />, color: "neon-magenta", difficulty: "Intermediate" },
    { name: "Music Theory", mentors: 15, students: 80, category: "Arts", icon: <Music className="w-5 h-5" />, color: "soft-orange", difficulty: "Beginner" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSubjects(new Array(subjects.length).fill(true));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const categories = Array.from(new Set(subjects.map(subject => subject.category)));

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'electric-blue': return { bg: 'bg-electric-blue', text: 'text-electric-blue', shadow: 'shadow-glow-blue' };
      case 'neon-purple': return { bg: 'bg-neon-purple', text: 'text-neon-purple', shadow: 'shadow-glow-purple' };
      case 'neon-magenta': return { bg: 'bg-neon-magenta', text: 'text-neon-magenta', shadow: 'shadow-glow-magenta' };
      case 'soft-orange': return { bg: 'bg-soft-orange', text: 'text-soft-orange', shadow: 'shadow-glow-orange' };
      default: return { bg: 'bg-primary', text: 'text-primary', shadow: 'shadow-glow-blue' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-neon-purple bg-neon-purple/10';
      case 'Intermediate': return 'text-soft-orange bg-soft-orange/10';
      case 'Advanced': return 'text-neon-magenta bg-neon-magenta/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <section id="skills" className="py-32 relative overflow-hidden" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 animate-slideInUp">
          <h2 className="text-4xl md:text-6xl font-black text-foreground dark:text-foreground mb-8">
            Available <span className="text-magic">Subjects</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            Our growing library covers programming, mathematics, data science, and communication skills 
            with expert mentors ready to help.
          </p>
        </div>

        {/* Subjects by Category */}
        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div key={category} className="animate-fadeIn" style={{ animationDelay: `${categoryIndex * 0.2}s` }}>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="bg-gradient-electric bg-clip-text text-transparent">
                  {category}
                </span>
                {category === 'Computer Science' && <Computer className="w-6 h-6 text-electric-blue" />}
                {category === 'Mathematics' && <Calculator className="w-6 h-6 text-neon-purple" />}
                {category === 'Science' && <Beaker className="w-6 h-6 text-neon-magenta" />}
                {category === 'Languages' && <BookOpen className="w-6 h-6 text-soft-orange" />}
                {category === 'Arts' && <Palette className="w-6 h-6 text-electric-blue" />}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects
                  .filter(subject => subject.category === category)
                  .map((subject, index) => {
                    const colors = getColorClasses(subject.color);
                    
                    return (
                      <Card key={subject.name} className="card-white p-4 group hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${colors.bg} ${colors.shadow} group-hover:scale-110 transition-transform`}>
                            <div className="text-black">
                              {subject.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-card-white-foreground">{subject.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(subject.difficulty)}`}>
                                {subject.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subject Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border-white">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${colors.text}`}>{subject.mentors}</div>
                            <div className="text-xs text-muted-white-foreground">Mentors</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${colors.text}`}>{subject.students}</div>
                            <div className="text-xs text-muted-white-foreground">Students</div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Popular Subjects Highlight */}
        <Card className="card-white p-8 mt-16 white-border bg-gradient-to-br from-card-white to-muted-white/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-soft-orange" />
              <h3 className="text-2xl font-semibold bg-gradient-warm bg-clip-text text-transparent">
                Most Popular This Month
              </h3>
              <Trophy className="w-8 h-8 text-soft-orange" />
            </div>
            <p className="text-muted-white-foreground leading-relaxed max-w-3xl mx-auto mb-8">
              These subjects are trending among our community this month. Join the conversation 
              and connect with students who are passionate about these topics.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-electric-blue mb-2">Web Dev</div>
                <div className="text-sm text-muted-white-foreground">420+ Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-purple mb-2">Data Structures</div>
                <div className="text-sm text-muted-white-foreground">320+ Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-magenta mb-2">Calculus</div>
                <div className="text-sm text-muted-white-foreground">250+ Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-soft-orange mb-2">Physics</div>
                <div className="text-sm text-muted-white-foreground">200+ Students</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SubjectsSection;
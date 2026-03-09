import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    year: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden" style={{ background: 'var(--gradient-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 animate-slideInUp">
          <h2 className="text-4xl md:text-6xl font-black text-foreground dark:text-foreground mb-8">
            Join <span className="text-magic">Study Circle</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            Ready to transform your learning experience? Register now and connect with amazing study partners.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="card-clean p-8">
            <h3 className="text-subheading mb-6 text-foreground">Student Registration</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@college.edu"
                    required
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Course/Branch
                  </label>
                  <Input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g., B.Tech CSE"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Year of Study
                  </label>
                  <Input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2nd Year"
                    required
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tell us about your interests and what you'd like to learn
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="I'm interested in programming, data structures, and would love to find study partners for..."
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <Button type="submit" className="btn-primary w-full">
                <Send className="w-4 h-4 mr-2" />
                Join Study Circle
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="card-clean p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-subheading text-foreground">Why Join Study Circle?</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Accountability</h4>
                    <p className="text-muted-foreground text-sm">Stay motivated with study partners who keep you on track</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Focused Sessions</h4>
                    <p className="text-muted-foreground text-sm">Structured study sessions with clear goals and outcomes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Friendly Mentors</h4>
                    <p className="text-muted-foreground text-sm">Learn from student mentors who understand your challenges</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="card-clean p-8">
              <h3 className="text-subheading mb-6 text-foreground">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a 
                    href="mailto:studycircleteam2@gmail.com" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    studycircleteam2@gmail.com
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Pune, Maharashtra</span>
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    For support or queries about Study Circle, email us at the address above.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">Study Circle</span>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">
              Connecting students worldwide through peer-to-peer learning and collaborative study sessions.
            </p>
            <p className="text-white/70 text-sm">
              © 2025 Study Circle • studycircleteam2@gmail.com
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/70">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#skills" className="hover:text-white transition-colors">Subjects</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Join Now</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:studycircleteam2@gmail.com" 
                  className="hover:text-white transition-colors"
                >
                  studycircleteam2@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Pune, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/70 text-sm">
            Built with ❤️ for students, by students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
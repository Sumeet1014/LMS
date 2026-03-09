import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-magic mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Guidelines for using the Study Circle platform
            </p>
          </div>

          <div className="space-y-6">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  Platform Purpose
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Study Circle is a peer-to-peer learning platform that connects students and mentors 
                  for collaborative study sessions. Our mission is to make quality education accessible 
                  through community-driven learning.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Our Services Include:</h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>• Matching students with suitable mentors and study partners</li>
                    <li>• Scheduling and managing study sessions</li>
                    <li>• Google Calendar integration with automatic Meet link generation</li>
                    <li>• Progress tracking and achievement badges</li>
                    <li>• Safe and secure communication platform</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-secondary" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">As a Study Circle member, you agree to:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Be Respectful:</strong> Treat all community members with respect and kindness</li>
                  <li>• <strong>Attend Scheduled Sessions:</strong> Show up on time or notify participants in advance</li>
                  <li>• <strong>Provide Accurate Information:</strong> Keep your profile and availability up-to-date</li>
                  <li>• <strong>Follow Community Guidelines:</strong> Maintain a positive learning environment</li>
                  <li>• <strong>Protect Privacy:</strong> Respect the confidentiality of other users</li>
                  <li>• <strong>Use Platform Appropriately:</strong> Use Study Circle only for educational purposes</li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Quality Commitment:</strong> We encourage high-quality interactions. 
                    Users who consistently provide excellent mentoring may earn special recognition and badges.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-accent" />
                  Account & Data Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">Account Management</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• One account per person - authentic profiles only</li>
                  <li>• You're responsible for keeping your login credentials secure</li>
                  <li>• Notify us immediately if you suspect unauthorized access</li>
                  <li>• You can delete your account and data at any time</li>
                </ul>
                
                <h4 className="font-semibold mt-6">Google Calendar Integration</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Connecting Google Calendar is optional but recommended</li>
                  <li>• We only create events for your confirmed study sessions</li>
                  <li>• You can disconnect your calendar at any time</li>
                  <li>• Refresh tokens are encrypted and securely stored</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  Important Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Service Availability</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Study Circle is provided "as is" without warranties. While we strive for 99% uptime, 
                    we cannot guarantee uninterrupted service and are not liable for temporary outages.
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">Educational Content</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Study Circle facilitates peer-to-peer learning but does not guarantee the accuracy 
                    of educational content shared between users. Always verify important information 
                    with official sources.
                  </p>
                </div>
                
                <h4 className="font-semibold">Prohibited Activities</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Commercial promotion or spam</li>
                  <li>• Sharing inappropriate or harmful content</li>
                  <li>• Harassment or discriminatory behavior</li>
                  <li>• Cheating or academic dishonesty</li>
                  <li>• Impersonation or fake profiles</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold mb-3">Questions About These Terms?</h3>
                <p className="text-muted-foreground mb-4">
                  We're here to help clarify any questions about our terms of service.
                </p>
                <a 
                  href="mailto:studycircleteam2@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  studycircleteam2@gmail.com
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  Study Circle Team • Pune, Maharashtra, India
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                
                <div className="mt-6 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    By using Study Circle, you agree to these terms. 
                    We may update these terms periodically and will notify users of significant changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
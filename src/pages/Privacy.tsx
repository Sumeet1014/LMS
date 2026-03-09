import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="floating-bubbles" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-magic mb-4">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              How we protect and handle your information on Study Circle
            </p>
          </div>

          <div className="space-y-6">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Study Circle collects the following information to provide our peer-to-peer learning services:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Account Information:</strong> Email address, name, and profile details you provide</li>
                  <li>• <strong>Educational Data:</strong> Subjects you're learning/teaching, session history, and achievements</li>
                  <li>• <strong>Google Calendar:</strong> With your permission, we access your calendar to create study session events</li>
                  <li>• <strong>Session Data:</strong> Meeting details, ratings, and feedback for quality improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-secondary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Learning Platform:</strong> Connect you with suitable study partners and mentors</li>
                  <li>• <strong>Session Management:</strong> Schedule sessions, create calendar events, and generate Google Meet links</li>
                  <li>• <strong>Progress Tracking:</strong> Monitor your learning journey and achievements</li>
                  <li>• <strong>Communication:</strong> Send important updates about your sessions and account</li>
                  <li>• <strong>Platform Improvement:</strong> Analyze usage patterns to enhance our services</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-accent" />
                  Google Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When you connect your Google Calendar, we:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Create calendar events for your confirmed study sessions</li>
                  <li>• Generate Google Meet links for video sessions</li>
                  <li>• Send calendar invites to session participants</li>
                  <li>• Store encrypted refresh tokens securely to maintain the connection</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                  <strong>Note:</strong> We only access your calendar to create study session events. 
                  We do not read your existing calendar events or personal information.
                </p>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-success" />
                  Data Security & Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement strong security measures to protect your data:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• Google tokens are encrypted before storage</li>
                  <li>• Access controls limit who can view your information</li>
                  <li>• Regular security audits and updates</li>
                </ul>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Your Rights</h4>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Access and download your data</li>
                    <li>• Correct or update your information</li>
                    <li>• Delete your account and data</li>
                    <li>• Disconnect Google Calendar at any time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="card-clean">
              <CardContent className="text-center">
                <h3 className="text-lg font-semibold mb-3">Questions About Privacy?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact us for any privacy-related questions or concerns.
                </p>
                <a 
                  href="mailto:studycircleteam2@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  studycircleteam2@gmail.com
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  Located in Pune, Maharashtra, India
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Download, ExternalLink } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  score: number | null;
  created_at: string;
  share_token: string | null;
  challenge_id: string | null;
}

export default function BadgeDisplay({ userId }: { userId: string }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/certificates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading certificates...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((cert) => (
        <Card key={cert.id} className="hover:shadow-lg transition-shadow border-primary/20">
          <CardHeader className="pb-2">
            <div className="mx-auto p-3 rounded-full bg-primary/10">
              <Award className="w-10 h-10 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <CardTitle className="text-base">{cert.title}</CardTitle>
            {cert.score !== null && (
              <p className="text-sm text-muted-foreground">
                Score: <span className="font-semibold text-primary">{cert.score}/50</span>
              </p>
            )}
            <Badge variant="secondary" className="text-xs">
              {new Date(cert.created_at).toLocaleDateString()}
            </Badge>
            {cert.share_token && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`/certificate/${cert.share_token}`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Certificate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {certificates.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No certificates earned yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Complete quizzes with 60% or more to earn certificates!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

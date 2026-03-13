import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateData {
  id: string;
  title: string;
  score: number | null;
  created_at: string;
  user_id: string;
  challenge_id: string | null;
  share_token: string | null;
}

interface ProfileData {
  username: string | null;
}

export default function CertificateViewer() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [shareToken]);

  const fetchCertificate = async () => {
    if (!shareToken) {
      setError('Invalid certificate link');
      setLoading(false);
      return;
    }

    try {
      // Fetch certificate by share_token from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/certificates/shared/${shareToken}`);

      if (!response.ok) {
        setError('Certificate not found');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCertificate(data.certificate);
      setProfile({ username: data.certificate.username });
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Certificate link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Share',
        description: url,
      });
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="text-[#d4c9b7]">Loading certificate...</div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex flex-col items-center justify-center gap-4">
        <div className="text-[#d4c9b7] text-xl">{error || 'Certificate not found'}</div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const recipientName = profile?.username || 'Student';
  const dateString = new Date(certificate.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#0a0b10] py-8">
      {/* Controls - hidden when printing */}
      <div className="container mx-auto px-4 mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-[#d4c9b7]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="default" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="flex items-center justify-center px-4">
        <div
          className="w-full max-w-[980px] aspect-[1.4/1] relative"
          style={{
            background: 'linear-gradient(180deg, #0b1220 0%, #05060a 100%)',
            border: '14px solid #b08946',
            borderRadius: '6px',
            padding: '40px',
            fontFamily: 'Georgia, serif',
            color: '#f3e9d6',
          }}
        >
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#b08946]/50" />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-[#b08946]/50" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-[#b08946]/50" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#b08946]/50" />

          {/* Content */}
          <div className="h-full flex flex-col items-center justify-between py-4">
            {/* Header */}
            <div className="text-center">
              <h1
                className="text-4xl md:text-5xl font-bold tracking-wider mb-2"
                style={{ color: '#f3e1b8' }}
              >
                CERTIFICATE
              </h1>
              <p
                className="text-sm md:text-base uppercase tracking-[0.3em]"
                style={{ color: '#e5d7b5' }}
              >
                of Achievement
              </p>
            </div>

            {/* Main Content */}
            <div className="text-center flex-1 flex flex-col items-center justify-center gap-4 py-8">
              <p className="text-sm md:text-base" style={{ color: '#cfc19a' }}>
                This is to certify that
              </p>

              <h2
                className="text-2xl md:text-4xl font-bold uppercase tracking-wide"
                style={{ color: '#ffffff' }}
              >
                {recipientName}
              </h2>

              <p className="text-sm md:text-base" style={{ color: '#d9cfa6' }}>
                has successfully passed the
              </p>

              <h3
                className="text-xl md:text-2xl font-semibold"
                style={{ color: '#f3e1b8' }}
              >
                {certificate.title.replace(/ - .*$/, '')}
              </h3>

              {certificate.score !== null && (
                <div
                  className="mt-4 px-6 py-3 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(176, 137, 70, 0.3)'
                  }}
                >
                  <span className="text-sm" style={{ color: '#e6f7e8' }}>
                    Score: <strong>{certificate.score}/50</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full flex items-end justify-between">
              <div style={{ color: '#d0c4a8' }}>
                <p className="font-bold text-lg">Learning Management System</p>
                <p className="text-sm mt-1">Date: {dateString}</p>
              </div>

              <div className="flex items-center gap-6">
                {/* Seal */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    background: 'linear-gradient(180deg, #ecd2a8 0%, #c58c2f 100%)',
                    color: '#000',
                  }}
                >
                  SC
                </div>

                {/* Signature area */}
                <div className="text-center">
                  <div
                    className="w-32 md:w-40 h-0.5 mb-2"
                    style={{ background: 'rgba(176, 137, 70, 0.5)' }}
                  />
                  <p className="text-xs" style={{ color: '#cfc19a' }}>Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { 
            background: #0a0b10 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useVideoSignaling, SignalPayload } from '@/hooks/useVideoSignaling';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, PenTool, Monitor, MonitorOff } from 'lucide-react';
import RatingModal from '@/components/RatingModal';
import { useAuth } from '@/hooks/useAuth';
import Whiteboard from '@/components/Whiteboard';
import SessionChat from '@/components/SessionChat';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export default function VideoRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (searchParams.get('role') ?? 'student') as 'mentor' | 'student';
  const mentorId = searchParams.get('mentorId') || '';

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const handleSignal = useCallback(async (signal: SignalPayload) => {
    const pc = pcRef.current;
    if (!pc) {
      console.warn('PeerConnection not ready');
      return;
    }

    try {
      if (signal.type === 'offer' && role === 'student') {
        console.log('Student received offer');
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        
        for (const candidate of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current = [];
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: 'answer', data: answer });
      } else if (signal.type === 'answer' && role === 'mentor') {
        console.log('Mentor received answer');
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        
        for (const candidate of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current = [];
      } else if (signal.type === 'ice') {
        console.log('Received ICE candidate');
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data));
        } else {
          pendingCandidates.current.push(signal.data);
        }
      }
    } catch (err) {
      console.error('Error handling signal:', err);
    }
  }, [role]);

  const { sendSignal } = useVideoSignaling(roomId || '', handleSignal);

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    async function setupConnection() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        pc.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind);
          event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
          });
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal({ type: 'ice', data: event.candidate.toJSON() });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log('Connection state:', pc.connectionState);
          setConnectionState(pc.connectionState);
          setIsConnected(pc.connectionState === 'connected');
        };

        pc.oniceconnectionstatechange = () => {
          console.log('ICE state:', pc.iceConnectionState);
        };

        if (role === 'mentor') {
          console.log('Mentor creating offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal({ type: 'offer', data: offer });
        }

      } catch (err) {
        console.error('Setup error:', err);
      }
    }

    const timer = setTimeout(setupConnection, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, role, sendSignal]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);
  };

  // Screen sharing functions
  const startScreenShare = async () => {
    const pc = pcRef.current;
    if (!pc) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace camera track with screen track
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      // Update local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // When user stops sharing via browser UI
      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const stopScreenShare = async () => {
    const pc = pcRef.current;
    const localStream = localStreamRef.current;
    if (!pc || !localStream) return;

    try {
      const cameraTrack = localStream.getVideoTracks()[0];
      
      // Replace screen track with camera track
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }

      // Update local preview back to camera
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Stop screen stream
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;

      setIsScreenSharing(false);
    } catch (err) {
      console.error('Stop screen share error:', err);
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    
    // Show rating modal for students after call ends
    if (role === 'student' && roomId && mentorId && user?.id) {
      setShowRatingModal(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Video Session</h1>
          <p className="text-sm text-muted-foreground">
            Room: {roomId} • Role: {role} • Status: {connectionState}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showChat ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setShowChat(!showChat); setShowWhiteboard(false); }}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            variant={showWhiteboard ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setShowWhiteboard(!showWhiteboard); setShowChat(false); }}
          >
            <PenTool className="h-4 w-4 mr-1" />
            Whiteboard
          </Button>
          <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex gap-4">
        <div className={`flex gap-4 ${showChat || showWhiteboard ? 'flex-1' : 'w-full'}`}>
          <div className="flex-1 relative rounded-xl overflow-hidden bg-muted">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
              You ({role})
              {isScreenSharing && (
                <span className="text-green-500 text-xs">• Sharing Screen</span>
              )}
            </div>
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden bg-muted">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 rounded-lg text-sm">
              {role === 'mentor' ? 'Student' : 'Mentor'}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showWhiteboard) && roomId && (
          <div className="w-96 h-[calc(100vh-180px)]">
            {showChat && <SessionChat roomId={roomId} />}
            {showWhiteboard && <Whiteboard roomId={roomId} />}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border flex justify-center gap-4">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleMute}
          className="rounded-full w-14 h-14"
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button
          variant={isVideoOff ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-14 h-14"
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>
        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-14 h-14"
        >
          {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {showRatingModal && roomId && user?.id && mentorId && (
        <RatingModal
          sessionId={roomId}
          raterId={user.id}
          rateeId={mentorId}
          onClose={handleRatingClose}
          onSuccess={handleRatingClose}
        />
      )}
    </div>
  );
}

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
  { urls: 'stun:stun2.l.google.com:19302' },
  // Free TURN server for local testing
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

export default function VideoRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mentorId = searchParams.get('mentorId') || '';
  const sessionId = searchParams.get('sessionId') || roomId || '';
  const role: 'mentor' | 'student' = (mentorId && String(mentorId) === String(user?.id))
    ? 'mentor'
    : (searchParams.get('role') === 'mentor' && user?.role === 'mentor')
      ? 'mentor'
      : 'student';

  // Refs — stable across renders
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pendingSignals = useRef<SignalPayload[]>([]);
  const sendSignalRef = useRef<((s: SignalPayload) => void) | null>(null);
  const offerSentRef = useRef(false); // prevent duplicate offers
  const setupDoneRef = useRef(false); // prevent duplicate setup

  const [connectionState, setConnectionState] = useState('new');
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [remoteAudioBlocked, setRemoteAudioBlocked] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Process a signal — queue if PC not ready yet
  const processSignal = useCallback(async (signal: SignalPayload) => {
    const pc = pcRef.current;
    if (!pc) {
      pendingSignals.current.push(signal);
      return;
    }
    try {
      if (signal.type === 'offer' && role === 'student') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignalRef.current?.({ type: 'answer', data: answer });
      } else if (signal.type === 'answer' && role === 'mentor') {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        }
      } else if (signal.type === 'ice') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.data));
        } else {
          pendingSignals.current.push(signal);
        }
      }
    } catch (err) {
      console.error('Signal error:', err);
    }
  }, [role]);

  // Send offer (mentor only, called once when peer joins)
  const sendOffer = useCallback(async () => {
    if (role !== 'mentor' || offerSentRef.current) return;
    // Wait for PC to be ready
    let attempts = 0;
    while (!pcRef.current && attempts < 20) {
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }
    const pc = pcRef.current;
    if (!pc) return;
    offerSentRef.current = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalRef.current?.({ type: 'offer', data: offer });
    } catch (e) {
      offerSentRef.current = false;
      console.error('Offer failed:', e);
    }
  }, [role]);

  const { sendSignal } = useVideoSignaling(roomId || '', processSignal, sendOffer);

  useEffect(() => { sendSignalRef.current = sendSignal; }, [sendSignal]);

  // Setup WebRTC once
  useEffect(() => {
    if (!roomId || setupDoneRef.current) return;
    setupDoneRef.current = true;

    async function setup() {
      // Get media — try video+audio, then audio only, then no media
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      } catch {
        setAudioOnly(true);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          // No media available — still proceed with connection (screen share only)
          console.warn('No media devices, proceeding without media');
        }
      }

      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }

      // Always create PeerConnection regardless of media
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      if (stream) {
        stream.getTracks().forEach(t => pc.addTrack(t, stream!));
      }

      const remoteStream = new MediaStream();
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

      pc.ontrack = (e) => {
        console.log('Remote track received:', e.track.kind);
        e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
        // Force the video element to play with audio
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => {
            // Autoplay blocked — show unmute button
            setRemoteAudioBlocked(true);
          });
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignalRef.current?.({ type: 'ice', data: e.candidate.toJSON() });
      };

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState);
        setIsConnected(pc.connectionState === 'connected');
        if (pc.connectionState === 'failed') {
          // Try ICE restart
          pc.restartIce();
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce();
        }
      };

      // Process any queued signals that arrived before PC was ready
      const queued = [...pendingSignals.current];
      pendingSignals.current = [];
      for (const s of queued) await processSignal(s);
    }

    setup();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      setupDoneRef.current = false;
      offerSentRef.current = false;
    };
  }, [roomId]); // only roomId — stable

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(p => !p);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(p => !p);
  };

  const toggleScreenShare = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    if (isScreenSharing) {
      const cam = localStreamRef.current?.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender && cam) await sender.replaceTrack(cam);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screen;
        const track = screen.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(track);
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        track.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch (e) { console.error(e); }
    }
  };

  const endCall = async () => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());

    // Mark session as completed
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' })
      });

      // Clear chat and whiteboard for this room so next session starts fresh
      await fetch(`${import.meta.env.VITE_API_URL}/messages/video-chat/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetch(`${import.meta.env.VITE_API_URL}/messages/whiteboard/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.warn('Cleanup error:', e); }

    if (role === 'student' && mentorId) setShowRatingModal(true);
    else navigate(user?.role === 'mentor' ? '/mentor/dashboard' : '/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">🎥 Live Class</h1>
          <p className="text-xs text-gray-400">
            Room: {roomId} · You are: <span className={role === 'mentor' ? 'text-green-400' : 'text-blue-400'}>{role}</span> · {connectionState}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={showChat ? 'default' : 'outline'}
            className={showChat ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300'}
            onClick={() => { setShowChat(p => !p); setShowWhiteboard(false); }}>
            <MessageSquare className="h-4 w-4 mr-1" /> Chat
          </Button>
          <Button size="sm" variant={showWhiteboard ? 'default' : 'outline'}
            className={showWhiteboard ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border-gray-300'}
            onClick={() => { setShowWhiteboard(p => !p); setShowChat(false); }}>
            <PenTool className="h-4 w-4 mr-1" /> Whiteboard
          </Button>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {isConnected ? '● Connected' : '○ Connecting...'}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4 flex gap-4 min-h-0">
        <div className={`flex gap-4 ${showChat || showWhiteboard ? 'flex-1' : 'w-full'}`}>

          {/* Local */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-900">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {audioOnly && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <div className="text-5xl mb-3">🎤</div>
                <p className="text-sm text-gray-300">Audio Only</p>
                <p className="text-xs text-gray-500 mt-1">Camera busy in another tab</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs">
              You ({role}) {audioOnly && '· 🎤'}
            </div>
          </div>

          {/* Remote */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-900">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <div className="text-5xl mb-3">{role === 'mentor' ? '🎓' : '👨‍🏫'}</div>
                <p className="text-sm text-gray-300">{role === 'mentor' ? 'Student' : 'Mentor'}</p>
                <p className="text-xs text-gray-500 mt-1">Waiting to connect...</p>
              </div>
            )}
            {remoteAudioBlocked && isConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  onClick={() => {
                    remoteVideoRef.current?.play();
                    setRemoteAudioBlocked(false);
                  }}
                >
                  🔊 Click to Enable Audio
                </button>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs">
              {role === 'mentor' ? 'Student' : 'Mentor'} {isConnected && '● Live'}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showWhiteboard) && roomId && (
          <div className="w-80 flex flex-col bg-white rounded-xl overflow-hidden border border-gray-700">
            {showChat && <SessionChat roomId={roomId} />}
            {showWhiteboard && <Whiteboard roomId={roomId} />}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="py-4 border-t border-gray-800 flex justify-center gap-3">
        <Button variant={isMuted ? 'destructive' : 'secondary'} size="lg" onClick={toggleMute} className="rounded-full w-14 h-14">
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button variant={isVideoOff ? 'destructive' : 'secondary'} size="lg" onClick={toggleVideo} className="rounded-full w-14 h-14">
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        <Button variant={isScreenSharing ? 'default' : 'secondary'} size="lg" onClick={toggleScreenShare} className="rounded-full w-14 h-14">
          {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>
        <Button variant="destructive" size="lg" onClick={endCall} className="rounded-full w-14 h-14">
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {showRatingModal && user?.id && mentorId && (
        <RatingModal sessionId={sessionId} raterId={user.id} rateeId={mentorId}
          onClose={() => { setShowRatingModal(false); navigate('/student/dashboard'); }}
          onSuccess={() => { setShowRatingModal(false); navigate('/student/dashboard'); }}
        />
      )}
    </div>
  );
}

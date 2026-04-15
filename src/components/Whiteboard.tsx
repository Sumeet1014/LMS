import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

interface WhiteboardProps {
  roomId: string;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
}

export default function Whiteboard({ roomId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { user } = useAuth();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');

  const { emit, on, off } = useSocket(roomId);

  const colors = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899'];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

  // Load existing strokes
  useEffect(() => {
    async function loadStrokes() {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/whiteboard/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          (data.strokes || []).forEach((row: any) => {
            const stroke = typeof row.stroke_data === 'string' ? JSON.parse(row.stroke_data) : row.stroke_data;
            drawStroke(stroke);
          });
        }
      } catch (error) {
        console.error('Failed to load strokes:', error);
      }
    }
    loadStrokes();
  }, [roomId]);

  // Handle incoming socket events
  useEffect(() => {
    const handleStroke = (data: any) => {
      drawStroke(data.stroke);
    };
    const handleClear = () => {
      clearCanvas();
    };

    on('whiteboard-stroke', handleStroke);
    on('whiteboard-clear', handleClear);

    return () => {
      off('whiteboard-stroke', handleStroke);
      off('whiteboard-clear', handleClear);
    };
  }, [on, off]);

  const drawStroke = useCallback((stroke: Stroke) => {
    const ctx = ctxRef.current;
    if (!ctx || !stroke.points.length) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentStroke([point]);

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : strokeColor;
    ctx.lineWidth = tool === 'eraser' ? 20 : strokeWidth;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getCanvasPoint(e);
    setCurrentStroke(prev => [...prev, point]);

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const endDrawing = async () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }

    const stroke: Stroke = {
      points: currentStroke,
      color: tool === 'eraser' ? '#1a1a2e' : strokeColor,
      width: tool === 'eraser' ? 20 : strokeWidth
    };

    // 1. Broadcast via socket
    emit('whiteboard-stroke', { stroke });

    // 2. Persist to database via API
    if (user?.id) {
      try {
        const token = localStorage.getItem('auth_token');
        await fetch(`${import.meta.env.VITE_API_URL}/messages/whiteboard/${roomId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            stroke_data: stroke
          })
        });
      } catch (error) {
        console.error('Failed to save stroke:', error);
      }
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  };

  const handleClear = async () => {
    clearCanvas();

    // 1. Broadcast clear event via socket
    emit('whiteboard-clear', {});

    // 2. Delete strokes from database via API
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${import.meta.env.VITE_API_URL}/messages/whiteboard/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to clear strokes:', error);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-600 overflow-hidden" style={{ minHeight: '400px' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-600 bg-gray-800 flex-wrap">
        <Button variant={tool === 'pencil' ? 'default' : 'ghost'} size="sm" onClick={() => setTool('pencil')} className="text-white">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="sm" onClick={() => setTool('eraser')} className="text-white">
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-600 mx-1" />
        {colors.map(color => (
          <button key={color}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${strokeColor === color ? 'scale-125 border-white' : 'border-gray-500'}`}
            style={{ backgroundColor: color }}
            onClick={() => setStrokeColor(color)}
          />
        ))}
        <div className="w-px h-6 bg-gray-600 mx-1" />
        <select value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
          <option value={1}>Thin</option>
          <option value={2}>Medium</option>
          <option value={4}>Thick</option>
          <option value={8}>Extra Thick</option>
        </select>
        <div className="flex-1" />
        <Button variant="destructive" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>
      {/* Canvas */}
      <canvas ref={canvasRef} className="flex-1 w-full cursor-crosshair touch-none"
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onMouseLeave={endDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={endDrawing}
      />
    </div>
  );
}

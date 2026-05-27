import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  X, Camera, Film, Check, ChevronRight, 
  ChevronLeft, Type, Sliders, Music, Upload, Loader2, Play, Pause, Square
} from 'lucide-react';
import { createReel, uploadReelVideo } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface ReelCreatorProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  t: (key: string, defaultValue?: string) => string;
}

type Mode = 'select' | 'camera' | 'editor' | 'details';

export const ReelCreator: React.FC<ReelCreatorProps> = ({ user, onClose, onSuccess, showNotification, t }) => {
  const [mode, setMode] = useState<Mode>('select');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  // Editor state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [duration, setDuration] = useState(10);
  const [textOverlays, setTextOverlays] = useState<{ id: number, text: string, x: number, y: number, color: string }[]>([]);
  const [newText, setNewText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Details state
  const [caption, setCaption] = useState('');
  const [song, setSong] = useState('Sonido Original - Sorzal');

  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = useCallback(() => {
    if (!webcamRef.current?.stream) return;
    setRecording(true);
    setRecordedChunks([]);
    const recorder = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm'
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      // Create blob after state update (not reliable here, use useEffect or separate function)
    };
    recorder.start();
    setMediaRecorder(recorder);
  }, [webcamRef]);

  const stopRecording = useCallback(() => {
    mediaRecorder?.stop();
    setRecording(false);
  }, [mediaRecorder]);

  useEffect(() => {
    if (!recording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setMode('editor');
    }
  }, [recording, recordedChunks]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setMode('editor');
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const addTextOverlay = () => {
    if (!newText.trim()) return;
    setTextOverlays([...textOverlays, {
      id: Date.now(),
      text: newText,
      x: 50,
      y: 50,
      color: '#ffffff'
    }]);
    setNewText('');
  };

  const handleUpload = async () => {
    if (!user || !videoUrl) return;

    setUploading(true);
    try {
      let finalVideoUrl = videoUrl;
      
      // If it's a blob URL, we need to upload the actual file
      if (videoUrl.startsWith('blob:')) {
        const blob = recordedChunks.length > 0 
          ? new Blob(recordedChunks, { type: 'video/webm' })
          : await fetch(videoUrl).then(r => r.blob());
        
        const formData = new FormData();
        formData.append('video', blob, 'reel-video.webm');
        const uploadRes = await uploadReelVideo(formData);
        finalVideoUrl = uploadRes.url;
      }

      await createReel({
        userId: user._id,
        videoUrl: finalVideoUrl,
        caption: caption || 'Nuevo Reel',
        song: song,
        trimStart,
        trimEnd,
        textOverlays
      });
      showNotification('¡Reel publicado con éxito!', 'success');
      onSuccess();
    } catch (err) {
      showNotification('Error al publicar reel', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-primary-dark/50 backdrop-blur-xl">
        <h2 className="title text-2xl text-white uppercase tracking-widest">
          {mode === 'select' && 'Crear Reel'}
          {mode === 'camera' && 'Grabando Magia'}
          {mode === 'editor' && 'Pulir Reel'}
          {mode === 'details' && 'Configuración'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div 
              key="select"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex gap-10"
            >
              <button 
                onClick={() => setMode('camera')}
                className="w-48 h-64 glass-card border-white/10 hover:border-blue-500 hover:bg-blue-500/10 flex flex-col items-center justify-center gap-6 transition-all group"
              >
                <div className="p-6 bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform">
                  <Camera size={48} className="text-blue-500" />
                </div>
                <span className="title text-white uppercase tracking-widest">Cámara</span>
              </button>

              <label className="w-48 h-64 glass-card border-white/10 hover:border-purple-500 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-6 transition-all group cursor-pointer">
                <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                <div className="p-6 bg-purple-500/20 rounded-full group-hover:scale-110 transition-transform">
                  <Film size={48} className="text-purple-500" />
                </div>
                <span className="title text-white uppercase tracking-widest">Galería</span>
              </label>
            </motion.div>
          )}

          {mode === 'camera' && (
            <motion.div 
              key="camera"
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 border-primary-light/30 shadow-2xl"
            >
              <Webcam
                audio={true}
                ref={webcamRef}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                <button onClick={() => setMode('select')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={recording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ${recording ? 'bg-red-500 animate-pulse' : 'bg-white'}`}
                >
                  {recording ? <Square size={32} className="text-white fill-white" /> : <div className="w-16 h-16 border-4 border-primary-dark rounded-full" />}
                </button>
                <div className="w-14" />
              </div>
              {recording && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full title text-[10px] animate-pulse">
                  REC
                </div>
              )}
            </motion.div>
          )}

          {mode === 'editor' && videoUrl && (
            <motion.div 
              key="editor"
              className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-center"
            >
              <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl">
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  autoPlay
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Simulated Metadata Overlays */}
                {textOverlays.map(item => (
                  <div 
                    key={item.id}
                    className="absolute pointer-events-none"
                    style={{ 
                      left: `${item.x}%`, 
                      top: `${item.y}%`, 
                      color: item.color,
                      fontSize: '24px',
                      transform: 'translate(-50%, -50%)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.text}
                  </div>
                ))}

                <button 
                  onClick={() => {
                    if (videoRef.current?.paused) videoRef.current.play();
                    else videoRef.current?.pause();
                    setIsPlaying(!isPlaying);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                >
                  {videoRef.current?.paused ? <Play size={64} className="text-white fill-white" /> : <Pause size={64} className="text-white fill-white" />}
                </button>
              </div>

              <div className="flex-1 w-full space-y-8 glass-card p-8 border-white/10">
                {/* Trimming */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 title text-xs text-white/50 uppercase tracking-widest">
                    <Sliders size={16} /> Recortar Duración
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between title text-[10px] text-white/60">
                        <span>INICIO</span>
                        <span>{trimStart.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" min="0" max={duration} step="0.1" value={trimStart} 
                        onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                        className="w-full accent-blue-500" 
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between title text-[10px] text-white/60">
                        <span>FIN</span>
                        <span>{trimEnd.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" min="0" max={duration} step="0.1" value={trimEnd} 
                        onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                        className="w-full accent-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Text Overlays */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 title text-xs text-white/50 uppercase tracking-widest">
                    <Type size={16} /> Textos (Metadatos)
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Añadir texto al reel..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white body text-sm outline-none focus:border-blue-500"
                    />
                    <button onClick={addTextOverlay} className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {textOverlays.map(t => (
                      <div key={t.id} className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-2">
                        <span className="text-[10px] text-white/80">{t.text}</span>
                        <button onClick={() => setTextOverlays(textOverlays.filter(i => i.id !== t.id))} className="text-white/30 hover:text-red-500"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setMode('select')} className="flex-1 py-4 bg-white/5 rounded-2xl title text-xs text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                    Reiniciar
                  </button>
                  <button onClick={() => setMode('details')} className="flex-1 py-4 bg-blue-500 text-white rounded-2xl title text-xs uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'details' && (
            <motion.div 
              key="details"
              className="w-full max-w-xl glass-card p-10 space-y-8 border-white/10 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="title text-[10px] text-white/40 uppercase tracking-widest">Descripción del Reel</label>
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escribe un pie de video..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-blue-500 transition-all h-32 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="title text-[10px] text-white/40 uppercase tracking-widest">Título de la Canción</label>
                  <div className="relative">
                    <Music size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
                    <input 
                      type="text" 
                      value={song}
                      onChange={(e) => setSong(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white body outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setMode('editor')} className="flex-1 py-4 bg-white/5 rounded-2xl title text-xs text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <ChevronLeft size={16} /> Atrás
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-4 bg-blue-500 text-white rounded-2xl title text-xs uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:animate-pulse"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={18} /> PUBLICAR REEL</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

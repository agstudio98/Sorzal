import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  X, Camera, Image as ImageIcon, Check, ChevronRight, 
  ChevronLeft, Type, Sliders, Palette, Upload, Loader2, RefreshCcw
} from 'lucide-react';
import { createProduct } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoCreatorProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  t: (key: string, defaultValue?: string) => string;
}

type Mode = 'select' | 'camera' | 'editor' | 'details';

export const PhotoCreator: React.FC<PhotoCreatorProps> = ({ user, onClose, onSuccess, showNotification, t }) => {
  const [mode, setMode] = useState<Mode>('select');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Editor state
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [textItems, setTextItems] = useState<{ id: number, text: string, x: number, y: number, color: string, fontSize: number }[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  
  // Details state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Digital');

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setMode('editor');
    }
  }, [webcamRef]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMode('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    if (!newText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newText,
      x: 50,
      y: 50,
      color: '#ffffff',
      fontSize: 24
    };
    setTextItems([...textItems, newItem]);
    setNewText('');
  };

  const handleUpload = async () => {
    if (!user || !image) return;
    
    // Draw final canvas to get data URL with filters and text
    const finalCanvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;
    
    await new Promise((resolve) => {
      img.onload = () => {
        finalCanvas.width = img.width;
        finalCanvas.height = img.height;
        const ctx = finalCanvas.getContext('2d');
        if (ctx) {
          // Apply filters
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${filter === 'grayscale' ? 'grayscale(100%)' : filter === 'sepia' ? 'sepia(100%)' : ''}`;
          ctx.drawImage(img, 0, 0);
          
          // Apply text
          ctx.filter = 'none';
          textItems.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.font = `bold ${item.fontSize * (img.width / 500)}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(item.text, (item.x / 100) * img.width, (item.y / 100) * img.height);
          });
        }
        resolve(null);
      };
    });

    const finalImageData = finalCanvas.toDataURL('image/jpeg', 0.8);

    setUploading(true);
    try {
      await createProduct({
        name: formName || 'Sin título',
        description: formDesc || 'Publicado desde Modo Creador',
        category: formCategory,
        price: 0,
        imageUrl: finalImageData,
        userId: user._id,
        isMarket: false
      });
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.UPLOAD_SUCCESS', '¡Publicado con éxito!'), 'success');
      onSuccess();
    } catch (err: any) {
      showNotification(err.message || t('PHOTOGRAPHY.NOTIFICATIONS.UPLOAD_ERROR', 'Error al publicar'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const filters = [
    { name: 'none', label: 'Original' },
    { name: 'grayscale', label: 'B&N' },
    { name: 'sepia', label: 'Sepia' },
    { name: 'vintage', label: 'Vintage', b: 110, c: 90 },
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-primary-dark/50 backdrop-blur-xl">
        <h2 className="title text-2xl text-white uppercase tracking-widest">
          {mode === 'select' && 'Crear Fotografía'}
          {mode === 'camera' && 'Capturar Momento'}
          {mode === 'editor' && 'Editar Pieza'}
          {mode === 'details' && 'Últimos Detalles'}
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
                className="w-48 h-64 glass-card border-white/10 hover:border-primary-light hover:bg-primary-light/10 flex flex-col items-center justify-center gap-6 transition-all group"
              >
                <div className="p-6 bg-primary-light/20 rounded-full group-hover:scale-110 transition-transform">
                  <Camera size={48} className="text-primary-light" />
                </div>
                <span className="title text-white uppercase tracking-widest">Cámara</span>
              </button>

              <label className="w-48 h-64 glass-card border-white/10 hover:border-emerald-500 hover:bg-emerald-500/10 flex flex-col items-center justify-center gap-6 transition-all group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <div className="p-6 bg-emerald-500/20 rounded-full group-hover:scale-110 transition-transform">
                  <ImageIcon size={48} className="text-emerald-500" />
                </div>
                <span className="title text-white uppercase tracking-widest">Galería</span>
              </label>
            </motion.div>
          )}

          {mode === 'camera' && (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full max-w-2xl aspect-video bg-black rounded-3xl overflow-hidden border-2 border-primary-light/30 shadow-[0_0_50px_rgba(14,165,233,0.3)]"
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                <button onClick={() => setMode('select')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={capture}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 border-4 border-primary-dark rounded-full" />
                </button>
                <div className="w-14" /> {/* Spacer */}
              </div>
            </motion.div>
          )}

          {mode === 'editor' && image && (
            <motion.div 
              key="editor"
              className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-center"
            >
              <div className="relative w-full max-w-xl aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl group">
                <img 
                  src={image} 
                  className="w-full h-full object-contain transition-all"
                  style={{ 
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${filter === 'grayscale' ? 'grayscale(100%)' : filter === 'sepia' ? 'sepia(100%)' : ''}`
                  }}
                />
                
                {/* Text Overlays in Preview */}
                {textItems.map(item => (
                  <div 
                    key={item.id}
                    className="absolute cursor-move select-none"
                    style={{ 
                      left: `${item.x}%`, 
                      top: `${item.y}%`, 
                      color: item.color,
                      fontSize: `${item.fontSize}px`,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 'bold'
                    }}
                    onMouseDown={(e) => setActiveTextId(item.id)}
                  >
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex-1 w-full space-y-8 glass-card p-8 border-white/10">
                {/* Filters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 title text-xs text-white/50 uppercase tracking-widest">
                    <Palette size={16} /> Filtros
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {filters.map(f => (
                      <button 
                        key={f.name}
                        onClick={() => setFilter(f.name)}
                        className={`px-6 py-2 rounded-full title text-[10px] uppercase transition-all border ${filter === f.name ? 'bg-primary-light border-primary-light text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adjustments */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 title text-xs text-white/50 uppercase tracking-widest">
                    <Sliders size={16} /> Ajustes
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between title text-[10px] text-white/60">
                        <span>BRILLO</span>
                        <span>{brightness}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={brightness} 
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-primary-light" 
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between title text-[10px] text-white/60">
                        <span>CONTRASTE</span>
                        <span>{contrast}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" value={contrast} 
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full accent-primary-light" 
                      />
                    </div>
                  </div>
                </div>

                {/* Text Tool */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 title text-xs text-white/50 uppercase tracking-widest">
                    <Type size={16} /> Texto Superpuesto
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Escribe algo..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white body text-sm outline-none focus:border-primary-light"
                    />
                    <button onClick={addText} className="p-3 bg-primary-light text-white rounded-xl hover:bg-primary-dark transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                  {textItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {textItems.map(t => (
                        <div key={t.id} className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-2">
                          <span className="text-[10px] text-white/80">{t.text}</span>
                          <button onClick={() => setTextItems(textItems.filter(i => i.id !== t.id))} className="text-white/30 hover:text-red-500"><X size={12}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setMode('select')} className="flex-1 py-4 bg-white/5 rounded-2xl title text-xs text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                    Reiniciar
                  </button>
                  <button onClick={() => setMode('details')} className="flex-1 py-4 bg-primary-light text-white rounded-2xl title text-xs uppercase tracking-widest hover:bg-primary-dark shadow-lg shadow-primary-light/20 transition-all flex items-center justify-center gap-2">
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
                  <label className="title text-[10px] text-white/40 uppercase tracking-widest">Título de la Obra</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Luces de Neo-Tokio"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="title text-[10px] text-white/40 uppercase tracking-widest">Descripción / Historia</label>
                  <textarea 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Cuéntanos más sobre esta captura..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all h-32 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="title text-[10px] text-white/40 uppercase tracking-widest">Categoría</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Naturaleza', 'Urbana', 'Retrato', 'Abstracta', 'Digital'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFormCategory(cat)}
                        className={`py-3 rounded-xl title text-[10px] uppercase transition-all border ${formCategory === cat ? 'bg-primary-light border-primary-light text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {cat}
                      </button>
                    ))}
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
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl title text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:animate-pulse"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={18} /> PUBLICAR AHORA</>}
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

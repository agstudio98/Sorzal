import React, { useState } from 'react';
import { 
  X, Image as ImageIcon, Upload, Loader2, DollarSign, 
  Tag, FileText, ShoppingBag, Plus, ChevronRight, ChevronLeft
} from 'lucide-react';
import { createProduct } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketplaceCreatorProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  t: (key: string, defaultValue?: string) => string;
}

type Mode = 'select' | 'details';

export const MarketplaceCreator: React.FC<MarketplaceCreatorProps> = ({ user, onClose, onSuccess, showNotification, t }) => {
  const [mode, setMode] = useState<Mode>('select');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Details state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Hardware');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setMode('details');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!user || !image) return;
    if (!formName || !formPrice) {
      showNotification('Por favor, completa los campos obligatorios', 'info');
      return;
    }

    setUploading(true);
    try {
      await createProduct({
        name: formName,
        description: formDesc || 'Producto de Marketplace',
        category: formCategory,
        price: Number(formPrice),
        imageUrl: image,
        userId: user._id,
        isMarket: true
      });
      showNotification('¡Producto publicado con éxito en el Marketplace!', 'success');
      onSuccess();
    } catch (err: any) {
      showNotification(err.message || 'Error al publicar producto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const categories = ['Hardware', 'Software', 'Cámaras', 'Lentes', 'Accesorios', 'Digital'];

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-primary-dark/50 backdrop-blur-xl">
        <h2 className="title text-2xl text-white uppercase tracking-widest flex items-center gap-3">
          <ShoppingBag className="text-primary-light" />
          {mode === 'select' ? 'Vender Producto' : 'Detalles de Venta'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
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
              className="flex flex-col items-center gap-8"
            >
              <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light animate-bounce">
                <Plus size={48} />
              </div>
              <h3 className="title text-3xl text-white text-center uppercase tracking-widest max-w-md">
                ¿Qué quieres ofrecer a la comunidad?
              </h3>
              
              <label className="w-64 h-80 glass-card border-white/10 hover:border-primary-light hover:bg-primary-light/10 flex flex-col items-center justify-center gap-6 transition-all group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <div className="p-8 bg-primary-light/20 rounded-full group-hover:scale-110 transition-transform">
                  <ImageIcon size={64} className="text-primary-light" />
                </div>
                <span className="title text-white uppercase tracking-widest text-lg">Subir Foto</span>
                <p className="body text-[10px] opacity-40 uppercase text-center px-4 italic">Formatos: JPG, PNG, WEBP</p>
              </label>
            </motion.div>
          )}

          {mode === 'details' && (
            <motion.div 
              key="details"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-start"
            >
              <div className="w-full md:w-1/2 aspect-square glass-card overflow-hidden border-white/10 relative">
                 <img src={image!} className="w-full h-full object-cover" />
                 <button 
                  onClick={() => setMode('select')}
                  className="absolute top-4 left-4 p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all flex items-center gap-2 title text-[10px] uppercase"
                 >
                   <ChevronLeft size={16} /> Cambiar Foto
                 </button>
              </div>

              <div className="flex-1 w-full space-y-6 glass-card p-8 border-white/10 bg-white/5">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="flex items-center gap-2 title text-[10px] text-white/40 uppercase tracking-widest">
                        <Tag size={12} /> Nombre del Producto
                      </label>
                      <input 
                        type="text" 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ej. Cámara Sony A7IV - Como nueva"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 title text-[10px] text-white/40 uppercase tracking-widest">
                          <DollarSign size={12} /> Precio (USD)
                        </label>
                        <input 
                          type="number" 
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 title text-[10px] text-white/40 uppercase tracking-widest">
                           Categoría
                        </label>
                        <select 
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-primary-dark border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all appearance-none cursor-pointer"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="flex items-center gap-2 title text-[10px] text-white/40 uppercase tracking-widest">
                        <FileText size={12} /> Descripción Técnica / Estado
                      </label>
                      <textarea 
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Detalles sobre el uso, garantía, accesorios incluidos..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white body outline-none focus:border-primary-light transition-all h-32 resize-none"
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-5 bg-primary-light text-white rounded-2xl title text-lg uppercase tracking-widest hover:bg-primary-dark shadow-lg shadow-primary-light/20 transition-all flex items-center justify-center gap-3 disabled:animate-pulse"
                  >
                    {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={24} /> PUBLICAR ARTÍCULO</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

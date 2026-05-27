import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, MessageSquare, ShoppingBag, 
  Gamepad2, PlayCircle, X, Plus,
  MoreHorizontal, Code2, Mic, GraduationCap
} from 'lucide-react';

export const CreatorMode: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const navigate = useNavigate();

  // Don't show if not logged in (check localStorage as a simple proxy)
  const user = localStorage.getItem('user');
  if (!user) return null;

  const handleAction = (to: string) => {
    setIsOpen(false);
    setShowSecondary(false);
    navigate(to, { state: { create: true } });
  };

  return (
    <>
      {/* Creator Mode FAB */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-primary-light text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:scale-110 active:scale-95 transition-all z-[90] group"
      >
        <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Creator Mode Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-primary-dark/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <button 
              onClick={() => { setIsOpen(false); setShowSecondary(false); }}
              className="absolute top-10 right-10 p-4 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="title text-5xl text-white uppercase tracking-[0.3em] text-center"
              >
                Modo <span className="text-primary-light">Creador</span>
              </motion.h2>

              {/* Primary Options - Large Circles */}
              <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                {[
                  { label: 'Foto', icon: Camera, color: 'bg-rose-500', to: '/photography' },
                  { label: 'Market', icon: ShoppingBag, color: 'bg-amber-500', to: '/marketplace' },
                  { label: 'Foro', icon: MessageSquare, color: 'bg-emerald-500', to: '/forum' },
                  { label: 'Reel', icon: PlayCircle, color: 'bg-blue-500', to: '/reels' },
                ].map((opt, i) => (
                  <motion.div
                    key={opt.label}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <button 
                      onClick={() => handleAction(opt.to)}
                      className={`w-32 h-32 md:w-40 md:h-44 ${opt.color} rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative group-hover:ring-4 ring-white/20`}
                    >
                      <opt.icon size={56} className="md:size-72" />
                    </button>
                    <span className="title text-xl text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{opt.label}</span>
                  </motion.div>
                ))}

                {/* Toggle Secondary Options */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4 group"
                >
                  <button 
                    onClick={() => setShowSecondary(!showSecondary)}
                    className={`w-32 h-32 md:w-40 md:h-44 bg-white/10 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white/20 transition-all duration-300 ${showSecondary ? 'rotate-90' : ''}`}
                  >
                    <MoreHorizontal size={56} className="md:size-72" />
                  </button>
                  <span className="title text-xl text-white uppercase tracking-widest opacity-60">Otros</span>
                </motion.div>
              </div>

              {/* Secondary Options - Smaller Circles */}
              <AnimatePresence>
                {showSecondary && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="flex flex-wrap justify-center gap-6 md:gap-8 border-t border-white/10 pt-10"
                  >
                    {[
                      { label: 'Juegos', icon: Gamepad2, color: 'text-purple-500', to: '/games' },
                      { label: 'Dev', icon: Code2, color: 'text-cyan-500', to: '/dev' },
                      { label: 'Podcast', icon: Mic, color: 'text-orange-500', to: '/podcasts' },
                      { label: 'Academia', icon: GraduationCap, color: 'text-yellow-500', to: '/courses' },
                    ].map((opt, i) => (
                      <motion.div
                        key={opt.label}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <button 
                          onClick={() => handleAction(opt.to)}
                          className={`w-20 h-20 bg-white/5 rounded-full flex items-center justify-center ${opt.color} hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-xl`}
                        >
                          <opt.icon size={32} />
                        </button>
                        <span className="title text-[10px] text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">{opt.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

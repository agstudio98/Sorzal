import { useState, useEffect, useCallback } from 'react';
import { Heart, X, MessageCircle, Star, Info, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { fetchPotentialMatches, likeUser, dislikeUser } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Discover() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const navigate = useNavigate();

  // Motion values for swiping effect
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  // Get current user from localStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?._id; 

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPotentialMatches(currentUserId);
      // Randomize profiles
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setProfiles(shuffled);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar perfiles');
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      loadProfiles();
    } else {
      setLoading(false);
    }
  }, [currentUserId, loadProfiles]);

  const handleLike = async () => {
    if (currentIndex >= profiles.length) return;
    const profile = profiles[currentIndex];
    try {
      const result = await likeUser(profile._id, currentUserId);
      if (result.isMatch) {
        setMatchedUser(profile);
        setShowMatch(true);
        // Automatic redirect to messages after 3 seconds
        setTimeout(() => {
          navigate('/messages');
        }, 3000);
      } else {
        nextProfile();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async () => {
    if (currentIndex >= profiles.length) return;
    const profile = profiles[currentIndex];
    try {
      await dislikeUser(profile._id, currentUserId);
      nextProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const nextProfile = () => {
    setSwipeDirection(null);
    x.set(0);
    setCurrentIndex(prev => prev + 1);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      setSwipeDirection('right');
      handleLike();
    } else if (info.offset.x < -100) {
      setSwipeDirection('left');
      handleDislike();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-day dark:bg-night">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-day dark:bg-night text-center px-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
           <X size={40} />
        </div>
        <h2 className="title text-3xl mb-4">¡Ups! Algo salió mal</h2>
        <p className="body opacity-60 mb-8">{error}</p>
        <button 
          onClick={loadProfiles}
          className="px-8 py-3 bg-primary-light text-white rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-day dark:bg-night text-center px-6">
        <h2 className="title text-3xl mb-4 uppercase">Inicia sesión para descubrir</h2>
        <p className="body opacity-60 mb-8">Necesitas estar registrado para poder hacer match con otras personas.</p>
        <button 
          onClick={() => navigate('/user')}
          className="px-8 py-3 bg-primary-light text-white rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg"
        >
          Ir al Login
        </button>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-day dark:bg-night text-center px-6">
        <div className="w-24 h-24 bg-primary-light/10 rounded-full flex items-center justify-center mb-6">
          <Zap className="text-primary-light" size={48} />
        </div>
        <h2 className="title text-3xl mb-4">¡No hay más perfiles por ahora!</h2>
        <p className="body opacity-60 max-w-md">Vuelve más tarde para descubrir nuevas personas o intenta ampliar tus preferencias.</p>
        <button 
          onClick={() => { setCurrentIndex(0); loadProfiles(); }}
          className="mt-8 px-8 py-3 bg-primary-light text-white rounded-full font-bold hover:bg-primary-dark transition-all"
        >
          Recargar Perfiles
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-md px-6 relative flex-1 flex flex-col">
        
        {/* Profile Card Stack */}
        <div className="flex-1 relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentProfile._id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.8 } }}
              exit={{ 
                x: swipeDirection === 'right' ? 1000 : swipeDirection === 'left' ? -1000 : 0,
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.8 }
              }}
              dragTransition={{ bounceStiffness: 100, bounceDamping: 20 }}
              className="absolute inset-0 z-10 touch-none"
            >
              <div className="h-full glass-card rounded-[40px] overflow-hidden relative shadow-2xl group cursor-grab active:cursor-grabbing">
                <img 
                  src={currentProfile.avatar} 
                  alt={currentProfile.name}
                  className="w-full h-full object-cover bg-white/5 pointer-events-none"
                />
                
                {/* Visual Indicators while swiping */}
                <motion.div 
                  style={{ opacity: likeOpacity }}
                  className="absolute top-10 left-10 border-4 border-green-500 text-green-500 px-4 py-2 rounded-lg font-black text-4xl -rotate-12 z-20 pointer-events-none"
                >
                  LIKE
                </motion.div>
                <motion.div 
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-10 right-10 border-4 border-red-500 text-red-500 px-4 py-2 rounded-lg font-black text-4xl rotate-12 z-20 pointer-events-none"
                >
                  NOPE
                </motion.div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                
                {/* Info Area */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none">
                  <div className="flex items-end gap-3 mb-2">
                    <h1 className="title text-4xl">{currentProfile.name}, {currentProfile.age}</h1>
                    <span className="body text-lg opacity-80 mb-1">{currentProfile.sign}</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">Música</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">Viajes</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">Tech</span>
                  </div>
                  <p className="body text-sm opacity-80 line-clamp-2">
                    {currentProfile.isAI ? currentProfile.aiPersona : 'Amante de la tecnología y los buenos cafés. Buscando a alguien para compartir aventuras y código.'}
                  </p>
                </div>

                {/* Top Badges */}
                <div className="absolute top-6 left-6 flex gap-2 pointer-events-none">
                   {currentProfile.isAI ? (
                     <div className="px-3 py-1 bg-secondary-light text-white rounded-lg text-[10px] font-bold uppercase tracking-widest animate-pulse">IA Simulación</div>
                   ) : (
                     <div className="px-3 py-1 bg-primary-light/80 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Nuevo</div>
                   )}
                </div>
                <button className="absolute top-6 right-6 p-3 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-colors z-20">
                  <Info size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Background card (next profile preview) */}
          {currentIndex + 1 < profiles.length && (
            <div className="absolute inset-0 -z-0 opacity-50 scale-95 translate-y-4 px-2">
              <div className="h-full glass-card rounded-[40px] overflow-hidden relative shadow-lg">
                <img 
                  src={profiles[currentIndex + 1].avatar} 
                  alt="Next"
                  className="w-full h-full object-cover grayscale blur-[2px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center px-4 py-8">
           <button 
             onClick={nextProfile}
             className="w-14 h-14 flex items-center justify-center bg-white dark:bg-primary-dark text-yellow-500 rounded-full shadow-lg border-2 border-yellow-500/20 hover:scale-110 active:scale-95 transition-all"
           >
              <Star size={24} fill="currentColor" />
           </button>
           
           <button 
             onClick={() => { setSwipeDirection('left'); handleDislike(); }}
             className="w-20 h-20 flex items-center justify-center bg-white dark:bg-primary-dark text-red-500 rounded-full shadow-xl border-2 border-red-500/20 hover:scale-110 active:scale-95 transition-all"
           >
              <X size={40} strokeWidth={3} />
           </button>

           <button 
             onClick={() => { setSwipeDirection('right'); handleLike(); }}
             className="w-20 h-20 flex items-center justify-center bg-white dark:bg-primary-dark text-green-500 rounded-full shadow-xl border-2 border-green-500/20 hover:scale-110 active:scale-95 transition-all"
           >
              <Heart size={40} fill="currentColor" />
           </button>

           <button 
             className="w-14 h-14 flex items-center justify-center bg-white dark:bg-primary-dark text-primary-light rounded-full shadow-lg border-2 border-primary-light/20 hover:scale-110 active:scale-95 transition-all"
           >
              <Zap size={24} fill="currentColor" />
           </button>
        </div>
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
             {/* Dynamic Green Background Animation */}
             <motion.div 
               initial={{ scale: 0, borderRadius: '100%' }}
               animate={{ scale: 2, borderRadius: '0%' }}
               transition={{ duration: 0.8, ease: "circOut" }}
               className="absolute inset-0 bg-green-500"
             ></motion.div>
             
             <motion.div 
               initial={{ scale: 0.5, y: 100, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
               className="relative z-10 text-center px-6"
             >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex justify-center mb-8"
                >
                  <Heart size={160} fill="white" className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" />
                </motion.div>

                <h2 className="title text-8xl text-white mb-4 italic tracking-tighter drop-shadow-2xl">IT'S A MATCH!</h2>
                <p className="body text-white text-3xl mb-12 font-black uppercase tracking-widest bg-black/20 py-2 px-6 rounded-full inline-block">
                  Conectando con {matchedUser.name}...
                </p>
                
                <div className="flex gap-8 justify-center mb-16 relative">
                   <motion.div 
                     initial={{ x: -100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="w-40 h-40 rounded-[40px] border-8 border-white overflow-hidden -rotate-12 shadow-2xl bg-white/10"
                   >
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Tú" className="w-full h-full object-cover" />
                   </motion.div>
                   
                   <motion.div 
                     initial={{ x: 100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="w-40 h-40 rounded-[40px] border-8 border-white overflow-hidden rotate-12 shadow-2xl bg-white/10"
                   >
                      <img src={matchedUser.avatar} alt={matchedUser.name} className="w-full h-full object-cover" />
                   </motion.div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                   <div className="flex items-center justify-center gap-3 text-white/80 animate-pulse mb-4">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                   </div>
                   <p className="body text-white/70 text-sm font-bold tracking-widest uppercase">Redirigiendo al chat...</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

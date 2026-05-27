import React, { useState } from 'react';
import { 
  HelpCircle, MessageCircle, ShieldCheck, CreditCard, 
  GraduationCap, ShoppingBag, Terminal, Zap, ChevronRight,
  Info, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchSupportBot } from '../api';

const HELP_TAGS = [
  { id: 'general', icon: Info, color: 'text-blue-500' },
  { id: 'account', icon: ShieldCheck, color: 'text-green-500' },
  { id: 'payments', icon: CreditCard, color: 'text-purple-500' },
  { id: 'academy', icon: GraduationCap, color: 'text-yellow-500' },
  { id: 'market', icon: ShoppingBag, color: 'text-rose-500' },
  { id: 'dev', icon: Terminal, color: 'text-cyan-500' },
];

const SOLUTIONS: Record<string, any[]> = {
  general: [
    { title: '¿Qué es Sorzal?', desc: 'Sorzal es un ecosistema digital de lujo donde convergen el arte, la tecnología y el aprendizaje.' },
    { title: '¿Cómo navegar?', desc: 'Utiliza la barra superior para explorar las diferentes secciones: Galería, Academia, Mercado y Foros.' }
  ],
  account: [
    { title: 'Verificación de Perfil', desc: 'Los perfiles se verifican automáticamente al completar tu información básica y subir tu primera pieza.' },
    { title: 'Seguridad 2FA', desc: 'Puedes activar la autenticación de dos factores en los ajustes de tu perfil para máxima seguridad.' }
  ],
  payments: [
    { title: 'Métodos de Pago', desc: 'Aceptamos las principales tarjetas de crédito y criptomonedas seleccionadas para transacciones en el marketplace.' },
    { title: 'Reembolsos', desc: 'Las compras digitales tienen una garantía de 24 horas si el contenido no coincide con la descripción.' }
  ],
  academy: [
    { title: 'Acceso a Cursos', desc: 'Una vez adquirido un curso, tendrás acceso de por vida a los módulos y actualizaciones futuras.' },
    { title: 'Certificados', desc: 'Al completar el 100% de un curso, recibirás un certificado digital único de Sorzal.' }
  ],
  market: [
    { title: 'Vender mis Obras', desc: 'Como artista verificado, puedes listar tus fotografías y diseños directamente en el Marketplace.' },
    { title: 'Comisiones', desc: 'Sorzal aplica una comisión mínima del 5% para el mantenimiento del ecosistema.' }
  ],
  dev: [
    { title: 'Repositorios Open Source', desc: 'La sección Dev permite compartir módulos y herramientas con la comunidad de desarrolladores.' },
    { title: 'API Sorzal', desc: 'Estamos trabajando en una API pública para que puedas integrar Sorzal en tus propios proyectos.' }
  ]
};

export const SupportPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('general');
  const [selectedSolution, setSelectedSolution] = useState<any | null>(null);
  const [loadingBot, setLoadingBot] = useState(false);

  const handleDirectChat = async () => {
    try {
      setLoadingBot(true);
      const bot = await fetchSupportBot();
      navigate('/messages', { state: { autoSelectBotId: bot._id } });
    } catch (error) {
      console.error('Error reaching support bot:', error);
      alert('El servicio de chat no está disponible en este momento.');
    } finally {
      setLoadingBot(false);
    }
  };

  const IconComponent = HELP_TAGS.find(tag => tag.id === activeTag)?.icon || Info;

  return (
    <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-4xl animate-in zoom-in duration-500">
        
        {/* Header - Simple & Explanatory */}
        <div className="text-center mb-10 space-y-2">
           <div className="w-20 h-20 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={40} className="text-primary-light" />
           </div>
           <h1 className="title text-5xl uppercase tracking-widest text-primary-dark dark:text-white">
             Soporte Sorzal
           </h1>
           <p className="body text-lg opacity-60 italic">Resolución inmediata para tu experiencia en el ecosistema.</p>
        </div>

        {/* Dialog Window Container */}
        <div className="glass-card overflow-hidden shadow-2xl border-t-8 border-primary-light flex flex-col md:flex-row h-[600px]">
           
           {/* Left Sidebar - Tag Menu */}
           <div className="w-full md:w-1/3 bg-white/5 border-r border-primary-light/10 p-6 flex flex-col">
              <h3 className="title text-xs uppercase tracking-[0.2em] opacity-40 mb-6 px-2">Categorías</h3>
              <div className="space-y-2 flex-1">
                 {HELP_TAGS.map((tag) => (
                   <button
                     key={tag.id}
                     onClick={() => { setActiveTag(tag.id); setSelectedSolution(null); }}
                     className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                       activeTag === tag.id 
                       ? 'bg-primary-light text-white shadow-lg scale-105' 
                       : 'hover:bg-primary-light/10 text-primary-dark/70 dark:text-white/70'
                     }`}
                   >
                     <tag.icon size={20} className={activeTag === tag.id ? 'text-white' : tag.color} />
                     <span className="title text-sm uppercase tracking-wider">{t(`SUPPORT.TAGS.${tag.id.toUpperCase()}`) || tag.id}</span>
                   </button>
                 ))}
              </div>

              {/* Instant Contact */}
              <div className="mt-6 pt-6 border-t border-primary-light/10">
                 <button 
                  onClick={handleDirectChat}
                  disabled={loadingBot}
                  className="w-full p-4 bg-secondary-light/20 text-secondary-dark dark:text-secondary-light rounded-2xl flex items-center justify-center gap-3 hover:bg-secondary-light/30 transition-all group disabled:opacity-50"
                 >
                    {loadingBot ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="title text-xs uppercase font-bold tracking-widest">Chat Directo</span>
                      </>
                    )}
                 </button>
              </div>
           </div>

           {/* Right Side - Content / Solutions */}
           <div className="flex-1 p-8 overflow-y-auto bg-primary-light/5 relative">
              <div className="flex items-center gap-3 mb-8">
                 <IconComponent size={32} className="text-primary-light" />
                 <h2 className="title text-3xl uppercase tracking-wider">
                   {t(`SUPPORT.TAGS.${activeTag.toUpperCase()}`) || activeTag}
                 </h2>
              </div>

              <div className="space-y-4">
                 {SOLUTIONS[activeTag].map((solution, idx) => (
                   <div 
                     key={idx}
                     onClick={() => setSelectedSolution(solution)}
                     className="p-6 bg-white dark:bg-primary-dark/40 rounded-3xl border border-primary-light/10 hover:border-primary-light hover:scale-[1.02] transition-all cursor-pointer group flex items-center justify-between shadow-sm"
                   >
                      <div className="space-y-1">
                         <h4 className="title text-lg text-primary-dark dark:text-white group-hover:text-primary-light transition-colors">{solution.title}</h4>
                         <p className="body text-xs opacity-50 line-clamp-1">{solution.desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-primary-light opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                 ))}
              </div>

              {/* Solution Detail Overlay */}
              {selectedSolution && (
                <div className="absolute inset-0 bg-white/95 dark:bg-night/95 backdrop-blur-xl p-10 animate-in fade-in slide-in-from-right-4 duration-300 z-10">
                   <button 
                     onClick={() => setSelectedSolution(null)}
                     className="absolute top-6 right-6 p-2 hover:bg-primary-light/10 rounded-full transition-colors"
                   >
                     <X size={24} />
                   </button>

                   <div className="h-full flex flex-col justify-center space-y-8 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-primary-light/10 rounded-2xl flex items-center justify-center text-primary-light">
                         <Zap size={32} />
                      </div>
                      <h3 className="title text-4xl text-primary-dark dark:text-white leading-tight">
                        {selectedSolution.title}
                      </h3>
                      <p className="body text-xl opacity-70 leading-relaxed border-l-4 border-primary-light pl-6">
                        {selectedSolution.desc}
                      </p>
                      <div className="pt-8 flex items-center gap-3 text-green-500 font-bold title text-xs uppercase tracking-widest">
                         <CheckCircle2 size={16} /> Solución Verificada
                      </div>
                   </div>
                </div>
              )}

              {/* Bottom Tip */}
              {!selectedSolution && (
                <div className="mt-12 p-6 bg-primary-light/10 rounded-3xl flex items-start gap-4 border border-primary-light/20">
                   <AlertCircle className="text-primary-light shrink-0" size={20} />
                   <p className="body text-xs opacity-60 leading-relaxed italic">
                     Si no encuentras la pieza que buscas en estas categorías, nuestro equipo humano está disponible de 9:00 a 18:00 (GMT-3) para asistirte personalmente.
                   </p>
                </div>
              )}
           </div>
        </div>

        {/* Floating Background Decorations */}
        <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary-light/5 blur-[100px] -z-10 rounded-full"></div>
        <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-secondary-light/5 blur-[120px] -z-10 rounded-full"></div>
      </div>
    </main>
  );
};

import { Component } from 'react';
import { Camera, ShoppingBag, Gamepad2, Heart, GraduationCap, MessageSquare, Sparkles } from 'lucide-react';

export class HomeSlogans extends Component {
  render() {
    const slogans = [
      { icon: <Camera size={32} />, title: "Visiones Reales", desc: "Captura el alma de cada momento en nuestra galería de fotos y reels.", color: "from-blue-400 to-cyan-500" },
      { icon: <ShoppingBag size={32} />, title: "Mercado Sorzal", desc: "Tu marketplace local para piezas únicas y herramientas digitales.", color: "from-emerald-400 to-teal-500" },
      { icon: <Gamepad2 size={32} />, title: "Arena Gaming", desc: "Sumergete en experiencias HTML5 interactivas sin instalaciones.", color: "from-indigo-400 to-purple-500" },
      { icon: <Heart size={32} />, title: "Matches Puros", desc: "Conecta con personas que vibran en tu misma sintonía.", color: "from-rose-400 to-pink-500" },
      { icon: <GraduationCap size={32} />, title: "Sorzal Academy", desc: "Aprende de los mejores y comparte tu sabiduría con la comunidad.", color: "from-amber-400 to-orange-500" },
      { icon: <MessageSquare size={32} />, title: "Eco Social", desc: "Mensajería instantánea con alma, audios y reacciones fluidas.", color: "from-sky-400 to-blue-500" },
    ];

    return (
      <section className="py-32 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="title text-4xl md:text-5xl uppercase tracking-[0.4em] text-primary-dark dark:text-white leading-none">
              ¿QUÉ <span className="text-primary-light italic">OFRECEMOS</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {slogans.map((item, index) => (
              <div 
                key={index} 
                style={{ animationDelay: `${index * 150}ms` }}
                className="glass-card p-10 group transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] relative overflow-hidden border-b-4 border-transparent hover:border-primary-light animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both"
              >
                {/* Hover Background Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`}></div>
                
                <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {item.icon}
                </div>
                
                <h3 className="title text-3xl mb-4 text-primary-dark dark:text-white group-hover:text-primary-light transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="body text-lg opacity-70 leading-relaxed dark:text-slate-300">
                  {item.desc}
                </p>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-light opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  Explorar sección <span className="text-lg">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

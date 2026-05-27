import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

class Who extends Component<WithTranslation> {
  render() {
    const { t } = this.props;
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden py-32 bg-deep-ocean/5 dark:bg-black/40">
        {/* Background Decorative - Large Floating Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-light/[0.05] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20 relative z-10">
          {/* Visual Element - Left Side */}
          <div className="flex-1 relative group perspective-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-light/20 to-accent/20 blur-2xl rounded-[4rem] group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600" 
                  alt="Team 1" 
                  className="rounded-[2.5rem] shadow-2xl hover:scale-105 transition-transform duration-500 border-4 border-white/10"
                />
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-2 translate-x-4">
                  <span className="title text-4xl text-primary-light leading-none">100%</span>
                  <span className="body text-xs font-bold uppercase tracking-widest opacity-60">Conectividad</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-full aspect-square bg-gradient-to-br from-primary-light to-primary-dark rounded-[2.5rem] flex items-center justify-center shadow-2xl -translate-x-4">
                  <span className="logo-font text-white text-6xl">S</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" 
                  alt="Team 2" 
                  className="rounded-[2.5rem] shadow-2xl hover:scale-105 transition-transform duration-500 border-4 border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Content Element - Right Side */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              <h2 className="title text-6xl md:text-8xl text-primary-dark dark:text-white leading-[0.9] tracking-tighter">
                UN <span className="text-primary-light italic underline decoration-accent/30 underline-offset-8">ECOSISTEMA</span> QUE RESPIRA
              </h2>
              
              <div className="w-20 h-1.5 bg-primary-light rounded-full"></div>
            </div>

            <div className="space-y-8">
              <p className="body text-2xl md:text-3xl text-primary-dark/80 dark:text-slate-200 leading-snug font-light">
                Sorzal no es solo una plataforma; es el espacio donde las <span className="text-primary-light font-bold italic">pasiones humanas</span> se encuentran con la tecnología más fluida.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="title text-xl uppercase tracking-widest text-primary-light">Libertad Creativa</h4>
                  <p className="body text-lg opacity-70">Desde hilos de debate hasta galerías visuales, tu voz es la pieza central.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="title text-xl uppercase tracking-widest text-primary-light">Comunidad Viva</h4>
                  <p className="body text-lg opacity-70">Un marketplace vibrante y mundos gaming listos para ser explorados.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap gap-4">
              <button className="px-10 py-4 bg-primary-dark dark:bg-primary-light text-white rounded-2xl title text-xl hover:shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition-all hover:-translate-y-1">
                DESCUBRIR MÁS
              </button>
              <button className="px-10 py-4 glass-card border-primary-light/30 hover:bg-primary-light/10 text-primary-dark dark:text-white rounded-2xl title text-xl transition-all">
                NUESTRO MANIFIESTO
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export const HomeWho = withTranslation()(Who);

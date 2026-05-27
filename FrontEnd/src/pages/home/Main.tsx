import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

class Main extends Component<WithTranslation> {
  render() {
    const { t } = this.props;
    return (
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
        {/* Animated Background Pieces - Refined Colors */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-light/10 rounded-full rotate-12 animate-pulse blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full -rotate-12 animate-bounce blur-[100px] delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-light/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col items-center">
          {/* Logo Box */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-primary-light blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-primary-light to-primary-dark rounded-[2.5rem] rotate-45 flex items-center justify-center shadow-[0_20px_50px_rgba(14,165,233,0.3)] border-4 border-white/20 dark:border-white/5 transform hover:rotate-[225deg] transition-transform duration-1000 cursor-pointer">
              <span className="logo-font text-white text-7xl md:text-9xl -rotate-45">S</span>
            </div>
          </div>

          {/* Title and Slogan Group */}
          <div className="flex flex-col items-center -space-y-2 mb-10">
            <h1 className="title text-6xl md:text-[8rem] text-primary-dark dark:text-white tracking-tighter leading-none">
              {t('HOME.MAIN_TITLE')}
            </h1>
            <p className="body text-xl md:text-3xl text-primary-dark/70 dark:text-slate-300 max-w-3xl mx-auto italic font-light tracking-wide">
              {t('HOME.SLOGAN')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center mt-6">
            <button className="px-12 py-5 bg-primary-light hover:bg-primary-dark text-white rounded-2xl title text-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all hover:scale-105 hover:-translate-y-1">
              EXPLORAR UNIVERSO
            </button>
            <button className="px-12 py-5 glass-card border-primary-light/30 hover:bg-primary-light/10 dark:text-white rounded-2xl title text-2xl transition-all hover:scale-105">
              {t('NAVBAR.LOGIN')}
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
           <div className="w-1 h-12 bg-gradient-to-b from-primary-light to-transparent rounded-full"></div>
        </div>
      </section>
    );
  }
}

export const HomeMain = withTranslation()(Main);

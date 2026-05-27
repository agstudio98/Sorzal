import { Component } from 'react';
import { Mail, Globe, Phone, Link as LinkIcon } from 'lucide-react';

export class Footer extends Component {
  render() {
    return (
      <footer className="w-full pt-20 pb-10 px-6 bg-deep-ocean/5 dark:bg-black/40 relative overflow-hidden border-t border-primary-light/10">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-light/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="logo-font text-3xl text-primary-dark dark:text-white flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-light to-primary-dark rounded-xl rotate-45 flex items-center justify-center shadow-lg">
                <span className="-rotate-45 text-white text-2xl">S</span>
              </div>
              SORZAL
            </div>
            <p className="body text-lg opacity-70 leading-relaxed italic">
              "El cielo donde todo encaja." <br />
              Un ecosistema digital completo diseñado para la conexión humana y creativa.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <InstagramReplacement />, label: "Social" },
                { icon: <LinkIcon size={20} />, label: "Web" },
                { icon: <Mail size={20} />, label: "Contact" },
              ].map((social, i) => (
                <button key={i} className="p-3 glass-card hover:bg-primary-light hover:text-white transition-all group" title={social.label}>
                  <span className="group-hover:scale-110 transition-transform block">{social.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="title text-xl uppercase tracking-widest text-primary-light">Ecosistema</h4>
            <ul className="space-y-3 body opacity-70">
              <li><a href="/photography" className="hover:text-primary-light transition-colors">Fotografía</a></li>
              <li><a href="/forum" className="hover:text-primary-light transition-colors">Foros Globales</a></li>
              <li><a href="/marketplace" className="hover:text-primary-light transition-colors">Marketplace</a></li>
              <li><a href="/reels" className="hover:text-primary-light transition-colors">Sorzal Reels</a></li>
              <li><a href="/games" className="hover:text-primary-light transition-colors">Arena Gaming</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-6">
            <h4 className="title text-xl uppercase tracking-widest text-primary-light">Comunidad</h4>
            <ul className="space-y-3 body opacity-70">
              <li><a href="/partners" className="hover:text-primary-light transition-colors">Afinidades</a></li>
              <li><a href="/courses" className="hover:text-primary-light transition-colors">Sorzal Academy</a></li>
              <li><a href="/dev" className="hover:text-primary-light transition-colors">Repositorio Dev</a></li>
              <li><a href="/support" className="hover:text-primary-light transition-colors">Centro de Ayuda</a></li>
              <li><a href="/profile" className="hover:text-primary-light transition-colors">Gestión de Perfil</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="title text-xl uppercase tracking-widest text-primary-light">Contacto</h4>
            <div className="space-y-4 body opacity-70">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary-light" />
                <span>hola@sorzal.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-primary-light" />
                <span>+54 (261) 555-SORZAL</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary-light" />
                <span>Mendoza, Argentina</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="glass-card p-4 border-primary-light/10 text-xs font-bold uppercase tracking-widest text-center">
                 V 1.0.0 "BLUE OCEAN"
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-primary-light/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="title text-sm opacity-50 tracking-[0.2em]">
            © 2026 DESARROLLADO POR AG STUDIO'S
          </p>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest opacity-40">
            <a href="#" className="hover:text-primary-light transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary-light transition-colors">Términos</a>
            <a href="#" className="hover:text-primary-light transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    );
  }
}

const InstagramReplacement = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

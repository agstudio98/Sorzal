import { Component } from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';

export class HomePartner extends Component {
  render() {
    const partners = [
      { id: 1, name: "Elena, 24", match: "98%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
      { id: 2, name: "Marcos, 28", match: "95%", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
      { id: 3, name: "Sofía, 22", match: "92%", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
    ];

    return (
      <section className="py-20 bg-gradient-to-b from-transparent to-primary-light/10 dark:to-primary-dark/30 relative">
        {/* Floating Hearts Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
           <Heart className="absolute top-10 left-[10%] animate-bounce text-primary-light" size={40}/>
           <Heart className="absolute bottom-20 right-[15%] animate-pulse text-secondary-light" size={30}/>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center mb-12">
            <Sparkles className="text-secondary-light mb-4" size={48} />
            <h2 className="title text-5xl text-primary-dark dark:text-white">ENCUENTRA TU LUGAR</h2>
            <p className="body text-xl opacity-70 italic mt-2">¿Estás listo para el match perfecto?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {partners.map((p) => (
              <div key={p.id} className="group relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-light to-secondary-light rounded-[50px] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative glass-card p-4 overflow-hidden rounded-[40px] border-2 border-transparent group-hover:border-primary-light/50 transition-all transform group-hover:scale-105">
                  <div className="relative aspect-square rounded-[30px] overflow-hidden mb-6">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-primary-dark/90 px-3 py-1 rounded-full flex items-center gap-1 font-bold text-secondary-light shadow-lg">
                      <Star size={16} fill="currentColor" />
                      {p.match}
                    </div>
                  </div>
                  <h3 className="title text-3xl text-primary-dark dark:text-white">{p.name}</h3>
                  <button className="mt-4 w-full py-3 bg-secondary-light text-primary-dark font-bold title rounded-2xl hover:bg-secondary-light/80 transition-colors shadow-md">
                    DAR SUERTE 🍀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

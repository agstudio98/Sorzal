import { Component } from 'react';
import { Heart, X, Star, MapPin, Sliders } from 'lucide-react';

export class PartnersPage extends Component {
  render() {
    const profiles = Array.from({ length: 1 }).map((_, i) => ({
      id: i + 1,
      name: "Elena",
      age: 24,
      match: "98%",
      bio: "Amante de la fotografía y los rompecabezas complejos. Busco a alguien para conectar en el cielo Sorzal. 🧩✨",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=1000&fit=crop"
    }));

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <h1 className="title text-6xl uppercase tracking-tighter mb-4 text-center">Parejas Sorzal</h1>
        <p className="body text-xl opacity-60 mb-12 text-center">Donde la suerte se encuentra con la conexión verdadera.</p>

        <div className="w-full max-w-md relative animate-in zoom-in duration-500">
           {profiles.map(p => (
             <div key={p.id} className="relative glass-card overflow-hidden rounded-[50px] shadow-2xl border-4 border-white/20">
                <div className="h-[500px] overflow-hidden">
                   <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                   
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-transparent to-transparent"></div>

                   {/* Badges */}
                   <div className="absolute top-6 left-6 flex gap-2">
                      <div className="bg-secondary-light/90 text-primary-dark px-4 py-1 rounded-full font-bold title text-sm flex items-center gap-1 shadow-lg">
                         <Star size={14} fill="currentColor"/> {p.match} MATCH
                      </div>
                   </div>
                   
                   <div className="absolute bottom-10 left-10 right-10 text-white">
                      <h2 className="title text-5xl mb-2">{p.name}, {p.age}</h2>
                      <p className="body text-sm opacity-80 flex items-center gap-2 mb-4">
                         <MapPin size={16} className="text-primary-light" /> Buenos Aires, AR
                      </p>
                      <p className="body text-lg italic line-clamp-2 opacity-90">{p.bio}</p>
                   </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-white/10 backdrop-blur-md flex justify-around items-center border-t border-white/20">
                   <button className="w-16 h-16 bg-white/20 hover:bg-red-500 hover:text-white transition-all rounded-full flex items-center justify-center text-red-500 shadow-xl border-2 border-red-500/20">
                      <X size={32} />
                   </button>
                   <button className="w-20 h-20 bg-secondary-light text-primary-dark hover:scale-110 transition-all rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.4)] border-4 border-white/30">
                      <Star size={40} fill="currentColor" />
                   </button>
                   <button className="w-16 h-16 bg-white/20 hover:bg-primary-light hover:text-white transition-all rounded-full flex items-center justify-center text-primary-light shadow-xl border-2 border-primary-light/20">
                      <Heart size={32} />
                   </button>
                </div>
             </div>
           ))}

           {/* Filter Button */}
           <button className="mt-10 mx-auto px-8 py-3 glass-card border-primary-light/30 rounded-full title flex items-center gap-2 hover:bg-primary-light/10 transition-all shadow-md">
              <Sliders size={20}/> PREFERENCIAS
           </button>
        </div>
      </main>
    );
  }
}

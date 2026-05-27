import { Component } from 'react';
import { Gamepad2, Download, Play, Trophy } from 'lucide-react';

export class HomeGames extends Component {
  render() {
    const games = [
      { id: 1, title: "Sorzal Quest", rating: "4.8", dev: "Ag Studio", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" },
      { id: 2, title: "Puzzle Connect", rating: "4.5", dev: "DevWorld", img: "https://images.unsplash.com/photo-1614027164847-1b28096a6f44?w=800&q=80" },
      { id: 3, title: "Sky Runner", rating: "4.7", dev: "CloudGames", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" },
    ];

    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
          <div className="text-center md:text-left">
            <h2 className="title text-5xl text-primary-dark dark:text-white flex items-center gap-4 justify-center md:justify-start">
              <Gamepad2 size={48} className="text-primary-light" />
              ZONA GAMING
            </h2>
            <p className="body text-xl opacity-60">Juega, califica y descarga mundos asombrosos</p>
          </div>
          <div className="flex bg-primary-light/10 p-2 rounded-full border-2 border-primary-light/20">
            <button className="px-6 py-2 bg-primary-light text-white rounded-full title shadow-lg transition-transform hover:scale-105">POPULARES</button>
            <button className="px-6 py-2 hover:bg-white/10 dark:text-white rounded-full title transition-all">NUEVOS</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {games.map((game) => (
            <div key={game.id} className="relative group perspective">
              <div className="relative glass-card overflow-hidden rounded-[40px] shadow-2xl transition-all duration-500 transform group-hover:rotate-x-12 group-hover:-translate-y-4 border-2 border-transparent group-hover:border-primary-light/30">
                <div className="h-64 overflow-hidden relative">
                  <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                      <Play size={32} fill="currentColor" />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary-light/10 px-3 py-1 rounded-lg">
                      {game.dev}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Trophy size={16} fill="currentColor" />
                      <span className="font-bold">{game.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="title text-3xl text-primary-dark dark:text-white mb-6">{game.title}</h3>
                  
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-primary-dark dark:bg-primary-light text-white rounded-2xl title text-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">
                      <Play size={20} /> JUGAR
                    </button>
                    <button className="p-3 bg-white/5 dark:bg-white/10 border-2 border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                      <Download size={24} className="text-primary-dark dark:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}

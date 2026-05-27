import { Component } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export class HomeCarrousel extends Component {
  state = { currentIndex: 0 };
  
  images = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80"
  ];

  next = () => this.setState({ currentIndex: (this.state.currentIndex + 1) % this.images.length });
  prev = () => this.setState({ currentIndex: (this.state.currentIndex - 1 + this.images.length) % this.images.length });

  render() {
    return (
      <section className="relative h-[600px] w-full overflow-hidden group">
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${this.state.currentIndex * 100}%)` }}
        >
          {this.images.map((img, i) => (
            <div key={i} className="min-w-full h-full relative">
              <img src={img} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-transparent to-primary-dark/80 flex items-center justify-center">
                 <div className="text-center space-y-4 px-6 max-w-4xl">
                    <h2 className="title text-5xl md:text-8xl text-white drop-shadow-2xl opacity-0 translate-y-10 animate-in fade-in slide-in-from-bottom-10 fill-mode-forwards duration-1000">EXPLORA EL CIELO DIGITAL</h2>
                    <p className="body text-xl md:text-2xl text-white/80 italic">Descubre mundos conectados por piezas únicas.</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={this.prev} className="absolute left-10 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
           <ChevronLeft size={48} />
        </button>
        <button onClick={this.next} className="absolute right-10 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
           <ChevronRight size={48} />
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
           {this.images.map((_, i) => (
             <button 
               key={i} 
               onClick={() => this.setState({ currentIndex: i })}
               className={`w-3 h-3 rounded-full transition-all ${this.state.currentIndex === i ? 'bg-primary-light w-10' : 'bg-white/50'}`}
             />
           ))}
        </div>
      </section>
    );
  }
}

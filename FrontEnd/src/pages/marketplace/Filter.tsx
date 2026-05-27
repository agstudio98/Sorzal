import { Component } from 'react';
import { Search, ShoppingBag, Tag } from 'lucide-react';

interface FilterProps {
  activeCategory: string;
  setCategory: (cat: string) => void;
}

export class MarketplaceFilter extends Component<FilterProps> {
  render() {
    const { activeCategory, setCategory } = this.props;
    const categories = ['Todos', 'Hardware', 'Software', 'Cámaras', 'Lentes', 'Accesorios'];

    return (
      <div className="space-y-8 mb-16">
        <div className="glass-card p-8 flex flex-col lg:flex-row gap-8 items-center shadow-xl border-2 border-primary-light/20 relative overflow-hidden">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light transition-transform group-focus-within:scale-125" size={24} />
            <input 
              type="text" 
              placeholder="¿Qué pieza buscas hoy en el Marketplace?" 
              className="w-full pl-14 pr-4 py-4 bg-white/5 border-2 border-primary-light/20 rounded-3xl focus:border-primary-light outline-none transition-all body text-xl"
            />
          </div>
          
          <button className="px-10 py-4 bg-primary-light text-white rounded-3xl title text-xl hover:shadow-[0_0_20px_rgba(163,230,53,0.5)] transition-all flex items-center gap-2 group">
             <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform"/> EXPLORAR
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)}
              className={`px-8 py-2.5 rounded-2xl title text-[10px] uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap flex items-center gap-2 ${
                activeCategory === cat
                ? 'bg-primary-light text-white border-primary-light shadow-lg scale-105'
                : 'glass-card border-primary-light/10 text-primary-dark/60 dark:text-white/60 hover:border-primary-light/40'
              }`}
            >
              <Tag size={12} /> {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

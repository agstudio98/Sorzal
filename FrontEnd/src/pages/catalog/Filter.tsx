import { Component } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export class CatalogFilter extends Component {
  render() {
    return (
      <div className="glass-card p-6 mb-12 flex flex-col md:flex-row gap-6 items-center shadow-lg sticky top-24 z-40">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light" size={20} />
          <input 
            type="text" 
            placeholder="Buscar en el catálogo..." 
            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 border-2 border-primary-light/20 rounded-2xl focus:border-primary-light outline-none transition-all body"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none relative">
            <select className="w-full md:w-48 pl-4 pr-10 py-3 bg-white/10 dark:bg-white/5 border-2 border-primary-light/20 rounded-2xl appearance-none outline-none focus:border-primary-light body cursor-pointer">
              <option value="">Categorías</option>
              <option value="photography">Fotografía</option>
              <option value="posts">Posts</option>
              <option value="reels">Reels</option>
              <option value="hilos">Hilos</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-light pointer-events-none" size={18} />
          </div>

          <div className="flex-1 md:flex-none relative">
            <select className="w-full md:w-48 pl-4 pr-10 py-3 bg-white/10 dark:bg-white/5 border-2 border-primary-light/20 rounded-2xl appearance-none outline-none focus:border-primary-light body cursor-pointer">
              <option value="newest">Más nuevos</option>
              <option value="popular">Más populares</option>
              <option value="rated">Mejor valorados</option>
            </select>
            <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-light pointer-events-none" size={18} />
          </div>
        </div>
      </div>
    );
  }
}

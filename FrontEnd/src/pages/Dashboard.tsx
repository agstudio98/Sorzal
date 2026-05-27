import { Component } from 'react';
import { BarChart3, Users, MessageSquare, ShoppingBag, ArrowUpRight, TrendingUp } from 'lucide-react';

export class Dashboard extends Component {
  render() {
    const stats = [
      { label: 'Publicaciones', value: '124', growth: '+12%', icon: <BarChart3/> },
      { label: 'Seguidores', value: '1.2k', growth: '+5%', icon: <Users/> },
      { label: 'Mensajes', value: '45', growth: '+18%', icon: <MessageSquare/> },
      { label: 'Ventas', value: '$1,240', growth: '+25%', icon: <ShoppingBag/> },
    ];

    return (
      <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
           <h1 className="title text-5xl uppercase tracking-widest">Panel de Control</h1>
           <div className="flex items-center gap-2 bg-primary-light/20 px-4 py-2 rounded-full border border-primary-light/30">
              <TrendingUp size={20} className="text-primary-light" />
              <span className="body font-bold text-sm">RENDIMIENTO ÓPTIMO</span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
           {stats.map((s, i) => (
             <div key={i} className="glass-card p-8 group hover:-translate-y-2 transition-all border-b-4 border-primary-light shadow-lg">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-primary-light rounded-2xl text-white shadow-lg">{s.icon}</div>
                   <span className="text-green-500 font-bold flex items-center gap-1 text-sm bg-green-500/10 px-2 py-1 rounded-lg">
                      <ArrowUpRight size={14}/> {s.growth}
                   </span>
                </div>
                <h3 className="body text-lg opacity-60 font-bold uppercase tracking-widest mb-1">{s.label}</h3>
                <p className="title text-4xl">{s.value}</p>
             </div>
           ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass-card p-8 h-[400px] flex items-center justify-center border-t-8 border-secondary-light">
              <div className="text-center opacity-40">
                 <BarChart3 size={80} className="mx-auto mb-4" />
                 <p className="title text-2xl uppercase">Visualización de Actividad</p>
                 <p className="body italic">Gráficos interactivos en desarrollo...</p>
              </div>
           </div>

           <div className="glass-card p-8 border-t-8 border-primary-light">
              <h3 className="title text-2xl mb-8 uppercase tracking-widest">Actividad Reciente</h3>
              <div className="space-y-6">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-primary-light/20 rounded-xl flex-shrink-0"></div>
                      <div>
                         <p className="body font-bold text-sm">Nuevo comentario en "Puzzle Connect"</p>
                         <p className="text-xs opacity-50">Hace {i * 10} minutos</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    );
  }
}

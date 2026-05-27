import { Component } from 'react';
import { 
  Gamepad2, Star, Search, Play,
  ChevronLeft, ChevronRight, User as UserIcon, Shield
} from 'lucide-react';
import { withRouter } from '../utils/withRouter';
import { GAMES_DATA, type Game } from '../data/games';
import { fetchGames } from '../api';

interface GamesState {
  searchQuery: string;
  selectedCategory: string;
  currentPage: number;
  communityGames: any[];
  loading: boolean;
  activeTab: 'official' | 'community';
}

const ITEMS_PER_PAGE = 6;

class Games extends Component<any, GamesState> {
  state: GamesState = {
    searchQuery: '',
    selectedCategory: 'Todos',
    currentPage: 1,
    communityGames: [],
    loading: true,
    activeTab: 'official'
  };

  componentDidMount() {
    this.loadCommunityGames();
  }

  loadCommunityGames = async () => {
    try {
      const games = await fetchGames();
      this.setState({ communityGames: games, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  };

  handlePlay = (gameId: string) => {
    this.props.router.navigate(`/games/${gameId}`);
  };

  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value, currentPage: 1 });
  };

  handleCategoryChange = (category: string) => {
    this.setState({ selectedCategory: category, currentPage: 1 });
  };

  handlePageChange = (page: number) => {
    this.setState({ currentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  render() {
    const { searchQuery, selectedCategory, currentPage, communityGames, activeTab } = this.state;

    const baseGames = activeTab === 'official' 
      ? GAMES_DATA 
      : communityGames.filter(g => !g.isOfficial).map(g => ({
          id: g._id,
          title: g.title,
          category: g.category,
          description: g.description,
          icon: <Gamepad2 size={120} />,
          color: 'text-primary-light',
          rating: g.rating.toFixed(1),
          user: g.user
        }));

    const filteredGames = baseGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const categories = ['Todos', 'Arcade', 'Puzzle', 'Acción', 'Retro', 'Estrategia', 'Ritmo'];

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-4 md:px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="text-center md:text-left space-y-2">
                <h1 className="title text-6xl md:text-8xl text-primary-dark dark:text-white uppercase tracking-tighter flex items-center gap-6 justify-center md:justify-start">
                   <Gamepad2 size={72} className="text-primary-light" /> ARENA <span className="text-primary-light italic">GAMING</span>
                </h1>
                <p className="body text-2xl opacity-60 font-light italic">Experiencias interactivas, piezas de código que cobran vida.</p>
             </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-primary-light/20 gap-8">
             <button 
                onClick={() => this.setState({ activeTab: 'official', currentPage: 1 })}
                className={`pb-4 title text-xl tracking-widest transition-all flex items-center gap-2 ${activeTab === 'official' ? 'text-primary-light border-b-2 border-primary-light' : 'opacity-40 hover:opacity-100'}`}
             >
                <Shield size={20} /> OFICIALES
             </button>
             <button 
                onClick={() => this.setState({ activeTab: 'community', currentPage: 1 })}
                className={`pb-4 title text-xl tracking-widest transition-all flex items-center gap-2 ${activeTab === 'community' ? 'text-primary-light border-b-2 border-primary-light' : 'opacity-40 hover:opacity-100'}`}
             >
                <UserIcon size={20} /> COMUNIDAD
             </button>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
             <div className="glass-card flex items-center px-8 py-4 gap-4 focus-within:ring-2 focus-within:ring-primary-light/30 transition-all">
                <Search size={24} className="text-primary-light" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={this.handleSearchChange}
                  placeholder={activeTab === 'official' ? "Buscar juegos oficiales..." : "Buscar juegos de la comunidad..."}
                  className="bg-transparent border-none outline-none w-full body text-xl text-primary-dark dark:text-white"
                />
             </div>
             <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => this.handleCategoryChange(cat)}
                    className={`px-8 py-3 glass-card rounded-2xl body font-bold uppercase tracking-widest text-xs transition-all whitespace-nowrap border-white/10 ${selectedCategory === cat ? 'bg-primary-light text-white border-primary-light' : 'hover:border-primary-light hover:text-primary-light'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {paginatedGames.map((game: any) => (
               <div 
                key={game.id} 
                className="glass-card group relative overflow-hidden flex flex-col border-b-8 border-transparent hover:border-primary-light transition-all duration-700 hover:-translate-y-4"
               >
                  {/* Icon Area */}
                  <div className="h-64 bg-primary-dark/5 dark:bg-black/20 flex items-center justify-center relative overflow-hidden">
                     <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-white to-transparent`}></div>
                     <div className={`${game.color} opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1000 transform group-hover:rotate-12`}>
                        {game.icon}
                     </div>
                     
                     {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-primary-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                        <button 
                          onClick={() => this.handlePlay(game.id)}
                          className="w-24 h-24 bg-primary-light text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                        >
                           <Play size={48} fill="currentColor" className="translate-x-1" />
                        </button>
                     </div>

                     {activeTab === 'community' && game.user && (
                       <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center text-[10px] title text-white">
                             {game.user.avatar ? <img src={game.user.avatar} className="w-full h-full rounded-full object-cover"/> : (game.user.name || 'U').charAt(0)}
                          </div>
                          <span className="title text-[8px] text-white uppercase tracking-widest">@{game.user.name}</span>
                       </div>
                     )}
                  </div>

                  {/* Content Area */}
                  <div className="p-10 space-y-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary-light">{game.category}</span>
                        <div className="flex items-center gap-1.5 text-yellow-500">
                           <Star size={14} fill="currentColor" />
                           <span className="title text-sm">{game.rating}</span>
                        </div>
                     </div>
                     
                     <div className="space-y-2 flex-1">
                        <h3 className="title text-4xl text-primary-dark dark:text-white tracking-tighter">{game.title}</h3>
                        <div className="flex items-center gap-2 mb-2 opacity-40">
                           <Shield size={12} className="text-primary-light" />
                           <span className="text-[9px] uppercase font-bold tracking-widest">
                              {game.id?.length > 20 ? ( // Check if it's a MongoDB ID
                                `${new Date(communityGames.find(cg => cg._id === game.id)?.createdAt).toLocaleDateString()} - ${new Date(communityGames.find(cg => cg._id === game.id)?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              ) : 'Sitio Original'}
                           </span>
                        </div>
                        <p className="body text-sm opacity-60 line-clamp-2 italic">{game.description}</p>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => this.handlePlay(game.id)}
                          className="flex-1 py-4 bg-primary-light text-white rounded-2xl title text-xl shadow-lg hover:bg-primary-dark transition-all"
                        >
                           PLAY
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-10">
              <button 
                onClick={() => this.handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-4 glass-card rounded-2xl disabled:opacity-30 hover:bg-primary-light hover:text-white transition-all border-white/10"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => this.handlePageChange(page)}
                    className={`w-14 h-14 rounded-2xl title text-xl transition-all border-white/10 ${currentPage === page ? 'bg-primary-light text-white' : 'glass-card hover:border-primary-light'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => this.handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-4 glass-card rounded-2xl disabled:opacity-30 hover:bg-primary-light hover:text-white transition-all border-white/10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {filteredGames.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <p className="title text-4xl opacity-20 uppercase">No se encontraron juegos</p>
              <button 
                onClick={() => this.setState({ searchQuery: '', selectedCategory: 'Todos' })}
                className="text-primary-light body font-bold uppercase tracking-widest hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }
}

export const GamesPage = withRouter(Games);

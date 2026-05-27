import { Component } from 'react';
import { 
  Mic2, Headphones, Play, List, Clock, Share2, 
  Search, Heart, Pause, SkipForward, SkipBack, 
  Volume2, Loader2, Bookmark, ChevronLeft, ChevronRight,
  Upload, X, Check, AlertCircle, Info
} from 'lucide-react';
import { fetchPodcasts, toggleLikePodcast, createPodcast } from '../api';
import { withRouter } from '../utils/withRouter';

interface Podcast {
  _id: string;
  title: string;
  description: string;
  host: string;
  audioUrl: string;
  imageUrl: string;
  category: string;
  duration: string;
  likes: string[];
  createdAt: string;
}

interface PodcastingState {
  podcasts: Podcast[];
  loading: boolean;
  keyword: string;
  category: string;
  showFavorites: boolean;
  page: number;
  pages: number;
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  savedPodcasts: string[];
  playbackPositions: { [key: string]: number };
  audio: HTMLAudioElement | null;
  currentTime: number;
  duration: number;
  volume: number;

  // Upload Form State
  showUploadModal: boolean;
  uploading: boolean;
  formTitle: string;
  formDesc: string;
  formHost: string;
  formCategory: string;
  formFile: File | null;
  notifications: { id: number; message: string; type: 'success' | 'error' | 'info' }[];
}

export class PodcastingPageBase extends Component<{ user: any, router?: any }, PodcastingState> {
  state: PodcastingState = {
    podcasts: [],
    loading: true,
    keyword: '',
    category: 'Todos',
    showFavorites: false,
    page: 1,
    pages: 1,
    currentPodcast: null,
    isPlaying: false,
    savedPodcasts: JSON.parse(localStorage.getItem('savedPodcasts') || '[]'),
    playbackPositions: JSON.parse(localStorage.getItem('podcastPlayback') || '{}'),
    audio: null,
    currentTime: 0,
    duration: 0,
    volume: Number(localStorage.getItem('podcastVolume')) || 0.8,

    showUploadModal: false,
    uploading: false,
    formTitle: '',
    formDesc: '',
    formHost: this.props.user?.name || '',
    formCategory: 'Tecnología',
    formFile: null,
    notifications: []
  };

  componentDidMount() {
    this.loadPodcasts();
    if (this.props.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      window.history.replaceState({}, document.title);
    }
  }

  componentWillUnmount() {
    if (this.state.audio) {
      this.savePlaybackPosition();
      this.state.audio.pause();
      this.state.audio.src = '';
    }
  }

  addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    this.setState(prev => ({
      notifications: [...prev.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      this.setState(prev => ({
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    }, 4000);
  };

  savePlaybackPosition = () => {
    const { currentPodcast, currentTime, playbackPositions } = this.state;
    if (currentPodcast) {
      const newPositions = { ...playbackPositions, [currentPodcast._id]: currentTime };
      this.setState({ playbackPositions: newPositions });
      localStorage.setItem('podcastPlayback', JSON.stringify(newPositions));
    }
  };

  loadPodcasts = async (page = 1) => {
    this.setState({ loading: true, page });
    try {
      const { user } = this.props;
      const data = await fetchPodcasts(
        page, 
        this.state.keyword, 
        this.state.category, 
        this.state.showFavorites,
        user?._id
      );
      this.setState({ 
        podcasts: data.podcasts || [], 
        pages: data.pages || 1, 
        loading: false 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      this.setState({ podcasts: [], loading: false });
    }
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    this.loadPodcasts(1);
  };

  togglePlay = (podcast: Podcast) => {
    const { currentPodcast, isPlaying, audio, playbackPositions } = this.state;

    if (currentPodcast?._id === podcast._id) {
      if (isPlaying) {
        audio?.pause();
        this.savePlaybackPosition();
        this.setState({ isPlaying: false });
      } else {
        audio?.play();
        this.setState({ isPlaying: true });
      }
    } else {
      if (audio) {
        this.savePlaybackPosition();
        audio.pause();
      }
      
      const newAudio = new Audio(podcast.audioUrl);
      newAudio.volume = this.state.volume;
      const savedPos = playbackPositions[podcast._id] || 0;
      newAudio.currentTime = savedPos;
      
      newAudio.addEventListener('timeupdate', () => {
        this.setState({ currentTime: newAudio.currentTime });
        if (Math.floor(newAudio.currentTime) % 10 === 0) this.savePlaybackPosition();
      });

      newAudio.addEventListener('loadedmetadata', () => {
        this.setState({ duration: newAudio.duration });
      });

      newAudio.addEventListener('ended', () => {
        this.handleNext();
      });

      newAudio.play();
      this.setState({ 
        currentPodcast: podcast, 
        isPlaying: true, 
        audio: newAudio,
        currentTime: savedPos
      });
    }
  };

  handleNext = () => {
    const { podcasts, currentPodcast } = this.state;
    if (!currentPodcast || podcasts.length === 0) return;
    
    const currentIndex = podcasts.findIndex(p => p._id === currentPodcast._id);
    const nextIndex = (currentIndex + 1) % podcasts.length;
    this.togglePlay(podcasts[nextIndex]);
  };

  handleSkip = (seconds: number) => {
    const { audio } = this.state;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
      this.setState({ currentTime: audio.currentTime });
    }
  };

  handleToggleLike = async (id: string) => {
    const { user } = this.props;
    if (!user) return this.addNotification('Inicia sesión para dar like', 'info');
    try {
      const { likes } = await toggleLikePodcast(id, user._id);
      this.setState(prev => ({
        podcasts: prev.podcasts.map(p => p._id === id ? { ...p, likes } : p),
        currentPodcast: prev.currentPodcast?._id === id ? { ...prev.currentPodcast, likes } : prev.currentPodcast
      }));
    } catch (error) {
      this.addNotification('Error al procesar like', 'error');
    }
  };

  handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = this.props;
    const { formTitle, formDesc, formHost, formCategory, formFile } = this.state;

    if (!formTitle || !formFile) return this.addNotification('Título y archivo son obligatorios', 'info');

    this.setState({ uploading: true });
    const formData = new FormData();
    formData.append('title', formTitle);
    formData.append('description', formDesc);
    formData.append('host', formHost);
    formData.append('category', formCategory);
    formData.append('userId', user._id);
    formData.append('audio', formFile);

    try {
      await createPodcast(formData);
      this.addNotification('Podcast publicado con éxito', 'success');
      this.setState({ 
        showUploadModal: false, 
        uploading: false,
        formTitle: '', formDesc: '', formFile: null
      });
      this.loadPodcasts(1);
    } catch (error) {
      this.addNotification('Error al subir el podcast', 'error');
      this.setState({ uploading: false });
    }
  };

  formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  render() {
    const { 
      podcasts, loading, keyword, category, currentPodcast, 
      isPlaying, currentTime, duration, page, pages, volume,
      showUploadModal, uploading, formTitle, formDesc, formHost, 
      formCategory, showFavorites, notifications
    } = this.state;
    const { user } = this.props;

    const categories = ['Todos', 'Tecnología', 'Diseño', 'Finanzas', 'Gaming', 'Debate'];

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-40 px-6 transition-colors duration-500">
        {/* Notifications */}
        <div className="fixed top-24 right-6 z-[300] flex flex-col gap-4 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 pointer-events-auto backdrop-blur-xl border border-white/10 ${
              n.type === 'success' ? 'bg-emerald-500/90 text-white' : n.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-sky-500/90 text-white'
            }`}>
              {n.type === 'success' ? <Check size={20}/> : n.type === 'error' ? <AlertCircle size={20}/> : <Info size={20}/>}
              <p className="title text-sm uppercase tracking-wider">{n.message}</p>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-12 mb-20 items-center justify-between">
             <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-4 px-6 py-2 bg-primary-light/10 text-primary-light rounded-full border border-primary-light/20">
                   <Mic2 size={20} className="animate-pulse" />
                   <span className="title text-sm tracking-widest uppercase">Streaming Sorzal</span>
                </div>
                <h1 className="title text-7xl md:text-9xl text-primary-dark dark:text-white uppercase tracking-tighter leading-none">
                   POD<span className="text-primary-light italic">CAST</span>
                </h1>
                <p className="body text-2xl opacity-60 font-light italic max-w-xl">
                   Sintoniza la vanguardia tecnológica y creativa de nuestro ecosistema.
                </p>
                <button 
                  onClick={() => this.setState({ showUploadModal: true })}
                  className="px-10 py-4 bg-primary-light text-white rounded-2xl title text-xl shadow-xl flex items-center gap-3 hover:scale-105 transition-all mx-auto lg:mx-0"
                >
                   <Upload size={24} /> SUBIR EPISODIO
                </button>
             </div>

             <form onSubmit={this.handleSearch} className="w-full lg:w-1/3 space-y-4">
                <div className="relative group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary-light transition-all" size={24} />
                   <input 
                    type="text" 
                    value={keyword}
                    onChange={e => this.setState({ keyword: e.target.value })}
                    placeholder="Busca episodios, hosts..."
                    className="w-full bg-white/5 border-2 border-primary-light/10 rounded-3xl py-6 pl-16 pr-8 body text-xl outline-none focus:border-primary-light transition-all shadow-xl"
                   />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                   {categories.map(cat => (
                     <button
                      key={cat}
                      onClick={() => this.setState({ category: cat, showFavorites: false, page: 1 }, () => this.loadPodcasts(1))}
                      className={`px-6 py-2 rounded-full title text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                        category === cat && !showFavorites ? 'bg-primary-light text-white border-primary-light' : 'bg-white/5 text-primary-light border-primary-light/20 hover:border-primary-light'
                      }`}
                     >
                        {cat}
                     </button>
                   ))}
                   <button
                    onClick={() => this.setState({ showFavorites: true, category: 'Todos', page: 1 }, () => this.loadPodcasts(1))}
                    className={`px-6 py-2 rounded-full title text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-2 ${
                      showFavorites ? 'bg-rose-500 text-white border-rose-500' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:border-rose-500'
                    }`}
                   >
                      <Heart size={14} fill={showFavorites ? 'currentColor' : 'none'} /> FAVORITOS
                   </button>
                </div>
             </form>
          </div>

          {/* Podcast Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
               <Loader2 size={64} className="animate-spin text-primary-light opacity-20" />
               <p className="title text-xl opacity-20 uppercase tracking-widest">Sintonizando...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {Array.isArray(podcasts) && podcasts.map(pod => (
                  <div key={pod._id} className="glass-card group relative overflow-hidden flex flex-col border-b-8 border-transparent hover:border-primary-light transition-all duration-700 hover:-translate-y-4 p-8">
                      <div className="relative mb-8 aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                        <img src={pod.imageUrl} alt={pod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button 
                              onClick={() => this.togglePlay(pod)}
                              className="w-24 h-24 bg-primary-light text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                            >
                              {currentPodcast?._id === pod._id && isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                            </button>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary-light">{pod.category}</span>
                            <div className="flex flex-col items-end opacity-40">
                               <span className="text-[10px] uppercase font-bold flex items-center gap-1"><Clock size={12}/> {pod.duration || '00:00'}</span>
                               <span className="text-[8px] uppercase font-bold tracking-tighter">
                                  {new Date(pod.createdAt).toLocaleDateString()} - {new Date(pod.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                        </div>
                        <h3 className="title text-3xl text-primary-dark dark:text-white tracking-tighter line-clamp-2">{pod.title}</h3>
                        <p className="body text-sm opacity-60 line-clamp-2 italic leading-relaxed">"{pod.description}"</p>
                      </div>

                      <div className="flex justify-between items-center pt-8 mt-6 border-t border-primary-light/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-light/20 flex items-center justify-center text-primary-light title text-lg overflow-hidden">
                                {pod.imageUrl ? <img src={pod.imageUrl} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all"/> : pod.host.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold opacity-40">Host</p>
                              <p className="title text-sm uppercase">{pod.host}</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => this.handleToggleLike(pod._id)}
                          className={`p-3 rounded-xl transition-all ${pod.likes.includes(user?._id) ? 'bg-rose-500 text-white' : 'bg-primary-light/5 text-primary-light hover:bg-rose-500/10'}`}
                        >
                          <Heart size={20} fill={pod.likes.includes(user?._id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-20">
                   <button disabled={page === 1} onClick={() => this.loadPodcasts(page - 1)} className="p-4 glass-card border-primary-light/20 text-primary-light disabled:opacity-20 hover:bg-primary-light hover:text-white transition-all rounded-2xl">
                      <ChevronLeft size={32} />
                   </button>
                   <div className="flex gap-3">
                      {[...Array(pages).keys()].map(x => (
                        <button key={x + 1} onClick={() => this.loadPodcasts(x + 1)} className={`w-12 h-12 rounded-xl title flex items-center justify-center transition-all ${page === x + 1 ? 'bg-primary-light text-white shadow-lg scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                           {x + 1}
                        </button>
                      ))}
                   </div>
                   <button disabled={page === pages} onClick={() => this.loadPodcasts(page + 1)} className="p-4 glass-card border-primary-light/20 text-primary-light disabled:opacity-20 hover:bg-primary-light hover:text-white transition-all rounded-2xl">
                      <ChevronRight size={32} />
                   </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
             <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-primary-light/10 flex justify-between items-center bg-primary-light/5">
                   <h2 className="title text-3xl uppercase tracking-widest text-primary-light flex items-center gap-3">
                      <Mic2 size={32} /> PUBLICAR PODCAST
                   </h2>
                   <button onClick={() => this.setState({ showUploadModal: false })} className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all"><X size={24} /></button>
                </div>
                
                <form onSubmit={this.handleUpload} className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Título del Episodio</label>
                         <input type="text" value={formTitle} onChange={e => this.setState({ formTitle: e.target.value })} className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all" placeholder="Ej: El futuro de Sorzal UI" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Categoría</label>
                         <select value={formCategory} onChange={e => this.setState({ formCategory: e.target.value })} className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all appearance-none cursor-pointer">
                            {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Descripción</label>
                      <textarea value={formDesc} onChange={e => this.setState({ formDesc: e.target.value })} className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all min-h-[120px] resize-none" placeholder="¿De qué trata este episodio?" />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Archivo de Audio (.mp3, .wav)</label>
                      <div className="relative group/file">
                         <input type="file" accept="audio/*" onChange={e => this.setState({ formFile: e.target.files ? e.target.files[0] : null })} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                         <div className="w-full bg-primary-light/5 border-2 border-dashed border-primary-light/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover/file:border-primary-light transition-all">
                            <Mic2 size={48} className="text-primary-light opacity-40" />
                            <p className="body text-sm font-bold opacity-60">{this.state.formFile ? this.state.formFile.name : 'Selecciona el archivo de audio'}</p>
                         </div>
                      </div>
                   </div>

                   <button type="submit" disabled={uploading} className="w-full py-4 bg-primary-light text-white rounded-2xl title text-xl shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {uploading ? <Loader2 className="animate-spin" size={24}/> : <Check size={24}/>}
                      {uploading ? 'PUBLICANDO...' : 'PUBLICAR AHORA'}
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* Music Player Bar */}
        {currentPodcast && (
          <div className="fixed bottom-0 left-0 right-0 z-[200] bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-primary-light/20 p-6 animate-in slide-in-from-bottom-full duration-700">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center gap-6 w-full md:w-1/4">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg"><img src={currentPodcast.imageUrl} alt="" className="w-full h-full object-cover" /></div>
                   <div className="min-w-0">
                      <h4 className="title text-lg text-primary-dark dark:text-white truncate">{currentPodcast.title}</h4>
                      <p className="body text-xs opacity-50 uppercase truncate">{currentPodcast.host}</p>
                   </div>
                   <button onClick={() => this.handleToggleLike(currentPodcast._id)} className={`ml-4 transition-all ${currentPodcast.likes.includes(user?._id) ? 'text-rose-500 scale-125' : 'opacity-40 hover:opacity-100'}`}>
                      <Heart size={20} fill={currentPodcast.likes.includes(user?._id) ? 'currentColor' : 'none'} />
                   </button>
                </div>

                <div className="flex-1 flex flex-col items-center gap-3 w-full">
                   <div className="flex items-center gap-10">
                      <button onClick={() => this.handleSkip(-10)} className="opacity-40 hover:opacity-100"><SkipBack size={24}/></button>
                      <button onClick={() => this.togglePlay(currentPodcast)} className="w-16 h-16 bg-primary-light text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                         {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                      </button>
                      <button onClick={this.handleNext} className="opacity-40 hover:opacity-100" title="Siguiente"><SkipForward size={24}/></button>
                   </div>
                   <div className="w-full flex items-center gap-4">
                      <span className="text-[10px] font-bold opacity-40 title w-10 text-right">{this.formatTime(currentTime)}</span>
                      <input type="range" min="0" max={duration || 0} value={currentTime} onChange={e => {
                        const time = parseFloat(e.target.value);
                        if (this.state.audio) { this.state.audio.currentTime = time; this.setState({ currentTime: time }); }
                      }} className="flex-1 h-1.5 bg-primary-light/10 rounded-full appearance-none cursor-pointer accent-primary-light" />
                      <span className="text-[10px] font-bold opacity-40 title w-10">{this.formatTime(duration)}</span>
                   </div>
                </div>

                <div className="hidden md:flex items-center gap-6 w-1/4 justify-end">
                   <div className="flex items-center gap-3 w-32">
                      <Volume2 size={20} className="text-primary-light opacity-60"/>
                      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => {
                        const vol = parseFloat(e.target.value);
                        this.setState({ volume: vol });
                        if (this.state.audio) this.state.audio.volume = vol;
                        localStorage.setItem('podcastVolume', vol.toString());
                      }} className="flex-1 h-1.5 bg-primary-light/10 rounded-full appearance-none cursor-pointer accent-primary-light" />
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    );
  }
}
export const PodcastingPage = withRouter(PodcastingPageBase);

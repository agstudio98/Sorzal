import { Component, createRef } from 'react';
import { 
  Star, MessageCircle, Heart, Share2, 
  Maximize, X, Send, Trophy, Medal,
  Edit2, Trash2, Check, AlertCircle, Info,
  ArrowLeft
} from 'lucide-react';
import { withRouter } from '../utils/withRouter';
import { fetchLeaderboard, submitScore } from '../api';
import { GAMES_DATA } from '../data/games';

interface Comment {
  id: number;
  user: string;
  content: string;
  date: string;
  likes: number;
  isOwner?: boolean;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface GamePlayState {
  game: any;
  isFullscreen: boolean;
  userRating: number;
  comments: Comment[];
  newComment: string;
  editingCommentId: number | null;
  editingContent: string;
  gameStarted: boolean;
  leaderboard: any[];
  loadingLeaderboard: boolean;
  notifications: Notification[];
  isLiked: boolean;
}

class GamePlay extends Component<any, GamePlayState> {
  gameRef = createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    const { id } = props.router.params;
    
    const game = GAMES_DATA.find(g => g.id === id) || GAMES_DATA[0];

    this.state = {
      game,
      isFullscreen: false,
      userRating: 0,
      newComment: '',
      editingCommentId: null,
      editingContent: '',
      gameStarted: false,
      leaderboard: [],
      loadingLeaderboard: true,
      notifications: [],
      isLiked: false,
      comments: [
        { id: 1, user: 'Elena Visuals', content: '¡Increíble fluidez! Los efectos visuales son de otro nivel.', date: 'Hace 2 horas', likes: 24 },
        { id: 2, user: 'Marcos Games', content: 'El nivel 4 es un reto total. Me encantó la mecánica.', date: 'Hace 5 horas', likes: 12 },
        { id: 3, user: 'Tú', content: 'Este juego es mi favorito por ahora.', date: 'Hace 10 min', likes: 2, isOwner: true }
      ]
    };
  }

  async componentDidMount() {
    this.loadLeaderboard();
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

  loadLeaderboard = async () => {
    const { id } = this.props.router.params;
    try {
      const data = await fetchLeaderboard(id);
      this.setState({ leaderboard: data, loadingLeaderboard: false });
    } catch (err) {
      console.error(err);
      this.setState({ loadingLeaderboard: false });
    }
  };

  handleManualScoreSubmit = async () => {
    const { user } = this.props;
    const { id } = this.props.router.params;
    if (!user) return this.addNotification('Debes iniciar sesión para guardar tu puntuación', 'error');
    
    const points = Math.floor(Math.random() * 1000) + 500;
    try {
      await submitScore({ userId: user._id, gameId: id, points });
      this.addNotification(`¡Puntuación de ${points} guardada con éxito!`, 'success');
      this.loadLeaderboard();
    } catch (err) {
      this.addNotification('Error al conectar con el servidor de puntuaciones', 'error');
    }
  };

  toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      this.gameRef.current?.requestFullscreen();
      this.setState({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      this.setState({ isFullscreen: false });
    }
  };

  startGame = () => {
    this.setState({ gameStarted: true });
  };

  handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!this.state.newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      user: 'Tú',
      content: this.state.newComment,
      date: 'Recién',
      likes: 0,
      isOwner: true
    };

    this.setState({ 
      comments: [comment, ...this.state.comments],
      newComment: ''
    });
    this.addNotification('Comentario publicado', 'success');
  };

  handleDeleteComment = (id: number) => {
    this.setState(prev => ({
      comments: prev.comments.filter(c => c.id !== id)
    }));
    this.addNotification('Comentario eliminado', 'info');
  };

  handleStartEdit = (comment: Comment) => {
    this.setState({
      editingCommentId: comment.id,
      editingContent: comment.content
    });
  };

  handleSaveEdit = () => {
    const { editingCommentId, editingContent, comments } = this.state;
    if (!editingContent.trim()) return;

    const updatedComments = comments.map(c => 
      c.id === editingCommentId ? { ...c, content: editingContent } : c
    );

    this.setState({
      comments: updatedComments,
      editingCommentId: null,
      editingContent: ''
    });
    this.addNotification('Comentario actualizado', 'success');
  };

  handleLike = () => {
    this.setState(prev => ({ isLiked: !prev.isLiked }));
    this.addNotification(this.state.isLiked ? 'Eliminado de favoritos' : 'Agregado a favoritos', 'info');
  };

  render() {
    const { 
      game, isFullscreen, userRating, comments, newComment, 
      gameStarted, leaderboard, loadingLeaderboard, notifications,
      editingCommentId, editingContent, isLiked
    } = this.state;

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-24 pb-20 px-4 md:px-6 transition-colors duration-500">
        {/* Custom Notifications Overlay */}
        <div className="fixed top-24 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 pointer-events-auto backdrop-blur-xl border border-white/10 ${
                n.type === 'success' ? 'bg-emerald-500/90 text-white' :
                n.type === 'error' ? 'bg-rose-500/90 text-white' :
                'bg-sky-500/90 text-white'
              }`}
            >
              {n.type === 'success' ? <Check size={20}/> : n.type === 'error' ? <AlertCircle size={20}/> : <Info size={20}/>}
              <p className="title text-sm uppercase tracking-wider">{n.message}</p>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="space-y-2">
                <h1 className="title text-5xl md:text-6xl text-primary-dark dark:text-white uppercase tracking-tighter flex items-center gap-4">
                   <div className={game.color}>{game.icon && (typeof game.icon === 'object' ? Object.assign({}, game.icon, {props: {size: 40}}) : game.icon)}</div>
                   {game.title}
                </h1>
                <p className="body text-xl opacity-60 uppercase tracking-[0.2em]">{game.category} • SORZAL ARENA</p>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => this.props.router.navigate('/games')}
                  className="px-6 py-4 glass-card border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all rounded-2xl title text-lg flex items-center gap-2"
                >
                   <ArrowLeft size={20}/> VOLVER A LA ARENA
                </button>
                <button 
                  onClick={this.handleManualScoreSubmit}
                  className="px-6 py-4 bg-secondary-light text-primary-dark rounded-2xl title text-lg shadow-lg hover:bg-secondary-light/80 transition-all flex items-center gap-2 group"
                >
                   <Trophy size={20} className="group-hover:rotate-12 transition-transform"/> GUARDAR RECORD
                </button>
                <button className="p-4 glass-card border-primary-light/20 text-primary-light hover:bg-primary-light hover:text-white transition-all rounded-2xl">
                   <Share2 size={24} />
                </button>
             </div>
          </div>

          <div className="space-y-6">
            <div 
              ref={this.gameRef}
              className={`relative aspect-video glass-card border-white/10 overflow-hidden bg-black flex items-center justify-center group shadow-2xl ${isFullscreen ? 'w-full h-full' : ''}`}
            >
              {!gameStarted ? (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.bg} opacity-50`}></div>
                  <div className="relative z-10 text-center space-y-8">
                     <div className={`${game.color} animate-pulse drop-shadow-[0_0_30px_currentColor]`}>
                        {game.icon}
                     </div>
                     <button 
                      onClick={this.startGame}
                      className="px-12 py-5 bg-primary-light text-white rounded-2xl title text-3xl hover:scale-110 transition-transform shadow-[0_0_50px_rgba(14,165,233,0.4)]"
                     >
                        INICIAR PARTIDA
                     </button>
                  </div>
                </>
              ) : (
                <iframe 
                  src={game.path} 
                  className="w-full h-full border-none"
                  title={game.title}
                  allow="fullscreen"
                />
              )}

              <div className="absolute bottom-6 right-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                 <button 
                  onClick={this.toggleFullscreen}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20"
                  title="Pantalla Completa"
                 >
                    <Maximize size={24} />
                 </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-8 py-6 border-y border-primary-light/10">
               <div className="flex items-center gap-3 group cursor-pointer">
                  <Star className="text-yellow-400 group-hover:scale-125 transition-transform fill-yellow-400" size={24}/>
                  <span className="title text-2xl">4.8</span>
                  <span className="body text-sm opacity-50 uppercase tracking-widest">(1.2k Votos)</span>
               </div>
               <button 
                onClick={this.handleLike}
                className="flex items-center gap-3 group"
               >
                  <Heart className={`transition-all duration-300 group-hover:scale-125 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`} size={24}/>
                  <span className="title text-2xl">{isLiked ? 451 : 450}</span>
                  <span className="body text-sm opacity-50 uppercase tracking-widest">Favoritos</span>
               </button>
               <div className="flex items-center gap-3">
                  <MessageCircle className="text-sky-500" size={24}/>
                  <span className="title text-2xl">{comments.length}</span>
                  <span className="body text-sm opacity-50 uppercase tracking-widest">Comentarios</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
             <div className="space-y-10">
                {/* Ranking Section */}
                <section className="glass-card p-8 border-t-8 border-secondary-light shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-light/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                   <h3 className="title text-3xl uppercase tracking-widest text-secondary-light mb-8 flex items-center gap-3 relative z-10">
                      <Medal size={32}/> Top Jugadores
                   </h3>
                   {loadingLeaderboard ? (
                     <div className="animate-pulse flex flex-col gap-4">
                        {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl"></div>)}
                     </div>
                   ) : (
                     <div className="space-y-4 relative z-10">
                        {leaderboard.length > 0 ? leaderboard.map((score, index) => (
                          <div key={score._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-primary-light/5 hover:border-primary-light/20 group">
                             <div className="flex items-center gap-4">
                                <span className={`title text-xl w-10 h-10 flex items-center justify-center rounded-xl shadow-inner ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white' : index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white' : 'bg-white/5 opacity-40'}`}>
                                   {index + 1}
                                </span>
                                <div className="w-12 h-12 bg-primary-light/10 border border-primary-light/20 rounded-2xl flex items-center justify-center text-primary-light title uppercase text-xl group-hover:bg-primary-light group-hover:text-white transition-all">
                                   {(score.user.name || 'U').charAt(0)}
                                </div>
                                <div>
                                   <p className="title text-lg uppercase tracking-wider">{score.user.name || 'Usuario'}</p>
                                   <p className="body text-[10px] opacity-50 flex items-center gap-1.5 uppercase font-bold tracking-tighter">
                                      <Trophy size={10} className="text-secondary-light"/> RECORD: {new Date(score.updatedAt).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="title text-3xl text-secondary-light group-hover:scale-110 transition-transform origin-right">{score.points.toLocaleString()}</p>
                                <p className="body text-[8px] uppercase font-bold opacity-40 tracking-widest">puntos</p>
                             </div>
                          </div>
                        )) : (
                          <div className="text-center py-12 space-y-4 opacity-50">
                             <Medal size={64} className="mx-auto text-white/10"/>
                             <p className="body italic text-xl">Aún no hay records. ¡Inaugura el ranking!</p>
                          </div>
                        )}
                     </div>
                   )}
                </section>

                <h3 className="title text-3xl uppercase tracking-widest text-primary-light">Conversación</h3>
                <form onSubmit={this.handleSendComment} className="glass-card p-6 flex gap-4 items-end shadow-xl border-b-4 border-primary-light">
                   <div className="flex-1 space-y-3">
                      <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Escribe tu opinión</label>
                      <textarea 
                        value={newComment}
                        onChange={(e) => this.setState({ newComment: e.target.value })}
                        placeholder="¿Qué te pareció esta pieza del ecosistema?"
                        className="w-full bg-white/5 border-2 border-primary-light/5 rounded-2xl p-4 body outline-none focus:border-primary-light/30 focus:bg-white/10 transition-all min-h-[100px] resize-none text-lg"
                      />
                   </div>
                   <button type="submit" className="p-5 bg-primary-light text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg hover:-translate-y-1">
                      <Send size={24} />
                   </button>
                </form>

                <div className="space-y-6">
                   {comments.map(c => (
                     <div key={c.id} className="glass-card p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:bg-white/5 transition-all group/card border border-white/5">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center title text-2xl shadow-xl transition-all ${c.isOwner ? 'bg-primary-light text-white' : 'bg-primary-light/10 text-primary-light'}`}>
                                 {c.user.charAt(0)}
                              </div>
                              <div>
                                 <p className="title text-lg uppercase tracking-wider flex items-center gap-2">
                                    {c.user}
                                    {c.isOwner && <span className="bg-primary-light/20 text-primary-light text-[8px] px-2 py-0.5 rounded-full border border-primary-light/20">TÚ</span>}
                                 </p>
                                 <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{c.date}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              {c.isOwner && (
                                <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                   <button 
                                    onClick={() => this.handleStartEdit(c)}
                                    className="p-2 hover:bg-sky-500/20 text-sky-500 rounded-xl transition-colors"
                                    title="Editar"
                                   >
                                      <Edit2 size={18} />
                                   </button>
                                   <button 
                                    onClick={() => this.handleDeleteComment(c.id)}
                                    className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors"
                                    title="Eliminar"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                              )}
                              <button className="flex items-center gap-2 body text-sm font-bold opacity-60 hover:text-rose-500 transition-all bg-white/5 px-4 py-2 rounded-xl group/like">
                                 <Heart size={16} className="group-hover/like:scale-125 transition-transform" /> {c.likes}
                              </button>
                           </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="space-y-4">
                             <textarea 
                              value={editingContent}
                              onChange={(e) => this.setState({ editingContent: e.target.value })}
                              className="w-full bg-black/20 border-2 border-primary-light/30 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all min-h-[80px] resize-none"
                             />
                             <div className="flex gap-3 justify-end">
                                <button 
                                 onClick={() => this.setState({ editingCommentId: null })}
                                 className="px-6 py-2 glass-card rounded-xl body text-xs font-bold uppercase tracking-widest"
                                >
                                   Cancelar
                                </button>
                                <button 
                                 onClick={this.handleSaveEdit}
                                 className="px-6 py-2 bg-primary-light text-white rounded-xl title text-xs uppercase tracking-widest shadow-lg"
                                >
                                   Guardar Cambios
                                </button>
                             </div>
                          </div>
                        ) : (
                          <p className="body text-xl opacity-80 leading-relaxed italic border-l-4 border-primary-light/20 pl-6">
                            "{c.content}"
                          </p>
                        )}
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-8">
                <div className="glass-card p-8 space-y-6 shadow-xl border-t-8 border-yellow-500/50">
                   <h4 className="title text-xl uppercase tracking-widest text-center">Valorar Juego</h4>
                   <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          onClick={() => {
                            this.setState({ userRating: star });
                            this.addNotification(`Has valorado con ${star} estrellas`, 'success');
                          }} 
                          className="transition-all hover:scale-125 active:scale-95 group"
                        >
                           <Star size={32} className={`transition-all duration-300 ${star <= userRating ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-white/10 group-hover:text-yellow-400/30'}`} />
                        </button>
                      ))}
                   </div>
                   <p className="body text-[10px] text-center opacity-40 uppercase font-bold tracking-widest">Tu opinión ayuda a la comunidad</p>
                </div>

                <div className="glass-card p-8 space-y-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                   <h4 className="title text-xl uppercase tracking-widest flex items-center gap-2">
                      <Gamepad2 size={24} className="text-primary-light"/> Controles
                   </h4>
                   <div className="space-y-4 body text-sm opacity-70 uppercase tracking-tighter relative z-10">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                         <span className="opacity-50">Acción</span>
                         <span className="font-bold text-primary-light bg-primary-light/5 px-3 py-1 rounded-lg border border-primary-light/10">{game.controls.act}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                         <span className="opacity-50">Teclas</span>
                         <span className="font-bold text-primary-light bg-primary-light/5 px-3 py-1 rounded-lg border border-primary-light/10">{game.controls.mov}</span>
                      </div>
                   </div>
                   <button className="w-full py-4 glass-card border-primary-light/20 text-primary-light hover:bg-primary-light hover:text-white transition-all rounded-2xl title text-xs uppercase tracking-[0.2em]">
                      Ver Tutorial Completo
                   </button>
                </div>

                {/* Aesthetic Card */}
                <div className="glass-card p-8 bg-gradient-to-br from-primary-dark to-black text-white space-y-4 border border-white/5">
                   <Rocket size={32} className="text-primary-light animate-bounce"/>
                   <h5 className="title text-2xl uppercase tracking-tighter">¿Eres Desarrollador?</h5>
                   <p className="body text-xs opacity-60 leading-relaxed uppercase tracking-wider">Sube tus propios prototipos y gana visibilidad en el ecosistema Sorzal.</p>
                   <button className="w-full py-3 bg-white text-primary-dark rounded-xl title text-xs uppercase hover:bg-primary-light hover:text-white transition-all shadow-xl">
                      EMPEZAR AHORA
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>
    );
  }
}

// Re-defining internal component to avoid missing Gamepad2
const Gamepad2 = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" x2="10" y1="12" y2="12" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="15" x2="15.01" y1="13" y2="13" />
    <line x1="18" x2="18.01" y1="11" y2="11" />
    <rect width="20" height="12" x="2" y="6" rx="2" />
  </svg>
);

const Rocket = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
  </svg>
);

export const GamePlayPage = withRouter(GamePlay);

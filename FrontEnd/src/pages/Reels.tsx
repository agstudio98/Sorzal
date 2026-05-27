import { Component, createRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, MoreVertical, Music, 
  Send, X, User as UserIcon, ChevronLeft, Play, Pause, Loader2
} from 'lucide-react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { fetchReels, toggleLikeReel, shareReel, fetchReelComments, addReelComment } from '../api';
import { withRouter } from '../utils/withRouter';
import { ReelCreator } from '../components/ReelCreator';

interface Reel {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  videoUrl: string;
  caption: string;
  song: string;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  trimStart?: number;
  trimEnd?: number;
  textOverlays?: { text: string, x: number, y: number, color: string }[];
}

interface ReelsProps extends WithTranslation {
  user: any;
  showNotification?: (msg: string, type?: any) => void;
  router?: any;
}

interface ReelsState {
  reels: Reel[];
  loading: boolean;
  activeReelIndex: number;
  showComments: boolean;
  comments: any[];
  newComment: string;
  loadingComments: boolean;
  isPlaying: boolean;
  videoLoading: boolean[];
  showUploadModal: boolean;
}

class ReelsPageBase extends Component<ReelsProps, ReelsState> {
  state: ReelsState = {
    reels: [],
    loading: true,
    activeReelIndex: 0,
    showComments: false,
    comments: [],
    newComment: '',
    loadingComments: false,
    isPlaying: true,
    videoLoading: [],
    showUploadModal: false
  };

  videoRefs: React.RefObject<HTMLVideoElement>[] = [];
  containerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    this.loadReels();
    if (this.props.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  componentDidUpdate(prevProps: ReelsProps, prevState: ReelsState) {
    if (prevState.activeReelIndex !== this.state.activeReelIndex) {
      this.playActiveVideo();
    }
    if (this.props.router?.location?.state?.create && !prevProps.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  loadReels = async () => {
    try {
      const reels = await fetchReels();
      if (!Array.isArray(reels)) throw new Error('Invalid reels data');
      
      this.videoRefs = reels.map(() => createRef<HTMLVideoElement>());
      this.setState({ 
        reels, 
        loading: false, 
        videoLoading: reels.map(() => true) 
      }, () => {
        if (reels.length > 0) {
          setTimeout(() => this.playActiveVideo(), 500);
        }
      });
    } catch (err) {
      console.error('Error loading reels:', err);
      this.setState({ loading: false, reels: [] });
    }
  };

  handleUploadSuccess = () => {
    this.setState({ showUploadModal: false });
    this.loadReels();
  };

  playActiveVideo = () => {
    if (!this.state.reels.length) return;
    
    this.videoRefs.forEach((ref, index) => {
      const video = ref.current;
      const reel = this.state.reels[index];
      if (!video || !reel || this.isYouTube(reel.videoUrl)) return;

      if (index === this.state.activeReelIndex) {
        video.muted = true;
        video.currentTime = reel.trimStart || 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.setState({ isPlaying: true });
          }).catch(error => {
            if (error.name !== 'AbortError') {
              console.warn("Playback failed:", error);
            }
            this.setState({ isPlaying: false });
          });
        }
      } else {
        video.pause();
      }
    });
  };

  togglePlay = () => {
    const reel = this.state.reels[this.state.activeReelIndex];
    if (reel && this.isYouTube(reel.videoUrl)) return;

    const video = this.videoRefs[this.state.activeReelIndex]?.current;
    if (video) {
      if (video.paused) {
        video.play().catch(err => {
          if (err.name !== 'AbortError') console.error(err);
        });
        this.setState({ isPlaying: true });
      } else {
        video.pause();
        this.setState({ isPlaying: false });
      }
    }
  };

  handleVideoLoad = (index: number) => {
    if (index < 0 || index >= this.state.videoLoading.length) return;
    const newVideoLoading = [...this.state.videoLoading];
    newVideoLoading[index] = false;
    this.setState({ videoLoading: newVideoLoading });
    
    if (index === this.state.activeReelIndex) {
      this.playActiveVideo();
    }
  };

  handleVideoError = (index: number) => {
    console.error(`Error loading video at index ${index}`);
    const { reels } = this.state;
    if (reels[index]) {
      const updatedReels = [...reels];
      // Si falla, lo reemplazamos por un video de YouTube confiable (Cyberpunk vibes)
      updatedReels[index] = { 
        ...updatedReels[index], 
        videoUrl: 'https://www.youtube.com/shorts/qM79_itR0Nc' 
      };
      this.setState({ reels: updatedReels });
    }
    
    const newVideoLoading = [...this.state.videoLoading];
    newVideoLoading[index] = false;
    this.setState({ videoLoading: newVideoLoading });
  };

  isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0`;
    }
    return url;
  };

  handleScroll = () => {
    const container = this.containerRef.current;
    if (!container) return;

    const scrollPos = container.scrollTop;
    const reelHeight = container.clientHeight;
    const index = Math.round(scrollPos / reelHeight);
    
    if (index !== this.state.activeReelIndex && index >= 0 && index < this.state.reels.length) {
      this.setState({ activeReelIndex: index, showComments: false });
    }
  };

  handleLike = async (reelId: string) => {
    const { user, showNotification, t } = this.props;
    if (!user) return showNotification?.(t('REELS.LIKE_LOGIN'), 'info');

    try {
      const res = await toggleLikeReel(reelId, user._id);
      this.setState(prevState => ({
        reels: prevState.reels.map(r => r._id === reelId ? { ...r, likes: res.likes } : r)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  handleShare = async (reelId: string) => {
    const { t } = this.props;
    try {
      const res = await shareReel(reelId);
      this.setState(prevState => ({
        reels: prevState.reels.map(r => r._id === reelId ? { ...r, sharesCount: res.sharesCount } : r)
      }));
      navigator.clipboard.writeText(window.location.href);
      this.props.showNotification?.(t('REELS.SHARE_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
    }
  };

  openComments = async (reelId: string) => {
    this.setState({ showComments: true, loadingComments: true, comments: [] });
    try {
      const comments = await fetchReelComments(reelId);
      this.setState({ comments, loadingComments: false });
    } catch (err) {
      console.error(err);
      this.setState({ loadingComments: false });
    }
  };

  handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, showNotification, t } = this.props;
    const { reels, activeReelIndex, newComment } = this.state;
    const activeReel = reels[activeReelIndex];

    if (!user) return showNotification?.(t('REELS.LOGIN_TO_COMMENT'), 'info');
    if (!newComment.trim() || !activeReel) return;

    try {
      const comment = await addReelComment(activeReel._id, {
        userId: user._id,
        content: newComment
      });
      this.setState(prevState => ({
        comments: [comment, ...prevState.comments],
        newComment: '',
        reels: prevState.reels.map(r => r._id === activeReel._id ? { ...r, commentsCount: r.commentsCount + 1 } : r)
      }));
      showNotification?.(t('PHOTOGRAPHY.NOTIFICATIONS.COMMENT_SUCCESS') || '¡Comentario añadido!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { reels, loading, showComments, comments, newComment, loadingComments, activeReelIndex, isPlaying, videoLoading } = this.state;
    const { user, t } = this.props;

    if (loading) return (
      <div className="h-screen bg-black flex items-center justify-center title text-white text-2xl animate-pulse">
        {t('REELS.LOADING')}
      </div>
    );

    if (reels.length === 0) return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white space-y-6 p-6">
        <div className="w-24 h-24 bg-primary-light/20 rounded-full flex items-center justify-center animate-bounce">
          <Play size={48} className="text-primary-light" />
        </div>
        <h2 className="title text-2xl uppercase tracking-widest text-center">{t('REELS.NO_REELS') || 'No hay reels disponibles'}</h2>
        <p className="body text-sm opacity-60 text-center max-w-xs">{t('REELS.EMPTY_DESC') || 'Vuelve más tarde para ver contenido nuevo de la comunidad Sorzal.'}</p>
        <button 
          onClick={this.loadReels}
          className="px-8 py-3 bg-primary-light hover:bg-primary-dark rounded-2xl title text-sm transition-all"
        >
          {t('REELS.RETRY') || 'REINTENTAR'}
        </button>
      </div>
    );

    return (
      <main className="h-screen bg-black overflow-hidden relative">
        {/* Floating Back Button for easier navigation */}
        <Link 
          to="/" 
          className="fixed top-24 left-6 z-50 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-primary-light transition-all flex items-center gap-2 title text-[10px] uppercase tracking-widest shadow-2xl group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('REELS.BACK') || 'VOLVER'}</span>
        </Link>

        <div 
          ref={this.containerRef}
          onScroll={this.handleScroll}
          className="h-full w-full max-w-lg mx-auto snap-y snap-mandatory overflow-y-auto scrollbar-hide pt-20 pb-10"
        >
          {reels.map((reel, index) => {
            const isLiked = user && reel.likes.includes(user._id);
            return (
              <div key={reel._id} className="h-full w-full snap-start relative flex items-center justify-center group bg-black">
                {/* Video Loader */}
                {videoLoading[index] && index === activeReelIndex && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
                    <Loader2 size={48} className="text-primary-light animate-spin" />
                  </div>
                )}

                {this.isYouTube(reel.videoUrl) ? (
                  <iframe
                    className={`h-full w-full object-cover transition-opacity duration-500 ${videoLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                    src={index === activeReelIndex ? this.getYouTubeEmbedUrl(reel.videoUrl) : undefined}
                    title={reel.caption}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={() => this.handleVideoLoad(index)}
                  ></iframe>
                ) : (
                  <div className="relative h-full w-full">
                    <video 
                      ref={this.videoRefs[index]}
                      src={reel.videoUrl} 
                      className={`h-full w-full object-cover transition-opacity duration-500 ${videoLoading[index] ? 'opacity-0' : 'opacity-100'}`}
                      loop
                      muted
                      playsInline
                      crossOrigin="anonymous"
                      onCanPlay={() => this.handleVideoLoad(index)}
                      onTimeUpdate={(e) => {
                        const video = e.currentTarget;
                        if (reel.trimEnd && video.currentTime >= reel.trimEnd) {
                          video.currentTime = reel.trimStart || 0;
                        }
                      }}
                      onWaiting={() => {
                        if (index === this.state.activeReelIndex) {
                           const newVideoLoading = [...this.state.videoLoading];
                           newVideoLoading[index] = true;
                           this.setState({ videoLoading: newVideoLoading });
                        }
                      }}
                      onError={() => this.handleVideoError(index)}
                      onClick={this.togglePlay}
                      poster={`https://picsum.photos/seed/${reel._id}/400/800?blur=10`}
                    />
                    
                    {/* Text Overlays */}
                    {reel.textOverlays?.map((overlay, i) => (
                      <div 
                        key={i}
                        className="absolute pointer-events-none"
                        style={{ 
                          left: `${overlay.x}%`, 
                          top: `${overlay.y}%`, 
                          color: overlay.color,
                          fontSize: '24px',
                          transform: 'translate(-50%, -50%)',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          zIndex: 40
                        }}
                      >
                        {overlay.text}
                      </div>
                    ))}
                  </div>
                )}

                {!this.isYouTube(reel.videoUrl) && !isPlaying && index === activeReelIndex && !videoLoading[index] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                     <div className="p-6 bg-black/40 backdrop-blur-md rounded-full">
                        <Play size={48} className="text-white fill-white opacity-80" />
                     </div>
                  </div>
                )}
                
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 p-6 flex flex-col justify-end text-white pointer-events-none z-30">
                  <div className="flex justify-between items-end gap-6 mb-12 pointer-events-auto">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-white title text-xl shadow-lg border border-white/20">
                            {(reel.user?.name || 'U').charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="title text-lg font-bold">@{reel.user?.name || 'Usuario'}</span>
                            <span className="body text-[10px] opacity-60 uppercase tracking-widest">{t('REELS.SUGGESTED')}</span>
                         </div>
                         <button className="ml-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider">{t('REELS.FOLLOW')}</button>
                      </div>
                      <p className="body text-sm leading-relaxed line-clamp-3 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/5">{reel.caption}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80 bg-primary-light/20 px-3 py-1.5 rounded-lg w-fit">
                         <Music size={12} className="animate-spin-slow"/> {reel.song}
                      </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="flex flex-col gap-6 items-center">
                      <button 
                        onClick={() => this.handleLike(reel._id)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                         <div className={`p-4 rounded-2xl transition-all duration-300 transform group-active:scale-150 ${isLiked ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 backdrop-blur-md hover:bg-white/20'}`}>
                            <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
                         </div>
                         <span className="text-[10px] font-bold title">{reel.likes.length}</span>
                      </button>

                      <button 
                        onClick={() => this.openComments(reel._id)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                         <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:bg-primary-light transition-all border border-white/10">
                            <MessageCircle size={28} />
                         </div>
                         <span className="text-[10px] font-bold title">{reel.commentsCount}</span>
                      </button>

                      <button 
                        onClick={() => this.handleShare(reel._id)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                         <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:bg-secondary-light group-hover:text-primary-dark transition-all border border-white/10">
                            <Share2 size={28} />
                         </div>
                         <span className="text-[10px] font-bold title">{reel.sharesCount}</span>
                      </button>

                      <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                         <MoreVertical size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comments Drawer */}
        {showComments && (
          <div className="absolute inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-10 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => this.setState({ showComments: false })}></div>
             
             <div className="relative z-[60] w-full max-w-lg h-3/4 md:h-[600px] bg-white dark:bg-night rounded-t-[2.5rem] md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-white/10">
                <div className="p-6 border-b border-primary-light/10 flex items-center justify-between">
                   <h3 className="title text-xl uppercase tracking-widest text-primary-dark dark:text-white">{t('REELS.COMMENTS')}</h3>
                   <button onClick={() => this.setState({ showComments: false })} className="p-2 hover:bg-primary-light/10 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                   {loadingComments ? (
                     <div className="flex flex-col gap-4 animate-pulse">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-primary-light/5 rounded-2xl w-full"></div>)}
                     </div>
                   ) : comments.length > 0 ? comments.map(c => (
                     <div key={c._id} className="flex gap-4 group">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-white title text-sm">
                           {(c.user?.name || 'U').charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="title text-[10px] uppercase font-bold text-primary-dark dark:text-white">@{c.user?.name}</span>
                              <span className="text-[8px] opacity-40 body uppercase">Hace un momento</span>
                           </div>
                           <p className="body text-sm text-primary-dark/80 dark:text-slate-300">{c.content}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity"><Heart size={14} className="text-primary-light/40 hover:text-red-500"/></button>
                     </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                        <MessageCircle size={48} />
                        <p className="title text-lg uppercase tracking-widest">{t('REELS.NO_COMMENTS')}</p>
                     </div>
                   )}
                </div>

                <div className="p-6 bg-primary-light/5 border-t border-primary-light/10">
                   <form onSubmit={this.handleSendComment} className="flex gap-3">
                      <input 
                        type="text"
                        value={newComment}
                        onChange={(e) => this.setState({ newComment: e.target.value })}
                        placeholder={user ? t('REELS.ADD_COMMENT') : t('REELS.LOGIN_TO_COMMENT')}
                        disabled={!user}
                        className="flex-1 bg-white dark:bg-black/40 border-2 border-primary-light/20 rounded-2xl px-5 py-3 body text-sm outline-none focus:border-primary-light transition-all shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={!user || !newComment.trim()}
                        className="p-4 bg-primary-light text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg disabled:grayscale"
                      >
                         <Send size={20} />
                      </button>
                   </form>
                </div>
             </div>
          </div>
        )}

        {/* New Reel Creator Mode */}
        {this.state.showUploadModal && (
          <ReelCreator 
            user={user}
            onClose={() => this.setState({ showUploadModal: false })}
            onSuccess={this.handleUploadSuccess}
            showNotification={this.props.showNotification || (() => {})}
            t={t}
          />
        )}
      </main>
    );
  }
}

export const ReelsPage = withTranslation()(withRouter(ReelsPageBase));

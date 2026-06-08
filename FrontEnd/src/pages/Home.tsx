import { Component } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeMain } from './home/Main';
import { HomeTop } from './home/Top';
import { HomePartner } from './home/Partner';
import { 
  Camera, MessageSquare, ShoppingBag, 
  Gamepad2, Heart, PlusCircle, X, Send,
  Share2, MessageCircle, MoreHorizontal,
  Headphones, PlayCircle, Code2, Download,
  Loader2, ChevronLeft, ChevronRight,
  GraduationCap, Mic, Plus
} from 'lucide-react';
import { fetchPosts, createPost, toggleLikePost, addPostComment } from '../api';

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  mediaUrl?: string;
  type: 'text' | 'podcast' | 'reel' | 'repo';
  referenceId?: any;
  referenceModel?: string;
  likes: string[];
  comments: any[];
  createdAt: string;
}

interface HomeState {
  posts: Post[];
  loading: boolean;
  newPostContent: string;
  submitting: boolean;
  selectedStory: number | null;
  commentingOn: string | null;
  newComment: string;
  refreshInterval?: any;
}

export default class Home extends Component<{ user: any; updateUser?: (data: any) => void }, HomeState> {
  storyScrollRef = { current: null as HTMLDivElement | null };

  state: HomeState = {
    posts: [],
    loading: true,
    newPostContent: '',
    submitting: false,
    selectedStory: null,
    commentingOn: null,
    newComment: '',
  };

  scrollStories = (direction: 'left' | 'right') => {
    if (this.storyScrollRef.current) {
      const container = this.storyScrollRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  componentDidMount() {
    if (this.props.user) {
      this.loadPosts();
      // Auto-refresh posts every 5 seconds
      const interval = setInterval(() => this.loadPosts(true), 5000);
      this.setState({ refreshInterval: interval });
    }
  }

  componentWillUnmount() {
    if (this.state.refreshInterval) {
      clearInterval(this.state.refreshInterval);
    }
  }

  loadPosts = async (isSilent = false) => {
    if (!isSilent) this.setState({ loading: true });
    try {
      const posts = await fetchPosts();
      this.setState({ posts, loading: false });
    } catch (error) {
      console.error('Error loading posts:', error);
      this.setState({ loading: false });
    }
  };

  handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = this.props;
    const { newPostContent } = this.state;
    if (!user || !newPostContent.trim()) return;

    this.setState({ submitting: true });
    try {
      const post = await createPost({ 
        userId: user._id, 
        content: newPostContent,
        type: 'text'
      });
      this.setState(prev => ({
        posts: [post, ...prev.posts],
        newPostContent: '',
        submitting: false
      }));
    } catch (error) {
      this.setState({ submitting: false });
    }
  };

  handleLike = async (postId: string) => {
    const { user } = this.props;
    if (!user) return;
    try {
      const { likes } = await toggleLikePost(postId, user._id);
      this.setState(prev => ({
        posts: prev.posts.map(p => p._id === postId ? { ...p, likes } : p)
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  handleAddComment = async (postId: string) => {
    const { user } = this.props;
    const { newComment } = this.state;
    if (!user || !newComment.trim()) return;

    try {
      const updatedPost = await addPostComment(postId, { userId: user._id, content: newComment });
      this.setState(prev => ({
        posts: prev.posts.map(p => p._id === postId ? updatedPost : p),
        newComment: '',
        commentingOn: null
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  renderPostReference = (post: Post) => {
    if (!post.referenceId) return null;

    switch (post.type) {
      case 'podcast':
        return (
          <Link to="/podcasting" className="mt-4 flex gap-4 p-4 glass-card bg-primary-light/5 border-primary-light/20 hover:bg-primary-light/10 transition-all">
            <img src={post.referenceId.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow-lg" alt="podcast" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-primary-light mb-1">
                <Headphones size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Podcast</span>
              </div>
              <h4 className="title text-lg truncate">{post.referenceId.title}</h4>
              <p className="body text-xs opacity-60 line-clamp-2 italic">"{post.referenceId.description}"</p>
            </div>
          </Link>
        );
      case 'reel':
        return (
          <Link to="/reels" className="mt-4 relative group aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl block">
            <video 
              src={post.referenceId.videoUrl} 
              className="w-full h-full object-cover" 
              muted 
              autoPlay 
              loop 
              playsInline
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle size={64} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
               <p className="text-white body text-sm italic">"{post.referenceId.caption}"</p>
            </div>
          </Link>
        );
      case 'repo':
        return (
          <Link to="/photography" className="mt-4 p-6 glass-card bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 transition-all block">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500"><Code2 size={24} /></div>
                <div>
                  <h4 className="title text-xl">{post.referenceId.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">{post.referenceId.language}</span>
                </div>
              </div>
              <Download size={20} className="text-emerald-500/40" />
            </div>
            <p className="body text-sm opacity-60 italic mb-4">"{post.referenceId.description}"</p>
            <div className="flex gap-4">
              <span className="text-[10px] font-bold opacity-40 uppercase">Size: {(post.referenceId.size / 1024).toFixed(1)} KB</span>
              <span className="text-[10px] font-bold opacity-40 uppercase">Stars: {post.referenceId.stars}</span>
            </div>
          </Link>
        );
      default:
        return null;
    }
  };

  render() {
    const { user } = this.props;
    const { 
      posts, loading, newPostContent, submitting, 
      selectedStory, commentingOn, newComment 
    } = this.state;

    if (!user) {
      return (
        <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-20 overflow-x-hidden">
          <HomeMain />
        </main>
      );
    }

    const stories = posts
      .filter(p => p.mediaUrl || (p.type === 'podcast' && p.referenceId?.imageUrl))
      .map((p, i) => ({
        id: p._id,
        id_user: p.user?._id,
        user: p.user?.name || 'Usuario',
        avatar: p.user?.avatar,
        img: p.mediaUrl || p.referenceId?.imageUrl,
        color: ["from-pink-500 to-rose-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-purple-500 to-indigo-500"][i % 5]
      }))
      .slice(0, 20);

    return (
      <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-24 pb-10 px-4 md:px-6">
        
        {/* Story Viewer Modal */}
        {selectedStory !== null && stories[selectedStory] && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            <button onClick={() => this.setState({ selectedStory: null })} className="absolute top-10 right-10 text-white hover:scale-110 transition-transform z-[110]"><X size={40} /></button>
            <div className="relative w-full max-w-md aspect-[9/16] bg-deep-ocean rounded-3xl overflow-hidden shadow-2xl">
               <img src={stories[selectedStory].img} className="w-full h-full object-cover animate-in zoom-in-95 duration-500" />
               <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stories[selectedStory].color} flex items-center justify-center text-white font-bold overflow-hidden`}>
                    {stories[selectedStory].avatar ? <img src={stories[selectedStory].avatar} className="w-full h-full object-cover" /> : stories[selectedStory].user.charAt(0)}
                  </div>
                  <span className="text-white title text-xl tracking-widest">{stories[selectedStory].user}</span>
               </div>
               <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={() => this.setState({ selectedStory: Math.max(0, selectedStory - 1) })}></div>
               <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={() => this.setState({ selectedStory: Math.min(stories.length - 1, selectedStory + 1) })}></div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8">
          
          {/* Left Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6 sticky top-24 h-fit">
            <Link to="/user" className="glass-card p-6 flex flex-col items-center text-center hover:bg-primary-light/5 transition-all">
              <div className="w-20 h-20 bg-primary-light rounded-[2rem] flex items-center justify-center text-white title text-4xl mb-4 shadow-lg overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name || 'U').charAt(0)}
              </div>
              <h3 className="title text-xl text-primary-dark dark:text-white uppercase tracking-wider">{user.name || 'Usuario'}</h3>
              <p className="body text-xs opacity-60">@{ (user.email || 'user').split('@')[0]}</p>
            </Link>

            <nav className="glass-card p-4 space-y-1">
              {[
                { label: 'Fotos', icon: <Camera size={18}/>, to: '/photography' },
                { label: 'Foro', icon: <MessageSquare size={18}/>, to: '/forum' },
                { label: 'Market', icon: <ShoppingBag size={18}/>, to: '/marketplace' },
                { label: 'Juegos', icon: <Gamepad2 size={18}/>, to: '/games' },
                { label: 'Match', icon: <Heart size={18}/>, to: '/partners' },
              ].map(link => (
                <Link key={link.label} to={link.to} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary-light/10 text-primary-dark dark:text-white/70 title text-sm transition-all hover:translate-x-2">
                  {link.icon} {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Central Feed */}
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Stories Slider */}
            <div className="relative group">
              <div 
                ref={(el) => { (this.storyScrollRef as any).current = el; }}
                className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 scroll-smooth snap-x snap-mandatory"
              >
                <div className="flex-shrink-0 w-[calc(20%-13px)] aspect-[2/3] glass-card relative overflow-hidden group/add cursor-pointer border-dashed border-primary-light/40 border-2 flex flex-col items-center justify-end pb-4 gap-2 snap-start">
                    <div className="w-10 h-10 bg-primary-light text-white rounded-full flex items-center justify-center shadow-lg group-hover/add:scale-110 transition-transform"><PlusCircle size={24} /></div>
                    <span className="text-[10px] uppercase font-bold text-primary-dark dark:text-white tracking-widest">Añadir</span>
                </div>
                {stories.map((story, index) => (
                  <div key={story.id} onClick={() => this.setState({ selectedStory: index })} className="flex-shrink-0 w-[calc(20%-13px)] aspect-[2/3] rounded-3xl relative overflow-hidden group/story cursor-pointer shadow-lg hover:shadow-primary-light/20 transition-all border-2 border-transparent hover:border-primary-light snap-start">
                    <img src={story.img} className="absolute inset-0 w-full h-full object-cover group-hover/story:scale-110 transition-transform duration-700" alt="story" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                    <Link 
                      to={`/profile/${story.id_user}`} 
                      onClick={(e) => e.stopPropagation()} 
                      className={`absolute top-3 left-3 w-8 h-8 md:w-10 md:h-10 rounded-full p-0.5 bg-gradient-to-br ${story.color} z-10 hover:scale-110 transition-transform`}
                    >
                      <div className="w-full h-full rounded-full bg-deep-ocean flex items-center justify-center text-white title text-sm md:text-lg overflow-hidden">
                        {story.avatar ? <img src={story.avatar} className="w-full h-full object-cover" /> : story.user.charAt(0)}
                      </div>
                    </Link>
                    <span className="absolute bottom-3 left-3 text-white title text-[8px] md:text-[10px] uppercase tracking-[0.2em] leading-none line-clamp-1">{story.user}</span>
                  </div>
                ))}
              </div>

              {/* Slider Controls */}
              <button 
                onClick={() => this.scrollStories('left')}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/40 dark:bg-black/40 backdrop-blur-lg rounded-full flex items-center justify-center text-primary-dark dark:text-white border border-white/20 opacity-40 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-primary-light hover:text-white hover:scale-110 z-20"
              >
                <ChevronLeft size={28} />
              </button>
              <button 
                onClick={() => this.scrollStories('right')}
                className="absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/40 dark:bg-black/40 backdrop-blur-lg rounded-full flex items-center justify-center text-primary-dark dark:text-white border border-white/20 opacity-40 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-primary-light hover:text-white hover:scale-110 z-20"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Post Creator */}
            <form onSubmit={this.handleCreatePost} className="glass-card p-6 flex gap-4 items-center">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex-shrink-0 flex items-center justify-center text-white title text-xl overflow-hidden shadow-lg">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name || 'U').charAt(0)}
              </div>
              <input 
                type="text"
                value={newPostContent}
                onChange={e => this.setState({ newPostContent: e.target.value })}
                placeholder={`¿Qué pieza falta hoy, ${(user.name || 'Usuario').split(' ')[0]}?`}
                className="flex-1 bg-white/5 border-2 border-primary-light/20 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all italic"
              />
              <button 
                type="submit"
                disabled={submitting || !newPostContent.trim()}
                className="p-4 bg-primary-light text-white rounded-2xl hover:bg-primary-dark shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              </button>
            </form>

            {/* Muro Feed Content */}
            <div className="space-y-8">
              <div className="flex justify-between items-center px-2">
                 <h2 className="title text-3xl uppercase tracking-tighter text-primary-dark dark:text-white">El <span className="text-primary-light italic">Muro</span></h2>
                 <div className="flex gap-4">
                    <button onClick={() => this.loadPosts()} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Refrescar</button>
                 </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                   <Loader2 size={48} className="animate-spin text-primary-light" />
                   <p className="title text-sm uppercase tracking-widest">Sincronizando feed...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <div key={post._id} className="glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* Post Header */}
                     <div className="p-6 flex justify-between items-center">
                        <Link to={`/profile/${post.user?._id}`} className="flex items-center gap-4 group">
                           <div className="w-12 h-12 bg-primary-light/10 rounded-2xl flex items-center justify-center text-primary-light title text-xl overflow-hidden border border-primary-light/20 group-hover:border-primary-light transition-all">
                              {post.user?.avatar ? <img src={post.user.avatar} className="w-full h-full object-cover" /> : (post.user?.name || 'U').charAt(0)}
                           </div>
                           <div>
                              <h4 className="title text-lg uppercase tracking-tight text-primary-dark dark:text-white group-hover:text-primary-light transition-colors">{post.user?.name || 'Usuario'}</h4>
                              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </Link>
                        <button className="p-2 opacity-20 hover:opacity-100 transition-opacity"><MoreHorizontal size={20}/></button>
                     </div>

                     {/* Post Content */}
                     <div className="px-6 pb-6 space-y-4">
                        <p className="body text-lg opacity-80 leading-relaxed italic">"{post.content}"</p>
                        
                        {post.mediaUrl && post.type === 'text' && (
                          <div className="rounded-3xl overflow-hidden shadow-xl border border-white/5">
                             <img src={post.mediaUrl} className="w-full max-h-[500px] object-cover" alt="media" />
                          </div>
                        )}

                        {this.renderPostReference(post)}
                     </div>

                     {/* Post Actions */}
                     <div className="px-6 py-4 border-t border-white/5 bg-primary-light/5 flex justify-between items-center">
                        <div className="flex gap-6">
                           <button 
                            onClick={() => this.handleLike(post._id)}
                            className={`flex items-center gap-2 title text-sm transition-all ${post.likes.includes(user._id) ? 'text-rose-500' : 'opacity-40 hover:text-rose-500'}`}
                           >
                              <Heart size={20} fill={post.likes.includes(user._id) ? 'currentColor' : 'none'} /> {post.likes.length}
                           </button>
                           <button 
                            onClick={() => this.setState({ commentingOn: commentingOn === post._id ? null : post._id })}
                            className="flex items-center gap-2 title text-sm opacity-40 hover:text-primary-light transition-all"
                           >
                              <MessageCircle size={20} /> {post.comments.length}
                           </button>
                           <button className="flex items-center gap-2 title text-sm opacity-40 hover:text-sky-500 transition-all">
                              <Share2 size={20} />
                           </button>
                        </div>
                     </div>

                     {/* Comments Section */}
                     {commentingOn === post._id && (
                       <div className="px-6 py-6 border-t border-white/5 bg-black/20 space-y-4 animate-in slide-in-from-top-4 duration-300">
                          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                             {post.comments.length > 0 ? post.comments.map((c, i) => (
                               <div key={i} className="flex gap-3 items-start">
                                  <Link to={`/profile/${c.user?._id}`} className="w-8 h-8 bg-primary-light/20 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] title text-primary-light overflow-hidden hover:scale-110 transition-transform">
                                     {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover" /> : (c.user?.name || 'U').charAt(0)}
                                  </Link>
                                  <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                                     <Link to={`/profile/${c.user?._id}`} className="title text-[10px] uppercase text-primary-light mb-1 hover:underline">{c.user?.name || 'Usuario'}</Link>
                                     <p className="body text-xs opacity-70">"{c.content}"</p>
                                  </div>
                               </div>
                             )) : (                               <p className="title text-[10px] uppercase opacity-20 text-center py-4">Aún no hay feedback</p>
                             )}
                          </div>
                          <div className="flex gap-3 pt-2">
                             <input 
                              type="text" 
                              value={newComment}
                              onChange={e => this.setState({ newComment: e.target.value })}
                              placeholder="Escribe un comentario..."
                              className="flex-1 bg-white/5 border border-primary-light/20 rounded-xl px-4 py-2 text-sm body outline-none focus:border-primary-light transition-all"
                             />
                             <button 
                              onClick={() => this.handleAddComment(post._id)}
                              className="p-2 bg-primary-light text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg"
                             >
                                <Send size={18} />
                             </button>
                          </div>
                       </div>
                     )}
                  </div>
                ))
              ) : (
                <div className="text-center py-40 space-y-6 opacity-20">
                   <MessageSquare size={80} className="mx-auto" />
                   <p className="title text-4xl uppercase tracking-tighter">El muro está en silencio...</p>
                   <p className="body italic">Sé el primero en romper el hielo del ecosistema.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="hidden lg:flex flex-col gap-8 sticky top-24 h-fit">
            <div className="space-y-4">
               <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary-light px-2">TOP RANKING</h4>
               <HomeTop />
            </div>
            <div className="space-y-4">
               <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary-light px-2">NUEVAS AFINIDADES</h4>
               <HomePartner />
            </div>
          </aside>
        </div>
      </main>
    );
  }
}

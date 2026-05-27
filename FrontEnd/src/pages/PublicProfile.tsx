import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { User, MessageCircle, Heart, Share2, MoreHorizontal, UserPlus, UserMinus, Grid, Image as ImageIcon, Film } from 'lucide-react';
import { fetchUserProfile, followUser } from '../api';
import { withRouter } from '../utils/withRouter';

interface ProfileState {
  user: any;
  posts: any[];
  loading: boolean;
  error: string | null;
  isFollowing: boolean;
  followLoading: boolean;
  followersCount: number;
}

class PublicProfile extends Component<any, ProfileState> {
  state = {
    user: null,
    posts: [],
    loading: true,
    error: null,
    isFollowing: false,
    followLoading: false,
    followersCount: 0
  };

  async componentDidMount() {
    this.loadProfile();
  }

  async componentDidUpdate(prevProps: any) {
    if (prevProps.router.params.id !== this.props.router.params.id) {
      this.loadProfile();
    }
  }

  loadProfile = async () => {
    const { id } = this.props.router.params;
    const { currentUser } = this.props;
    try {
      this.setState({ loading: true });
      const data = await fetchUserProfile(id);
      const isFollowing = currentUser?.following?.includes(id) || false;
      this.setState({ 
        user: data.user, 
        posts: data.posts, 
        isFollowing,
        followersCount: data.followersCount || 0,
        loading: false 
      });
    } catch (err) {
      this.setState({ error: 'Usuario no encontrado', loading: false });
    }
  }

  handleFollow = async () => {
    const { user } = this.state;
    const { currentUser, updateUser, showNotification } = this.props;
    if (!currentUser) return showNotification?.('Debes iniciar sesión para seguir usuarios', 'info');

    try {
      this.setState({ followLoading: true });
      const res = await followUser(user._id, currentUser._id);
      this.setState({ 
        isFollowing: res.isFollowing,
        followersCount: res.followersCount
      });
      updateUser({ following: res.following });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ followLoading: false });
    }
  };

  render() {
    const { user, posts, loading, error, isFollowing, followLoading, followersCount } = this.state;

    if (loading) return <div className="min-h-screen flex items-center justify-center title text-2xl">CARGANDO PERFIL...</div>;
    if (error || !user) return <div className="min-h-screen flex items-center justify-center title text-2xl text-red-500">{error}</div>;

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-4 md:px-6 transition-colors duration-500">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header Profile */}
          <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="w-40 h-40 bg-gradient-to-br from-primary-light to-primary-dark rounded-[3rem] flex items-center justify-center text-white title text-7xl shadow-2xl relative z-10 border-4 border-white/20 overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name || 'U').charAt(0)}
             </div>

             <div className="flex-1 text-center md:text-left space-y-6 relative z-10">
                <div className="space-y-1">
                   <h1 className="title text-5xl text-primary-dark dark:text-white uppercase tracking-tighter">{user.name || 'Usuario'}</h1>
                   <p className="body text-lg opacity-60">@{ (user.email || 'user').split('@')[0]}</p>
                   {user.bio && <p className="body text-sm opacity-80 max-w-xl italic mt-4">"{user.bio}"</p>}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-8">
                   <div className="flex flex-col"><span className="title text-2xl">{posts.length}</span><span className="text-xs uppercase font-bold opacity-50 tracking-widest">Publicaciones</span></div>
                   <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="title text-2xl">{followersCount}</span>
                        {isFollowing && <span className="text-primary-light font-bold text-sm animate-pulse">+1</span>}
                      </div>
                      <span className="text-xs uppercase font-bold opacity-50 tracking-widest">Fans</span>
                   </div>
                   <div className="flex flex-col"><span className="title text-2xl">{user.following?.length || 0}</span><span className="text-xs uppercase font-bold opacity-50 tracking-widest">Siguiendo</span></div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                   <button 
                    onClick={this.handleFollow}
                    disabled={followLoading}
                    className={`px-10 py-3 rounded-2xl title text-lg transition-all shadow-lg flex items-center gap-2 ${
                      isFollowing 
                      ? 'bg-primary-dark/10 dark:bg-white/10 text-primary-dark dark:text-white border border-primary-light/20' 
                      : 'bg-primary-light text-white hover:bg-primary-dark'
                    }`}
                   >
                      {followLoading ? '...' : (isFollowing ? <><UserMinus size={20}/> DEJAR DE SEGUIR</> : <><UserPlus size={20}/> SEGUIR</>)}
                   </button>
                   <button 
                    onClick={() => this.props.router.navigate('/messages')}
                    className="px-10 py-3 glass-card border-primary-light/30 hover:bg-primary-light/10 text-primary-dark dark:text-white rounded-2xl title text-lg transition-all"
                   >
                      MENSAJE
                   </button>
                </div>
             </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center gap-12 border-b border-primary-light/10 pb-4">
             <button className="flex items-center gap-2 title text-lg text-primary-light border-b-2 border-primary-light pb-4"><Grid size={20}/> TODO</button>
             <button className="flex items-center gap-2 title text-lg opacity-40 hover:opacity-100 transition-opacity pb-4"><ImageIcon size={20}/> FOTOS</button>
             <button className="flex items-center gap-2 title text-lg opacity-40 hover:opacity-100 transition-opacity pb-4"><Film size={20}/> REELS</button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {posts.map(post => {
               const displayImg = post.mediaUrl || post.referenceId?.imageUrl || `https://picsum.photos/seed/${post._id}/600/600`;
               const isVideo = post.type === 'reel';
               
               return (
                 <div key={post._id} className="glass-card overflow-hidden group cursor-pointer aspect-square relative shadow-md">
                    {isVideo ? (
                      <video src={post.referenceId?.videoUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={displayImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white title text-xl">
                       <div className="flex items-center gap-2"><Heart size={24} fill="white" /> {post.likes?.length || 0}</div>
                       <div className="flex items-center gap-2"><MessageCircle size={24} fill="white" /> {post.comments?.length || 0}</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                       <span className="bg-primary-light/90 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">{post.type || post.category || 'Post'}</span>
                    </div>
                 </div>
               );
             })}
          </div>

        </div>
      </main>
    );
  }
}

export const UserProfilePage = withTranslation()(withRouter(PublicProfile));

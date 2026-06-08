import { Component } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, Heart, Share2, MessageCircle, 
  Search, X, Send, ChevronLeft, Trash2, Edit3, Check, RotateCcw, User as UserIcon, Star
} from 'lucide-react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { 
  fetchProducts, fetchProductComments, addProductComment, 
  toggleLike, updateComment, deleteComment, createProduct
} from '../api';
import { cleanTitle } from '../utils/textUtils';
import { withRouter } from '../utils/withRouter';
import { PhotoCreator } from '../components/PhotoCreator';

interface Photo {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  likes: string[];
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface PhotographyState {
  photos: Photo[];
  loading: boolean;
  searchQuery: string;
  activeCategory: string;
  selectedPhoto: Photo | null;
  comments: any[];
  newComment: string;
  loadingComments: boolean;
  editingCommentId: string | null;
  editContent: string;
  newRating: number;
  editRating: number;
  
  // Upload State
  showUploadModal: boolean;
}

interface PhotographyProps extends WithTranslation {
  user: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  router?: any;
}

class PhotographyPageBase extends Component<PhotographyProps, PhotographyState> {
  state: PhotographyState = {
    photos: [],
    loading: true,
    searchQuery: '',
    activeCategory: 'Todos',
    selectedPhoto: null,
    comments: [],
    newComment: '',
    loadingComments: false,
    editingCommentId: null,
    editContent: '',
    newRating: 5,
    editRating: 5,

    showUploadModal: false
  };

  componentDidMount() {
    this.loadPhotos();
    if (this.props.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  componentDidUpdate(prevProps: PhotographyProps) {
    if (this.props.router?.location?.state?.create && !prevProps.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  loadPhotos = async () => {
    const { searchQuery, activeCategory } = this.state;
    const { t } = this.props;
    try {
      this.setState({ loading: true });
      const data = await fetchProducts(1, searchQuery, activeCategory);
      this.setState({ photos: data.products, loading: false });
    } catch (err) {
      this.props.showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.LOAD_ERROR'), 'error');
      this.setState({ loading: false });
    }
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    this.loadPhotos();
  };

  handleUploadSuccess = () => {
    this.setState({ showUploadModal: false });
    this.loadPhotos();
  };

  setCategory = (cat: string) => {
    this.setState({ activeCategory: cat }, () => this.loadPhotos());
  };

  handleLike = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    const { user, showNotification, t } = this.props;
    if (!user) return showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.LIKE_LOGIN'), 'info');

    try {
      const res = await toggleLike(photoId, user._id);
      this.setState(prevState => ({
        photos: prevState.photos.map(p => p._id === photoId ? { ...p, likes: res.likes } : p),
        selectedPhoto: prevState.selectedPhoto?._id === photoId ? { ...prevState.selectedPhoto, likes: res.likes } : prevState.selectedPhoto
      }));
    } catch (err) {
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.LIKE_ERROR'), 'error');
    }
  };

  openPhoto = async (photo: Photo) => {
    this.setState({ selectedPhoto: photo, loadingComments: true, comments: [] });
    try {
      const comments = await fetchProductComments(photo._id);
      this.setState({ comments, loadingComments: false });
    } catch (err) {
      this.setState({ loadingComments: false });
    }
  };

  closePhoto = () => {
    this.setState({ selectedPhoto: null, comments: [], newComment: '', editingCommentId: null });
  };

  handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { selectedPhoto, newComment, newRating } = this.state;
    const { user, showNotification, t } = this.props;
    if (!user) return showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.COMMENT_LOGIN'), 'info');
    if (!newComment.trim() || !selectedPhoto) return;

    try {
      const comment = await addProductComment(selectedPhoto._id, {
        userId: user._id,
        content: newComment,
        rating: newRating
      });
      this.setState({ 
        comments: [comment, ...this.state.comments],
        newComment: '',
        newRating: 5
      });
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.COMMENT_SUCCESS'), 'success');
    } catch (err) {
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.COMMENT_ERROR'), 'error');
    }
  };

  handleDeleteComment = async (commentId: string) => {
    const { selectedPhoto } = this.state;
    const { user, showNotification, t } = this.props;
    if (!selectedPhoto || !user) return;

    try {
      await deleteComment(selectedPhoto._id, commentId, user._id);
      this.setState({ comments: this.state.comments.filter(c => c._id !== commentId) });
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.DELETE_SUCCESS'), 'info');
    } catch (err) {
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.DELETE_ERROR'), 'error');
    }
  };

  startEditing = (comment: any) => {
    this.setState({ 
      editingCommentId: comment._id, 
      editContent: comment.content,
      editRating: comment.rating || 5 
    });
  };

  cancelEditing = () => {
    this.setState({ editingCommentId: null, editContent: '', editRating: 5 });
  };

  handleUpdateComment = async (commentId: string) => {
    const { selectedPhoto, editContent, editRating } = this.state;
    const { user, showNotification, t } = this.props;
    if (!selectedPhoto || !user || !editContent.trim()) return;

    try {
      const updated = await updateComment(selectedPhoto._id, commentId, {
        userId: user._id,
        content: editContent,
        rating: editRating
      });
      this.setState({
        comments: this.state.comments.map(c => c._id === commentId ? updated : c),
        editingCommentId: null,
        editContent: '',
        editRating: 5
      });
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.UPDATE_SUCCESS'), 'success');
    } catch (err) {
      showNotification(t('PHOTOGRAPHY.NOTIFICATIONS.UPDATE_ERROR'), 'error');
    }
  };

  render() {
    const { photos, loading, searchQuery, activeCategory, selectedPhoto, comments, newComment, loadingComments, editingCommentId, editContent } = this.state;
    const { user, t } = this.props;

    const categories = ['Todos', 'Naturaleza', 'Retrato', 'Urbana', 'Abstracta', 'Digital'];

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-24 pb-20 px-4 md:px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="title text-5xl md:text-6xl uppercase tracking-tighter flex items-center gap-4 text-primary-dark dark:text-white">
              <Camera size={48} className="text-primary-light" /> <span className="hidden sm:inline">{t('PHOTOGRAPHY.TITLE')}</span>
            </h1>

            <form onSubmit={this.handleSearch} className="w-full md:max-w-md relative group">
              <div className="absolute inset-0 bg-primary-light/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative glass-card flex items-center px-4 py-2 border-primary-light/20 focus-within:border-primary-light transition-all">
                <Search size={20} className="text-primary-light opacity-50" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => this.setState({ searchQuery: e.target.value })}
                  placeholder={t('PHOTOGRAPHY.SEARCH_PLACEHOLDER')} 
                  className="bg-transparent border-none outline-none w-full p-2 body text-primary-dark dark:text-white"
                />
              </div>
            </form>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => this.setCategory(cat)}
                className={`px-8 py-2 rounded-full title text-xs uppercase tracking-widest transition-all border-2 ${
                  activeCategory === cat 
                  ? 'bg-primary-light text-white border-primary-light shadow-lg' 
                  : 'glass-card border-primary-light/10 text-primary-dark/60 dark:text-white/60 hover:border-primary-light/40'
                }`}
              >
                {t('PHOTOGRAPHY.CATEGORIES.' + cat)}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center title text-2xl animate-pulse">{t('PHOTOGRAPHY.LOADING')}</div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {photos.map((photo) => (
                <div 
                  key={photo._id} 
                  onClick={() => this.openPhoto(photo)}
                  className="break-inside-avoid glass-card overflow-hidden group relative cursor-pointer rounded-[2rem] shadow-lg border-2 border-transparent hover:border-primary-light/30 transition-all animate-in fade-in zoom-in duration-500"
                >
                  <img src={photo.imageUrl || `https://picsum.photos/seed/${photo._id}/800/1000`} alt={cleanTitle(t('PHOTOGRAPHY.POSTS.' + photo.name, photo.name))} className="w-full h-auto object-cover" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                     <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center title text-[10px] uppercase overflow-hidden">
                              {photo.user?.avatar ? <img src={photo.user.avatar} className="w-full h-full object-cover"/> : (photo.user?.name || 'U').charAt(0)}
                           </div>
                           <span className="body font-bold text-xs">@{photo.user?.name || t('PHOTOGRAPHY.POSTS.Usuario')}</span>
                        </div>
                        <div className="flex gap-4">
                           <button 
                            onClick={(e) => this.handleLike(e, photo._id)}
                            className={`flex items-center gap-1 transition-all ${user && Array.isArray(photo.likes) && photo.likes.includes(user._id) ? 'text-rose-500 scale-110' : 'hover:text-primary-light'}`}
                           >
                              <Heart size={20} fill={user && Array.isArray(photo.likes) && photo.likes.includes(user._id) ? 'currentColor' : 'none'}/>
                              <span className="text-xs font-bold">{Array.isArray(photo.likes) ? photo.likes.length : 0}</span>
                           </button>
                           <MessageCircle size={20}/>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photo Detail Modal */}
          {selectedPhoto && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-10 animate-in fade-in duration-300">
               <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={this.closePhoto}></div>
               
               <div className="relative z-[110] w-full h-full md:max-w-6xl md:h-auto md:aspect-video glass-card overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                  <div className="flex-[1.5] bg-black flex items-center justify-center relative">
                     <img src={selectedPhoto.imageUrl} className="w-full h-full object-contain" />
                     <button onClick={this.closePhoto} className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white md:hidden"><ChevronLeft size={24}/></button>
                  </div>

                  <div className="flex-1 bg-white dark:bg-night flex flex-col border-l border-primary-light/10">
                     <div className="p-6 border-b border-primary-light/10 flex items-center justify-between">
                        <Link to={`/profile/${selectedPhoto.user?._id}`} className="flex items-center gap-4 group">
                           <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-white title text-xl shadow-lg overflow-hidden">
                              {selectedPhoto.user?.avatar ? <img src={selectedPhoto.user.avatar} className="w-full h-full object-cover"/> : (selectedPhoto.user?.name || 'U').charAt(0)}
                           </div>                           <div>
                              <h4 className="title text-xl text-primary-dark dark:text-white group-hover:text-primary-light transition-colors">{selectedPhoto.user?.name || t('PHOTOGRAPHY.POSTS.Usuario')}</h4>
                              <p className="body text-xs opacity-50 uppercase tracking-widest">{t('PHOTOGRAPHY.SEE_UNIVERSE')}</p>
                           </div>
                        </Link>
                        <button onClick={this.closePhoto} className="hidden md:block p-2 hover:bg-primary-light/10 rounded-full text-primary-dark dark:text-white"><X size={24}/></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-start">
                              <h2 className="title text-3xl uppercase text-primary-light leading-none">{cleanTitle(t('PHOTOGRAPHY.POSTS.' + selectedPhoto.name, selectedPhoto.name))}</h2>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 transition-all">
                                   <div className="flex gap-0.5">
                                      {[1,2,3,4,5].map(star => (
                                        <Star key={star} size={14} className={star <= Math.round((selectedPhoto as any).rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                                      ))}
                                   </div>
                                   <span className="title text-lg">{(selectedPhoto as any).rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <button 
                                  onClick={(e) => this.handleLike(e, selectedPhoto._id)}
                                  className={`flex items-center gap-1.5 transition-all ${user && Array.isArray(selectedPhoto.likes) && selectedPhoto.likes.includes(user._id) ? 'text-rose-500 scale-110' : 'text-primary-dark dark:text-white opacity-40 hover:opacity-100'}`}
                                >
                                   <Heart size={20} fill={user && Array.isArray(selectedPhoto.likes) && selectedPhoto.likes.includes(user._id) ? 'currentColor' : 'none'}/>
                                   <span className="title text-sm">{Array.isArray(selectedPhoto.likes) ? selectedPhoto.likes.length : 0}</span>
                                </button>
                              </div>
                           </div>
                           <p className="body text-sm opacity-70 italic">"{t('PHOTOGRAPHY.POSTS.' + selectedPhoto.description, selectedPhoto.description)}"</p>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-primary-light/5">
                           <h5 className="title text-xs uppercase tracking-[0.2em] opacity-40">{t('PHOTOGRAPHY.CONVERSATION')} ({comments.length})</h5>
                           <div className="space-y-6">
                              {comments.map(c => {
                                const isMyComment = user && user._id === (c.user?._id || c.user);
                                const authorName = c.user?.name || (isMyComment ? user.name : t('PHOTOGRAPHY.POSTS.Usuario'));
                                
                                return (
                                  <div key={c._id} className="group relative flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                     <Link to={`/profile/${c.user?._id || c.user}`} className="w-8 h-8 bg-primary-light/20 rounded-lg flex-shrink-0 flex items-center justify-center text-primary-light title text-[10px] uppercase hover:bg-primary-light hover:text-white transition-colors">
                                        {(authorName || 'U').charAt(0)}
                                     </Link>
                                     <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                           <Link to={`/profile/${c.user?._id || c.user}`} className={`title text-[10px] uppercase hover:text-primary-light transition-colors ${isMyComment ? 'text-primary-light' : ''}`}>
                                              {authorName} {isMyComment && <span className="opacity-40 text-[8px] ml-1">{t('PHOTOGRAPHY.YOU')}</span>}
                                           </Link>
                                           <div className="flex gap-0.5 ml-2 mr-auto">
                                              {[1,2,3,4,5].map(star => (
                                                <Star key={star} size={8} className={star <= (c.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"} />
                                              ))}
                                           </div>
                                           {isMyComment && !editingCommentId && (
                                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => this.startEditing(c)} className="text-primary-light hover:scale-110 transition-transform"><Edit3 size={12}/></button>
                                                <button onClick={() => this.handleDeleteComment(c._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={12}/></button>
                                             </div>
                                           )}
                                        </div>
                                        
                                        {editingCommentId === c._id ? (
                                          <div className="space-y-2 mt-2">
                                             <div className="flex gap-1 mb-2">
                                                {[1,2,3,4,5].map(star => (
                                                  <button 
                                                    key={star} 
                                                    onClick={() => this.setState({ editRating: star })}
                                                    className="transition-transform hover:scale-125"
                                                  >
                                                    <Star size={14} className={star <= this.state.editRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                                                  </button>
                                                ))}
                                             </div>
                                             <textarea 
                                              value={editContent}
                                              onChange={(e) => this.setState({ editContent: e.target.value })}
                                              className="w-full bg-primary-light/5 border border-primary-light/30 rounded-xl p-3 body text-sm outline-none focus:border-primary-light"
                                             />
                                             <div className="flex gap-2 justify-end">
                                                <button onClick={this.cancelEditing} className="p-2 text-primary-dark dark:text-white/50 hover:bg-white/10 rounded-lg"><RotateCcw size={14}/></button>
                                                <button onClick={() => this.handleUpdateComment(c._id)} className="p-2 bg-primary-light text-white rounded-lg shadow-lg"><Check size={14}/></button>
                                             </div>
                                          </div>
                                        ) : (
                                          <p className="body text-sm opacity-80 leading-relaxed">{c.content}</p>
                                        )}
                                     </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-primary-light/5 border-t border-primary-light/10">
                        <div className="flex gap-1 mb-3 ml-1">
                           {[1,2,3,4,5].map(star => (
                             <button 
                               key={star} 
                               onClick={() => this.setState({ newRating: star })}
                               disabled={!user}
                               className="transition-transform hover:scale-125 disabled:opacity-30"
                             >
                               <Star size={18} className={star <= this.state.newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-700"} />
                             </button>
                           ))}
                           <span className="title text-[10px] ml-2 opacity-40 self-center uppercase tracking-widest">{this.state.newRating}.0</span>
                        </div>
                        <form onSubmit={this.handleSendComment} className="flex gap-3 items-end">
                           <textarea 
                            value={newComment}
                            onChange={(e) => this.setState({ newComment: e.target.value })}
                            placeholder={user ? t('PHOTOGRAPHY.COMMENT_PLACEHOLDER') : t('PHOTOGRAPHY.LOGIN_TO_COMMENT')}
                            disabled={!user}
                            className="w-full bg-white dark:bg-black/20 border-2 border-primary-light/20 rounded-2xl p-4 body text-sm outline-none focus:border-primary-light transition-all resize-none h-16 shadow-inner disabled:opacity-50"
                           />
                           <button 
                            type="submit" 
                            disabled={!user || !newComment.trim()}
                            className="p-4 bg-primary-light text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary-light/20 disabled:grayscale"
                           >
                              <Send size={20} />
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
          )}
          {/* New Photo Creator Mode */}
          {this.state.showUploadModal && (
            <PhotoCreator 
              user={user}
              onClose={() => this.setState({ showUploadModal: false })}
              onSuccess={this.handleUploadSuccess}
              showNotification={this.props.showNotification}
              t={t as any}
            />
          )}
        </div>
      </main>
    );
  }
}

export const PhotographyPage = withTranslation()(withRouter(PhotographyPageBase));

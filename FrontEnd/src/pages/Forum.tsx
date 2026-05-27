import { Component } from 'react';
import { 
  ThumbsUp, MessageCircle, ChevronUp, Search, Filter, 
  ArrowLeft, Send, MoreHorizontal, User, Share2, 
  Flag, Bookmark, MessageSquare, Plus, X, Edit3, Trash2, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import {
  fetchThreads,
  createThread,
  fetchThreadById,
  updateThread,
  deleteThread,
  voteThread,
  addThreadComment,
  voteThreadComment,
  updateThreadComment,
  deleteThreadComment
} from '../api';
import { cleanTitle } from '../utils/textUtils';

import { withRouter } from '../utils/withRouter';

interface ForumProps extends WithTranslation {
  user?: any;
  showNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  router?: any;
}

interface ForumState {
  threads: any[];
  selectedThread: any | null;
  comments: any[];
  activeCategory: string;
  searchQuery: string;
  newComment: string;
  isCreatingThread: boolean;
  newThreadTitle: string;
  newThreadContent: string;
  newThreadCategory: string;
  editingThreadId: string | null;
  editThreadTitle: string;
  editThreadContent: string;
  editThreadCategory: string;
  editingCommentId: string | null;
  editCommentContent: string;
  replyingToCommentId: string | null;
  replyContent: string;
  loading: boolean;
  }

  const CATEGORIES = ['Todos', 'Arte', 'Dev', 'Debate', 'Marketplace', 'Cursos'];

  class ForumPageBase extends Component<ForumProps, ForumState> {
  state: ForumState = {
    threads: [],
    selectedThread: null,
    comments: [],
    activeCategory: 'Todos',
    searchQuery: '',
    newComment: '',
    isCreatingThread: false,
    newThreadTitle: '',
    newThreadContent: '',
    newThreadCategory: 'Debate',
    editingThreadId: null,
    editThreadTitle: '',
    editThreadContent: '',
    editThreadCategory: '',
    editingCommentId: null,
    editCommentContent: '',
    replyingToCommentId: null,
    replyContent: '',
    loading: true
  };


  componentDidMount() {
    this.loadThreads();
    if (this.props.router?.location?.state?.create) {
      this.setState({ isCreatingThread: true });
      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }

  loadThreads = async () => {
    const { t } = this.props;
    try {
      this.setState({ loading: true });
      const threads = await fetchThreads(this.state.searchQuery, this.state.activeCategory);
      this.setState({ threads, loading: false });
    } catch (err) {
      console.error(err);
      if (this.props.showNotification) this.props.showNotification(t('FORUM.NOTIFICATIONS.LOAD_ERROR'), 'error');
      this.setState({ loading: false });
    }
  };

  handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value }, () => {
      // Debounce could be added here
      this.loadThreads();
    });
  };

  setCategory = (category: string) => {
    this.setState({ activeCategory: category }, () => this.loadThreads());
  };

  selectThread = async (thread: any) => {
    const { t, showNotification } = this.props;
    try {
      this.setState({ loading: true });
      const data = await fetchThreadById(thread._id);
      this.setState({ 
        selectedThread: data.thread, 
        comments: data.comments,
        loading: false 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.LOAD_THREAD_ERROR'), 'error');
      this.setState({ loading: false });
    }
  };

  backToList = () => {
    this.setState({ selectedThread: null, comments: [], editingCommentId: null, editingThreadId: null });
    this.loadThreads(); // Refresh list to get updated vote counts
  };

  // --- THREAD CRUD ---

  handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, showNotification, t } = this.props;
    const { newThreadTitle, newThreadContent, newThreadCategory } = this.state;
    
    if (!user) return showNotification?.(t('FORUM.NOTIFICATIONS.CREATE_LOGIN'), 'info');
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    try {
      await createThread({
        userId: user._id,
        title: newThreadTitle,
        content: newThreadContent,
        category: newThreadCategory
      });
      this.setState({ 
        isCreatingThread: false, 
        newThreadTitle: '', 
        newThreadContent: '', 
        newThreadCategory: 'Debate' 
      });
      showNotification?.(t('FORUM.NOTIFICATIONS.CREATE_SUCCESS'), 'success');
      this.loadThreads();
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.CREATE_ERROR'), 'error');
    }
  };

  handleDeleteThread = async (id: string) => {
    const { user, showNotification, t } = this.props;
    if (!user) return;
    try {
      await deleteThread(id, user._id);
      showNotification?.(t('FORUM.NOTIFICATIONS.DELETE_SUCCESS'), 'success');
      this.backToList();
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.DELETE_ERROR'), 'error');
    }
  };

  startEditingThread = (thread: any) => {
    this.setState({ 
      editingThreadId: thread._id, 
      editThreadTitle: thread.title, 
      editThreadContent: thread.content, 
      editThreadCategory: thread.category 
    });
  };

  handleUpdateThread = async () => {
    const { user, showNotification, t } = this.props;
    const { editingThreadId, editThreadTitle, editThreadContent, editThreadCategory } = this.state;
    if (!user || !editingThreadId) return;

    try {
      const updated = await updateThread(editingThreadId, {
        userId: user._id,
        title: editThreadTitle,
        content: editThreadContent,
        category: editThreadCategory
      });
      this.setState(prevState => ({
        selectedThread: { ...prevState.selectedThread, ...updated },
        editingThreadId: null
      }));
      showNotification?.(t('FORUM.NOTIFICATIONS.UPDATE_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.UPDATE_ERROR'), 'error');
    }
  };

  handleVoteThread = async (e: React.MouseEvent, id: string, vote: number) => {
    e.stopPropagation();
    const { user, showNotification, t } = this.props;
    if (!user) return showNotification?.(t('FORUM.NOTIFICATIONS.VOTE_LOGIN'), 'info');

    try {
      const res = await voteThread(id, user._id, vote);
      
      // Update in list if viewing list, or update selected if viewing thread
      if (this.state.selectedThread && this.state.selectedThread._id === id) {
        this.setState(prevState => ({
          selectedThread: { ...prevState.selectedThread, upvotes: res.upvotes, downvotes: res.downvotes }
        }));
      } else {
        this.setState(prevState => ({
          threads: prevState.threads.map(thr => thr._id === id ? { ...thr, upvotes: res.upvotes, downvotes: res.downvotes } : thr)
        }));
      }
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.VOTE_ERROR'), 'error');
    }
  };

  // --- COMMENT CRUD ---

  handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user, showNotification, t } = this.props;
    const { selectedThread, newComment } = this.state;
    
    if (!user) return showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_LOGIN'), 'info');
    if (!selectedThread || !newComment.trim()) return;

    try {
      const comment = await addThreadComment(selectedThread._id, {
        userId: user._id,
        content: newComment
      });
      this.setState(prevState => ({
        comments: [...prevState.comments, comment],
        newComment: '',
        selectedThread: { ...prevState.selectedThread, repliesCount: prevState.selectedThread.repliesCount + 1 }
      }));
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_ERROR'), 'error');
    }
  };

  handleAddReply = async (parentId: string) => {
    const { user, showNotification, t } = this.props;
    const { selectedThread, replyContent } = this.state;
    
    if (!user) return showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_LOGIN'), 'info');
    if (!selectedThread || !replyContent.trim()) return;

    try {
      const comment = await addThreadComment(selectedThread._id, {
        userId: user._id,
        content: replyContent,
        parentComment: parentId
      });
      this.setState(prevState => ({
        comments: [...prevState.comments, comment],
        replyContent: '',
        replyingToCommentId: null,
        selectedThread: { ...prevState.selectedThread, repliesCount: prevState.selectedThread.repliesCount + 1 }
      }));
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_ERROR'), 'error');
    }
  };

  startReplying = (commentId: string) => {
    this.setState({ replyingToCommentId: commentId, replyContent: '', editingCommentId: null });
  };

  handleDeleteComment = async (commentId: string) => {
    const { user, showNotification, t } = this.props;
    const { selectedThread } = this.state;
    if (!user || !selectedThread) return;
    try {
      await deleteThreadComment(selectedThread._id, commentId, user._id);
      this.setState(prevState => ({
        comments: prevState.comments.filter(c => c._id !== commentId),
        selectedThread: { ...prevState.selectedThread, repliesCount: Math.max(0, prevState.selectedThread.repliesCount - 1) }
      }));
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_DELETE_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_DELETE_ERROR'), 'error');
    }
  };

  startEditingComment = (comment: any) => {
    this.setState({ editingCommentId: comment._id, editCommentContent: comment.content });
  };

  handleUpdateComment = async (commentId: string) => {
    const { user, showNotification, t } = this.props;
    const { selectedThread, editCommentContent } = this.state;
    if (!user || !selectedThread || !editCommentContent.trim()) return;

    try {
      const updated = await updateThreadComment(selectedThread._id, commentId, {
        userId: user._id,
        content: editCommentContent
      });
      this.setState(prevState => ({
        comments: prevState.comments.map(c => c._id === commentId ? updated : c),
        editingCommentId: null
      }));
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_UPDATE_SUCCESS'), 'success');
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.COMMENT_UPDATE_ERROR'), 'error');
    }
  };

  handleVoteComment = async (commentId: string, vote: number) => {
    const { user, showNotification, t } = this.props;
    const { selectedThread } = this.state;
    if (!user || !selectedThread) return showNotification?.(t('FORUM.NOTIFICATIONS.VOTE_LOGIN'), 'info');

    try {
      const res = await voteThreadComment(selectedThread._id, commentId, user._id, vote);
      this.setState(prevState => ({
        comments: prevState.comments.map(c => c._id === commentId ? { ...c, upvotes: res.upvotes, downvotes: res.downvotes } : c)
      }));
    } catch (err) {
      console.error(err);
      showNotification?.(t('FORUM.NOTIFICATIONS.VOTE_ERROR'), 'error');
    }
  };

  getVotesScore = (upvotes: any[] = [], downvotes: any[] = []) => {
    return upvotes.length - downvotes.length;
  };

  hasVoted = (arr: any[] = [], userId: string) => {
    return arr.some(id => id === userId || (id && id._id === userId));
  };

  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  translateThreadTitle = (title: string) => {
    const { t } = this.props;
    // Clean first
    const clean = cleanTitle(title);
    
    // Check if it matches generated pattern: Prefix Topic
    // titles and topics from seed script
    const prefixes = [
      '¿Cómo mejorar en', 'Dudas sobre', 'Mi experiencia con', 'Hablemos de', 'Consejos para', 
      '¿Alguien sabe de', 'Propuesta para', 'Análisis de', 'Opiniones sobre', 'Guía básica de'
    ];
    
    for (const pre of prefixes) {
      if (clean.startsWith(pre)) {
        const topic = clean.replace(pre, '').trim();
        const translatedPre = t('FORUM.CONTENT.' + pre);
        const translatedTopic = t('FORUM.CONTENT.' + topic);
        
        // If both translated, return joined. Otherwise return original clean.
        if (translatedPre !== 'FORUM.CONTENT.' + pre && translatedTopic !== 'FORUM.CONTENT.' + topic) {
          return `${translatedPre} ${translatedTopic}`;
        }
      }
    }
    return clean;
  };

  translateThreadContent = (content: string, thread: any) => {
    const { t } = this.props;
    if (content.includes('Este es un debate generado automáticamente sobre')) {
      const category = t('FORUM.CATEGORIES.' + thread.category);
      // Extract topic from content (it's between 'sobre ' and '. Queremos')
      const match = content.match(/sobre (.*)\. Queremos/);
      const topicRaw = match ? match[1] : '';
      const topic = t('FORUM.CONTENT.' + topicRaw);
      
      return t('FORUM.CONTENT.BASE_CONTENT', { 
        topic: topic !== 'FORUM.CONTENT.' + topicRaw ? topic : topicRaw, 
        category 
      });
    }
    return content;
  };

  render() {
    const { 
      threads, selectedThread, comments, activeCategory, searchQuery, newComment,
      isCreatingThread, newThreadTitle, newThreadContent, newThreadCategory,
      editingThreadId, editThreadTitle, editThreadContent, editThreadCategory,
      editingCommentId, editCommentContent, replyingToCommentId, replyContent, loading
    } = this.state;
    const { user, t } = this.props;

    if (selectedThread) {
      const isThreadAuthor = user && selectedThread.user && (user._id === selectedThread.user._id || user._id === selectedThread.user);
      const threadUpvoted = user && this.hasVoted(selectedThread.upvotes, user._id);
      const threadDownvoted = user && this.hasVoted(selectedThread.downvotes, user._id);

      return (
        <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-4 md:px-6 max-w-5xl mx-auto transition-colors duration-500">
           {/* Navigation */}
           <button 
            onClick={this.backToList}
            className="flex items-center gap-2 text-primary-light hover:text-primary-dark dark:hover:text-white mb-8 group transition-all"
           >
              <div className="p-2 rounded-full bg-primary-light/10 group-hover:bg-primary-light group-hover:text-white transition-all">
                <ArrowLeft size={20} />
              </div>
              <span className="title text-sm uppercase tracking-widest">Volver a Debates</span>
           </button>

           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Question / Post */}
              <article className="glass-card p-8 md:p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary-light bg-secondary-light/10 px-3 py-1 rounded-full border border-secondary-light/20">{t('FORUM.CATEGORIES.' + selectedThread.category)}</span>
                            <span className="text-xs opacity-50 body font-bold uppercase tracking-tighter">Publicado {this.formatDate(selectedThread.createdAt)}</span>
                         </div>
                         {isThreadAuthor && !editingThreadId && (
                           <div className="flex gap-2">
                             <button onClick={() => this.startEditingThread(selectedThread)} className="p-2 text-primary-light hover:bg-primary-light/10 rounded-lg"><Edit3 size={16}/></button>
                             <button onClick={() => this.handleDeleteThread(selectedThread._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                           </div>
                         )}
                       </div>
                       
                       {editingThreadId ? (
                         <div className="space-y-4">
                           <input 
                             type="text" 
                             value={editThreadTitle} 
                             onChange={e => this.setState({ editThreadTitle: e.target.value })}
                             className="w-full bg-white/5 border border-primary-light/30 rounded-xl p-3 title text-2xl outline-none focus:border-primary-light"
                           />
                           <select 
                             value={editThreadCategory} 
                             onChange={e => this.setState({ editThreadCategory: e.target.value })}
                             className="w-full bg-white/5 border border-primary-light/30 rounded-xl p-3 body outline-none focus:border-primary-light dark:bg-night"
                           >
                             {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                         </div>
                       ) : (
                         <h1 className="title text-4xl md:text-5xl text-primary-dark dark:text-white leading-[1.1]">{this.translateThreadTitle(selectedThread.title)}</h1>
                       )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center gap-4 bg-primary-light/5 p-4 rounded-3xl border border-primary-light/10">
                       <button onClick={(e) => this.handleVoteThread(e, selectedThread._id, threadUpvoted ? 0 : 1)} className={`p-2 hover:bg-primary-light hover:text-white rounded-xl transition-all ${threadUpvoted ? 'bg-primary-light text-white' : 'text-primary-light'}`}><ChevronUp size={32}/></button>
                       <span className="title text-3xl text-primary-light">{this.getVotesScore(selectedThread.upvotes, selectedThread.downvotes)}</span>
                       <button onClick={(e) => this.handleVoteThread(e, selectedThread._id, threadDownvoted ? 0 : -1)} className={`p-2 hover:bg-rose-500 hover:text-white rounded-xl transition-all rotate-180 ${threadDownvoted ? 'bg-rose-500 text-white' : 'text-primary-light'}`}><ChevronUp size={32}/></button>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-primary-light/5">
                    <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-white title text-xl shadow-lg shadow-primary-light/20 overflow-hidden">
                       {selectedThread.user?.avatar ? <img src={selectedThread.user.avatar} className="w-full h-full object-cover"/> : (selectedThread.user?.name || 'U').charAt(0)}
                    </div>
                    <div>
                       <h4 className="title text-lg text-primary-dark dark:text-white uppercase tracking-wider">@{selectedThread.user?.name || 'Usuario'}</h4>
                       <p className="body text-[10px] opacity-40 uppercase tracking-widest">Iniciador del Debate</p>
                    </div>
                 </div>

                 {editingThreadId ? (
                   <div className="space-y-4 mb-10">
                     <textarea 
                       value={editThreadContent} 
                       onChange={e => this.setState({ editThreadContent: e.target.value })}
                       className="w-full h-40 bg-white/5 border border-primary-light/30 rounded-xl p-4 body text-lg outline-none focus:border-primary-light resize-none"
                     />
                     <div className="flex justify-end gap-2">
                       <button onClick={() => this.setState({ editingThreadId: null })} className="px-4 py-2 hover:bg-white/10 rounded-lg title text-sm">Cancelar</button>
                       <button onClick={this.handleUpdateThread} className="px-6 py-2 bg-primary-light text-white rounded-lg title text-sm shadow-lg flex items-center gap-2"><Check size={16}/> Guardar</button>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-6 mb-10">
                     <p className="body text-lg md:text-xl text-primary-dark/80 dark:text-slate-300 leading-relaxed border-l-4 border-primary-light pl-6 py-2 whitespace-pre-wrap">
                        {this.translateThreadContent(selectedThread.content, selectedThread)}
                     </p>
                     <div className="flex flex-wrap gap-2 pl-6">
                        {['#DebateReal', '#SorzalCommunity', '#' + selectedThread.category].map(tag => (
                          <span key={tag} className="text-xs text-primary-light body font-bold opacity-60 hover:opacity-100 cursor-pointer">
                            {tag}
                          </span>
                        ))}
                     </div>
                   </div>
                 )}

                 <div className="flex flex-wrap gap-4 pt-8 border-t border-primary-light/10 text-sm opacity-60 font-bold">
                    <button className="flex items-center gap-2 hover:text-primary-light transition-colors"><MessageCircle size={20}/> {selectedThread.repliesCount} Respuestas</button>
                    <button className="flex items-center gap-2 hover:text-primary-light transition-colors"><Share2 size={20}/> Compartir</button>
                    <button className="flex items-center gap-2 hover:text-primary-light transition-colors"><Bookmark size={20}/> Guardar</button>
                 </div>
              </article>

              {/* Comments Section */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="title text-2xl uppercase tracking-widest text-primary-light">Hilo de Conversación</h3>
                 </div>

                 {/* Comment Box */}
                 <form onSubmit={this.handleAddComment} className="glass-card p-6 border-2 border-primary-light/20 focus-within:border-primary-light transition-all shadow-inner">
                    <textarea 
                      placeholder={user ? t('FORUM.COMMENT_PLACEHOLDER') : t('FORUM.LOGIN_TO_PARTICIPATE')}
                      disabled={!user}
                      className="w-full bg-transparent border-none outline-none body text-lg resize-none h-24 mb-4 dark:text-white disabled:opacity-50"
                      value={newComment}
                      onChange={(e) => this.setState({ newComment: e.target.value })}
                    />
                    <div className="flex justify-between items-center">
                       <div className="flex gap-2 text-primary-light opacity-50"></div>
                       <button 
                        type="submit"
                        disabled={!user || !newComment.trim()}
                        className="px-8 py-3 bg-primary-light text-white rounded-xl title flex items-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary-light/20 disabled:grayscale"
                       >
                          PUBLICAR <Send size={18} />
                       </button>
                    </div>
                 </form>

                 {/* Comments Thread */}
                 <div className="space-y-6">
                    {comments.filter(c => !c.parentComment).map(comment => {
                      const isCommentAuthor = user && comment.user && (user._id === comment.user._id || user._id === comment.user);
                      const commentUpvoted = user && this.hasVoted(comment.upvotes, user._id);
                      const commentDownvoted = user && this.hasVoted(comment.downvotes, user._id);
                      const replies = comments.filter(r => (r.parentComment === comment._id || (r.parentComment?._id === comment._id)));

                      return (
                        <div key={comment._id} className="space-y-4">
                          <div className="glass-card p-6 border-l-4 border-primary-light/20 hover:border-primary-light transition-all">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-secondary-light/20 rounded-lg flex items-center justify-center text-secondary-light title text-xs overflow-hidden">
                                      {comment.user?.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover"/> : (comment.user?.name || 'U').charAt(0)}
                                   </div>
                                   <div>
                                      <span className="title text-[10px] uppercase tracking-wider text-primary-dark dark:text-white">@{comment.user?.name || 'Usuario'}</span>
                                      <span className="mx-2 opacity-30">•</span>
                                      <span className="body text-[10px] opacity-40 uppercase font-bold">{this.formatDate(comment.createdAt)}</span>
                                   </div>
                                </div>
                                {isCommentAuthor && !editingCommentId && (
                                  <div className="flex gap-2">
                                     <button onClick={() => this.startEditingComment(comment)} className="p-1 text-primary-light hover:bg-primary-light/10 rounded-lg"><Edit3 size={14}/></button>
                                     <button onClick={() => this.handleDeleteComment(comment._id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                                  </div>
                                )}
                             </div>

                             {editingCommentId === comment._id ? (
                               <div className="space-y-2 mb-4">
                                  <textarea 
                                    value={editCommentContent}
                                    onChange={(e) => this.setState({ editCommentContent: e.target.value })}
                                    className="w-full bg-primary-light/5 border border-primary-light/30 rounded-xl p-3 body text-sm outline-none focus:border-primary-light"
                                  />
                                  <div className="flex gap-2 justify-end">
                                     <button onClick={() => this.setState({ editingCommentId: null })} className="p-2 text-primary-dark dark:text-white/50 hover:bg-white/10 rounded-lg title text-xs">Cancelar</button>
                                     <button onClick={() => this.handleUpdateComment(comment._id)} className="p-2 bg-primary-light text-white rounded-lg shadow-lg flex items-center gap-1 title text-xs"><Check size={12}/> Guardar</button>
                                  </div>
                               </div>
                             ) : (
                               <p className="body text-base text-primary-dark/90 dark:text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
                                  {t('FORUM.CONTENT.COMMENTS.' + comment.content, comment.content)}
                               </p>
                             )}
                             <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1 bg-primary-light/5 rounded-full px-3 py-1">
                                   <button onClick={() => this.handleVoteComment(comment._id, commentUpvoted ? 0 : 1)} className={`hover:text-primary-light ${commentUpvoted ? 'text-primary-light' : ''}`}><ChevronUp size={16}/></button>
                                   <span className="text-primary-light min-w-[20px] text-center">{this.getVotesScore(comment.upvotes, comment.downvotes)}</span>
                                   <button onClick={() => this.handleVoteComment(comment._id, commentDownvoted ? 0 : -1)} className={`hover:text-rose-500 rotate-180 ${commentDownvoted ? 'text-rose-500' : ''}`}><ChevronUp size={16}/></button>
                                </div>
                                <button 
                                  onClick={() => this.startReplying(comment._id)}
                                  className="flex items-center gap-1 hover:text-primary-light transition-colors text-primary-light"
                                >
                                  <MessageSquare size={14}/> Responder
                                </button>
                             </div>
                          </div>

                          {/* Reply Box */}
                          {replyingToCommentId === comment._id && (
                            <div className="ml-12 animate-in slide-in-from-top-2 duration-300">
                               <div className="glass-card p-4 border-2 border-primary-light/30">
                                  <textarea 
                                    autoFocus
                                    value={replyContent}
                                    onChange={(e) => this.setState({ replyContent: e.target.value })}
                                    placeholder="Escribe tu respuesta..."
                                    className="w-full bg-transparent border-none outline-none body text-sm resize-none h-20 mb-2 dark:text-white"
                                  />
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => this.setState({ replyingToCommentId: null })} className="px-4 py-2 hover:bg-white/10 rounded-lg title text-[10px]">Cancelar</button>
                                     <button 
                                      onClick={() => this.handleAddReply(comment._id)}
                                      disabled={!replyContent.trim()}
                                      className="px-6 py-2 bg-primary-light text-white rounded-lg title text-[10px] shadow-lg disabled:opacity-50"
                                     >
                                        RESPONDER
                                     </button>
                                  </div>
                               </div>
                            </div>
                          )}

                          {/* Nested Replies Rendering */}
                          {replies.length > 0 && (
                            <div className="ml-8 md:ml-12 border-l-2 border-primary-light/10 pl-6 space-y-4">
                               {replies.map(reply => {
                                 const isReplyAuthor = user && reply.user && (user._id === reply.user._id || user._id === reply.user);
                                 const replyUpvoted = user && this.hasVoted(reply.upvotes, user._id);
                                 const replyDownvoted = user && this.hasVoted(reply.downvotes, user._id);
                                 
                                 return (
                                   <div key={reply._id} className="glass-card p-6 bg-primary-light/[0.02]">
                                      <div className="flex justify-between items-start mb-3">
                                         <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-primary-light/20 rounded-md flex items-center justify-center text-primary-light title text-[8px]">
                                               {(reply.user?.name || 'U').charAt(0)}
                                            </div>
                                            <span className="title text-[8px] uppercase tracking-wider text-primary-light">@{reply.user?.name || 'Usuario'}</span>
                                            <span className="body text-[8px] opacity-40 uppercase font-bold">{this.formatDate(reply.createdAt)}</span>
                                         </div>
                                         {isReplyAuthor && !editingCommentId && (
                                           <div className="flex gap-2">
                                              <button onClick={() => this.startEditingComment(reply)} className="text-primary-light opacity-40 hover:opacity-100"><Edit3 size={10}/></button>
                                              <button onClick={() => this.handleDeleteComment(reply._id)} className="text-red-500 opacity-40 hover:opacity-100"><Trash2 size={10}/></button>
                                           </div>
                                         )}
                                      </div>
                                      
                                      {editingCommentId === reply._id ? (
                                        <div className="space-y-2">
                                           <textarea 
                                             value={editCommentContent}
                                             onChange={(e) => this.setState({ editCommentContent: e.target.value })}
                                             className="w-full bg-primary-light/5 border border-primary-light/30 rounded-xl p-3 body text-xs outline-none focus:border-primary-light"
                                           />
                                           <div className="flex gap-2 justify-end">
                                              <button onClick={() => this.setState({ editingCommentId: null })} className="p-2 text-primary-dark dark:text-white/50 hover:bg-white/10 rounded-lg title text-[8px]">Cancelar</button>
                                              <button onClick={() => this.handleUpdateComment(reply._id)} className="p-2 bg-primary-light text-white rounded-lg shadow-lg title text-[8px]">Guardar</button>
                                           </div>
                                        </div>
                                      ) : (
                                        <p className="body text-sm text-primary-dark/80 dark:text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">
                                           {t('FORUM.CONTENT.COMMENTS.' + reply.content, reply.content)}
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center gap-4">
                                         <div className="flex items-center gap-1 bg-primary-light/5 rounded-full px-2 py-0.5">
                                            <button onClick={() => this.handleVoteComment(reply._id, replyUpvoted ? 0 : 1)} className={`hover:text-primary-light ${replyUpvoted ? 'text-primary-light' : ''}`}><ChevronUp size={12}/></button>
                                            <span className="text-primary-light min-w-[15px] text-center text-[10px]">{this.getVotesScore(reply.upvotes, reply.downvotes)}</span>
                                            <button onClick={() => this.handleVoteComment(reply._id, replyDownvoted ? 0 : -1)} className={`hover:text-rose-500 rotate-180 ${replyDownvoted ? 'text-rose-500' : ''}`}><ChevronUp size={12}/></button>
                                         </div>
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {comments.length === 0 && (
                      <p className="text-center body opacity-50 py-10 italic">No hay respuestas aún. Sé el primero en compartir tu pieza.</p>
                    )}
                 </div>
              </div>
           </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 transition-colors duration-500">
        {/* Modal Creación de Hilo */}
        {isCreatingThread && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-night w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-primary-light/20">
              <button onClick={() => this.setState({ isCreatingThread: false })} className="absolute top-6 right-6 p-2 hover:bg-primary-light/10 rounded-full"><X size={24}/></button>
              <h2 className="title text-3xl mb-6 uppercase tracking-widest text-primary-light">Nuevo Debate</h2>
              <form onSubmit={this.handleCreateThread} className="space-y-6">
                <div>
                  <label className="block title text-xs uppercase tracking-widest mb-2 opacity-60">Título</label>
                  <input 
                    type="text" required
                    value={newThreadTitle} onChange={e => this.setState({ newThreadTitle: e.target.value })}
                    className="w-full bg-primary-light/5 border-2 border-primary-light/20 rounded-xl p-4 title text-lg focus:border-primary-light outline-none"
                    placeholder="Escribe un título claro..."
                  />
                </div>
                <div>
                  <label className="block title text-xs uppercase tracking-widest mb-2 opacity-60">Categoría</label>
                  <select 
                    value={newThreadCategory} onChange={e => this.setState({ newThreadCategory: e.target.value })}
                    className="w-full bg-primary-light/5 border-2 border-primary-light/20 rounded-xl p-4 body focus:border-primary-light outline-none dark:bg-night"
                  >
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block title text-xs uppercase tracking-widest mb-2 opacity-60">Contenido</label>
                  <textarea 
                    required
                    value={newThreadContent} onChange={e => this.setState({ newThreadContent: e.target.value })}
                    className="w-full h-40 bg-primary-light/5 border-2 border-primary-light/20 rounded-xl p-4 body resize-none focus:border-primary-light outline-none"
                    placeholder="Desarrolla tu idea o pregunta..."
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-8 py-4 bg-primary-light text-white rounded-xl title text-lg hover:shadow-lg hover:-translate-y-1 transition-all">PUBLICAR DEBATE</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="lg:w-1/4">
           <div className="glass-card p-8 sticky top-32 border-l-4 border-secondary-light shadow-xl">
              <h2 className="title text-3xl mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                 <MessageCircle className="text-secondary-light" /> Debates
              </h2>
              <div className="space-y-2">
                 {CATEGORIES.map(cat => (
                   <button 
                    key={cat} 
                    onClick={() => this.setCategory(cat)}
                    className={`w-full text-left p-4 rounded-xl body font-bold flex items-center justify-between transition-all group ${
                      activeCategory === cat 
                      ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' 
                      : 'hover:bg-primary-light/10 text-primary-dark/60 dark:text-white/60'
                    }`}
                   >
                      <span className="title text-[10px] uppercase tracking-widest">{t('FORUM.CATEGORIES.' + cat)}</span>
                   </button>
                 ))}
              </div>

              {/* Temas del Hilo / Popular Tags */}
              <div className="mt-10 pt-10 border-t border-primary-light/10">
                 <h3 className="title text-xs uppercase tracking-[0.2em] mb-6 opacity-40">{t('FORUM.TOPICS.TITLE')}</h3>
                 <div className="flex flex-wrap gap-2">
                    {['#Optimizacion', '#Phaser3', '#SorzalArte', '#IA_Debate', '#MarketplaceTips', '#CristalCrypto'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-primary-light/5 hover:bg-primary-light/20 rounded-lg text-[10px] body font-bold text-primary-light cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
              <button 
                onClick={() => user ? this.setState({ isCreatingThread: true }) : this.props.showNotification?.('Inicia sesión para crear un debate', 'info')}
                className="w-full mt-10 py-5 bg-secondary-light text-white rounded-2xl title text-xl hover:shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:-translate-y-1 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                 <Plus size={24}/> Iniciar Tema
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4 space-y-8 animate-in fade-in duration-500">
           {/* Search & Filter */}
           <div className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center border-b-4 border-primary-light shadow-lg">
              <div className="relative flex-1 w-full group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light group-focus-within:scale-110 transition-transform" size={20}/>
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={this.handleSearch}
                  placeholder="Explorar hilos de debate..." 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-primary-light/20 rounded-2xl outline-none focus:border-primary-light body text-lg transition-all"
                 />
              </div>
              <button className="flex items-center gap-3 px-8 py-4 hover:bg-primary-light hover:text-white rounded-2xl border-2 border-primary-light/20 body font-bold transition-all uppercase tracking-widest text-xs">
                 <Filter size={18}/> Filtros
              </button>
           </div>

           {/* Thread List */}
           <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 title text-2xl animate-pulse">CARGANDO DEBATES...</div>
              ) : threads.length > 0 ? threads.map(threadItem => {
                const threadUpvoted = user && this.hasVoted(threadItem.upvotes, user._id);
                return (
                  <div 
                    key={threadItem._id} 
                    onClick={() => this.selectThread(threadItem)}
                    className="glass-card p-8 flex gap-8 hover:translate-x-2 transition-all cursor-pointer group shadow-lg border-2 border-transparent hover:border-primary-light/30 relative overflow-hidden"
                  >
                     <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-primary-light/10 rounded-[2rem] min-w-[100px] border border-primary-light/5">
                        <button onClick={(e) => this.handleVoteThread(e, threadItem._id, threadUpvoted ? 0 : 1)} className={`p-2 hover:bg-primary-light hover:text-white rounded-xl transition-all ${threadUpvoted ? 'bg-primary-light text-white' : 'text-primary-light'}`}><ChevronUp size={40}/></button>
                        <span className="title text-3xl text-primary-light">{this.getVotesScore(threadItem.upvotes, threadItem.downvotes)}</span>
                     </div>

                     <div className="flex-1 space-y-4">
                        <div className="flex items-center flex-wrap gap-4">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-light bg-secondary-light/10 px-3 py-1 rounded-full border border-secondary-light/10">{t('FORUM.CATEGORIES.' + threadItem.category)}</span>
                           <span className="text-[10px] opacity-40 body font-bold uppercase tracking-widest flex items-center gap-2">
                              <User size={12} /> @{threadItem.user?.name || 'Usuario'} • {this.formatDate(threadItem.createdAt)}
                           </span>
                        </div>

                        <h3 className="title text-3xl text-primary-dark dark:text-white group-hover:text-primary-light transition-colors leading-tight">
                           {this.translateThreadTitle(threadItem.title)}
                        </h3>

                        <p className="body text-sm opacity-60 line-clamp-2 italic">
                           "{this.translateThreadContent(threadItem.content, threadItem)}"
                        </p>
                        <div className="flex gap-8 mt-6 pt-6 border-t border-primary-light/5 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                           <div className="flex items-center gap-2 text-primary-light"><MessageSquare size={16}/> {threadItem.repliesCount} comentarios</div>
                           <div className="flex items-center gap-2 hover:text-secondary-light transition-colors"><ThumbsUp size={16}/> Compartir</div>
                           <div className="hidden md:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Haz click para entrar al debate →</div>
                        </div>
                     </div>
                  </div>
                )
              })
 : (
                <div className="text-center py-20 glass-card">
                   <p className="title text-2xl opacity-30 uppercase tracking-widest italic">No hay debates que coincidan con tu búsqueda</p>
                </div>
              )}
           </div>
        </div>
      </main>
    );
  }
}

export const ForumPage = withTranslation()(withRouter(ForumPageBase));

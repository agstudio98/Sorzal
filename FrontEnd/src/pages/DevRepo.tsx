import { Component } from 'react';
import { 
  Code2, GitBranch, Star, Terminal, ExternalLink, 
  Upload, X, Send, Download, Trash2, Edit2, 
  MessageCircle, Loader2, FileCode, Check, AlertCircle, Info
} from 'lucide-react';
import { 
  fetchRepos, createRepo, updateRepo, deleteRepo, 
  toggleStarRepo, fetchRepoComments, addRepoComment, 
  deleteRepoComment, updateRepoComment
} from '../api';
import { withRouter } from '../utils/withRouter';

interface Repo {
  _id: string;
  title: string;
  description: string;
  language: string;
  fileUrl: string;
  fileName: string;
  size: number;
  stars: number;
  starUsers: string[];
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DevRepoState {
  repos: Repo[];
  loading: boolean;
  showModal: 'none' | 'upload' | 'view' | 'confirm-delete';
  selectedRepo: Repo | null;
  comments: Comment[];
  loadingComments: boolean;
  newComment: string;
  editingCommentId: string | null;
  editingCommentContent: string;
  
  // Form state
  title: string;
  description: string;
  language: string;
  file: File | null;
  isEditing: boolean;
  submitting: boolean;

  notifications: Notification[];
}

export class DevRepoPageBase extends Component<any, DevRepoState> {
  state: DevRepoState = {
    repos: [],
    loading: true,
    showModal: 'none',
    selectedRepo: null,
    comments: [],
    loadingComments: false,
    newComment: '',
    editingCommentId: null,
    editingCommentContent: '',
    title: '',
    description: '',
    language: 'TypeScript',
    file: null,
    isEditing: false,
    submitting: false,
    notifications: []
  };

  async componentDidMount() {
    this.loadRepos();
    if (this.props.router?.location?.state?.create) {
      this.openUploadModal();
      window.history.replaceState({}, document.title);
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

  loadRepos = async () => {
    try {
      const repos = await fetchRepos();
      this.setState({ repos, loading: false });
    } catch (error) {
      this.addNotification('Error al cargar repositorios', 'error');
      this.setState({ loading: false });
    }
  };

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ file: e.target.files[0] });
    }
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = this.props;
    if (!user) return this.addNotification('Inicia sesión para subir repositorios', 'error');

    const { title, description, language, file, isEditing, selectedRepo } = this.state;
    if (!title || !description || !language || (!file && !isEditing)) {
      return this.addNotification('Completa todos los campos', 'info');
    }

    this.setState({ submitting: true });
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('language', language);
    formData.append('userId', user._id);
    if (file) formData.append('file', file);

    try {
      if (isEditing && selectedRepo) {
        await updateRepo(selectedRepo._id, formData);
        this.addNotification('Repositorio actualizado', 'success');
      } else {
        await createRepo(formData);
        this.addNotification('Repositorio publicado', 'success');
      }
      this.setState({ showModal: 'none', submitting: false });
      this.loadRepos();
    } catch (error) {
      this.addNotification('Error al procesar la solicitud', 'error');
      this.setState({ submitting: false });
    }
  };

  handleDeleteRepo = async () => {
    const { user } = this.props;
    const { selectedRepo } = this.state;
    if (!selectedRepo || !user) return;
    
    try {
      await deleteRepo(selectedRepo._id, user._id);
      this.addNotification('Repositorio eliminado', 'info');
      this.loadRepos();
      this.setState({ showModal: 'none', selectedRepo: null });
    } catch (error) {
      this.addNotification('Error al eliminar', 'error');
    }
  };

  handleToggleStar = async (id: string) => {
    const { user } = this.props;
    if (!user) return this.addNotification('Inicia sesión para dar estrella', 'info');
    
    try {
      const { stars, starUsers } = await toggleStarRepo(id, user._id);
      this.setState(prev => ({
        repos: prev.repos.map(r => r._id === id ? { ...r, stars, starUsers } : r),
        selectedRepo: prev.selectedRepo?._id === id ? { ...prev.selectedRepo, stars, starUsers } : prev.selectedRepo
      }));
    } catch (error) {
      this.addNotification('Error al dar estrella', 'error');
    }
  };

  loadComments = async (repoId: string) => {
    this.setState({ loadingComments: true });
    try {
      const comments = await fetchRepoComments(repoId);
      this.setState({ comments, loadingComments: false });
    } catch (error) {
      this.setState({ loadingComments: false });
    }
  };

  handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = this.props;
    const { selectedRepo, newComment } = this.state;
    if (!user || !selectedRepo || !newComment.trim()) return;

    try {
      const comment = await addRepoComment(selectedRepo._id, { userId: user._id, content: newComment });
      this.setState(prev => ({
        comments: [comment, ...prev.comments],
        newComment: ''
      }));
      this.addNotification('Comentario añadido', 'success');
    } catch (error) {
      this.addNotification('Error al comentar', 'error');
    }
  };

  handleDeleteComment = async (commentId: string) => {
    const { user } = this.props;
    try {
      await deleteRepoComment(commentId, user._id);
      this.setState(prev => ({
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
      this.addNotification('Comentario eliminado', 'info');
    } catch (error) {
      this.addNotification('Error al eliminar comentario', 'error');
    }
  };

  handleUpdateComment = async (commentId: string) => {
    const { user } = this.props;
    const { editingCommentContent } = this.state;
    if (!user || !editingCommentContent.trim()) return;

    try {
      const updatedComment = await updateRepoComment(commentId, { userId: user._id, content: editingCommentContent });
      this.setState(prev => ({
        comments: prev.comments.map(c => c._id === commentId ? updatedComment : c),
        editingCommentId: null,
        editingCommentContent: ''
      }));
      this.addNotification('Comentario actualizado', 'success');
    } catch (error) {
      this.addNotification('Error al actualizar comentario', 'error');
    }
  };

  openViewModal = (repo: Repo) => {
    this.setState({ selectedRepo: repo, showModal: 'view', newComment: '' });
    this.loadComments(repo._id);
  };

  openUploadModal = (repo: Repo | null = null) => {
    if (repo) {
      this.setState({
        showModal: 'upload',
        isEditing: true,
        selectedRepo: repo,
        title: repo.title,
        description: repo.description,
        language: repo.language,
        file: null
      });
    } else {
      this.setState({
        showModal: 'upload',
        isEditing: false,
        selectedRepo: null,
        title: '',
        description: '',
        language: 'TypeScript',
        file: null
      });
    }
  };

  render() {
    const { user } = this.props;
    const { 
      repos, loading, showModal, selectedRepo, comments, 
      loadingComments, newComment, title, description, 
      language, submitting, notifications, isEditing,
      editingCommentId, editingCommentContent
    } = this.state;

    return (
      <main className="min-h-screen bg-day dark:bg-night pt-32 pb-20 px-6 transition-colors duration-500">
        {/* Notifications */}
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

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4 text-center md:text-left">
             <div className="space-y-4">
                <h1 className="title text-6xl md:text-8xl text-primary-dark dark:text-white uppercase tracking-tighter flex items-center gap-6 justify-center md:justify-start">
                   <Terminal size={72} className="text-primary-light" /> REPO <span className="text-primary-light italic">DEV</span>
                </h1>
                <p className="body text-2xl opacity-60 font-light italic max-w-2xl">Comparte código, módulos y herramientas con el ecosistema Sorzal.</p>
             </div>
             <button 
              onClick={() => this.openUploadModal()}
              className="px-10 py-4 bg-primary-light text-white rounded-2xl title text-xl shadow-xl flex items-center gap-3 hover:scale-105 transition-all hover:bg-primary-dark"
             >
                <Upload size={24} /> PUBLICAR REPO
             </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
               <Loader2 size={64} className="animate-spin text-primary-light opacity-20" />
               <p className="title text-xl opacity-20 uppercase tracking-widest">Sincronizando con el servidor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {repos.map(repo => (
                 <div 
                  key={repo._id} 
                  className="glass-card group relative overflow-hidden flex flex-col border-b-8 border-transparent hover:border-primary-light transition-all duration-700 hover:-translate-y-4"
                 >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-150 duration-700">
                       <Code2 size={120} />
                    </div>
                    
                    <div className="p-10 space-y-6 flex-1 flex flex-col relative z-10">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${repo.language === 'TypeScript' ? 'bg-blue-500' : repo.language === 'Rust' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                             <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary-light">{repo.language}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light text-[10px] font-bold overflow-hidden">
                                {repo.user?.avatar ? <img src={repo.user.avatar} className="w-full h-full object-cover"/> : (repo.user?.name || 'U').charAt(0)}
                             </div>
                             <span className="text-[10px] uppercase font-bold opacity-40">{repo.user?.name || 'Usuario'}</span>
                          </div>                       </div>

                       <div className="space-y-2 flex-1">
                          <h3 className="title text-4xl text-primary-dark dark:text-white tracking-tighter line-clamp-1">{repo.title}</h3>
                          <div className="flex items-center gap-2 mb-2 opacity-40">
                             <Check size={12} className="text-primary-light" />
                             <span className="text-[9px] uppercase font-bold tracking-widest">
                                {new Date(repo.createdAt).toLocaleDateString()} - {new Date(repo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <p className="body text-sm opacity-60 line-clamp-3 italic leading-relaxed">"{repo.description}"</p>
                       </div>
                       
                       <div className="flex justify-between items-center pt-6 border-t border-primary-light/10">
                          <div className="flex gap-6">
                             <button 
                              onClick={() => this.handleToggleStar(repo._id)}
                              className={`flex items-center gap-2 text-sm font-bold transition-all ${repo.starUsers?.includes(user?._id) ? 'text-yellow-500' : 'opacity-60 hover:text-yellow-500'}`}
                             >
                                <Star size={18} fill={repo.starUsers?.includes(user?._id) ? 'currentColor' : 'none'} /> {repo.stars}
                             </button>
                             <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                                <FileCode size={18} /> {(repo.size / 1024).toFixed(1)} KB
                             </div>
                          </div>
                          <button 
                            onClick={() => this.openViewModal(repo)}
                            className="p-4 glass-card border-primary-light/20 text-primary-light hover:bg-primary-light hover:text-white transition-all rounded-2xl group/btn shadow-lg"
                          >
                             <ExternalLink size={20} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Upload/Edit Modal */}
          {showModal === 'upload' && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
               <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-primary-light/10 flex justify-between items-center bg-primary-light/5">
                     <h2 className="title text-3xl uppercase tracking-widest text-primary-light flex items-center gap-3">
                        <Terminal size={32} /> {isEditing ? 'Editar' : 'Publicar'} Repositorio
                     </h2>
                     <button onClick={() => this.setState({ showModal: 'none' })} className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <form onSubmit={this.handleSubmit} className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Título del Proyecto</label>
                           <input 
                            type="text" 
                            value={title}
                            onChange={e => this.setState({ title: e.target.value })}
                            className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all"
                            placeholder="Ej: Sorzal UI Toolkit"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Lenguaje Principal</label>
                           <select 
                            value={language}
                            onChange={e => this.setState({ language: e.target.value })}
                            className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all appearance-none cursor-pointer"
                           >
                              <option value="TypeScript">TypeScript</option>
                              <option value="Rust">Rust</option>
                              <option value="Python">Python</option>
                              <option value="Go">Go</option>
                              <option value="C++">C++</option>
                           </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Descripción</label>
                        <textarea 
                          value={description}
                          onChange={e => this.setState({ description: e.target.value })}
                          className="w-full bg-white/5 border-2 border-primary-light/10 rounded-2xl p-4 body outline-none focus:border-primary-light transition-all min-h-[120px] resize-none"
                          placeholder="Describe las funcionalidades y objetivos de este módulo..."
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 ml-2">Archivo Fuente (.zip, .ts, .rs, etc)</label>
                        <div className="relative group/file">
                           <input 
                            type="file" 
                            onChange={this.handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                           />
                           <div className="w-full bg-primary-light/5 border-2 border-dashed border-primary-light/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover/file:border-primary-light transition-all">
                              <FileCode size={48} className="text-primary-light opacity-40 group-hover/file:scale-110 transition-transform" />
                              <p className="body text-sm font-bold opacity-60">
                                 {this.state.file ? this.state.file.name : isEditing ? 'Cambiar archivo (opcional)' : 'Arrastra o selecciona un archivo'}
                              </p>
                              <p className="text-[8px] uppercase tracking-widest opacity-30">Máximo 10MB • Archivos comprimidos recomendados</p>
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <button 
                          type="button"
                          onClick={() => this.setState({ showModal: 'none' })}
                          className="flex-1 py-4 glass-card border-white/10 rounded-2xl title text-sm uppercase tracking-widest hover:bg-white/5"
                        >
                           Cancelar
                        </button>
                        <button 
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-4 bg-primary-light text-white rounded-2xl title text-sm uppercase tracking-widest shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {submitting ? <Loader2 className="animate-spin" size={20}/> : <Check size={20}/>}
                           {isEditing ? 'Guardar Cambios' : 'Publicar Ahora'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
          )}

          {/* View Repo Modal */}
          {showModal === 'view' && selectedRepo && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-500">
               <div className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col lg:flex-row">
                  {/* Left Side: Repo Info */}
                  <div className="flex-1 p-12 space-y-8 overflow-y-auto custom-scrollbar border-r border-white/5">
                     <div className="flex justify-between items-start">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="px-4 py-1.5 bg-primary-light/10 text-primary-light border border-primary-light/20 rounded-full text-[10px] font-bold tracking-widest uppercase">{selectedRepo.language}</span>
                              <span className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Publicado el {new Date(selectedRepo.createdAt).toLocaleDateString()}</span>
                           </div>
                           <h2 className="title text-6xl text-primary-dark dark:text-white uppercase tracking-tighter">{selectedRepo.title}</h2>
                        </div>
                        <div className="flex gap-3">
                           {user?._id === selectedRepo.user._id && (
                             <>
                                <button 
                                  onClick={() => this.openUploadModal(selectedRepo)}
                                  className="p-3 bg-sky-500/10 text-sky-500 rounded-xl hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20"
                                  title="Editar"
                                >
                                   <Edit2 size={24} />
                                </button>
                                <button 
                                  onClick={() => this.setState({ showModal: 'confirm-delete' })}
                                  className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                  title="Eliminar"
                                >
                                   <Trash2 size={24} />
                                </button>
                             </>
                           )}
                           <button onClick={() => this.setState({ showModal: 'none' })} className="p-3 bg-white/5 text-white/40 hover:text-white rounded-xl transition-all">
                              <X size={32} />
                           </button>
                        </div>
                     </div>

                     <p className="body text-2xl opacity-70 leading-relaxed italic border-l-8 border-primary-light/20 pl-8">
                        "{selectedRepo.description}"
                     </p>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex flex-col items-center gap-2 bg-white/5 border border-white/5">
                           <Star size={32} className="text-yellow-400 fill-yellow-400"/>
                           <span className="title text-2xl">{selectedRepo.stars}</span>
                           <span className="body text-[8px] uppercase font-bold opacity-40 tracking-widest">Estrellas</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center gap-2 bg-white/5 border border-white/5">
                           <FileCode size={32} className="text-primary-light"/>
                           <span className="title text-2xl">{(selectedRepo.size / 1024).toFixed(1)} KB</span>
                           <span className="body text-[8px] uppercase font-bold opacity-40 tracking-widest">Peso del Módulo</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center gap-2 bg-white/5 border border-white/5">
                           <Check size={32} className="text-emerald-500"/>
                           <span className="title text-2xl">Verified</span>
                           <span className="body text-[8px] uppercase font-bold opacity-40 tracking-widest">Sorzal Safe</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 p-8 glass-card bg-primary-light/5 border-primary-light/20">
                        <div className="flex-1">
                           <p className="title text-xl mb-1 uppercase tracking-wider">{selectedRepo.fileName}</p>
                           <p className="body text-xs opacity-50 uppercase tracking-tighter">Click en el botón lateral para descargar el código fuente y las dependencias.</p>
                        </div>
                        <a 
                          href={selectedRepo.fileUrl} 
                          download 
                          className="p-6 bg-primary-light text-white rounded-2xl shadow-2xl hover:bg-primary-dark transition-all hover:scale-110 flex items-center gap-3"
                        >
                           <Download size={32} />
                           <span className="title text-2xl">DESCUBRIR</span>
                        </a>
                     </div>
                  </div>

                  {/* Right Side: Comments */}
                  <div className="w-full lg:w-[450px] bg-primary-dark/5 dark:bg-black/40 flex flex-col h-full overflow-hidden">
                     <div className="p-8 border-b border-white/5 flex items-center gap-3">
                        <MessageCircle size={24} className="text-primary-light"/>
                        <h3 className="title text-xl uppercase tracking-widest">Feedback de la Comunidad</h3>
                     </div>

                     <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {loadingComments ? (
                           <div className="flex justify-center py-20 opacity-20"><Loader2 className="animate-spin" size={48}/></div>
                        ) : comments.length > 0 ? (
                           comments.map(c => (
                              <div key={c._id} className="glass-card p-6 space-y-4 border-white/5 hover:border-primary-light/20 transition-all group/comm">
                                 <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-primary-light/20 rounded-xl flex items-center justify-center text-primary-light title text-lg overflow-hidden">
                                          {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover"/> : (c.user?.name || 'U').charAt(0)}
                                       </div>
                                       <div>
                                          <p className="title text-sm uppercase tracking-wider">{c.user.name}</p>
                                          <p className="text-[8px] opacity-40 uppercase font-bold">{new Date(c.createdAt).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                    {user?._id === c.user._id && (
                                       <div className="flex gap-2">
                                          <button 
                                           onClick={() => this.setState({ editingCommentId: c._id, editingCommentContent: c.content })}
                                           className="p-2 opacity-0 group-hover/comm:opacity-100 hover:bg-sky-500/20 text-sky-500 rounded-lg transition-all"
                                          >
                                             <Edit2 size={16} />
                                          </button>
                                          <button 
                                           onClick={() => this.handleDeleteComment(c._id)}
                                           className="p-2 opacity-0 group-hover/comm:opacity-100 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                          >
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                    )}
                                 </div>
                                 {editingCommentId === c._id ? (
                                    <div className="space-y-3">
                                       <textarea 
                                          value={editingCommentContent}
                                          onChange={e => this.setState({ editingCommentContent: e.target.value })}
                                          className="w-full bg-white/5 border border-primary-light/30 rounded-xl p-3 body text-sm outline-none focus:border-primary-light transition-all min-h-[80px] resize-none"
                                       />
                                       <div className="flex gap-2">
                                          <button 
                                             onClick={() => this.handleUpdateComment(c._id)}
                                             className="px-4 py-2 bg-primary-light text-white rounded-lg title text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all"
                                          >
                                             Guardar
                                          </button>
                                          <button 
                                             onClick={() => this.setState({ editingCommentId: null, editingCommentContent: '' })}
                                             className="px-4 py-2 glass-card border-white/10 rounded-lg title text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                                          >
                                             Cancelar
                                          </button>
                                       </div>
                                    </div>
                                 ) : (
                                    <p className="body text-sm opacity-80 italic leading-relaxed">"{c.content}"</p>
                                 )}
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-20 opacity-20">
                              <MessageCircle size={64} className="mx-auto mb-4"/>
                              <p className="title text-xs uppercase tracking-widest">Sé el primero en comentar</p>
                           </div>
                        )}
                     </div>

                     <form onSubmit={this.handleAddComment} className="p-8 border-t border-white/5 flex gap-3">
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={e => this.setState({ newComment: e.target.value })}
                          placeholder="Escribe tu opinión..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 body text-sm outline-none focus:border-primary-light transition-all"
                        />
                        <button 
                          type="submit"
                          className="p-4 bg-primary-light text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg"
                        >
                           <Send size={20} />
                        </button>
                     </form>
                  </div>
               </div>
            </div>
          )}

          {/* Confirm Delete Modal */}
          {showModal === 'confirm-delete' && selectedRepo && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
               <div className="glass-card w-full max-w-md p-8 space-y-6 shadow-2xl border-t-8 border-rose-500 animate-in zoom-in-95 duration-300">
                  <div className="text-center space-y-4">
                     <AlertCircle size={64} className="mx-auto text-rose-500" />
                     <h3 className="title text-3xl uppercase tracking-tighter">¿Eliminar Proyecto?</h3>
                     <p className="body opacity-60 italic text-center">Esta acción es irreversible. Se borrarán todos los archivos y comentarios asociados a <strong>{selectedRepo.title}</strong>.</p>
                  </div>
                  <div className="flex gap-4">
                     <button 
                      onClick={() => this.setState({ showModal: 'view' })}
                      className="flex-1 py-4 glass-card border-white/10 rounded-2xl title text-sm uppercase tracking-widest hover:bg-white/5"
                     >
                        Cancelar
                     </button>
                     <button 
                      onClick={this.handleDeleteRepo}
                      className="flex-1 py-4 bg-rose-500 text-white rounded-2xl title text-sm uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all"
                     >
                        Confirmar
                     </button>
                  </div>
               </div>
            </div>
          )}

          {repos.length === 0 && !loading && (
            <div className="text-center py-40 space-y-6 opacity-20">
               <GitBranch size={80} className="mx-auto" />
               <p className="title text-4xl uppercase tracking-tighter">Aún no hay módulos en este sector</p>
               <button 
                onClick={() => this.openUploadModal()}
                className="text-primary-light body font-bold uppercase tracking-[0.3em] hover:underline"
               >
                  Inaugurar repositorio
               </button>
            </div>
          )}
        </div>
      </main>
    );
  }
}
export const DevRepoPage = withRouter(DevRepoPageBase);

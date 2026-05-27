import { Component } from 'react';
import { 
  ShoppingCart, Heart, Eye, MessageCircle, Star, 
  ChevronLeft, ChevronRight, Laptop, Cpu, Camera, 
  Layers, Headphones, Package, Trash2, Edit3, Send, Check
} from 'lucide-react';
import { fetchProducts, fetchProductComments, addProductComment, deleteComment, updateComment } from '../../api';
import { cleanTitle } from '../../utils/textUtils';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  numReviews: number;
  likes: string[];
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface MarketplaceMainState {
  products: Product[];
  loading: boolean;
  page: number;
  pages: number;
  selectedProduct: Product | null;
  comments: any[];
  newComment: string;
  newRating: number;
  editingCommentId: string | null;
  loadingComments: boolean;
  isConfirmingPayment: boolean;
  showConfirmModal: boolean;
  confirmModalConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
}

interface MarketplaceMainProps {
  user: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeCategory: string;
}

export class MarketplaceMain extends Component<MarketplaceMainProps, MarketplaceMainState> {
  state: MarketplaceMainState = {
    products: [],
    loading: true,
    page: 1,
    pages: 1,
    selectedProduct: null,
    comments: [],
    newComment: '',
    newRating: 5,
    editingCommentId: null,
    loadingComments: false,
    isConfirmingPayment: false,
    showConfirmModal: false,
    confirmModalConfig: null
  };

  componentDidMount() {
    this.loadProducts();
  }

  componentDidUpdate(prevProps: MarketplaceMainProps) {
    if (prevProps.activeCategory !== this.props.activeCategory) {
      this.setState({ page: 1 }, () => this.loadProducts());
    }
  }

  loadProducts = async () => {
    try {
      this.setState({ loading: true });
      const data = await fetchProducts(this.state.page, '', this.props.activeCategory, true);
      this.setState({ 
        products: data.products,
        pages: data.pages,
        loading: false 
      });
    } catch (err) {
      this.setState({ loading: false });
    }
  };

  handlePageChange = (newPage: number) => {
    this.setState({ page: newPage }, () => {
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  openProduct = async (product: Product) => {
    this.setState({ selectedProduct: product, loadingComments: true, comments: [] });
    try {
      const comments = await fetchProductComments(product._id);
      this.setState({ comments, loadingComments: false });
    } catch (err) {
      this.setState({ loadingComments: false });
    }
  };

  closeProduct = () => {
    this.setState({ selectedProduct: null, comments: [], newComment: '', isConfirmingPayment: false });
  };

  handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { selectedProduct, newComment, newRating, editingCommentId } = this.state;
    const { user, showNotification } = this.props;
    if (!user || !newComment.trim() || !selectedProduct) return;

    try {
      if (editingCommentId) {
        const updated = await updateComment(selectedProduct._id, editingCommentId, {
          userId: user._id,
          content: newComment,
          rating: newRating
        });
        this.setState({
          comments: this.state.comments.map(c => c._id === editingCommentId ? updated : c),
          newComment: '',
          newRating: 5,
          editingCommentId: null
        });
        showNotification('Valoración actualizada', 'success');
      } else {
        const comment = await addProductComment(selectedProduct._id, {
          userId: user._id,
          content: newComment,
          rating: newRating
        });
        this.setState({ 
          comments: [comment, ...this.state.comments],
          newComment: '',
          newRating: 5,
        });
        showNotification('Valoración enviada con éxito', 'success');
      }

      // Refresh product stats
      const updatedProducts = await fetchProducts(this.state.page, '', this.props.activeCategory, true);
      const updatedSelected = updatedProducts.products.find((p: any) => p._id === selectedProduct._id);
      this.setState({ 
        selectedProduct: updatedSelected || selectedProduct,
        products: updatedProducts.products
      });
    } catch (err) {
      showNotification('Error al procesar comentario', 'error');
    }
  };

  handleDeleteComment = (commentId: string) => {
    const { selectedProduct } = this.state;
    const { user } = this.props;
    if (!user || !selectedProduct) return;

    this.setState({
      showConfirmModal: true,
      confirmModalConfig: {
        title: 'ELIMINAR VALORACIÓN',
        message: '¿Estás seguro de que deseas borrar esta pieza de tu opinión? Esta acción no se puede deshacer.',
        onConfirm: async () => {
          try {
            await deleteComment(selectedProduct._id, commentId, user._id);
            
            const updatedProducts = await fetchProducts(this.state.page, '', this.props.activeCategory, true);
            const updatedSelected = updatedProducts.products.find((p: any) => p._id === selectedProduct._id);

            this.setState({
              comments: this.state.comments.filter(c => c._id !== commentId),
              selectedProduct: updatedSelected || selectedProduct,
              products: updatedProducts.products,
              showConfirmModal: false
            });
            this.props.showNotification('Valoración eliminada', 'info');
          } catch (err) {
            this.props.showNotification('Error al eliminar valoración', 'error');
            this.setState({ showConfirmModal: false });
          }
        }
      }
    });
  };

  startEditingComment = (comment: any) => {
    this.setState({
      editingCommentId: comment._id,
      newComment: comment.content,
      newRating: comment.rating
    });
  };

  handlePayment = () => {
    this.setState({ isConfirmingPayment: true });
    setTimeout(() => {
      this.props.showNotification('¡Pago confirmado con éxito!', 'success');
      this.closeProduct();
    }, 2000);
  };

  getIconForCategory = (imageUrl: string) => {
    const size = 120;
    const color = "currentColor";
    if (imageUrl.includes('HARDWARE')) return <Cpu size={size} className={color} />;
    if (imageUrl.includes('SOFTWARE')) return <Layers size={size} className={color} />;
    if (imageUrl.includes('CÁMARAS')) return <Camera size={size} className={color} />;
    if (imageUrl.includes('LENTES')) return <Package size={size} className={color} />;
    if (imageUrl.includes('ACCESORIOS')) return <Headphones size={size} className={color} />;
    return <Laptop size={size} className={color} />;
  };

  render() {
    const { products, loading, page, pages, selectedProduct, comments, newComment, newRating, loadingComments, isConfirmingPayment, editingCommentId } = this.state;
    const { user } = this.props;

    if (loading) return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin"></div>
        <p className="title text-xl animate-pulse uppercase tracking-widest">Sincronizando Mercado...</p>
      </div>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((p) => (
            <div key={p._id} onClick={() => this.openProduct(p)} className="group glass-card overflow-hidden border-2 border-transparent hover:border-primary-light/30 transition-all rounded-[40px] shadow-lg cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-primary-dark/5 dark:bg-white/5 flex items-center justify-center">
                <div className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 text-primary-dark dark:text-white">
                  {this.getIconForCategory(p.imageUrl)}
                </div>
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                   <div className="bg-primary-light text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {p.category}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <div className="bg-white/90 dark:bg-night/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="title text-xs text-primary-dark dark:text-white">{p.rating.toFixed(1)}</span>
                      </div>
                   </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                   <button className="p-3 bg-white/90 rounded-full text-primary-dark hover:bg-primary-light hover:text-white transition-all shadow-lg">
                      <Eye size={20} />
                   </button>
                   <button className="p-3 bg-white/90 rounded-full text-primary-dark hover:bg-primary-light hover:text-white transition-all shadow-lg">
                      <ShoppingCart size={20} />
                   </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="title text-2xl text-primary-dark dark:text-white mb-2 line-clamp-1 group-hover:text-primary-light transition-colors">{cleanTitle(p.name)}</h3>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="body text-[10px] opacity-40 uppercase tracking-widest mb-1">Precio sugerido</p>
                      <span className="title text-3xl text-primary-light">${p.price}</span>
                   </div>
                   <div className="text-right">
                      <p className="body text-[10px] opacity-40 uppercase tracking-widest mb-1">Vendedor</p>
                      <p className="title text-xs uppercase tracking-tighter">@{p.user?.name || 'SorzalUser'}</p>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-10">
            <button 
              disabled={page === 1}
              onClick={() => this.handlePageChange(page - 1)}
              className="p-4 glass-card disabled:opacity-20 hover:text-primary-light transition-all rounded-2xl"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
               {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                 const p = i + 1;
                 return (
                   <button 
                    key={p}
                    onClick={() => this.handlePageChange(p)}
                    className={`w-12 h-12 rounded-2xl title text-lg transition-all ${page === p ? 'bg-primary-light text-white shadow-lg' : 'glass-card hover:bg-primary-light/10'}`}
                   >
                     {p}
                   </button>
                 );
               })}
            </div>
            <button 
              disabled={page === pages}
              onClick={() => this.handlePageChange(page + 1)}
              className="p-4 glass-card disabled:opacity-20 hover:text-primary-light transition-all rounded-2xl"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={this.closeProduct}></div>
             
             <div className="relative z-[110] w-full max-w-6xl h-full md:h-auto md:aspect-video glass-card overflow-hidden flex flex-col md:flex-row shadow-2xl">
                <div className="flex-1 bg-primary-dark/5 dark:bg-white/5 flex items-center justify-center p-12 relative">
                   <div className="text-primary-dark dark:text-white opacity-40">
                      {this.getIconForCategory(selectedProduct.imageUrl)}
                   </div>
                   <button onClick={this.closeProduct} className="absolute top-6 left-6 p-3 bg-black/10 hover:bg-black/20 rounded-full text-white md:hidden"><ChevronLeft size={24}/></button>
                </div>

                <div className="flex-1 bg-white dark:bg-night flex flex-col border-l border-primary-light/10">
                   <div className="p-8 border-b border-primary-light/10 flex items-center justify-between">
                      <Link to={`/profile/${selectedProduct.user?._id}`} className="flex items-center gap-4 hover:opacity-70 transition-opacity group">
                         <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-white title text-xl group-hover:scale-110 transition-transform overflow-hidden">
                            {selectedProduct.user?.avatar ? <img src={selectedProduct.user.avatar} className="w-full h-full object-cover"/> : (selectedProduct.user?.name || 'U').charAt(0)}
                         </div>                         <div>
                            <h4 className="title text-xl text-primary-dark dark:text-white uppercase tracking-tighter">@{selectedProduct.user?.name}</h4>
                            <p className="body text-[10px] opacity-40 uppercase tracking-widest">Vendedor Verificado</p>
                         </div>
                      </Link>
                      <button onClick={this.closeProduct} className="hidden md:block p-2 hover:bg-primary-light/10 rounded-full text-primary-dark dark:text-white"><X size={24} /></button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      <div className="space-y-4">
                         <div className="flex justify-between items-start">
                            <div>
                               <h2 className="title text-4xl text-primary-light uppercase leading-tight mb-2">{cleanTitle(selectedProduct.name)}</h2>
                               <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                     {[1,2,3,4,5].map(star => (
                                       <Star key={star} size={14} className={star <= Math.round(selectedProduct.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                                     ))}
                                  </div>
                                  <span className="title text-sm opacity-60">{selectedProduct.rating.toFixed(1)} ({selectedProduct.numReviews} reseñas)</span>
                               </div>
                            </div>
                            <span className="title text-4xl text-primary-dark dark:text-white">${selectedProduct.price}</span>
                         </div>
                         <p className="body text-sm opacity-70 leading-relaxed italic">"{selectedProduct.description}"</p>
                      </div>

                      <div className="flex gap-4">
                         <button 
                          onClick={this.handlePayment}
                          disabled={isConfirmingPayment}
                          className="flex-1 py-4 bg-primary-light text-white rounded-2xl title text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary-light/20 flex items-center justify-center gap-3 disabled:animate-pulse"
                         >
                            {isConfirmingPayment ? 'PROCESANDO...' : <><ShoppingCart size={24}/> CONFIRMAR COMPRA</>}
                         </button>
                         <button className="px-6 py-4 glass-card border-primary-light/20 text-primary-light hover:bg-primary-light/10 rounded-2xl transition-all">
                            <MessageCircle size={24} />
                         </button>
                      </div>

                      {/* Comments Section */}
                      <div className="space-y-6 pt-8 border-t border-primary-light/5">
                         <h5 className="title text-xs uppercase tracking-[0.2em] opacity-40">Valoraciones de la Comunidad ({comments.length})</h5>
                         
                         <div className="space-y-6">
                            {loadingComments ? (
                              <div className="animate-pulse flex space-y-4 flex-col">
                                <div className="h-4 bg-primary-light/10 rounded w-3/4"></div>
                                <div className="h-4 bg-primary-light/10 rounded w-1/2"></div>
                              </div>
                            ) : comments.map(c => (
                              <div key={c._id} className="flex gap-4 animate-in slide-in-from-bottom-2">
                                 <div className="w-8 h-8 bg-primary-light/20 rounded-lg flex items-center justify-center text-primary-light title text-xs overflow-hidden flex-shrink-0">
                                    {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover"/> : (c.user?.name || 'U').charAt(0)}
                                 </div>                                 <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center">
                                       <div className="flex flex-col">
                                          <span className="title text-[10px] uppercase tracking-widest">{c.user?.name}</span>
                                          <div className="flex gap-0.5">
                                             {[1,2,3,4,5].map(s => <Star key={s} size={8} className={s <= c.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />)}
                                          </div>
                                       </div>
                                       {user && c.user?._id === user._id && (
                                          <div className="flex gap-2">
                                             <button onClick={() => this.startEditingComment(c)} className="p-1.5 hover:bg-primary-light/10 rounded-lg text-primary-light transition-colors"><Edit3 size={12}/></button>
                                             <button onClick={() => this.handleDeleteComment(c._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 size={12}/></button>
                                          </div>
                                       )}
                                    </div>
                                    <p className="body text-xs opacity-70 leading-relaxed">{c.content}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-primary-light/5 border-t border-primary-light/10">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex gap-1">
                           {[1,2,3,4,5].map(star => (
                             <button key={star} onClick={() => this.setState({ newRating: star })} className="transition-transform hover:scale-125">
                               <Star size={16} className={star <= newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                             </button>
                           ))}
                        </div>
                        {editingCommentId && (
                           <button 
                            onClick={() => this.setState({ editingCommentId: null, newComment: '', newRating: 5 })}
                            className="text-[10px] uppercase font-bold text-red-500 hover:underline"
                           >
                              Cancelar Edición
                           </button>
                        )}
                      </div>
                      <form onSubmit={this.handleSendComment} className="flex gap-3 items-end">
                         <textarea 
                          value={newComment}
                          onChange={(e) => this.setState({ newComment: e.target.value })}
                          placeholder={user ? (editingCommentId ? "Editando tu valoración..." : "Escribe tu valoración...") : "Inicia sesión para valorar"}
                          disabled={!user}
                          className="w-full bg-white dark:bg-black/20 border-2 border-primary-light/20 rounded-2xl p-4 body text-xs outline-none focus:border-primary-light transition-all resize-none h-16 disabled:opacity-50"
                         />
                         <button type="submit" disabled={!user || !newComment.trim()} className="p-4 bg-primary-light text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary-light/20">
                            {editingCommentId ? <Check size={18} /> : <Send size={18} />}
                         </button>
                      </form>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {this.state.showConfirmModal && this.state.confirmModalConfig && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => this.setState({ showConfirmModal: false })}></div>
             <div className="relative z-[210] w-full max-w-md glass-card p-8 border-2 border-primary-light/30 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center text-center space-y-6">
                   <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                      <Trash2 size={32} />
                   </div>
                   <div>
                      <h3 className="title text-2xl text-primary-dark dark:text-white uppercase tracking-widest mb-2">{this.state.confirmModalConfig.title}</h3>
                      <p className="body text-sm opacity-60 italic">{this.state.confirmModalConfig.message}</p>
                   </div>
                   <div className="flex gap-4 w-full pt-4">
                      <button 
                        onClick={() => this.setState({ showConfirmModal: false })}
                        className="flex-1 py-3 bg-white/5 border border-primary-light/20 rounded-xl title text-xs hover:bg-white/10 transition-all uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={this.state.confirmModalConfig.onConfirm}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl title text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest"
                      >
                        Confirmar
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }
}

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

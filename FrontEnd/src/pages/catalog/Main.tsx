import { Component } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Star } from 'lucide-react';
import { fetchProducts } from '../../api';
import { cleanTitle } from '../../utils/textUtils';

interface Product {
  _id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  category: string;
  author?: string;
  likes?: number;
  comments?: number;
  rating?: number;
  numReviews?: number;
  user?: {
    name: string;
  };
  createdAt: string;
}

interface CatalogMainState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface CatalogMainProps {
  following?: string[] | null;
}

export class CatalogMain extends Component<CatalogMainProps, CatalogMainState> {
  constructor(props: CatalogMainProps) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      error: null
    };
  }

  async componentDidMount() {
    this.loadProducts();
  }

  async componentDidUpdate(prevProps: CatalogMainProps) {
    if (prevProps.following !== this.props.following) {
      this.loadProducts();
    }
  }

  loadProducts = async () => {
    try {
      this.setState({ loading: true });
      // Fixed parameters for fetchProducts (pageNumber, keyword, category, isMarket)
      const data = await fetchProducts(1, '', '', false); 
      this.setState({ products: data.products, loading: false });
    } catch (err) {
      this.setState({ error: 'Error al cargar los productos', loading: false });
    }
  }

  render() {
    const { products, loading, error } = this.state;

    if (loading) return <div className="text-center py-20 title text-2xl">Cargando catálogo...</div>;
    if (error) return <div className="text-center py-20 text-red-500 title text-2xl">{error}</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((item) => (
          <div key={item._id} className="glass-card overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer shadow-md">
            <div className="relative">
              <img src={item.imageUrl || item.image || `https://picsum.photos/seed/${item._id}/500/400`} alt={cleanTitle(item.name)} className="w-full h-64 object-cover" />
              <div className="absolute top-4 left-4 bg-primary-light text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                {item.category}
              </div>
              {item.createdAt && (
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest border border-white/10">
                   {new Date(item.createdAt).toLocaleDateString()} - {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md text-white transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-6">
              <h3 className="title text-2xl text-primary-dark dark:text-white mb-2 line-clamp-1 group-hover:text-primary-light transition-colors">
                {cleanTitle(item.name)}
              </h3>
              <div className="body text-sm opacity-60 mb-2 flex items-center gap-2">
                <div className="w-6 h-6 bg-secondary-light rounded-full"></div>
                Por @{item.user?.name || item.author || 'SorzalUser'}
              </div>

              <div className="flex items-center gap-1.5 mb-6">
                 <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={10} className={star <= Math.round(item.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-700"} />
                    ))}
                 </div>
                 <span className="title text-xs opacity-60">{(item.rating || 0).toFixed(1)}</span>
                 <span className="text-[8px] opacity-40 uppercase tracking-widest ml-1">({item.numReviews || 0})</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-primary-light/10 pt-4">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 hover:text-primary-light transition-colors"><Heart size={18}/> <span className="text-xs font-bold">{item.likes || 0}</span></button>
                  <button className="flex items-center gap-1 hover:text-primary-light transition-colors"><MessageCircle size={18}/> <span className="text-xs font-bold">{item.comments || 0}</span></button>
                </div>
                <button className="hover:text-primary-light transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

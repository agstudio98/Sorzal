import { Component } from 'react';
import { Star, MessageCircle, Heart } from 'lucide-react';
import { fetchTopProducts } from '../../api';
import { cleanTitle } from '../../utils/textUtils';

interface TopItem {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  likes: number;
}

interface TopState {
  items: TopItem[];
  loading: boolean;
}

export class HomeTop extends Component<{}, TopState> {
  state = {
    items: [],
    loading: true
  };

  async componentDidMount() {
    try {
      const data = await fetchTopProducts();
      this.setState({ items: data, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false });
    }
  }

  render() {
    const { items, loading } = this.state;

    if (loading) return <div className="body opacity-50 px-4">Cargando ranking...</div>;

    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item._id} className="glass-card p-4 flex gap-4 group hover:bg-primary-light/5 transition-all cursor-pointer">
            <div className="relative flex-shrink-0">
              <img src={item.imageUrl || `https://picsum.photos/seed/${item._id}/100/100`} className="w-16 h-16 rounded-xl object-cover shadow-md" />
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary-light text-white title text-xs flex items-center justify-center rounded-lg shadow-lg">
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[8px] uppercase font-bold text-primary-light tracking-widest mb-1">{item.category}</p>
              <h5 className="title text-sm text-primary-dark dark:text-white truncate group-hover:text-primary-light transition-colors">{cleanTitle(item.name)}</h5>
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1 text-[10px] font-bold opacity-60"><Heart size={12} className="text-red-500 fill-red-500" /> {item.likes}</div>
                 <div className="flex items-center gap-1 text-[10px] font-bold opacity-60"><Star size={12} className="text-yellow-500 fill-yellow-500" /> 5.0</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

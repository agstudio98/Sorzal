import { Component, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';
import { 
  User, Sun, Moon, Languages, 
  Camera, MessageSquare, PlayCircle, Gamepad2, 
  Terminal, Mic2, GraduationCap, Heart, ShoppingBag, 
  MessageCircle, MoreHorizontal, LogOut, Search
} from 'lucide-react';
import { globalSearch } from '../api';
import { cleanTitle } from '../utils/textUtils';

interface NavbarProps extends WithTranslation {
  toggleMode: () => void;
  isDarkMode: boolean;
  user: any | null;
  logout: () => void;
}

const NavLink = ({ to, icon, label, isDropdown = false }: { to: string; icon: React.ReactNode; label: string; isDropdown?: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 hover:text-primary-light transition-all p-2 rounded-xl hover:bg-white/10 group ${isDropdown ? 'w-full' : ''}`}
    title={label}
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className={`${isDropdown ? 'inline' : 'hidden lg:inline'} text-[10px] uppercase font-bold tracking-widest`}>{label}</span>
  </Link>
);

const SearchBar = ({ user }: { user: any }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performSearch = async () => {
      if (query.length > 2) {
        try {
          const res = await globalSearch(query);
          setResults(res);
          setIsOpen(true);
        } catch (err) { console.error(err); }
      } else {
        setIsOpen(false);
      }
    };
    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!user) return null;

  return (
    <div className="relative flex-1 max-w-md hidden md:block">
      <div className="bg-white/5 border border-primary-light/20 rounded-2xl flex items-center px-4 py-1.5 focus-within:border-primary-light transition-all">
        <Search size={18} className="text-primary-light opacity-50" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar piezas..." 
          className="bg-transparent border-none outline-none w-full p-2 body text-sm text-primary-dark dark:text-white"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#082F49] p-4 shadow-2xl border-2 border-primary-light/20 z-[60] rounded-3xl">
          <div className="max-h-[300px] overflow-y-auto space-y-4">
             {results.users.map((u: any) => (
               <Link key={u._id} to={`/profile/${u._id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-light/10 transition-colors">
                  <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white title text-xs overflow-hidden">
                     {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : (u.name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="title text-[10px] uppercase tracking-wider">{u.name || 'Usuario'}</p>
                    <p className="body text-[8px] opacity-60">@{(u.email || 'user').split('@')[0]}</p>
                  </div>
               </Link>
             ))}
             {results.posts.map((p: any) => (
               <div key={p._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-light/10 transition-colors cursor-pointer">
                  <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="title text-[10px] uppercase tracking-wider">{cleanTitle(p.name)}</p>
                    <p className="body text-[8px] opacity-60">{p.category}</p>
                  </div>
               </div>
             ))}
             {results.users.length === 0 && results.posts.length === 0 && (
               <p className="text-center body text-[10px] opacity-50 py-2 italic uppercase">Sin resultados</p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

const MoreMenu = ({ links }: { links: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center gap-1 hover:text-primary-light transition-all p-2 rounded-xl hover:bg-white/10 group"
        title="Más opciones"
      >
        <MoreHorizontal size={20} className="group-hover:scale-110 transition-transform" />
        <span className="hidden lg:inline text-[10px] uppercase font-bold tracking-widest">Más</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#082F49] border-2 border-primary-light/20 p-4 shadow-2xl z-50 animate-in fade-in zoom-in duration-200 origin-top-right rounded-3xl">
            <div className="grid gap-2">
              {links.map((link) => (
                <div key={link.to} onClick={() => setIsOpen(false)}>
                  <NavLink {...link} isDropdown />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

class Navbar extends Component<NavbarProps> {
  render() {
    const { i18n, toggleMode, isDarkMode, user, logout } = this.props;

    const changeLanguage = () => {
      const nextLng = i18n.language === 'es' ? 'en' : 'es';
      i18n.changeLanguage(nextLng);
    };

    const mainLinks = [
      { to: "/photography", icon: <Camera size={20}/>, label: "Fotos" },
      { to: "/forum", icon: <MessageSquare size={20}/>, label: "Foros" },
      { to: "/reels", icon: <PlayCircle size={20}/>, label: "Reels" },
    ];

    const moreLinks = [
      { to: "/marketplace", icon: <ShoppingBag size={20}/>, label: "Market" },
      { to: "/games", icon: <Gamepad2 size={20}/>, label: "Juegos" },
      { to: "/dev", icon: <Terminal size={20}/>, label: "Dev" },
      { to: "/podcasts", icon: <Mic2 size={20}/>, label: "Pod" },
      { to: "/courses", icon: <GraduationCap size={20}/>, label: "Cursos" },
      { to: "/discover", icon: <Heart size={20}/>, label: "Matches" },
      { to: "/messages", icon: <MessageCircle size={20}/>, label: "Chat" },
    ];

    return (
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-card px-2 md:px-6 py-2 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 md:gap-8 flex-1">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-light rounded-lg rotate-45 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <span className="logo-font text-white text-xl md:text-2xl -rotate-45">S</span>
            </div>
            <span className="hidden xl:block logo-font text-xl text-primary-dark dark:text-white uppercase tracking-tighter">SORZAL</span>
          </Link>

          <SearchBar user={user} />

          {user && (
            <div className="flex items-center gap-1 md:gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              {mainLinks.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
              <MoreMenu links={moreLinks} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {user && (
            <Link to="/support" className="p-2 hover:bg-white/10 rounded-full transition-colors text-primary-light animate-in fade-in duration-500" title="Soporte">
               <MessageCircle size={24} />
            </Link>
          )}

          <div className="h-8 w-[1px] bg-primary-light/20 mx-1"></div>

          <button onClick={changeLanguage} className="p-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1" title="Change Language">
            <Languages size={20} className="text-primary-light" />
            <span className="text-xs font-bold uppercase hidden md:inline">{i18n.language}</span>
          </button>

          <button onClick={toggleMode} className="p-2 rounded-full hover:bg-white/20 transition-colors" title="Toggle Theme">
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-primary-dark" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 animate-in zoom-in duration-300">
              <Link to="/profile" className="flex items-center gap-2 p-1 pr-4 bg-primary-light/10 hover:bg-primary-light/20 rounded-full transition-all border border-primary-light/20">
                <div className="w-8 h-8 bg-primary-light text-white rounded-full flex items-center justify-center title text-lg overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name || 'U').charAt(0)}
                </div>
                <span className="hidden md:inline title text-[10px] uppercase tracking-widest">{(user.name || 'Usuario').split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Cerrar Sesión"><LogOut size={20} /></button>
            </div>
          ) : (
            <Link to="/user" className="px-6 py-2 bg-primary-light text-white rounded-xl title text-sm hover:bg-primary-dark transition-all shadow-lg border-2 border-white/20">INICIAR SESIÓN</Link>
          )}
        </div>
      </nav>
    );
  }
}

export const NavbarTranslated = withTranslation()(Navbar);
export class NavbarComponent extends Navbar {}

import React, { Component, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavbarTranslated } from './components/Navbar';
import { Footer } from './components/Footer';
import { CreatorMode } from './components/CreatorMode';
import Home from './pages/Home';
import { CatalogPage } from './pages/Catalog';
import { MarketplacePage } from './pages/Marketplace';
import { UserPage } from './pages/User';
import { SupportPage } from './pages/Support';
import { GestorUser } from './pages/user/GestorUser';
import { UserProfilePage } from './pages/PublicProfile';
import { PhotographyPage } from './pages/Photography';
import { ForumPage } from './pages/Forum';
import { ReelsPage } from './pages/Reels';
import { GamesPage } from './pages/Games';
import { GamePlayPage } from './pages/GamePlay';
import { DevRepoPage } from './pages/DevRepo';
import { PodcastingPage } from './pages/Podcasting';
import { CoursesPage } from './pages/Courses';
import { PartnersPage } from './pages/Partners';
import { MessagesPage } from './pages/Messages';
import Discover from './pages/Discover';

interface AppState {
  isDarkMode: boolean;
  user: any | null;
  notification: { message: string, type: 'success' | 'error' | 'info' | '' } | null;
}

export default class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    const savedMode = localStorage.getItem('darkMode') === 'true';
    let savedUser = null;
    try {
      const storedUser = localStorage.getItem('user');
      savedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('user');
    }
    
    this.state = {
      isDarkMode: savedMode,
      user: savedUser,
      notification: null,
    };
  }

  showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    this.setState({ notification: { message, type } });
    setTimeout(() => this.setState({ notification: null }), 3000);
  };

  componentDidMount() {
    this.applyTheme();
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = () => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    this.setState({ user });
  };

  login = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    this.setState({ user: userData });
    this.showNotification(`¡Bienvenido, ${userData?.name || 'Usuario'}!`, 'success');
  };

  logout = () => {
    localStorage.removeItem('user');
    this.setState({ user: null });
    this.showNotification('Sesión cerrada con éxito', 'info');
  };

  updateUser = (updatedData: any) => {
    const newUser = { ...this.state.user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    this.setState({ user: newUser });
  };

  toggleMode = () => {
    this.setState(
      (prevState) => ({ isDarkMode: !prevState.isDarkMode }),
      () => {
        localStorage.setItem('darkMode', this.state.isDarkMode.toString());
        this.applyTheme();
      }
    );
  };

  applyTheme = () => {
    if (this.state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  render() {
    const { user, isDarkMode, notification } = this.state;
    
    return (
      <Router>
        <Suspense fallback={<div className="min-h-screen bg-day flex items-center justify-center title text-4xl">CARGANDO SORZAL...</div>}>
          <div className={`min-h-screen ${isDarkMode ? 'dark bg-night' : 'bg-day'} text-primary-dark dark:text-white transition-colors duration-500`}>
            
            {/* Custom Notification Overlay */}
            {notification && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-500">
                <div className={`px-8 py-4 rounded-2xl title text-lg shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
                  notification.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-500' :
                  notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-500' :
                  'bg-primary-light/20 border-primary-light/50 text-primary-light'
                }`}>
                  <div className="w-2 h-2 rounded-full animate-pulse bg-current"></div>
                  {notification.message}
                </div>
              </div>
            )}

            <NavbarTranslated 
              isDarkMode={isDarkMode} 
              toggleMode={this.toggleMode} 
              user={user}
              logout={this.logout}
            />
            
            <Routes>
              <Route 
                path="/" 
                element={user ? <Home user={user} updateUser={this.updateUser} /> : <UserPage login={this.login} />} 
              />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/marketplace" element={<MarketplacePage user={user} showNotification={this.showNotification} />} />
              <Route path="/user" element={<UserPage login={this.login} />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/profile" element={<GestorUser user={user} logout={this.logout} />} />
              <Route path="/profile/:id" element={<UserProfilePage currentUser={user} updateUser={this.updateUser} showNotification={this.showNotification} />} />
              <Route path="/photography" element={<PhotographyPage user={user} showNotification={this.showNotification} />} />
              <Route path="/forum" element={<ForumPage user={user} showNotification={this.showNotification} />} />
              <Route path="/reels" element={<ReelsPage user={user} showNotification={this.showNotification} />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:id" element={<GamePlayPage user={user} showNotification={this.showNotification} />} />
              <Route path="/dev" element={<DevRepoPage user={user} showNotification={this.showNotification} />} />
              <Route path="/podcasts" element={<PodcastingPage user={user} showNotification={this.showNotification} />} />
              <Route path="/courses" element={<CoursesPage showNotification={this.showNotification} />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/messages" element={<MessagesPage user={user} />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Footer />
            <CreatorMode />
          </div>
        </Suspense>
      </Router>
    );
  }
}

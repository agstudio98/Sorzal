import { Component } from 'react';
import { MarketplaceFilter } from './marketplace/Filter';
import { MarketplaceMain } from './marketplace/Main';
import { withRouter } from '../utils/withRouter';
import { MarketplaceCreator } from '../components/MarketplaceCreator';

interface MarketplaceProps {
  user: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  router?: any;
}

class MarketplacePageBase extends Component<MarketplaceProps> {
  state = {
    activeCategory: 'Todos',
    showUploadModal: false,
    loadKey: 0
  };

  componentDidMount() {
    if (this.props.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  componentDidUpdate(prevProps: MarketplaceProps) {
    if (this.props.router?.location?.state?.create && !prevProps.router?.location?.state?.create) {
      this.setState({ showUploadModal: true });
      this.props.router.navigate(this.props.router.location.pathname, { replace: true, state: {} });
    }
  }

  setCategory = (cat: string) => {
    this.setState({ activeCategory: cat });
  };

  handleUploadSuccess = () => {
    this.setState({ 
      showUploadModal: false,
      loadKey: this.state.loadKey + 1 // Force refresh of MarketplaceMain
    });
  };

  render() {
    const { user, showNotification } = this.props;
    const { activeCategory, showUploadModal, loadKey } = this.state;

    return (
      <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <h1 className="title text-6xl text-primary-dark dark:text-white mb-10 text-center uppercase tracking-widest">
           Marketplace Sorzal
        </h1>
        <MarketplaceFilter activeCategory={activeCategory} setCategory={this.setCategory} />
        <MarketplaceMain 
          key={loadKey}
          user={user} 
          showNotification={showNotification} 
          activeCategory={activeCategory} 
        />

        {showUploadModal && (
          <MarketplaceCreator 
            user={user}
            onClose={() => this.setState({ showUploadModal: false })}
            onSuccess={this.handleUploadSuccess}
            showNotification={showNotification}
            t={(k, d) => d || k}
          />
        )}
      </main>
    );
  }
}

export const MarketplacePage = withRouter(MarketplacePageBase);

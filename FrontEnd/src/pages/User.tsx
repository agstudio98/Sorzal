import { Component } from 'react';
import { UserFormTranslated } from './user/Form';

export class UserPage extends Component<{ login: (user: any) => void }> {
  render() {
    return (
      <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-32 pb-20 relative flex items-center justify-center">
        {/* Animated Particles/Background Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-light/10 blur-3xl animate-pulse rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-light/10 blur-3xl animate-bounce rounded-full delay-1000"></div>

        <UserFormTranslated login={this.props.login} />
      </main>
    );
  }
}

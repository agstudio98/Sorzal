import { Component } from 'react';
import { CatalogFilter } from './catalog/Filter';
import { CatalogMain } from './catalog/Main';

export class CatalogPage extends Component {
  render() {
    return (
      <main className="min-h-screen bg-day dark:bg-night transition-colors duration-500 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <h1 className="title text-6xl text-primary-dark dark:text-white mb-10 text-center uppercase tracking-widest">
           Catálogo Completo
        </h1>
        <CatalogFilter />
        <CatalogMain />
      </main>
    );
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Basename seulement en production (sur togeather.fr)
const basename = window.location.hostname === 'togeather.fr' ? '/backoffice' : '';

console.log('Hostname:', window.location.hostname);
console.log('Basename:', basename);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

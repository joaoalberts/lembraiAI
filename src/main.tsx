import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito-sans/full.css';
import '@fontsource-variable/source-serif-4/opsz.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

// ?ref => frame de 851 px (1 du = 1 px), usado só para comparar pixel a pixel com ./ref/
if (new URLSearchParams(location.search).has('ref')) document.documentElement.dataset.ref = '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// One family: weight and width axes. The narrow, heavy cut is used for price labels.
import '@fontsource-variable/archivo/wdth.css';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

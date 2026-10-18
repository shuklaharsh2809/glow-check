import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './app/App';
import './styles/globals.css';

// Vercel Web Analytics is cookieless and receives only page URLs, never photos, names, ages, or results.
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /><Analytics /></React.StrictMode>);

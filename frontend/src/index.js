import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // why use strict mode? causing double renders (intentionally) which is annoying
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);


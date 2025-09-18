<<<<<<< HEAD
=======
// React entry point; mounts App into #root with StrictMode and global styles.
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import React from 'react';
import RoutesApp from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './index.css'; // Se você tiver um CSS global

function App() {
  return (
    <>
      <RoutesApp />
      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;
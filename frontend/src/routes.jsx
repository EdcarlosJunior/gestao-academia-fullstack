import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import CadastroAluno from './pages/CadastroAluno'; // Nome que você deu à pasta
import CadastroFuncionario from './pages/CadastroFuncionario';

export default function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<CadastroAluno />} />
        <Route path="/registrar" element={<CadastroFuncionario />} />
      </Routes>
    </BrowserRouter>
  );
}
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

import './styles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', { email, senha });

      localStorage.setItem('@RCGym:token', response.data.token);
      localStorage.setItem('@RCGym:user', JSON.stringify(response.data.funcionario));

      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;

      toast.success(`Olá, ${response.data.funcionario.nome}!`);
      navigate('/cadastro');
    } catch (err) {
      const mensagemErro = err.response?.data?.error || 'Erro ao realizar login.';
      toast.error(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <section className="form-box">
        <form onSubmit={handleLogin}>
          <h1>RC-Gym Management</h1>
          <p>Insira suas credenciais para acessar</p>

          <input
            type="email"
            placeholder="E-mail profissional"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              /* Adicionamos bg-white e border-gray-200 para garantir a cor clara */
              className="input-field pr-12 bg-white border border-gray-200 text-gray-800"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="register-link-container">
          <span>Novo por aqui?</span>
          <Link to="/registrar" className="register-link">
            Crie sua conta de acesso
          </Link>
        </div>
      </section>
    </div>
  );
}
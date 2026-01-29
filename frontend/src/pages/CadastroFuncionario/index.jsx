import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

import './styles.css';

export default function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('Instrutor'); // Valor padrão
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/funcionarios', {
        nome,
        email,
        senha,
        cargo
      });

      toast.success('Funcionário cadastrado com sucesso!');
      navigate('/'); // Após cadastrar, volta para o login para testar
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao cadastrar funcionário.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="content">
        <section>
          <h1>Cadastro de Equipe</h1>
          <p>Cadastre os colaboradores que terão acesso ao sistema RC-Gym.</p>
          
          <Link className="back-link" to="/">
            Voltar para o login
          </Link>
        </section>

        <form onSubmit={handleRegister}>
          <input 
            placeholder="Nome do Funcionário"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Senha de acesso"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />

          <div className="select-group">
            <label>Cargo / Nível de Acesso:</label>
            <select value={cargo} onChange={e => setCargo(e.target.value)}>
              <option value="Instrutor">Instrutor (Acesso Limitado)</option>
              <option value="Gerente">Gerente (Acesso Total)</option>
            </select>
          </div>

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}
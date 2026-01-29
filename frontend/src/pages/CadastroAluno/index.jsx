import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { addMonths, format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// --- FUNÇÕES DE AUXÍLIO ---
const formatarCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- SUB-COMPONENTES DE UI ---
const DashboardCards = ({ financeiro, loading }) => {
  if (loading) return <div className="text-gray-500 mb-8 font-bold animate-pulse">Carregando indicadores...</div>;
  const dados = financeiro || { totalAlunos: 0, recebido: 0, pendente: 0 };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-8">
      <Card title="Total Membros" value={dados.totalAlunos} color="border-blue-500" />
      <Card title="Receita em Dia" value={formatarMoeda(dados.recebido)} color="border-green-500" textColor="text-green-600" />
      <Card title="Inadimplência" value={formatarMoeda(dados.pendente)} color="border-red-500" textColor="text-red-600" />
    </div>
  );
};

const Card = ({ title, value, color, textColor = "text-gray-800" }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border-b-4 ${color} transition-transform hover:scale-105`}>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
    <h3 className={`text-3xl font-black ${textColor}`}>{value}</h3>
  </div>
);

// --- COMPONENTE DO FORMULÁRIO ---
const FormularioCadastro = ({ planos, aoCadastrar, alunoParaEdicao, aoCancelarEdicao }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [planoId, setPlanoId] = useState('');
  const [foto, setFoto] = useState(null);
  const [dataVencimento, setDataVencimento] = useState('');

  const calcularVencimentoSugerido = (idPlano) => {
    if (!planos || planos.length === 0) return;
    const planoSelecionado = planos.find(p => p.id === Number(idPlano));
    if (!planoSelecionado) return;

    let mesesParaAdicionar = 1;
    const nomePlano = planoSelecionado.nome.toLowerCase();
    if (nomePlano.includes('tri')) mesesParaAdicionar = 3;
    else if (nomePlano.includes('sem')) mesesParaAdicionar = 6;
    else if (nomePlano.includes('ano') || nomePlano.includes('anual')) mesesParaAdicionar = 12;

    const dataSugerida = new Date();
    dataSugerida.setMonth(dataSugerida.getMonth() + mesesParaAdicionar);
    setDataVencimento(dataSugerida.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (alunoParaEdicao) {
      setNome(alunoParaEdicao.nome);
      setEmail(alunoParaEdicao.email || '');
      setCpf(alunoParaEdicao.cpf);
      setPlanoId(alunoParaEdicao.plano_id);
      if (alunoParaEdicao.data_vencimento) {
        setDataVencimento(alunoParaEdicao.data_vencimento.split('T')[0]);
      }
    } else {
      setNome(''); setEmail(''); setCpf(''); setFoto(null);
      
      // CORREÇÃO AQUI: Criamos a variável id antes de usá-la
      if (planos && planos.length > 0) {
        const primeiroId = planos[0].id; // Criamos a constante
        setPlanoId(primeiroId);
        calcularVencimentoSugerido(primeiroId); // Agora passamos ela sem erro
      }
    }
  }, [alunoParaEdicao, planos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nome', nome);
    data.append('email', email);
    data.append('cpf', cpf);
    data.append('plano_id', planoId);
    data.append('data_vencimento', dataVencimento);
    if (foto) data.append('foto', foto);

    const sucesso = await aoCadastrar(data, alunoParaEdicao?.id);
    if (sucesso && !alunoParaEdicao) {
      setNome(''); setEmail(''); setCpf(''); setFoto(null);
    }
  };

  return (
    <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
          {alunoParaEdicao ? `Editando: ${alunoParaEdicao.nome}` : 'Nova Matrícula'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        <Input required label="Nome Completo" value={nome} onChange={setNome} placeholder="Ex: João Silva" />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">E-mail (*)</label>
          <input required type="email" className="input-field bg-white" value={email} onChange={e => setEmail(e.target.value)} placeholder="aluno@email.com" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">CPF(*)</label>
          <input required className="input-field bg-white" value={cpf} onChange={e => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">Plano de Treino</label>
          <select
            className="input-field cursor-pointer font-semibold text-gray-700 bg-white"
            value={planoId}
            onChange={(e) => {
              setPlanoId(e.target.value);
              calcularVencimentoSugerido(e.target.value);
            }}
          >
            <option value="">Selecione um plano</option>
            {planos.length > 0 ? (
              planos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {formatarMoeda(p.preco)}
                </option>
              ))
            ) : (
              <option disabled>Nenhum plano encontrado no servidor</option>
            )}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">Vencimento Calculado</label>
          <input required type="date" className="input-field border-blue-200 bg-white" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">Foto do Perfil</label>
          <input id="foto-input" type="file" className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 font-bold" onChange={e => setFoto(e.target.files[0])} />
        </div>
        <div className="flex gap-2 lg:col-span-3 justify-end mt-4">
          {alunoParaEdicao && (
            <button type="button" onClick={aoCancelarEdicao} className="bg-gray-100 hover:bg-gray-200 px-8 py-3 rounded-2xl font-bold text-gray-500 transition-colors">
              Cancelar
            </button>
          )}
          <button type="submit" className={`px-12 font-bold py-3 rounded-2xl text-white shadow-lg transition-transform active:scale-95 ${alunoParaEdicao ? 'bg-orange-500' : 'bg-blue-600'}`}>
            {alunoParaEdicao ? 'Atualizar Dados' : 'Finalizar Matrícula'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">{label}</label>
    <input required type={type} className="input-field bg-white" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

function App() {
  const [planos, setPlanos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);
  const [financeiro, setFinanceiro] = useState({ totalAlunos: 0, recebido: 0, pendente: 0 });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('@RCGym:user'));

  useEffect(() => {
    const token = localStorage.getItem('@RCGym:token');
    const userData = localStorage.getItem('@RCGym:user');

    if (!token || !userData) {
      navigate('/');
      return;
    }
    api.defaults.headers.Authorization = `Bearer ${token}`;
    fetchData();
  }, [navigate]);

  async function fetchData() {
    try {
      setLoading(true);
      const [resPlanos, resAlunos, resDash] = await Promise.all([
        api.get('/planos'),
        api.get('/alunos'),
        api.get('/dashboard')
      ]);

      console.log("Planos recebidos:", resPlanos.data);

      setPlanos(resPlanos.data);
      setAlunos(resAlunos.data);
      setFinanceiro(resDash.data);
    } catch (err) {
      console.error("Erro na busca de dados:", err);
      toast.error("Erro ao carregar planos do servidor.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('@RCGym:token');
    localStorage.removeItem('@RCGym:user');
    api.defaults.headers.Authorization = undefined;
    navigate('/');
  };

  const handleCadastrarOuAtualizar = async (formData, id = null) => {
    try {
      if (id) {
        await api.put(`/alunos/${id}`, formData);
        toast.success("Aluno atualizado com sucesso!");
      } else {
        await api.post('/alunos', formData);
        toast.success("Matrícula realizada com sucesso!");
      }
      await fetchData();
      setAlunoEmEdicao(null);
      return true;
    } catch (err) {
      const msgErro = err.response?.data?.error || "Erro na operação.";
      toast.error(msgErro);
      return false;
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm("Deseja realmente excluir este registro?")) {
      try {
        await api.delete(`/alunos/${id}`);
        toast.success("Registro removido.");
        fetchData();
      } catch (err) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  const handleRenovar = async (id) => {
    try {
      await api.post(`/alunos/${id}/renovar`);
      toast.success("Matrícula renovada!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao renovar.");
    }
  };

  const alunosFiltrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf.includes(busca)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          SAIR
        </button>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">RC<span className="text-blue-600 italic">gym</span></h1>
        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em]">SISTEMA DE GESTÃO V1.1</p>
      </header>

      <DashboardCards financeiro={financeiro} loading={loading} />

      {user?.cargo === 'Gerente' ? (
        <FormularioCadastro
          planos={planos}
          aoCadastrar={handleCadastrarOuAtualizar}
          alunoParaEdicao={alunoEmEdicao}
          aoCancelarEdicao={() => setAlunoEmEdicao(null)}
        />
      ) : (
        <div className="max-w-5xl w-full bg-blue-50 border border-blue-200 p-6 rounded-3xl mb-8 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-blue-700 text-sm font-bold">Olá, {user?.nome}!</p>
            <p className="text-blue-600 text-xs">Apenas gerentes podem realizar novas matrículas.</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="font-black text-gray-700 uppercase text-sm tracking-wider">Membros Ativos</h2>
          <div className="relative w-full md:w-64">
            <input
              className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunosFiltrados.map(aluno => (
                <tr key={aluno.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img
                      src={aluno.foto ? `http://localhost:3333/files/${aluno.foto}` : `https://ui-avatars.com/api/?name=${aluno.nome}&background=EBF4FF&color=3B82F6&bold=true`}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                      alt="Perfil"
                    />
                    <div>
                      <p className="font-bold text-gray-700 text-sm">{aluno.nome}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase">{aluno.plano_nome || 'Sem Plano'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500 font-mono">{aluno.cpf}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">
                      Vence: {aluno.data_vencimento ? new Date(aluno.data_vencimento.replace(/-/g, '\/')).toLocaleDateString('pt-BR') : '--'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${aluno.situacao === 'Em dia' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                      {aluno.situacao}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <button onClick={() => setAlunoEmEdicao(aluno)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                      <EditIcon />
                    </button>
                    <ActionButton onClick={() => handleRenovar(aluno.id)} color="text-gray-400 hover:text-green-500 hover:bg-green-50" icon="refresh" title="Renovar" />
                    <ActionButton onClick={() => handleDeletar(aluno.id)} color="text-gray-400 hover:text-red-500 hover:bg-red-50" icon="trash" title="Excluir" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .input-field { width: 100%; padding: 10px 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; font-size: 14px; transition: all 0.2s; }
        .input-field:focus { border-color: #3b82f6; background-color: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
      `}} />
    </div>
  );
}

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ActionButton = ({ onClick, color, icon, title }) => (
  <button onClick={onClick} title={title} className={`p-2 rounded-xl transition-all ${color}`}>
    {icon === 'refresh' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    )}
  </button>
);

export default App;
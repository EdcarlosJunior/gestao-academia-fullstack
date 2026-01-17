import React, { useEffect, useState } from 'react';
import api from './services/api';

// --- IMPORTAÇÃO DO TOASTIFY ---
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const FormularioCadastro = ({ planos, aoCadastrar, alunoParaEdicao, aoCancelarEdicao }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [planoId, setPlanoId] = useState('');
  const [foto, setFoto] = useState(null);
  const [dataVencimento, setDataVencimento] = useState('');

  // Lógica de cálculo automático de data baseada no nome do plano
  const calcularVencimentoSugerido = (idPlano) => {
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
      if (planos.length > 0) {
        const idInicial = planos[0].id;
        setPlanoId(idInicial);
        calcularVencimentoSugerido(idInicial);
      }
    }
  }, [alunoParaEdicao, planos]);

  const handlePlanoChange = (e) => {
    const id = e.target.value;
    setPlanoId(id);
    if (!alunoParaEdicao) {
      calcularVencimentoSugerido(id);
      toast.info("Data ajustada conforme o plano!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dataVencimento) {
      toast.warning("Selecione uma data de vencimento!");
      return;
    }

    const data = new FormData();
    data.append('nome', nome);
    data.append('email', email);
    data.append('cpf', cpf);
    data.append('plano_id', planoId);
    data.append('data_vencimento', dataVencimento);
    if (foto) data.append('foto', foto);

    const sucesso = await aoCadastrar(data, alunoParaEdicao?.id);

    if (sucesso) {
      if (!alunoParaEdicao) {
        setNome(''); setEmail(''); setCpf(''); setFoto(null);
        if (planos.length > 0) {
           setPlanoId(planos[0].id);
           calcularVencimentoSugerido(planos[0].id);
        }
        if (document.getElementById('foto-input')) document.getElementById('foto-input').value = '';
      } else {
        aoCancelarEdicao();
      }
    }
  };

  return (
    <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
        {alunoParaEdicao ? `Editando: ${alunoParaEdicao.nome}` : 'Nova Matrícula'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        <Input required label="Nome Completo" value={nome} onChange={setNome} placeholder="Ex: João Silva" />
        
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">E-mail (*)</label>
          <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="aluno@email.com" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">CPF(*)</label>
          <input required className="input-field" value={cpf} onChange={e => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">Plano de Treino</label>
          <select className="input-field cursor-pointer font-semibold text-gray-700 bg-blue-50/50" value={planoId} onChange={handlePlanoChange}>
            {planos.map(p => (
              <option key={p.id} value={p.id}>{p.nome} — {formatarMoeda(p.preco)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-gray-400 uppercase ml-1">Vencimento Calculado</label>
          <input required type="date" className="input-field border-blue-200" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
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
    <input required type={type} className="input-field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

// --- COMPONENTE PRINCIPAL ---

function App() {
  const [planos, setPlanos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);
  const [financeiro, setFinanceiro] = useState({ totalAlunos: 0, recebido: 0, pendente: 0 });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [resPlanos, resAlunos, resDash] = await Promise.all([
        api.get('/planos'), api.get('/alunos'), api.get('/dashboard')
      ]);
      setPlanos(resPlanos.data);
      setAlunos(resAlunos.data);
      setFinanceiro(resDash.data);
    } catch (err) { 
      toast.error("Erro ao carregar dados do servidor.");
    } finally { 
      setLoading(false); 
    }
  }

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
      toast.error(msgErro.includes('UNIQUE') ? "Este e-mail ou CPF já está cadastrado!" : msgErro);
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
      toast.success("Matrícula renovada! 🚀");
      fetchData();
    } catch (err) {
      toast.error("Erro ao renovar matrícula.");
    }
  };

  const alunosFiltrados = alunos.filter(a => 
    a.nome.toLowerCase().includes(busca.toLowerCase()) || 
    a.cpf.includes(busca)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      {/* Container do Toastify necessário para as mensagens aparecerem */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">RC<span className="text-blue-600 italic">gym</span></h1>
        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em]">SISTEMA DE GESTÃO V1.0</p>
      </header>

      <DashboardCards financeiro={financeiro} loading={loading} />

      <FormularioCadastro
        planos={planos}
        aoCadastrar={handleCadastrarOuAtualizar}
        alunoParaEdicao={alunoEmEdicao}
        aoCancelarEdicao={() => setAlunoEmEdicao(null)}
      />

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
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${aluno.situacao === 'Em dia'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
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
          {alunosFiltrados.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-medium">Nenhum membro encontrado.</div>
          )}
        </div>
      </div>
      <Styles />
    </div>
  );
}

// --- ÍCONES E ESTILOS ---

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ActionButton = ({ onClick, color, icon, title }) => (
  <button onClick={onClick} title={title} className={`p-2 rounded-xl transition-all ${color}`}>
    {icon === 'refresh' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    )}
  </button>
);

const Styles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    .input-field { width: 100%; padding: 10px 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; font-size: 14px; transition: all 0.2s; }
    .input-field:focus { border-color: #3b82f6; background-color: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
  `}} />
);

export default App;
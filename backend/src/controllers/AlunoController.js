const db = require('../database/connection');
const { addMonths, format } = require('date-fns');

module.exports = {
  // 1. Listar alunos com dados do plano, foto e busca inteligente
  async index(req, res) {
    try {
      const { busca, situacao } = req.query;
      const hoje = format(new Date(), 'yyyy-MM-dd');

      const query = db('alunos')
        .leftJoin('planos', function () {
          this.on(db.raw('CAST(planos.id AS INTEGER)'), '=', db.raw('CAST(alunos.plano_id AS INTEGER)'))
        })
        .select([
          'alunos.id',
          'alunos.nome',
          'alunos.email',
          'alunos.cpf',
          'alunos.plano_id',
          'alunos.data_vencimento',
          'alunos.status',
          'alunos.foto',
          'planos.nome as plano_nome',
          'planos.preco as plano_valor'
        ]);

      if (busca) {
        query.where(function () {
          this.where('alunos.nome', 'like', `%${busca}%`)
            .orWhere('alunos.cpf', 'like', `%${busca}%`);
        });
      }

      const alunos = await query;

      const alunosComSituacao = alunos.map(aluno => {
        // Lógica de comparação de strings YYYY-MM-DD (Seguro e rápido)
        const statusCalculado = aluno.data_vencimento < hoje ? 'Vencido' : 'Em dia';
        return {
          ...aluno,
          plano_nome: aluno.plano_nome || (aluno.plano_id ? `Erro Ref. ID:${aluno.plano_id}` : 'Sem Plano'),
          situacao: statusCalculado
        };
      });

      if (situacao) {
        const filtrados = alunosComSituacao.filter(
          a => a.situacao.toLowerCase() === situacao.toLowerCase()
        );
        return res.json(filtrados);
      }

      return res.json(alunosComSituacao);
    } catch (error) {
      console.error("ERRO NO INDEX:", error);
      return res.status(500).json({ error: 'Erro ao listar alunos.' });
    }
  },

  // 2. Relatório de devedores
  async getInadimplentes(req, res) {
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const inadimplentes = await db('alunos')
        .join('planos', 'planos.id', '=', 'alunos.plano_id')
        .where('alunos.data_vencimento', '<', hoje)
        .andWhere('alunos.status', 'Ativo')
        .select([
          'alunos.id',
          'alunos.nome',
          'alunos.data_vencimento',
          'planos.nome as plano',
          'planos.preco as valor_plano'
        ]);

      const totalPrejuizo = inadimplentes.reduce((acc, aluno) => acc + aluno.valor_plano, 0);
      return res.json({
        total_devedores: inadimplentes.length,
        prejuizo_estimado: totalPrejuizo,
        detalhes: inadimplentes
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar relatório.' });
    }
  },

  // 3. Cadastro de Aluno - CORRIGIDO PARA ACEITAR DATA MANUAL
  async create(req, res) {
    try {
      const { nome, email, cpf, plano_id, data_vencimento } = req.body; // <-- Adicionado data_vencimento
      const foto = req.file ? req.file.filename : null;

      const cpfExistente = await db('alunos').where({ cpf }).first();
      if (cpfExistente) {
        return res.status(400).json({ error: 'CPF já cadastrado.' });
      }

      const idDoPlano = plano_id || 1;
      const plano = await db('planos').where('id', idDoPlano).first();

      // PRIORIDADE: Se o usuário enviou data no formulário, usa ela. 
      // Se não, calcula o padrão do plano.
      const vencimentoFinal = data_vencimento || format(
        addMonths(new Date(), plano ? plano.duracao_meses : 1),
        'yyyy-MM-dd'
      );

      await db('alunos').insert({
        nome,
        email: email || '',
        cpf,
        plano_id: idDoPlano,
        foto,
        data_vencimento: vencimentoFinal, // <-- Usa o valor prioritário
        status: 'Ativo'
      });

      return res.status(201).json({ message: 'Aluno matriculado!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao matricular aluno.' });
    }
  },

  // 4. Atualização de dados - CORRIGIDO PARA ACEITAR DATA MANUAL
  async update(req, res) {
    const { id } = req.params;
    const { nome, email, cpf, plano_id, data_vencimento } = req.body; // <-- Adicionado data_vencimento

    try {
      const aluno = await db('alunos').where({ id }).first();
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

      // PRIORIDADE: Se veio data nova do formulário, usa ela.
      // SENÃO, se mudou o plano, recalcula. SENÃO, mantém a antiga.
      let nova_data_vencimento = data_vencimento || aluno.data_vencimento;

      if (!data_vencimento && plano_id !== undefined && Number(plano_id) !== aluno.plano_id) {
        const novoPlano = await db('planos').where('id', Number(plano_id)).first();
        if (novoPlano) {
          nova_data_vencimento = format(addMonths(new Date(), novoPlano.duracao_meses), 'yyyy-MM-dd');
        }
      }

      await db('alunos')
        .where({ id })
        .update({
          nome,
          email,
          cpf,
          plano_id: Number(plano_id),
          data_vencimento: nova_data_vencimento,
          foto: req.file ? req.file.filename : aluno.foto
        });

      return res.json({ message: 'Aluno atualizado com sucesso!' });
    } catch (error) {
      console.error("ERRO NO UPDATE:", error);
      return res.status(500).json({ error: 'Erro interno ao atualizar aluno.' });
    }
  },

  // 5. Exclusão de matrícula
  async delete(req, res) {
    const { id } = req.params;
    try {
      await db('alunos').where({ id }).delete();
      return res.json({ message: 'Removido com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover aluno.' });
    }
  },

  // 6. Dashboard consolidado
  async dashboard(_req, res) {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const [total] = await db('alunos').count('id as total');

      const [faturamentoAtivo] = await db('alunos')
        .join('planos', db.raw('CAST(planos.id AS INTEGER)'), '=', db.raw('CAST(alunos.plano_id AS INTEGER)'))
        .where('alunos.data_vencimento', '>=', hoje)
        .sum('planos.preco as total');

      const [faturamentoPendente] = await db('alunos')
        .join('planos', db.raw('CAST(planos.id AS INTEGER)'), '=', db.raw('CAST(alunos.plano_id AS INTEGER)'))
        .where('alunos.data_vencimento', '<', hoje)
        .sum('planos.preco as total');

      const valorAtivo = faturamentoAtivo.total || faturamentoAtivo['sum("planos"."preco")'] || 0;
      const valorPendente = faturamentoPendente.total || faturamentoPendente['sum("planos"."preco")'] || 0;

      return res.json({
        totalAlunos: total.total || 0,
        recebido: valorAtivo,
        pendente: valorPendente,
      });
    } catch (error) {
      console.error("Erro no Dashboard:", error);
      return res.status(500).json({ error: 'Erro ao processar dashboard' });
    }
  },

  // 7. Renovação de Matrícula
  async renew(req, res) {
    const { id } = req.params;
    try {
      const aluno = await db('alunos')
        .join('planos', 'planos.id', '=', 'alunos.plano_id')
        .select('alunos.*', 'planos.duracao_meses')
        .where('alunos.id', id)
        .first();

      const dataBase = new Date(aluno.data_vencimento) > new Date() ? new Date(aluno.data_vencimento) : new Date();
      const dataFormatada = format(addMonths(dataBase, aluno.duracao_meses), 'yyyy-MM-dd');

      await db('alunos').where({ id }).update({
        data_vencimento: dataFormatada,
        status: 'Ativo'
      });

      return res.json({ message: 'Renovada!', novo_vencimento: dataFormatada });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao renovar.' });
    }
  },
};
const db = require('../database/connection');

module.exports = {
async index(req, res) {
  try {
    const planos = await db('planos').select('*');
    return res.json(planos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar planos' });
  }
},

  async create(req, res) {
    const { nome, preco, duracao_meses } = req.body;
    try {
      await db('planos').insert({ nome, preco, duracao_meses });
      return res.status(201).json({ message: 'Plano criado!' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar plano' });
    }

    
  },

  // ... dentro do module.exports
async update(req, res) {
  const { id } = req.params;
  const { nome, preco, duracao_meses } = req.body;

  try {
    await db('planos').where({ id }).update({ nome, preco, duracao_meses });
    return res.json({ message: 'Plano atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
},

async delete(req, res) {
  const { id } = req.params;

  try {
    // Verificação de segurança: existe aluno nesse plano?
    const alunoNoPlano = await db('alunos').where('plano_id', id).first();
    if (alunoNoPlano) {
      return res.status(400).json({ error: 'Não é possível excluir um plano que possui alunos matriculados.' });
    }

    await db('planos').where({ id }).delete();
    return res.json({ message: 'Plano excluído!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir plano.' });
  }
}
};
const db = require('../database/connection');

module.exports = {
  async faturamento(req, res) {
    try {
      // Somamos o preço de todos os planos vinculados a alunos ATIVOS
      const resultado = await db('alunos')
        .join('planos', 'alunos.plano_id', '=', 'planos.id')
        .where('alunos.status', 'Ativo')
        .sum('planos.preco as total')
        .first();

      // Contamos também o total de alunos para o card do dashboard
      const totalAlunos = await db('alunos').where('status', 'Ativo').count('id as qtd').first();

      return res.json({
        faturamento_estimado: parseFloat(resultado.total) || 0,
        total_alunos_ativos: parseInt(totalAlunos.qtd)
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao calcular faturamento.' });
    }
  }
};
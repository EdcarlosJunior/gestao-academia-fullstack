const db = require('../database/connection');
const { Parser } = require('json2csv');

class RelatorioController {
  
  async exportarInadimplentes(req, res) {
    try {
      // Pegamos a data de hoje para comparar
      const hoje = new Date().toISOString().split('T')[0];

      // 1. Buscamos no banco apenas quem está com vencimento menor que hoje
      const inadimplentes = await db('alunos')
        .where('data_vencimento', '<', hoje)
        .andWhere('status', 'Ativo')
        .select('nome', 'email', 'cpf', 'data_vencimento');

      // Se não houver ninguém, avisamos
      if (inadimplentes.length === 0) {
        return res.status(404).json({ message: "Nenhum inadimplente encontrado." });
      }

      // 2. Configuramos o que será cada coluna no Excel
      const campos = [
        { label: 'Nome Completo', value: 'nome' },
        { label: 'E-mail de Contato', value: 'email' },
        { label: 'CPF', value: 'cpf' },
        { label: 'Data de Vencimento', value: 'data_vencimento' }
      ];

      // 3. Criamos o conversor com o delimitador ';' (padrão Excel Brasil)
      const json2csvParser = new Parser({ fields: campos, delimiter: ';' });
      const csv = json2csvParser.parse(inadimplentes);

      // 4. Cabeçalhos "mágicos" que forçam o navegador a baixar o arquivo
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_devedores.csv');

      // 5. Enviamos o conteúdo do CSV
      return res.status(200).send(csv);

    } catch (error) {
      console.error("Erro ao exportar:", error);
      return res.status(500).json({ error: "Erro interno ao gerar planilha." });
    }
  }
}

module.exports = new RelatorioController();
const db = require('../database/connection');

module.exports = {
  async update(req, res) {
    const { id } = req.params;

    // Se o multer falhar ou o arquivo não for enviado, o req.file será undefined
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado.' });
    }

    const foto = req.file.filename; 

    try {
      // Verifica se o aluno existe antes de tentar atualizar
      const aluno = await db('alunos').where({ id }).first();
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }

      await db('alunos').where({ id }).update({ foto });

      return res.json({ 
        message: 'Foto atualizada com sucesso!',
        arquivo: foto 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar foto no banco de dados.' });
    }
  }
};
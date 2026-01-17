const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 1. Importar o JWT

module.exports = {
  async create(req, res) {
    const { email, senha } = req.body;

    try {
      const funcionario = await db('funcionarios').where('email', email).first();

      if (!funcionario) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const senhaCorreta = await bcrypt.compare(senha, funcionario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const { id, nome, cargo } = funcionario;

      // 2. Gerar o Token (o crachá)
      // O primeiro parâmetro é o que queremos guardar (id), o segundo é uma chave secreta
      const token = jwt.sign({ id, cargo }, 'CHAVE_SECRETA_RCGYM', {
        expiresIn: '1d', // O token vale por 1 dia
      });

      return res.json({
        funcionario: { id, nome, email, cargo },
        token // Envia o token para o cliente guardar
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
};
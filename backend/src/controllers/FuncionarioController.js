const db = require('../database/connection');
const bcrypt = require('bcryptjs'); // Importa a biblioteca

module.exports = {
  async index(req, res) {
    // IMPORTANTE: Nunca retornamos o campo 'senha' no GET por segurança
    const funcionarios = await db('funcionarios').select('id', 'nome', 'email', 'cargo');
    return res.json(funcionarios);
  },

  async create(req, res) {
    const { nome, email, cargo, senha } = req.body;

    try {
      // Gera o hash da senha com um "salt" de 10 (nível de segurança padrão)
      const senhaCriptografada = await bcrypt.hash(senha, 10);

      await db('funcionarios').insert({ 
        nome, 
        email, 
        cargo, 
        senha: senhaCriptografada // Salva a senha protegida
      });

      return res.status(201).json({ message: 'Funcionário cadastrado com segurança!' });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Erro ao cadastrar funcionário.' });
    }
  }
};
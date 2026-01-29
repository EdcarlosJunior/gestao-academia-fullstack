const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => { // Removi o async que não é necessário aqui
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');

  // Verificação extra de segurança para o formato Bearer
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  try {
    // IMPORTANTE: Aqui deve ser a mesma chave usada no seu arquivo de Login/Session
    // Se você usa .env no login, use process.env.APP_SECRET (ou o nome que definiu) aqui também
    const secret = process.env.APP_SECRET || 'CHAVE_SECRETA_RCGYM';
    
    const decoded = jwt.verify(token, secret);

    // Salva o ID para uso nas rotas
    req.funcionarioId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
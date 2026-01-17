const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // LOG TEMPORÁRIO: diagnosticar por que /planos está retornando 401
  console.log(`[auth] ${req.method} ${req.path} - authorization header: ${authHeader ? '[present]' : '[missing]'}`);

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O formato costuma ser "Bearer TOKEN", vamos dividir para pegar só o token
  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, 'CHAVE_SECRETA_RCGYM');
    
    // Salva o ID do funcionário dentro da requisição para uso futuro
    req.usuario = { id: decoded.id, cargo: decoded.cargo };


    return next(); // Se estiver tudo certo, deixa passar para a rota
  } catch (err) {
    console.log('[auth] token inválido:', err.message);
    return res.status(401).json({ error: 'Token inválido.' });
  }
};
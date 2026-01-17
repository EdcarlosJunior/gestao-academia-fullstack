// src/middlewares/roleMiddleware.js

module.exports = (cargoPermitido) => {
  return (req, res, next) => {
    // Verificamos se o cargo que veio do token (via authMiddleware) 
    // é igual ao cargo que a rota exige
    if (!req.usuario || req.usuario.cargo !== cargoPermitido) {
      return res.status(403).json({ 
        error: `Acesso negado. Apenas usuários com cargo de ${cargoPermitido} podem realizar esta ação.` 
      });
    }

    return next();
  };
};
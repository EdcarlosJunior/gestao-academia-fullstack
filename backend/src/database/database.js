const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./rcgym.sqlite"
  },
  useNullAsDefault: true
});

async function setupDatabase() {
  try {
    // Verificação de tabelas... (seu código de IFs aqui)
    
    
    console.log("🚀 Tabelas verificadas.");
  } catch (error) {
    console.error("Erro no setup:", error);
  }
}

// Chame a função
setupDatabase();

// EXPORTE O KNEX SEM FECHAR
module.exports = knex;
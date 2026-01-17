const knex = require('knex');
const path = require('path');

// 1. Criamos a conexão real
const connection = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'), 
  },
  useNullAsDefault: true,
});

// 2. A função setup deve usar a variável 'connection' (que é a instância ativa)
async function setup() {
  const hasPlanos = await connection.schema.hasTable('planos');
  if (!hasPlanos) {
    await connection.schema.createTable('planos', table => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.decimal('preco').notNullable();
      table.integer('duracao_meses');
    });
    console.log("✅ Tabela 'planos' criada!");
  }

  const hasAlunos = await connection.schema.hasTable('alunos');
  if (!hasAlunos) {
    await connection.schema.createTable('alunos', table => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('email').unique();
      table.string('cpf').unique();
      table.string('status').notNullable().defaultTo('Ativo');
      table.integer('plano_id').references('id').inTable('planos');
      table.timestamp('criado_em').defaultTo(connection.fn.now());
      table.string('foto');
    });
    console.log("✅ Tabela 'alunos' criada!");
  }

  // --- BLOCO DE ATUALIZAÇÃO ---
  const hasStatusColumn = await connection.schema.hasColumn('alunos', 'status');
  if (!hasStatusColumn) {
    await connection.schema.table('alunos', table => {
      table.string('status').notNullable().defaultTo('Ativo');
    });
  }

  const hasVencimentoColumn = await connection.schema.hasColumn('alunos', 'data_vencimento');
  if (!hasVencimentoColumn) {
    await connection.schema.table('alunos', table => {
      table.date('data_vencimento');
    });
  }

  const hasCpfColumn = await connection.schema.hasColumn('alunos', 'cpf');
  if (!hasCpfColumn) {
    await connection.schema.table('alunos', table => {
      table.string('cpf').unique();
    });
  }

  const hasFuncionarios = await connection.schema.hasTable('funcionarios');
  if (!hasFuncionarios) {
    await connection.schema.createTable('funcionarios', table => {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.string('email').unique().notNullable();
      table.string('status').defaultTo('Ativo');
      table.string('cargo').notNullable();
      table.string('senha').notNullable(); 
      table.timestamp('criado_em').defaultTo(connection.fn.now());
    });
    console.log("✅ Tabela 'funcionarios' criada!");
  }
}

// Executa o setup
setup()
  .then(() => {
    console.log('🚀 Database setup concluído com sucesso.');
  })
  .catch(err => {
    console.error('❌ Erro no setup do DB:', err);
  });

// 3. Exportamos APENAS a conexão
module.exports = connection;
exports.up = function(knex) {
  return knex.schema.createTable('alunos', table => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('cpf').unique().notNullable();
    table.integer('plano_id').unsigned().references('id').inTable('planos');
    table.date('data_vencimento');
    table.string('status').defaultTo('Ativo');
    table.string('foto'); // A coluna que estava faltando!
  });
};
exports.down = function(knex) { return knex.schema.dropTable('alunos'); };
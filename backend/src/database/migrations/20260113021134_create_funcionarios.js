exports.up = function(knex) {
  return knex.schema.createTable('funcionarios', table => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('senha').notNullable();
    table.string('cargo').notNullable();
    table.string('status').defaultTo('Ativo');
  });
};
exports.down = function(knex) { return knex.schema.dropTable('funcionarios'); };
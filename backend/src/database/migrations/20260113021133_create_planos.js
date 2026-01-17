exports.up = function(knex) {
  return knex.schema.createTable('planos', table => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.decimal('preco').notNullable();
    table.integer('duracao_meses').notNullable();
  });
};
exports.down = function(knex) { return knex.schema.dropTable('planos'); };
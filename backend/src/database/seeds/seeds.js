const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Deleta TODOS os planos existentes para evitar conflito de ID
  await knex('planos').del();

  // 2. Reseta o contador de ID do SQLite (importante!)
  await knex('sqlite_sequence').where('name', 'planos').delete();

  // 3. Insere os planos com IDs fixos
  await knex('planos').insert([
    { id: 1, nome: 'Mensal', preco: 100.00, duracao_meses: 1 },
    { id: 2, nome: 'Trimestral', preco: 250.00, duracao_meses: 3 },
    { id: 3, nome: 'Anual', preco: 900.00, duracao_meses: 12 }
  ]);
};
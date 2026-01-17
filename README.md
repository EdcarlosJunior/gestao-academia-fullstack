# 🏋️‍♂️ RCgym - Sistema de Gestão para Academias (Projeto de Estudo)

Este projeto é o resultado de um estudo focado no desenvolvimento de uma aplicação **Full Stack** para gestão de academias. O objetivo principal foi aplicar conhecimentos de arquitetura de software, integração de APIs e regras de negócio num cenário de um **ERP (Enterprise Resource Planning)** simplificado.

---

## 🚀 Conceitos Aplicados

Durante o desenvolvimento, foquei em resolver problemas reais de um fluxo de gestão:

* **Automação de Regras de Negócio**: O sistema calcula automaticamente a data de vencimento com base no plano selecionado (Mensal, Trimestral ou Anual), demonstrando como o código pode prevenir erros operacionais.
* **Dashboard de Gestão**: Criação de uma interface para monitorização de KPIs (indicadores-chave), como total de membros, receita em dia e taxa de inadimplência.
* **Experiência do Utilizador (UX)**: Implementação de notificações estilizadas (Toasts) para feedback imediato de ações, substituindo os alertas nativos do navegador.
* **Integridade de Dados**: Tratamento de restrições de base de dados (Unique Constraints) e validação de campos obrigatórios.

---

## 🛠️ Stack Tecnológica

* **Front-end**: React.js + Tailwind CSS
* **Back-end**: Node.js + Express
* **Base de Dados**: SQLite (com Query Builder para persistência)
* **Notificações**: React-Toastify

---

## 📋 Funcionalidades Estudadas

- [x] **Matrícula de Alunos**: Cadastro completo incluindo upload de fotografia para identificação.
- [x] **Gestão de Planos**: Diferenciação de valores e períodos de renovação.
- [x] **Status em Tempo Real**: Identificação visual de alunos "Em dia" ou "Inadimplentes".
- [x] **Renovação Automática**: Fluxo de renovação de mensalidade com um clique.
- [x] **Pesquisa Dinâmica**: Filtro de membros por nome ou CPF.

---

## 🧠 Lições Aprendidas

* **Gestão de Estado**: Como coordenar o estado do React entre formulários de cadastro, edição e listagem.
* **Consumo de APIs**: Tratamento de promessas (Async/Await) e gestão de erros HTTP para dar um feedback claro ao utilizador.
* **Persistência de Ficheiros**: Como lidar com o armazenamento de imagens no servidor e a sua correta exibição no Front-end.
* **Resolução de Conflitos no Banco**: Lidar com erros de SQL (como o `SQLITE_CONSTRAINT`) e ajustar a lógica de validação no formulário.

---

## 🔧 Como Executar (Ambiente de Desenvolvimento)

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/EdcarlosJunior/gestao-academia-fullstack.git](https://github.com/EdcarlosJunior/gestao-academia-fullstack.git)
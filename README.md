# 🏋️‍♂️ RCgym - Sistema de Gestão para Academias (Projeto de Estudo)

Este projeto é o resultado de um estudo focado no desenvolvimento de uma aplicação **Full Stack** para gestão de academias. O objetivo principal foi aplicar conhecimentos de arquitetura de software, integração de APIs e regras de negócio num cenário de um **ERP (Enterprise Resource Planning)** simplificado.

---

## 🚀 Conceitos Aplicados

Durante o desenvolvimento, foquei em resolver problemas reais de um fluxo de gestão:

* **Automação de Regras de Negócio**: O sistema calcula automaticamente a data de vencimento com base no plano selecionado (Mensal, Trimestral ou Anual), demonstrando como o código pode prevenir erros operacionais.
* **Dashboard de Gestão**: Interface para monitorização de KPIs (indicadores-chave) em tempo real, como total de membros, receita em dia e taxa de inadimplência.
* **Segurança e Autenticação**: Implementação de fluxos de login utilizando **JWT (JSON Web Token)** e criptografia de senhas, garantindo que apenas usuários autorizados acessem dados sensíveis.
* **Controle de Acesso (RBAC)**: Diferenciação de permissões entre **Gerentes** (acesso total) e **Instrutores** (visualização técnica), protegendo as operações financeiras da empresa.
* **Experiência do Utilizador (UX)**: Inclusão de recursos como "ver senha" no login e notificações estilizadas (Toasts) para feedback imediato de ações.

---

## 🛠️ Stack Tecnológica

* **Front-end**: React.js + Tailwind CSS
* **Back-end**: Node.js + Express
* **Base de Dados**: SQLite (com Query Builder para persistência)
* **Autenticação**: JWT (JSON Web Token) & Bcrypt.js
* **Notificações**: React-Toastify

---

## 📋 Funcionalidades Consolidadas (v1.2)

- [x] **Sistema de Login**: Autenticação segura com opção de visibilidade de senha.
- [x] **Níveis de Permissão**: Restrição de funcionalidades administrativas para cargos de Instrutor.
- [x] **Matrícula de Alunos**: Cadastro completo incluindo upload de fotografia para identificação.
- [x] **Gestão de Planos**: Diferenciação de valores e períodos de renovação automática.
- [x] **Status em Tempo Real**: Identificação visual de alunos "Em dia" ou "Inadimplentes".
- [x] **Renovação Automática**: Fluxo de renovação de mensalidade com um clique.
- [x] **Pesquisa Dinâmica**: Filtro de membros por nome ou CPF.

---

## 🧠 Lições Aprendidas

* **Segurança Full Stack**: Como sincronizar chaves secretas entre o servidor e o cliente e gerenciar cabeçalhos de autorização no Axios.
* **Gestão de Estado**: Coordenação de estados complexos do React entre formulários de cadastro, edição e listagem.
* **Consumo de APIs**: Tratamento de promessas (Async/Await) e gestão de erros HTTP (como o erro 401) para feedback claro ao utilizador.
* **Persistência de Ficheiros**: Manipulação de `FormData` para envio de imagens e exibição de avatares dinâmicos.

---

## 🔧 Como Executar (Ambiente de Desenvolvimento)

### 1. Clone o repositório:
```bash
git clone [https://github.com/EdcarlosJunior/gestao-academia-fullstack.git](https://github.com/EdcarlosJunior/gestao-academia-fullstack.git)
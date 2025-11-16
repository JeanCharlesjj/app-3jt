# 3JT Gestão de Compras

Um aplicativo full-stack (React Native + Node.js) para a gestão de compras e despesas da empresa 3JT, focado no controlo de gastos com máquinas e tratores.

-----

## 🎯 Contexto e Motivação

Este projeto foi desenvolvido como um **Projeto de Extensão** para a disciplina de "Programação Para Dispositivos Móveis Em Android" do curso Análise e Desenvolvimento de Sistemas.

O objetivo principal foi resolver um **problema real** da empresa 3JT (uma empresa de aluguel de tratores), que atualmente gere todos os seus registos de compras (combustível, peças, manutenção) em planilhas Excel. Esta abordagem manual é suscetível a erros e não oferece uma visão clara ou auditável dos gastos.

A aplicação centraliza estes registos, vinculando cada compra a uma máquina específica e ao funcionário que a registou. Isto permite um controlo financeiro, de stock e de auditoria muito mais robusto, substituindo a planilha por uma solução móvel, multi-utilizador e segura.

## ✨ Funcionalidades (Features)

A aplicação é dividida em dois níveis de acesso, com um sistema de autenticação robusto.

### 🧑‍💼 Painel do Gerente (Manager)

O gerente tem controlo total sobre a plataforma:

  * **Dashboard:** Visualiza o total de gastos da empresa inteira no mês corrente.
  * **Gestão de Funcionários:** Pode criar, listar, editar e desabilitar (Soft Delete) contas de funcionários.
  * **Gestão de Máquinas:** Pode criar, listar, editar e excluir (Hard Delete) máquinas (tratores).
  * **Gestão de Compras:** Pode visualizar *todas* as compras, editar qualquer uma e desabilitar (Soft Delete) registos para fins de auditoria.

### 👷 Painel do Funcionário (Employee)

O funcionário tem um acesso limitado focado na entrada de dados:

  * **Dashboard:** Visualiza o total de gastos *apenas* das suas próprias compras no mês.
  * **Registo de Compras:** Pode registar uma nova compra, preenchendo descrição, valor, categoria, método de pagamento e selecionando a máquina associada.
  * **Upload de Notas Fiscais:** Pode tirar uma foto ou escolher da galeria a nota fiscal no momento do registo.
  * **Listagem e Detalhes:** Pode listar e ver os detalhes (incluindo a foto da nota) *apenas* das compras que ele mesmo registou.

-----

## 🚀 Tecnologias Utilizadas

Este é um projeto full-stack que utiliza o ecossistema TypeScript.

### 🖥️ Backend (Servidor)

  * **Node.js:** Ambiente de execução.
  * **Express:** Framework para a criação da API RESTful.
  * **TypeScript:** Para tipagem estática e segurança.
  * **MongoDB (com Mongoose):** Base de dados NoSQL para armazenar os dados.
  * **JSON Web Tokens (JWT):** Para autenticação segura e gestão de sessões.
  * **bcrypt.js:** Para hashing seguro de senhas.
  * **Multer:** Middleware para gestão de uploads de ficheiros (notas fiscais).

### 📱 Frontend (Aplicação Móvel)

  * **React Native (com Expo):** Framework para o desenvolvimento móvel.
  * **TypeScript:** Para tipagem estática nos componentes.
  * **React Navigation (Stack & Drawer):** Para a arquitetura de navegação, incluindo o menu lateral para o painel de gestão.
  * **React Context API:** Para gestão de estado global, principalmente do estado de autenticação.
  * **Axios:** Para a comunicação com a API do backend.
  * **AsyncStorage:** Para persistir o token de autenticação e os dados do utilizador no dispositivo.
  * **Expo Image Picker:** Para aceder à câmara e galeria do dispositivo.

### ☁️ Base de Dados

  * **MongoDB Atlas:** Serviço de alojamento da base de dados MongoDB na nuvem.

-----

## 🛠️ Como Executar o Projeto

Para correr este projeto, precisará de ter o Node.js e uma conta gratuita no MongoDB Atlas.

### 1\. Backend (Servidor)

1.  Navegue até à pasta `server/`:
    ```bash
    cd server
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um ficheiro `.env` na raiz da pasta `server/` e adicione as seguintes variáveis:
    ```
    MONGO_URI=SUA_STRING_DE_CONEXÃO_DO_MONGODB_ATLAS
    JWT_SECRET=UM_SEGREDO_FORTE_PARA_O_TOKEN
    ```
4.  Crie uma pasta `uploads/` na raiz do `server/` (para onde o Multer vai guardar as imagens).
5.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    O servidor estará a correr em `http://localhost:3000`.

### 2\. Frontend (Aplicação Móvel)

1.  Abra um **novo terminal** e navegue até à pasta `mobile/`:

    ```bash
    cd mobile
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Crie um ficheiro `.env` na raiz da pasta `mobile/` e adicione a URL da sua API:

    ```
    API_URL=http://SEU_IP_DE_REDE:3000
    ```

    > **Importante:** Não use `localhost` ou `127.0.0.1`. Tem de usar o endereço de IP da sua máquina na rede Wi-Fi (ex: `192.168.1.10`) para que o seu telemóvel consiga encontrar o servidor.

4.  Rode o cliente do Expo (limpando o cache para garantir que o `.env` é lido):

    ```bash
    npx expo start -c
    ```

5.  Escaneie o QR Code com a aplicação Expo Go no seu telemóvel.

# 🎉 Event Management System

<div align="center">

Um sistema completo de gerenciamento de eventos construído na plataforma Salesforce

</div>

## 📋 Sobre o Projeto
O Event Management System é uma aplicação Salesforce que criei para gerenciar eventos de um jeito prático e profissional. Este projeto faz parte da minha jornada de aprendizado em Salesforce, e nele explorei desde como organizar os dados até a construção de interfaces dinâmicas e automações inteligentes.

![Captura de Tela do Sistema](./Captura%20de%20Tela%202025-06-03%20a%CC%80s%2023.01.02.png)

## ✨ O Que Você Encontra Aqui
- 📅 **Eventos e Participantes:** Uma forma simples de cadastrar e organizar seus eventos e todos os inscritos.
- 🚦 **Controle de Capacidade:** O sistema não deixa ninguém se inscrever se o evento já estiver lotado, usando lógica inteligente em tempo real.
- ✅ **Dados Sem Erro:** Regras automáticas garantem que a capacidade dos eventos seja sempre um número válido e positivo.
- 📧 **Confirmação por Email:** Assim que alguém se inscreve, um email de confirmação é enviado automaticamente. Prático, né?
- ⚡ **Visual Moderno e Dinâmico:** Uma tela especial que mostra a lista de participantes e a ocupação do evento, e o melhor: ela se atualiza sozinha!
- 🧪 **Código de Qualidade:** Testes automatizados garantem que tudo funcione perfeitamente, com 100% de cobertura de código.

## 🛠️ Tecnologias Usadas
Este projeto foi construído com as ferramentas mais importantes do Salesforce:

- **Salesforce DX:** Meu kit de ferramentas para desenvolver no Salesforce.
- **Lightning Web Components (LWC):** Para criar interfaces de usuário modernas e interativas.
- **Apex:** A linguagem de programação do Salesforce, usada para a lógica por trás das funcionalidades.
- **SOQL/SOSL:** Para buscar e organizar os dados no Salesforce.
- **Flows:** Automações inteligentes que me ajudaram a enviar emails e gerenciar processos sem complicação.
- **Lightning Design System (SLDS):** Para deixar tudo com a cara do Salesforce, bonito e funcional em qualquer tela.

## 🚀 Como Colocar para Rodar
Quer ver o projeto funcionando na sua própria organização Salesforce? Siga estes passos simples:

### O Que Você Precisa
- **Salesforce CLI:** A ferramenta de linha de comando.
- **VS Code com Salesforce Extension Pack:** Seu ambiente de desenvolvimento.
- **Uma Org de Desenvolvimento Salesforce:** Onde o projeto será implantado.

### O Passo a Passo

#### 1. Baixe o Projeto (Clone o Repositório)
Abra seu terminal e digite:
```bash
git clone https://github.com/victorbrandaao/salesforce-learning-journey.git
cd salesforce-learning-journey/personal-projects/EventManagementSystem
```

#### 2. Conecte-se à Sua Org Salesforce
No terminal, autorize sua organização:
```bash
sf org login web --alias meuProjetoEventos # Dê um nome fácil para sua org aqui
```
Isso vai abrir uma página no seu navegador para você fazer login na sua Org e conectar com o VS Code.

#### 3. Envie o Código para Sua Org (Deploy)
Agora, envie todo o código do seu projeto para sua organização Salesforce:
```bash
sf project deploy start
```
Este comando vai implantar objetos, classes Apex, triggers, LWC e a regra de validação.

#### 4. Traga o Flow para o Projeto (Retrieve)
O Flow de email foi criado diretamente na Org, então precisamos trazê-lo para o seu projeto local (assim ele fica no GitHub também!):
```bash
sf project retrieve start --metadata-dir force-app/main/default/flows
```
Ou, se preferir pelo VS Code:
- Pressione ⌘ + Shift + P (ou Ctrl + Shift + P no Windows).
- Digite SFDX: Retrieve Source from Org e selecione o Flow pelo nome (ex: Enviar_Email_de_Confirmacao_de_Participante).

#### 5. Crie as Abas de Navegação (Tabs)
Para ver os objetos de Eventos e Participantes na interface do Salesforce:
- No Salesforce, clique na engrenagem (Configuração) no canto superior direito e depois em Configuração.
- Na busca rápida, digite Guias e selecione Guias.
- Na seção Guias de Objeto Personalizadas, clique em Nova.
- Faça isso para os objetos Evento e Participante:
  - Escolha o Objeto e um Estilo da Guia (um ícone!).
  - Clique Avançar, defina quem pode ver a guia (Ativado por Padrão para o seu perfil funciona bem), e Salvar.

#### 6. Adicione o Componente LWC à Página do Evento
Para ver a lista dinâmica de participantes no seu evento:
- No Salesforce, vá para a aba Eventos e crie um Novo Evento (ex: "Conferência de Tecnologia", Capacidade Máxima: 5).
- Na página de detalhes do evento recém-criado, clique na engrenagem (Configuração) e selecione Editar Página (Edit Page). Isso abrirá o Lightning App Builder.
- No painel esquerdo, na parte de Componentes Personalizados, arraste o `eventParticipantsList` para o local que preferir na página (eu gosto de colocar em uma coluna lateral ou logo abaixo dos detalhes do evento).
- Clique em Salvar e, se pedir, Ativar a página.

### Teste Tudo!
- **Controle de Lotação:** Tente criar mais participantes do que a capacidade do evento. O sistema vai te avisar!
- **Emails Automáticos:** Crie um participante com seu email e veja a confirmação chegar na sua caixa de entrada.
- **Atualização Mágica:** Observe a lista de participantes e a barra de capacidade no LWC se atualizarem sozinhas depois de adicionar um novo inscrito.
- **Capacidade Positiva:** Tente criar um Evento com capacidade zero ou negativa. A regra de validação vai entrar em ação!

---

## 🤝 Conecte-se Comigo
Este projeto é um exemplo do meu trabalho e aprendizado contínuo em desenvolvimento Salesforce. Se você tiver perguntas, sugestões ou quiser discutir oportunidades, sinta-se à vontade para entrar em contato!

- LinkedIn: [https://github.com/victorbrandaao]

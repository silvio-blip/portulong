# 🐉 Linguagem Portulong (.ptg) — Documentação Oficial

Bem-vindo à **Documentação Oficial da Portulong**! 🚀
A Portulong é uma linguagem de programação moderna desenvolvida em português, transpilada com precisão matemática para o robusto ecossistema do **Python**. A nossa missão é democratizar a aprendizagem de programação e facilitar a criação de ferramentas incríveis (como robôs para o Discord) sem a barreira do idioma inglês.

Se és um iniciante absoluto ou um programador experiente que quer construir robôs para o Discord em português nativo, este guia completo contém tudo o que precisas para te tornares um mestre no Portulong! 🎨

---

## 🧭 Menu de Navegação Rápida
1. [Introdução e Instalação](#1-introdução-e-instalação)
2. [O Básico da Programação (Python em PT)](#2-o-básico-da-programação-poder-do-python-em-pt)
3. [Funções (Criar os Seus Próprios Comandos)](#3-funções-criar-os-próprios-comandos)
4. [Criação de Bots para o Discord (O Prato Principal)](#4-criação-de-bots-para-o-discord-o-prato-principal)
5. [Dicas e Boas Práticas](#5-dicas-e-boas-práticas)

---

## 1. Introdução e Instalação

### O que é o Portulong e a sua Missão? 🐉
A programar, muitas vezes somos forçados a aprender inglês ao mesmo tempo que tentamos entender a lógica de programação. O **Portulong** nasceu para quebrar esta barreira de formato amigável, nativo e direto! 

A linguagem oferece uma sintaxe limpa, estruturada e de tipagem amigável com base em termos luso-brasileiros tradicionais. O motor por trás do Portulong realiza uma **análise léxica símbolo a símbolo (Tokenization)** de altíssima fidelidade. Isso significa que ele lê o seu arquivo `.ptg` caractere por caractere, garantindo que textos dentro de strings ou comentários nunca sejam afetados e gerando código Python perfeitamente otimizado pronto para execução.

### Como instalar no terminal? 💻 (Novo Fluxo Simplificado v1.0.6 🌟)

Agora, obter a experiência completa da linguagem e as suas integrações mágicas ficou ainda mais simples e elegante! Eliminamos comandos complexos externos do tipo `curl` e incorporamos um fluxo de automação integrado direto do próprio terminal com a nossa CLI nativa.

Siga estes 2 passos simples para preparar o ecossistema Portulong completo para programar:

#### 🔹 Passo 1: Instalar o núcleo da linguagem e o compilador (via pip)
No seu terminal ou consola de comandos de sistema, instale o pacote oficial da linguagem rodando:
```bash
pip install portulong.ptg
```

#### 🔹 Passo 2: Instalar os recursos adicionais, as cores e a Extensão (via CLI nativa)
Assim que o núcleo da linguagem estiver no seu computador, você ganha acesso instantâneo ao novo comando auxiliar integrado que baixa todo o mapeamento de cores, ícones e a nossa extensão para o editor VS Code de forma automática:
```bash
portulong instalar
```

*Nota: O comando `portulong instalar` conecta-se de forma encriptada e segura aos nossos servidores centrais, lidando em frações de segundo com a instalação de destaque visual de cores, autocompletar e o botão de Play nativo no topo da sua IDE favorita. Sem downloads manuais adicionais envolvidos!*

---

#### 🔹 Atualizar o Compilador (Upgrade)
Caso já tenhas a linguagem e queiras atualizar para a versão mais recente com novas palavras-chave e recursos:
```bash
pip install --upgrade portulong.ptg
```

##### 🔹 Desinstalar o Compilador
Se desejares remover completamente o pacote do compilador do seu sistema:
```bash
pip uninstall -y portulong.ptg
```

### Como executar um ficheiro? 🚀
Depois de instalado globalmente no sistema, você pode executar os seus ficheiros com a extensão `.ptg` através do comando `executar` de forma direta e rápida:

```bash
portulong executar arquivo.ptg
```

Você também pode iniciar de forma interativa a estrutura básica do projeto rodando:
```bash
portulong iniciar
```
Este comando criará automaticamente os arquivos iniciais `main.ptg` e `.env` prontos para edição!

---

## 2. O Básico da Programação (Poder do Python em PT)

A sintaxe do Portulong foi desenhada para ser intuitiva e limpa. Veja abaixo como realizar as primeiras operações essenciais que servem para construir qualquer tipo de programa!

### Escrever no Ecrã (Output de Dados)
Para mostrar qualquer informação para o utilizador no ecrã ou consola de comandos, utilize a função interna `escrever()`:

```python
escrever("Olá, Mundo! Bem-vindo ao maravilhoso universo do Portulong! 🐉")
```

### Variáveis e Tipos de Dados
As variáveis funcionam como caixas para armazenar informações. Em Portulong, os tipos de dados são representados em português e de forma limpa:

```python
# Guardar uma cadeia de caracteres (String)
nome_do_usuario = "Sílvia"

# Guardar um número inteiro (Int)
idade = 26

# Guardar um número decimal / real (Float)
saldo_da_carteira = 150.50

# Guardar valores lógicos / booleanos (Bool)
usuario_activo = Verdadeiro
bot_ligado = Falso

# Guardar uma ausência de valor (None)
dados_do_perfil = Nulo
```

### Matemática Básica e Operadores
Pode realizar todas as operações aritméticas tradicionais diretamente:

```python
soma = 10 + 5            # 15
subtracao = 20 - 4       # 16
multiplicacao = 3 * 3    # 9
divisao = 10 / 2         # 5.0
resto_da_divisao = 7 % 2 # 1
```

### Estruturas de Decisão: `se`, `senaose`, `senao`
Para testar condições e tomar caminhos diferentes no código, utilize a estrutura condicional nativa em português:

```python
pontuacao = 85

se pontuacao >= 90:
    escrever("Excelente! Ganhaste uma medalha de ouro! 🥇")
senaose pontuacao >= 70:
    escrever("Muito bom! Passaste na prova de nível! 🥈")
senao:
    escrever("Força, continua a estudar para a próxima! 🥉")
```

### Laços de Repetição (Loops): `para` e `enquanto`
Os laços de repetição servem para executar uma mesma instrução várias vezes de forma controlada.

#### O Loop `para` com `intervalo`
```python
# Repetir o código 5 vezes (de 0 até 4)
para numero em intervalo(5):
    escrever(f"Contagem do loop: {numero}")
```

#### O Loop `enquanto`
```python
tentativas = 1

enquanto tentativas <= 3:
    escrever(f"A realizar tentativa número: {tentativas}")
    tentativas = tentativas + 1
```

---

## 3. Funções (Criar os Próprios Comandos)

As funções funcionam como mini-programas que realizam uma tarefa específica e retornam um resultado que pode ser reaproveitado em outras partes do seu código.

### Como declarar e utilizar uma função com `definir` e `retornar`
```python
# Definir uma função de somar dois números
definir somar_valores(valor_a, valor_b):
    escrever(f"A processar a soma de {valor_a} e {valor_b}...")
    resultado = valor_a + valor_b
    retornar resultado

# Chamar a função e guardar o resultado numa variável
total = somar_valores(12, 18)
escrever(f"O resultado final da soma é: {total}") # Imprime 30
```

---

## 4. Criação de Bots para o Discord (O Prato Principal)

A grande especialidade do Portulong é permitir a criação de Bots (Robôs) profissionais para o Discord de forma simples e usando lógica limpa em português através do wrapper nativo `portulong.discord_pt`! 🤖

### A Estrutura Base do Bot
Aqui está o esqueleto fundamental que deves usar para iniciar qualquer Bot. Importamos o wrapper, ligamos as permissões necessárias e ligamos o nosso robô:

```python
# 1. Importar o wrapper oficial do discord em português
importar portulong.discord_pt como discord

# 2. Criar a instância do Robô com o prefixo para os comandos
robo = discord.Robo(prefixo="!")

# 3. Lógica para manter o robô ativo (Executado no final do código)
# Nota: No seu ficheiro '.env', guarde a sua chave secreta como TOKEN=seu_token_aqui
# O motor Portulong lê automaticamente o seu token confidencial com toda a segurança!
```

### Ouvir e Responder a Eventos
Os eventos são ações que acontecem de forma assíncrona no Discord (por exemplo, quando o seu robô é ligado, ou quando alguém entra no servidor):

```python
@robo.evento
definir assincrono ao_iniciar():
    escrever(f"O Robo {robo.usuario} acabou de acordar e está online! ⚡")
```

> **Atenção à Regra de Inversão Estrutural:** No Portulong, podes escrever tanto `definir assincrono` como `assincrono definir`. O compilador inteligente reordena matematicamente a ordem dos tokens na saída para que o Python processe de forma impecável no formato `async def` sem qualquer erro de sintaxe!

### Criar Comandos Básicos
Para interagir com os membros do servidor através de comandos com prefixo (por exemplo, o comando `!ping`):

```python
@robo.comando(nome="ping")
definir assincrono responder_ping(contexto):
    # O comando aguardar faz o papel do 'await' em Python
    aguardar contexto.enviar("🏓 Pong! O bot respondeu 100% em Portulong!")
```

### Comandos Avançados (Lendo Argumentos do Utilizador)
Podes receber parâmetros adicionais que o utilizador escreve logo após o nome do comando no Discord:

```python
# Exemplo de comando: !saludar Silvio
@robo.comando(nome="saludar")
definir assincrono saudar_membro(contexto, nome_do_membro):
    mensagem_personalizada = f"Olá {nome_do_membro}! É um grande prazer ver-te por aqui! 🎉"
    aguardar contexto.enviar(mensagem_personalizada)
```

### Gestão e Moderação do Servidor (Uso Prático)
Com o Portulong, podes automatizar tarefas de moderação avançadas no teu servidor de forma direta e eficaz:

```python
# Comando para limpar mensagens de um canal (!limpar 10)
@robo.comando(nome="limpar")
definir assincrono limpar_chat(contexto, quantidade: inteiro):
    # Limpa as últimas mensagens do canal de forma automática
    aguardar contexto.canal.limpar(limite=quantidade)
    aguardar contexto.enviar(f"🧹 O canal foi limpo por {contexto.autor}! {quantidade} mensagens removidas.")

# Comando para expulsar um utilizador indesejado (!expulsar @membro)
@robo.comando(nome="expulsar")
definir assincrono expulsar_membro(contexto, membro: discord.Membro, motivo=Nulo):
    se motivo == Nulo:
        motivo = "Comportamento inadequado"
        
    # Executa a expulsão usando o método nativo traduzido
    aguardar membro.expulsar(motivo=motivo)
    aguardar contexto.enviar(f"🚨 O membro {membro.nome} foi expulso com sucesso! Motivo: {motivo}")
```

### 🧩 4.1 Componentes Visuais e Interfaces Interativas (`discord.ui`)
O Portulong possui suporte nativo completo para criar botões, menus de seleção e caixas de diálogo pop-up (Modals) por meio do submódulo `discord.ui`.

*   **`discord.ui.Visualizacao`**: O contêiner de componentes que abriga botões (`Botao`) ou seletores (`Selecao`).
*   **`discord.ui.Botao`**: Botões interativos de clique que podem disparar ações personalizadas via `ao_clicar`.
*   **`discord.ui.Modal`**: Janelas pop-up com campos de formulário (`CaixaTexto`) que ajudam a coletar informações do utilizador via `ao_submeter`.

Veja abaixo um exemplo detalhado de uma interface com botões e modals 100% interativa:

```python
# Cria uma visualização para abrigar nossos componentes
painel = discord.ui.Visualizacao(tempo_esgotado=120)

# Instancia o botão com estilo de sucesso (verde)
meu_botao = discord.ui.Botao(rotulo="Iniciar Cadastro", estilo="sucesso", id_personalizado="start_reg")

# Adiciona ao painel
painel.adicionar_item(meu_botao)
```

---

### 🚀 4.2 Código Completo de Demonstração (Para Testar Gratuitamente!)
Para testar todos os recursos ao mesmo tempo no seu ambiente ou exportar diretamente ao Git, utilize o código oficial do **Bot Showroom Completo** abaixo. É obrigatório colocar o seu token de bot do Discord para colocar o robô em execução.

```python
# 🤖 BOT DE DEMONSTRAÇÃO COMPLETO EM PORTULONG 🐉
# Este arquivo serve para você testar TODOS os recursos da linguagem e do wrapper do Discord!
# Copie, transpile, modifique e divirta-se!

importar portulong.discord_pt como discord

# Instancia o robô com prefixo '!' e todas as intenções ativadas
robo = discord.Robo(prefixo="!", intents=discord.Intencoes.tudo())

# Evento: Disparado quando o robô faz login com sucesso na API
@robo.evento
definir assincrono ao_iniciar():
    escrever("==================================================")
    escrever(f"⚡ [SISTEMA] O robô {robo.usuario} está online!")
    escrever("🚀 Programado 100% em Portulong (.ptg)")
    escrever("== Use '!' no Discord para testar os comandos ===")
    escrever("==================================================")

# 1. COMANDO SIMPLES: Ajuda dinâmica do bot
@robo.comando(nome="ajuda")
definir assincrono enviar_ajuda(contexto):
    # Cria um cartão de anúncio embutido (Embed) lindo
    cartao = discord.Embutido(
        titulo="🐉 Guia de Ajuda do Portulong Bot",
        descricao="Bem-vindo ao robô oficial de testes construído na linguagem Portulong! Veja meus comandos abaixo:",
        cor=discord.Cor.azul()
    )
    
    # Adicionando campos informativos de utilidades
    cartao.adicionar_campo(nome="🤖 !ajuda", valor="Mostra este belo menu interativo em português.", em_linha=Falso)
    cartao.adicionar_campo(nome="📁 !painel", valor="Cria botões de interação que abrem um Modal de cadastro.", em_linha=Falso)
    cartao.adicionar_campo(nome="🎯 !advinha", valor="Inicia um minijogo divertido de advinhação de número.", em_linha=Falso)
    cartao.adicionar_campo(nome="🧮 !calc", valor="Realiza cálculos matemáticos rápidos (ex: !calc 10 + 5).", em_linha=Falso)
    cartao.adicionar_campo(nome="🧹 !limpar", valor="Exclui mensagens do canal (para moderadores).", em_linha=Falso)
    
    cartao.definir_rodape(texto="Compilado perfeitamente de Portulong para Python 🐍")
    
    aguardar contexto.enviar(embutido=cartao)

# 2. COMANDO AVANÇADO COM COMPONENTES VISUAIS (BOTOES, SELECOES E MODAL)
@robo.comando(nome="painel")
definir assincrono enviar_painel(contexto):
    # Cria uma view interativa
    painel = discord.ui.Visualizacao(tempo_esgotado=120)
    
    # Cria um botão de estilo sucesso
    botao_registro = discord.ui.Botao(
        rotulo="📝 Abrir Registro",
        estilo="sucesso",
        id_personalizado="botao_registrar_membro"
    )
    
    # Callback disparado quando alguém clica no botão "Abrir Registro"
    definir assincrono ao_clicar_registro(interacao):
        # Constrói a janela popup interativa (Modal)
        formulario = discord.ui.Modal(titulo="Cadastro da Comunidade Portulong", id_personalizado="form_cadastro")
        
        # Cria as caixas de texto internas do modal
        input_nome = discord.ui.CaixaTexto(rotulo="Qual seu nome completo?", id_personalizado="nome_completo", estilo="curto")
        input_hab = discord.ui.CaixaTexto(rotulo="Principal linguagem que você programa?", id_personalizado="vibe_ling", estilo="curto")
        input_motivo = discord.ui.CaixaTexto(rotulo="Por que quer se juntar a nós?", id_personalizado="motivo_registro", estilo="longo")
        
        # Adiciona os inputs ao formulário do modal
        formulario.adicionar_item(input_nome)
        formulario.adicionar_item(input_hab)
        formulario.adicionar_item(input_motivo)
        
        # Callback para processar o envio do formulário do Modal
        definir assincrono ao_submeter_formulario(interacao_modal):
            # Obtém as respostas digitadas pelo usuário de forma segura
            nome = interacao_modal.dados["nome_completo"]
            hab = interacao_modal.dados["vibe_ling"]
            motivo = interacao_modal.dados["motivo_registro"]
            
            # Constrói o cartão de perfil do novo cadastrado
            perfil = discord.Embutido(titulo="✅ Novo Cadastro Recebido!", cor=discord.Cor.verde())
            perfil.adicionar_campo(nome="👤 Nome", valor=nome, em_linha=Verdadeiro)
            perfil.adicionar_campo(nome="💻 Programa em", valor=hab, em_linha=Verdadeiro)
            perfil.adicionar_campo(nome="📝 Motivação", valor=motivo, em_linha=Falso)
            perfil.definir_autor(nome=interacao_modal.autor.nome)
            
            # Responde o modal informando que foi gravado
            aguardar interacao_modal.responder(texto="Seu cadastro foi salvo com êxito!", embutido=perfil)
            
        formulario.ao_submeter = ao_submeter_formulario
        
        # Abre o modal no ecrã do utilizador que clicou
        aguardar interacao.enviar_modal(formulario)
        
    # Vincula o gatilho de clique ao botão
    botao_registro.ao_clicar = ao_clicar_registro
    
    # Adiciona o botão do painel
    painel.adicionar_item(botao_registro)
    
    aguardar contexto.enviar(
        conteudo="Clique no botão abaixo para abrir o formulário interativo de cadastro:",
        visualizacao=painel
    )

# 3. COMANDO DIVERTIDO: Minijogo de Advinhação de Número
@robo.comando(nome="advinha")
definir assincrono iniciar_advinha(contexto):
    importar random
    numero_secreto = random.randint(1, 10)
    
    aguardar contexto.enviar("🎲 Eu pensei em um número entre **1 e 10**. Você tem **3 tentativas** para adivinhar! Qual o seu palpite?")
    
    # Função auxiliar para validar se a resposta vem da mesma pessoa e canal
    definir verificar_resposta(mensagem):
        retornar mensagem.autor == contexto.autor e mensagem.canal == contexto.canal
        
    tentativas = 0
    enquanto tentativas < 3:
        tentar:
            # Aguarda o jogador enviar uma resposta por chat
            palpite_msg = aguardar robo.aguardar_resposta(filtro=verificar_resposta, tempo_esgotado=30.0)
            valor_palpite = inteiro(palpite_msg.conteudo)
            
            se valor_palpite == numero_secreto:
                aguardar contexto.enviar(f"🎉 PARABÉNS! {contexto.autor.mencao} acertou o número secreto (**{numero_secreto}**)! Você é um gênio!")
                retornar
            senaose valor_palpite < numero_secreto:
                aguardar contexto.enviar("🔼 Dica: O número secreto é **maior** do que seu palpite! Tente novamente:")
            senao:
                aguardar contexto.enviar("🔽 Dica: O número secreto é **menor** do que seu palpite! Tente novamente:")
                
            tentativas = tentativas + 1
        exceto ErroDeValor:
            aguardar contexto.enviar("⚠️ Por favor, digite um número inteiro válido!")
        exceto Exception:
            aguardar contexto.enviar(f"⏱️ O tempo acabou! O número secreto era **{numero_secreto}**.")
            retornar
            
    aguardar contexto.enviar(f"😢 Suas tentativas acabaram! O número secreto era **{numero_secreto}**. Mais sorte na próxima!")

# 4. COMANDO CALCULADORA DINÂMICA (Ex: !calc 15 * 3)
@robo.comando(nome="calc")
definir assincrono calcular_expressao(contexto, n1: real, operador, n2: real):
    se operador == "+":
        res = n1 + n2
    senaose operador == "-":
        res = n1 - n2
    senaose operador == "*" ou operador == "x":
        res = n1 * n2
    senaose operador == "/":
        se n2 == 0:
            aguardar contexto.enviar("❌ Erro: Divisão por zero não é permitida matematicamente!")
            retornar
        res = n1 / n2
    senao:
        aguardar contexto.enviar("⚠️ Operador inválido. Use: +, -, * ou /")
        retornar
        
    aguardar contexto.enviar(f"🧮 **Calculadora Portulong**\nExpressão: `{n1} {operador} {n2}`\nResultado: **{res}**")

# ====================================================================
# 🔑 SEÇÃO DE INICIALIZAÇÃO DO ROBÔ (TOKEN DO DISCORD)
# Insira seu token confidencial do Discord abaixo para que o bot inicie.
# ====================================================================
robo.rodar("INSIRA_SEU_TOKEN_DE_DISCORD_AQUI")
```

---

## 5. Dicas e Boas Práticas

Para escreveres códigos limpos, legíveis e fáceis de dar suporte em Portulong:

### 1. Indentação é Lei! 📐
Assim como no Python, a indentação (o espaçamento no início de cada linha de código dentro de um bloco) é fundamental para determinar onde começam e terminam as regras de uma tomada de decisão (`se`) ou de uma função (`definir`). Utilize sempre **4 espaços** (ou uma tecla `Tab`) para identificar sub-blocos.

```python
# CORRETO:
se Verdadeiro:
    escrever("Este código está correctamente indentado!")

# INCORRETO (Causará um IdentationError):
se Verdadeiro:
escrever("Este código vai quebrar!")
```

### 2. Comentários para Organização e Notas 📝
Use a cerquilha (`#`) no início de uma linha ou após uma declaração para documentar o que o seu código faz. O analisador léxico do Portulong irá ler e ignorar os comentários de forma cirúrgica na transpilação matemática, sem que exista nenhum impacto no desempenho da execução:

```python
# Esta linha inteira é um comentário e serve apenas para documentação
escrever("Instrução executada!") # Comentário ao lado do código
```

### 3. Escreva Nomes Claros para Variáveis 🏷️
Evite dar nomes confusos de apenas uma letra para as suas variáveis. Prefira nomes explicativos que facilitem a leitura do código daqui a algumas semanas:

```python
# Prática Recomendada:
tempo_de_espera_segundos = 10

# Prática Não Recomendada:
t = 10
```

---

Divirta-se programando na linguagem mais amigável do mundo lusófono! Se tiver alguma dúvida, consulte esta documentação para manter os seus robôs e comandos sempre otimizados e seguros! 🐉✨

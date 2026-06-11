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

### Como instalar no terminal? 💻
A instalação do Portulong é extremamente simples e pode ser feita diretamente a partir do gerenciador de pacotes do Python (`pip`).

No terminal do seu computador (Windows, Mac ou Linux), execute:
```bash
pip install portulong
```

*(Nota: Dependendo das configurações do seu ambiente de desenvolvimento local, você pode usar `pip3 install portulong` ou para a versão empacotada `pip install portulong.ptg`).*

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

# 🐉 Portulong

Uma linguagem de programação em português para criar e rodar bots do Discord de forma 100% nativa, transpilada diretamente para Python e utilizando como base o poder do `discord.py`.

## 📁 Estrutura do Pacote

Conforme planejado por Silvio, a estrutura oficial do pacote python de distribuição é a seguinte:

```bash
portulong-bot/                  <-- Pasta principal do projeto
│
├── pyproject.toml              <-- Configurações gerais do pacote (build, dependências)
├── README.md                   <-- Documentação do projeto (este arquivo!)
├── .env                        <-- Ficheiro escondido com o seu token privado do Discord
├── main.ptg                    <-- Ficheiro de teste com código do bot em PT-PT
│
└── src/                        <-- Pasta contendo o código fonte (Source)
    └── portulong/              <-- Pacote oficial python do portulong
        ├── __init__.py         <-- Inicializador do pacote e declaração de versão
        ├── cli.py              <-- Interface de Linha de Comando (iniciar, executar)
        ├── transpilador.py     <-- Compilador/Transpilador de Portulong para Python
        ├── discord_pt.py       <-- Tradutor/Proxy de eventos e métodos do Discord.py
        └── core_keywords.py    <-- Dicionário completo de palavras-chave da linguagem
```

---

## 🚀 Instalação Local

Você pode instalar o pacote diretamente da pasta raiz com o comando:

```bash
pip install .
```

Ou no modo editável de desenvolvimento para realizar testes contínuos:

```bash
pip install -e .
```

---

## 🛠️ Como Utilizar a CLI do Portulong

Após a instalação, a palavra-chave `portulong` se tornará um comando global em seu terminal.

### 1. Inicializar um Novo Projeto
Para inicializar os arquivos padrão do robô e o arquivo de configuração de variáveis confidenciais (`.env`), utilize:

```bash
portulong iniciar
```

Este comando criará o arquivo `main.ptg` e o arquivo `.env` prontos para edição.

### 2. Executar seu Código Portulong
Para transpilar e colocar seu robô online em tempo real, use o comando:

```bash
portulong executar main.ptg
```

---

## 📜 Exemplo de Código (`main.ptg`)

```python
# Bot de Boas-vindas e Comandos em Portulong
importar portulong.discord_pt como discordia

robo = discordia.Robo(prefixo="!")

@robo.evento
definir assincrono ao_iniciar():
    escrever(f"O robô {robo.usuario} acabou de acordar! 🐉")

@robo.comando(nome="ping")
definir assincrono responder_ping(contexto):
    aguardar contexto.enviar("🏓 Pong! O bot está ativo em Portulong!")
```

---

## 🎨 Principais Dicionários de Tradução

### Palavras-Chave de Programação:
- `se` → `if`
- `senao` → `else`
- `definir` / `funcao` → `def`
- `retornar` → `return`
- `assincrono` → `async`
- `aguardar` → `await`

### Métodos do Discord:
- `enviar(...)` → `send(...)`
- `responder(...)` → `reply(...)`
- `limpar(...)` → `purge(...)`

Desenvolvido para simplificar e nacionalizar o desenvolvimento de inteligências no Discord!

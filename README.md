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

## 🚀 Instalação e Configuração Completa

Para garantir uma experiência de desenvolvimento impecável, criamos duas formas simples de instalar e começar a rodar o Portulong localmente.

### Método 1: Instalação Automática Total (Recomendado 🌟)
Se você quer configurar **tudo de uma vez** (instalar a linguagem e o suporte completo no VS Code com destaque de sintaxe e o botão play), basta baixar e rodar o nosso script de automação (`instalar.py`).

Execute no seu terminal:
```bash
python instalar.py
```

**O que este script faz por você de forma 100% automatizada:**
1. Instala a última versão do compilador `portulong.ptg` do PyPI usando o `pip`.
2. Cria todos os arquivos necessários para a extensão oficial do VS Code (`portulong-vscode`).
3. Compila a extensão e gera o arquivo `.vsix` automaticamente usando o `npx` (caso tenha o Node.js).
4. Instala a extensão diretamente no seu VS Code local (caso possua o comando `code` ativado).

---

### Método 2: Instalação Manual Passo a Passo

Se preferir fazer as etapas individualmente, siga as instruções abaixo:

#### 1. Instalar a Linguagem (do PyPI)
Instale a versão oficial do compilador diretamente do PyPI rodando no seu terminal:
```bash
pip install portulong.ptg
```

#### 2. Configurar a Extensão VS Code Manualmente
Se quiser compilar e instalar a extensão de formatação de código manualmente:
1. Abra a pasta `vscode-extension`.
2. Certifique-se de possuir o Node.js e instale o empacotador:
   ```bash
   npm install -g @vscode/vsce
   ```
3. Gere o instalador da extensão(`.vsix`):
   ```bash
   vsce package
   ```
4. No VS Code, abra a aba de Extensões (`Ctrl + Shift + X`), clique nos três pontinhos (`...`) no canto superior direito, escolha "Instalar a partir de VSIX..." e selecione o arquivo gerado!

---

## 🛠️ Como Utilizar a CLI do Portulong

Após a instalação, a ferramenta `portulong` se torna um comando global disponível no seu terminal.

### 1. Inicializar um Novo Projeto
Crie o arquivo principal de código (`main.ptg`) e o arquivo de variáveis confidenciais (`.env`) pronto para edição executando:
```bash
portulong iniciar
```

### 2. Executar seu Código Portulong
Para compilar e colocar seu robô online em tempo real:
```bash
portulong executar main.ptg
```
*(Nota: Você também pode simplesmente pressionar o botão **"Play"** no canto superior direito do seu editor VS Code ou usar o atalho de teclado `Ctrl + F5` dentro de um arquivo `.ptg`!)*

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

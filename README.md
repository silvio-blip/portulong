# Portulong (.ptg) 🚀

Linguagem de programação em **Português de Portugal** para criar páginas e aplicações web completas com Frontend, Backend e Estilos num único arquivo!

---

## 🌟 Destaques

- ✅ **100% em Português**: Sintaxe, comandos, estilos CSS, scripts JavaScript e rotas de servidor em português.
- ✅ **Ícone Oficial do Portulong**: Todos os arquivos `.ptg` no seu computador (Windows ou Linux) exibem automaticamente o ícone oficial do Portulong!
- ✅ **Botão ▶ Executar Integrado**:
  - **No VS Code**: Botão de Run (▶) na barra de ferramentas para executar qualquer arquivo `.ptg` com um clique sem abrir terminal!
  - **Na Aplicação**: Barra de execução integrada no topo da página para recarregar e acompanhar o status do servidor.
  - **No Sistema Operacional**: Duplo clique num arquivo `.ptg` abre e roda nativamente no seu navegador.
- ✅ **Frontend + Backend no Mesmo Arquivo**: HTML, CSS, JavaScript e rotas REST em Python juntas no mesmo arquivo `.ptg`.
- ✅ **Compatível com Windows, Linux e macOS**.

---

## 📦 Instalação via PyPI

Para instalar o Portulong em qualquer máquina:

```bash
pip install portulong-sistema
```

Após instalar, configure o sistema em tempo real (ícones, duplo clique e VS Code sem reiniciar):

```bash
ptg config
```

---

# Portulong (1.0.26) 🚀
Linguagem de programação para web, servidores, bots e bases de dados, **100% em Português de Portugal**.

---

## 📦 Ecossistema Modular
O Portulong agora é modular! Importe apenas o que precisa no início do seu arquivo `.ptg`:

```ptg
importar ambiente
importar base_dados
importar bots
importar erros
```

| Módulo | Descrição |
|--------|-----------|
| `ambiente` | Gestão de variáveis de ambiente (`.env`) |
| `base_dados` | Supabase/PostgreSQL nativo com CRUD e Tempo Real |
| `bots` | Integração nativa com Discord e Telegram |
| `erros` | Tratamento amigável de sintaxe em PT |

---

## ⚡ Comandos da Linha de Comandos (CLI)

| Comando | Descrição |
|---------|-----------|
| `ptg arquivo.ptg` | Executa o arquivo nativamente em memória (sem arquivos HTML no disco) |
| `ptg atualizar` | Atualiza para a última versão do PyPI |
| `ptg config` | Configura ícones, associações, oculta .vscode/.vsix e botão Run |
| `ptg novo nome.ptg` | Cria um novo arquivo modelo |
| `ptg vscode` | Instala a extensão oficial (Syntax, Indentação, Snippets) |

---

## 🛠️ Controlo de Execução

- **Servidor Nativo**: Inicia automaticamente apenas se existir o bloco `servidor:` no arquivo.
- **Botão de Run (Opcional)**: Adicione `barra_execucao` no seu `.ptg` para mostrar o botão de execução na visualização web.

---

## 💾 Base de Dados (Supabase/PostgreSQL)

Use o módulo `base_dados` para operações CRUD nativas:

```ptg
importar base_dados

script:
    ligar_supabase "URL", "CHAVE"
    consultar_tabela "utilizadores" onde "status" é "ativo" -> lista
    inserir_dados {"nome": "Novo"} em "utilizadores"
    atualizar_dados {"nome": "Editado"} em "utilizadores" onde "id" é "1"
    remover_dados em "utilizadores" onde "id" é "1"
    tempo_real "utilizadores" para INSERT -> funcao_callback
```

---

## 🎨 VS Code / Codespaces
A extensão oficial oferece:
- **Cores Ricas**: Destaque de sintaxe completo em PT.
- **Indentação Inteligente**: Auto-indentação em blocos (`se`, `funcao`, `rota`, etc.).
- **Snippets**: Abreviações como `pagina`, `rota`, `funcao` com preenchimento automático.
- **Interface Limpa**: Oculta automaticamente pastas `.vscode` e arquivos `.vsix`.


Se você for o desenvolvedor do Portulong e quiser enviar uma nova versão para o PyPI:

1. **Instale as ferramentas de compilação**:
   ```bash
   pip install build twine
   ```

2. **Gere os pacotes de distribuição**:
   ```bash
   python -m build
   ```

3. **Envie para o PyPI**:
   ```bash
   twine upload dist/*
   ```

Pronto! Qualquer pessoa no mundo poderá instalar com `pip install portulong-sistema`.

---

## 📝 Sintaxe 100% em Português

Exemplo de arquivo `sistema.ptg`:

```ptg
pagina "Meu Sistema Portulong"

# Componente reutilizável
componente cabecalho:
<div class="cabecalho">
    <h1>Loja Portulong</h1>
    <p>Criado 100% em Português</p>
</div>

# Rota de Servidor Backend (Python)
rota GET /api/produtos:
    resposta = {"produtos": ["Computador", "Telemóvel", "Tablet"]}

# Elementos visuais
cabecalho "Bem-vindo ao Portulong"
paragrafo "Programar na nossa própria língua nunca foi tão fácil."

caixa "cartao":
    titulo2 "Ações Disponíveis"
    botao "Testar Alerta" acao "alerta('Olá do Portulong!')"
    campo texto "nome"
    botao "Gravar" acao "gravarNome()"
fim_caixa

# Estilos CSS em Português
estilo:
body { fundo: #f8fafc; espacamento: 24px; fonte-familia: sans-serif; }
.cartao { fundo: branco; espacamento: 20px; borda-arredondada: 8px; sombra: 0 4px 10px rgba(0,0,0,0.1); largura-maxima: 500px; }
button { fundo: #2563eb; cor: branco; espacamento: 10px 20px; borda: nenhum; borda-arredondada: 6px; cursor: ponteiro; }

# Scripts JavaScript em Português
script:
funcao alerta(mensagem):
    alerta(mensagem)

funcao gravarNome():
    var n = obter_valor('nome')
    se n:
        alerta('Nome gravado: ' + n)
    senao:
        alerta('Por favor preencha o campo!')

# Configuração do Servidor
servidor:
    porta 3000
    host localhost
```

---

## 🗂️ Dicionário de Comandos em Português

### Interface (HTML)
- `pagina "titulo"` → Define o título da página e da aba do navegador
- `cabecalho "texto"` ou `titulo1 "texto"` → Cabeçalho nível 1 (`<h1>`)
- `titulo2 "texto"` a `titulo6 "texto"` → Cabeçalhos secundários (`<h2>` a `<h6>`)
- `paragrafo "texto"` ou `texto "texto"` → Parágrafo (`<p>`)
- `destaque "texto"` → Texto em negrito (`<strong>`)
- `italico "texto"` → Texto em itálico (`<em>`)
- `botao "rótulo" acao "codigo_js"` → Botão clicável (`<button>`)
- `campo tipo "nome"` → Campo de entrada (`<input>`)
- `formulario acao "codigo_js"` ... `fim_formulario` → Formulário com prevenção de reload
- `caixa "classe"` ... `fim_caixa` → Div com classe CSS
- `imagem "url" descricao "alt"` → Imagem (`<img>`)
- `ligacao "texto" destino "url"` → Link (`<a>`)
- `quebra_linha` → Quebra de linha (`<br>`)
- `linha_horizontal` → Linha divisória (`<hr>`)

### Estilos (CSS)
- `fundo: #cor` → `background`
- `cor: #cor` → `color`
- `tamanho-fonte: 16px` → `font-size`
- `largura: 100%` → `width`
- `altura: 50px` → `height`
- `margem: 10px` → `margin`
- `espacamento: 15px` → `padding`
- `borda: 1px solido cinzento` → `border`
- `borda-arredondada: 8px` → `border-radius`
- `sombra: 0 4px 6px ...` → `box-shadow`
- `alinhamento-texto: centro` → `text-align`
- `exibicao: flexivel` → `display: flex`

### Scripts (JavaScript)
- `funcao nome(parametros):` → `function nome(...) {`
- `se condicao:` ... `senao:` → `if (...) { ... } else {`
- `enquanto condicao:` → `while (...) {`
- `para i de 1 ate 10:` → `for (let i = 1; i <= 10; i++) {`
- `retornar valor` → `return valor;`
- `alerta(...)` → Exibe janela de aviso
- `escrever(...)` → Registo no console
- `obter_valor("id")` → Obtém o valor do input

---

## 🖥️ Integração no Windows e Linux

Ao executar `ptg instalar`:
1. **Ícone Oficial**: Todos os arquivos `.ptg` no seu Explorador de Arquivos mostram o ícone oficial do Portulong.
2. **Duplo Clique**: Clicar duas vezes num arquivo `.ptg` inicia o servidor e abre a página no navegador.
3. **Menu de Contexto**: Clique direito num arquivo `.ptg` oferece a opção `▶ Executar com Portulong`.
4. **VS Code**: A extensão oficial é instalada automaticamente com realce de sintaxe e o botão `▶ Executar` no topo da tela.

---

## 📄 Licença

Distribuído sob a licença MIT. Livre para uso pessoal, educativo e comercial.

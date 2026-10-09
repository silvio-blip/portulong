# portulong

Linguagem de programação em **Português de Portugal** para criar páginas web.

## Instalação

```bash
pip install portulong-sistema
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `ptg arquivo.ptg` | Executa arquivo .ptg (abre no browser) |
| `ptg install` | Instala e configura tudo 100% (ícones, MIME, VS Code, atalhos) |
| `ptg update` | Atualiza para última versão |
| `ptg uninstall` | Remove portulong completamente |
| `ptg version` | Mostra versão atual |
| `ptg config` | Configura sistema (ícones, associações, VS Code) |
| `ptg help` | Mostra ajuda |

## Uso Rápido

```bash
# Executar arquivo (configura automaticamente na 1ª vez)
ptg exemplos/exemplo.ptg

# Instalação completa do sistema
ptg install

# Ver versão
ptg version

# Atualizar
ptg update

# Ajuda
ptg help
```

## Sintaxe

```ptg
pagina "Minha Pagina"

cabecalho "Olá, mundo!"
paragrafo "Bem-vindo ao portulong."
botao "Clique Aqui" acao "alerta('Olá, mundo!')"

estilo:
body { fundo: #f0f0f0; }
h1 { cor: #333; }

script:
funcao alerta(mensagem):
    alerta(mensagem)
```

## Comandos da Linguagem

| Comando | HTML Gerado |
|---------|-------------|
| `pagina "titulo"` | `<title>` |
| `cabecalho "texto"` | `<h1>` |
| `paragrafo "texto"` | `<p>` |
| `botao "label" acao "js"` | `<button onclick="js">` |
| `estilo:` | `<style>` (CSS com nomes PT) |
| `script:` | `<script>` (JS com `funcao`) |
| `alerta("msg")` | `alert("msg")` |

## Propriedades CSS em PT

| PT | CSS |
|----|-----|
| `fundo` | `background` |
| `cor` | `color` |
| `tamanho` | `font-size` |
| `largura` | `width` |
| `altura` | `height` |
| `margem` | `margin` |
| `preenchimento` | `padding` |
| `borda` | `border` |

## Exemplos

```bash
ptg exemplos/exemplo.ptg
ptg exemplos/sistema_completo.ptg
```

## Funcionalidades

- ✅ 100% Português de Portugal
- ✅ Ícone automático (canto + favicon)
- ✅ Servidor HTTP integrado (porta 8000)
- ✅ Abertura automática no navegador
- ✅ Configuração automática na 1ª execução
- ✅ Syntax highlighting VS Code
- ✅ Snippets (digite `pagina` + Tab)
- ✅ Associação .ptg (duplo clique executa)

## Desenvolvimento

```bash
# Modo desenvolvimento
pip install -e .
ptg arquivo.ptg
```
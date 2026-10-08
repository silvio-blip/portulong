# portulong

Linguagem de programação em **Português de Portugal** para criar páginas web.

## Instalação

```bash
pip install portulong
```

Após instalar, execute uma vez para configurar automaticamente (ícone, associação .ptg, VS Code):

```bash
ptg
```

## Uso

```bash
ptg arquivo.ptg
```

Ou use o subcomando explícito:

```bash
ptg iniciar arquivo.ptg
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

## Comandos

| Comando | Descrição |
|---------|-----------|
| `pagina` | Título da página (`<title>`) |
| `cabecalho` | Cabeçalho `<h1>` |
| `paragrafo` | Parágrafo `<p>` |
| `botao` | Botão `<button>` |
| `estilo` | CSS (usa nomes PT: `fundo`, `cor`, `tamanho`, etc.) |
| `script` | JavaScript com `funcao` |
| `alerta()` | Mostra alerta no browser |

## Funcionalidades

- 100% em Português de Portugal
- Ícone incluído automaticamente (canto + favicon)
- Servidor HTTP integrado (porta 8000)
- Abertura automática no navegador
- Configuração automática na 1ª execução
- Funciona em qualquer editor de código

## Exemplos

```bash
ptg exemplos/exemplo.ptg
ptg exemplos/sistema_completo.ptg
```

## Atualização

```bash
ptg-atualizar
```

## Instalação completa do sistema

```bash
portulong-install
```

Instala ícone do sistema, associação de arquivo .ptg, entrada no menu de aplicações e snippets VS Code.
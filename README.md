# portulong

Linguagem de programação em **Português de Portugal** para criar páginas web.

## Instalação

```bash
pip install portulong
```

## Uso

```bash
portulong arquivo.ptg
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

- `pagina` - Título da página
- `cabecalho` - `<h1>`
- `paragrafo` - `<p>`
- `botao` - `<button>`
- `estilo` - CSS
- `script` - JavaScript

## Funcionalidades

- 100% em Português de Portugal
- Ícone incluído automaticamente
- Servidor HTTP integrado
- Abertura automática no navegador
- Funciona em qualquer editor de código
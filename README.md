# Portulong (v1.0.29)

Linguagem de programação em Português de Portugal para criar páginas web e aplicações completas com interpretador e servidor integrado.

## Instalação

```bash
pip install portulong-sistema
```

## Utilização

Para executar um ficheiro `.ptg`:

```bash
ptg meu_programa.ptg
```

Para iniciar o servidor web integrado:

```bash
ptg meu_programa.ptg --servidor
```

## Publicar no PyPI

Para publicar a versão **1.0.28** no PyPI:

```bash
# 1. Instalar as ferramentas de publicação
pip install --upgrade build twine

# 2. Gerar o pacote em dist/
python -m build

# 3. Enviar para o PyPI
twine upload dist/*
```

Ou execute diretamente o script auxiliar:
```bash
bash publicar_pypi.sh
```

## Exemplo (`ola_mundo.ptg`)

```ptg
pagina "Minha Primeira Pagina"

cabecalho "Olá, Mundo em Portulong!"
paragrafo "Criado com sintaxe 100% em Português de Portugal."

estilo:
corpo { fundo: #f0fdf4; espacamento: 40px; }

script:
escrever("ola tudo ?")
```

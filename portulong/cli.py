#!/usr/bin/env python3
"""
Linha de Comando (CLI) Oficial do Portulong
Comandos 100% em Português
"""

import os
import sys
from pathlib import Path
from . import __version__
from .core import Empretador, servir, compilar_arquivo
from .instalador import instalar_tudo
from .vscode import instalar_extensao_vscode

MODELO_NOVO = """pagina "Meu Novo Projeto"

cabecalho "Ola, Portulong!"
paragrafo "Esta pagina foi criada 100% em Portugues."

caixa "cartao":
    titulo2 "Funcionalidades"
    paragrafo "HTML, CSS, JavaScript e Python num so arquivo!"
    botao "Clique para Testar" acao "alerta('Portulong em acao!')"
fim_caixa

estilo:
body { fundo: #f1f5f9; espacamento: 30px; fonte-familia: sans-serif; }
.cartao { fundo: branco; espacamento: 24px; borda-arredondada: 12px; sombra: 0 4px 12px rgba(0,0,0,0.08); largura-maxima: 500px; }
button { fundo: #2563eb; cor: branco; espacamento: 10px 20px; borda: nenhum; borda-arredondada: 6px; cursor: ponteiro; }

script:
funcao alerta(msg):
    alerta(msg)

servidor:
    porta 3000
    host localhost
"""

def mostrar_ajuda():
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║               PORTULONG {__version__} - LINGUAGEM PT-PT              ║
╚══════════════════════════════════════════════════════════════╝

Linguagem de programação para web 100% em Português.

COMANDOS:
  ptg <arquivo.ptg>            Executa o arquivo e abre no navegador
  ptg instalar (ou install)    Configura ícones, duplo clique e VS Code
  ptg compilar <arquivo.ptg>   Compila o arquivo para HTML puro
  ptg novo <nome.ptg>          Cria um novo arquivo modelo
  ptg vscode                   Instala extensão com botão de Run no VS Code
  ptg versao                   Mostra a versão instalada
  ptg ajuda                    Mostra esta ajuda

EXEMPLOS:
  ptg meu_app.ptg
  ptg novo inicio.ptg
  ptg compilar meu_app.ptg app.html
  ptg instalar
""")

def verificar_auto_configuracao():
    marcador = Path.home() / ".config" / "portulong" / "configurado"
    if not marcador.exists():
        try:
            instalar_tudo()
        except Exception:
            pass

def main():
    if len(sys.argv) < 2:
        mostrar_ajuda()
        return

    arg = sys.argv[1].lower()

    if arg in ('ajuda', 'help', '-h', '--help'):
        mostrar_ajuda()
        return

    if arg in ('versao', 'version', '-v', '--version'):
        print(f"Portulong versão {__version__} (100% PT-PT)")
        return

    if arg in ('instalar', 'install', 'config'):
        instalar_tudo()
        return

    if arg == 'vscode':
        instalar_extensao_vscode()
        return

    if arg == 'novo':
        nome = sys.argv[2] if len(sys.argv) > 2 else "meu_projeto.ptg"
        if not nome.endswith('.ptg'):
            nome += '.ptg'
        arq = Path(nome)
        if arq.exists():
            print(f"⚠️ O arquivo {nome} já existe.")
        else:
            arq.write_text(MODELO_NOVO, encoding='utf-8')
            print(f"✅ Arquivo criado: {nome}")
            print(f"👉 Para executar: ptg {nome}")
        return

    if arg == 'compilar':
        if len(sys.argv) < 3:
            print("❌ Uso: ptg compilar <arquivo.ptg> [saida.html]")
            return
        origem = sys.argv[2]
        saida = sys.argv[3] if len(sys.argv) > 3 else origem.replace('.ptg', '.html')
        try:
            compilar_arquivo(origem, saida)
        except Exception as e:
            print(f"❌ Erro na compilação: {e}")
        return

    # Caso padrão: assumir arquivo .ptg
    caminho_arquivo = sys.argv[1]
    if not caminho_arquivo.endswith('.ptg'):
        print(f"⚠️ O arquivo deve ter a extensão .ptg (recebido: {caminho_arquivo})")
        mostrar_ajuda()
        return

    caminho = Path(caminho_arquivo)
    if not caminho.exists():
        print(f"❌ Arquivo não encontrado: {caminho_arquivo}")
        return

    # Configuração silenciosa na primeira execução
    verificar_auto_configuracao()

    print(f"📂 A executar Portulong: {caminho.resolve()} ...")
    try:
        codigo = caminho.read_text(encoding='utf-8')
        interpretador = Empretador()
        html = interpretador.empretar(codigo)
        servir(html, interpretador.rotas, interpretador.porta, interpretador.host)
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")

if __name__ == '__main__':
    main()

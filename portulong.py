#!/usr/bin/env python3
"""Empretador portulong - Converte .ptg (PT-PT) em paginas web"""

import re, sys, os, shutil, webbrowser, threading
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

class Empretador:
    def __init__(self):
        self.titulo = "Pagina"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
    
    def empretar(self, codigo):
        linhas = codigo.split('\n')
        secao = None
        
        for linha in linhas:
            linha = linha.strip()
            if not linha or linha.startswith('#'):
                continue
            
            if linha.startswith('pagina '):
                self.título = linha.replace('pagina ', '').strip().strip('"')
            elif linha.startswith('cabecalho '):
                texto = linha.replace('cabecalho ', '').strip().strip('"')
                self.elementos.append(f'<h1>{texto}</h1>')
            elif linha.startswith('paragrafo '):
                texto = linha.replace('paragrafo ', '').strip().strip('"')
                self.elementos.append(f'<p>{texto}</p>')
            elif linha.startswith('botao '):
                partes = linha.replace('botao ', '').split(' acao ')
                texto = partes[0].strip().strip('"')
                acao = partes[1].strip().strip('"') if len(partes) > 1 else ''
                self.elementos.append(f'<button onclick="{acao}">{texto}</button>')
            elif linha.startswith('estilo:'):
                secao = 'estilo'
            elif linha.startswith('script:'):
                secao = 'script'
            elif secao == 'estilo' and linha:
                self.estilos.append(linha)
            elif secao == 'script' and linha:
                self.funcoes.append(linha)
        
        return self._gerar_html()
    
    def _gerar_html(self):
        corpo = '\n'.join(self.elementos)
        css = self._traduzir_css('\n'.join(self.estilos))
        js = self._traduzir_js('\n'.join(self.funcoes))
        
        html = '<!DOCTYPE html><html lang="pt-PT"><head>'
        html += '<meta charset="UTF-8">'
        html += f'<title>{self.título}</title>'
        html += f'<link rel="icon" href="imagens/Portulong.png">'
        html += f'<style>body{{font-family:Arial;margin:0;padding:20px;}}{css}</style>'
        html += '</head><body>'
        html += f'<div style="position:fixed;top:10px;right:10px;z-index:1000;">'
        html += f'<img src="imagens/Portulong.png" width="40" height="40" style="border-radius:5px;">'
        html += '</div>'
        html += corpo
        if js:
            html += f'<script>{js}</script>'
        html += '</body></html>'
        return html
    
    def _traduzir_css(self, css):
        """Traduz propriedades CSS de PT-PT para ingles"""
        traducoes = {
            'fundo': 'background',
            'cor': 'color',
            'cor-fundo': 'background-color',
            'tamanho-fonte': 'font-size',
            'fonte-familia': 'font-family',
            'margem': 'margin',
            'margem-esquerda': 'margin-left',
            'margem-direita': 'margin-right',
            'margem-topo': 'margin-top',
            'margem-base': 'margin-bottom',
            'espacamento': 'padding',
            'espacamento-interno': 'padding',
            'largura': 'width',
            'largura-maxima': 'max-width',
            'altura': 'height',
            'altura-maxima': 'max-height',
            'alinhamento': 'text-align',
            'alinhamento-centro': 'center',
            'borda': 'border',
            'borda-arredondada': 'border-radius',
            'sombra': 'box-shadow',
            'espacamento-letra': 'letter-spacing',
            'linha-altura': 'line-height',
            'transicao': 'transition',
            'cursor': 'cursor',
            'posicao': 'position',
            'z-index': 'z-index',
            'topo': 'top',
            'direita': 'right',
            'esquerda': 'left',
            'baixo': 'bottom',
            'exibir': 'display',
            'grid-colunas': 'grid-template-columns',
            'gap': 'gap',
        }
        
        for pt, en in traducoes.items():
            css = css.replace(pt, en)
        
        return css
    
    def _traduzir_js(self, js):
        """Traduz comandos PT-PT para JavaScript"""
        traducoes = [
            ('funcao ', 'function '),
            ('escreva ', 'console.log('),
            ('alerta ', 'alert('),
            ('confirmar ', 'confirm('),
            ('prompt ', 'prompt('),
            ('se ', 'if ('),
            ('entao ', ''),
            ('senao ', '} else {'),
            ('enquanto ', 'while ('),
            ('para ', 'for ('),
            ('retorne ', 'return '),
            ('verdadeiro ', 'true'),
            ('falso ', 'false'),
            ('nulo ', 'null'),
            ('classe ', 'class '),
            ('novo ', 'new '),
            ('importar ', 'import '),
            ('de ', 'from '),
            ('como ', 'as '),
        ]
        
        for pt, en in traducoes:
            js = js.replace(pt, en)
        
        return js

class Servidor(BaseHTTPRequestHandler):
    html = ""
    base = "."
    
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self.html.encode())
        else:
            caminho = self.path.lstrip('/')
            arquivo = os.path.join(self.base, caminho)
            if os.path.isfile(arquivo):
                self.send_response(200)
                if arquivo.endswith('.png'):
                    self.send_header('Content-type', 'image/png')
                self.end_headers()
                with open(arquivo, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
    
    def log_message(self, format, *args):
        pass

def servir(html, base_dir, porta=8000):
    Servidor.html = html
    Servidor.base = base_dir
    server = HTTPServer(('localhost', porta), Servidor)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    webbrowser.open(f'http://localhost:{porta}/')
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        server.shutdown()

def main():
    if len(sys.argv) < 2:
        print("Uso: python portulong.py arquivo.ptg")
        sys.exit(1)
    
    arquivo = sys.argv[1]
    if not arquivo.endswith('.ptg'):
        print("Arquivo deve terminar em .ptg")
        sys.exit(1)
    if not os.path.exists(arquivo):
        print("Arquivo nao encontrado")
        sys.exit(1)
    
    with open(arquivo, 'r', encoding='utf-8') as f:
        codigo = f.read()
    
    empretador = Empretador()
    html = empretador.empretar(codigo)
    
    caminho = Path(arquivo)
    saida = caminho.parent / (caminho.stem + '.html')
    with open(saida, 'w', encoding='utf-8') as f:
        f.write(html)
    
    icone_origem = Path(__file__).parent / "imagens" / "Portulong.png"
    icone_destino = caminho.parent / "imagens" / "Portulong.png"
    icone_destino.parent.mkdir(exist_ok=True)
    if icone_origem.exists():
        shutil.copy2(icone_origem, icone_destino)
    
    print(f"Pagina gerada: {saida}")
    print(f"Servidor em: http://localhost:8000")
    servir(html, str(caminho.parent))

if __name__ == '__main__':
    main()

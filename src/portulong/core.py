#!/usr/bin/env python3
"""Empretador portulong - Executa .ptg diretamente no navegador sem gerar arquivos"""

import re, sys, os, webbrowser, threading, tempfile, shutil
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Caminho do pacote (para encontrar a imagem)
PACOTE_DIR = Path(__file__).parent
ICONE_PACOTE = PACOTE_DIR / "imagens" / "Portulong.png"

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
        css = '\n'.join(self.estilos)
        js = '\n'.join(self.funcoes)
        
        # Usar dados da imagem em base64 para não precisar de arquivo
        icone_base64 = self._icone_base64()
        
        html = '<!DOCTYPE html><html lang="pt-PT"><head>'
        html += '<meta charset="UTF-8">'
        html += f'<title>{self.título}</title>'
        html += f'<link rel="icon" href="data:image/png;base64,{icone_base64}">'
        html += f'<style>body{{font-family:Arial;margin:0;padding:20px;}}{css}</style>'
        html += '</head><body>'
        html += f'<div style="position:fixed;top:10px;right:10px;z-index:1000;">'
        html += f'<img src="data:image/png;base64,{icone_base64}" width="40" height="40" style="border-radius:5px;">'
        html += '</div>'
        html += corpo
        if js:
            html += f'<script>{js}</script>'
        html += '</body></html>'
        return html
    
    def _icone_base64(self):
        """Converte a imagem para base64"""
        try:
            import base64
            if ICONE_PACOTE.exists():
                with open(icone_PACOTE, 'rb') as f:
                    return base64.b64encode(f.read()).decode('utf-8')
        except:
            pass
        return ""

class ServidorHTTP(BaseHTTPRequestHandler):
    html_content = ""
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(self.html_content.encode('utf-8'))
    
    def log_message(self, format, *args):
        pass

def servir(html, porta=8000):
    """Inicia servidor HTTP temporário e abre o navegador"""
    ServidorHTTP.html_content = html
    
    server = HTTPServer(('localhost', porta), ServidorHTTP)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    
    url = f'http://localhost:{porta}/'
    print(f"Abrindo no navegador: {url}")
    webbrowser.open(url)
    
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        server.shutdown()

def main():
    if len(sys.argv) < 2:
        print("Uso: portulong arquivo.ptg")
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
    
    print("Executando portulong...")
    servir(html)

if __name__ == '__main__':
    main()
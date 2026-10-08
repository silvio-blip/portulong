#!/usr/bin/env python3
"""Sistema completo portulong - Frontend + Backend 100% em PT-PT"""

import re, sys, os, webbrowser, threading, base64, json, importlib.util
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PACOTE_DIR = Path(__file__).parent
ICONE_PACOTE = PACOTE_DIR / "imagens" / "Portulong.png"

class Empretador:
    def __init__(self):
        self.titulo = "Pagina"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.imports = []
        self.rotas = {}
        self.componentes = {}
    
    def empretar(self, codigo):
        linhas = codigo.split('\n')
        secao = None
        bloco_atual = []
        secao_atual = None
        
        for linha in linhas:
            linha = linha.strip()
            if not linha or linha.startswith('#'):
                continue
            
            if linha.startswith('pagina '):
                self.título = linha.replace('pagina ', '').strip().strip('"')
            elif linha.startswith('importar '):
                modulo = linha.replace('importar ', '').strip()
                self.imports.append(modulo)
            elif linha.startswith('componente '):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                nome = linha.replace('componente ', '').rstrip(':').strip()
                secao = f'componente_{nome}'
                secao_atual = secao
                bloco_atual = []
            elif linha.startswith('rota '):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                partes = linha.replace('rota ', '').split(' ')
                metodo = partes[0].upper()
                caminho = partes[1]
                secao = f'rota_{metodo}_{caminho}'
                secao_atual = secao
                bloco_atual = []
            elif linha.startswith('estilo:'):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao = 'estilo'
                secao_atual = secao
            elif linha.startswith('script:'):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao = 'script'
                secao_atual = secao
            elif linha.startswith('servidor:'):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao = 'servidor'
                secao_atual = secao
            elif secao == 'estilo' and linha:
                self.estilos.append(linha)
            elif secao == 'script' and linha:
                self.funcoes.append(linha)
            elif secao == 'servidor' and linha:
                self._processar_servidor(linha)
            else:
                if linha.startswith('cabecalho '):
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
                elif linha.startswith('input '):
                    partes = linha.replace('input ', '').split(' ')
                    tipo = partes[0]
                    nome = partes[1] if len(partes) > 1 else 'input'
                    self.elementos.append(f'<input type="{tipo}" name="{nome}" id="{nome}">')
                elif linha.startswith('formulario '):
                    partes = linha.replace('formulario ', '').split(' acao ')
                    acao = partes[1].strip().strip('"') if len(partes) > 1 else ''
                    self.elementos.append(f'<form onsubmit="event.preventDefault(); {acao}">')
                elif linha == 'fim_formulario':
                    self.elementos.append('</form>')
                elif linha.startswith('div '):
                    classe = linha.replace('div ', '').strip()
                    self.elementos.append(f'<div class="{classe}">')
                elif linha == 'fim_div':
                    self.elementos.append('</div>')
                elif secao_atual and secao_atual not in ['estilo', 'script', 'servidor']:
                    bloco_atual.append(linha)
        
        # Salvar último bloco
        if secao_atual and bloco_atual:
            self._salvar_bloco(secao_atual, bloco_atual)
        
        return self._gerar_html()
    
    def _salvar_bloco(self, secao, conteudo):
        if secao.startswith('componente_'):
            nome = secao.replace('componente_', '')
            self.componentes[nome] = '\n'.join(conteudo)
        elif secao.startswith('rota_'):
            partes = secao.replace('rota_', '').split('_')
            metodo = partes[0]
            caminho = '_'.join(partes[1:])
            self.rotas[caminho] = {'metodo': metodo, 'codigo': '\n'.join(conteudo)}
    
    def _gerar_html(self):
        corpo = '\n'.join(self.elementos)
        css = '\n'.join(self.estilos)
        js = '\n'.join(self.funcoes)
        
        icone_base64 = self._icone_base64()
        
        # Adicionar componentes ao JS
        componentes_js = ""
        for nome, codigo in self.componentes.items():
            componentes_js += f"window.componente_{nome} = `{codigo}`;\n"
        
        # Adicionar rotas ao JS
        rotas_js = ""
        for caminho, info in self.rotas.items():
            rotas_js += f"window.rota_{info['metodo'].lower()}_{caminho.replace('/', '_')} = `{info['codigo']}`;\n"
        
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
        if js or componentes_js or rotas_js:
            html += f'<script>{componentes_js}{rotas_js}{js}</script>'
        html += '</body></html>'
        return html
    
    def _icone_base64(self):
        try:
            if ICONE_PACOTE.exists():
                with open(ICONE_PACOTE, 'rb') as f:
                    return base64.b64encode(f.read()).decode('utf-8')
        except:
            pass
        return ""

    def _processar_servidor(self, linha):
        if linha.startswith('porta '):
            self.porta = int(linha.replace('porta ', '').strip())
        elif linha.startswith('host '):
            self.host = linha.replace('host ', '').strip()


class ServidorHTTP(BaseHTTPRequestHandler):
    html_content = ""
    api_rotas = {}
    
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.html_content.encode('utf-8'))
        elif self.path.startswith('/api/'):
            self._processar_api('GET', self.path, None)
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            self._processar_api('POST', self.path, post_data)
        else:
            self.send_response(404)
            self.end_headers()
    
    def _processar_api(self, metodo, caminho, dados):
        rota_key = caminho.replace('/api/', '')
        if rota_key in self.api_rotas:
            try:
                if dados:
                    dados = json.loads(dados)
                else:
                    dados = {}
                
                # Executar código da rota
                codigo = self.api_rotas[rota_key]
                local_vars = {'dados': dados, 'resposta': {}}
                exec(codigo, {'json': json}, local_vars)
                resultado = local_vars.get('resposta', {})
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(resultado, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'erro': str(e)}, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass


def servir(html, api_rotas=None, porta=8000, host='localhost'):
    ServidorHTTP.html_content = html
    if api_rotas:
        ServidorHTTP.api_rotas = api_rotas
    
    server = HTTPServer((host, porta), ServidorHTTP)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    
    url = f'http://{host}:{porta}/'
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
    servir(html, empretador.rotas, getattr(empretador, 'porta', 8000), getattr(empretador, 'host', 'localhost'))


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
Portulong Core - Interpretador e Servidor 100% em Português
Traduz arquivos .ptg para HTML5, CSS3, JavaScript e executa rotas de servidor integradas.
"""

import os
import re
import sys
import json
import base64
import webbrowser
import threading
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PACOTE_DIR = Path(__file__).parent
ICONE_PNG = PACOTE_DIR / "imagens" / "Portulong.png"

# Dicionário de tradução de propriedades CSS em Português -> CSS padrão
MAPA_CSS_PROPRIEDADES = {
    r'\bfundo\s*:': 'background:',
    r'\bcor-fundo\s*:': 'background-color:',
    r'\bcor\s*:': 'color:',
    r'\btamanho-fonte\s*:': 'font-size:',
    r'\bpeso-fonte\s*:': 'font-weight:',
    r'\bfonte-familia\s*:': 'font-family:',
    r'\bestilo-fonte\s*:': 'font-style:',
    r'\balinhamento-texto\s*:': 'text-align:',
    r'\btexto-centro\s*:': 'text-align:',
    r'\btexto-decoracao\s*:': 'text-decoration:',
    r'\baltura-linha\s*:': 'line-height:',
    r'\blargura\s*:': 'width:',
    r'\blargura-maxima\s*:': 'max-width:',
    r'\blargura-minima\s*:': 'min-width:',
    r'\baltura\s*:': 'height:',
    r'\baltura-maxima\s*:': 'max-height:',
    r'\baltura-minima\s*:': 'min-height:',
    r'\bmargem\s*:': 'margin:',
    r'\bmargem-topo\s*:': 'margin-top:',
    r'\bmargem-base\s*:': 'margin-bottom:',
    r'\bmargem-inferior\s*:': 'margin-bottom:',
    r'\bmargem-esquerda\s*:': 'margin-left:',
    r'\bmargem-direita\s*:': 'margin-right:',
    r'\bespacamento\s*:': 'padding:',
    r'\bpreenchimento\s*:': 'padding:',
    r'\bespacamento-topo\s*:': 'padding-top:',
    r'\bespacamento-base\s*:': 'padding-bottom:',
    r'\bespacamento-inferior\s*:': 'padding-bottom:',
    r'\bespacamento-esquerda\s*:': 'padding-left:',
    r'\bespacamento-direita\s*:': 'padding-right:',
    r'\bborda\s*:': 'border:',
    r'\bborda-arredondada\s*:': 'border-radius:',
    r'\bborda-cor\s*:': 'border-color:',
    r'\bborda-largura\s*:': 'border-width:',
    r'\bborda-estilo\s*:': 'border-style:',
    r'\bsombra\s*:': 'box-shadow:',
    r'\bsombra-texto\s*:': 'text-shadow:',
    r'\bopacidade\s*:': 'opacity:',
    r'\bexibicao\s*:': 'display:',
    r'\bposicao\s*:': 'position:',
    r'\btopo\s*:': 'top:',
    r'\bbase\s*:': 'bottom:',
    r'\besquerda\s*:': 'left:',
    r'\bdireita\s*:': 'right:',
    r'\bindice-z\s*:': 'z-index:',
    r'\bcursor\s*:': 'cursor:',
    r'\btransicao\s*:': 'transition:',
    r'\btransformacao\s*:': 'transform:',
    r'\btransbordamento\s*:': 'overflow:',
    r'\bvisibilidade\s*:': 'visibility:',
    r'\bflex-direcao\s*:': 'flex-direction:',
    r'\bjustificar-conteudo\s*:': 'justify-content:',
    r'\balinhar-itens\s*:': 'align-items:',
    r'\bintervalo\s*:': 'gap:',
}

# Dicionário de valores CSS comuns em Português
MAPA_CSS_VALORES = {
    r':\s*branco\b': ': white',
    r':\s*preto\b': ': black',
    r':\s*vermelho\b': ': red',
    r':\s*verde\b': ': green',
    r':\s*azul\b': ': blue',
    r':\s*amarelo\b': ': yellow',
    r':\s*cinzento\b': ': gray',
    r':\s*cinza\b': ': gray',
    r':\s*transparente\b': ': transparent',
    r':\s*centro\b': ': center',
    r':\s*esquerda\b': ': left',
    r':\s*direita\b': ': right',
    r':\s*justificado\b': ': justify',
    r':\s*nenhum\b': ': none',
    r':\s*bloqueio\b': ': block',
    r':\s*em-linha\b': ': inline',
    r':\s*flexivel\b': ': flex',
    r':\s*grade\b': ': grid',
    r':\s*ponteiro\b': ': pointer',
    r':\s*absoluto\b': ': absolute',
    r':\s*relativo\b': ': relative',
    r':\s*fixo\b': ': fixed',
}

class Empretador:
    """Interpretador e compilador do Portulong"""
    
    def __init__(self):
        self.titulo = "Aplicação Portulong"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.imports = []
        self.rotas = {}
        self.componentes = {}
        self.porta = 3000
        self.host = "localhost"
        self.icone_base64 = self._carregar_icone()

    def _carregar_icone(self):
        try:
            if ICONE_PNG.exists():
                return base64.b64encode(ICONE_PNG.read_bytes()).decode('utf-8')
        except Exception:
            pass
        return ""

    def traduzir_css(self, linha):
        """Traduz propriedades e valores de estilo em português para CSS"""
        for padrao, subst in MAPA_CSS_PROPRIEDADES.items():
            linha = re.sub(padrao, subst, linha, flags=re.IGNORECASE)
        for padrao, subst in MAPA_CSS_VALORES.items():
            linha = re.sub(padrao, subst, linha, flags=re.IGNORECASE)
        return linha

    def traduzir_script(self, linhas):
        """Traduz bloco de script em português para JavaScript"""
        js_linhas = []
        pilha_indentacao = []

        for raw_linha in linhas:
            trimmed = raw_linha.strip()
            if not trimmed or trimmed.startswith("#"):
                continue

            # Nível de indentação
            indent = len(raw_linha) - len(raw_linha.lstrip())

            # Fechar blocos abertos se a indentação diminuiu
            while pilha_indentacao and indent <= pilha_indentacao[-1]:
                pilha_indentacao.pop()
                js_linhas.append("    " * len(pilha_indentacao) + "}")

            # funcao nome(args):
            m_funcao = re.match(r"^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$", trimmed)
            if m_funcao:
                nome, args = m_funcao.groups()
                js_linhas.append("    " * len(pilha_indentacao) + f"function {nome}({args}) {{")
                pilha_indentacao.append(indent)
                continue

            # se condicao:
            m_se = re.match(r"^se\s+(.*?)\s*:$", trimmed)
            if m_se:
                cond = m_se.group(1)
                js_linhas.append("    " * len(pilha_indentacao) + f"if ({cond}) {{")
                pilha_indentacao.append(indent)
                continue

            # senao se condicao:
            m_senao_se = re.match(r"^senao\s+se\s+(.*?)\s*:$", trimmed)
            if m_senao_se:
                cond = m_senao_se.group(1)
                js_linhas.append("    " * len(pilha_indentacao) + f"else if ({cond}) {{")
                pilha_indentacao.append(indent)
                continue

            # senao:
            if trimmed == "senao:":
                js_linhas.append("    " * len(pilha_indentacao) + "else {")
                pilha_indentacao.append(indent)
                continue

            # enquanto condicao:
            m_enquanto = re.match(r"^enquanto\s+(.*?)\s*:$", trimmed)
            if m_enquanto:
                cond = m_enquanto.group(1)
                js_linhas.append("    " * len(pilha_indentacao) + f"while ({cond}) {{")
                pilha_indentacao.append(indent)
                continue

            # para var de inicio ate fim:
            m_para = re.match(r"^para\s+([a-zA-Z0-9_]+)\s+de\s+(.*?)\s+ate\s+(.*?)\s*:$", trimmed)
            if m_para:
                v, ini, fim = m_para.groups()
                js_linhas.append("    " * len(pilha_indentacao) + f"for (let {v} = {ini}; {v} <= {fim}; {v}++) {{")
                pilha_indentacao.append(indent)
                continue

            # Tradução de comandos pontuais
            linha_js = trimmed
            linha_js = re.sub(r'\bretornar\s+(.*)', r'return \1;', linha_js)
            linha_js = re.sub(r'\balerta\s*\(', 'alert(', linha_js)
            linha_js = re.sub(r'\bescrever\s*\(', 'console.log(', linha_js)
            linha_js = re.sub(r'\bobter_elemento\s*\((.*?)\)', r'document.getElementById(\1)', linha_js)
            linha_js = re.sub(r'\bobter_valor\s*\((.*?)\)', r'document.getElementById(\1).value', linha_js)
            linha_js = re.sub(r'\bdefinir_texto\s*\((.*?),\s*(.*?)\)', r'document.getElementById(\1).textContent = \2', linha_js)
            linha_js = re.sub(r'\bdefinir_html\s*\((.*?),\s*(.*?)\)', r'document.getElementById(\1).innerHTML = \2', linha_js)

            js_linhas.append("    " * len(pilha_indentacao) + linha_js)

        while pilha_indentacao:
            pilha_indentacao.pop()
            js_linhas.append("    " * len(pilha_indentacao) + "}")

        return "\n".join(js_linhas)

    def salvar_bloco(self, secao, conteudo):
        if secao.startswith('componente_'):
            nome = secao.replace('componente_', '')
            self.componentes[nome] = '\n'.join(conteudo)
        elif secao.startswith('rota_'):
            partes = secao.replace('rota_', '').split('_')
            metodo = partes[0]
            caminho = '/' + '/'.join(partes[1:])
            self.rotas[caminho] = {'metodo': metodo, 'codigo': '\n'.join(conteudo)}

    def empretar(self, codigo):
        """Interpreta o código Portulong e gera o HTML final"""
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.imports = []
        self.rotas = {}
        self.componentes = {}

        linhas = codigo.split('\n')
        secao_atual = None
        bloco_atual = []

        for linha in linhas:
            linha_limpa = linha.strip()
            if not linha_limpa or linha_limpa.startswith('#'):
                continue

            # Diretivas principais
            if linha_limpa.startswith('pagina '):
                self.titulo = linha_limpa.replace('pagina ', '').strip().strip('"').strip("'")
            elif linha_limpa.startswith('importar '):
                modulo = linha_limpa.replace('importar ', '').strip()
                self.imports.append(modulo)
            elif linha_limpa.startswith('componente '):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                nome = linha_limpa.replace('componente ', '').rstrip(':').strip()
                secao_atual = f'componente_{nome}'
                bloco_atual = []
            elif linha_limpa.startswith('rota '):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                partes = linha_limpa.replace('rota ', '').strip().split(' ')
                metodo = partes[0].upper()
                caminho = partes[1].lstrip('/').rstrip(':')
                secao_atual = f'rota_{metodo}_{caminho}'
                bloco_atual = []
            elif linha_limpa in ('estilo:', 'estilo'):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                secao_atual = 'estilo'
                bloco_atual = []
            elif linha_limpa in ('script:', 'script'):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                secao_atual = 'script'
                bloco_atual = []
            elif linha_limpa in ('servidor:', 'servidor'):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                secao_atual = 'servidor'
                bloco_atual = []
            elif linha_limpa in ('fim_estilo', 'fim_script', 'fim_servidor', 'fim_componente'):
                if secao_atual and bloco_atual:
                    self.salvar_bloco(secao_atual, bloco_atual)
                secao_atual = None
                bloco_atual = []
            elif secao_atual == 'estilo':
                self.estilos.append(self.traduzir_css(linha_limpa))
            elif secao_atual == 'script':
                self.funcoes.append(linha)
            elif secao_atual == 'servidor':
                if linha_limpa.startswith('porta '):
                    try:
                        self.porta = int(linha_limpa.replace('porta ', '').strip())
                    except ValueError:
                        pass
                elif linha_limpa.startswith('host '):
                    self.host = linha_limpa.replace('host ', '').strip()
            else:
                # Comandos de interface (HTML em Português)
                if linha_limpa.startswith('cabecalho ') or linha_limpa.startswith('titulo1 '):
                    txt = re.sub(r'^(cabecalho|titulo1)\s+', '', linha_limpa).strip().strip('"').strip("'")
                    self.elementos.append(f'<h1>{txt}</h1>')
                elif linha_limpa.startswith('titulo2 '):
                    txt = linha_limpa.replace('titulo2 ', '').strip().strip('"').strip("'")
                    self.elementos.append(f'<h2>{txt}</h2>')
                elif linha_limpa.startswith('titulo3 '):
                    txt = linha_limpa.replace('titulo3 ', '').strip().strip('"').strip("'")
                    self.elementos.append(f'<h3>{txt}</h3>')
                elif linha_limpa.startswith('paragrafo ') or linha_limpa.startswith('texto '):
                    txt = re.sub(r'^(paragrafo|texto)\s+', '', linha_limpa).strip().strip('"').strip("'")
                    self.elementos.append(f'<p>{txt}</p>')
                elif linha_limpa.startswith('destaque '):
                    txt = linha_limpa.replace('destaque ', '').strip().strip('"').strip("'")
                    self.elementos.append(f'<strong>{txt}</strong>')
                elif linha_limpa.startswith('botao '):
                    partes = linha_limpa.replace('botao ', '').split(' acao ')
                    lbl = partes[0].strip().strip('"').strip("'")
                    act = partes[1].strip().strip('"').strip("'") if len(partes) > 1 else ''
                    self.elementos.append(f'<button onclick="{act}">{lbl}</button>')
                elif linha_limpa.startswith('campo ') or linha_limpa.startswith('input '):
                    partes = re.sub(r'^(campo|input)\s+', '', linha_limpa).split(' ')
                    tipo = partes[0] if len(partes) > 1 else 'text'
                    nome = partes[1] if len(partes) > 1 else partes[0]
                    self.elementos.append(f'<input type="{tipo}" name="{nome}" id="{nome}" placeholder="{nome}">')
                elif linha_limpa.startswith('formulario '):
                    partes = linha_limpa.replace('formulario ', '').split(' acao ')
                    act = partes[1].strip().strip('"').strip("'") if len(partes) > 1 else ''
                    self.elementos.append(f'<form onsubmit="event.preventDefault(); {act}">')
                elif linha_limpa == 'fim_formulario':
                    self.elementos.append('</form>')
                elif linha_limpa.startswith('caixa ') or linha_limpa.startswith('div '):
                    cls = re.sub(r'^(caixa|div)\s+', '', linha_limpa).strip().strip('"').strip("'")
                    self.elementos.append(f'<div class="{cls}">')
                elif linha_limpa in ('fim_caixa', 'fim_div'):
                    self.elementos.append('</div>')
                elif linha_limpa.startswith('imagem '):
                    partes = linha_limpa.replace('imagem ', '').split(' descricao ')
                    src = partes[0].strip().strip('"').strip("'")
                    alt = partes[1].strip().strip('"').strip("'") if len(partes) > 1 else 'Imagem'
                    self.elementos.append(f'<img src="{src}" alt="{alt}">')
                elif linha_limpa.startswith('ligacao '):
                    partes = linha_limpa.replace('ligacao ', '').split(' destino ')
                    txt = partes[0].strip().strip('"').strip("'")
                    href = partes[1].strip().strip('"').strip("'") if len(partes) > 1 else '#'
                    self.elementos.append(f'<a href="{href}">{txt}</a>')
                elif linha_limpa == 'quebra_linha':
                    self.elementos.append('<br>')
                elif linha_limpa == 'linha_horizontal':
                    self.elementos.append('<hr>')
                elif linha_limpa in self.componentes:
                    self.elementos.append(self.componentes[linha_limpa])
                elif secao_atual and secao_atual not in ['estilo', 'script', 'servidor']:
                    bloco_atual.append(linha)
                else:
                    self.elementos.append(linha)

        if secao_atual and bloco_atual:
            self.salvar_bloco(secao_atual, bloco_atual)

        return self.gerar_html()

    def gerar_html(self):
        corpo = '\n'.join(self.elementos)
        css = '\n'.join(self.estilos)
        js = self.traduzir_script(self.funcoes)

        componentes_js = ""
        for nome, codigo in self.componentes.items():
            codigo_esc = codigo.replace('`', '\\`')
            componentes_js += f"window.componente_{nome} = `{codigo_esc}`;\n"

        rotas_js = ""
        for caminho, info in self.rotas.items():
            rot_nome = caminho.replace('/', '_').strip('_')
            cod_esc = info['codigo'].replace('`', '\\`')
            rotas_js += f"window.rota_{info['metodo'].lower()}_{rot_nome} = `{cod_esc}`;\n"

        icone_src = f"data:image/png;base64,{self.icone_base64}" if self.icone_base64 else "/imagens/Portulong.png"

        # Barra do Portulong integrada com o Botão de Run / Recarregar nativo
        barra_portulong = f"""
        <!-- Barra de Execução Nativa Portulong -->
        <div id="portulong-runner-bar" style="position:fixed;top:12px;right:12px;z-index:999999;display:flex;align-items:center;gap:8px;background:#0f172a;color:#f8fafc;padding:6px 12px;border-radius:10px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:1px solid #334155;font-family:system-ui,-apple-system,sans-serif;font-size:12px;user-select:none;">
            <img src="{icone_src}" width="28" height="28" style="border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.2);" alt="Portulong">
            <span style="font-weight:700;color:#60a5fa;letter-spacing:0.5px;">Portulong</span>
            <button onclick="window.location.reload();" style="display:flex;align-items:center;gap:4px;background:#2563eb;color:#ffffff;border:none;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;" title="Executar / Recarregar aplicação">
                ▶ Executar
            </button>
            <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;" title="Servidor Ligado"></span>
        </div>
        """

        html = f"""<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{self.titulo}</title>
  <link rel="icon" href="{icone_src}">
  <style>
    body {{
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }}
    {css}
  </style>
</head>
<body>
  {barra_portulong}
  {corpo}
  <script>
    {componentes_js}
    {rotas_js}
    {js}
  </script>
</body>
</html>"""
        return html


class ServidorPortulong(BaseHTTPRequestHandler):
    html_content = ""
    api_rotas = {}

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.html_content.encode('utf-8'))
        elif self.path.startswith('/api/'):
            self._executar_rota('GET', self.path, None)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            self._executar_rota('POST', self.path, post_data)
        else:
            self.send_response(404)
            self.end_headers()

    def _executar_rota(self, metodo, caminho, dados_brutos):
        rota_chave = caminho
        info_rota = self.api_rotas.get(rota_chave) or self.api_rotas.get(caminho.lstrip('/'))

        if info_rota:
            try:
                dados = json.loads(dados_brutos) if dados_brutos else {}
                codigo = info_rota.get('codigo', '')
                contexto = {'dados': dados, 'resposta': {}, 'json': json}
                exec(codigo, {'__builtins__': __builtins__, 'json': json}, contexto)
                resultado = contexto.get('resposta', {})

                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
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


def servir(html, rotas=None, porta=3000, host='localhost', abrir_navegador=True):
    """Inicia o servidor HTTP nativo do Portulong e abre o navegador"""
    ServidorPortulong.html_content = html
    if rotas:
        ServidorPortulong.api_rotas = rotas

    # Tentativa de alocar a porta ou a próxima porta livre
    porta_atual = porta
    servidor = None
    for tentativa in range(10):
        try:
            servidor = HTTPServer((host, porta_atual), ServidorPortulong)
            break
        except OSError:
            porta_atual += 1

    if not servidor:
        print(f"❌ Não foi possível iniciar o servidor na porta {porta}")
        sys.exit(1)

    url = f"http://{host}:{porta_atual}/"
    print(f"🚀 Portulong ativo em: {url}")
    print("💡 Pressione Ctrl+C para encerrar o servidor.")

    if abrir_navegador:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor Portulong encerrado.")
        servidor.server_close()


def compilar_arquivo(caminho_ptg, caminho_saida=None):
    """Compila um arquivo .ptg para HTML standalone"""
    caminho = Path(caminho_ptg)
    if not caminho.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho_ptg}")

    codigo = caminho.read_text(encoding='utf-8')
    interpretador = Empretador()
    html = interpretador.empretar(codigo)

    if caminho_saida:
        saida = Path(caminho_saida)
        saida.write_text(html, encoding='utf-8')
        print(f"✅ Compilado para: {saida.resolve()}")
    return html

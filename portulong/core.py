#!/usr/bin/env python3
"""
Portulong Core - Interpretador e Servidor 100% em Português
Executa código .ptg nativamente em memória RAM sem gerar arquivos HTML no disco.
Frontend, Backend, Estilos e Scripts 100% em Português de Portugal.
"""

import os
import re
import sys
import json
import base64
import webbrowser
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

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
    r'\bborda-base\s*:': 'border-bottom:',
    r'\bborda-topo\s*:': 'border-top:',
    r'\bborda-esquerda\s*:': 'border-left:',
    r'\bborda-direita\s*:': 'border-right:',
    r'\bborda-arredondada\s*:': 'border-radius:',
    r'\bborda-cor\s*:': 'border-color:',
    r'\bborda-largura\s*:': 'border-width:',
    r'\bborda-estilo\s*:': 'border-style:',
    r'\bestilo-lista\s*:': 'list-style:',
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
    r':\s*coluna\b': ': column',
    r':\s*linha\b': ': row',
    r':\s*espaco-entre\b': ': space-between',
    r':\s*espaco-ao-redor\b': ': space-around',
    r':\s*negrito\b': ': bold',
    r':\s*normal\b': ': normal',
}

class Empretador:
    """Interpretador e compilador nativo do Portulong"""
    
    def __init__(self):
        self.titulo = "Aplicação Portulong"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.imports = []
        self.rotas = {}
        self.componentes = {}
        self.porta = 3000
        self.host = "0.0.0.0"
        self.icone_base64 = self._carregar_icone()

    def _carregar_icone(self):
        try:
            if ICONE_PNG.exists():
                return base64.b64encode(ICONE_PNG.read_bytes()).decode('utf-8')
        except Exception:
            pass
        return ""

    def traduzir_css(self, linha):
        """Traduz seletores, propriedades e valores de estilo em português para CSS"""
        # Seletor 'corpo' para 'body'
        linha = re.sub(r'^\s*corpo\b', 'body', linha)
        for padrao, subst in MAPA_CSS_PROPRIEDADES.items():
            linha = re.sub(padrao, subst, linha, flags=re.IGNORECASE)
        for padrao, subst in MAPA_CSS_VALORES.items():
            linha = re.sub(padrao, subst, linha, flags=re.IGNORECASE)
        return linha

    def traduzir_script(self, linhas):
        """Traduz bloco de script em português para JavaScript nativo"""
        js_linhas = []
        pilha_indentacao = []

        for raw_linha in linhas:
            trimmed = raw_linha.strip()
            if not trimmed or trimmed.startswith("#"):
                continue

            indent = len(raw_linha) - len(raw_linha.lstrip())

            while pilha_indentacao and indent <= pilha_indentacao[-1]:
                pilha_indentacao.pop()
                js_linhas.append("    " * len(pilha_indentacao) + "}")

            # para cada item em colecao:
            m_para_cada = re.match(r"^para\s+cada\s+([a-zA-Z0-9_]+)\s+em\s+(.*?)\s*:$", trimmed)
            if m_para_cada:
                item_var, colecao = m_para_cada.groups()
                js_linhas.append("    " * len(pilha_indentacao) + f"({colecao} || []).forEach(function({item_var}) {{")
                pilha_indentacao.append(indent)
                continue

            # funcao nome(args):
            m_funcao = re.match(r"^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$", trimmed)
            if m_funcao:
                nome, args = m_funcao.groups()
                js_linhas.append("    " * len(pilha_indentacao) + f"function {nome}({args}) {{")
                pilha_indentacao.append(indent)
                continue

            # funcao anonima como argumento: funcao(dados):
            if re.search(r'funcao\s*\((.*?)\)\s*:', trimmed):
                trimmed = re.sub(r'funcao\s*\((.*?)\)\s*:', r'function(\1) {', trimmed)
                js_linhas.append("    " * len(pilha_indentacao) + trimmed)
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

            # Tradução de palavras-chave e helpers 100% em Português
            linha_js = trimmed
            linha_js = re.sub(r'\bverdadeiro\b', 'true', linha_js)
            linha_js = re.sub(r'\bfalso\b', 'false', linha_js)
            linha_js = re.sub(r'\bnulo\b', 'null', linha_js)
            linha_js = re.sub(r'\bretornar\s+(.*)', r'return \1;', linha_js)
            linha_js = re.sub(r'\balerta\s*\(', 'alerta(', linha_js)
            linha_js = re.sub(r'\bescrever\s*\(', 'console.log(', linha_js)

            # Helpers DOM e Requisições em Português
            linha_js = re.sub(r'\bobter_valor\s*\((.*?)\)', r'__obter_valor(\1)', linha_js)
            linha_js = re.sub(r'\bdefinir_valor\s*\((.*?),\s*(.*?)\)', r'__definir_valor(\1, \2)', linha_js)
            linha_js = re.sub(r'\bobter_elemento\s*\((.*?)\)', r'document.getElementById(\1)', linha_js)
            linha_js = re.sub(r'\bdefinir_texto\s*\((.*?),\s*(.*?)\)', r'__definir_texto(\1, \2)', linha_js)
            linha_js = re.sub(r'\bdefinir_conteudo\s*\((.*?),\s*(.*?)\)', r'__definir_conteudo(\1, \2)', linha_js)
            linha_js = re.sub(r'\blimpar_elemento\s*\((.*?)\)', r'__limpar_elemento(\1)', linha_js)
            linha_js = re.sub(r'\badicionar_item\s*\((.*?),\s*(.*?)\)', r'__adicionar_item(\1, \2)', linha_js)
            linha_js = re.sub(r'\bpedir_dados\s*\((.*?),\s*', r'__pedir_dados(\1, ', linha_js)
            linha_js = re.sub(r'\benviar_dados\s*\((.*?),\s*(.*?),\s*', r'__enviar_dados(\1, \2, ', linha_js)

            js_linhas.append("    " * len(pilha_indentacao) + linha_js)

        while pilha_indentacao:
            pilha_indentacao.pop()
            js_linhas.append("    " * len(pilha_indentacao) + "}")

        return "\n".join(js_linhas)

    def salvar_bloco(self, secao, conteudo):
        if secao.startswith('componente_'):
            nome = secao.replace('componente_', '')
            # O conteúdo do componente é processado como elementos Portulong
            interpretador_interno = Empretador()
            html_comp = interpretador_interno.empretar('\n'.join(conteudo))
            # Extrair apenas os elementos gerados
            corpo_comp = '\n'.join(interpretador_interno.elementos)
            self.componentes[nome] = corpo_comp
        elif secao.startswith('rota_'):
            partes = secao.replace('rota_', '').split('_')
            metodo = partes[0]
            caminho = '/' + '/'.join(partes[1:])
            self.rotas[caminho] = {'metodo': metodo, 'codigo': '\n'.join(conteudo)}

    def empretar(self, codigo):
        """Interpreta o código Portulong e gera a página em memória"""
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.imports = []
        self.rotas = {}
        self.componentes = {}
        self.servidor_necessario = False
        self.exibir_barra = False

        linhas = codigo.split('\n')
        secao_atual = None
        bloco_atual = []

        for linha in linhas:
            linha_limpa = linha.strip()
            if not linha_limpa or linha_limpa.startswith('#'):
                continue

            # Detetar diretivas especiais
            if linha_limpa == 'barra_execucao':
                self.exibir_barra = True
                continue
            
            # Seções principais
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
                elif linha_limpa.startswith('host ') or 'computador' in linha_limpa or 'anfitriao' in linha_limpa:
                    self.host = "0.0.0.0"
            elif secao_atual and secao_atual.startswith('componente_'):
                bloco_atual.append(linha)
            elif secao_atual and secao_atual.startswith('rota_'):
                bloco_atual.append(linha)
            else:
                # Comandos de interface 100% em Português
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
                elif linha_limpa.startswith('lista ') or linha_limpa.startswith('lista:'):
                    ident = linha_limpa.replace('lista', '').strip(':').strip().strip('"').strip("'")
                    id_attr = f' id="{ident}"' if ident else ''
                    self.elementos.append(f'<ul{id_attr}>')
                elif linha_limpa == 'fim_lista':
                    self.elementos.append('</ul>')
                elif linha_limpa.startswith('item '):
                    txt = linha_limpa.replace('item ', '').strip().strip('"').strip("'")
                    self.elementos.append(f'<li>{txt}</li>')
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
                elif linha_limpa.startswith('carregar_ambiente '):
                    caminho = linha_limpa.replace('carregar_ambiente ', '').strip().strip('"').strip("'")
                    self.funcoes.append(f"importar ambiente; ambiente.carregar_ambiente('{caminho}')")
                elif linha_limpa.startswith('obter_variavel '):
                    # Sintaxe: obter_variavel "CHAVE" (ou "valor_padrao")? -> variavel
                    match = re.match(r'obter_variavel\s+"([^"]+)"(?:\s+ou\s+"([^"]+)")?\s*->\s*([a-zA-Z0-9_]+)', linha_limpa)
                    if match:
                        chave, padrao, var_nome = match.groups()
                        padrao_str = f"'{padrao}'" if padrao else "None"
                        self.funcoes.append(f"var {var_nome} = ambiente.obter_variavel('{chave}', {padrao_str})")
                    else:
                        relatar_erro_sintaxe(i + 1, linha_limpa, "Sintaxe de obter_variavel inválida. Use: obter_variavel \"CHAVE\" (ou \"PADRAO\") -> variavel")
                elif linha_limpa.startswith('ligar_supabase '):
                    partes = linha_limpa.replace('ligar_supabase ', '').split(',')
                    url = partes[0].strip().strip('"').strip("'")
                    chave = partes[1].strip().strip('"').strip("'") if len(partes) > 1 else ""
                    self.funcoes.append(f"importar base_dados; var db = base_dados.ligar_supabase('{url}', '{chave}'); var __supabase = window.supabase_client;")
                elif linha_limpa.startswith('consultar_tabela '):
                    # Sintaxe: consultar_tabela "TABELA" (onde "COLUNA" é "VALOR")? -> variavel
                    match = re.match(r'consultar_tabela\s+"([^"]+)"(?:\s+onde\s+"([^"]+)"\s+e\s+"([^"]+)")?\s*->\s*([a-zA-Z0-9_]+)', linha_limpa)
                    if match:
                        tabela, coluna, valor, var_nome = match.groups()
                        if coluna and valor:
                            self.funcoes.append(f"var {var_nome} = await db.consultar('{tabela}', {{'{coluna}': '{valor}'}})")
                        else:
                            self.funcoes.append(f"var {var_nome} = await db.consultar('{tabela}')")
                    else:
                        relatar_erro_sintaxe(i + 1, linha_limpa, "Sintaxe de consultar_tabela inválida. Use: consultar_tabela \"TABELA\" (onde \"COLUNA\" e \"VALOR\") -> variavel")
                elif linha_limpa.startswith('inserir_dados '):
                    partes = linha_limpa.replace('inserir_dados ', '').split(' em ')
                    dados = partes[0].strip()
                    tabela = partes[1].strip().strip('"').strip("'")
                    self.funcoes.append(f"await db.inserir('{tabela}', {dados})")
                elif linha_limpa.startswith('atualizar_dados '):
                    # Sintaxe: atualizar_dados {dados} em "TABELA" onde "COLUNA" é "VALOR"
                    match = re.match(r'atualizar_dados\s+(\{.*\})\s+em\s+"([^"]+)"\s+onde\s+"([^"]+)"\s+é\s+"([^"]+)"', linha_limpa)
                    if match:
                        dados, tabela, coluna, valor = match.groups()
                        self.funcoes.append(f"await db.atualizar('{tabela}', {{'{coluna}': '{valor}'}}, {dados})")
                    else:
                        relatar_erro_sintaxe(i + 1, linha_limpa, "Sintaxe de atualizar_dados inválida. Use: atualizar_dados {dados} em \"TABELA\" onde \"COLUNA\" é \"VALOR\"")
                elif linha_limpa.startswith('remover_dados '):
                    # Sintaxe: remover_dados em "TABELA" onde "COLUNA" é "VALOR"
                    match = re.match(r'remover_dados\s+em\s+"([^"]+)"\s+onde\s+"([^"]+)"\s+é\s+"([^"]+)"', linha_limpa)
                    if match:
                        tabela, coluna, valor = match.groups()
                        self.funcoes.append(f"await db.remover('{tabela}', {{'{coluna}': '{valor}'}})")
                    else:
                        relatar_erro_sintaxe(i + 1, linha_limpa, "Sintaxe de remover_dados inválida. Use: remover_dados em \"TABELA\" onde \"COLUNA\" é \"VALOR\"")
                elif linha_limpa.startswith('tempo_real '):
                    # Sintaxe: tempo_real "TABELA" para evento (INSERT|UPDATE|DELETE) -> funcao_callback
                    match = re.match(r'tempo_real\s+"([^"]+)"\s+para\s+(INSERT|UPDATE|DELETE)\s+->\s+([a-zA-Z0-9_]+)', linha_limpa)
                    if match:
                        tabela, evento, callback = match.groups()
                        self.funcoes.append(f"db.subscrever('{tabela}', '{evento}', {callback})")
                    else:
                        relatar_erro_sintaxe(i + 1, linha_limpa, "Sintaxe de tempo_real inválida. Use: tempo_real \"TABELA\" para evento (INSERT|UPDATE|DELETE) -> funcao_callback")
                elif linha_limpa == 'quebra_linha':
                    self.elementos.append('<br>')
                elif linha_limpa == 'linha_horizontal':
                    self.elementos.append('<hr>')
                elif linha_limpa in self.componentes:
                    self.elementos.append(self.componentes[linha_limpa])
                else:
                    self.elementos.append(linha)

        if secao_atual and bloco_atual:
            self.salvar_bloco(secao_atual, bloco_atual)

        return self.gerar_html(exibir_barra=self.exibir_barra)

    def gerar_html(self, exibir_barra=False):
        corpo = '\n'.join(self.elementos)
        css = '\n'.join(self.estilos)
        js = self.traduzir_script(self.funcoes)

        icone_src = f"data:image/png;base64,{self.icone_base64}" if self.icone_base64 else "/imagens/Portulong.png"

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
        """ if exibir_barra else ""


        # Biblioteca de funções nativas 100% em Português no JavaScript
        helpers_pt = """
        // Biblioteca Nativa do Portulong em Português
        function __obter_valor(id) {
            var el = document.getElementById(id);
            return el ? el.value : '';
        }
        function __definir_valor(id, valor) {
            var el = document.getElementById(id);
            if (el) el.value = valor;
        }
        function __definir_texto(id, texto) {
            var el = document.getElementById(id);
            if (el) el.textContent = texto;
        }
        function __definir_conteudo(id, html) {
            var el = document.getElementById(id);
            if (el) el.innerHTML = html;
        }
        function __limpar_elemento(id) {
            var el = document.getElementById(id);
            if (el) el.innerHTML = '';
        }
        function __adicionar_item(id, conteudo) {
            var el = document.getElementById(id);
            if (el) {
                var li = document.createElement('li');
                li.innerHTML = conteudo;
                el.appendChild(li);
            }
        }
        function __pedir_dados(url, ao_receber) {
            fetch(url)
                .then(function(r) { return r.json(); })
                .then(function(dados) { if (ao_receber) ao_receber(dados); })
                .catch(function(err) { console.error('Erro pedir_dados:', err); });
        }
        function __enviar_dados(url, dados, ao_receber) {
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(function(r) { return r.json(); })
            .then(function(res) { if (ao_receber) ao_receber(res); })
            .catch(function(err) { console.error('Erro enviar_dados:', err); });
        }
        function alerta(msg) {
            window.alert(msg);
        }
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
  {''.join([barra_portulong]) if exibir_barra else ''}
  {corpo}
  <script>
    {helpers_pt}
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
                contexto = {
                    'dados': dados,
                    'resposta': {},
                    'verdadeiro': True,
                    'falso': False,
                    'nulo': None,
                    'json': json
                }
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


def servir(html, rotas=None, porta=3000, host='0.0.0.0', abrir_navegador=True, servidor_necessario=True):
    """Inicia o servidor HTTP nativo do Portulong SE servidor_necessario for True"""
    if not servidor_necessario:
        print("⚡ Modo sem servidor ativo. Apenas compilação.")
        return

    ServidorPortulong.html_content = html
    if rotas:
        ServidorPortulong.api_rotas = rotas

    # Tentativa de alocar a porta ou a próxima porta livre
    porta_atual = porta
    servidor = None
    for tentativa in range(20):
        try:
            servidor = HTTPServer(('0.0.0.0', porta_atual), ServidorPortulong)
            break
        except OSError:
            porta_atual += 1

    if not servidor:
        print(f"❌ Não foi possível iniciar o servidor na porta {porta}")
        sys.exit(1)

    url_local = f"http://localhost:{porta_atual}/"
    url_rede = f"http://127.0.0.1:{porta_atual}/"
    print("=" * 60)
    print(f"🚀 Portulong rodando 100% nativo em memória!")
    print(f"👉 Aceda em: {url_local}")
    print("💡 Pressione Ctrl+C para encerrar o servidor.")
    print("=" * 60)

    if abrir_navegador:
        try:
            if sys.platform.startswith('linux') and not os.environ.get('DISPLAY') and not os.environ.get('WAYLAND_DISPLAY'):
                pass
            else:
                webbrowser.open(url_local)
        except Exception:
            pass

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor Portulong encerrado.")
        servidor.server_close()


def compilar_arquivo(caminho_ptg, caminho_saida=None):
    """Interpreta um arquivo .ptg nativamente em memória"""
    caminho = Path(caminho_ptg)
    if not caminho.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho_ptg}")

    codigo = caminho.read_text(encoding='utf-8')
    interpretador = Empretador()
    html = interpretador.empretar(codigo)
    return html

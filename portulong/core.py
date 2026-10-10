"""
Portulong - Tradutor e Interpretador de código .ptg (100% PT-PT)
Interpreta Python, JavaScript, CSS e HTML tudo no mesmo ficheiro 100% em memória RAM.
Nenhum ficheiro intermédio é criado no disco.
"""

import http.server
import socketserver
import json
import os
import re
from . import ambiente
from . import base_dados
from . import bots
from . import discord

class Empretador:
    """Interpretador e Tradutor oficial da linguagem Portulong."""
    def __init__(self, codigo_fonte=""):
        self.codigo_fonte = codigo_fonte
        self.titulo = "Aplicação Portulong"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.rotas = {}
        self.componentes = {}
        self.porta = 3000
        self.host = "0.0.0.0"
        self.tem_servidor = False

    def traduzir_css(self, linha):
        """Traduz propriedades e valores de CSS em português para CSS padrão."""
        css = linha
        css = re.sub(r'^\s*corpo\b', 'body', css, flags=re.IGNORECASE)

        mapa_propriedades = [
            (r'\bfundo\s*:', 'background:'),
            (r'\bcor-fundo\s*:', 'background-color:'),
            (r'\bcor\s*:', 'color:'),
            (r'\btamanho-fonte\s*:', 'font-size:'),
            (r'\bpeso-fonte\s*:', 'font-weight:'),
            (r'\bfonte-familia\s*:', 'font-family:'),
            (r'\balinhamento-texto\s*:', 'text-align:'),
            (r'\blargura\s*:', 'width:'),
            (r'\blargura-maxima\s*:', 'max-width:'),
            (r'\baltura\s*:', 'height:'),
            (r'\baltura-maxima\s*:', 'max-height:'),
            (r'\bmargem\s*:', 'margin:'),
            (r'\bmargem-topo\s*:', 'margin-top:'),
            (r'\bmargem-base\s*:', 'margin-bottom:'),
            (r'\bmargem-esquerda\s*:', 'margin-left:'),
            (r'\bmargem-direita\s*:', 'margin-right:'),
            (r'\bespacamento\s*:', 'padding:'),
            (r'\bpreenchimento\s*:', 'padding:'),
            (r'\bborda\s*:', 'border:'),
            (r'\bborda-arredondada\s*:', 'border-radius:'),
            (r'\bsombra\s*:', 'box-shadow:'),
            (r'\bexibicao\s*:', 'display:'),
            (r'\bposicao\s*:', 'position:'),
            (r'\bcursor\s*:', 'cursor:'),
            (r'\btransicao\s*:', 'transition:'),
            (r'\bintervalo\s*:', 'gap:'),
            (r'\bjustificar-conteudo\s*:', 'justify-content:'),
            (r'\balinhar-itens\s*:', 'align-items:'),
            (r'\bflex-direcao\s*:', 'flex-direction:'),
        ]

        for padrao, subst in mapa_propriedades:
            css = re.sub(padrao, subst, css, flags=re.IGNORECASE)

        mapa_valores = [
            (r':\s*branco\b', ': white'),
            (r':\s*preto\b', ': black'),
            (r':\s*vermelho\b', ': red'),
            (r':\s*verde\b', ': green'),
            (r':\s*azul\b', ': blue'),
            (r':\s*amarelo\b', ': yellow'),
            (r':\s*cinzento\b', ': gray'),
            (r':\s*cinza\b', ': gray'),
            (r':\s*centro\b', ': center'),
            (r':\s*ponteiro\b', ': pointer'),
            (r':\s*flexivel\b', ': flex'),
            (r':\s*grade\b', ': grid'),
            (r':\s*bloqueio\b', ': block'),
            (r':\s*nenhum\b', ': none'),
            (r':\s*coluna\b', ': column'),
            (r':\s*linha\b', ': row'),
            (r':\s*espaco-entre\b', ': space-between'),
            (r':\s*negrito\b', ': bold'),
        ]

        for padrao, subst in mapa_valores:
            css = re.sub(padrao, subst, css, flags=re.IGNORECASE)

        return css

    def traduzir_script(self, linhas):
        """Traduz lógica de script 100% em português para JavaScript nativo."""
        js_linhas = []
        indent_stack = []

        for raw_linha in linhas:
            trimmed = raw_linha.strip()
            if not trimmed or trimmed.startswith("#"):
                continue

            indent = len(raw_linha) - len(raw_linha.lstrip(' '))

            while indent_stack and indent <= indent_stack[-1]:
                indent_stack.pop()
                js_linhas.append("}")

            # interromper (break) e continuar (continue)
            if trimmed in ["interromper", "parar", "quebrar"]:
                js_linhas.append("break;")
                continue
            if trimmed == "continuar":
                js_linhas.append("continue;")
                continue

            # para cada item em lista:
            m_para_cada = re.match(r'^para\s+cada\s+([a-zA-Z0-9_]+)\s+em\s+(.*?)\s*:$', trimmed)
            if m_para_cada:
                item_var, colecao = m_para_cada.groups()
                js_linhas.append(f"({colecao} || []).forEach(function({item_var}) {{")
                indent_stack.append(indent)
                continue

            # para var de ini ate fim:
            m_para_de = re.match(r'^para\s+([a-zA-Z0-9_]+)\s+de\s+(.*?)\s+ate\s+(.*?)\s*:$', trimmed)
            if m_para_de:
                v, ini, fim = m_para_de.groups()
                js_linhas.append(f"for (let {v} = {ini}; {v} <= {fim}; {v}++) {{")
                indent_stack.append(indent)
                continue

            # funcao nome(args):
            m_funcao = re.match(r'^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$', trimmed)
            if m_funcao:
                nome, args = m_funcao.groups()
                js_linhas.append(f"function {nome}({args}) {{")
                indent_stack.append(indent)
                continue

            # funcao callback:
            if re.match(r'^funcao\s*\((.*?)\)\s*:$', trimmed):
                proc = re.sub(r'^funcao\s*\((.*?)\)\s*:$', r'function(\1) {', trimmed)
                js_linhas.append(proc)
                indent_stack.append(indent)
                continue

            # se condicao:
            m_se = re.match(r'^se\s+(.*?)\s*:$', trimmed)
            if m_se:
                cond = m_se.group(1)
                cond = re.sub(r'\be\b', '&&', cond)
                cond = re.sub(r'\bou\b', '||', cond)
                cond = re.sub(r'\bnao\b', '!', cond)
                js_linhas.append(f"if ({cond}) {{")
                indent_stack.append(indent)
                continue

            # senao se condicao:
            m_senao_se = re.match(r'^senao\s+se\s+(.*?)\s*:$', trimmed)
            if m_senao_se:
                cond = m_senao_se.group(1)
                cond = re.sub(r'\be\b', '&&', cond)
                cond = re.sub(r'\bou\b', '||', cond)
                cond = re.sub(r'\bnao\b', '!', cond)
                js_linhas.append(f"else if ({cond}) {{")
                indent_stack.append(indent)
                continue

            # senao:
            if trimmed == "senao:":
                js_linhas.append("else {")
                indent_stack.append(indent)
                continue

            # enquanto condicao:
            m_enq = re.match(r'^enquanto\s+(.*?)\s*:$', trimmed)
            if m_enq:
                cond = m_enq.group(1)
                cond = re.sub(r'\be\b', '&&', cond)
                cond = re.sub(r'\bou\b', '||', cond)
                cond = re.sub(r'\bnao\b', '!', cond)
                js_linhas.append(f"while ({cond}) {{")
                indent_stack.append(indent)
                continue

            # repetir:
            if trimmed == "repetir:":
                js_linhas.append("while (true) {")
                indent_stack.append(indent)
                continue

            # Palavras-chave e Helpers em Português
            proc = trimmed
            proc = re.sub(r'\bverdadeiro\b', 'true', proc)
            proc = re.sub(r'\bfalso\b', 'false', proc)
            proc = re.sub(r'\bnulo\b', 'null', proc)
            proc = re.sub(r'\bretornar\s+(.*)', r'return \1;', proc)
            proc = re.sub(r'\balerta\s*\(', 'alerta(', proc)

            # escrever / imprimir
            if re.match(r'^(escrever|imprimir)\s*\((.*?)\)$', proc):
                proc = re.sub(r'^(escrever|imprimir)\s*\((.*?)\)$', r'__escrever(\2);', proc)
            elif re.match(r'^(escrever|imprimir)\s+(.*)$', proc):
                proc = re.sub(r'^(escrever|imprimir)\s+(.*)$', r'__escrever(\2);', proc)
            else:
                proc = re.sub(r'\bescrever\s*\(', '__escrever(', proc)
                proc = re.sub(r'\bimprimir\s*\(', '__escrever(', proc)

            proc = re.sub(r'\bobter_valor\s*\((.*?)\)', r'__obter_valor(\1)', proc)
            proc = re.sub(r'\bdefinir_valor\s*\((.*?),\s*(.*?)\)', r'__definir_valor(\1, \2)', proc)
            proc = re.sub(r'\bdefinir_texto\s*\((.*?),\s*(.*?)\)', r'__definir_texto(\1, \2)', proc)
            proc = re.sub(r'\bdefinir_conteudo\s*\((.*?),\s*(.*?)\)', r'__definir_conteudo(\1, \2)', proc)
            proc = re.sub(r'\blimpar_elemento\s*\((.*?)\)', r'__limpar_elemento(\1)', proc)
            proc = re.sub(r'\badicionar_item\s*\((.*?),\s*(.*?)\)', r'__adicionar_item(\1, \2)', proc)
            proc = re.sub(r'\bpedir_dados\s*\((.*?),\s*', r'__pedir_dados(\1, ', proc)
            proc = re.sub(r'\benviar_dados\s*\((.*?),\s*(.*?),\s*', r'__enviar_dados(\1, \2, ', proc)

            js_linhas.append(proc)

        while indent_stack:
            indent_stack.pop()
            js_linhas.append("}")

        return "\n".join(js_linhas)

    def traduzir_para_python(self, codigo):
        """Traduz instruções Portulong 100% para código Python nativo executável."""
        linhas = codigo.split("\n")
        py_linhas = []
        decoradores_pendentes = []
        shift_indent = 0

        for raw in linhas:
            l = raw.rstrip()
            trimmed = l.strip()
            if not trimmed or trimmed.startswith("#"):
                continue

            # Preservar indentação exata
            indent = len(l) - len(l.lstrip(' '))

            # Decoradores em Português para Bots e Discord
            m_dec_cmd = re.match(r'^comando\s+(.*?):$', trimmed)
            if m_dec_cmd:
                decoradores_pendentes.append((indent, m_dec_cmd.group(1)))
                continue

            m_dec_ao = re.match(r'^ao\s+(.*?):$', trimmed)
            if m_dec_ao:
                decoradores_pendentes.append((indent, m_dec_ao.group(1)))
                continue

            m_dec_barra = re.match(r'^barra\s+(.*?):$', trimmed)
            if m_dec_barra:
                decoradores_pendentes.append((indent, m_dec_barra.group(1)))
                continue

            if re.match(r'^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$', trimmed):
                m = re.match(r'^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$', trimmed)
                nome, args = m.groups()
                if decoradores_pendentes:
                    base_indent, dec = decoradores_pendentes.pop()
                    shift_indent = indent - base_indent
                    p = " " * base_indent
                    py_linhas.append(f"{p}@{dec}")
                    py_linhas.append(f"{p}def {nome}({args}):")
                    continue
                else:
                    shift_indent = 0
                    p = " " * indent
                    py_linhas.append(f"{p}def {nome}({args}):")
                    continue

            # Ajuste de indentação para o corpo da função decorada
            if shift_indent > 0 and indent >= shift_indent:
                indent -= shift_indent
            elif indent == 0:
                shift_indent = 0

            prefixo = " " * indent

            if trimmed.startswith("@"):
                py_linhas.append(f"{prefixo}{trimmed}")
                continue

            # Estruturas de controlo em Português
            if re.match(r'^se\s+(.*?)\s*:$', trimmed):
                cond = re.sub(r'^se\s+(.*?)\s*:$', r'\1', trimmed)
                cond = re.sub(r'\bverdadeiro\b', 'True', cond)
                cond = re.sub(r'\bfalso\b', 'False', cond)
                cond = re.sub(r'\be\b', 'and', cond)
                cond = re.sub(r'\bou\b', 'or', cond)
                cond = re.sub(r'\bnao\b', 'not', cond)
                py_linhas.append(f"{prefixo}if {cond}:")
                continue

            if re.match(r'^senao\s+se\s+(.*?)\s*:$', trimmed):
                cond = re.sub(r'^senao\s+se\s+(.*?)\s*:$', r'\1', trimmed)
                cond = re.sub(r'\bverdadeiro\b', 'True', cond)
                cond = re.sub(r'\bfalso\b', 'False', cond)
                cond = re.sub(r'\be\b', 'and', cond)
                cond = re.sub(r'\bou\b', 'or', cond)
                cond = re.sub(r'\bnao\b', 'not', cond)
                py_linhas.append(f"{prefixo}elif {cond}:")
                continue

            if trimmed == "senao:":
                py_linhas.append(f"{prefixo}else:")
                continue

            if re.match(r'^enquanto\s+(.*?)\s*:$', trimmed):
                cond = re.sub(r'^enquanto\s+(.*?)\s*:$', r'\1', trimmed)
                cond = re.sub(r'\bverdadeiro\b', 'True', cond)
                cond = re.sub(r'\bfalso\b', 'False', cond)
                cond = re.sub(r'\be\b', 'and', cond)
                cond = re.sub(r'\bou\b', 'or', cond)
                cond = re.sub(r'\bnao\b', 'not', cond)
                py_linhas.append(f"{prefixo}while {cond}:")
                continue

            if trimmed == "repetir:":
                py_linhas.append(f"{prefixo}while True:")
                continue

            if re.match(r'^para\s+cada\s+([a-zA-Z0-9_]+)\s+em\s+(.*?)\s*:$', trimmed):
                m = re.match(r'^para\s+cada\s+([a-zA-Z0-9_]+)\s+em\s+(.*?)\s*:$', trimmed)
                v, col = m.groups()
                py_linhas.append(f"{prefixo}for {v} in {col}:")
                continue

            if re.match(r'^para\s+([a-zA-Z0-9_]+)\s+de\s+(.*?)\s+ate\s+(.*?)\s*:$', trimmed):
                m = re.match(r'^para\s+([a-zA-Z0-9_]+)\s+de\s+(.*?)\s+ate\s+(.*?)\s*:$', trimmed)
                v, ini, fim = m.groups()
                py_linhas.append(f"{prefixo}for {v} in range({ini}, {fim} + 1):")
                continue

            if trimmed in ["interromper", "parar", "quebrar"]:
                py_linhas.append(f"{prefixo}break")
                continue

            if trimmed == "continuar":
                py_linhas.append(f"{prefixo}continue")
                continue

            if trimmed.startswith("retornar "):
                val = trimmed.replace("retornar ", "").strip()
                py_linhas.append(f"{prefixo}return {val}")
                continue

            # comandos de escrita
            if re.match(r'^(escrever|imprimir)\s*\((.*?)\)$', trimmed):
                arg = re.sub(r'^(escrever|imprimir)\s*\((.*?)\)$', r'\2', trimmed)
                py_linhas.append(f"{prefixo}print({arg})")
                continue

            if re.match(r'^(escrever|imprimir)\s+(.*)$', trimmed):
                arg = re.sub(r'^(escrever|imprimir)\s+(.*)$', r'\2', trimmed)
                py_linhas.append(f"{prefixo}print({arg})")
                continue

            # de modulo importar submodulo
            m_de_importar = re.match(r'^de\s+([a-zA-Z0-9_]+)\s+importar\s+(.*)$', trimmed)
            if m_de_importar:
                mod_origem, subm = m_de_importar.groups()
                py_linhas.append(f"{prefixo}from portulong.{mod_origem} import {subm}")
                continue

            # importar
            if trimmed.startswith("importar "):
                mod = trimmed.replace("importar ", "").strip()
                py_linhas.append(f"{prefixo}import portulong.{mod} as {mod}")
                continue

            # Substituições gerais em expressões
            proc = trimmed
            proc = re.sub(r'\bverdadeiro\b', 'True', proc)
            proc = re.sub(r'\bfalso\b', 'False', proc)
            proc = re.sub(r'\bnulo\b', 'None', proc)
            proc = re.sub(r'\bler\s*\(', 'input(', proc)

            py_linhas.append(f"{prefixo}{proc}")

        return "\n".join(py_linhas)

    def empretar(self, codigo=None):
        """Interpreta o código Portulong completamente em memória RAM."""
        if codigo:
            self.codigo_fonte = codigo

        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.rotas = {}
        self.componentes = {}
        self.tem_servidor = False

        linhas = self.codigo_fonte.split("\n")
        secao_atual = None
        bloco_atual = []

        for linha in linhas:
            l = linha.strip()
            if not l or l.startswith("#"):
                continue

            if l.startswith("pagina "):
                self.titulo = l.replace("pagina ", "").strip().strip('"\'')
            elif l.startswith("componente "):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                nome = l.replace("componente ", "").replace(":", "").strip()
                secao_atual = f"componente_{nome}"
                bloco_atual = []
            elif l.startswith("rota "):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                partes = l.replace("rota ", "").strip().split()
                metodo = partes[0].upper()
                caminho = partes[1].replace(":", "").strip() if len(partes) > 1 else "/"
                secao_atual = f"rota_{metodo}_{caminho.replace('/', '_')}"
                bloco_atual = []
            elif l in ["estilo:", "estilo"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "estilo"
                bloco_atual = []
            elif l in ["script:", "script"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "script"
                bloco_atual = []
            elif l in ["servidor:", "servidor"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "servidor"
                bloco_atual = []
                self.tem_servidor = True
            elif l in ["fim_estilo", "fim_script", "fim_servidor", "fim_componente"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = None
                bloco_atual = []
            elif secao_atual == "estilo":
                self.estilos.append(self.traduzir_css(l))
            elif secao_atual == "script":
                self.funcoes.append(linha)
            elif secao_atual == "servidor":
                if "porta" in l:
                    try:
                        self.porta = int(re.sub(r'\D', '', l))
                    except ValueError:
                        pass
                if "computador" in l or "local" in l or "host" in l:
                    self.host = "0.0.0.0"
            elif secao_atual and (secao_atual.startswith("rota_") or secao_atual.startswith("componente_")):
                bloco_atual.append(linha)
            else:
                self._interpretar_interface(l, linha)

        if secao_atual and bloco_atual:
            self._salvar_bloco(secao_atual, bloco_atual)

        return self.gerar_html()

    def _salvar_bloco(self, secao, conteudo):
        if secao.startswith("rota_"):
            partes = secao.replace("rota_", "").split("_", 1)
            metodo = partes[0]
            caminho = "/" + partes[1].replace("_", "/") if len(partes) > 1 else "/"
            self.rotas[caminho] = {
                "metodo": metodo,
                "codigo": "\n".join(conteudo)
            }
        elif secao.startswith("componente_"):
            nome = secao.replace("componente_", "")
            sub = Empretador("\n".join(conteudo))
            sub.empretar()
            self.componentes[nome] = "\n".join(sub.elementos)

    def _interpretar_interface(self, l, linha_original):
        # Instruções de terminal ou script solto
        if (
            l.startswith("escrever(") or l.startswith("escrever ") or
            l.startswith("imprimir(") or l.startswith("imprimir ") or
            l.startswith("var ") or l.startswith("funcao ") or
            l.startswith("se ") or l.startswith("enquanto ") or
            l.startswith("repetir:") or
            l.startswith("interromper") or l.startswith("parar") or
            l.startswith("para ") or l.startswith("alerta(") or
            l.startswith("importar ")
        ):
            self.funcoes.append(linha_original)
            return

        if l.startswith("cabecalho ") or l.startswith("titulo1 "):
            texto = re.sub(r'^(cabecalho|titulo1)\s+', '', l).strip().strip('"\'')
            self.elementos.append(f"<h1>{texto}</h1>")
        elif l.startswith("titulo2 "):
            texto = l.replace("titulo2 ", "").strip().strip('"\'')
            self.elementos.append(f"<h2>{texto}</h2>")
        elif l.startswith("titulo3 "):
            texto = l.replace("titulo3 ", "").strip().strip('"\'')
            self.elementos.append(f"<h3>{texto}</h3>")
        elif l.startswith("paragrafo ") or l.startswith("texto "):
            texto = re.sub(r'^(paragrafo|texto)\s+', '', l).strip().strip('"\'')
            self.elementos.append(f"<p>{texto}</p>")
        elif l.startswith("destaque "):
            texto = l.replace("destaque ", "").strip().strip('"\'')
            self.elementos.append(f"<strong>{texto}</strong>")
        elif l.startswith("botao "):
            partes = l.replace("botao ", "").split(" acao ")
            texto = partes[0].strip().strip('"\'')
            acao = partes[1].strip().strip('"\'') if len(partes) > 1 else ""
            self.elementos.append(f"<button onclick=\"{acao}\">{texto}</button>")
        elif l.startswith("campo ") or l.startswith("input "):
            partes = re.sub(r'^(campo|input)\s+', '', l).strip().split()
            tipo = partes[0] if len(partes) > 1 else "text"
            nome = partes[1] if len(partes) > 1 else partes[0]
            self.elementos.append(f"<input type='{tipo}' id='{nome}' placeholder='{nome}'>")
        elif l.startswith("caixa ") or l.startswith("div "):
            classe = re.sub(r'^(caixa|div)\s+', '', l).strip().strip('"\'')
            self.elementos.append(f"<div class='{classe}'>")
        elif l in ["fim_caixa", "fim_div"]:
            self.elementos.append("</div>")
        elif l.startswith("lista ") or l.startswith("lista:"):
            id_lista = l.replace("lista", "").replace(":", "").strip().strip('"\'')
            attr = f" id='{id_lista}'" if id_lista else ""
            self.elementos.append(f"<ul{attr}>")
        elif l == "fim_lista":
            self.elementos.append("</ul>")
        elif l.startswith("item "):
            txt = l.replace("item ", "").strip().strip('"\'')
            self.elementos.append(f"<li>{txt}</li>")
        elif l.startswith("imagem "):
            partes = l.replace("imagem ", "").split(" descricao ")
            src = partes[0].strip().strip('"\'')
            alt = partes[1].strip().strip('"\'') if len(partes) > 1 else "Imagem"
            self.elementos.append(f"<img src='{src}' alt='{alt}'>")
        elif l.startswith("ligacao "):
            partes = l.replace("ligacao ", "").split(" destino ")
            txt = partes[0].strip().strip('"\'')
            dest = partes[1].strip().strip('"\'') if len(partes) > 1 else "#"
            self.elementos.append(f"<a href='{dest}'>{txt}</a>")
        elif l in self.componentes:
            self.elementos.append(self.componentes[l])
        else:
            if "(" in l and ")" in l:
                self.funcoes.append(linha_original)
            else:
                self.elementos.append(f"<p>{l}</p>")

    def executar_terminal(self):
        """Executa instruções no terminal Python com interpretação nativa completa."""
        # Se houver funções/código de script, traduz para Python e executa no terminal
        codigo_terminal = "\n".join(self.funcoes) if self.funcoes else self.codigo_fonte
        py_codigo = self.traduzir_para_python(codigo_terminal)

        # Ambiente com pacotes portulong disponíveis nativamente
        namespace = {
            "escrever": print,
            "imprimir": print,
            "ler": input,
            "ambiente": ambiente,
            "base_dados": base_dados,
            "bots": bots,
            "discord": discord,
            "verdadeiro": True,
            "falso": False,
            "nulo": None,
        }

        try:
            exec(py_codigo, namespace)
        except Exception as e:
            # Fallback para escrita direta simples se houver erro de sintaxe de bloco
            for linha in self.codigo_fonte.split("\n"):
                l = linha.strip()
                if l.startswith("escrever(") or l.startswith("escrever "):
                    m = re.search(r'escrever\s*\(?(.*?)\)?$', l)
                    if m:
                        print(m.group(1).strip().strip('"\''))

    def gerar_html(self):
        """Gera o HTML final traduzido 100% em memória."""
        corpo = "\n".join(self.elementos)
        css = "\n".join(self.estilos)
        js = self.traduzir_script(self.funcoes)

        helpers = """
        function __escrever(msg) {
            console.log('[Portulong]', msg);
            var term = document.getElementById('portulong-terminal-output');
            if (term) {
                var d = document.createElement('div');
                d.textContent = '> ' + (typeof msg === 'object' ? JSON.stringify(msg) : msg);
                term.appendChild(d);
            }
        }
        function __obter_valor(id) { var el = document.getElementById(id); return el ? el.value : ''; }
        function __definir_valor(id, val) { var el = document.getElementById(id); if (el) el.value = val; }
        function __definir_texto(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
        function __definir_conteudo(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
        function __limpar_elemento(id) { var el = document.getElementById(id); if (el) el.innerHTML = ''; }
        function __adicionar_item(id, it) { var el = document.getElementById(id); if (el) { var li = document.createElement('li'); li.innerHTML = it; el.appendChild(li); } }
        function __pedir_dados(url, cb) { fetch(url).then(r => r.json()).then(d => { if(cb) cb(d); }).catch(console.error); }
        function __enviar_dados(url, dados, cb) { fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(dados) }).then(r => r.json()).then(d => { if(cb) cb(d); }).catch(console.error); }
        function alerta(msg) { window.alert(msg); }
        """

        terminal_view = ""
        if len(self.elementos) == 0:
            terminal_view = """
            <div style="background:#090d16;color:#38bdf8;font-family:monospace;padding:20px;border-radius:10px;margin:20px;border:1px solid #1e293b;">
                <div style="color:#64748b;margin-bottom:10px;border-bottom:1px solid #1e293b;padding-bottom:5px;">● Terminal Portulong (Em memória)</div>
                <div id="portulong-terminal-output"></div>
            </div>
            """

        return f"""<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <title>{self.titulo}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
        {css}
    </style>
</head>
<body>
    {terminal_view}
    {corpo}
    <script>
        {helpers}
        {js}
    </script>
</body>
</html>"""

    # Alias
    compilar = empretar

Interpretador = Empretador
PortulongCompilador = Empretador

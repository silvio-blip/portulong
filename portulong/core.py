import http.server
import socketserver
import json
import os
import re
from urllib.parse import parse_qs, urlparse

class PortulongCompilador:
    """Compilador oficial Portulong em Python com execução nativa no terminal."""
    def __init__(self, codigo_fonte=""):
        self.codigo_fonte = codigo_fonte
        self.titulo = "Aplicação Portulong"
        self.elementos = []
        self.estilos = []
        self.funcoes = []
        self.rotas = {}
        self.porta = 3000
        self.host = "0.0.0.0"
        self.tem_servidor = False

    def compilar(self, codigo=None):
        if codigo:
            self.codigo_fonte = codigo

        linhas = self.codigo_fonte.split("\n")
        secao_atual = None
        bloco_atual = []

        for linha in linhas:
            linha_limpa = linha.strip()
            if not linha_limpa or linha_limpa.startswith("#"):
                continue

            if linha_limpa.startswith("pagina "):
                self.titulo = linha_limpa.replace("pagina ", "").strip().strip('"\'')
            elif linha_limpa.startswith("rota "):
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                partes = linha_limpa.replace("rota ", "").strip().split()
                metodo = partes[0].upper()
                caminho = partes[1].replace(":", "").strip() if len(partes) > 1 else "/"
                secao_atual = f"rota_{metodo}_{caminho.replace('/', '_')}"
                bloco_atual = []
            elif linha_limpa in ["estilo:", "estilo"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "estilo"
                bloco_atual = []
            elif linha_limpa in ["script:", "script"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "script"
                bloco_atual = []
            elif linha_limpa in ["servidor:", "servidor"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = "servidor"
                bloco_atual = []
                self.tem_servidor = True
            elif linha_limpa in ["fim_estilo", "fim_script", "fim_servidor"]:
                if secao_atual and bloco_atual:
                    self._salvar_bloco(secao_atual, bloco_atual)
                secao_atual = None
                bloco_atual = []
            elif secao_atual == "estilo":
                self.estilos.append(linha_limpa)
            elif secao_atual == "script":
                self.funcoes.append(linha)
            elif secao_atual == "servidor":
                if "porta" in linha_limpa:
                    try:
                        self.porta = int(re.sub(r'\D', '', linha_limpa))
                    except ValueError:
                        pass
                if "computador" in linha_limpa or "local" in linha_limpa or "host" in linha_limpa:
                    self.host = "0.0.0.0"
            elif secao_atual and secao_atual.startswith("rota_"):
                bloco_atual.append(linha)
            else:
                self._processar_elemento(linha_limpa)

        if secao_atual and bloco_atual:
            self._salvar_bloco(secao_atual, bloco_atual)

        return self.gerar_html_final()

    def executar_terminal(self):
        """Executa comandos Portulong diretamente no terminal mapeando escrever para print."""
        linhas = self.codigo_fonte.split("\n")
        namespace = {
            "escrever": print,
            "imprimir": print,
        }

        for linha in linhas:
            l = linha.strip()
            if not l or l.startswith("#"):
                continue

            # Mapear escrever(...) para print(...)
            if l.startswith("escrever(") or l.startswith("escrever "):
                cmd_py = "print" + l[8:]
                try:
                    exec(cmd_py, namespace)
                except Exception as e:
                    match = re.search(r'escrever\s*\((.*?)\)', l)
                    if match:
                        print(match.group(1).strip('"\''))
                    else:
                        print(f"Erro: {e}")
            elif l.startswith("imprimir(") or l.startswith("imprimir "):
                cmd_py = "print" + l[8:]
                try:
                    exec(cmd_py, namespace)
                except Exception as e:
                    match = re.search(r'imprimir\s*\((.*?)\)', l)
                    if match:
                        print(match.group(1).strip('"\''))
            elif "=" in l or l.startswith("def ") or l.startswith("import "):
                try:
                    exec(l, namespace)
                except Exception:
                    pass

    def _salvar_bloco(self, secao, conteudo):
        if secao.startswith("rota_"):
            partes = secao.replace("rota_", "").split("_", 1)
            metodo = partes[0]
            caminho = "/" + partes[1].replace("_", "/") if len(partes) > 1 else "/"
            self.rotas[caminho] = {
                "metodo": metodo,
                "codigo": "\n".join(conteudo)
            }

    def _processar_elemento(self, linha):
        if linha.startswith("cabecalho ") or linha.startswith("titulo1 "):
            texto = re.sub(r'^(cabecalho|titulo1)\s+', '', linha).strip().strip('"\'')
            self.elementos.append(f"<h1>{texto}</h1>")
        elif linha.startswith("titulo2 "):
            texto = linha.replace("titulo2 ", "").strip().strip('"\'')
            self.elementos.append(f"<h2>{texto}</h2>")
        elif linha.startswith("paragrafo ") or linha.startswith("texto "):
            texto = re.sub(r'^(paragrafo|texto)\s+', '', linha).strip().strip('"\'')
            self.elementos.append(f"<p>{texto}</p>")
        elif linha.startswith("botao "):
            partes = linha.replace("botao ", "").split(" acao ")
            texto = partes[0].strip().strip('"\'')
            acao = partes[1].strip().strip('"\'') if len(partes) > 1 else ""
            self.elementos.append(f"<button onclick=\"{acao}\">{texto}</button>")
        elif linha.startswith("campo ") or linha.startswith("input "):
            partes = linha.replace("campo ", "").replace("input ", "").strip().split()
            nome = partes[1] if len(partes) > 1 else partes[0]
            self.elementos.append(f"<input type='text' id='{nome}' placeholder='{nome}'>")
        elif linha.startswith("caixa ") or linha.startswith("div "):
            classe = re.sub(r'^(caixa|div)\s+', '', linha).strip().strip('"\'')
            self.elementos.append(f"<div class='{classe}'>")
        elif linha in ["fim_caixa", "fim_div"]:
            self.elementos.append("</div>")
        elif linha.startswith("lista "):
            id_lista = linha.replace("lista", "").replace(":", "").strip().strip('"\'')
            attr = f" id='{id_lista}'" if id_lista else ""
            self.elementos.append(f"<ul{attr}>")
        elif linha == "fim_lista":
            self.elementos.append("</ul>")
        elif linha.startswith("item "):
            txt = linha.replace("item ", "").strip().strip('"\'')
            self.elementos.append(f"<li>{txt}</li>")
        else:
            self.elementos.append(linha)

    def gerar_html_final(self):
        corpo = "\n".join(self.elementos)
        css = "\n".join(self.estilos)
        script = "\n".join(self.funcoes)
        return f"""<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <title>{self.titulo}</title>
    <style>{css}</style>
</head>
<body>
    {corpo}
    <script>{script}</script>
</body>
</html>"""

Empretador = PortulongCompilador

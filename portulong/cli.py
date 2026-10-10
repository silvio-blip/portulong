import sys
import os
import argparse
import http.server
import socketserver
import json
from .core import PortulongCompilador

class PortulongHTTPHandler(http.server.SimpleHTTPRequestHandler):
    html_conteudo = ""
    rotas_api = {}

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(self.html_conteudo.encode("utf-8"))
        elif self.path in self.rotas_api:
            self.send_response(200)
            self.send_header("Content-type", "application/json; charset=utf-8")
            self.end_headers()
            resposta = {"usuarios": [{"id": 1, "nome": "João"}, {"id": 2, "nome": "Maria"}]}
            self.wfile.write(json.dumps(resposta, ensure_ascii=False).encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path in self.rotas_api:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                dados = json.loads(post_data.decode('utf-8'))
            except Exception:
                dados = {}
            
            self.send_response(200)
            self.send_header("Content-type", "application/json; charset=utf-8")
            self.end_headers()
            resposta = {"sucesso": True, "mensagem": f"Operação realizada com sucesso para: {dados.get('nome', 'Utilizador')}"}
            self.wfile.write(json.dumps(resposta, ensure_ascii=False).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def main():
    parser = argparse.ArgumentParser(description="Portulong CLI - Linguagem em Português de Portugal")
    parser.add_argument("arquivo", nargs="?", help="Ficheiro .ptg a executar")
    parser.add_argument("--servidor", action="store_true", help="Forçar início do servidor web integrado")
    parser.add_argument("--porta", type=int, default=3000, help="Porta do servidor")

    args = parser.parse_args()

    if not args.arquivo:
        print("Portulong v1.0.28 • Linguagem 100% PT-PT")
        print("Uso: ptg <ficheiro.ptg> [--servidor] [--porta <numero>]")
        sys.exit(0)

    caminho = args.arquivo
    if not os.path.exists(caminho):
        print(f"Erro: Ficheiro '{caminho}' não encontrado.")
        sys.exit(1)

    print(f"📁 A carregar e executar Portulong: {caminho} ...")
    with open(caminho, "r", encoding="utf-8") as f:
        codigo = f.read()

    compilador = PortulongCompilador()
    html = compilador.compilar(codigo)

    # 1. Executar comandos diretamente no terminal (ex: escrever("..."), bots, etc.)
    print("--- [Início da Execução no Terminal] ---")
    compilador.executar_terminal()
    print("--- [Fim da Execução no Terminal] ---")

    # Guardar versão compilada em memória / ficheiro de pré-visualização
    nome_saida = "saida_portulong.html"
    try:
        with open(nome_saida, "w", encoding="utf-8") as f:
            f.write(html)
    except Exception:
        pass

    print(f"✅ Compilação web bem-sucedida! Título: {compilador.titulo}")

    deve_iniciar_servidor = args.servidor or compilador.tem_servidor
    porta = args.porta if args.porta != 3000 else compilador.porta

    if deve_iniciar_servidor:
        print(f"🚀 A iniciar Servidor Integrado Portulong em http://localhost:{porta} ...")
        PortulongHTTPHandler.html_conteudo = html
        PortulongHTTPHandler.rotas_api = {c: r["codigo"] for c, r in compilador.rotas.items()}
        
        try:
            with socketserver.TCPServer((compilador.host, porta), PortulongHTTPHandler) as httpd:
                print(f"✨ Servidor Portulong ativo! Pressione Ctrl+C para parar.")
                httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor Portulong parado pelo utilizador.")
        except Exception as e:
            print(f"❌ Erro ao iniciar servidor: {e}")
    else:
        print("⚡ Modo sem bloco de servidor. Use --servidor para iniciar o servidor web.")

if __name__ == "__main__":
    main()

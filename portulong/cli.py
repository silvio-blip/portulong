import sys
import os
import argparse
import http.server
import socketserver
import json
from .core import Empretador, PortulongCompilador

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
        print("Portulong v1.0.32 • Linguagem 100% PT-PT")
        print("Uso: ptg <ficheiro.ptg> [--servidor] [--porta <numero>]")
        print("     ptg config      (configura ambiente, cores, ícones e VS Code)")
        print("     ptg instalar    (instala dependências e pacotes como Discord)")
        print("     ptg ajuda       (mostra o manual e comandos disponíveis)")
        print("     ptg atualizar   (atualiza a linguagem Portulong)")
        print("     ptg remover     (limpa configurações)")
        sys.exit(0)

    cmd = args.arquivo.lower()

    if cmd in ["config", "configurar"]:
        from . import vscode
        vscode.configurar_vscode()
        print("✨ Portulong configurado com sucesso! Cores, ícones e snippets ativados.")
        sys.exit(0)

    if cmd in ["instalar", "install"]:
        from . import instalador
        if len(sys.argv) > 2 and "discord" in sys.argv[2].lower():
            instalador.instalar_discord()
        else:
            instalador.instalar_tudo()
        sys.exit(0)

    if cmd in ["ajuda", "help", "manual"]:
        print("""
📖 Manual Oficial do Portulong v1.0.32 (100% PT-PT)
--------------------------------------------------
Comandos CLI:
  ptg <ficheiro.ptg>          Executa e interpreta um ficheiro .ptg
  ptg <ficheiro.ptg> --servidor  Inicia o servidor web integrado
  ptg config                  Configura ícones, cores e editor VS Code
  ptg instalar [discord]      Instala dependências automaticamente
  ptg ajuda                   Exibe este manual

Sintaxe Básica (.ptg):
  escrever("Olá mundo")       Escreve no terminal (print)
  pagina "Meu Site"           Define o título da página web
  cabecalho "Título Principal" Cria um cabeçalho H1
  botao "Clique" acao "alerta()" Cria um botão interativo
  enquanto x <= 10:           Loop de repetição
      interromper             Para o loop (break)
  se condicao: ... senao:     Condicional
  importar discord            Importa biblioteca do Discord
  importar ambiente           Importa variáveis de ambiente (.env)
  importar base_dados         Importa banco de dados e Supabase
        """)
        sys.exit(0)

    if cmd in ["atualizar", "update"]:
        print("🔄 A verificar e a atualizar para a versão mais recente do Portulong (v1.0.32)...")
        import subprocess
        # Força a reinstalação para garantir que a versão mais recente do PyPI seja puxada
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "--force-reinstall", "portulong-sistema"], check=True)
        print("✅ Portulong atualizado com sucesso!")
        sys.exit(0)

    if cmd in ["remover", "uninstall"]:
        print("🧹 A limpar configurações e cache do Portulong...")
        import shutil
        if os.path.exists(".vscode"):
            shutil.rmtree(".vscode")
        print("✅ Portulong limpo com sucesso.")
        sys.exit(0)

    caminho = args.arquivo
    if not os.path.exists(caminho):
        print(f"Erro: Ficheiro '{caminho}' não encontrado.")
        sys.exit(1)

    print(f"📁 A carregar e executar Portulong: {caminho} ...")
    with open(caminho, "r", encoding="utf-8") as f:
        codigo = f.read()

    empretador = Empretador()
    html = empretador.empretar(codigo)

    # Executar comandos diretamente no terminal (ex: escrever("..."), bots, etc.)
    empretador.executar_terminal()

    deve_iniciar_servidor = args.servidor or empretador.tem_servidor
    porta = args.porta if args.porta != 3000 else empretador.porta

    if deve_iniciar_servidor:
        print(f"🚀 A iniciar Servidor Integrado Portulong em http://localhost:{porta} (100% em memória RAM) ...")
        PortulongHTTPHandler.html_conteudo = html
        PortulongHTTPHandler.rotas_api = {c: r["codigo"] for c, r in empretador.rotas.items()}
        
        try:
            with socketserver.TCPServer((empretador.host, porta), PortulongHTTPHandler) as httpd:
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

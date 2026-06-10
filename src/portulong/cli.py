"""
CLI oficial da linguagem Portulong para controle de execução e criação de templates.
"""

import sys
import os
import argparse
from .transpilador import transpilar_codigo

def executar_arquivo(caminho_arquivo):
    """
    Transpila e executa o arquivo de extensão .ptg
    """
    if not os.path.exists(caminho_arquivo):
        print(f"❌ Erro: O arquivo '{caminho_arquivo}' não foi encontrado.")
        sys.exit(1)
        
    with open(caminho_arquivo, "r", encoding="utf-8") as f:
        conteudo_ptg = f.read()
        
    # Transpila para código Python nativo executável
    codigo_py = transpilar_codigo(conteudo_ptg)
    
    # Adiciona o diretório do script executado à lista de imports do Python
    sys.path.insert(0, os.path.dirname(os.path.abspath(caminho_arquivo)))
    
    # Adiciona o contêiner raiz do portulong ao caminho geral do sistema
    diretorio_portulong = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if diretorio_portulong not in sys.path:
        sys.path.insert(0, diretorio_portulong)
        
    # Executa o código sob o namespace do main
    try:
        exec(codigo_py, {"__name__": "__main__"})
    except Exception as e:
        print("❌ Ocorreu um erro durante a execução do robô:")
        raise e

def iniciar_projeto():
    """
    Cria os arquivos de base para um início rápido
    """
    print("🐉 Inicializando projeto de bot em Portulong...")
    
    codigo_template = """# Exemplo de bot de Boas-vindas em Portulong
# Arquivo: main.ptg

importar portulong.discord_pt como discordia

# Inicializa o bot com o prefixo '!'
robo = discordia.Robo(prefixo="!")

# Evento ativado quando o robô se conecta
@robo.evento
definir assincrono ao_iniciar():
    escrever(f"Robô conectado com sucesso como {robo.usuario}! 🚀")

# Comando simples !ping
@robo.comando(nome="ping")
definir assincrono resposta_ping(contexto):
    aguardar contexto.enviar("🏓 Pong! O bot está rodando perfeitamente em Portulong.")

# Substitua com o token real do seu bot
token = "SEU_TOKEN_AQUI"
se token != "SEU_TOKEN_AQUI":
    robo.run(token)
senao:
    escrever("❌ configure seu Token do bot Discord no arquivo main.ptg")
"""
    
    if os.path.exists("main.ptg"):
        print("⚠️ O arquivo 'main.ptg' já existe. Criação pulada.")
    else:
        with open("main.ptg", "w", encoding="utf-8") as f:
            f.write(codigo_template)
        print("✅ Arquivo de teste 'main.ptg' criado com sucesso!")
        
    # Arquivo .env
    env_content = "# Token de Acesso do seu Bot Discord\nDISCORD_TOKEN=Insira_Seu_Token_Aqui\n"
    if os.path.exists(".env"):
        print("⚠️ O arquivo '.env' já existe. Criação pulada.")
    else:
        with open(".env", "w", encoding="utf-8") as f:
            f.write(env_content)
        print("✅ Arquivo confidencial '.env' criado com sucesso!")
        
    print("\n💡 Pronto! Digite o seguinte comando para testar:")
    print("   portulong executar main.ptg")

def main():
    parser = argparse.ArgumentParser(
        description="🐉 CLI oficial da linguagem Portulong para bots do Discord em português.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="comando", help="Comando a ser executado")
    
    # Subcomando: executar
    parser_executar = subparsers.add_parser("executar", help="Transpila e executa um arquivo .ptg")
    parser_executar.add_argument("arquivo", type=str, nargs="?", help="Caminho do arquivo .ptg para executar")
    
    # Subcomando: iniciar
    subparsers.add_parser("iniciar", help="Inicializa um novo projeto com o template de bot")
    
    # Pasta raiz como script direto
    parser.add_argument("arquivo_direto", type=str, nargs="?", help="Executa o arquivo .ptg diretamente")
    
    args = parser.parse_args()
    
    if args.comando == "iniciar" or args.arquivo_direto == "iniciar":
        iniciar_projeto()
    elif args.comando == "executar":
        if not args.arquivo:
            print("❌ Erro: Forneça o arquivo .ptg para executar. Ex: portulong executar main.ptg")
            sys.exit(1)
        executar_arquivo(args.arquivo)
    elif args.arquivo_direto:
        executar_arquivo(args.arquivo_direto)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

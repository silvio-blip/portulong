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

importar portulong.discord_pt como discord

# Inicializa o bot com o prefixo '!'
robo = discord.Robo(prefixo="!")

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

def exibir_ajuda():
    print("🐉 CLI oficial da linguagem Portulong para bots do Discord em português.\n")
    print("Uso:")
    print("   portulong iniciar              - Inicializa um novo projeto com o template de bot")
    print("   portulong instalar             - Descarrega e instala de forma autónoma as extensões, cores e complementos de sistema com sincronização instantânea")
    print("   portulong atualizar            - Força a atualização imediata da linguagem, extensões, configurações e sintaxes locais")
    print("   portulong desinstalar          - Remove completamente as extensões, arquivos de persistência e perfis de shell")
    print("   portulong eliminar             - Atalho para desinstalar completamente todos os recursos locais")
    print("   portulong executar <arq.ptg>   - Transpila e executa o arquivo")
    print("   portulong <arq.ptg>            - Executa o arquivo diretamente")

def ajustar_profiles_shell(instalar=True):
    """
    Gerencia as variáveis de ambiente nos perfis do shell de forma elegante,
    adicionando ou removendo de forma 100% segura sem corromper outros elementos do usuário.
    """
    home = os.path.expanduser("~")
    portulong_dir = os.path.join(home, ".portulong")
    
    profiles = [
        os.path.join(home, ".bashrc"),
        os.path.join(home, ".zshrc"),
        os.path.join(home, ".bash_profile"),
        os.path.join(home, ".profile")
    ]
    
    marca_inicio = "# >>> portulong >>>"
    marca_fim = "# <<< portulong <<<"
    
    bloco_conteudo = f"""{marca_inicio}
export PORTULONG_HOME="{portulong_dir}"
export PATH="$PORTULONG_HOME:$PATH"
{marca_fim}"""

    for prof in profiles:
        if not instalar and not os.path.exists(prof):
            continue
            
        conteudo = ""
        if os.path.exists(prof):
            try:
                with open(prof, "r", encoding="utf-8") as f:
                    conteudo = f.read()
            except Exception:
                continue
                
        # Limpar bloco existente anterior se houver
        if marca_inicio in conteudo and marca_fim in conteudo:
            linhas = conteudo.split("\n")
            novas_linhas = []
            pulando = False
            for linha in linhas:
                if linha.strip() == marca_inicio:
                    pulando = True
                    continue
                if linha.strip() == marca_fim:
                    pulando = False
                    continue
                if not pulando:
                    novas_linhas.append(linha)
            conteudo = "\n".join(novas_linhas).strip() + "\n"
            
        if instalar:
            conteudo = conteudo.strip() + "\n\n" + bloco_conteudo + "\n"
            
        try:
            with open(prof, "w", encoding="utf-8") as f:
                f.write(conteudo)
        except Exception:
            pass

def gerenciar_vscode_settings(registrar=True):
    """
    Configura ou limpa as configurações no settings.json local para forçar a sincronização
    das extensões e associação de sintaxe imediatamente na janela ativa da IDE sem recarga.
    """
    import json
    vscode_dir = ".vscode"
    settings_path = os.path.join(vscode_dir, "settings.json")
    
    if registrar:
        try:
            os.makedirs(vscode_dir, exist_ok=True)
            settings_data = {}
            if os.path.exists(settings_path):
                try:
                    with open(settings_path, "r", encoding="utf-8") as sf:
                        settings_data = json.load(sf)
                except Exception:
                    pass

            if "files.associations" not in settings_data:
                settings_data["files.associations"] = {}
            settings_data["files.associations"]["*.ptg"] = "portulong"
            
            with open(settings_path, "w", encoding="utf-8") as sf:
                json.dump(settings_data, sf, indent=4, ensure_ascii=False)
        except Exception:
            pass
    else:
        if os.path.exists(settings_path):
            try:
                with open(settings_path, "r", encoding="utf-8") as sf:
                    settings_data = json.load(sf)
                if "files.associations" in settings_data:
                    if "*.ptg" in settings_data["files.associations"]:
                        del settings_data["files.associations"]["*.ptg"]
                        if not settings_data["files.associations"]:
                            del settings_data["files.associations"]
                if settings_data:
                    with open(settings_path, "w", encoding="utf-8") as sf:
                        json.dump(settings_data, sf, indent=4, ensure_ascii=False)
                else:
                    os.remove(settings_path)
                    if not os.listdir(vscode_dir):
                        os.rmdir(vscode_dir)
            except Exception:
                pass

def recarregar_arquivos_vscode():
    """
    Se o comando 'code' CLI do VS Code estiver presente, reabre os arquivos .ptg
    para forçar o editor e o VS Code Web/Codespaces ativo a carregar a nova gramática TextMate imediatamente.
    """
    import shutil
    import subprocess
    code_path = shutil.which("code")
    if code_path:
        for root, dirs, files in os.walk("."):
            if any(ignored in root for ignored in [".git", "node_modules", "portulong-vscode", ".portulong"]):
                continue
            for pf in files:
                if pf.endswith(".ptg"):
                    caminho_completo = os.path.join(root, pf)
                    try:
                        subprocess.run([code_path, caminho_completo], check=False, shell=os.name == 'nt')
                    except Exception:
                        pass

def eliminar_recursos():
    """
    Remove completamente a extensão do VS Code, o diretório de dados persistentes do Portulong (~/.portulong)
    e tenta desinstalar o pacote do pip se aplicável de forma totalmente transparente e 100% limpa.
    """
    import shutil
    import subprocess
    import sys
    
    print("⚡ [SISTEMA] Iniciando a desinstalação completa de recursos, cores e extensões do Portulong...")
    
    # 1. Desinstalar Extensão do VS Code
    code_path = shutil.which("code")
    if code_path:
        try:
            print("🔌 Removendo a extensão diretamente do VS Code...")
            subprocess.run([code_path, "--uninstall-extension", "silvio-blip.portulong-vscode"], check=False, shell=os.name == 'nt')
            print("✅ Suporte à linguagem Portulong removido do VS Code com sucesso!")
        except Exception as e:
            print(f"⚠️ Erro ao tentar remover a extensão VS Code automaticamente: {e}")
    else:
        print("💡 Nota: Comando 'code' não detetado no PATH do sistema. Salteando remoção automatizada do VS Code.")
        print("   Caso a extensão ainda conste no seu editor, desinstale manualmente no painel de Extensões.")

    # 2. Remover diretório ~/.portulong de dados persistentes
    portulong_dir = os.path.abspath(os.path.expanduser("~/.portulong"))
    if os.path.exists(portulong_dir):
        try:
            print(f"🗑️ Excluindo o diretório de persistência permanente: {portulong_dir}")
            shutil.rmtree(portulong_dir)
            print("✅ Diretório de dados persistentes eliminado com sucesso!")
        except Exception as e:
            print(f"❌ Erro ao remover diretório de persistência '{portulong_dir}': {e}")
            
    # 3. Remover diretório local temporário 'portulong-vscode' ou vsix se existirem no espaço atual
    for item in ["portulong-vscode", "instalar.py"]:
        if os.path.exists(item):
            try:
                if os.path.isdir(item):
                    shutil.rmtree(item)
                else:
                    os.remove(item)
                print(f"🧹 Resíduo local '{item}' limpo com sucesso.")
            except Exception:
                pass
                
    # Remover arquivos .vsix do diretório atual
    try:
        for fn in os.listdir("."):
            if fn.endswith(".vsix") and "portulong" in fn:
                try:
                    os.remove(fn)
                    print(f"🧹 Arquivo instalador residual '{fn}' removido.")
                except Exception:
                    pass
    except Exception:
        pass
        
    # 4. Remover associações locais do VS Code e limpar profiles do shell
    print("🧹 Restaurando os perfis do shell para o estado limpo...")
    ajustar_profiles_shell(instalar=False)
    gerenciar_vscode_settings(registrar=False)
    
    # Força o VS Code ativo a recarregar as gramáticas removendo o mapeamento de sintaxe
    recarregar_arquivos_vscode()
        
    # 5. Oferecer desinstalação do próprio pacote do pip
    try:
        print("📦 Desinstalando a biblioteca python 'portulong.ptg' pelo pip...")
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "portulong.ptg"], check=False)
        print("✅ Lib 'portulong.ptg' removida com êxito!")
    except Exception as e:
        print(f"⚠️ Erro ao tentar acionar o pip para desinstalar o pacote: {e}")
        
    print("\n🐉 [SUCESSO] Portulong foi completamente eliminado do seu dispositivo!")
    print("   Seu sistema retornou ao estado limpo original. Esperamos ver você de volta em breve!")

def instalar_recursos():
    """
    Baixa o script de instalação oficial e executa-o localmente a partir de um arquivo físico
    dentro do diretório definitivo de persistência do Portulong (~/.portulong) para garantir 
    a gravação de extensões, realces de cores e ícones de forma permanente e sem poluir o projeto.
    """
    import urllib.request
    import urllib.error
    import sys
    import os
    import subprocess
    
    print("⚡ [SISTEMA] Iniciando a instalação automática de cores, extensões e complementos do Portulong...")
    url = "https://portulong.vercel.app/api/instalar"
    
    # Define o diretório permanente local do Portulong
    portulong_dir = os.path.abspath(os.path.expanduser("~/.portulong"))
    temp_filename = os.path.join(portulong_dir, "instalar.py")
    
    try:
        # Garante a criação do diretório usando os.makedirs de forma definitiva
        os.makedirs(portulong_dir, exist_ok=True)
        
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            conteudo_script = response.read().decode('utf-8')
            
        print("📥 Script de automação recuperado com sucesso. Gravando em diretório pessoal permanente...")
        
        # Garante a persistência real gravando o instalador via 'open' de forma definitiva no local persistente
        with open(temp_filename, "w", encoding="utf-8") as f:
            f.write(conteudo_script)
            
        print(f"⚙️ Executando o motor de instalação integrado no diretório permanente: {portulong_dir}")
        
        # Configura as variáveis de ambiente necessárias para o subprocesso
        env_vars = os.environ.copy()
        env_vars["PORTULONG_HOME"] = portulong_dir
        if "PATH" in env_vars:
            # Garante que o diretório ~/.portulong e possíveis outros caminhos de execução estejam mapeados
            env_vars["PATH"] = portulong_dir + os.path.pathsep + env_vars["PATH"]
            
        # Executa o script gravado fisicamente em ~/.portulong/, alterando o diretório de trabalho (cwd) para lá.
        # Isto garante que todos os diretórios gerados (como portulong-vscode, gramáticas de cores, etc.)
        # fiquem fisicamente persistidos lá de forma real e independente, sem poluir a raiz do projeto do usuário.
        subprocess.run([sys.executable, temp_filename], cwd=portulong_dir, env=env_vars, check=True)
        
        # Garante sincronização imediata configurando perfis do shell e settings.json do workspace do VS Code
        print("🔌 Configurando variáveis de ambiente locais persistentes...")
        ajustar_profiles_shell(instalar=True)
        
        print("⚙️ Mapeando associações e realce de sintaxe em tempo real no VS Code...")
        gerenciar_vscode_settings(registrar=True)
        
        # Reabre os arquivos .ptg locais forçando o VS Code a redesenhar a fiação de sintaxe na janela ativa
        recarregar_arquivos_vscode()
        
        print("🐉 [SUCESSO] Instalação dos recursos e extensões concluída com êxito! Divirta-se programando!")
        
    except urllib.error.URLError as e:
        print("❌ [ERRO DE CONEXÃO] Não foi possível conectar ao servidor de recursos remoto para a instalação.")
        print("   Por favor, certifique-se de que o seu dispositivo está ligado à internet e tente novamente.")
    except subprocess.CalledProcessError as e:
        print(f"❌ [ERRO NA CONFIGURAÇÃO] Ocorreu uma interrupção ao executar o processo de instalação local (Código {e.returncode}).")
    except Exception as e:
        print("❌ [ERRO DE CONFIGURAÇÃO] Ocorreu uma exceção inesperada durante o carregamento de recursos:")
        print(f"   Detalhes: {e}")
        print("   Se o problema persistir, por favor descarregue os arquivos manualmente no portal oficial.")
    finally:
        # Tenta remover o arquivo instalar.py temporário da pasta de persistência do Portulong se já tiver concluído
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except Exception:
                pass

def main():
    if len(sys.argv) < 2:
        exibir_ajuda()
        sys.exit(0)
        
    cmd = sys.argv[1]
    
    if cmd in ("--ajuda", "-h", "help", "--help"):
        exibir_ajuda()
        sys.exit(0)
        
    if cmd == "iniciar":
        iniciar_projeto()
    elif cmd in ("instalar", "instalacao"):
        instalar_recursos()
    elif cmd in ("atualizar", "upgrade", "update", "atualizacao"):
        print("⚡ [SISTEMA] Iniciando a atualização forçada e integral de recursos do Portulong...")
        instalar_recursos()
    elif cmd in ("desinstalar", "eliminar", "remover", "sair", "desativar"):
        eliminar_recursos()
    elif cmd == "executar":
        if len(sys.argv) < 3:
            print("❌ Erro: Forneça o arquivo .ptg para executar. Ex: portulong executar main.ptg")
            sys.exit(1)
        executar_arquivo(sys.argv[2])
    else:
        # Se for qualquer outro argumento, assume-se que é o ficheiro a executar diretamente
        if cmd.endswith(".ptg") or os.path.exists(cmd):
            executar_arquivo(cmd)
        else:
            print(f"❌ Erro: Comando ou arquivo '{cmd}' não reconhecido.")
            exibir_ajuda()
            sys.exit(1)

if __name__ == "__main__":
    main()

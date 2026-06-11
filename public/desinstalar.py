import os
import sys
import subprocess
import shutil

def info(msg):
    print(f"\033[1;34m[*] {msg}\033[0m")

def success(msg):
    print(f"\033[1;32m[+] {msg}\033[0m")

def warn(msg):
    print(f"\033[1;33m[!] {msg}\033[0m")

def main():
    print("="*60)
    print("   DESINSTALADOR COMPLETO DO PORTULONG E DA EXTENSÃO VS CODE")
    print("="*60)

    # 1. Desinstalar pacotes do pip
    info("1/3. Desinstalando linguagens e bibliotecas Python instaladas...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "portulong.ptg"], check=False)
        success("Pacote 'portulong.ptg' desinstalado do pip com sucesso!")
    except Exception as e:
        warn(f"Erro ao desinstalar 'portulong.ptg' pelo pip: {e}")

    # 2. Desinstalar Extensão do VS Code
    info("2/3. Removendo a extensão diretamente do VS Code...")
    code_path = shutil.which("code")
    if code_path:
        try:
            subprocess.run([code_path, "--uninstall-extension", "silvio-blip.portulong-vscode"], check=True, shell=os.name == 'nt')
            success("Suporte à linguagem Portulong removido do VS Code com sucesso!")
        except Exception as e:
            warn(f"Erro ao pedir remoção automática da extensão ao comando 'code': {e}")
    else:
        info("Aviso: Comando 'code' não detetado no terminal. Se estiver na sua máquina local,")
        print("  abra as extensões no VS Code, procure por 'Portulong support' e clique em 'Desinstalar'.")

    # 3. Remover diretórios locais gerados pelo instalador
    info("3/3. Eliminando diretórios locais de compilação da extensão...")
    ext_dir = "portulong-vscode"
    if os.path.exists(ext_dir):
        try:
            shutil.rmtree(ext_dir)
            success(f"Diretório temporário '{ext_dir}' apagado com absoluto êxito!")
        except Exception as e:
            warn(f"Durante a eliminação da pasta '{ext_dir}': {e}")
            
    # Remove qualquer vsix gerado
    curr_files = os.listdir(".")
    for fn in curr_files:
        if fn.endswith(".vsix") and "portulong" in fn:
            try:
                os.remove(fn)
                success(f"Instalador empacotado '{fn}' destruído com sucesso!")
            except Exception:
                pass

    print("\n\033[1;32m============================================================")
    print("   DESINSTALADO COM SUCESSO! SEU AMBIENTE RETORNOU AO ORIGINAL")
    print("============================================================\033[0m\n")

if __name__ == "__main__":
    main()

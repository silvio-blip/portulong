"""
Módulo Base de Dados e Supabase Portulong
100% em Português de Portugal para integração com bases de dados e Supabase.
"""

import json
import os
import urllib.request
import urllib.error

class ClienteSupabase:
    """Cliente nativo para conectar ao Supabase usando sintaxe 100% em Português."""
    def __init__(self, url, chave):
        self.url = url.rstrip("/")
        self.chave = chave
        self.cabecalhos = {
            "apikey": self.chave,
            "Authorization": f"Bearer {self.chave}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def tabela(self, nome_tabela):
        """Retorna um objeto de consulta para a tabela especificada."""
        return ConsultaTabela(self.url, nome_tabela, self.cabecalhos)

    def de(self, nome_tabela):
        """Alias em português: supabase.de('utilizadores')"""
        return self.tabela(nome_tabela)

class ConsultaTabela:
    def __init__(self, url_base, tabela, cabecalhos):
        self.url = f"{url_base}/rest/v1/{tabela}"
        self.cabecalhos = cabecalhos

    def selecionar(self, colunas="*"):
        """Executa um GET para buscar dados da tabela."""
        url = f"{self.url}?select={colunas}"
        req = urllib.request.Request(url, headers=self.cabecalhos)
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            return {"erro": str(e)}

    def inserir(self, dados):
        """Executa um POST para inserir um novo registo."""
        corpo = json.dumps(dados).encode("utf-8")
        req = urllib.request.Request(self.url, data=corpo, headers=self.cabecalhos, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            return {"erro": str(e)}

    def atualizar(self, id_registo, dados):
        """Executa um PATCH para atualizar um registo."""
        url = f"{self.url}?id=eq.{id_registo}"
        corpo = json.dumps(dados).encode("utf-8")
        req = urllib.request.Request(url, data=corpo, headers=self.cabecalhos, method="PATCH")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            return {"erro": str(e)}

    def apagar(self, id_registo):
        """Executa um DELETE para remover um registo."""
        url = f"{self.url}?id=eq.{id_registo}"
        req = urllib.request.Request(url, headers=self.cabecalhos, method="DELETE")
        try:
            with urllib.request.urlopen(req) as resp:
                return {"sucesso": True}
        except Exception as e:
            return {"erro": str(e)}

def conectar_supabase(url, chave):
    """Função em português para instanciar a conexão Supabase."""
    return ClienteSupabase(url, chave)

class BaseDadosMemoria:
    """Base de dados em memória e ficheiro JSON para persistência simples."""
    def __init__(self, arquivo="dados_portulong.json"):
        self.arquivo = arquivo
        self.tabelas = {}
        self.carregar()

    def carregar(self):
        if os.path.exists(self.arquivo):
            try:
                with open(self.arquivo, "r", encoding="utf-8") as f:
                    self.tabelas = json.load(f)
            except Exception:
                self.tabelas = {}

    def guardar(self):
        try:
            with open(self.arquivo, "w", encoding="utf-8") as f:
                json.dump(self.tabelas, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Aviso base de dados: {e}")

    def obter(self, tabela, id_registo=None):
        dados_tabela = self.tabelas.get(tabela, [])
        if id_registo is not None:
            for r in dados_tabela:
                if r.get("id") == id_registo:
                    return r
            return None
        return dados_tabela

    def inserir(self, tabela, registo):
        if tabela not in self.tabelas:
            self.tabelas[tabela] = []
        dados_tabela = self.tabelas[tabela]
        if "id" not in registo:
            registo["id"] = len(dados_tabela) + 1
        dados_tabela.append(registo)
        self.guardar()
        return registo

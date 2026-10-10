import json
import os

class BaseDadosMemoria:
    """Simulador de base de dados em memória para aplicações Portulong."""
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
            print(f"Aviso ao guardar base de dados: {e}")

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

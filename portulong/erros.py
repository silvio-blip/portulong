class PortulongErro(Exception):
    """Classe base para erros da linguagem Portulong."""
    pass

class ErroSintaxe(PortulongErro):
    """Erro de sintaxe no código Portulong (.ptg)."""
    def __init__(self, mensagem, linha=None):
        self.mensagem = mensagem
        self.linha = linha
        super().__init__(f"Erro de Sintaxe (linha {linha}): {mensagem}" if linha else f"Erro de Sintaxe: {mensagem}")

class ErroServidor(PortulongErro):
    """Erro ao iniciar ou executar o servidor Portulong."""
    pass

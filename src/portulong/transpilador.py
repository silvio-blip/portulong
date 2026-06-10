"""
Mecanismo de transpilação que converte código Portulong para código Python equivalente.
"""

import re
from .core_keywords import KEYWORDS_MAP, BUILTINS_MAP, DISCORD_MAP

def transpilar_codigo(codigo_fonte: str) -> str:
    """
    Traduz o código Portulong (.ptg) para Python (.py) protegendo Strings e Comentários.
    """
    strings = []
    comments = []
    
    # 1. Proteger strings multilaterais de aspas triplas
    def salvar_aspas_triplas(m):
        strings.append(m.group(0))
        return f"__TRIPLE_STR_PLACEHOLDER_{len(strings)-1}__"
    
    processed = re.sub(r'"""[\s\S]*?"""', salvar_aspas_triplas, codigo_fonte)
    processed = re.sub(r"'''[\s\S]*?'''", salvar_aspas_triplas, processed)
    
    # 2. Proteger strings compostas padrões de aspas simples/duplas
    def salvar_string(m):
        strings.append(m.group(0))
        return f"__STR_PLACEHOLDER_{len(strings)-1}__"
    
    processed = re.sub(r'"([^"\\\\]|\\\\.)*"', salvar_string, processed)
    processed = re.sub(r"'([^'\\\\]|\\\\.)*'", salvar_string, processed)
    
    # 3. Proteger os comentários (linhas iniciadas por #)
    def salvar_comentario(m):
        comments.append(m.group(0))
        return f"__COM_PLACEHOLDER_{len(comments)-1}__"
    
    processed = re.sub(r'#.*', salvar_comentario, processed)
    
    # Unir todos os mapeamentos para substituição
    mapeamento_completo = {}
    mapeamento_completo.update(KEYWORDS_MAP)
    mapeamento_completo.update(BUILTINS_MAP)
    mapeamento_completo.update(DISCORD_MAP)
    
    # Ordenar chaves pelo tamanho de forma decrescente para não quebrar prefixos
    chaves_ordenadas = sorted(mapeamento_completo.keys(), key=len, reverse=True)
    
    # 4. Substituir palavras-chave usando limites de fronteira de palavra (\b)
    for chave in chaves_ordenadas:
        valor = mapeamento_completo[chave]
        chave_escapada = re.escape(chave)
        # Regex delimitando palavras idênticas
        regex_fronteira = rf'\b{chave_escapada}\b'
        processed = re.sub(regex_fronteira, valor, processed)
        
    # 5. Restaurar os comentários originais de trás para frente
    for i in reversed(range(len(comments))):
        processed = processed.replace(f"__COM_PLACEHOLDER_{i}__", comments[i])
         
    # 6. Restaurar as strings originais de trás para frente
    for i in reversed(range(len(strings))):
        processed = processed.replace(f"__STR_PLACEHOLDER_{i}__", strings[i])
        processed = processed.replace(f"__TRIPLE_STR_PLACEHOLDER_{i}__", strings[i])
         
    return processed

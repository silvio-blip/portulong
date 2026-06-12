import io
import re
import tokenize
from .core_keywords import KEYWORDS_MAP, BUILTINS_MAP

def pre_processar_code(codigo_fonte: str) -> str:
    """
    Blindagem absoluta: Corrige estrutura 'definir assincrono' para 'async def'
    antes de qualquer tokenização.
    """
    strings = []
    comments = []
    
    # 1. Proteger estruturas
    def salvar(m, arr, prefijo):
        arr.append(m.group(0))
        return f"__{prefijo}_{len(arr)-1}__"
    
    processed = re.sub(r'"""[\s\S]*?"""|''' + "'''|'[^']*'|\"[^\"]*\"", lambda m: salvar(m, strings, 'STR'), codigo_fonte)
    processed = re.sub(r'#.*', lambda m: salvar(m, comments, 'COM'), processed)
    
    # 2. Blindagem de Async
    processed = re.sub(r'\b(definir|funcao)\s+assincrono\b', 'async def', processed)
    processed = re.sub(r'\bassincrono\s+(definir|funcao)\b', 'async def', processed)
    
    # 3. Restaurar
    for i in reversed(range(len(comments))):
        processed = processed.replace(f"__COM_{i}__", comments[i])
    for i in reversed(range(len(strings))):
        processed = processed.replace(f"__STR_{i}__", strings[i])
        
    return processed

def transpilar_codigo(codigo_fonte: str) -> str:
    codigo_fonte = pre_processar_code(codigo_fonte)
    
    # Substituição final em tokens NAME usando KEYWORDS_MAP e BUILTINS_MAP
    def substituir_nome(tok_str):
        if tok_str in KEYWORDS_MAP: return KEYWORDS_MAP[tok_str]
        if tok_str in BUILTINS_MAP: return BUILTINS_MAP[tok_str]
        return tok_str
        
    tokens = tokenize.generate_tokens(io.StringIO(codigo_fonte).readline)
    
    transpilado = ""
    for tok_type, tok_str, start, end, line in tokens:
        if tok_type == tokenize.NAME:
            transpilado += substituir_nome(tok_str)
        else:
            transpilado += tok_str
            
    return transpilado

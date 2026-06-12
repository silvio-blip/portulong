import re
from .core_keywords import KEYWORDS_MAP, BUILTINS_MAP

def transpilar_codigo(codigo_fonte: str) -> str:
    strings = []
    comments = []
    def salvar_str(m):
        strings.append(m.group(0))
        return f"__STR_{len(strings)-1}__"
    def salvar_com(m):
        comments.append(m.group(0))
        return f"__COM_{len(comments)-1}__"
        
    regex_strings = r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"[^"\\]*(?:\\.[^"\\]*)*"|\'[^\'\\]*(?:\\.[^\'\\]*)*\''
    processed = re.sub(regex_strings, salvar_str, codigo_fonte)
    
    processed = re.sub(r'#.*', salvar_com, processed)
    
    processed = re.sub(r'\b(definir|funcao)\s+assincrono\b', 'async def', processed)
    processed = re.sub(r'\bassincrono\s+(definir|funcao)\b', 'async def', processed)
    processed = re.sub(r'\bassincrono\s+com\b', 'async with', processed)
    processed = re.sub(r'\bassincrono\s+para\b', 'async for', processed)
    
    full_map = {**KEYWORDS_MAP, **BUILTINS_MAP}
    sorted_keys = sorted(full_map.keys(), key=len, reverse=True)
    
    for key in sorted_keys:
        val = full_map[key]
        pattern = r'\b' + re.escape(key) + r'\b'
        processed = re.sub(pattern, val, processed)
        
    for i in reversed(range(len(comments))):
        processed = processed.replace(f"__COM_{i}__", comments[i])
    for i in reversed(range(len(strings))):
        processed = processed.replace(f"__STR_{i}__", strings[i])
        
    return processed
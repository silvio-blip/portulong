import re
from .core_keywords import KEYWORDS_MAP, BUILTINS_MAP, DISCORD_MAP

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
    
    # 2. Interceptar e mapear os imports do discord padrão para o wrapper em português
    processed = re.sub(r'\b(importar|import)\s+discord\b', 'import portulong.discord_pt as discord', processed)
    processed = re.sub(r'\b(de|from)\s+discord\.ext\s+(importar|import)\s+commands\b', 'from portulong.discord_pt import commands', processed)
    processed = re.sub(r'\b(de|from)\s+discord\s+(importar|import)\s+ui\b', 'from portulong.discord_pt import ui', processed)

    # 3. Corrigir estrutura assíncrona de forma robusta
    processed = re.sub(r'\b(definir|funcao|def)\s+(assincrono|async)\b', 'async def', processed, flags=re.IGNORECASE)
    processed = re.sub(r'\b(assincrono|async)\s+(com)\b', 'async with', processed, flags=re.IGNORECASE)
    processed = re.sub(r'\b(assincrono|async)\s+(para)\b', 'async for', processed, flags=re.IGNORECASE)
    
    full_map = {**KEYWORDS_MAP, **BUILTINS_MAP, **DISCORD_MAP}
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
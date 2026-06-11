"""
Mecanismo de transpilação que converte código Portulong para código Python equivalente.
Utiliza análise léxica (Tokenization) matemática para tradução precisa dos identificadores,
evitando alterações indevidas dentro de strings ou comentários e permitindo reordenação estrutural.
"""

import io
import re
import tokenize
from .core_keywords import KEYWORDS_MAP, BUILTINS_MAP

def transpilar_fallback(codigo_fonte: str) -> str:
    """
    Traduz o código Portulong de forma resiliente baseada em regex.
    Usado como fallback em casos de erros sintáticos temporários enquanto o usuário digita.
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
    
    # 4. Correções explícitas antes de traduzir palavras-chave individuais
    processed = processed.replace("definir assincrono", "async def")
    processed = processed.replace("funcao assincrono", "async def")
    processed = re.sub(r'\b(definir|funcao)\s+assincrono\b', 'async def', processed)

    # Unir todos os mapeamentos para substituição
    mapeamento_completo = {}
    mapeamento_completo.update(KEYWORDS_MAP)
    mapeamento_completo.update(BUILTINS_MAP)
    
    # Ordenar chaves pelo tamanho de forma decrescente para não quebrar prefixos
    chaves_ordenadas = sorted(mapeamento_completo.keys(), key=len, reverse=True)
    
    # 5. Substituir palavras-chave usando limites de fronteira de palavra (\b)
    for chave in chaves_ordenadas:
        valor = mapeamento_completo[chave]
        chave_escapada = re.escape(chave)
        regex_fronteira = rf'\b{chave_escapada}\b'
        processed = re.sub(regex_fronteira, valor, processed)
        
    # 6. Restaurar os comentários originais de trás para frente
    for i in reversed(range(len(comments))):
        processed = processed.replace(f"__COM_PLACEHOLDER_{i}__", comments[i])
         
    # 7. Restaurar as strings originais de trás para frente
    for i in reversed(range(len(strings))):
        processed = processed.replace(f"__STR_PLACEHOLDER_{i}__", strings[i])
        processed = processed.replace(f"__TRIPLE_STR_PLACEHOLDER_{i}__", strings[i])
         
    return processed


def reconstruct_from_tokens(modified_tokens) -> str:
    """
    Reconstrói o código fonte a partir dos tokens modificados, aplicando deslocamentos
    matemáticos de colunas de forma a preservar os espaçamentos e a indentação originais.
    """
    out = []
    curr_row = 1
    curr_col = 0
    curr_row_offset = 0
    
    for tok_type, tok_str, start, end, orig_len in modified_tokens:
        row, col = start
        
        # Resetar offset se mudamos de linha
        if row > curr_row:
            curr_row_offset = 0
            
        # Calcular coluna de destino aplicando desvio acumulado na linha atual
        target_col = max(0, col + curr_row_offset)
        
        # Adicionar novas linhas necessárias
        while curr_row < row:
            out.append("\n")
            curr_row += 1
            curr_col = 0
            curr_row_offset = 0
            
        # Alinhar horizontalmente por meio de espaços
        if curr_col < target_col:
            out.append(" " * (target_col - curr_col))
            curr_col = target_col
            
        # Escrever conteúdo do token traduzido
        out.append(tok_str)
        
        # Atualizar desvio cumulativo para os próximos tokens da mesma linha
        len_diff = len(tok_str) - orig_len
        curr_row_offset += len_diff
        
        # Atualizar cursor do reconstrutor
        lines = tok_str.split("\n")
        if len(lines) > 1:
            curr_row += len(lines) - 1
            curr_col = len(lines[-1])
            curr_row_offset = 0
        else:
            curr_col += len(tok_str)
            
    return "".join(out)


def transpilar_codigo(codigo_fonte: str) -> str:
    """
    Transpila o código Portulong para Python via análise léxica (Tokenization).
    """
    # Garantir uma quebra de linha final para assegurar conformidade do gerador de tokens
    dados_entrada = codigo_fonte
    if not dados_entrada.endswith("\n"):
        dados_entrada += "\n"
        
    try:
        linhas = io.StringIO(dados_entrada)
        tokens = list(tokenize.generate_tokens(linhas.readline))
    except Exception:
        # Se ocorrer erro léxico temporário enquanto o usuário digita, aciona fallback
        return transpilar_fallback(codigo_fonte)
        
    modified_tokens = []
    i = 0
    n_tokens = len(tokens)
    
    while i < n_tokens:
        tok = tokens[i]
        tok_type = tok.type
        tok_str = tok.string
        
        # Padrão Especial: 'definir assincrono' / 'funcao assincrono' ou 'assincrono definir' / 'assincrono funcao' -> 'async def'
        is_async_def_pair = False
        if i + 1 < n_tokens and tok_type == tokenize.NAME and tokens[i+1].type == tokenize.NAME:
            next_tok = tokens[i+1]
            first_is_def = tok_str in ("definir", "funcao")
            second_is_async = next_tok.string == "assincrono"
            first_is_async = tok_str == "assincrono"
            second_is_def = next_tok.string in ("definir", "funcao")
            
            if (first_is_def and second_is_async) or (first_is_async and second_is_def):
                is_async_def_pair = True
                
        if is_async_def_pair:
            # Swapping semântico preciso: o primeiro token vira 'async', o segundo vira 'def'
            # Isso mantém a ordem de colunas e espaçamentos perfeitamente reconstituída
            modified_tokens.append((tokenize.NAME, "async", tok.start, tok.end, len(tok_str)))
            tok_next = tokens[i+1]
            modified_tokens.append((tokenize.NAME, "def", tok_next.start, tok_next.end, len(tok_next.string)))
            i += 2
            continue
            
        # Tradução estrutural apenas de tokens de identificação (NAME)
        if tok_type == tokenize.NAME:
            orig_len = len(tok_str)
            if tok_str in KEYWORDS_MAP:
                tok_str = KEYWORDS_MAP[tok_str]
            elif tok_str in BUILTINS_MAP:
                tok_str = BUILTINS_MAP[tok_str]
                
            modified_tokens.append((tok_type, tok_str, tok.start, tok.end, orig_len))
        else:
            # Manter quaisquer outros tokens idênticos (Strings, Comentários, Números, Operadores, etc.)
            modified_tokens.append((tok_type, tok_str, tok.start, tok.end, len(tok_str)))
            
        i += 1
        
    cod_transpilado = reconstruct_from_tokens(modified_tokens)
    
    # Remover o caractere extra adicionado caso tivéssemos inserido artificialmente no início
    if not codigo_fonte.endswith("\n") and cod_transpilado.endswith("\n"):
        cod_transpilado = cod_transpilado[:-1]
        
    return cod_transpilado

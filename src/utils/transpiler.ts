/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const KEYWORDS_MAP: Record<string, string> = {
  // Python Keywords
  "se": "if",
  "senao": "else",
  "senaose": "elif",
  "para": "for",
  "enquanto": "while",
  "definir": "def",
  "funcao": "def",
  "classe": "class",
  "importar": "import",
  "de": "from",
  "como": "as",
  "retornar": "return",
  "tentar": "try",
  "exceto": "except",
  "finalmente": "finally",
  "com": "with",
  "lambda": "lambda",
  "passar": "pass",
  "parar": "break",
  "continuar": "continue",
  "Verdadeiro": "True",
  "Falso": "False",
  "Nulo": "None",
  "e": "and",
  "ou": "or",
  "nao": "not",
  "em": "in",
  "eh": "is",
  "nao_eh": "is not",
  "asseverar": "assert",
  "global": "global",
  "naolocal": "nonlocal",
  "levantar": "raise",
  "produzir": "yield",
  "assincrono": "async",
  "aguardar": "await",
};

export const BUILTINS_MAP: Record<string, string> = {
  // Standard functions and types
  "escrever": "print",
  "mostrar": "print",
  "ler": "input",
  "tamanho": "len",
  "inteiro": "int",
  "texto": "str",
  "real": "float",
  "decimal": "float",
  "boleano": "bool",
  "lista": "list",
  "dicionario": "dict",
  "conjunto": "set",
  "tupla": "tuple",
  "intervalo": "range",
  "abrir": "open",
  "tipo": "type",
  "somar": "sum",
  "absoluto": "abs",
  "maximo": "max",
  "minimo": "min",
  "arredondar": "round",
  "mapear": "map",
  "filtrar": "filter",
  "ordenado": "sorted",
  "super": "super",
  "propriedade": "property",
  "zipar": "zip",
  "enumerar": "enumerate",
  "objeto": "object",
  "qualquer": "any",
  "todos": "all",
  "ajuda": "help",
  "identidade": "id",
  "reversivel": "reversed",
  "formatar": "format",
  "obter_atributo": "getattr",
  "definir_atributo": "setattr",
  "tem_atributo": "hasattr",
  "excluir_atributo": "delattr",
  "representacao": "repr",
  "proximo": "next",
  "iterador": "iter",
  "eh_instancia": "isinstance",
  "eh_subclasse": "issubclass",
  
  // Python Core Exceptions / Erros base
  "Excessao": "Exception",
  "ErroDeValor": "ValueError",
  "ErroDeTipo": "TypeError",
  "ErroDeNome": "NameError",
  "ErroDeIndice": "IndexError",
  "ErroDeChave": "KeyError",
  "ErroDeImportacao": "ImportError",
  "ErroDeAtributo": "AttributeError",
  "ErroDivisaoPorZero": "ZeroDivisionError",
  "FaltaDeMemoria": "MemoryError",
  "ParadaDeIteracao": "StopIteration",
  "ErroDoSistema": "OSError",
  "ArquivoNaoEncontrado": "FileNotFoundError",
  "InterrupcaoPeloTeclado": "KeyboardInterrupt",
  "ErroDeAsseveracao": "AssertionError",
  "ErroDeExecucao": "RuntimeError",
  "ErroNaoImplementado": "NotImplementedError",
};

// Object/Property and Method maps for Discord.py wrapper
export const DISCORD_MAP: Record<string, string> = {
  // Discord classes & helpers
  "Robo": "Bot",
  "prefixo": "command_prefix",
  "evento": "event",
  "comando": "command",
  "nome": "name",
  "ajuda": "help",
  
  // Method translations handled in transpile
  "enviar": "send",
  "responder": "reply",
  "deletar": "delete",
  "adicionar_reacao": "add_reaction",
  "remover_reacao": "remove_reaction",
  "expulsar": "kick",
  "banir": "ban",
  "limpar": "purge",

  // Properties
  "conteudo": "content",
  "autor": "author",
  "canal": "channel",
  "servidor": "guild",
  "mensagem": "message",
  "usuario": "user",
  "id": "id",
};

/**
 * Transpiles Portulong (.ptg) code to Python (.py) code
 * Protecting strings and comments from being modified.
 */
export function transpilePortulong(code: string): string {
  const strings: string[] = [];
  const comments: string[] = [];

  // 1. Temporarily extract triple quoted strings
  let processed = code.replace(/"""([\s\S]*?)"""/g, (match) => {
    strings.push(match);
    return `__TRIPLE_STR_PLACEHOLDER_${strings.length - 1}__`;
  });

  // 2. Temporarily extract double/single quoted strings
  processed = processed.replace(/"([^"\\]|\\.)*"/g, (match) => {
    strings.push(match);
    return `__STR_PLACEHOLDER_${strings.length - 1}__`;
  });
  processed = processed.replace(/'([^'\\]|\\.)*'/g, (match) => {
    strings.push(match);
    return `__STR_PLACEHOLDER_${strings.length - 1}__`;
  });

  // 3. Temporarily extract single-line comments
  processed = processed.replace(/#.*/g, (match) => {
    comments.push(match);
    return `__COM_PLACEHOLDER_${comments.length - 1}__`;
  });

  // Pre-process decorators to python style
  processed = processed.replace(/@(robo|cliente|bot|client)\.(evento|event)\b/g, "@bot.event");
  processed = processed.replace(/@(robo|cliente|bot|client)\.(comando|command)\b/g, "@bot.command");

  // Intercept and map standard discord imports to wrapper in Portuguese
  processed = processed.replace(/\b(importar|import)\s+discord\b/g, "import portulong.discord_pt as discord");
  processed = processed.replace(/\b(de|from)\s+discord\.ext\s+(importar|import)\s+commands\b/g, "from portulong.discord_pt import commands");
  processed = processed.replace(/\b(de|from)\s+discord\s+(importar|import)\s+ui\b/g, "from portulong.discord_pt import ui");

  // Combine maps for regex replacement
  const fullMap = {
    ...KEYWORDS_MAP,
    ...BUILTINS_MAP,
    ...DISCORD_MAP,
  };

  // Sort keys by length descending to avoid replacing prefixes of words
  const sortedKeys = Object.keys(fullMap).sort((a, b) => b.length - a.length);

  // 4. Perform token replacement for identifiers with word boundaries
  for (const key of sortedKeys) {
    const value = fullMap[key];
    // We match only complete words.
    // In Portuguese, words might contain accents, but let's stick to standard \b with word boundaries.
    // JavaScript's \b works nicely for ascii alphanumeric characters.
    // For unicode accents, we can also use unicode-aware boundaries, but Portulong keys are safe ascii.
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
    processed = processed.replace(regex, value);
  }

  // Corrigir ordem de def async (português "definir assincrono") para "async def" exigido pelo Python
  processed = processed.replace(/\bdef\s+async\b/g, "async def");

  // 5. Restore comments
  for (let i = comments.length - 1; i >= 0; i--) {
    processed = processed.replace(`__COM_PLACEHOLDER_${i}__`, comments[i]);
  }

  // 6. Restore strings
  for (let i = strings.length - 1; i >= 0; i--) {
    processed = processed.replace(`__STR_PLACEHOLDER_${i}__`, strings[i]);
    processed = processed.replace(`__TRIPLE_STR_PLACEHOLDER_${i}__`, strings[i]);
  }

  return processed;
}

// ==========================================
// REVERSE TRANSLATION: PYTHON TO PORTULONG
// ==========================================

export const REVERSE_KEYWORDS_MAP: Record<string, string> = {
  "if": "se",
  "else": "senao",
  "elif": "senaose",
  "for": "para",
  "while": "enquanto",
  "import": "importar",
  "from": "de",
  "as": "como",
  "return": "retornar",
  "try": "tentar",
  "except": "exceto",
  "finally": "finalmente",
  "with": "com",
  "lambda": "lambda",
  "pass": "passar",
  "break": "parar",
  "continue": "continuar",
  "True": "Verdadeiro",
  "False": "Falso",
  "None": "Nulo",
  "and": "e",
  "or": "ou",
  "not": "nao",
  "in": "em",
  "is": "eh",
  "is not": "nao_eh",
  "assert": "asseverar",
  "global": "global",
  "nonlocal": "naolocal",
  "raise": "levantar",
  "yield": "produzir",
  "async": "assincrono",
  "await": "aguardar",
};

export const REVERSE_BUILTINS_MAP: Record<string, string> = {
  "print": "escrever",
  "input": "ler",
  "len": "tamanho",
  "int": "inteiro",
  "str": "texto",
  "float": "real",
  "bool": "boleano",
  "list": "lista",
  "dict": "dicionario",
  "set": "conjunto",
  "tuple": "tupla",
  "range": "intervalo",
  "open": "abrir",
  "type": "tipo",
  "sum": "somar",
  "abs": "absoluto",
  "max": "maximo",
  "min": "minimo",
  "round": "arredondar",
  "map": "mapear",
  "filter": "filtrar",
  "sorted": "ordenado",
  "super": "super",
  "property": "propriedade",
  "zip": "zipar",
  "enumerate": "enumerar",
  "object": "objeto",
  "any": "qualquer",
  "all": "todos",
  "help": "ajuda",
  "id": "identidade",
  "reversed": "reversivel",
  "format": "formatar",
  "getattr": "obter_atributo",
  "setattr": "definir_atributo",
  "hasattr": "tem_atributo",
  "delattr": "excluir_atributo",
  "repr": "representacao",
  "next": "proximo",
  "iter": "iterador",
  "isinstance": "eh_instancia",
  "issubclass": "eh_subclasse",
  "Exception": "Excessao",
  "ValueError": "ErroDeValor",
  "TypeError": "ErroDeTipo",
  "NameError": "ErroDeNome",
  "IndexError": "ErroDeIndice",
  "KeyError": "ErroDeChave",
  "ImportError": "ErroDeImportacao",
  "AttributeError": "ErroDeAtributo",
  "ZeroDivisionError": "ErroDivisaoPorZero",
  "MemoryError": "FaltaDeMemoria",
  "StopIteration": "ParadaDeIteracao",
  "OSError": "ErroDoSistema",
  "FileNotFoundError": "ArquivoNaoEncontrado",
  "KeyboardInterrupt": "InterrupcaoPeloTeclado",
  "AssertionError": "ErroDeAsseveracao",
  "RuntimeError": "ErroDeExecucao",
  "NotImplementedError": "ErroNaoImplementado",
};

export const REVERSE_DISCORD_MAP: Record<string, string> = {
  // Methods
  "send": "enviar",
  "reply": "responder",
  "delete": "deletar",
  "purge": "limpar",
  "add_reaction": "adicionar_reacao",
  "remove_reaction": "remover_reacao",
  "clear_reactions": "remover_todas_as_reacoes",
  "ban": "banir",
  "kick": "expulsar",
  "timeout": "castigar",
  "add_roles": "adicionar_cargo",
  "remove_roles": "remover_cargo",
  "edit": "editar",
  "move_to": "mover_para",

  // Properties / Members
  "content": "conteudo",
  "author": "autor",
  "channel": "canal",
  "guild": "servidor",
  "message": "mensagem",
  "user": "usuario",
  "member": "membro",
  "display_name": "apelido",
  "mention": "mencao",
  "members": "membros",
  "roles": "cargos",
  "channels": "canais",
  "icon": "icone_url",
  "created_at": "criado_em",
  "joined_at": "entrou_em",
  "top_role": "cargo_topo",
  "fields": "campos",
  "value": "valor",
  "system_channel": "canal_sistema",

  // Class Names & Types
  "Bot": "Robo",
  "Intents": "Intencoes",
  "Embed": "Embutido",
  "Color": "Cor",
  "File": "Arquivo",
  "Member": "Membro",
  "User": "Usuario",
  "TextChannel": "CanalTexto",
  "VoiceChannel": "CanalVoz",
  "Role": "Cargo",
  "Message": "Mensagem",
  "Guild": "Servidor",

  // Parameters
  "command_prefix": "prefixo",
  "title": "titulo",
  "description": "descricao",
  "color": "cor",
  "inline": "em_linha",
  "limit": "limite",
  "reason": "motivo",
  "delete_after": "excluir_depois",
  "label": "rotulo",
  "custom_id": "id_personalizado",
  "style": "estilo",
  "disabled": "desativado",
  "placeholder": "marcador",
  "required": "obrigatorio",
  "min_length": "comprimento_minimo",
  "max_length": "comprimento_maximo",
  "embed": "embutido",
  "embeds": "embutidos",
  "file": "arquivo",
  "files": "arquivos",
  "view": "visualizacao",

  // Colors
  "blue": "azul",
  "red": "vermelho",
  "green": "verde",
  "gold": "dourado",
  "purple": "roxo",
  "light_gray": "cinza",

  // UI Items
  "Button": "Botao",
  "Select": "Selecao",
  "SelectOption": "OpcaoSelecao",
  "TextInput": "CaixaTexto",
  "Modal": "ModalPT",
  "View": "Visualizacao",
  "add_item": "adicionar_item",
  "remove_item": "remover_item",
};

export function translatePythonToPortulong(code: string): string {
  const strings: string[] = [];
  const comments: string[] = [];

  // Protect strings & comments
  // 1. Temporarily extract triple quoted strings
  let processed = code.replace(/"""([\s\S]*?)"""/g, (match) => {
    strings.push(match);
    return `__TRIPLE_STR_PLACEHOLDER_${strings.length - 1}__`;
  });
  processed = processed.replace(/'''([\s\S]*?)'''/g, (match) => {
    strings.push(match);
    return `__TRIPLE_STR_PLACEHOLDER_${strings.length - 1}__`;
  });

  // 2. Temporarily extract double/single quoted strings
  processed = processed.replace(/"([^"\\]|\\.)*"/g, (match) => {
    strings.push(match);
    return `__STR_PLACEHOLDER_${strings.length - 1}__`;
  });
  processed = processed.replace(/'([^'\\]|\\.)*'/g, (match) => {
    strings.push(match);
    return `__STR_PLACEHOLDER_${strings.length - 1}__`;
  });

  // 3. Temporarily extract single-line comments
  processed = processed.replace(/#.*/g, (match) => {
    comments.push(match);
    return `__COM_PLACEHOLDER_${comments.length - 1}__`;
  });

  // 4. Specific imports translations BEFORE general word translation
  // Handle discord.py wrapper custom imports
  processed = processed.replace(/\bimport\s+discord\b/g, "importar portulong.discord_pt como discord");
  processed = processed.replace(/\bfrom\s+discord\.ext\s+import\s+commands\b/g, "from portulong.discord_pt import commands");
  processed = processed.replace(/\bfrom\s+discord\s+import\s+ui\b/g, "from portulong.discord_pt import ui");
  processed = processed.replace(/\bimport\s+portulong\.discord_pt\s+as\s+discord\b/g, "importar portulong.discord_pt como discord");
  processed = processed.replace(/\bfrom\s+portulong\.discord_pt\s+import\s+commands\b/g, "from portulong.discord_pt import commands");
  processed = processed.replace(/\bfrom\s+portulong\.discord_pt\s+import\s+ui\b/g, "from portulong.discord_pt import ui");

  // 5. Structure mappings: async def -> definir assincrono, def -> definir
  processed = processed.replace(/\basync\s+def\b/g, "definir assincrono");
  processed = processed.replace(/\bdef\b/g, "definir");
  processed = processed.replace(/\btimeout\s*=/g, "tempo_esgotado=");

  // 6. Event handles
  processed = processed.replace(/\bon_ready\b/g, "ao_iniciar");
  processed = processed.replace(/\bon_message\b/g, "ao_mensagem");
  processed = processed.replace(/\bon_member_join\b/g, "ao_entrar_membro");
  processed = processed.replace(/\bon_member_remove\b/g, "ao_sair_membro");
  processed = processed.replace(/\bon_reaction_add\b/g, "ao_reacao_adicionada");
  processed = processed.replace(/\bon_reaction_remove\b/g, "ao_reacao_removida");

  // 7. Decorator hooks like @bot.event and @bot.command()
  processed = processed.replace(/@(bot|client|robo|cliente)\.(event|evento)\b/g, "@robo.evento");
  processed = processed.replace(/@(bot|client|robo|cliente)\.(command|comando)\b/g, "@robo.comando");

  // Combine maps for reverse lookup
  const reverseMap: Record<string, string> = {
    ...REVERSE_KEYWORDS_MAP,
    ...REVERSE_BUILTINS_MAP,
    ...REVERSE_DISCORD_MAP,
  };

  const sortedKeys = Object.keys(reverseMap).sort((a, b) => b.length - a.length);

  // 8. Perform token replacement
  for (const key of sortedKeys) {
    const value = reverseMap[key];
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
    processed = processed.replace(regex, value);
  }

  // 9. Restore comments
  for (let i = comments.length - 1; i >= 0; i--) {
    processed = processed.replace(`__COM_PLACEHOLDER_${i}__`, comments[i]);
  }

  // 10. Restore strings
  for (let i = strings.length - 1; i >= 0; i--) {
    processed = processed.replace(`__STR_PLACEHOLDER_${i}__`, strings[i]);
    processed = processed.replace(`__TRIPLE_STR_PLACEHOLDER_${i}__`, strings[i]);
  }

  return processed;
}

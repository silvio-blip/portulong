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
};

// Object/Property and Method maps for Discord.py wrapper
export const DISCORD_MAP: Record<string, string> = {
  // Discordia classes & helpers
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

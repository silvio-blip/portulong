import os
import sys
import json
import subprocess
import shutil

# Definições da Extensão VS Code
package_json = {
  "name": "portulong-vscode",
  "displayName": "Portulong support",
  "description": "Suporte de sintaxe e execução no terminal para a linguagem Portulong (.ptg)",
  "version": "1.0.0",
  "publisher": "silvio-blip",
  "icon": "portulong.png",
  "homepage": "https://portulong.vercel.app/",
  "repository": {
    "type": "git",
    "url": "https://github.com/silvio-blip/portulong"
  },
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": [
    "Programming Languages"
  ],
  "activationEvents": [
    "onLanguage:portulong",
    "onCommand:portulong.executar"
  ],
  "main": "./src/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "portulong",
        "aliases": [
          "Portulong",
          "portulong"
        ],
        "extensions": [
          ".ptg"
        ],
        "configuration": "./language-configuration.json",
        "icon": {
          "light": "./portulong.png",
          "dark": "./portulong.png"
        }
      }
    ],
    "grammars": [
      {
        "language": "portulong",
        "scopeName": "source.portulong",
        "path": "./syntaxes/portulong.tmLanguage.json"
      }
    ],
    "snippets": [
      {
        "language": "portulong",
        "path": "./snippets/portulong.json"
      }
    ],
    "commands": [
      {
        "command": "portulong.executar",
        "title": "Portulong: Executar Ficheiro",
        "icon": "$(play)"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "when": "editorLangId == portulong || resourceExtname == .ptg",
          "command": "portulong.executar",
          "group": "navigation"
        }
      ]
    },
    "keybindings": [
      {
        "command": "portulong.executar",
        "key": "ctrl+f5",
        "mac": "cmd+f5",
        "when": "editorTextFocus && editorLangId == portulong"
      }
    ]
  }
}

language_configuration = {
  "comments": {
    "lineComment": "#"
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  "autoClosingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"" },
    { "open": "'", "close": "'" }
  ],
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""],
    ["'", "'"]
  ]
}

tmlanguage_json = {
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "Portulong",
  "scopeName": "source.portulong",
  "patterns": [
    {
      "include": "#comments"
    },
    {
      "include": "#strings"
    },
    {
      "include": "#definitions"
    },
    {
      "include": "#decorators"
    },
    {
      "include": "#keywords"
    },
    {
      "include": "#operators"
    },
    {
      "include": "#constants"
    },
    {
      "include": "#builtin-functions"
    },
    {
      "include": "#discord"
    },
    {
      "include": "#function-calls"
    },
    {
      "include": "#properties"
    }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.line.number-sign.portulong",
          "match": r"#.*$"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.triple.double.portulong",
          "begin": '"""',
          "end": '"""',
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\."
            }
          ]
        },
        {
          "name": "string.quoted.triple.single.portulong",
          "begin": "'''",
          "end": "'''",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\."
            }
          ]
        },
        {
          "name": "string.quoted.double.portulong",
          "begin": '"',
          "end": '"',
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\."
            }
          ]
        },
        {
          "name": "string.quoted.single.portulong",
          "begin": "'",
          "end": "'",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\."
            }
          ]
        }
      ]
    },
    "definitions": {
      "patterns": [
        {
          "name": "meta.function.portulong",
          "match": r"\b(funcao|definir)\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "storage.type.function.portulong" },
            "2": { "name": "entity.name.function.portulong" }
          }
        },
        {
          "name": "meta.class.portulong",
          "match": r"\b(classe)\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "storage.type.class.portulong" },
            "2": { "name": "entity.name.type.class.portulong" }
          }
        }
      ]
    },
    "decorators": {
      "patterns": [
        {
          "name": "meta.function.decorator.portulong",
          "match": r"(@)([a-zA-Z_][a-zA-Z0-9_.]*)",
          "captures": {
            "1": { "name": "punctuation.definition.decorator.portulong" },
            "2": { "name": "entity.name.function.decorator.portulong" }
          }
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.import.portulong",
          "match": r"\b(importar|de|como)\b"
        },
        {
          "name": "keyword.control.conditional.portulong",
          "match": r"\b(se|senao|senaose)\b"
        },
        {
          "name": "keyword.control.repeat.portulong",
          "match": r"\b(para|enquanto)\b"
        },
        {
          "name": "keyword.control.flow.portulong",
          "match": r"\b(retornar|parar|continuar|passar)\b"
        },
        {
          "name": "keyword.control.exception.portulong",
          "match": r"\b(tentar|exceto|finalmente|levantar)\b"
        },
        {
          "name": "keyword.control.async.portulong",
          "match": r"\b(assincrono|aguardar)\b"
        },
        {
          "name": "keyword.control.portulong",
          "match": r"\b(com|lambda|global|naolocal|produzir|asseverar)\b"
        },
        {
          "name": "keyword.operator.logical.portulong",
          "match": r"\b(e|ou|nao|em|eh|nao_eh)\b"
        },
        {
          "name": "variable.language.special.self.portulong",
          "match": r"\b(self|contexto)\b"
        }
      ]
    },
    "operators": {
      "patterns": [
        {
          "name": "keyword.operator.portulong",
          "match": r"\+|-|\*|/|//|%|=|==|!=|<|>|<=|>=|\+=|-="
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "name": "constant.numeric.portulong",
          "match": r"\b([0-9]+(\.[0-9]+)?)\b"
        },
        {
          "name": "constant.language.portulong",
          "match": r"\b(verdadeiro|falso|nulo|Verdadeiro|Falso|Nulo)\b"
        }
      ]
    },
    "builtin-functions": {
      "patterns": [
        {
          "name": "support.function.builtin.portulong",
          "match": r"\b(escrever|mostrar|ler|tamanho|inteiro|texto|real|decimal|boleano|lista|dicionario|conjunto|tupla|intervalo|abrir|tipo|somar|absoluto|maximo|minimo|arredondar|mapear|filtrar|ordenado|super|propriedade|zipar|enumerar|objeto|qualquer|todos|ajuda|identidade|reversivel|formatar|obter_atributo|definir_atributo|tem_atributo|excluir_atributo|representacao|proximo|iterador|eh_instancia|eh_subclasse)\b"
        },
        {
          "name": "support.type.exception.portulong",
          "match": r"\b(Excessao|ErroDeValor|ErroDeTipo|ErroDeNome|ErroDeIndice|ErroDeChave|ErroDeImportacao|ErroDeAtributo|ErroDivisaoPorZero|FaltaDeMemoria|ParadaDeIteracao|ErroDoSistema|ArquivoNaoEncontrado|InterrupcaoPeloTeclado|ErroDeAsseveracao|ErroDeExecucao|ErroNaoImplementado)\b"
        }
      ]
    },
    "discord": {
      "patterns": [
        {
          "name": "support.class.discord.portulong",
          "match": r"\b(Robo|discord|Intencoes|Membro|Canal|Servidor|Mensagem)\b"
        },
        {
          "name": "support.function.discord.portulong",
          "match": r"\b(prefixo|evento|comando|nome|ajuda|enviar|responder|deletar|adicionar_reacao|remover_reacao|expulsar|banir|limpar|conteudo|autor|canal|servidor|mensagem|usuario|id)\b"
        }
      ]
    },
    "function-calls": {
      "patterns": [
        {
          "name": "meta.function-call.portulong",
          "match": r"\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()"
        }
      ]
    },
    "properties": {
      "patterns": [
        {
          "name": "variable.other.property.portulong",
          "match": r"(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*\b"
        }
      ]
    }
  }
}

snippets_json = {
  "Novo Robô Discord": {
    "prefix": "robo_novo",
    "body": [
      "importar portulong.discord_pt como discord",
      "",
      "robo = discord.Robo(prefixo=\"!\")",
      "",
      "@robo.evento",
      "definir assincrono ao_iniciar():",
      "    escrever(f\"Robô {robo.usuario} ligado com sucesso!\")",
      "",
      "@robo.comando(nome=\"ping\")",
      "definir assincrono cmd_ping(contexto):",
      "    aguardar contexto.enviar(\"Pong! 🏓\")",
      "",
      "robo.run(\"${1:SEU_TOKEN_AQUI}\")"
    ],
    "description": "Cria a estrutura de um novo Bot de Discord com evento de início e comando de teste."
  },
  "Definir Função": {
    "prefix": "funcao",
    "body": [
      "funcao ${1:nome_da_funcao}(${2:argumentos}):",
      "    ${3:passar}"
    ],
    "description": "Definir uma função/procedimento padrão"
  },
  "Definir": {
    "prefix": "definir",
    "body": [
      "definir ${1:nome_da_funcao}(${2:argumentos}):",
      "    ${3:passar}"
    ],
    "description": "Definir uma função ou método alternativo"
  },
  "Definir Assíncrono": {
    "prefix": "definir assincrono",
    "body": [
      "definir assincrono ${1:nome_da_funcao}(${2:argumentos}):",
      "    ${3:passar}"
    ],
    "description": "Definir uma função assíncrona"
  },
  "Estrutura Condicional Se": {
    "prefix": "se",
    "body": [
      "se ${1:condicao}:",
      "    ${2:passar}"
    ],
    "description": "Estrutura de decisão condicional 'se'"
  },
  "Estrutura Condicional Senão Se": {
    "prefix": "senaose",
    "body": [
      "senaose ${1:condicao}:",
      "    ${2:passar}"
    ],
    "description": "Condicional encadeada 'senaose'"
  },
  "Estrutura Condicional Senão": {
    "prefix": "senao",
    "body": [
      "senao:",
      "    ${1:passar}"
    ],
    "description": "Condicional alternativa 'senao'"
  },
  "Laço Para": {
    "prefix": "para",
    "body": [
      "para ${1:item} em ${2:iteravel}:",
      "    ${3:passar}"
    ],
    "description": "Laço de repetição determinado 'para'"
  },
  "Laço Enquanto": {
    "prefix": "enquanto",
    "body": [
      "enquanto ${1:condicao}:",
      "    ${2:passar}"
    ],
    "description": "Laço de repetição indeterminado 'enquanto'"
  },
  "Comando do Robô": {
    "prefix": "robo_comando",
    "body": [
      "@robo.comando(nome=\"${1:nome_do_comando}\")",
      "definir assincrono cmd_${1:nome_do_comando}(contexto${2:, membro: discord.Membro}):",
      "    aguardar contexto.enviar(\"${3:Resposta do comando}\")"
    ],
    "description": "Cria um novo comando assíncrono para o Robô do Discord."
  },
  "Evento do Robô": {
    "prefix": "robo_evento",
    "body": [
      "@robo.evento",
      "definir assincrono ao_${1:evento}():",
      "    ${2:passar}"
    ],
    "description": "Regista uma escuta de evento assíncrono para o Robô (ex: ao_mensagem, ao_iniciar)."
  },
  "Mostrar ou Escrever": {
    "prefix": "escrever",
    "body": [
      "escrever(${1:dados})"
    ],
    "description": "Escreve informações no ecrã/terminal"
  },
  "Retornar": {
    "prefix": "retornar",
    "body": [
      "retornar ${1:valor}"
    ],
    "description": "Retorna um valor de uma função"
  },
  "Tentar / Exceto": {
    "prefix": "tentar",
    "body": [
      "tentar:",
      "    ${1:bloco_principal}",
      "exceto ${2:Excessao} como ${3:erro}:",
      "    escrever(f\"Ocorreu um erro: {${3:erro}}\")"
    ],
    "description": "Controlo de exceções e erros"
  },
  "Importar": {
    "prefix": "importar",
    "body": [
      "importar ${1:modulo}"
    ],
    "description": "Importa um módulo ou pacote"
  },
  "Definir Classe": {
    "prefix": "classe",
    "body": [
      "classe ${1:MinhaClasse}:",
      "    definir __inicializar__(self${2:, argumentos}):",
      "        ${3:passar}"
    ],
    "description": "Definir uma classe orientada a objetos"
  },
  "Aguardar": {
    "prefix": "aguardar",
    "body": [
      "aguardar ${1:expressao_assincrona}"
    ],
    "description": "Aguardar execução de corrotina assíncrona"
  }
}

extension_js = """const vscode = require('vscode');

function obterTextoSemStringsEComentarios(documento) {
    let texto = documento.getText();
    texto = texto.replace(/\"\"\"[\\s\\S]*?\"\"\"|'\\'\\'[\\s\\S]*?'\\'\\'/g, match => {
        return " ".repeat(match.length);
    });
    
    const linhas = texto.split(/\\r?\\n/);
    const linhasLimpas = linhas.map(linha => {
        let linhaLimpa = "";
        let insideString = false;
        let charString = null;
        let escorregou = false;
        
        for (let i = 0; i < linha.length; i++) {
            const c = linha[i];
            
            if (escorregou) {
                linhaLimpa += " ";
                escorregou = false;
                continue;
            }
            
            if (c === '\\\\') {
                linhaLimpa += " ";
                escorregou = true;
                continue;
            }
            
            if (insideString) {
                if (c === charString) {
                    insideString = false;
                }
                linhaLimpa += " ";
            } else {
                if (c === '#' && !insideString) {
                    linhaLimpa += " ".repeat(linha.length - i);
                    break;
                } else if (c === '"' || c === "'") {
                    insideString = true;
                    charString = c;
                    linhaLimpa += " ";
                } else {
                    linhaLimpa += c;
                }
            }
        }
        return linhaLimpa;
    });
    
    return linhasLimpas;
}

function atualizarDiagnosticos(document, collection) {
    if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
        return;
    }
    
    const diagnostics = [];
    const linhasLimpas = obterTextoSemStringsEComentarios(document);
    
    const keywords = new Set([
        "importar", "de", "como", "se", "senao", "senaose", "para", "enquanto",
        "retornar", "parar", "continuar", "passar", "tentar", "exceto", "finalmente",
        "levantar", "assincrono", "aguardar", "com", "lambda", "global", "naolocal",
        "produzir", "asseverar", "funcao", "definir", "classe",
        "e", "ou", "nao", "em", "eh", "nao_eh",
        "self", "contexto", "ctx", "bot", "client", "args", "kwargs", "ptg", "canal_id", "token", "mensagem",
        "verdadeiro", "falso", "nulo", "Verdadeiro", "Falso", "Nulo",
        "escrever", "mostrar", "ler", "tamanho", "inteiro", "texto", "real", "decimal",
        "boleano", "lista", "dicionario", "conjunto", "tupla", "intervalo", "abrir", "tipo",
        "somar", "absoluto", "maximo", "minimo", "arredondar", "mapear", "filtrar", "ordenado",
        "super", "propriedade", "zipar", "enumerar", "objeto", "qualquer", "todos", "ajuda",
        "identidade", "reversivel", "formatar", "obter_atributo", "definir_atributo", "tem_atributo",
        "excluir_atributo", "representacao", "proximo", "iterador", "eh_instancia", "eh_subclasse",
        "Excessao", "ErroDeValor", "ErroDeTipo", "ErroDeNome", "ErroDeIndice", "ErroDeChave",
        "ErroDeImportacao", "ErroDeAtributo", "ErroDivisaoPorZero", "FaltaDeMemoria", "ParadaDeIteracao",
        "ErroDoSistema", "ArquivoNaoEncontrado", "InterrupcaoPeloTeclado", "ErroDeAsseveracao",
        "ErroDeExecucao", "ErroNaoImplementado",
        "Robo", "Bot", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem",
        "Cor", "Embutido", "Modal", "ModalPT", "CaixaTexto", "Botao", "Selecao", "Visualizacao", "OpcaoSelecao",
        "prefixo", "evento", "comando", "nome", "ajuda", "enviar", "responder", "deletar",
        "adicionar_reacao", "remover_reacao", "expulsar", "banir", "limpar", "conteudo",
        "autor", "canal", "servidor", "mensagem", "usuario", "id", "canal_sistema", "permissoes",
        "expulsar_membros", "gerenciar_mensagens",
        "os", "sys", "re", "json", "math", "random", "time", "datetime", "discord", "commands", "intents", "asyncio"
    ]);
    
    const localDecls = new Set();
    
    linhasLimpas.forEach(linha => {
        const matchFuncao = linha.match(/\\b(?:funcao|definir)\\s+(?:assincrono\\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (matchFuncao) {
            localDecls.add(matchFuncao[1]);
        }
        
        const matchClasse = linha.match(/\\bclasse\\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (matchClasse) {
            localDecls.add(matchClasse[1]);
        }
        
        const matchAtribuicao = linha.match(/^[ \\t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\\s*=/);
        if (matchAtribuicao) {
            const variaveis = matchAtribuicao[1].split(",");
            variaveis.forEach(v => localDecls.add(v.trim()));
        }
        
        const matchPara = linha.match(/\\bpara\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\\s+em\\b/);
        if (matchPara) {
            const variaveis = matchPara[1].split(",");
            variaveis.forEach(v => localDecls.add(v.trim()));
        }
    
        const matchParams = linha.match(/\\b(?:funcao|definir)\\s+(?:assincrono\\s+)?[a-zA-Z_][a-zA-Z0-9_]*\\s*\\(([^)]*)\\)/);
        if (matchParams) {
            const paramsRaw = matchParams[1].split(",");
            paramsRaw.forEach(p => {
                const pNome = p.trim().split(/\\s*:/)[0].split(/\\s*=/)[0].trim();
                if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) {
                    localDecls.add(pNome);
                }
            });
        }
        
        const matchDeImportar = linha.match(/\\bde\\s+[a-zA-Z0-9_.]+\\s+importar\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
        if (matchDeImportar) {
            const nomes = matchDeImportar[1].split(",");
            nomes.forEach(n => localDecls.add(n.trim()));
        }
        
        const matchImportar = linha.match(/\\bimportar\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
        if (matchImportar) {
            const partes = matchImportar[1].split(",");
            partes.forEach(p => {
                const pTrim = p.trim();
                if (pTrim.includes(" como ")) {
                    const alias = pTrim.split(" como ")[1].trim();
                    localDecls.add(alias);
                } else {
                    localDecls.add(pTrim);
                }
            });
        }
    });
    
    linhasLimpas.forEach((linha, indiceLinha) => {
        const wordRegex = /\\b[a-zA-Z_][a-zA-Z0-9_]*\\b/g;
        let match;
        
        while ((match = wordRegex.exec(linha)) !== null) {
            const palavra = match[0];
            const indiceInicio = match.index;
            
            if (palavra.length <= 1) {
                continue;
            }
            
            const textoAntes = linha.substring(0, indiceInicio);
            if (/\\.\\s*$/.test(textoAntes)) {
                continue;
            }
            
            if (/@\\s*$/.test(textoAntes)) {
                continue;
            }
            
            if (/^\\d+$/.test(palavra)) {
                continue;
            }
            
            const textoDepois = linha.substring(indiceInicio + palavra.length);
            if (/^\\s*=(?!=)/.test(textoDepois)) {
                continue;
            }
            if (/^\\s*['"]/.test(textoDepois)) {
                continue;
            }
            
            if (!keywords.has(palavra) && !localDecls.has(palavra)) {
                const range = new vscode.Range(
                    new vscode.Position(indiceLinha, indiceInicio),
                    new vscode.Position(indiceLinha, indiceInicio + palavra.length)
                );
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Sintaxe inválida: A palavra '${palavra}' não é uma palavra-chave integrada e não está definida no escopo local do Portulong.`,
                    vscode.DiagnosticSeverity.Error
                );
                
                diagnostic.code = 'invalid-word';
                diagnostics.push(diagnostic);
            }
        }
    });
    
    collection.set(document.uri, diagnostics);
}

function activate(context) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('portulong');
    context.subscriptions.push(diagnosticsCollection);

    if (vscode.window.activeTextEditor) {
        atualizarDiagnosticos(vscode.window.activeTextEditor.document, diagnosticsCollection);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                atualizarDiagnosticos(editor.document, diagnosticsCollection);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            atualizarDiagnosticos(event.document, diagnosticsCollection);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticsCollection.delete(doc.uri);
        })
    );

    let disposable = vscode.commands.registerCommand('portulong.executar', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('Nenhum ficheiro Portulong (.ptg) está aberto atualmente.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
            vscode.window.showErrorMessage('O ficheiro ativo não é um ficheiro Portulong (.ptg).');
            return;
        }

        document.save().then(() => {
            const filePath = document.fileName;
            
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong Executar');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong Executar');
            }
            
            terminal.show();
            terminal.sendText("portulong executar \"" + filePath + "\"");
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
"""

def info(msg):
    print(f"\\033[1;34m[*] {msg}\\033[0m")

def success(msg):
    print(f"\\033[1;32m[+] {msg}\\033[0m")

def warn(msg):
    print(f"\\033[1;33m[!] {msg}\\033[0m")

def error(msg):
    print(f"\\033[1;31m[x] {msg}\\033[0m")

def main():
    print("="*60)
    print("   INSTALADOR AUTOMÁTICO DO PORTULONG E EXTENSÃO VS CODE")
    print("="*60)

    # 1. Instalar o Portulong e bibliotecas acessórias necessárias
    info("1/4. Instalando linguagem de programação Portulong e bibliotecas necessárias...")
    
    # Automatizar a instalação de todas as bibliotecas necessárias para rodar o Portulong e bots de Discord automaticamente
    info("Instalando/atualizando dependências essenciais (pip, discord.py, setuptools, portulong)...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=False)
        subprocess.run([sys.executable, "-m", "pip", "install", "discord.py", "setuptools"], check=False)
        success("Bibliotecas acessórias (discord.py, setuptools, pip) checadas e instaladas!")
    except Exception as e_deps:
        warn(f"Aviso ao verificar e preparar bibliotecas de suporte: {e_deps}")

    instalado_local = False
    
    # Se o script for corrido dentro do repositório onde existe o pyproject.toml
    if os.path.exists("pyproject.toml"):
        info("Encontrado 'pyproject.toml' localmente. Tentando instalar em modo editável/direto...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], check=True)
            success("Excelente! Portulong instalado em modo de desenvolvimento local com absoluto sucesso!")
            instalado_local = True
        except Exception as e_local:
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", "."], check=True)
                success("Excelente! Portulong instalado localmente com absoluto sucesso!")
                instalado_local = True
            except Exception as e_local_padrao:
                warn(f"Tentativa de instalação local falhou: {e_local_padrao}. Tentando via indexador remoto...")
                
    if not instalado_local:
        info("Instalando pacote 'portulong.ptg' oficial a partir do PyPI...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "portulong.ptg"], check=True)
            success("Portulong instalado com sucesso via pip (pacote 'portulong.ptg')!")
        except Exception as e:
            warn(f"Não foi possível instalar o pacote 'portulong.ptg' automaticamente do PyPI: {e}")
            info("Certifique-se de rodar posteriormente no seu ambiente: pip install portulong.ptg")

    # 2. Criar a estrutura de ficheiros da Extensão VS Code
    ext_dir = "portulong-vscode"
    info(f"2/4. Criando diretórios da extensão VS Code em '{ext_dir}'...")
    
    os.makedirs(ext_dir, exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "syntaxes"), exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "snippets"), exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "src"), exist_ok=True)

    with open(os.path.join(ext_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "language-configuration.json"), "w", encoding="utf-8") as f:
        json.dump(language_configuration, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "syntaxes", "portulong.tmLanguage.json"), "w", encoding="utf-8") as f:
        json.dump(tmlanguage_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "snippets", "portulong.json"), "w", encoding="utf-8") as f:
        json.dump(snippets_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "src", "extension.js"), "w", encoding="utf-8") as f:
        f.write(extension_js)

    # Evitar duplicação de imagem em pastas principais e fora do projeto:
    # Baixa e configura diretamente no diretório do VS Code sem poluir a raiz
    ext_icon_path = os.path.join(ext_dir, "portulong.png")
    if not os.path.exists(ext_icon_path):
        if os.path.exists("portulong.png"):
            try:
                shutil.copy("portulong.png", ext_icon_path)
                info("Ícone 'portulong.png' copiado localmente para o diretório da extensão!")
            except Exception:
                pass
        else:
            info("Ícone 'portulong.png' não encontrado localmente. Procurando fontes alternativas...")
            urls = [
                "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/Wsii1RU.png&f=1",
                "https://portulong.vercel.app/portulong.png",
                "https://i.imgur.com/Wsii1RU.png"
            ]
            downloaded = False
            for url in urls:
                try:
                    info(f"Tentando baixar ícone de: {url}")
                    import urllib.request
                    req_obj = urllib.request.Request(
                        url, 
                        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    )
                    with urllib.request.urlopen(req_obj, timeout=8) as response:
                        content_bytes = response.read()
                        if content_bytes.startswith(b'\x89PNG\r\n\x1a\n') and len(content_bytes) > 50000:
                            with open(ext_icon_path, "wb") as f_img:
                                f_img.write(content_bytes)
                            success(f"Ícone 'portulong.png' transferido de {url} com sucesso!")
                            downloaded = True
                            break
                        else:
                            warn(f"Resposta de {url} não é um PNG válido (tipo incorreto).")
                except Exception as e_dl:
                    warn(f"Erro ao baixar de {url}: {e_dl}")
            
            if not downloaded:
                warn("Não foi possível transferir o ícone automaticamente. Você pode colocar manualmente um arquivo 'portulong.png' dentro de 'portulong-vscode/'.")

    # Limpeza de qualquer ícone duplicado no diretório atual (fora de qualquer pasta/raiz)
    # se o usuário tiver rodado o instalador que gerou o arquivo no diretório pai
    if os.path.exists("portulong.png"):
        try:
            os.remove("portulong.png")
            info("Removida cópia duplicada temporária do ícone na raiz para manter os seus diretórios limpos!")
        except Exception:
            pass

    success("Estrutura de ficheiros da extensão VS Code criada com perfeição!")

    # 3. Compilar a Extensão para .vsix utilizando npx de forma leve
    info("3/4. Compilando extensão para .vsix...")
    # Tenta verificar se o npx está disponível
    npx_path = shutil.which("npx")
    if npx_path:
        try:
            # Roda npx @vscode/vsce package no diretório da extensão
            info("Rodando vsce via npx temporário para gerar o instalador...")
            # Em sistemas Windows pode precisar do shell=True
            subprocess.run([npx_path, "-y", "@vscode/vsce", "package", "--allow-missing-repository"], cwd=ext_dir, check=True, shell=os.name == 'nt')
            success("Extensão compilada em ficheiro .vsix com sucesso!")
        except Exception as e:
            warn(f"Durante a compilação do vsce: {e}")
            warn("Se não tiver o Node.js/npm instalado, tudo bem! Os ficheiros foram todos criados.")
            warn(f"Dica: Acesse a pasta {ext_dir} e rode 'npx @vscode/vsce package' manualmente.")
    else:
        warn("npx ou Node.js não detetado no sistema.")
        warn("Os ficheiros da extensão foram gerados. Para compilar para VSIX, instale o Node.js e execute:")
        warn(f"  cd {ext_dir} && npx @vscode/vsce package")

    # 4. Tentar instalar diretamente no VS Code se o comando estiver disponível
    info("4/4. Tentando instalar a extensão diretamente no VS Code local...")
    code_path = shutil.which("code")
    if code_path:
        try:
            vsix_files = [f for f in os.listdir(ext_dir) if f.endswith(".vsix")]
            if vsix_files:
                vsix_filepath = os.path.join(ext_dir, vsix_files[0])
                info(f"Instalando {vsix_filepath} no VS Code...")
                subprocess.run([code_path, "--install-extension", vsix_filepath], check=True, shell=os.name == 'nt')
                success("Extensão Portulong instalada automaticamente no seu VS Code!")
                print("\\033[1;32mSeu VS Code agora está 100% equipado com suporte e o botão Play!\\033[0m")
            else:
                warn("Nenhum ficheiro .vsix encontrado para instalação automática.")
        except Exception as e:
            warn(f"Erro na instalação automática via 'code': {e}")
    else:
        info("Comando 'code' não configurado no terminal. Não se preocupe!")
        info(f"Você pode arrastar o ficheiro .vsix gerado na pasta {ext_dir} ou importar manualmente nas extensões do VS Code.")

    # Mover instalador e desinstalador para dentro da pasta portulong-vscode para manter a raiz limpa
    try:
        script_atual = os.path.abspath(sys.argv[0])
        script_basename = os.path.basename(script_atual)
        
        # Copia instalar.py (script atual) para dentro de ext_dir
        if os.path.exists(script_atual) and script_basename.endswith(".py"):
            shutil.copy(script_atual, os.path.join(ext_dir, "instalar.py"))
            info(f"Cópia do instalador salva com sucesso em '{ext_dir}/instalar.py'!")
            
        # Copia desinstalar.py para dentro de ext_dir
        # Procura tanto no diretório atual quanto no mesmo diretório do script atual
        des_orig = "desinstalar.py"
        if not os.path.exists(des_orig):
            parent_dir = os.path.dirname(script_atual)
            possible_des = os.path.join(parent_dir, "desinstalar.py")
            if os.path.exists(possible_des):
                des_orig = possible_des
                
        if os.path.exists(des_orig):
            shutil.copy(des_orig, os.path.join(ext_dir, "desinstalar.py"))
            info(f"Cópia do desinstalador salva com sucesso em '{ext_dir}/desinstalar.py'!")
    except Exception as e_copy:
        warn(f"Aviso ao organizar arquivos de suporte na pasta da extensão: {e_copy}")

    # Remove os arquivos externos (de fora) para manter a raiz totalmente limpa
    try:
        # Se copiou com sucesso para dentro, tenta apagar o de fora
        inside_instador = os.path.join(ext_dir, "instalar.py")
        if os.path.exists(inside_instador) and os.path.getsize(inside_instador) > 0:
            script_atual = os.path.abspath(sys.argv[0])
            # Garante que não estamos tentando deletar o arquivo de dentro da pasta portulong-vscode e que é um ficheiro python de facto!
            if os.path.exists(script_atual) and "portulong-vscode" not in script_atual and script_basename.endswith(".py") and "portulong" not in script_basename:
                os.remove(script_atual)
                success("Arquivo de instalação externo ('instalar.py' de fora) removido com sucesso para manter os seus diretórios perfeitamente limpos!")
                
        # Tenta apagar o desinstalar.py externo se copiado
        inside_desinstalador = os.path.join(ext_dir, "desinstalar.py")
        if os.path.exists(inside_desinstalador) and os.path.getsize(inside_desinstalador) > 0:
            des_orig = "desinstalar.py"
            if os.path.exists(des_orig) and os.path.abspath(des_orig) != os.path.abspath(inside_desinstalador):
                os.remove(des_orig)
                success("Arquivo de desinstalação externo ('desinstalar.py' de fora) removido com sucesso!")
    except Exception as e_del:
        warn(f"Durante a limpeza dos arquivos externos temporários: {e_del}")

    print("\\033[1;32m")
    print("="*60)
    print("   CONCLUÍDO COM SUCESSO! SEU AMBIENTE ESTÁ PRONTO.")
    print("="*60)
    print("\\033[0m")

if __name__ == "__main__":
    main()

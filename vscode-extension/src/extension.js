const vscode = require('vscode');

/**
 * Mascara strings e comentários de uma linha ou multilinhas com espaços para preservar posições exatas dos caracteres.
 * @param {vscode.TextDocument} documento 
 * @returns {string[]}
 */
function obterTextoSemStringsEComentarios(documento) {
    let texto = documento.getText();
    
    // 1. Substituir strings multilinha (triplas aspas """ e ''') por espaços de mesmo tamanho
    texto = texto.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, match => {
        return " ".repeat(match.length);
    });
    
    // 2. Processar linha por linha para mascarar strings de linha única e comentários
    const linhas = texto.split(/\r?\n/);
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
            
            if (c === '\\') {
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
                    // Começo de comentário de linha única. Ignoramos o resto da linha
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

/**
 * Valida o arquivo .ptg buscando palavras inválidas que não existem no Portulong ou escopo e as grifa na IDE.
 * @param {vscode.TextDocument} document 
 * @param {vscode.DiagnosticCollection} collection 
 */
function atualizarDiagnosticos(document, collection) {
    try {
        if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
            return;
        }
        
        const diagnostics = [];
        const linhasLimpas = obterTextoSemStringsEComentarios(document);
        
        // Lista de palavras integradas e válidas do Portulong
        const keywords = new Set([
            // Estruturas de controle
            "importar", "de", "como", "se", "senao", "senaose", "para", "enquanto",
            "retornar", "parar", "continuar", "passar", "tentar", "exceto", "finalmente",
            "levantar", "assincrono", "aguardar", "com", "lambda", "global", "naolocal",
            "produzir", "asseverar", "funcao", "definir", "classe",
            // Operadores lógicos
            "e", "ou", "nao", "em", "eh", "nao_eh",
            // Variáveis internas comuns
            "self", "contexto", "ctx", "bot", "client", "args", "kwargs", "ptg", "canal_id", "token", "mensagem",
            // Literais lógicos e vazios
            "verdadeiro", "falso", "nulo", "Verdadeiro", "Falso", "Nulo",
            // Funções internas
            "escrever", "mostrar", "ler", "tamanho", "inteiro", "texto", "real", "decimal",
            "boleano", "lista", "dicionario", "conjunto", "tupla", "intervalo", "abrir", "tipo",
            "somar", "absoluto", "maximo", "minimo", "arredondar", "mapear", "filtrar", "ordenado",
            "super", "propriedade", "zipar", "enumerar", "objeto", "qualquer", "todos", "ajuda",
            "identidade", "reversivel", "formatar", "obter_atributo", "definir_atributo", "tem_atributo",
            "excluir_atributo", "representacao", "proximo", "iterador", "eh_instancia", "eh_subclasse",
            // Exceções do Python
            "Excessao", "ErroDeValor", "ErroDeTipo", "ErroDeNome", "ErroDeIndice", "ErroDeChave",
            "ErroDeImportacao", "ErroDeAtributo", "ErroDivisaoPorZero", "FaltaDeMemoria", "ParadaDeIteracao",
            "ErroDoSistema", "ArquivoNaoEncontrado", "InterrupcaoPeloTeclado", "ErroDeAsseveracao",
            "ErroDeExecucao", "ErroNaoImplementado",
            // Discord API Map
            "Robo", "Bot", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem",
            "Cor", "Embutido", "Modal", "ModalPT", "CaixaTexto", "Botao", "Selecao", "Visualizacao", "OpcaoSelecao",
            "prefixo", "evento", "comando", "nome", "ajuda", "enviar", "responder", "deletar",
            "adicionar_reacao", "remover_reacao", "expulsar", "banir", "limpar", "conteudo",
            "autor", "canal", "servidor", "mensagem", "usuario", "id", "canal_sistema", "permissoes",
            "expulsar_membros", "gerenciar_mensagens",
            // Módulos comuns integrados e variáveis padrão do python
            "os", "sys", "re", "json", "math", "random", "time", "datetime", "discord", "commands", "intents", "asyncio"
        ]);
        
        const localDecls = new Set();
        
        // Primeiro passo: identificar registros e declarações locais do arquivo ativo
        linhasLimpas.forEach(linha => {
            // 1. Funções/Definições: definir nome(param1, param2) ou funcao nome(...) ou definir assincrono nome(...)
            const matchFuncao = linha.match(/\b(?:funcao|definir)\s+(?:assincrono\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchFuncao) {
                localDecls.add(matchFuncao[1]);
            }
            
            // 2. Classes: classe Nome
            const matchClasse = linha.match(/\bclasse\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchClasse) {
                localDecls.add(matchClasse[1]);
            }
            
            // 3. Atribuições simples: var = valor ou var1, var2 = valor
            const matchAtribuicao = linha.match(/^[ \t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*=/);
            if (matchAtribuicao) {
                const variaveis = matchAtribuicao[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
            
            // 4. Loops para: para item em lista:
            const matchPara = linha.match(/\bpara\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s+em\b/);
            if (matchPara) {
                const variaveis = matchPara[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
        
            // 5. Parâmetros de funções: "definir meu_comando(ctx, membro):" ou "definir assincrono meu_comando(ctx):"
            const matchParams = linha.match(/\b(?:funcao|definir)\s+(?:assincrono\s+)?[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/);
            if (matchParams) {
                const paramsRaw = matchParams[1].split(",");
                paramsRaw.forEach(p => {
                    const pNome = p.trim().split(/\s*:/)[0].split(/\s*=/)[0].trim();
                    if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) {
                        localDecls.add(pNome);
                    }
                });
            }
            
            // 6. de módulo importar nome1, nome2
            const matchDeImportar = linha.match(/\bde\s+[a-zA-Z0-9_.]+\s+importar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchDeImportar) {
                const nomes = matchDeImportar[1].split(",");
                nomes.forEach(n => n.trim() && localDecls.add(n.trim()));
            }
            
            // 7. importar nome1, nome2 ou importar nome como alias
            const matchImportar = linha.match(/\bimportar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
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
        
        // Segundo passo: verificar palavra por palavra nas linhas limpas para detectar erros de sintaxe
        linhasLimpas.forEach((linha, indiceLinha) => {
            const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
            let match;
            
            while ((match = wordRegex.exec(linha)) !== null) {
                const palavra = match[0];
                const indiceInicio = match.index;
                
                // Ignoramos palavras que são apenas de 1 letra (variáveis simples locais comuns como x, i, j...)
                if (palavra.length <= 1) {
                    continue;
                }
                
                // Ignora se o termo for membro de um objeto / atributo que vem depois de um ponto '.'
                // ex: ctx.enviar ou membro.id
                const textoAntes = linha.substring(0, indiceInicio);
                if (/\.\s*$/.test(textoAntes)) {
                    continue;
                }
                
                // Ignora se for um decorator (ex: @bot.evento)
                if (/@\s*$/.test(textoAntes)) {
                    continue;
                }
                
                // Si for um número puro representado em string por algum motivo do regex, pula
                if (/^\d+$/.test(palavra)) {
                    continue;
                }
    
                // Ignora se for parâmetros nomeados / keyword arguments
                // ex: tempo_esgotado=120 ou nome="Meu Bot"
                const textoDepois = linha.substring(indiceInicio + palavra.length);
                if (/^\s*=(?!=)/.test(textoDepois)) {
                    continue;
                }
                if (/^\s*['"]/.test(textoDepois)) {
                    continue;
                }
                
                // Verifica se a palavra é válida na gramática ou conhecida
                if (!keywords.has(palavra) && !localDecls.has(palavra)) {
                    // É um erro de grafia ou uma palavra inexistente!
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
    } catch (e) {
        console.error("Falha ao analisar diagnósticos de Portulong silenciosamente:", e);
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Registra a coleção de diagnósticos (Linter)
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('portulong');
    context.subscriptions.push(diagnosticsCollection);

    // Valida o editor ativo inicial, se houver
    if (vscode.window.activeTextEditor) {
        atualizarDiagnosticos(vscode.window.activeTextEditor.document, diagnosticsCollection);
    }

    // Registra gerenciadores de eventos para validação contínua
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

        // Garante que o ficheiro é guardado antes de executar
        document.save().then(() => {
            const filePath = document.fileName;
            
            // Procura por um terminal do portulong existente, ou cria um novo
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong Executar');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong Executar');
            }
            
            terminal.show();
            // Executa o comando portulong executar <nome-do-ficheiro.ptg>
            // Utilizamos aspas duplas à volta do caminho para garantir suporte a caminhos com espaços
            terminal.sendText(`portulong executar "${filePath}"`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

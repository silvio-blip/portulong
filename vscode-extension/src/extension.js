const vscode = require('vscode');

function obterTextoSemStringsEComentarios(documento) {
    let texto = documento.getText();
    texto = texto.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, match => {
        return " ".repeat(match.length);
    });
    
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
    try {
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
            "VisualizacaoLayout", "Recipiente", "ExibicaoTexto", "Secao", "Separador", "Miniatura", "LinhaAcao", "cor_destaque", "tempo_esgotado",
            "prefixo", "evento", "comando", "nome", "ajuda", "enviar", "responder", "deletar",
            "adicionar_reacao", "remover_reacao", "expulsar", "banir", "limpar", "conteudo",
            "autor", "canal", "servidor", "mensagem", "usuario", "id", "canal_sistema", "permissoes",
            "expulsar_membros", "gerenciar_mensagens",
            "adicionar_campo", "definir_autor", "definir_imagem", "definir_miniatura", "definir_rodape", "limpar_campos",
            "os", "sys", "re", "json", "math", "random", "time", "datetime", "discord", "commands", "intents", "asyncio"
        ]);
        
        const localDecls = new Set();
        
        linhasLimpas.forEach(linha => {
            const matchFuncao = linha.match(/\b(?:funcao|definir)\s+(?:assincrono\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchFuncao) {
                localDecls.add(matchFuncao[1]);
            }
            
            const matchClasse = linha.match(/\bclasse\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchClasse) {
                localDecls.add(matchClasse[1]);
            }
            
            const matchAtribuicao = inlineAtribuicao(linha);
            if (matchAtribuicao) {
                const variaveis = matchAtribuicao[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
            
            const matchPara = linha.match(/\bpara\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s+em\b/);
            if (matchPara) {
                const variaveis = matchPara[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
        
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
            
            const matchDeImportar = linha.match(/\bde\s+[a-zA-Z0-9_.]+\s+importar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchDeImportar) {
                const nomes = matchDeImportar[1].split(",");
                nomes.forEach(n => n.trim() && localDecls.add(n.trim()));
            }
            
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
        
        linhasLimpas.forEach((linha, indiceLinha) => {
            const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
            let match;
            
            while ((match = wordRegex.exec(linha)) !== null) {
                const palavra = match[0];
                const indiceInicio = match.index;
                
                if (palavra.length <= 1) {
                    continue;
                }
                
                const textoAntes = linha.substring(0, indiceInicio);
                if (/\.\s*$/.test(textoAntes)) {
                    continue;
                }
                
                if (/@\s*$/.test(textoAntes)) {
                    continue;
                }
                
                if (/^\d+$/.test(palavra)) {
                    continue;
                }
                
                const textoDepois = linha.substring(indiceInicio + palavra.length);
                if (/^\s*=(?!=)/.test(textoDepois)) {
                    continue;
                }
                if (/^\s*['"]/.test(textoDepois)) {
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
    } catch (e) {
        console.error("Falha ao analisar diagnósticos de Portulong silenciosamente:", e);
    }
}

function inlineAtribuicao(str) {
    return str.match(/^[ \t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*=/);
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
            
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong');
            }
            
            terminal.show();
            // AQUI ESTÁ A MAGIA CORRIGIDA!
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

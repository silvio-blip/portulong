const vscode = require('vscode');

function obterTextoSemStringsEComentarios(documento) {
    let texto = documento.getText();
    texto = texto.replace(/"""[\s\S]*?"""|'\'\'[\s\S]*?'\'\'/g, match => {
        return " ".repeat(match.length);
    });
    
    const linhas = texto.split(/\r?\n/);
    const linhasLimpas = linhas.map(linha => {
        let linhaLimpa = "";
        let insideString = false;
        let charString = null;
        let escorregou = false;
        
        for (let i = 0; i < linha.length; i++) {
            const c = inlineChar(linha, i);
            
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

function inlineChar(linha, i) {
    return linha[i];
}

function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            if (b[j - 1] === a[i - 1]) {
                matrix[j][i] = matrix[j - 1][i - 1];
            } else {
                matrix[j][i] = Math.min(matrix[j - 1][i - 1] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}

function findTypo(word, keywordsSet) {
    if (keywordsSet.has(word)) return null;
    for (const kw of keywordsSet) {
        if (kw.toLowerCase() === word.toLowerCase()) {
            return { correct: kw, errorType: "casing" };
        }
    }
    for (const kw of keywordsSet) {
        if (getEditDistance(kw.toLowerCase(), word.toLowerCase()) <= 1) {
            return { correct: kw, errorType: "misspecified" };
        }
    }
    return null;
}

function parseScopes(document) {
    const scopes = [];
    const activeScopesStack = [];
    const lineCount = document.lineCount;

    for (let i = 0; i < lineCount; i++) {
        const line = document.lineAt(i);
        const trimmed = line.text.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const indent = line.text.search(/\S/);

        while (activeScopesStack.length > 0 && activeScopesStack[activeScopesStack.length - 1].indent >= indent && indent !== -1) {
            const popped = activeScopesStack.pop();
            if (popped) {
                popped.lineEnd = i;
            }
        }

        const classMatch = trimmed.match(/^classe\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
            const className = classMatch[1];
            const newScope = {
                type: "classe",
                name: className,
                lineStart: i,
                lineEnd: lineCount,
                indent,
                selfVariables: new Set(),
                parameters: new Set(),
                localVars: new Set()
            };
            scopes.push(newScope);
            activeScopesStack.push(newScope);
            continue;
        }

        const fnMatch = trimmed.match(/^(?:definir|funcao)\s+(?:assincrono\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
        if (fnMatch) {
            const fnName = fnMatch[1];
            const paramsRaw = fnMatch[2].split(",");
            const paramsSet = new Set();
            paramsRaw.forEach(p => {
                const pNome = p.trim().split(/\s*:/)[0].split(/\s*=/)[0].trim();
                if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) {
                    paramsSet.add(pNome);
                }
            });

            const parent = activeScopesStack.find(s => s.type === "classe");

            const newScope = {
                type: parent ? "metodo" : "funcao",
                name: fnName,
                lineStart: i,
                lineEnd: lineCount,
                indent,
                parentScopeName: parent ? parent.name : null,
                selfVariables: parent ? parent.selfVariables : new Set(),
                parameters: paramsSet,
                localVars: new Set()
            };
            scopes.push(newScope);
            activeScopesStack.push(newScope);
            continue;
        }

        const currentScope = activeScopesStack[activeScopesStack.length - 1];
        if (currentScope) {
            const selfAssignMatch = trimmed.match(/(?:self|eu)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
            if (selfAssignMatch) {
                currentScope.selfVariables.add(selfAssignMatch[1].trim());
            }

            const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*=/);
            if (assignMatch) {
                const vars = assignMatch[1].split(",");
                vars.forEach(v => {
                    const vTrim = v.trim();
                    if (vTrim !== "self" && vTrim !== "eu") {
                        currentScope.localVars.add(vTrim);
                    }
                });
            }
        }
    }

    while (activeScopesStack.length > 0) {
        const popped = activeScopesStack.pop();
        if (popped) popped.lineEnd = lineCount;
    }

    return scopes;
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
            "Excessao", "Excecao", "executar_codigo", "erro", "ErroDeValor", "ErroDeTipo", "ErroDeNome", "ErroDeIndice", "ErroDeChave",
            "ErroDeImportacao", "ErroDeAtributo", "ErroDivisaoPorZero", "FaltaDeMemoria", "ParadaDeIteracao",
            "ErroDoSistema", "ArquivoNaoEncontrado", "InterrupcaoPeloTeclado", "ErroDeAsseveracao",
            "ErroDeExecucao", "ErroNaoImplementado",
            "Robo", "Bot", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem",
            "Cor", "Embutido", "Modal", "ModalPT", "CaixaTexto", "Botao", "Selecao", "Visualizacao", "OpcaoSelecao",
            "VisualizacaoLayout", "Recipiente", "ExibicaoTexto", "Secao", "Separador", "Miniatura", "LinhaAcao", "cor_destaque", "tempo_esgotado",
            "prefixo", "evento", "comando", "nome", "ajuda", "enviar", "responder", "deletar",
            "adicionar_reacao", "remover_reacao", "expulsar", "banir", "limpar", "conteudo", "visualizacao",
            "autor", "canal", "servidor", "mensagem", "usuario", "id", "canal_sistema", "permissoes",
            "expulsar_membros", "gerenciar_mensagens",
            "adicionar_campo", "definir_autor", "definir_imagem", "definir_miniatura", "definir_rodape", "limpar_campos",
            "os", "sys", "re", "json", "math", "random", "time", "datetime", "discord", "commands", "intents", "asyncio"
        ]);
        
        const parsedScopes = parseScopes(document);
        const localDecls = new Set();
        
        linhasLimpas.forEach(linha => {
            const matchFuncao = linha.match(/\b(?:funcao|definir)\s+(?:assincrono\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchFuncao) localDecls.add(matchFuncao[1]);
            
            const matchClasse = linha.match(/\bclasse\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchClasse) localDecls.add(matchClasse[1]);
            
            const matchAtribuicao = linha.match(/^[ \t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*=/);
            if (matchAtribuicao) {
                matchAtribuicao[1].split(",").forEach(v => localDecls.add(v.trim()));
            }
            
            const matchPara = linha.match(/\bpara\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s+em\b/);
            if (matchPara) {
                matchPara[1].split(",").forEach(v => localDecls.add(v.trim()));
            }

            const matchExceto = linha.match(/\bexceto\s+[a-zA-Z0-9_.]+\s+como\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchExceto) localDecls.add(matchExceto[1]);
        
            const matchParams = linha.match(/\b(?:funcao|definir)\s+(?:assincrono\s+)?[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/);
            if (matchParams) {
                matchParams[1].split(",").forEach(p => {
                    const pNome = p.trim().split(/\s*:/)[0].split(/\s*=/)[0].trim();
                    if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) localDecls.add(pNome);
                });
            }
            
            const matchDeImportar = linha.match(/\bde\s+[a-zA-Z0-9_.]+\s+importar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchDeImportar) {
                matchDeImportar[1].split(",").forEach(n => n.trim() && localDecls.add(n.trim()));
            }
            
            const matchImportar = linha.match(/\bimportar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchImportar) {
                matchImportar[1].split(",").forEach(p => {
                    const pTrim = p.trim();
                    if (pTrim.includes(" como ")) {
                        localDecls.add(pTrim.split(" como ")[1].trim());
                    } else {
                        localDecls.add(pTrim);
                    }
                });
            }
        });
        
        let activeCursor = null;
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document === document) {
            activeCursor = activeEditor.selection.active;
        }

        linhasLimpas.forEach((linha, indiceLinha) => {
            const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
            let match;
            
            const blockKeywords = ["se", "senaose", "senao", "para", "enquanto", "definir", "funcao", "classe", "tentar", "exceto"];
            const trimmedLine = linha.trim();
            if (trimmedLine.length > 0) {
                const firstWordMatch = trimmedLine.match(/^([a-zA-Z0-9_]+)/);
                if (firstWordMatch) {
                    const firstWord = firstWordMatch[1];
                    if (blockKeywords.includes(firstWord) && !trimmedLine.endsWith(":")) {
                        const range = new vscode.Range(
                            new vscode.Position(indiceLinha, 0),
                            new vscode.Position(indiceLinha, linha.length)
                        );
                        diagnostics.push(new vscode.Diagnostic(
                            range,
                            `Erro de Sintaxe: Falta do caractere dois-pontos ':' ao final da instrução '${firstWord}'.`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                }
            }

            let activeScope = null;
            for (const s of parsedScopes) {
                if (indiceLinha >= s.lineStart && indiceLinha <= s.lineEnd) {
                    if (!activeScope || s.indent > activeScope.indent) {
                        activeScope = s;
                    }
                }
            }
            
            while ((match = wordRegex.exec(linha)) !== null) {
                const palavra = match[0];
                const indiceInicio = match.index;
                
                if (palavra.length <= 1) continue;
                
                const textoAntes = linha.substring(0, indiceInicio);
                if (/\.\s*$/.test(textoAntes)) continue;
                if (/@\s*$/.test(textoAntes)) continue;
                if (/^\d+$/.test(palavra)) continue;
                
                const textoDepois = inlineSub(linha, indiceInicio, palavra);
                if (/^\s*=(?!=)/.test(textoDepois)) continue;
                if (/^\s*['"]/.test(textoDepois)) continue;
                
                if (activeCursor && indiceLinha === activeCursor.line) {
                    if (activeCursor.character >= indiceInicio && activeCursor.character <= indiceInicio + palavra.length) {
                        continue;
                    }
                }

                const typoMatch = findTypo(palavra, keywords);
                if (typoMatch) {
                    const range = new vscode.Range(
                        new vscode.Position(indiceLinha, indiceInicio),
                        new vscode.Position(indiceLinha, indiceInicio + palavra.length)
                    );
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        typoMatch.errorType === "casing"
                            ? `Erro de Capitalização: Escreva '${typoMatch.correct}' (letras corretas) em vez de '${palavra}'.`
                            : `Erro de Digitação: Você quis dizer '${typoMatch.correct}' em vez de '${palavra}'?`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostic.code = 'capitalization-error';
                    diagnostics.push(diagnostic);
                    continue;
                }

                if (palavra === "self" || palavra === "eu") {
                    if (!activeScope || (activeScope.type !== "metodo" && activeScope.type !== "classe")) {
                        const range = new vscode.Range(new vscode.Position(indiceLinha, indiceInicio), new vscode.Position(indiceLinha, indiceInicio + palavra.length));
                        diagnostics.push(new vscode.Diagnostic(range, `O objeto '${palavra}' só é válido dentro dos métodos de uma classe.`, vscode.DiagnosticSeverity.Error));
                        continue;
                    }
                    if (!activeScope.parameters.has(palavra)) {
                        const range = new vscode.Range(new vscode.Position(indiceLinha, indiceInicio), new vscode.Position(indiceLinha, indiceInicio + palavra.length));
                        diagnostics.push(new vscode.Diagnostic(range, `O parâmetro de instância '${palavra}' deve ser declarado na assinatura do método.`, vscode.DiagnosticSeverity.Error));
                        continue;
                    }
                }

                if (palavra === "ctx" || palavra === "CTX" || palavra === "contexto") {
                    if (!activeScope) {
                        if (!localDecls.has(palavra)) {
                            const range = new vscode.Range(new vscode.Position(indiceLinha, indiceInicio), new vscode.Position(indiceLinha, indiceInicio + palavra.length));
                            diagnostics.push(new vscode.Diagnostic(range, `O objeto de contexto '${palavra}' não está definido.`, vscode.DiagnosticSeverity.Error));
                        }
                        continue;
                    }
                    if (!activeScope.parameters.has(palavra) && !activeScope.localVars.has(palavra) && !localDecls.has(palavra)) {
                        const range = new vscode.Range(new vscode.Position(indiceLinha, indiceInicio), new vscode.Position(indiceLinha, indiceInicio + palavra.length));
                        diagnostics.push(new vscode.Diagnostic(range, `O contexto '${palavra}' precisa ser declarado como parâmetro desta função.`, vscode.DiagnosticSeverity.Error));
                        continue;
                    }
                }

                const isLocalValid = localDecls.has(palavra) || 
                                     (activeScope && (activeScope.parameters.has(palavra) || activeScope.localVars.has(palavra)));

                if (!keywords.has(palavra) && !isLocalValid) {
                    const range = new vscode.Range(
                        new vscode.Position(indiceLinha, indiceInicio),
                        new vscode.Position(indiceLinha, indiceInicio + palavra.length)
                    );
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Sintaxe inválida: '${palavra}' não é reconhecida no Portulong e não foi declarada localmente.`,
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

function inlineSub(linha, indiceInicio, palavra) {
    return linha.substring(indiceInicio + palavra.length);
}

function activate(context) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('portulong');
    context.subscriptions.push(diagnosticsCollection);

    if (vscode.window.activeTextEditor) {
        atualizarDiagnosticos(vscode.window.activeTextEditor.document, diagnosticsCollection);
    }

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) atualizarDiagnosticos(editor.document, diagnosticsCollection);
    }));

    // Debounce de 300ms nos diagnósticos ao digitar, para não travar o editor
    let dTimeout;
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (dTimeout) clearTimeout(dTimeout);
        dTimeout = setTimeout(() => {
            atualizarDiagnosticos(event.document, diagnosticsCollection);
        }, 300);
    }));

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => {
        diagnosticsCollection.delete(doc.uri);
    }));

    // =====================================================================
    // 1. AUTO-COMPLETAR GERAL (Assim que digitas qualquer letra)
    // =====================================================================
    const providerAbreviacoes = vscode.languages.registerCompletionItemProvider(
        'portulong',
        {
            provideCompletionItems(document, position) {
                const completions = [];

                // Função auxiliar para injetar dicas bonitas com alta prioridade de exibição
                const criarSnippet = (label, texto, detalhe, tipo = vscode.CompletionItemKind.Snippet) => {
                    const item = new vscode.CompletionItem(label, tipo);
                    item.insertText = new vscode.SnippetString(texto);
                    item.detail = detalhe;
                    item.sortText = `00_${label}`;
                    return item;
                };

                // --- ESTRUTURAS CHAVE (Snippets grandes e melhorados) ---
                completions.push(criarSnippet("tentar (Bloco Seguro)", "tentar:\n\t$1\nexceto Excecao como erro:\n\tescrever(f\"❌ Erro: {erro}\")", "Cria um bloco try/except"));
                completions.push(criarSnippet("se (Condição)", "se $1:\n\t$2", "Estrutura de condição simples"));
                completions.push(criarSnippet("senaose (Condição Alternativa)", "senaose $1:\n\t$2", "Condição alternativa"));
                completions.push(criarSnippet("senao (Condição Final)", "senao:\n\t$1", "Condição final"));
                completions.push(criarSnippet("definir (Função)", "definir $1($2):\n\t$3", "Cria uma função padrão"));
                completions.push(criarSnippet("assincrono (Função Assíncrona)", "definir assincrono $1($2):\n\t$3", "Cria uma função assíncrona"));
                completions.push(criarSnippet("para (Loop)", "para $1 em $2:\n\t$3", "Cria um loop for"));
                completions.push(criarSnippet("escrever_f (Escrever Formatado)", "escrever(f\"$1\")", "Escreve uma linha formatada no console"));
                completions.push(criarSnippet("classe (Classe)", "classe $1:\n\tdefinir __init__(eu):\n\t\t$2", "Estrutura orientada a objetos"));
                completions.push(criarSnippet("evento (Evento Discord)", "@bot.evento\ndefinir assincrono ao_se_conectar():\n\tescrever(f\"✅ Bot {bot.usuario.nome} está online!\")", "Cria um ouvinte para um evento do Discord"));
                completions.push(criarSnippet("comando (Comando Discord Prefixado)", "@bot.comando(nome=\"$1\", ajuda=\"$2\")\ndefinir assincrono com_$1(ctx):\n\taguardar ctx.enviar(\"$3\")", "Gera um comando prefixado completo"));
                completions.push(criarSnippet("comando_barra (Comando de Barra Slash)", "@bot.comando_barra(nome=\"$1\", descricao=\"$2\")\ndefinir assincrono barra_$1(interacao):\n\taguardar discord.ObjetoProxy(interacao).resposta.enviar_mensagem(conteudo=\"$3\", efemero=Verdadeiro)", "Gera um Slash Command completo"));
                completions.push(criarSnippet("embutido (Embed Elegante)", "embed = discord.Embutido(titulo=\"$1\", descricao=\"$2\", cor=discord.Cor.verde())\nembed.definir_rodape(texto=\"$3\")\naguardar canal.enviar(embutido=embed)", "Gera um painel com cartão embutido (Embed) do Discord"));
                completions.push(criarSnippet("botao (Botão Interativo)", "meu_botao = discord.Botao(rotulo=\"$1\", estilo=discord.EstiloBotao.verde)\n\ndefinir assincrono acao_botao(interacao):\n\taguardar interacao.resposta.enviar_mensagem(\"$2\", efemero=Verdadeiro)\n\nmeu_botao.ao_clicar = acao_botao", "Gera um botão clicável com eventos do Discord"));

                // --- PALAVRAS INDIVIDUAIS COM AUTO-COMPLETAR INTELIGENTE ---
                const palavrasChave = [
                    "importar", "de", "como", "enquanto", "retornar", "parar", "continuar", "passar",
                    "finalmente", "levantar", "aguardar", "com", "global", "asseverar", "funcao", 
                    "Verdadeiro", "Falso", "Nulo", "e", "ou", "nao", "em", "eh", "nao_eh"
                ];
                
                const metodosBase = [
                    "escrever", "mostrar", "ler", "tamanho", "inteiro", "texto", "real", "decimal",
                    "boleano", "lista", "dicionario", "conjunto", "tupla", "intervalo", "abrir", "tipo",
                    "somar", "absoluto", "maximo", "minimo", "arredondar", "executar_codigo", "Excecao"
                ];

                const palavrasDiscord = [
                    "contexto", "ctx", "bot", "cliente", "interacao", "discord", "commands",
                    "Cor", "Embutido", "ModalPT", "CaixaTexto", "Botao", "Selecao", "VisualizacaoLayout",
                    "Recipiente", "ExibicaoTexto", "Secao", "Separador", "Miniatura", "LinhaAcao"
                ];

                palavrasChave.forEach(p => {
                    const item = new vscode.CompletionItem(p, vscode.CompletionItemKind.Keyword);
                    item.sortText = `00_${p}`;
                    completions.push(item);
                });
                
                metodosBase.forEach(p => {
                    const item = new vscode.CompletionItem(p, vscode.CompletionItemKind.Function);
                    item.sortText = `00_${p}`;
                    completions.push(item);
                });
                
                palavrasDiscord.forEach(p => {
                    const item = new vscode.CompletionItem(p, vscode.CompletionItemKind.Class);
                    item.sortText = `00_${p}`;
                    completions.push(item);
                });

                return completions;
            }
        }
    );
    context.subscriptions.push(providerAbreviacoes);

    // =====================================================================
    // 2. O MENU MÁGICO DOS PONTOS "." (Para ctx, interacao, bot, embed)
    // =====================================================================
    const providerMetodos = vscode.languages.registerCompletionItemProvider(
        'portulong',
        {
            provideCompletionItems(document, position) {
                const prefixoLinha = document.lineAt(position).text.substr(0, position.character);

                // MENU: ctx. ou contexto.
                if (prefixoLinha.endsWith('ctx.') || prefixoLinha.endsWith('contexto.')) {
                    return [
                        new vscode.CompletionItem('enviar', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('responder', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('apagar', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('buscar_mensagem', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('autor', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('canal', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('servidor', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('mensagem', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('comando', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('prefixo', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('voz_cliente', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('id', vscode.CompletionItemKind.Property)
                    ];
                }

                // MENU: interacao.
                if (prefixoLinha.endsWith('interacao.')) {
                    return [
                        new vscode.CompletionItem('resposta', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('usuario', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('canal', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('servidor', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('mensagem', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('token', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('dados', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('id', vscode.CompletionItemKind.Property)
                    ];
                }

                // MENU: interacao.resposta.
                if (prefixoLinha.endsWith('interacao.resposta.')) {
                    return [
                        new vscode.CompletionItem('enviar_mensagem', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('editar_mensagem', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('enviar_modal', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('diferir', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('esta_feita', vscode.CompletionItemKind.Property)
                    ];
                }

                // MENU: bot. ou cliente.
                if (prefixoLinha.endsWith('bot.') || prefixoLinha.endsWith('cliente.')) {
                    return [
                        new vscode.CompletionItem('executar', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('fechar', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('mudar_presenca', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('obter_canal', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('obter_servidor', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('obter_usuario', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('usuario', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('servidores', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('latencia', vscode.CompletionItemKind.Property),
                        new vscode.CompletionItem('comandos', vscode.CompletionItemKind.Property)
                    ];
                }

                // MENU: embed. (Para facilitar o design)
                if (prefixoLinha.endsWith('embed.')) {
                    return [
                        new vscode.CompletionItem('adicionar_campo', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('definir_autor', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('definir_imagem', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('definir_miniatura', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('definir_rodape', vscode.CompletionItemKind.Method),
                        new vscode.CompletionItem('limpar_campos', vscode.CompletionItemKind.Method)
                    ];
                }

                return undefined;
            }
        },
        '.' // O gatilho! O auto-completar inteligente só aciona quando se digita o ponto.
    );
    context.subscriptions.push(providerMetodos);

    // =====================================================================
    // 3. DETECTOR DE SÍMBOLOS (Classes e Funções para Outline & Breadcrumbs)
    // =====================================================================
    const providerSimbolos = vscode.languages.registerDocumentSymbolProvider(
        'portulong',
        {
            provideDocumentSymbols(document) {
                const symbols = [];
                const regexFuncao = /^\s*(?:definir\s+(?:assincrono\s+)?|funcao\s+)([a-zA-Z_][a-zA-Z0-9_]*)/;
                const regexClasse = /^\s*classe\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
                
                let currentClassSymbol = null;
                let classIndent = -1;

                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    if (line.isEmptyOrWhitespace) continue;

                    const text = line.text;
                    const indent = line.firstNonWhitespaceCharacterIndex;

                    const matchClasse = text.match(regexClasse);
                    if (matchClasse) {
                        const name = matchClasse[1];
                        const range = new vscode.Range(i, 0, i, text.length);
                        const selectionRange = new vscode.Range(i, text.indexOf(name), i, text.indexOf(name) + name.length);
                        
                        const classSymbol = new vscode.DocumentSymbol(
                            name,
                            'Classe',
                            vscode.SymbolKind.Class,
                            range,
                            selectionRange
                        );
                        
                        symbols.push(classSymbol);
                        currentClassSymbol = classSymbol;
                        classIndent = indent;
                        continue;
                    }

                    const matchFuncao = text.match(regexFuncao);
                    if (matchFuncao) {
                        const name = matchFuncao[1];
                        const range = new vscode.Range(i, 0, i, text.length);
                        const selectionRange = new vscode.Range(i, text.indexOf(name), i, text.indexOf(name) + name.length);
                        
                        const funcSymbol = new vscode.DocumentSymbol(
                            name,
                            'Função',
                            vscode.SymbolKind.Function,
                            range,
                            selectionRange
                        );

                        if (currentClassSymbol && indent > classIndent) {
                            currentClassSymbol.children.push(funcSymbol);
                        } else {
                            symbols.push(funcSymbol);
                            if (indent <= classIndent) {
                                currentClassSymbol = null;
                                classIndent = -1;
                            }
                        }
                    }
                }
                return symbols;
            }
        }
    );
    context.subscriptions.push(providerSimbolos);

    // =====================================================================
    // O COMANDO PARA LIGAR O BOT NO TERMINAL
    // =====================================================================
    let disposable = vscode.commands.registerCommand('portulong.executar', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;

        const document = activeEditor.document;
        document.save().then(() => {
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong');
            if (!terminal) terminal = vscode.window.createTerminal('Portulong');
            
            terminal.show();
            terminal.sendText(`portulong executar "${document.fileName}"`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

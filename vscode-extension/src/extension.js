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
        
        linhasLimpas.forEach((linha, indiceLinha) => {
            const wordRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
            let match;
            
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
                
                if (!keywords.has(palavra) && !localDecls.has(palavra)) {
                    const range = new vscode.Range(
                        new vscode.Position(indiceLinha, indiceInicio),
                        new vscode.Position(indiceLinha, indiceInicio + palavra.length)
                    );
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Sintaxe inválida: '${palavra}' não é reconhecida no Portulong.`,
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

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        atualizarDiagnosticos(event.document, diagnosticsCollection);
    }));

    // =====================================================================
    // 1. AUTO-COMPLETAR GERAL (Assim que digitas qualquer letra)
    // =====================================================================
    const providerAbreviacoes = vscode.languages.registerCompletionItemProvider(
        { pattern: '**/*.ptg' },
        {
            provideCompletionItems(document, position) {
                const completions = [];

                // Função auxiliar para injetar dicas bonitas
                const criarSnippet = (label, texto, detalhe, tipo = vscode.CompletionItemKind.Snippet) => {
                    const item = new vscode.CompletionItem(label, tipo);
                    item.insertText = new vscode.SnippetString(texto);
                    item.detail = detalhe;
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

                palavrasChave.forEach(p => completions.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.Keyword)));
                metodosBase.forEach(p => completions.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.Function)));
                palavrasDiscord.forEach(p => completions.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.Class)));

                return completions;
            }
        }
    );
    context.subscriptions.push(providerAbreviacoes);

    // =====================================================================
    // 2. O MENU MÁGICO DOS PONTOS "." (Para ctx, interacao, bot, embed)
    // =====================================================================
    const providerMetodos = vscode.languages.registerCompletionItemProvider(
        { pattern: '**/*.ptg' },
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

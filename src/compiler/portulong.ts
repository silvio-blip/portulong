/**
 * Portulong Compiler - Interpretação e compilação de código .ptg (100% PT-PT)
 * Traduz a sintaxe Portulong para HTML5, CSS3 e JavaScript nativamente em memória.
 */

export interface CompileResult {
  html: string;
  titulo: string;
  rotas: Record<string, { metodo: string; codigo: string }>;
  componentes: Record<string, string>;
  estilos: string;
  scripts: string;
}

export class Empretador {
  titulo: string = "Aplicação Portulong";
  elementos: string[] = [];
  estilos: string[] = [];
  funcoes: string[] = [];
  imports: string[] = [];
  rotas: Record<string, { metodo: string; codigo: string }> = {};
  componentes: Record<string, string> = {};
  porta: number = 3000;
  host: string = "0.0.0.0";
  temComandosConsola: boolean = false;
  exibirBarra: boolean = false;

  // Tradução de CSS em Português para CSS padrão
  traduzirCSS(linha: string): string {
    let css = linha;
    css = css.replace(/^\s*corpo\b/i, "body");

    const mapaPropriedades: [RegExp, string][] = [
      [/\bfundo\s*:/gi, "background:"],
      [/\bcor-fundo\s*:/gi, "background-color:"],
      [/\bcor\s*:/gi, "color:"],
      [/\btamanho-fonte\s*:/gi, "font-size:"],
      [/\bpeso-fonte\s*:/gi, "font-weight:"],
      [/\bfonte-familia\s*:/gi, "font-family:"],
      [/\bestilo-fonte\s*:/gi, "font-style:"],
      [/\balinhamento-texto\s*:/gi, "text-align:"],
      [/\btexto-centro\s*:/gi, "text-align:"],
      [/\btexto-decoracao\s*:/gi, "text-decoration:"],
      [/\baltura-linha\s*:/gi, "line-height:"],
      [/\blargura\s*:/gi, "width:"],
      [/\blargura-maxima\s*:/gi, "max-width:"],
      [/\blargura-minima\s*:/gi, "min-width:"],
      [/\baltura\s*:/gi, "height:"],
      [/\baltura-maxima\s*:/gi, "max-height:"],
      [/\baltura-minima\s*:/gi, "min-height:"],
      [/\bmargem\s*:/gi, "margin:"],
      [/\bmargem-topo\s*:/gi, "margin-top:"],
      [/\bmargem-base\s*:/gi, "margin-bottom:"],
      [/\bmargem-inferior\s*:/gi, "margin-bottom:"],
      [/\bmargem-esquerda\s*:/gi, "margin-left:"],
      [/\bmargem-direita\s*:/gi, "margin-right:"],
      [/\bpreenchimento\s*:/gi, "padding:"],
      [/\bespacamento\s*:/gi, "padding:"],
      [/\bespacamento-topo\s*:/gi, "padding-top:"],
      [/\bespacamento-base\s*:/gi, "padding-bottom:"],
      [/\bespacamento-inferior\s*:/gi, "padding-bottom:"],
      [/\bespacamento-esquerda\s*:/gi, "padding-left:"],
      [/\bespacamento-direita\s*:/gi, "padding-right:"],
      [/\bborda\s*:/gi, "border:"],
      [/\bborda-base\s*:/gi, "border-bottom:"],
      [/\bborda-topo\s*:/gi, "border-top:"],
      [/\bborda-esquerda\s*:/gi, "border-left:"],
      [/\bborda-direita\s*:/gi, "border-right:"],
      [/\bborda-arredondada\s*:/gi, "border-radius:"],
      [/\bborda-cor\s*:/gi, "border-color:"],
      [/\bborda-largura\s*:/gi, "border-width:"],
      [/\bborda-estilo\s*:/gi, "border-style:"],
      [/\bestilo-lista\s*:/gi, "list-style:"],
      [/\bsombra\s*:/gi, "box-shadow:"],
      [/\bsombra-texto\s*:/gi, "text-shadow:"],
      [/\bopacidade\s*:/gi, "opacity:"],
      [/\bexibicao\s*:/gi, "display:"],
      [/\bposicao\s*:/gi, "position:"],
      [/\btopo\s*:/gi, "top:"],
      [/\bbase\s*:/gi, "bottom:"],
      [/\besquerda\s*:/gi, "left:"],
      [/\bdireita\s*:/gi, "right:"],
      [/\bindice-z\s*:/gi, "z-index:"],
      [/\bcursor\s*:/gi, "cursor:"],
      [/\btransicao\s*:/gi, "transition:"],
      [/\bintervalo\s*:/gi, "gap:"],
      [/\bjustificar-conteudo\s*:/gi, "justify-content:"],
      [/\balinhar-itens\s*:/gi, "align-items:"],
      [/\bflex-direcao\s*:/gi, "flex-direction:"],
    ];

    for (const [padrao, substituto] of mapaPropriedades) {
      css = css.replace(padrao, substituto);
    }

    css = css.replace(/:\s*branco\b/gi, ": white");
    css = css.replace(/:\s*preto\b/gi, ": black");
    css = css.replace(/:\s*vermelho\b/gi, ": red");
    css = css.replace(/:\s*verde\b/gi, ": green");
    css = css.replace(/:\s*azul\b/gi, ": blue");
    css = css.replace(/:\s*amarelo\b/gi, ": yellow");
    css = css.replace(/:\s*cinzento\b/gi, ": gray");
    css = css.replace(/:\s*cinza\b/gi, ": gray");
    css = css.replace(/:\s*centro\b/gi, ": center");
    css = css.replace(/:\s*ponteiro\b/gi, ": pointer");
    css = css.replace(/:\s*flexivel\b/gi, ": flex");
    css = css.replace(/:\s*grade\b/gi, ": grid");
    css = css.replace(/:\s*bloqueio\b/gi, ": block");
    css = css.replace(/:\s*nenhum\b/gi, ": none");
    css = css.replace(/:\s*coluna\b/gi, ": column");
    css = css.replace(/:\s*linha\b/gi, ": row");
    css = css.replace(/:\s*espaco-entre\b/gi, ": space-between");
    css = css.replace(/:\s*espaco-ao-redor\b/gi, ": space-around");
    css = css.replace(/:\s*negrito\b/gi, ": bold");
    css = css.replace(/:\s*normal\b/gi, ": normal");

    return css;
  }

  traduzirScript(linhas: string[]): string {
    const jsLinhas: string[] = [];
    const indentStack: number[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const rawLinha = linhas[i];
      let trimmed = rawLinha.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const indent = rawLinha.search(/\S|$/);

      while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
        jsLinhas.push("}");
      }

      // interromper (break) e continuar (continue)
      if (["interromper", "parar", "quebrar"].includes(trimmed)) {
        jsLinhas.push("break;");
        continue;
      }
      if (trimmed === "continuar") {
        jsLinhas.push("continue;");
        continue;
      }

      // repetir: (loop infinito)
      if (trimmed === "repetir:") {
        jsLinhas.push("while (true) {");
        indentStack.push(indent);
        continue;
      }

      // para cada item em colecao:
      const matchParaCada = trimmed.match(/^para\s+cada\s+([a-zA-Z0-9_]+)\s+em\s+(.*?)\s*:$/);
      if (matchParaCada) {
        const [, itemVar, colecao] = matchParaCada;
        jsLinhas.push(`(${colecao} || []).forEach(function(${itemVar}) {`);
        indentStack.push(indent);
        continue;
      }

      // funcao nome(args):
      const matchFuncao = trimmed.match(/^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$/);
      if (matchFuncao) {
        const [, nome, args] = matchFuncao;
        jsLinhas.push(`function ${nome}(${args}) {`);
        indentStack.push(indent);
        continue;
      }

      // funcao anonima como callback: funcao(dados):
      if (/funcao\s*\((.*?)\)\s*:/.test(trimmed)) {
        trimmed = trimmed.replace(/funcao\s*\((.*?)\)\s*:/, "function($1) {");
        jsLinhas.push(trimmed);
        indentStack.push(indent);
        continue;
      }

      // se condicao:
      const matchSe = trimmed.match(/^se\s+(.*?)\s*:$/);
      if (matchSe) {
        let cond = matchSe[1]
          .replace(/\be\b/g, "&&")
          .replace(/\bou\b/g, "||")
          .replace(/\bnao\b/g, "!");
        jsLinhas.push(`if (${cond}) {`);
        indentStack.push(indent);
        continue;
      }

      // senao se condicao:
      const matchSenaoSe = trimmed.match(/^senao\s+se\s+(.*?)\s*:$/);
      if (matchSenaoSe) {
        let cond = matchSenaoSe[1]
          .replace(/\be\b/g, "&&")
          .replace(/\bou\b/g, "||")
          .replace(/\bnao\b/g, "!");
        jsLinhas.push(`else if (${cond}) {`);
        indentStack.push(indent);
        continue;
      }

      // senao:
      if (trimmed === "senao:") {
        jsLinhas.push("else {");
        indentStack.push(indent);
        continue;
      }

      // enquanto condicao:
      const matchEnquanto = trimmed.match(/^enquanto\s+(.*?)\s*:$/);
      if (matchEnquanto) {
        let cond = matchEnquanto[1]
          .replace(/\be\b/g, "&&")
          .replace(/\bou\b/g, "||")
          .replace(/\bnao\b/g, "!");
        jsLinhas.push(`while (${cond}) {`);
        indentStack.push(indent);
        continue;
      }

      // para var de ini ate fim:
      const matchPara = trimmed.match(/^para\s+([a-zA-Z0-9_]+)\s+de\s+(.*?)\s+ate\s+(.*?)\s*:$/);
      if (matchPara) {
        const [, v, ini, fim] = matchPara;
        jsLinhas.push(`for (let ${v} = ${ini}; ${v} <= ${fim}; ${v}++) {`);
        indentStack.push(indent);
        continue;
      }

      // Helpers e palavras-chave em Português
      let processed = trimmed;
      processed = processed.replace(/\bverdadeiro\b/g, "true");
      processed = processed.replace(/\bfalso\b/g, "false");
      processed = processed.replace(/\bnulo\b/g, "null");
      processed = processed.replace(/\bretornar\s+(.*)/, "return $1;");
      processed = processed.replace(/\balerta\s*\(/g, "alerta(");

      // Tratamento de escrever / imprimir (tanto escrever(...) como escrever "...")
      if (/^(escrever|imprimir)\s*\((.*?)\)$/.test(processed)) {
        processed = processed.replace(/^(escrever|imprimir)\s*\((.*?)\)$/, "__escrever($2);");
        this.temComandosConsola = true;
      } else if (/^(escrever|imprimir)\s+(.*)$/.test(processed)) {
        processed = processed.replace(/^(escrever|imprimir)\s+(.*)$/, "__escrever($2);");
        this.temComandosConsola = true;
      } else {
        processed = processed.replace(/\bescrever\s*\(/g, "__escrever(");
        processed = processed.replace(/\bimprimir\s*\(/g, "__escrever(");
      }

      processed = processed.replace(/\bler\s*\((.*?)\)/g, "prompt($1)");
      processed = processed.replace(/\bler\s*\(\)/g, "prompt()");
      processed = processed.replace(/\bobter_valor\s*\((.*?)\)/g, "__obter_valor($1)");
      processed = processed.replace(/\bdefinir_valor\s*\((.*?),\s*(.*?)\)/g, "__definir_valor($1, $2)");
      processed = processed.replace(/\bobter_elemento\s*\((.*?)\)/g, "document.getElementById($1)");
      processed = processed.replace(/\bdefinir_texto\s*\((.*?),\s*(.*?)\)/g, "__definir_texto($1, $2)");
      processed = processed.replace(/\bdefinir_conteudo\s*\((.*?),\s*(.*?)\)/g, "__definir_conteudo($1, $2)");
      processed = processed.replace(/\blimpar_elemento\s*\((.*?)\)/g, "__limpar_elemento($1)");
      processed = processed.replace(/\badicionar_item\s*\((.*?),\s*(.*?)\)/g, "__adicionar_item($1, $2)");
      processed = processed.replace(/\bpedir_dados\s*\((.*?),\s*/g, "__pedir_dados($1, ");
      processed = processed.replace(/\benviar_dados\s*\((.*?),\s*(.*?),\s*/g, "__enviar_dados($1, $2, ");

      jsLinhas.push(processed);
    }

    while (indentStack.length > 0) {
      indentStack.pop();
      jsLinhas.push("}");
    }

    return jsLinhas.join("\n");
  }

  salvarBloco(secao: string, conteudo: string[]) {
    if (secao.startsWith("componente_")) {
      const nome = secao.replace("componente_", "");
      const interpretadorInterno = new Empretador();
      interpretadorInterno.empretar(conteudo.join("\n"));
      this.componentes[nome] = interpretadorInterno.elementos.join("\n");
    } else if (secao.startsWith("rota_")) {
      const partes = secao.replace("rota_", "").split("_");
      const metodo = partes[0];
      const caminho = partes.slice(1).join("/");
      this.rotas["/" + caminho] = {
        metodo,
        codigo: conteudo.join("\n"),
      };
    }
  }

  empretar(codigo: string): string {
    this.elementos = [];
    this.estilos = [];
    this.funcoes = [];
    this.imports = [];
    this.rotas = {};
    this.componentes = {};
    this.temComandosConsola = false;

    const linhas = codigo.split("\n");
    let secaoAtual: string | null = null;
    let blocoAtual: string[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha || linha.startsWith("#")) {
        continue;
      }

      if (linha.startsWith("pagina ")) {
        this.titulo = linha.replace("pagina ", "").trim().replace(/^["']|["']$/g, "");
      } else if (linha.startsWith("importar ")) {
        const modulo = linha.replace("importar ", "").trim();
        this.imports.push(modulo);
      } else if (linha.startsWith("componente ")) {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        const nome = linha.replace("componente ", "").replace(/:$/, "").trim();
        secaoAtual = `componente_${nome}`;
        blocoAtual = [];
      } else if (linha.startsWith("rota ")) {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        const partes = linha.replace("rota ", "").trim().split(/\s+/);
        const metodo = partes[0].toUpperCase();
        const caminho = (partes[1] || "").replace(/^\//, "").replace(/:$/, "");
        secaoAtual = `rota_${metodo}_${caminho}`;
        blocoAtual = [];
      } else if (linha === "estilo:" || linha === "estilo") {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        secaoAtual = "estilo";
        blocoAtual = [];
      } else if (linha === "script:" || linha === "script") {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        secaoAtual = "script";
        blocoAtual = [];
      } else if (linha === "servidor:" || linha === "servidor") {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        secaoAtual = "servidor";
        blocoAtual = [];
      } else if (["fim_estilo", "fim_script", "fim_servidor", "fim_componente"].includes(linha)) {
        if (secaoAtual && blocoAtual.length) {
          this.salvarBloco(secaoAtual, blocoAtual);
        }
        secaoAtual = null;
        blocoAtual = [];
      } else if (secaoAtual === "estilo") {
        this.estilos.push(this.traduzirCSS(linha));
      } else if (secaoAtual === "script") {
        this.funcoes.push(linhas[i]);
      } else if (secaoAtual === "servidor") {
        if (linha.startsWith("porta ")) {
          this.porta = parseInt(linha.replace("porta ", "").trim(), 10) || 3000;
        } else if (linha.startsWith("host ") || linha.includes("computador") || linha.includes("anfitriao")) {
          this.host = "0.0.0.0";
        }
      } else if (secaoAtual && (secaoAtual.startsWith("componente_") || secaoAtual.startsWith("rota_"))) {
        blocoAtual.push(linhas[i]);
      } else {
        // DETEÇÃO INTELIGENTE DE COMANDOS DE SCRIPT / TERMINAL (mesmo fora de "script:")
        if (
          linha.startsWith("escrever(") || 
          linha.startsWith("escrever ") || 
          linha.startsWith("imprimir(") || 
          linha.startsWith("imprimir ") ||
          linha.startsWith("var ") ||
          linha.startsWith("let ") ||
          linha.startsWith("const ") ||
          linha.startsWith("funcao ") ||
          linha.startsWith("se ") ||
          linha.startsWith("para ") ||
          linha.startsWith("enquanto ") ||
          linha.startsWith("alerta(")
        ) {
          this.funcoes.push(linhas[i]);
          if (linha.startsWith("escrever") || linha.startsWith("imprimir")) {
            this.temComandosConsola = true;
          }
          continue;
        }

        // Elementos de interface em Português
        if (linha.startsWith("cabecalho ") || linha.startsWith("titulo1 ")) {
          const texto = linha.replace(/^(cabecalho|titulo1)\s+/, "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<h1>${texto}</h1>`);
        } else if (linha.startsWith("titulo2 ")) {
          const texto = linha.replace("titulo2 ", "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<h2>${texto}</h2>`);
        } else if (linha.startsWith("titulo3 ")) {
          const texto = linha.replace("titulo3 ", "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<h3>${texto}</h3>`);
        } else if (linha.startsWith("paragrafo ") || linha.startsWith("texto ")) {
          const texto = linha.replace(/^(paragrafo|texto)\s+/, "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<p>${texto}</p>`);
        } else if (linha.startsWith("destaque ")) {
          const texto = linha.replace("destaque ", "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<strong>${texto}</strong>`);
        } else if (linha.startsWith("italico ")) {
          const texto = linha.replace("italico ", "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<em>${texto}</em>`);
        } else if (linha.startsWith("botao ")) {
          const partes = linha.replace("botao ", "").split(" acao ");
          const texto = partes[0].trim().replace(/^["']|["']$/g, "");
          const acao = partes[1] ? partes[1].trim().replace(/^["']|["']$/g, "") : "";
          this.elementos.push(`<button onclick="${acao}">${texto}</button>`);
        } else if (linha.startsWith("campo ") || linha.startsWith("input ")) {
          const partes = linha.replace(/^(campo|input)\s+/, "").trim().split(/\s+/);
          const tipo = partes.length > 1 ? partes[0] : "text";
          const nome = partes.length > 1 ? partes[1] : partes[0];
          this.elementos.push(`<input type="${tipo}" name="${nome}" id="${nome}" placeholder="${nome}">`);
        } else if (linha.startsWith("formulario ")) {
          const partes = linha.replace("formulario ", "").split(" acao ");
          const acao = partes[1] ? partes[1].trim().replace(/^["']|["']$/g, "") : "";
          this.elementos.push(`<form onsubmit="event.preventDefault(); ${acao}">`);
        } else if (linha === "fim_formulario") {
          this.elementos.push("</form>");
        } else if (linha.startsWith("caixa ") || linha.startsWith("div ")) {
          const classe = linha.replace(/^(caixa|div)\s+/, "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<div class="${classe}">`);
        } else if (linha === "fim_caixa" || linha === "fim_div") {
          this.elementos.push("</div>");
        } else if (linha.startsWith("lista ") || linha.startsWith("lista:")) {
          const id = linha.replace("lista", "").replace(/:$/, "").trim().replace(/^["']|["']$/g, "");
          const idAttr = id ? ` id="${id}"` : "";
          this.elementos.push(`<ul${idAttr}>`);
        } else if (linha === "fim_lista") {
          this.elementos.push("</ul>");
        } else if (linha === "barra_execucao") {
          this.exibirBarra = true;
        } else if (linha.startsWith("item ")) {
          const txt = linha.replace("item ", "").trim().replace(/^["']|["']$/g, "");
          this.elementos.push(`<li>${txt}</li>`);
        } else if (linha.startsWith("imagem ")) {
          const partes = linha.replace("imagem ", "").split(" descricao ");
          const src = partes[0].trim().replace(/^["']|["']$/g, "");
          const alt = partes[1] ? partes[1].trim().replace(/^["']|["']$/g, "") : "Imagem";
          this.elementos.push(`<img src="${src}" alt="${alt}">`);
        } else if (linha.startsWith("ligacao ")) {
          const partes = linha.replace("ligacao ", "").split(" destino ");
          const txt = partes[0].trim().replace(/^["']|["']$/g, "");
          const dest = partes[1] ? partes[1].trim().replace(/^["']|["']$/g, "") : "#";
          this.elementos.push(`<a href="${dest}">${txt}</a>`);
        } else if (linha === "quebra_linha") {
          this.elementos.push("<br>");
        } else if (linha === "linha_horizontal") {
          this.elementos.push("<hr>");
        } else if (this.componentes[linha]) {
          this.elementos.push(this.componentes[linha]);
        } else {
          // Não coloca códigos ou linhas soltas diretamente como HTML
          if (linha.includes("(") && linha.includes(")")) {
            this.funcoes.push(linhas[i]);
          } else {
            this.elementos.push(`<p class="ptg-texto-geral">${linha}</p>`);
          }
        }
      }
    }

    if (secaoAtual && blocoAtual.length) {
      this.salvarBloco(secaoAtual, blocoAtual);
    }

    return this.gerarHtml(this.exibirBarra);
  }

  gerarHtml(exibirBarra: boolean = false): string {
    const temUI = this.elementos.length > 0;
    const corpo = this.elementos.join("\n");
    const css = this.estilos.join("\n");
    const js = this.traduzirScript(this.funcoes);

    const barraPortulong = exibirBarra ? `
      <div id="portulong-runner-bar" style="position:fixed;top:12px;right:12px;z-index:999999;display:flex;align-items:center;gap:8px;background:#0f172a;color:#f8fafc;padding:6px 12px;border-radius:10px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:1px solid #334155;font-family:system-ui,-apple-system,sans-serif;font-size:12px;user-select:none;">
        <img src="/imagens/Portulong.png" width="28" height="28" style="border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.2);" alt="Portulong">
        <span style="font-weight:700;color:#60a5fa;letter-spacing:0.5px;">Portulong</span>
        <button onclick="window.location.reload();" style="display:flex;align-items:center;gap:4px;background:#2563eb;color:#ffffff;border:none;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;" title="Executar / Recarregar aplicação">
          ▶ Executar
        </button>
        <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;" title="Servidor Ligado"></span>
      </div>
    ` : '';

    // Caixa de Terminal Embutida
    const terminalBox = `
      <div id="portulong-terminal-box" style="${temUI ? 'margin-top:25px;' : 'min-height:95vh;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;'}">
        <div style="width:100%;max-width:${temUI ? '100%' : '760px'};background:#090d16;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);font-family:system-ui,-apple-system,sans-serif;">
          <!-- Barra Superior do Terminal -->
          <div style="background:#0f172a;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:11px;height:11px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:#eab308;display:inline-block;"></span>
              <span style="width:11px;height:11px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
              <span style="margin-left:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:700;color:#e2e8f0;">
                Terminal Portulong • Saída de Execução
              </span>
            </div>
            <span style="font-size:11px;color:#94a3b8;font-family:ui-monospace,monospace;background:#1e293b;padding:2px 8px;border-radius:4px;border:1px solid #334155;">
              100% PT-PT
            </span>
          </div>
          <!-- Área de Saída de Linhas do Terminal -->
          <div id="portulong-terminal-output" style="padding:16px 20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;line-height:1.6;color:#38bdf8;background:#020617;min-height:${temUI ? '80px' : '180px'};white-space:pre-wrap;">
            <div style="color:#64748b;font-size:12px;margin-bottom:8px;">[Portulong] Programa iniciado com sucesso.</div>
          </div>
          <!-- Rodapé do Terminal -->
          <div style="background:#090d16;padding:6px 16px;border-top:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#64748b;font-family:ui-monospace,monospace;">
            <span>● Pronto</span>
            <span>v1.0.32</span>
          </div>
        </div>
      </div>
    `;

    // Helpers nativos do Portulong no cliente (100% PT)
    const helpersPt = `
      function __escrever(msg) {
        var str = (msg !== undefined && msg !== null) 
          ? (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : String(msg)) 
          : '';
        console.log('[Portulong]', str);

        // Notificar janela-mãe se estiver em iframe (Playground Web)
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'PORTULONG_CONSOLE_LOG', texto: str }, '*');
          }
        } catch(e) {}

        // Inserir linha visual no Terminal do ecrã
        var termOut = document.getElementById('portulong-terminal-output');
        if (termOut) {
          var line = document.createElement('div');
          line.style.cssText = 'color:#38bdf8;margin-bottom:4px;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;';
          line.textContent = '> ' + str;
          termOut.appendChild(line);
        }
      }

      function __obter_valor(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
      }
      function __definir_valor(id, valor) {
        var el = document.getElementById(id);
        if (el) el.value = valor;
      }
      function __definir_texto(id, texto) {
        var el = document.getElementById(id);
        if (el) el.textContent = texto;
      }
      function __definir_conteudo(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
      }
      function __limpar_elemento(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '';
      }
      function __adicionar_item(id, conteudo) {
        var el = document.getElementById(id);
        if (el) {
          var li = document.createElement('li');
          li.innerHTML = conteudo;
          el.appendChild(li);
        }
      }
      function __pedir_dados(url, ao_receber) {
        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(dados) { if (ao_receber) ao_receber(dados); })
          .catch(function(err) { console.error('Erro pedir_dados:', err); });
      }
      function __enviar_dados(url, dados, ao_receber) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        })
        .then(function(r) { return r.json(); })
        .then(function(res) { if (ao_receber) ao_receber(res); })
        .catch(function(err) { console.error('Erro enviar_dados:', err); });
      }
      function alerta(msg) {
        try {
          let t = document.getElementById('ptg-toast-alert');
          if (!t) {
            t = document.createElement('div');
            t.id = 'ptg-toast-alert';
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e293b;color:#f8fafc;padding:12px 24px;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);z-index:99999;border:1px solid #475569;transition:all 0.3s ease;opacity:0;';
            document.body.appendChild(t);
          }
          t.textContent = msg;
          t.style.opacity = '1';
          t.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(10px)';
          }, 3500);
        } catch(e) {
          window.alert(msg);
        }
      }
    `;

    // Se não há elementos UI visíveis (apenas scripts como escrever(...)), exibe a Consola em destaque
    const conteudoCorpo = temUI 
      ? `${barraPortulong}\n${corpo}\n${this.temComandosConsola ? terminalBox : ''}` 
      : `${barraPortulong}\n${terminalBox}`;

    const fundoPadrao = temUI ? 'background:#f8fafc;color:#0f172a;' : 'background:#030712;color:#f8fafc;';

    return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.titulo}</title>
  <link rel="icon" type="image/png" href="/imagens/Portulong.png">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: ${temUI ? '20px' : '0'}; ${fundoPadrao} }
    ${css}
  </style>
</head>
<body>
  ${conteudoCorpo}
  <script>
    ${helpersPt}
    ${js}
  </script>
</body>
</html>`;
  }
}

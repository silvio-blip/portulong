/**
 * Portulong Compiler - Interpretação e compilação de código .ptg (100% PT-PT)
 * Traduz a sintaxe Portulong para HTML5, CSS3 e JavaScript.
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
  host: string = "localhost";

  // Tradução de CSS em Português para CSS padrão
  traduzirCSS(linha: string): string {
    let css = linha;
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
      [/\bborda-arredondada\s*:/gi, "border-radius:"],
      [/\bborda-cor\s*:/gi, "border-color:"],
      [/\bborda-largura\s*:/gi, "border-width:"],
      [/\bborda-estilo\s*:/gi, "border-style:"],
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
    ];

    for (const [padrao, substituto] of mapaPropriedades) {
      css = css.replace(padrao, substituto);
    }

    // Tradução de valores comuns em PT
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

    return css;
  }

  // Tradução de Script PT (funcao, se, senao, enquanto, para, retornar, alerta)
  traduzirScript(linhas: string[]): string {
    const jsLinhas: string[] = [];
    const indentStack: number[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const rawLinha = linhas[i];
      const trimmed = rawLinha.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      // Check indentation level
      const indent = rawLinha.search(/\S|$/);

      // Close open blocks if indentation decreased
      while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
        jsLinhas.push("}");
      }

      // funcao nome(args):
      const matchFuncao = trimmed.match(/^funcao\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$/);
      if (matchFuncao) {
        const [, nome, args] = matchFuncao;
        jsLinhas.push(`function ${nome}(${args}) {`);
        indentStack.push(indent);
        continue;
      }

      // se condicao:
      const matchSe = trimmed.match(/^se\s+(.*?)\s*:$/);
      if (matchSe) {
        jsLinhas.push(`if (${matchSe[1]}) {`);
        indentStack.push(indent);
        continue;
      }

      // senao se condicao:
      const matchSenaoSe = trimmed.match(/^senao\s+se\s+(.*?)\s*:$/);
      if (matchSenaoSe) {
        jsLinhas.push(`else if (${matchSenaoSe[1]}) {`);
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
        jsLinhas.push(`while (${matchEnquanto[1]}) {`);
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

      // Inline translation helpers
      let processed = trimmed;
      processed = processed.replace(/\bretornar\s+(.*)/, "return $1;");
      processed = processed.replace(/\balerta\s*\(/g, "alert(");
      processed = processed.replace(/\bescrever\s*\(/g, "console.log(");
      processed = processed.replace(/\bobter_elemento\s*\((.*?)\)/g, "document.getElementById($1)");
      processed = processed.replace(/\bobter_valor\s*\((.*?)\)/g, "document.getElementById($1).value");
      processed = processed.replace(/\bdefinir_texto\s*\((.*?),\s*(.*?)\)/g, "document.getElementById($1).textContent = $2");
      processed = processed.replace(/\bdefinir_html\s*\((.*?),\s*(.*?)\)/g, "document.getElementById($1).innerHTML = $2");

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
      this.componentes[nome] = conteudo.join("\n");
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
        } else if (linha.startsWith("host ")) {
          this.host = linha.replace("host ", "").trim();
        }
      } else {
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
        } else if (secaoAtual && !["estilo", "script", "servidor"].includes(secaoAtual)) {
          blocoAtual.push(linhas[i]);
        } else {
          this.elementos.push(linhas[i]);
        }
      }
    }

    if (secaoAtual && blocoAtual.length) {
      this.salvarBloco(secaoAtual, blocoAtual);
    }

    return this.gerarHtml();
  }

  gerarHtml(): string {
    const corpo = this.elementos.join("\n");
    const css = this.estilos.join("\n");
    const js = this.traduzirScript(this.funcoes);

    let componentesJs = "";
    for (const [nome, codigo] of Object.entries(this.componentes)) {
      componentesJs += `window.componente_${nome} = ${JSON.stringify(codigo)};\n`;
    }

    let rotasJs = "";
    for (const [caminho, info] of Object.entries(this.rotas)) {
      rotasJs += `window.rota_${info.metodo.toLowerCase()}_${caminho.replace(/[\/\\]/g, "_")} = ${JSON.stringify(info.codigo)};\n`;
    }

    // Barra de Execução Nativa do Portulong com Botão de Run (▶ Executar)
    const barraPortulong = `
      <div id="portulong-runner-bar" style="position:fixed;top:12px;right:12px;z-index:999999;display:flex;align-items:center;gap:8px;background:#0f172a;color:#f8fafc;padding:6px 12px;border-radius:10px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:1px solid #334155;font-family:system-ui,-apple-system,sans-serif;font-size:12px;user-select:none;">
        <img src="/imagens/Portulong.png" width="28" height="28" style="border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.2);" alt="Portulong">
        <span style="font-weight:700;color:#60a5fa;letter-spacing:0.5px;">Portulong</span>
        <button onclick="window.location.reload();" style="display:flex;align-items:center;gap:4px;background:#2563eb;color:#ffffff;border:none;border-radius:6px;padding:4px 8px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;" title="Executar / Recarregar aplicação">
          ▶ Executar
        </button>
        <span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;" title="Servidor Ligado"></span>
      </div>
    `;

    // Toast alert shim so alerts work elegantly in sandboxed iframes
    const alertShim = `
      (function() {
        if (!window.__portulongAlertOriginal) {
          window.__portulongAlertOriginal = window.alert;
          window.alert = function(msg) {
            console.log('[Portulong Alert]:', msg);
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
            } catch (e) {
              window.__portulongAlertOriginal(msg);
            }
          };
        }
      })();
    `;

    return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.titulo}</title>
  <link rel="icon" type="image/png" href="/imagens/Portulong.png">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    ${css}
  </style>
</head>
<body>
  ${barraPortulong}
  ${corpo}
  <script>
    ${alertShim}
    ${componentesJs}
    ${rotasJs}
    ${js}
  </script>
</body>
</html>`;
  }
}

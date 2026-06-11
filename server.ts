/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google GenAI Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI API endpoints
app.get("/api/instalar", (req, res) => {
  const filePath = path.join(process.cwd(), "instalar.py");
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "portulong.vercel.app";
    const siteUrl = `${proto}://${host}`;
    
    // Dynamically adjust any Vercel domain to the active request domain
    content = content.replace(/https:\/\/portulong\.vercel\.app/g, siteUrl);
    content = content.replace(/portulong\.vercel\.app/g, host);
    
    // Support portulando as well
    content = content.replace(/https:\/\/portulando\.vercel\.app/g, siteUrl);
    content = content.replace(/portulando\.vercel\.app/g, host);

    res.setHeader("Content-Type", "text/x-python");
    res.setHeader("Content-Disposition", "attachment; filename=instalar.py");
    res.send(content);
  } catch (err) {
    res.sendFile(filePath);
  }
});

app.get("/api/desinstalar", (req, res) => {
  const filePath = path.join(process.cwd(), "desinstalar.py");
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "portulong.vercel.app";
    const siteUrl = `${proto}://${host}`;
    
    content = content.replace(/https:\/\/portulong\.vercel\.app/g, siteUrl);
    content = content.replace(/portulong\.vercel\.app/g, host);
    content = content.replace(/https:\/\/portulando\.vercel\.app/g, siteUrl);
    content = content.replace(/portulando\.vercel\.app/g, host);

    res.setHeader("Content-Type", "text/x-python");
    res.setHeader("Content-Disposition", "attachment; filename=desinstalar.py");
    res.send(content);
  } catch (err) {
    res.sendFile(filePath);
  }
});

app.get("/portulong.png", (req, res) => {
  const localPath = path.join(process.cwd(), "portulong.png");
  if (fs.existsSync(localPath)) {
    try {
      const stats = fs.statSync(localPath);
      // Valid raw dragon logo is 167176 bytes. Let's make sure it's not the 34KB placeholder
      if (stats.size > 50000) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day cache
        return res.sendFile(localPath);
      }
    } catch (e) {
      console.error("Erro ao ler portulong.png local:", e);
    }
  }

  // Fallback to proxying from DuckDuckGo image proxy which bypasses datacenter blocks
  const ddgUrl = "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/Wsii1RU.png&f=1";
  const requestOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  };
  https.get(ddgUrl, requestOptions, (proxyRes) => {
    if (proxyRes.statusCode === 200) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      proxyRes.pipe(res);
    } else {
      res.sendFile(localPath);
    }
  }).on("error", () => {
    res.sendFile(localPath);
  });
});

app.post("/api/ai/translate", async (req, res) => {
  try {
    const { pythonCode } = req.body;
    if (!pythonCode) {
      return res.status(400).json({ error: "Código Python não fornecido." });
    }

    const ai = getAIClient();
    const systemPrompt = `Você é um compilador e especialista na linguagem "Portulong" (PTG) — uma linguagem de programação em português para criar bots do Discord baseada em Python.
Sua única tarefa é traduzir o código Python fornecido para Portulong seguindo rigorosamente estas regras de mapeamento:

Mapeamentos de Palavras-Chave:
- if -> se
- else -> senao
- elif -> senaose
- for -> para
- while -> enquanto
- def -> definir (ou funcao)
- class -> classe
- import -> importar
- from -> de
- as -> como
- return -> retornar
- try -> tentar
- except -> exceto
- finally -> finalmente
- with -> com
- lambda -> lambda
- pass -> passar
- break -> parar
- continue -> continuar
- True -> Verdadeiro
- False -> Falso
- None -> Nulo
- and -> e
- or -> ou
- not -> nao
- in -> em
- is -> eh
- assert -> asseverar
- global -> global
- nonlocal -> naolocal
- raise -> levantar
- yield -> produzir
- async -> assincrono
- await -> aguardar

Funções Embutidas:
- print -> escrever
- input -> ler
- len -> tamanho
- int -> inteiro
- str -> texto
- float -> real
- bool -> boleano
- list -> lista
- dict -> dicionario
- set -> conjunto
- tuple -> tupla
- range -> intervalo
- open -> abrir
- type -> tipo
- sum -> somar
- abs -> absoluto
- max -> maximo
- min -> minimo
- round -> arredondar

No Discord:
- discord -> discordia
- Bot -> Robo
- command_prefix -> prefixo
- event -> evento
- command -> comando
- name -> nome
- help -> ajuda
- ctx -> contexto
- send -> enviar
- reply -> responder
- delete -> deletar
- author -> autor
- name -> nome
- id -> id
- content -> conteudo
- user -> usuario
- msg / message -> mensagem
- guild -> servidor

Você DEVE produzir APENAS o código Portulong equivalente, limpo, sem explicações adicionais, e sem blocos extras de diálogo. Apenas o código.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Traduza o seguinte código Python para Portulong:\n\n${pythonCode}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      },
    });

    let code = response.text || "";
    // Clean up Markdown code blocks if any
    code = code.replace(/```ptg\n?/gi, "").replace(/```python\n?/gi, "").replace(/```[\s\S]*?\n?/gi, "");
    if (code.endsWith("```")) {
      code = code.slice(0, -3);
    }

    return res.json({ ptgCode: code.trim() });
  } catch (error: any) {
    console.error("Erro na tradução:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao traduzir o código." });
  }
});

app.post("/api/ai/explain", async (req, res) => {
  try {
    const { code, question } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Código Portulong não fornecido." });
    }

    const ai = getAIClient();
    const systemPrompt = `Você é o tutor da linguagem "Portulong" (PTG), focado em ensinar iniciantes no desenvolvimento de bots do Discord em português.
O usuário vai enviar um trecho de código Portulong e pode fazer uma pergunta.
Analise o código, identifique erros de sintaxe ou lógica e explique de forma extremamente amigável, didática e clara em português do Brasil.
Destaque onde estão as melhorias ou correções necessárias utilizando a sintaxe do Portulong.`;

    const instructions = question 
      ? `Código do usuário:\n${code}\n\nPergunta:\n${question}`
      : `Por favor, analise didaticamente este código em Portulong, explique o que ele faz de forma simples e mostre como rodá-lo:\n\n${code}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Erro ao explicar:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao processar a explicação." });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Faltando histórico de mensagens legível." });
    }

    const ai = getAIClient();
    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `Você é um assistente de IA especialista e amigável da linguagem "Portulong" (PTG) — uma linguagem em português criada para facilitar o desenvolvimento de bots do discord em Python.
Ajude o usuário a criar comandos úteis, integrar APIs do Discord de forma simples e aprender os conceitos básicos.
Sempre forneça exemplos em código Portulong (.ptg).
Seja acolhedor, focado em ajudar iniciantes e responda em português brasileiro bem estruturado.`,
      },
    });

    // We can feed the messages into the chat or get the last one
    const lastMessage = messages[messages.length - 1];
    const response = await chatSession.sendMessage({
      message: lastMessage.content,
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Erro no chat:", error);
    return res.status(500).json({ error: error.message || "Erro no processamento da conversa AI." });
  }
});

app.post("/api/ai/simulate-bot", async (req, res) => {
  try {
    const { code, inputMessage, userTag } = req.body;
    if (!code || !inputMessage) {
      return res.status(400).json({ error: "Faltando parâmetros código ou mensagem." });
    }

    const ai = getAIClient();
    const systemPrompt = `Você é um interpretador em tempo real e simulador oficial de execução de robôs do Discord codificados na linguagem "Portulong" (PTG).
Análise o código Portulong do usuário. Depois, veja a mensagem recebida de um membro do servidor Discord e simule EXATAMENTE o comportamento do bot baseado nas definições do código.

Retorne EXCLUSIVAMENTE uma estrutura JSON válida com a seguinte forma (não use blocos de código Markdown como \`\`\`json, apenas retorne o texto bruto JSON puro):
{
  "botName": "Nome do Robô (puxado do código, ou padrão 'PortulongBot')",
  "response": "O conteúdo de texto da resposta que o robô enviou chamando enviar() ou responder() ou None de acordo com as permissões",
  "embed": {
    "title": "Título se houver formatação de embed, senão null",
    "description": "Conteúdo formatado se houver, senão null",
    "color": "Cor hexadecimal (ex: #00FF00) se houver, senão null"
  },
  "log": "Um texto curto simulação de console do interpretador, ex: '[INFO] Comando !ping recebido. Respondendo...'"
}`;

    const contents = `Código em Portulong:\n${code}\n\nMembro diz: "${inputMessage}" (tag: @${userTag || "Membro"})`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Erro na simulação do bot:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao simular bot." });
  }
});

// Configure Vite middleware or static routes
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }
}

// Helper to download the correct icon locally if needed
function downloadIcon() {
  const targetPaths = [
    path.join(process.cwd(), "portulong.png"),
    path.join(process.cwd(), "public", "portulong.png"),
    path.join(process.cwd(), "portulong-vscode", "portulong.png")
  ];
  
  // If we already have a valid local portulong.png of correct size, we can copy it locally to other required paths and skip downloading!
  const rootPath = path.join(process.cwd(), "portulong.png");
  if (fs.existsSync(rootPath)) {
    try {
      const stats = fs.statSync(rootPath);
      if (stats.size > 50000) {
        console.log(`[BOOT] Ícone portulong.png local é válido (${stats.size} bytes). Copiando para outras pastas se necessário...`);
        const localBuffer = fs.readFileSync(rootPath);
        targetPaths.forEach((p) => {
          if (p !== rootPath) {
            try {
              const dir = path.dirname(p);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              if (!fs.existsSync(p) || fs.statSync(p).size < 50000) {
                fs.writeFileSync(p, localBuffer);
                console.log(`[BOOT] Copiado localmente para: ${p}`);
              }
            } catch (err) {
              console.error(`[BOOT] Erro ao copiar localmente para ${p}:`, err);
            }
          }
        });
        return; // Skip download entirely
      }
    } catch (e) {
      console.error("Erro ao validar portulong.png local no boot:", e);
    }
  }

  const ddgUrl = "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/Wsii1RU.png&f=1";
  const requestOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  };

  https.get(ddgUrl, requestOptions, (res) => {
    if (res.statusCode === 200) {
      const data: any[] = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(data);
        // Ensure it's a valid PNG and not a small error placeholder
        if (buffer.length > 50000 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
          targetPaths.forEach((p) => {
            try {
              const dir = path.dirname(p);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              fs.writeFileSync(p, buffer);
              console.log(`[BOOT] Ícone de portulong gravado com sucesso em: ${p}`);
            } catch (err) {
              console.error(`[BOOT] Erro ao gravar ícone em ${p}:`, err);
            }
          });
        } else {
          console.error(`[BOOT] Resposta de Imgur/DDG não tem o tamanho válido de ícone: ${buffer.length} bytes.`);
        }
      });
    } else {
      console.error(`[BOOT] Falha ao carregar ícone de Imgur/DDG: Status ${res.statusCode}`);
    }
  }).on("error", (err) => {
    console.error("[BOOT] Erro ao conectar com Imgur/DDG para download do ícone:", err);
  });
}

// Start Server
setupVite().then(() => {
  downloadIcon();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portulong Studio Server running on http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error("Erro ao iniciar o servidor express:", err);
});

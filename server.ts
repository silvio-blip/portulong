/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
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
  res.sendFile(path.join(process.cwd(), "instalar.py"));
});

app.get("/portulong.png", (req, res) => {
  res.sendFile(path.join(process.cwd(), "portulong.png"));
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

// Start Server
setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portulong Studio Server running on http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error("Erro ao iniciar o servidor express:", err);
});

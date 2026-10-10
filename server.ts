import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Empretador } from './src/compiler/portulong.js';
import { EXEMPLOS } from './src/exemplos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory users store for Portulong REST API demonstrations
interface Usuario {
  id: number;
  nome: string;
}

let usuarios: Usuario[] = [
  { id: 1, nome: "João" },
  { id: 2, nome: "Maria" },
  { id: 3, nome: "António" },
  { id: 4, nome: "Beatriz" },
];

let lastCompiledHtml = "";

// Initialize default compilation with sistema_completo
try {
  const compiler = new Empretador();
  lastCompiledHtml = compiler.empretar(EXEMPLOS[0].codigo);
} catch (e) {
  console.error("Erro na compilação inicial:", e);
}

// -------------------------------------------------------------
// Portulong Built-in REST API Routes (from sistema_completo.ptg)
// -------------------------------------------------------------

app.get('/api/usuarios', (req, res) => {
  res.json({ usuarios });
});

app.post('/api/usuario', (req, res) => {
  const nome = (req.body?.nome || "").trim();
  if (!nome) {
    return res.status(400).json({ sucesso: false, mensagem: "Nome não fornecido" });
  }
  const novo: Usuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
    nome,
  };
  usuarios.push(novo);
  res.json({ sucesso: true, mensagem: `Usuario ${nome} criado com sucesso!` });
});

// Portulong compiler endpoint
app.post('/api/compile', (req, res) => {
  try {
    const { codigo } = req.body;
    if (typeof codigo !== 'string') {
      return res.status(400).json({ erro: 'Código inválido' });
    }
    const compiler = new Empretador();
    const html = compiler.empretar(codigo);
    lastCompiledHtml = html;
    res.json({
      sucesso: true,
      html,
      titulo: compiler.titulo,
      rotas: compiler.rotas,
      componentes: compiler.componentes,
    });
  } catch (err: any) {
    res.status(500).json({ erro: err?.message || 'Erro durante compilação' });
  }
});

// Portulong version endpoint (ptg version)
app.get('/api/version', (req, res) => {
  res.json({
    versao: "1.0.28",
    pacote: "portulong-sistema",
    linguagem: "Português de Portugal (PT-PT)",
    estado: "operacional",
  });
});

// Reset demo data endpoint
app.post('/api/reset-demo', (req, res) => {
  usuarios = [
    { id: 1, nome: "João" },
    { id: 2, nome: "Maria" },
    { id: 3, nome: "António" },
    { id: 4, nome: "Beatriz" },
  ];
  res.json({ sucesso: true, mensagem: "Dados reiniciados com sucesso" });
});

// Direct raw preview of current compiled Portulong page
app.get('/preview', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(lastCompiledHtml);
});

// Serve public static assets (including /imagens/Portulong.png)
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/preview')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portulong server ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Erro ao iniciar servidor:", err);
  process.exit(1);
});

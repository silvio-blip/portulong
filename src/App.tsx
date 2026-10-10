import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Code2, 
  Eye, 
  BookOpen, 
  Server, 
  ExternalLink,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Package,
  Monitor,
  Download,
  FileCode2,
  CheckCircle,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2
} from 'lucide-react';
import { EXEMPLOS } from './exemplos';
import { Empretador } from './compiler/portulong';

export default function App() {
  const [exemploSelecionado, setExemploSelecionado] = useState<string>(EXEMPLOS[0].id);
  const [codigo, setCodigo] = useState<string>(EXEMPLOS[0].codigo);
  
  // Painel Ativo no Mobile: 'editor' ou 'preview'
  const [abaMobile, setAbaMobile] = useState<'editor' | 'preview'>('editor');

  // Abas do Painel Direito
  const [abaDireita, setAbaDireita] = useState<'preview' | 'html' | 'api' | 'pypi' | 'sistema' | 'docs'>('preview');

  // Modo de visualização do iframe: 'desktop' | 'tablet' | 'mobile'
  const [dispositivoPreview, setDispositivoPreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [htmlCompilado, setHtmlCompilado] = useState<string>('');
  const [compilando, setCompilando] = useState<boolean>(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [usuariosApi, setUsuariosApi] = useState<any[]>([]);
  const [carregandoApi, setCarregandoApi] = useState<boolean>(false);
  const [novoUsuarioNome, setNovoUsuarioNome] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('Pronto para executar');

  const compiler = useMemo(() => new Empretador(), []);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compilar código
  const compilar = (codigoFonte: string = codigo) => {
    setCompilando(true);
    try {
      const resultadoHtml = compiler.empretar(codigoFonte);
      setHtmlCompilado(resultadoHtml);
      setStatusMsg(`Compilado com sucesso • ${compiler.titulo}`);

      // Notificar o backend sobre o código atual para atualizar /preview
      fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoFonte })
      }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Erro de compilação: ${err?.message || 'Sintaxe inválida'}`);
    } finally {
      setTimeout(() => setCompilando(false), 200);
    }
  };

  // Compilação inicial
  useEffect(() => {
    compilar(EXEMPLOS[0].codigo);
    carregarUsuarios();
  }, []);

  // Mudar de exemplo
  const handleSelecionarExemplo = (id: string) => {
    const ex = EXEMPLOS.find(e => e.id === id);
    if (ex) {
      setExemploSelecionado(id);
      setCodigo(ex.codigo);
      compilar(ex.codigo);
    }
  };

  // Carregar dados da API Portulong
  const carregarUsuarios = async () => {
    setCarregandoApi(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      if (data?.usuarios) {
        setUsuariosApi(data.usuarios);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregandoApi(false);
    }
  };

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;
    try {
      const res = await fetch('/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoUsuarioNome.trim() })
      });
      const data = await res.json();
      if (data?.sucesso) {
        setNovoUsuarioNome('');
        carregarUsuarios();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copiarTexto = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  };

  const descarregarArquivo = (conteudo: string, nomeArquivo: string, tipo: string) => {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const inserirSnippet = (snippet: string) => {
    setCodigo(prev => prev + '\n' + snippet);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Barra de Topo Principal */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm shrink-0 z-30">
        {/* Identificação da Linguagem */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/imagens/Portulong.png" 
            alt="Portulong" 
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-700 shadow-sm object-cover" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">Portulong</span>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                100% PT
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">v1.0.27</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Linguagem em Português para Frontend e Backend Web
            </p>
          </div>
        </div>

        {/* Alternador Mobile (Editor vs Preview) */}
        <div className="flex lg:hidden bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setAbaMobile('editor')}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              abaMobile === 'editor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Código (.ptg)
          </button>
          <button
            onClick={() => {
              setAbaMobile('preview');
              compilar();
            }}
            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
              abaMobile === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visualização
          </button>
        </div>

        {/* Botões de Ação Superiores */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Seletor de Exemplos */}
          <select 
            value={exemploSelecionado}
            onChange={(e) => handleSelecionarExemplo(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 sm:px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px] sm:max-w-none cursor-pointer"
          >
            {EXEMPLOS.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.nome}
              </option>
            ))}
          </select>

          {/* Botão Executar (Run) */}
          <button
            onClick={() => {
              compilar();
              if (window.innerWidth < 1024) {
                setAbaMobile('preview');
              }
            }}
            disabled={compilando}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Executar código (Ctrl + Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${compilando ? 'animate-spin' : ''}`} />
            <span className="font-bold">Executar</span>
          </button>

          {/* Baixar Arquivo .ptg */}
          <button
            onClick={() => descarregarArquivo(codigo, `${exemploSelecionado}.ptg`, 'text/plain;charset=utf-8')}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Descarregar arquivo .ptg para a sua máquina"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Baixar .ptg</span>
          </button>

          {/* Repor Código */}
          <button
            onClick={() => {
              const currentEx = EXEMPLOS.find(e => e.id === exemploSelecionado);
              if (currentEx) {
                setCodigo(currentEx.codigo);
                compilar(currentEx.codigo);
              }
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-2 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Repor código padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Abrir em Aba Inteira */}
          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="Abrir em ecrã inteiro no navegador"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Área Central Dividida com Suporte Responsivo e Scroll Fluido */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Painel Esquerdo: Editor de Código */}
        <div className={`w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/50 ${
          abaMobile === 'editor' ? 'flex h-full' : 'hidden lg:flex'
        }`}>
          {/* Cabeçalho do Editor */}
          <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-semibold text-slate-200">
                {exemploSelecionado}.ptg
              </span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                Portulong
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                {codigo.split('\n').length} linhas
              </span>
              <button
                onClick={() => copiarTexto(codigo, 'editor')}
                className="hover:text-slate-200 transition cursor-pointer flex items-center gap-1"
                title="Copiar código"
              >
                {copiado === 'editor' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[11px]">{copiado === 'editor' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Área do Textarea com Rolagem Suave */}
          <div className="flex-1 relative overflow-hidden bg-slate-950">
            <textarea
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  compilar();
                }
              }}
              spellCheck={false}
              className="w-full h-full p-4 font-mono text-sm leading-relaxed text-indigo-50 bg-slate-950 resize-none focus:outline-none selection:bg-indigo-900 selection:text-white overflow-y-auto"
              placeholder="Escreva código em Portulong (.ptg) aqui..."
            />
          </div>

          {/* Barra Inferior com Atalhos de Sintaxe Clicáveis */}
          <div className="p-2 bg-slate-900/90 border-t border-slate-800 text-[11px] flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
            <span className="font-medium text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" /> Inserir:
            </span>
            <button 
              onClick={() => inserirSnippet('cabecalho "Novo Titulo"')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-indigo-300 font-mono shrink-0 transition cursor-pointer"
            >
              + cabecalho
            </button>
            <button 
              onClick={() => inserirSnippet('botao "Clique Aqui" acao "alerta(\'Ola!\')"')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-indigo-300 font-mono shrink-0 transition cursor-pointer"
            >
              + botao
            </button>
            <button 
              onClick={() => inserirSnippet('caixa "painel":\n    paragrafo "Conteudo"\nfim_caixa')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-indigo-300 font-mono shrink-0 transition cursor-pointer"
            >
              + caixa
            </button>
            <button 
              onClick={() => inserirSnippet('estilo:\nbody { fundo: #f8fafc; espacamento: 20px; }')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-amber-300 font-mono shrink-0 transition cursor-pointer"
            >
              + estilo
            </button>
            <button 
              onClick={() => inserirSnippet('script:\nfuncao minhaFuncao():\n    alerta("Ola mundo!")')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-cyan-300 font-mono shrink-0 transition cursor-pointer"
            >
              + script
            </button>
            <button 
              onClick={() => inserirSnippet('rota GET /api/dados:\n    resposta = {"status": "ok"}')}
              className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-emerald-300 font-mono shrink-0 transition cursor-pointer"
            >
              + rota
            </button>
          </div>
        </div>

        {/* Painel Direito: Navegador, HTML, API e Manuais */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-slate-950 ${
          abaMobile === 'preview' ? 'flex h-full' : 'hidden lg:flex'
        }`}>
          {/* Barra de Abas do Painel Direito */}
          <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto shrink-0 gap-2">
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 shrink-0">
              <button
                onClick={() => setAbaDireita('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Navegador</span>
              </button>
              <button
                onClick={() => setAbaDireita('html')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'html'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Compilado (RAM)</span>
              </button>
              <button
                onClick={() => {
                  setAbaDireita('api');
                  carregarUsuarios();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'api'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Rotas REST</span>
              </button>
              <button
                onClick={() => setAbaDireita('pypi')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'pypi'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>PyPI</span>
              </button>
              <button
                onClick={() => setAbaDireita('sistema')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'sistema'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows/Linux</span>
              </button>
              <button
                onClick={() => setAbaDireita('docs')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'docs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manual</span>
              </button>
            </div>

            {/* Controles Especiais da Aba Ativa */}
            {abaDireita === 'preview' && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-slate-400 shrink-0">
                <button
                  onClick={() => setDispositivoPreview('desktop')}
                  className={`p-1 rounded cursor-pointer ${dispositivoPreview === 'desktop' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                  title="Vista Computador"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDispositivoPreview('tablet')}
                  className={`p-1 rounded cursor-pointer ${dispositivoPreview === 'tablet' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                  title="Vista Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDispositivoPreview('mobile')}
                  className={`p-1 rounded cursor-pointer ${dispositivoPreview === 'mobile' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                  title="Vista Telemóvel (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {abaDireita === 'html' && (
              <button
                onClick={() => copiarTexto(htmlCompilado, 'html')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition cursor-pointer shrink-0"
              >
                {copiado === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiado === 'html' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            )}
          </div>

          {/* Conteúdo com Scroll Próprio e Fluido */}
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-slate-950">
            {/* Visualizador do Navegador */}
            {abaDireita === 'preview' && (
              <div className="w-full h-full flex justify-center items-stretch bg-slate-900/60 p-0 sm:p-2 overflow-auto">
                <div 
                  className={`bg-white transition-all duration-300 h-full shadow-2xl relative ${
                    dispositivoPreview === 'desktop' ? 'w-full rounded-none sm:rounded-lg' :
                    dispositivoPreview === 'tablet' ? 'w-[768px] rounded-lg border-4 border-slate-800 my-auto h-[95%]' :
                    'w-[375px] rounded-lg border-4 border-slate-800 my-auto h-[95%]'
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlCompilado}
                    title="Portulong Preview"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                    className="w-full h-full border-none rounded-inherit"
                  />
                </div>
              </div>
            )}

            {/* Código HTML Gerado em Memória com Scroll Total */}
            {abaDireita === 'html' && (
              <div className="p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-auto h-full bg-slate-950">
                <div className="mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-sans text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span><strong>Execução 100% Nativa em Memória RAM:</strong> O Portulong roda diretamente na memória. Nenhum arquivo .html é gerado ou salvo no disco!</span>
                </div>
                <pre className="whitespace-pre-wrap">{htmlCompilado}</pre>
              </div>
            )}

            {/* Testador de Rotas REST em Python */}
            {abaDireita === 'api' && (
              <div className="p-4 sm:p-6 overflow-y-auto h-full space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Servidor HTTP Integrado & Rotas REST
                  </h3>
                  <p className="text-xs text-slate-400">
                    O servidor nativo processa rotas Python configuradas diretamente com <code className="text-indigo-400">rota METODO caminho:</code>
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded">
                        GET
                      </span>
                      <code className="text-sm font-mono text-slate-200">/api/usuarios</code>
                    </div>
                    <button
                      onClick={carregarUsuarios}
                      disabled={carregandoApi}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${carregandoApi ? 'animate-spin' : ''}`} />
                      <span>Atualizar</span>
                    </button>
                  </div>
                  
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80">
                    <div className="text-[11px] text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">
                      Resposta Atual (JSON):
                    </div>
                    <pre className="font-mono text-xs text-emerald-300 overflow-x-auto">
                      {JSON.stringify({ usuarios: usuariosApi }, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      POST
                    </span>
                    <code className="text-sm font-mono text-slate-200">/api/usuario</code>
                  </div>
                  
                  <form onSubmit={handleCriarUsuario} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={novoUsuarioNome}
                      onChange={(e) => setNovoUsuarioNome(e.target.value)}
                      placeholder="Nome do novo utilizador (ex: Carlos Silva)"
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Aba PyPI: Publicação e GitHub Actions */}
            {abaDireita === 'pypi' && (
              <div className="p-4 sm:p-6 overflow-y-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    Publicar <span className="text-emerald-400 font-mono">portulong-sistema</span> no PyPI
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O pacote está 100% configurado para a versão <strong className="text-slate-200">1.0.27</strong>. Pode publicar tanto pela linha de comando quanto automaticamente via GitHub Actions ao fazer push!
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Publicação Automática via GitHub Actions
                  </h3>
                  <p className="text-xs text-slate-400">
                    O arquivo <code className="text-indigo-300">.github/workflows/publish.yml</code> já está pronto. Ao fazer push para a branch <code className="text-slate-200 font-mono">main</code>, a compilação e publicação iniciam imediatamente!
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="text-slate-300 font-medium">Basta rodar no seu Git:</div>
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800 overflow-x-auto">
                      <span>git add . && git commit -m "Publicar v1.0.27" && git push origin main</span>
                      <button 
                        onClick={() => copiarTexto('git add . && git commit -m "Publicar v1.0.27" && git push origin main', 'cmdgit')}
                        className="hover:text-white shrink-0 ml-2 cursor-pointer"
                      >
                        {copiado === 'cmdgit' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Publicação Manual Direta no Terminal
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">1. Instalar ferramentas de compilação:</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>pip install build twine</span>
                        <button onClick={() => copiarTexto('pip install build twine', 'p1')} className="hover:text-white cursor-pointer">
                          {copiado === 'p1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">2. Gerar pacotes de distribuição:</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>python -m build</span>
                        <button onClick={() => copiarTexto('python -m build', 'p2')} className="hover:text-white cursor-pointer">
                          {copiado === 'p2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">3. Enviar para o PyPI:</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>twine upload dist/*</span>
                        <button onClick={() => copiarTexto('twine upload dist/*', 'p3')} className="hover:text-white cursor-pointer">
                          {copiado === 'p3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Sistema Operacional (Windows / Linux) */}
            {abaDireita === 'sistema' && (
              <div className="p-4 sm:p-6 overflow-y-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-indigo-400" />
                    Execução Nativa no Windows & Linux
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Com o comando <code className="text-emerald-400 font-mono">ptg config</code>, todos os arquivos <code className="text-indigo-300 font-mono">.ptg</code> mostram o ícone oficial em tempo real e executam por duplo clique sem abrir terminal!
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-3 shadow-sm">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Configuração em Tempo Real: <code className="text-indigo-300 font-mono">ptg config</code>
                  </h3>
                  <p className="text-slate-400">
                    Atualiza o cache do Windows Explorer e do Linux imediatamente com notificação de broadcast do sistema, sem necessidade de reiniciar a máquina nem o editor:
                  </p>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800">
                    <span>ptg config</span>
                    <button 
                      onClick={() => copiarTexto('ptg config', 'cmdcfg')}
                      className="hover:text-white cursor-pointer"
                    >
                      {copiado === 'cmdcfg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5 shadow-sm">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span>🪟</span> No Windows
                    </h4>
                    <p className="text-slate-400">
                      O arquivo <code className="text-slate-200">Portulong.ico</code> é associado no Registro à extensão <code className="text-slate-200">.ptg</code>. Clicar 2x abre diretamente no navegador!
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5 shadow-sm">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span>🐧</span> No Linux
                    </h4>
                    <p className="text-slate-400">
                      Instalação em <code className="text-slate-200">icons/hicolor</code> com MIME Type <code className="text-slate-200">application/x-ptg</code> e arquivo <code className="text-slate-200">.desktop</code>.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-3 shadow-sm">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-400" />
                    Botão de Run no VS Code (Como no Python)
                  </h4>
                  <p className="text-slate-400">
                    A extensão instalada pelo comando adiciona o botão de Play ▶ no cabeçalho do VS Code. Clicar no botão roda o arquivo no terminal integrado e abre a página!
                  </p>
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <img 
                      src="/imagens/Portulong.png" 
                      alt="Ícone Portulong" 
                      className="w-10 h-10 rounded-lg shadow-sm border border-slate-700 shrink-0" 
                    />
                    <div className="space-y-0.5 flex-1 overflow-hidden">
                      <div className="text-white font-medium">Ícone Oficial do Portulong</div>
                      <div className="text-slate-400 text-[11px] font-mono truncate">
                        Link Imgur: <a href="https://i.imgur.com/CCsXVnb.png" target="_blank" rel="noreferrer" className="text-indigo-400 underline">https://i.imgur.com/CCsXVnb.png</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Dicionário e Manual PT-PT */}
            {abaDireita === 'docs' && (
              <div className="p-4 sm:p-6 overflow-y-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Dicionário e Manual Portulong 100% PT-PT</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Todas as funcionalidades da linguagem foram desenhadas para que nada esteja em inglês. Frontend, backend, estilização e comportamento num só arquivo.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-indigo-300 mb-2">Comandos da Interface (HTML)</h3>
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="p-2.5 border-b border-slate-800">Comando Portulong</th>
                          <th className="p-2.5 border-b border-slate-800">Descrição / HTML</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        <tr>
                          <td className="p-2.5 text-indigo-300">pagina "Meu App"</td>
                          <td className="p-2.5 text-slate-300">Define o título da página e da aba</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">cabecalho "Texto"</td>
                          <td className="p-2.5 text-slate-300">Título principal (&lt;h1&gt;)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">titulo2 a titulo6</td>
                          <td className="p-2.5 text-slate-300">Subtítulos secundários (&lt;h2&gt; a &lt;h6&gt;)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">paragrafo "Texto"</td>
                          <td className="p-2.5 text-slate-300">Parágrafo (&lt;p&gt;)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">botao "Rótulo" acao "js"</td>
                          <td className="p-2.5 text-slate-300">Botão com ação de clique</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">campo tipo "nome"</td>
                          <td className="p-2.5 text-slate-300">Campo de entrada (&lt;input&gt;)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">caixa "classe" / fim_caixa</td>
                          <td className="p-2.5 text-slate-300">Div container estilizado</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">imagem "url" descricao "alt"</td>
                          <td className="p-2.5 text-slate-300">Imagem (&lt;img&gt;)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-indigo-300">ligacao "Texto" destino "url"</td>
                          <td className="p-2.5 text-slate-300">Hiperligação (&lt;a&gt;)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-indigo-300 mb-2">Propriedades CSS em Português</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">fundo</span> → background
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">cor</span> → color
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">tamanho-fonte</span> → font-size
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">largura</span> → width
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">altura</span> → height
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">espacamento</span> → padding
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">margem</span> → margin
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">borda</span> → border
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">borda-arredondada</span> → border-radius
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">sombra</span> → box-shadow
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">exibicao: flexivel</span> → display: flex
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-amber-400">intervalo</span> → gap
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Rodapé Limpa */}
      <footer className="bg-slate-900 border-t border-slate-800 px-3 sm:px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between select-none shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px] sm:max-w-none">
            {statusMsg}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] text-slate-400">
          <span className="hidden sm:inline">Servidor: <strong className="text-slate-200 font-mono">0.0.0.0:3000</strong></span>
          <span>Versão: <strong className="text-indigo-400 font-mono">1.0.27</strong></span>
          <span className="hidden xs:inline">PyPI: <strong className="text-emerald-400 font-mono">portulong-sistema</strong></span>
        </div>
      </footer>
    </div>
  );
}

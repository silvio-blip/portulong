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
  HelpCircle
} from 'lucide-react';
import { EXEMPLOS } from './exemplos';
import { Empretador } from './compiler/portulong';

export default function App() {
  const [exemploSelecionado, setExemploSelecionado] = useState<string>(EXEMPLOS[0].id);
  const [codigo, setCodigo] = useState<string>(EXEMPLOS[0].codigo);
  const [abaDireita, setAbaDireita] = useState<'preview' | 'html' | 'api' | 'pypi' | 'sistema' | 'docs'>('preview');
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

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between shadow-md select-none shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/imagens/Portulong.png" 
            alt="Portulong" 
            className="w-9 h-9 rounded-lg border border-slate-700 shadow-sm object-cover" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Portulong</h1>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                100% PT-PT
              </span>
              <span className="text-[11px] text-slate-400 font-mono">v1.0.25</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Linguagem de programação em Português de Portugal para a Web
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Example Dropdown */}
          <select 
            value={exemploSelecionado}
            onChange={(e) => handleSelecionarExemplo(e.target.value)}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {EXEMPLOS.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.nome}
              </option>
            ))}
          </select>

          <button
            onClick={() => compilar()}
            disabled={compilando}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Executar código Portulong"
          >
            <Play className={`w-3.5 h-3.5 ${compilando ? 'animate-spin' : ''}`} />
            <span>Executar</span>
          </button>

          <button
            onClick={() => descarregarArquivo(codigo, `${exemploSelecionado}.ptg`, 'text/plain;charset=utf-8')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Descarregar arquivo .ptg para a sua máquina"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Baixar .ptg</span>
          </button>

          <button
            onClick={() => {
              const currentEx = EXEMPLOS.find(e => e.id === exemploSelecionado);
              if (currentEx) {
                setCodigo(currentEx.codigo);
                compilar(currentEx.codigo);
              }
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Repor código do exemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Repor</span>
          </button>

          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="Abrir página compilada diretamente em tela cheia"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Aba Inteira</span>
          </a>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Code Editor */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/60">
          <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono font-medium text-slate-300">
                {exemploSelecionado}.ptg
              </span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">
                Código Portulong
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {codigo.split('\n').length} linhas
            </div>
          </div>

          <div className="flex-1 relative flex">
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
              className="w-full h-full bg-slate-950 p-4 font-mono text-sm leading-relaxed text-indigo-100 resize-none focus:outline-none selection:bg-indigo-900 selection:text-white"
              placeholder="Escreva código em Portulong (.ptg) aqui..."
            />
          </div>

          {/* Quick Syntax Pill Helpers */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 text-[11px] flex flex-wrap items-center gap-1.5 text-slate-400">
            <span className="font-medium text-slate-300 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Sintaxe 100% PT:
            </span>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">pagina</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">cabecalho</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">paragrafo</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">botao</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">caixa / fim_caixa</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">estilo:</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">script:</code>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">rota GET/POST</code>
          </div>
        </div>

        {/* Right Side: Execution & Previews */}
        <div className="w-full md:w-1/2 flex flex-col bg-slate-950">
          {/* Sub Navigation Bar */}
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setAbaDireita('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Navegador (Live)</span>
              </button>
              <button
                onClick={() => setAbaDireita('html')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'html'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>HTML Gerado</span>
              </button>
              <button
                onClick={() => {
                  setAbaDireita('api');
                  carregarUsuarios();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'api'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Rotas REST</span>
              </button>
              <button
                onClick={() => setAbaDireita('pypi')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'pypi'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Publicar no PyPI</span>
              </button>
              <button
                onClick={() => setAbaDireita('sistema')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'sistema'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows / Linux</span>
              </button>
              <button
                onClick={() => setAbaDireita('docs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                  abaDireita === 'docs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dicionário PT</span>
              </button>
            </div>

            {abaDireita === 'html' && (
              <button
                onClick={() => copiarTexto(htmlCompilado, 'html')}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition"
              >
                {copiado === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiado === 'html' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            )}
          </div>

          {/* Right Pane Content */}
          <div className="flex-1 relative overflow-auto">
            {abaDireita === 'preview' && (
              <div className="w-full h-full bg-white relative">
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlCompilado}
                  title="Portulong Preview"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  className="w-full h-full border-none"
                />
              </div>
            )}

            {abaDireita === 'html' && (
              <div className="p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-auto h-full bg-slate-950">
                <pre className="whitespace-pre-wrap">{htmlCompilado}</pre>
              </div>
            )}

            {abaDireita === 'api' && (
              <div className="p-5 overflow-auto h-full space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Servidor HTTP Integrado & Rotas REST em Python
                  </h3>
                  <p className="text-xs text-slate-400">
                    O portulong inclui um servidor HTTP com suporte nativo a rotas REST definidas no código com <code className="text-indigo-400">rota METODO caminho:</code>
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
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
                    <pre className="font-mono text-xs text-emerald-300">
                      {JSON.stringify({ usuarios: usuariosApi }, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-mono font-bold px-2 py-0.5 rounded">
                      POST
                    </span>
                    <code className="text-sm font-mono text-slate-200">/api/usuario</code>
                  </div>
                  
                  <form onSubmit={handleCriarUsuario} className="flex gap-2">
                    <input
                      type="text"
                      value={novoUsuarioNome}
                      onChange={(e) => setNovoUsuarioNome(e.target.value)}
                      placeholder="Nome do novo utilizador (ex: Carlos)"
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </form>
                </div>
              </div>
            )}

            {abaDireita === 'pypi' && (
              <div className="p-6 overflow-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    Publicar o Portulong no PyPI (Python Package Index)
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A estrutura do pacote está <strong>100% pronta e configurada</strong> para ser enviada para o PyPI. Qualquer pessoa no mundo poderá instalar com <code className="text-emerald-400 font-mono">pip install portulong-sistema</code>.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Passo a Passo de Envio para o PyPI
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-300 font-medium mb-1">1. Instalar as ferramentas oficiais de empacotamento:</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>pip install build twine</span>
                        <button 
                          onClick={() => copiarTexto('pip install build twine', 'cmd1')}
                          className="hover:text-white"
                        >
                          {copiado === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-300 font-medium mb-1">2. Gerar os pacotes de distribuição (.tar.gz e .whl):</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>python -m build</span>
                        <button 
                          onClick={() => copiarTexto('python -m build', 'cmd2')}
                          className="hover:text-white"
                        >
                          {copiado === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-300 font-medium mb-1">3. Enviar para o PyPI oficial:</div>
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800">
                        <span>twine upload dist/*</span>
                        <button 
                          onClick={() => copiarTexto('twine upload dist/*', 'cmd3')}
                          className="hover:text-white"
                        >
                          {copiado === 'cmd3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <h4 className="font-semibold text-white">Arquivos de Publicação Incluídos no Repositório:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">setup.py</strong>: Metadados, scripts de console (<code className="text-indigo-300">ptg</code>, <code className="text-indigo-300">portulong</code>) e pacote.</li>
                    <li><strong className="text-slate-200">pyproject.toml</strong>: Especificação moderna PEP 517 / PEP 621.</li>
                    <li><strong className="text-slate-200">MANIFEST.in</strong>: Inclui os ícones PNG e ICO e exemplos na distribuição.</li>
                    <li><strong className="text-slate-200">.github/workflows/publish.yml</strong>: Envio automático pelo GitHub Actions!</li>
                    <li><strong className="text-slate-200">portulong/</strong>: O interpretador completo, CLI e instalador.</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Como Publicar Automaticamente via GitHub Actions
                  </h3>
                  <p className="text-slate-400">
                    O arquivo <code className="text-indigo-300">.github/workflows/publish.yml</code> já está configurado no repositório. Para publicar automaticamente:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>No PyPI (<a href="https://pypi.org/manage/account/token/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">pypi.org</a>), crie um <strong>API Token</strong>.</li>
                    <li>No GitHub, aceda a <strong>Settings → Secrets and variables → Actions</strong> e adicione o secret <code className="text-emerald-400">PYPI_API_TOKEN</code> com o valor do token.</li>
                    <li>Crie uma nova tag ou release:
                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded font-mono text-indigo-300 mt-1 border border-slate-800">
                        <span>git tag v1.0.25 && git push origin v1.0.25</span>
                        <button 
                          onClick={() => copiarTexto('git tag v1.0.25 && git push origin v1.0.25', 'cmdtag')}
                          className="hover:text-white"
                        >
                          {copiado === 'cmdtag' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </li>
                    <li>Ou clique no botão <strong>"Run workflow"</strong> na aba <strong>Actions</strong> do GitHub!</li>
                  </ol>
                </div>
              </div>
            )}

            {abaDireita === 'sistema' && (
              <div className="p-6 overflow-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-indigo-400" />
                    Execução Nativa no Windows & Linux
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O Portulong foi configurado para que os usuários possam rodar os arquivos <code className="text-indigo-300">.ptg</code> sem precisar de abrir o terminal!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <span className="text-lg">🪟</span> No Windows
                    </h3>
                    <ul className="space-y-2 text-slate-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Ícone Oficial:</strong> O instalador associa o arquivo <code className="text-slate-200">Portulong.ico</code> a todos os arquivos <code className="text-slate-200">.ptg</code> no Windows Explorer.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Duplo Clique:</strong> Ao clicar duas vezes num arquivo <code className="text-slate-200">.ptg</code>, ele executa e abre diretamente no navegador!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Menu de Contexto:</strong> Clique com o botão direito e escolha <code className="text-slate-200">▶ Executar com Portulong</code>.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <span className="text-lg">🐧</span> No Linux
                    </h3>
                    <ul className="space-y-2 text-slate-400">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Ícone Oficial:</strong> Instalado em <code className="text-slate-200">hicolor/128x128/apps/portulong.png</code> e associado ao tipo MIME.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Arquivo .desktop:</strong> Integração no GNOME, KDE, XFCE com menu e abertura padrão.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Duplo Clique:</strong> Abre e executa a aplicação sem terminal.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Comando de Configuração em Tempo Real: <code className="text-indigo-300 font-mono">ptg config</code>
                  </h3>
                  <p className="text-slate-400">
                    Basta executar este comando no terminal uma única vez. Ele configura as associações, atualiza o cache de ícones do Windows e do Linux instantaneamente e ativa a extensão do VS Code sem precisar de reiniciar o computador nem o editor!
                  </p>
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded font-mono text-indigo-300 border border-slate-800">
                    <span>ptg config</span>
                    <button 
                      onClick={() => copiarTexto('ptg config', 'cmdconfig')}
                      className="hover:text-white"
                    >
                      {copiado === 'cmdconfig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-400" />
                    Botão de Run no VS Code (Como no Python!)
                  </h3>
                  <p className="text-slate-400">
                    O Portulong inclui uma extensão nativa para o VS Code que adiciona o botão ▶ <strong>Executar Portulong</strong> na barra de ferramentas do editor. Basta abrir qualquer arquivo <code className="text-slate-200">.ptg</code> e clicar no botão de Play no canto superior direito para executar no terminal integrado!
                  </p>
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <img 
                      src="/imagens/Portulong.png" 
                      alt="Ícone Portulong" 
                      className="w-10 h-10 rounded-lg shadow-sm border border-slate-700" 
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="text-white font-medium">Ícone Oficial dos Arquivos .ptg</div>
                      <div className="text-slate-400 text-[11px] font-mono break-all">
                        Link Direto: <a href="https://i.imgur.com/CCsXVnb.png" target="_blank" rel="noreferrer" className="text-indigo-400 underline">https://i.imgur.com/CCsXVnb.png</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {abaDireita === 'docs' && (
              <div className="p-6 overflow-auto h-full text-sm text-slate-300 space-y-6 max-w-3xl">
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

                <div>
                  <h3 className="text-base font-semibold text-indigo-300 mb-2">Controlo e Scripts (JavaScript em PT)</h3>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                    <div><span className="text-cyan-400">funcao</span> calcular(a, b):</div>
                    <div className="pl-4"><span className="text-cyan-400">se</span> a &gt; b:</div>
                    <div className="pl-8"><span className="text-cyan-400">retornar</span> a</div>
                    <div className="pl-4"><span className="text-cyan-400">senao</span>:</div>
                    <div className="pl-8"><span className="text-cyan-400">retornar</span> b</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-slate-300 font-mono text-[11px]">{statusMsg}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Servidor: <strong className="text-slate-200 font-mono">0.0.0.0:3000</strong></span>
          <span>Versão: <strong className="text-indigo-400 font-mono">1.0.25</strong></span>
          <span>PyPI: <strong className="text-emerald-400 font-mono">Pronto</strong></span>
        </div>
      </footer>
    </div>
  );
}

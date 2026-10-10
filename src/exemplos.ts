export interface ExemploPortulong {
  id: string;
  nome: string;
  descricao: string;
  codigo: string;
}

export const EXEMPLOS: ExemploPortulong[] = [
  {
    id: "sistema_completo",
    nome: "Sistema Completo (Frontend + Backend)",
    descricao: "Exemplo completo com rotas REST em Python, componentes, estilização em português e manipulação dinâmica.",
    codigo: `pagina "Sistema Completo Portulong"

# Rota de Servidor Backend (Python)
rota GET /api/usuarios:
    resposta = {"usuarios": [{"id": 1, "nome": "João"}, {"id": 2, "nome": "Maria"}]}

rota POST /api/usuario:
    nome = dados.get("nome", "")
    resposta = {"sucesso": true, "mensagem": "Utilizador " + nome + " criado com sucesso!"}

# Componentes Reutilizáveis
componente cabecalho_sistema:
<div class="barra-superior">
    <h1>Portal Portulong</h1>
    <p>Frontend + Backend 100% em Português de Portugal</p>
</div>

cabecalho_sistema

cabecalho "Painel de Controlo"
paragrafo "Esta aplicação demonstra como criar um sistema web completo num só arquivo .ptg."

caixa "container":
    caixa "cartao":
        titulo2 "Utilizadores Registados"
        paragrafo "Dados fornecidos pelo servidor nativo via rota REST."
        botao "Carregar Utilizadores" acao "carregarUsuarios()"
        caixa "lista-caixa":
            <ul id="lista-usuarios" style="list-style: none; padding: 0; margin-top: 15px;"></ul>
        fim_caixa
    fim_caixa

    caixa "cartao":
        titulo2 "Adicionar Novo Utilizador"
        campo texto "novo-usuario"
        botao "Criar no Servidor" acao "criarUsuario()"
    fim_caixa
fim_caixa

estilo:
body { fundo: #f8fafc; fonte-familia: system-ui, sans-serif; margem: 0; espacamento: 20px; }
.barra-superior { fundo: #0f172a; cor: branco; espacamento: 20px; borda-arredondada: 12px; margem-base: 25px; }
.barra-superior h1 { margem: 0 0 5px 0; tamanho-fonte: 24px; cor: #60a5fa; }
.barra-superior p { margem: 0; cor: #94a3b8; tamanho-fonte: 14px; }
.container { largura-maxima: 800px; margem: 0 auto; exibicao: flexivel; flex-direcao: coluna; intervalo: 20px; }
.cartao { fundo: branco; borda-arredondada: 10px; espacamento: 20px; sombra: 0 4px 12px rgba(0,0,0,0.06); }
button { fundo: #2563eb; cor: branco; borda: nenhum; espacamento: 10px 20px; borda-arredondada: 6px; cursor: ponteiro; tamanho-fonte: 14px; peso-fonte: 600; transicao: 0.2s; }
input { espacamento: 10px 14px; margem-direita: 10px; borda: 1px solido #cbd5e1; borda-arredondada: 6px; tamanho-fonte: 14px; }

script:
funcao carregarUsuarios():
    fetch('/api/usuarios')
        .then(r => r.json())
        .then(dados => {
            var lista = document.getElementById('lista-usuarios')
            lista.innerHTML = ''
            dados.usuarios.forEach(u => {
                var li = document.createElement('li')
                li.style.padding = '10px'
                li.style.borderBottom = '1px solid #f1f5f9'
                li.style.display = 'flex'
                li.style.justifyContent = 'space-between'
                li.innerHTML = '<strong>' + u.nome + '</strong> <span style="color:#64748b">ID: #' + u.id + '</span>'
                lista.appendChild(li)
            })
        })

funcao criarUsuario():
    var nome = document.getElementById('novo-usuario').value
    se !nome:
        alerta('Por favor digite um nome!')
        retornar
    fetch('/api/usuario', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nome: nome})
    })
    .then(r => r.json())
    .then(dados => {
        alerta(dados.mensagem)
        document.getElementById('novo-usuario').value = ''
        carregarUsuarios()
    })

servidor:
    porta 3000
    host localhost
`,
  },
  {
    id: "ola_mundo",
    nome: "Página Simples (ola_mundo.ptg)",
    descricao: "Exemplo básico com tags, estilização PT e botão interativo.",
    codigo: `pagina "Minha Primeira Pagina"

cabecalho "Olá, Mundo em Portulong!"
paragrafo "Criado com sintaxe 100% em Português de Portugal."

caixa "painel":
    titulo2 "Bem-vindo ao Portulong"
    paragrafo "Uma linguagem moderna e simplificada para desenvolvimento web."
    botao "Clique Aqui para Testar" acao "alerta('Olá do Portulong! O código está a correr perfeitamente.')"
fim_caixa

estilo:
body { fundo: #f0fdf4; espacamento: 40px; fonte-familia: system-ui, sans-serif; }
h1 { cor: #166534; margem-base: 15px; }
p { cor: #374151; tamanho-fonte: 16px; }
.painel { fundo: branco; espacamento: 25px; borda-arredondada: 12px; largura-maxima: 500px; sombra: 0 4px 12px rgba(0,0,0,0.06); }
button { fundo: #16a34a; cor: branco; espacamento: 12px 24px; borda: nenhum; borda-arredondada: 8px; cursor: ponteiro; tamanho-fonte: 15px; peso-fonte: 600; }

script:
funcao alerta(mensagem):
    alerta(mensagem)
`,
  },
  {
    id: "interativo",
    nome: "Contador Interativo (interativo.ptg)",
    descricao: "Exemplo interativo com estado dinâmico em JavaScript traduzido do Portulong.",
    codigo: `pagina "Contador Portulong"

cabecalho "Contador em Tempo Real"
paragrafo "Demonstração de funções e controlo de fluxo em Português."

caixa "cartao":
    titulo2 "Valor Atual:"
    caixa "display":
        paragrafo "0"
    fim_caixa
    
    caixa "botoes":
        botao "- Diminuir" acao "alterar(-1)"
        botao "+ Aumentar" acao "alterar(1)"
        botao "Zerar" acao "zerar()"
    fim_caixa
fim_caixa

estilo:
body { fundo: #f8fafc; espacamento: 30px; fonte-familia: sans-serif; }
.cartao { fundo: branco; espacamento: 25px; borda-arredondada: 12px; largura-maxima: 350px; sombra: 0 4px 15px rgba(0,0,0,0.08); alinhamento-texto: centro; }
.display p { tamanho-fonte: 52px; cor: #2563eb; margem: 10px 0; peso-fonte: negrito; }
.botoes { exibicao: flexivel; intervalo: 10px; justificar-conteudo: centro; }
button { fundo: #2563eb; cor: branco; espacamento: 10px 18px; borda: nenhum; borda-arredondada: 6px; cursor: ponteiro; peso-fonte: 600; }

script:
var contador = 0

funcao alterar(delta):
    contador += delta
    var el = document.querySelector('.display p')
    se el:
        el.textContent = contador

funcao zerar():
    contador = 0
    var el = document.querySelector('.display p')
    se el:
        el.textContent = 0
`,
  },
];

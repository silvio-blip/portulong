/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  BookOpen, 
  Terminal, 
  Download, 
  ArrowRight, 
  Code, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Bot, 
  Cpu, 
  MessageSquare, 
  Shield, 
  Plus, 
  RotateCcw, 
  Volume2, 
  Send 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import JSZip from "jszip";

import PortulongLogo from "./components/PortulongLogo";
import { transpilePortulong } from "./utils/transpiler";
import { CodeTemplate, DiscordMessage, TerminalLog, DictionaryItem, ChatMessage } from "./types";

// Key translations dictionary for visual reference guide and search
const DICTIONARY: DictionaryItem[] = [
  { portulong: "se", python: "if", category: "palavra-chave", description: "Inicia um bloco de condição.", example: "se condicao:\n    escrever('Verdadeiro')" },
  { portulong: "senao", python: "else", category: "palavra-chave", description: "Executa caso nenhuma condição anterior seja atendida.", example: "se condicao:\n    escrever('Certo')\nsenao:\n    escrever('Errado')" },
  { portulong: "senaose", python: "elif", category: "palavra-chave", description: "Condicional intermediária.", example: "se x == 1:\n    escrever('Um')\nsenaose x == 2:\n    escrever('Dois')" },
  { portulong: "para", python: "for", category: "palavra-chave", description: "Loop de repetição controlado.", example: "para i em intervalo(5):\n    escrever(i)" },
  { portulong: "enquanto", python: "while", category: "palavra-chave", description: "Loop de repetição por condição contínua.", example: "enquanto repetindo:\n    escrever('Ativo')" },
  { portulong: "definir / funcao", python: "def", category: "palavra-chave", description: "Cria e define uma nova função ou comando.", example: "definir somar(a, b):\n    retornar a + b" },
  { portulong: "classe", python: "class", category: "palavra-chave", description: "Cria um modelo de objeto (classe).", example: "classe Jogador:\n    def __init__(self):\n        self.pontos = 0" },
  { portulong: "importar", python: "import", category: "palavra-chave", description: "Importa módulos externos.", example: "importar portulong.discord_pt como discord" },
  { portulong: "retornar", python: "return", category: "palavra-chave", description: "Retorna um valor de dentro de uma função.", example: "definir dobro(n):\n    retornar n * 2" },
  { portulong: "tentar", python: "try", category: "palavra-chave", description: "Tenta rodar um trecho capturando possíveis erros.", example: "tentar:\n    escrever(1 / 0)\nexcluir ZeroDivisionError:\n    escrever('Não divida por zero')" },
  { portulong: "exceto", python: "except", category: "palavra-chave", description: "Captura erros disparados dentro do bloco 'tentar'.", example: "tentar:\n    fazer()\nexcleto:\n    escrever('Deu erro')" },
  { portulong: "Verdadeiro", python: "True", category: "palavra-chave", description: "Valor lógico de verdadeiro.", example: "ativo = Verdadeiro" },
  { portulong: "Falso", python: "False", category: "palavra-chave", description: "Valor lógico de falso.", example: "mudo = Falso" },
  { portulong: "Nulo", python: "None", category: "palavra-chave", description: "Valor vazio de ausência de dados.", example: "resultado = Nulo" },
  { portulong: "assincrono", python: "async", category: "palavra-chave", description: "Define que um método ou evento pode rodar ao mesmo tempo que outros (assíncrono).", example: "definir assincrono ao_iniciar():\n    escrever('Robô online')" },
  { portulong: "aguardar", python: "await", category: "palavra-chave", description: "Aproveita loops assíncronos de forma pausada liberando o bot.", example: "aguardar contexto.enviar('Olá')" },
  { portulong: "escrever / mostrar", python: "print", category: "embutido", description: "Mostra uma mensagem no terminal do console.", example: "escrever('Console Log')" },
  { portulong: "ler", python: "input", category: "embutido", description: "Recebe dados digitados do usuário no terminal.", example: "nome = ler('Qual seu nome? ')" },
  { portulong: "tamanho", python: "len", category: "embutido", description: "Calcula a quantidade de itens em uma lista, tupla ou texto.", example: "tam = tamanho('Portulong')" },
  { portulong: "inteiro", python: "int", category: "embutido", description: "Converte valores para formato de números inteiros.", example: "numero = inteiro('10')" },
  { portulong: "texto", python: "str", category: "embutido", description: "Converte valores para formato de string escrita.", example: "txt = texto(42)" },
  { portulong: "real / decimal", python: "float", category: "embutido", description: "Converte valores para formato decimal.", example: "altura = real('1.75')" },
  { portulong: "lista", python: "list", category: "embutido", description: "Estrutura básica de arranjo com mutabilidade.", example: "convidados = lista()" },
  { portulong: "intervalo", python: "range", category: "embutido", description: "Gera índices de controle sequencial.", example: "intervalo(1, 10)" },
  
  // Discord-specific additions
  { portulong: "discord", python: "discord", category: "discord", description: "Módulo principal do Wrapper do Discord.", example: "importar portulong.discord_pt como discord" },
  { portulong: "Robo(prefixo)", python: "commands.Bot(command_prefix)", category: "discord", description: "Cria e configura a instância do bot do discord.", example: "robo = discord.Robo(prefixo='!')" },
  { portulong: "@robo.evento", python: "@bot.event", category: "discord", description: "Registra gatilhos de eventos automáticos do Discord.", example: "@robo.evento\ndefinir assincrono ao_iniciar():\n    escrever('Pronto!')" },
  { portulong: "@robo.comando(nome)", python: "@bot.command(name)", category: "discord", description: "Registra comandos escritos pelos usuários.", example: "@robo.comando(nome='ola')\ndefinir assincrono comando_ola(contexto):\n    aguardar contexto.enviar('Oi!')" },
  { portulong: "contexto.enviar(...)", python: "ctx.send(...)", category: "discord", description: "Envia uma mensagem no canal de texto ativo.", example: "aguardar contexto.enviar('Mensagem')" },
  { portulong: "contexto.autor.nome", python: "ctx.author.name", category: "discord", description: "Retorna o apelido/nome da pessoa que mandou o comando.", example: "aguardar contexto.enviar(f'{contexto.autor.nome} chamou o comando!')" },
  { portulong: "membro.expulsar()", python: "member.kick()", category: "discord", description: "Gatilho para expulsar um usuário do servidor Discord.", example: "aguardar membro.expulsar()" },
  { portulong: "canal.limpar(limite)", python: "channel.purge(limit)", category: "discord", description: "Exclui um número determinado de mensagens anteriores.", example: "aguardar contexto.canal.limpar(limite=50)" },
];

const TEMPLATES: CodeTemplate[] = [
  {
    id: "boas-vindas",
    name: "Bot Boas-vindas",
    description: "Reage a novos membros com saudações amigáveis no canal padrão.",
    filename: "bot_boas_vindas.ptg",
    code: `# Exemplo 1: Bot de Boas-vindas em Portulong
# Arquivo: bot_boas_vindas.ptg

importar portulong.discord_pt como discord

# Inicializa o bot com o prefixo '!'
robo = discord.Robo(prefixo="!")

# Evento ativado quando o robô se conecta
@robo.evento
definir assincrono ao_iniciar():
    escrever(f"Robô conectado com sucesso como {robo.usuario}!")

# Evento ativado quando um membro entra no servidor
@robo.evento
definir assincrono ao_entrar_membro(membro):
    # Procura o canal padrão do sistema do servidor
    canal = membro.servidor.canal_sistema
    se canal nao_eh Nulo:
        aguardar canal.enviar(f"Boas-vindas ao servidor, {membro.nome}! 🎉 Esperamos que se divirta!")
`
  },
  {
    id: "comandos-basicos",
    name: "Comandos Interativos",
    description: "Criação de comandos interativos fáceis como !ping, !ajuda e !diga.",
    filename: "comandos_interativos.ptg",
    code: `# Exemplo 2: Bot de Comandos Interativos
# Arquivo: comandos_interativos.ptg

importar portulong.discord_pt como discord

robo = discord.Robo(prefixo="!")

@robo.evento
definir assincrono ao_iniciar():
    escrever("Bot online e pronto para comandos em português!")

# Comando simples !ping
@robo.comando(nome="ping")
definir assincrono resposta_ping(contexto):
    aguardar contexto.enviar("🏓 Pong! O bot está rodando perfeitamente em Portulong.")

# Comando !diga <texto> que ecoa a frase do usuário
@robo.comando(nome="diga", ajuda="Faz o robô repetir o texto enviado")
definir assincrono resposta_falar(contexto, texto):
    aguardar contexto.enviar(f"O usuário **{contexto.autor.nome}** mandou dizer: {texto}")

# Comando !pergunta que simula respostas simples
@robo.comando(nome="pergunta")
definir assincrono resposta_pergunta(contexto, pergunta):
    fala = f"Hum, você perguntou: '{pergunta}'. Minha resposta é: Sim, com certeza! 👍"
    aguardar contexto.enviar(fala)
`
  },
  {
    id: "moderacao",
    name: "Moderação e Segurança",
    description: "Sistema básico de segurança para apagar mensagens em lote ou banir spammers.",
    filename: "seguranca.ptg",
    code: `# Exemplo 3: Bot de Moderação de Canais
# Arquivo: seguranca.ptg

importar portulong.discord_pt como discord

robo = discord.Robo(prefixo="!")

@robo.evento
definir assincrono ao_iniciar():
    escrever("Sistema avançado de segurança ativado nos canais.")

# Comando !limpar <quantidade> para deletar mensagens anteriores
@robo.comando(nome="limpar")
definir assincrono limpar_chat(contexto, quantidade: inteiro = 10):
    # Verifica se o solicitante tem permissão de gerenciar mensagens
    se contexto.autor.permissoes.gerenciar_mensagens:
        aguardar contexto.canal.limpar(limite=quantidade)
        aguardar contexto.enviar(f"🧹 {quantidade} mensagens apagadas com sucesso por {contexto.autor.nome}!", excluir_depois=5)
    senao:
        aguardar contexto.enviar("❌ Desculpe, você não tem a permissão de 'Gerenciar Mensagens' para usar isso.")

# Comando !expulsar <membro>
@robo.comando(nome="expulsar")
definir assincrono expulsar_membro(contexto, membro: discord.Membro):
    se contexto.autor.permissoes.expulsar_membros:
        aguardar membro.expulsar()
        aguardar contexto.enviar(f"🚨 {membro.nome} foi banido/expulso por violar as regras do servidor!")
    senao:
        aguardar contexto.enviar("❌ Acesso negado. Apenas moderadores autorizados podem usar esse comando.")
`
  },
  {
    id: "calculadora",
    name: "Bot Calculadora",
    description: "Excelente bot utilitário com comandos rápidos de matemática.",
    filename: "calculadora.ptg",
    code: `# Exemplo 4: Bot de Matemática e Cálculo
# Arquivo: calculadora.ptg

importar portulong.discord_pt como discord

robo = discord.Robo(prefixo="!")

@robo.evento
definir assincrono ao_iniciar():
    escrever("Módulo de cálculos matemáticos carregado.")

# Comando !somar <numero1> <numero2>
@robo.comando(nome="somar")
definir assincrono somar_numeros(contexto, n1: real, n2: real):
    soma = n1 + n2
    aguardar contexto.enviar(f"📊 **Calculadora Portulong**:\nO resultado da soma de {n1} + {n2} é igual a: **{soma}**")

# Comando !multiplicar <numero1> <numero2>
@robo.comando(nome="vezes")
definir assincrono multiplicar_numeros(contexto, n1: real, n2: real):
    resultado = n1 * n2
    aguardar contexto.enviar(f"✖️ O resultado de {n1} multiplicado por {n2} é igual a: **{resultado}**")
`
  }
];

// Função de realce de sintaxe robusta para Portulong (.ptg)
function highlightPortulong(rawCode: string): React.ReactNode[] {
  const regex = /(\s+)|(#.*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(\b[a-zA-Z_0-9ñáéíóúçãõâêîôûüãõàèìòù_]+\b)|([()[\]{}!@#$%^&*+\-=|\\:;<>,.?/]+)/g;
  
  let match;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const KEYWORDS = new Set([
    "se", "senao", "senaose", "para", "enquanto", "definir", "funcao", 
    "classe", "importar", "de", "como", "retornar", "tentar", "exceto", 
    "finalmente", "com", "lambda", "passar", "parar", "continuar", 
    "Verdadeiro", "Falso", "Nulo", "e", "ou", "nao", "em", "eh", "nao_eh",
    "asseverar", "global", "naolocal", "levantar", "produzir", 
    "assincrono", "aguardar"
  ]);

  const BUILTINS = new Set([
    "escrever", "mostrar", "ler", "tamanho", "inteiro", "texto", "real", 
    "decimal", "boleano", "lista", "dicionario", "conjunto", "tupla", 
    "intervalo", "abrir", "tipo", "somar", "absoluto", "maximo", "minimo", 
    "arredondar", "mapear", "filtrar", "ordenado", "super", "propriedade", 
    "zipar", "enumerar", "objeto", "qualquer", "todos", "ajuda", "identidade", 
    "reversivel", "formatar", "obter_atributo", "definir_atributo", "tem_atributo", 
    "excluir_atributo", "representacao", "proximo", "iterador", "eh_instancia", "eh_subclasse",
    "Excessao", "ErroDeValor", "ErroDeTipo", "ErroDeNome", "ErroDeIndice", 
    "ErroDeChave", "ErroDeImportacao", "ErroDeAtributo", "ErroDivisaoPorZero", 
    "FaltaDeMemoria", "ParadaDeIteracao", "ErroDoSistema", "ArquivoNaoEncontrado", 
    "InterrupcaoPeloTeclado", "ErroDeAsseveracao", "ErroDeExecucao", "ErroNaoImplementado"
  ]);

  const DISCORD = new Set([
    "Robo", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem", "discord",
    "comando", "evento", "contexto", "membro", "canal", "servidor", "mensagem", 
    "usuario", "enviar", "responder", "deletar", "adicionar_reacao", 
    "remover_reacao", "expulsar", "banir", "limpar", "conteudo", "autor", 
    "id", "canal_sistema", "permissoes", "expulsar_membros", "gerenciar_mensagens"
  ]);

  while ((match = regex.exec(rawCode)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={key++}>{rawCode.slice(lastIndex, match.index)}</span>);
    }

    const [full, whitespace, comment, str, word, operator] = match;

    if (whitespace) {
      elements.push(<span key={key++}>{whitespace}</span>);
    } else if (comment) {
      elements.push(<span key={key++} className="text-slate-500 italic font-mono">{comment}</span>);
    } else if (str) {
      elements.push(<span key={key++} className="text-amber-300 font-mono">{str}</span>);
    } else if (word) {
      if (KEYWORDS.has(word)) {
        elements.push(<span key={key++} className="text-pink-400 font-bold font-mono">{word}</span>);
      } else if (BUILTINS.has(word)) {
        elements.push(<span key={key++} className="text-cyan-400 font-medium font-mono">{word}</span>);
      } else if (DISCORD.has(word)) {
        elements.push(<span key={key++} className="text-indigo-400 font-semibold font-mono">{word}</span>);
      } else if (/^\d+$/.test(word)) {
        elements.push(<span key={key++} className="text-purple-400 font-mono">{word}</span>);
      } else if (rawCode[match.index + word.length] === '(') {
        elements.push(<span key={key++} className="text-emerald-400 font-mono font-medium">{word}</span>);
      } else {
        elements.push(<span key={key++} className="text-slate-200 font-mono">{word}</span>);
      }
    } else if (operator) {
      if (operator.includes('@')) {
        elements.push(<span key={key++} className="text-amber-500 font-bold font-mono">{operator}</span>);
      } else {
        elements.push(<span key={key++} className="text-emerald-500 font-mono">{operator}</span>);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawCode.length) {
    elements.push(<span key={key++}>{rawCode.slice(lastIndex)}</span>);
  }

  return elements;
}

// Função de realce de sintaxe robusta para Python (.py)
function highlightPython(rawCode: string): React.ReactNode[] {
  const regex = /(\s+)|(#.*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(\b[a-zA-Z_0-9ñáéíóúçãõâêîôûüãõàèìòù_]+\b)|([()[\]{}!@#$%^&*+\-=|\\:;<>,.?/]+)/g;
  
  let match;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const KEYWORDS = new Set([
    "if", "else", "elif", "for", "while", "def", "class", "import", "from", "as", 
    "return", "try", "except", "finally", "with", "lambda", "pass", "break", "continue", 
    "True", "False", "None", "and", "or", "not", "in", "is", "assert", "global", 
    "nonlocal", "raise", "yield", "async", "await"
  ]);

  const BUILTINS = new Set([
    "print", "input", "len", "int", "str", "float", "list", "dict", "set", "tuple", 
    "range", "open", "type", "sum", "abs", "max", "min", "round", "map", "filter", 
    "sorted", "super", "property", "zip", "enumerate", "object", "any", "all", "help", 
    "id", "reversed", "format", "getattr", "setattr", "hasattr", "delattr", "repr", 
    "next", "iter", "isinstance", "issubclass", "ZeroDivisionError", "ValueError", 
    "TypeError", "NameError", "IndexError", "KeyError", "ImportError", "AttributeError", 
    "Exception", "KeyboardInterrupt"
  ]);

  const DISCORD = new Set([
    "Bot", "Intents", "Member", "Guild", "Message", "User", "TextChannel", "commands", "discord",
    "command", "event", "ctx", "send", "reply", "delete", "kick", "ban", "purge", "author", 
    "content", "guild", "channel", "message", "user", "id", "on_ready", "on_message"
  ]);

  while ((match = regex.exec(rawCode)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={key++}>{rawCode.slice(lastIndex, match.index)}</span>);
    }

    const [full, whitespace, comment, str, word, operator] = match;

    if (whitespace) {
      elements.push(<span key={key++}>{whitespace}</span>);
    } else if (comment) {
      elements.push(<span key={key++} className="text-slate-500 italic font-mono">{comment}</span>);
    } else if (str) {
      elements.push(<span key={key++} className="text-amber-300 font-mono">{str}</span>);
    } else if (word) {
      if (KEYWORDS.has(word)) {
        elements.push(<span key={key++} className="text-pink-400 font-bold font-mono">{word}</span>);
      } else if (BUILTINS.has(word)) {
        elements.push(<span key={key++} className="text-cyan-400 font-medium font-mono">{word}</span>);
      } else if (DISCORD.has(word)) {
        elements.push(<span key={key++} className="text-indigo-400 font-semibold font-mono">{word}</span>);
      } else if (/^\d+$/.test(word)) {
        elements.push(<span key={key++} className="text-purple-400 font-mono">{word}</span>);
      } else if (rawCode[match.index + word.length] === '(') {
        elements.push(<span key={key++} className="text-emerald-400 font-mono font-medium">{word}</span>);
      } else {
        elements.push(<span key={key++} className="text-slate-350 font-mono">{word}</span>);
      }
    } else if (operator) {
      if (operator.includes('@')) {
        elements.push(<span key={key++} className="text-amber-500 font-bold font-mono">{operator}</span>);
      } else {
        elements.push(<span key={key++} className="text-emerald-500 font-mono">{operator}</span>);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawCode.length) {
    elements.push(<span key={key++}>{rawCode.slice(lastIndex)}</span>);
  }

  return elements;
}

// Catálogo de Abreviaturas e Snippets do Portulong (Auto-completar)
const PORTULONG_SNIPPETS = [
  {
    key: "se",
    displayName: "se (condição)",
    snippet: "se condicao:\n    # bloco\n",
    description: "Estrutura condicional 'se' (if)"
  },
  {
    key: "senao",
    displayName: "senao",
    snippet: "senao:\n    # bloco\n",
    description: "Estrutura condicional 'senao' (else)"
  },
  {
    key: "senaose",
    displayName: "senaose",
    snippet: "senaose outra_condicao:\n    # bloco\n",
    description: "Estrutura condicional 'senaose' (elif)"
  },
  {
    key: "para",
    displayName: "para i em intervalo(...)",
    snippet: "para i em intervalo(0, 10):\n    escrever(i)\n",
    description: "Laço de repetição determinado 'para' (for)"
  },
  {
    key: "enquanto",
    displayName: "enquanto (condição)",
    snippet: "enquanto condicao:\n    # bloco\n",
    description: "Laço de repetição condicional 'enquanto' (while)"
  },
  {
    key: "definir",
    displayName: "definir assincrono comando",
    snippet: "definir assincrono nome_funcao(contexto):\n    aguardar contexto.enviar(\"Texto\")\n",
    description: "Define uma nova função assíncrona portuguesa"
  },
  {
    key: "funcao",
    displayName: "funcao (definir)",
    snippet: "definir assincrono minha_funcao():\n    # código aqui\n",
    description: "Declaração de uma função em português (def)"
  },
  {
    key: "robo",
    displayName: "robo = discord.Robo(...)",
    snippet: "robo = discord.Robo(prefixo=\"!\")\n",
    description: "Instancia e configura um novo robô do Discord"
  },
  {
    key: "comando",
    displayName: "@robo.comando (Comando do Chat)",
    snippet: "@robo.comando(nome=\"ping\", ajuda=\"Comando de resposta rápida\")\ndefinir assincrono resposta_ping(contexto):\n    aguardar contexto.enviar(\"🏓 Pong!\")\n",
    description: "Cria um comando de texto interativo !ping para o bot"
  },
  {
    key: "evento",
    displayName: "@robo.evento (Conexão e Inicialização)",
    snippet: "@robo.evento\ndefinir assincrono ao_iniciar():\n    escrever(f\"Robô {robo.usuario} está online! 🚀\")\n",
    description: "Trata o evento de conexão inicial (on_ready)"
  },
  {
    key: "ao_mensagem",
    displayName: "@robo.evento ao_mensagem (Filtros)",
    snippet: "@robo.evento\ndefinir assincrono ao_mensagem(mensagem):\n    se mensagem.autor == robo.usuario:\n        retornar\n    \n    se \"bom dia\" em mensagem.conteudo.lower():\n        aguardar mensagem.canal.enviar(f\"Bom dia, {mensagem.autor.nome}! 🐉\")\n",
    description: "Intercede e processa toda mensagem recebida"
  },
  {
    key: "enviar",
    displayName: "contexto.enviar(...)",
    snippet: "aguardar contexto.enviar(\"Sua mensagem aqui!\")",
    description: "Envia uma mensagem de text simples ao canal ativo"
  },
  {
    key: "responder",
    displayName: "contexto.responder(...)",
    snippet: "aguardar contexto.responder(\"Sua resposta!\")",
    description: "Responde de forma encadeada diretamente à mensagem original"
  },
  {
    key: "escrever",
    displayName: "escrever(... / print)",
    snippet: "escrever(\"Logs de monitoramento!\")",
    description: "Imprime valores informativos na área de logs do painel"
  },
  {
    key: "importar",
    displayName: "importar portulong.discord_pt",
    snippet: "importar portulong.discord_pt como discord\n",
    description: "Importa a ponte adaptada em português para o discord.py"
  },
  {
    key: "tentar",
    displayName: "tentar ... exceto (Segurança)",
    snippet: "tentar:\n    # bloco propício a erros\nexceto ErroDeValor como e:\n    escrever(f\"Ocorreu um erro: {e}\")\n",
    description: "Estrutura para tratamento e interceptação de erros"
  }
];

export default function App() {
  const currentHost = typeof window !== "undefined" && !window.location.hostname.includes("ai.studio") && !window.location.hostname.includes("run.app") && !window.location.hostname.includes("localhost")
    ? window.location.hostname
    : "portulong.vercel.app";
  const currentOrigin = typeof window !== "undefined"
    ? window.location.origin
    : "https://portulong.vercel.app";

  const [activeTab, setActiveTab] = useState<"ide" | "translator" | "docs" | "pypi">("ide");
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [pythonEquivalent, setPythonEquivalent] = useState("");
  const [activePreset, setActivePreset] = useState(TEMPLATES[0].id);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // Estados de Abreviatura e Auto-completar inteligente
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof PORTULONG_SNIPPETS>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeWord, setActiveWord] = useState("");

  // Simulator State
  const [simulatedChannel, setSimulatedChannel] = useState("geral");
  const [chatInput, setChatInput] = useState("");
  const [simulatorLogs, setSimulatorLogs] = useState<TerminalLog[]>([
    { id: "1", type: "info", time: "21:20:00", message: "Inicializando compilador virtual do Portulong CLI v1.0.0..." },
    { id: "2", type: "success", time: "21:20:01", message: "Verificando dependências de 'discord_pt.py' wrapper (dependente de 'discord.py')..." },
    { id: "3", type: "success", time: "21:20:02", message: "Ambiente pronto para simulação no navegador!" }
  ]);
  const [discordMessages, setDiscordMessages] = useState<DiscordMessage[]>([
    { id: "1", sender: "Mestre_Do_Portulong", avatarColor: "from-indigo-500 to-purple-600", timestamp: "Hoje às 21:18", content: "Seja bem vindo à central da Portulong! Digite comandos do robô aqui no canal de chat para simular.", isBot: false },
    { id: "2", sender: "PortulongBot", avatarColor: "from-green-500 to-emerald-600", timestamp: "Hoje às 21:18", content: "Opa! Eu sou o robô simulado do Portulong. Prorrogado sob Python, aguardando instruções em português! Experimente digitar !ping", isBot: true }
  ]);
  const [isSimulatingResponse, setIsSimulatingResponse] = useState(false);

  // Translation Workspace State
  const [inputPython, setInputPython] = useState(`# Cole código Python original do Discord aqui
import discord
from discord.ext import commands

bot = commands.Bot(command_prefix="?")

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

@bot.command()
async def greet(ctx):
    await ctx.send("Hello Discord!")
`);
  const [translatedPortulong, setTranslatedPortulong] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Gemini Tutor Module State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Guide search filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"tudo" | "palavra-chave" | "embutido" | "discord">("tudo");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const discordEndRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Transpile portulong changes instantly
  useEffect(() => {
    try {
      const transpiled = transpilePortulong(code);
      setPythonEquivalent(transpiled);
    } catch (err) {
      console.error(err);
    }
  }, [code]);

  // Keep logs scrolled down
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulatorLogs]);

  // Keep Discord comments scrolled down
  useEffect(() => {
    discordEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discordMessages]);

  const selectPreset = (presetId: string) => {
    const selected = TEMPLATES.find(t => t.id === presetId);
    if (selected) {
      setCode(selected.code);
      setActivePreset(presetId);
      addTerminalLog("success", `Carregado template '${selected.name}' (.ptg)`);
    }
  };

  // Aplica o snippet escolhido substituindo a abreviação digitada
  const applySnippet = (item: typeof PORTULONG_SNIPPETS[0]) => {
    const textarea = document.getElementById("code-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentCode = code;

    // Encontra a palavra sendo escrita imediatamente antes do cursor
    const textBeforeCaret = currentCode.slice(0, start);
    const match = textBeforeCaret.match(/[\w_@]+$/);

    let newCode = "";
    let newCursorPos = 0;

    if (match) {
      const wordBeingTyped = match[0];
      const matchStart = start - wordBeingTyped.length;

      // Substitui o prefixo pelo snippet completo
      newCode = currentCode.slice(0, matchStart) + item.snippet + currentCode.slice(start);
      newCursorPos = matchStart + item.snippet.length;
    } else {
      // Caso não haja termo detectado, insere na posição do cursor
      newCode = currentCode.slice(0, start) + item.snippet + currentCode.slice(start);
      newCursorPos = start + item.snippet.length;
    }

    setCode(newCode);
    setShowSuggestions(false);

    // Foca novamente o editor e define o cursor ao final do snippet
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      if (preRef.current) {
        preRef.current.scrollTop = textarea.scrollTop;
        preRef.current.scrollLeft = textarea.scrollLeft;
      }
    }, 50);
  };

  // Monitora alterações de texto para habilitar/filtrar sugestões
  const handleEditorChange = (value: string) => {
    setCode(value);

    const textarea = document.getElementById("code-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    // Aguarda um ciclo de render para obter a posição real do selectionStart
    setTimeout(() => {
      const start = textarea.selectionStart;
      const textBeforeCaret = value.slice(0, start);
      const match = textBeforeCaret.match(/[\w_@]+$/);

      if (match) {
        const word = match[0].toLowerCase();
        setActiveWord(word);

        // Filtra os templates que começam com a abreviação digitada
        const filtered = PORTULONG_SNIPPETS.filter(item =>
          item.key.startsWith(word) || item.displayName.toLowerCase().includes(word)
        );

        if (filtered.length > 0 && word.length >= 1) {
          setSuggestions(filtered);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
        setActiveWord("");
      }
    }, 0);
  };

  // Monitora clique ou navegação por seta para saber onde está o cursor
  const handleCursorCheck = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const value = textarea.value;
    const textBeforeCaret = value.slice(0, start);
    const match = textBeforeCaret.match(/[\w_@]+$/);

    if (match) {
      const word = match[0].toLowerCase();
      setActiveWord(word);
      const filtered = PORTULONG_SNIPPETS.filter(item =>
        item.key.startsWith(word) || item.displayName.toLowerCase().includes(word)
      );

      if (filtered.length > 0 && word.length >= 1) {
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setActiveWord("");
    }
  };

  // Tratamento de teclas especiais (Escape, ArrowUp, ArrowDown, Tab e Enter)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const valueStr = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 1. ESC: Fecha sugestões
    if (e.key === "Escape") {
      if (showSuggestions) {
        e.preventDefault();
        setShowSuggestions(false);
      }
      return;
    }

    // 2. SETAS: Navega no menu de sugestões se estiver visível
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
    }

    // 3. TAB ou ENTER: Insere a abreviação selecionada
    if (e.key === "Tab" || e.key === "Enter") {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        applySnippet(suggestions[selectedIndex]);
        return;
      }

      // Se for TAB regular (sem menu de autocompletar ativo), faz indentação clássica com 4 espaços
      if (e.key === "Tab") {
        e.preventDefault();
        const newCode = valueStr.substring(0, start) + "    " + valueStr.substring(end);
        setCode(newCode);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
        return;
      }
    }
  };

  const addTerminalLog = (type: "info" | "success" | "warning" | "error", message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setSimulatorLogs(prev => [...prev, {
      id: Math.random().toString(),
      type,
      time: timeStr,
      message
    }]);
  };

  // Run or transpile simulator with AI
  const simulateBotResponse = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");

    // Add user message to Discord history
    const now = new Date();
    const timeStr = `Hoje às ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const userMsgId = Math.random().toString();
    
    setDiscordMessages(prev => [...prev, {
      id: userMsgId,
      sender: "Mestre_Do_Portulong",
      avatarColor: "from-indigo-500 to-purple-600",
      timestamp: timeStr,
      content: userMsg,
      isBot: false
    }]);

    addTerminalLog("info", `[Entrada de Chat] Membro enviou: "${userMsg}"`);
    setIsSimulatingResponse(true);

    try {
      const response = await fetch("/api/ai/simulate-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          inputMessage: userMsg,
          userTag: "Mestre_Do_Portulong"
        })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o compilador AI.");
      }

      const result = await response.json();
      
      setIsSimulatingResponse(false);

      if (result.log) {
        addTerminalLog("info", result.log);
      }

      // Add Bot reply if simulated
      if (result.response && result.response !== "None" && result.response !== "null") {
        setDiscordMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: result.botName || "PortulongBot",
          avatarColor: "from-green-500 to-emerald-600",
          timestamp: timeStr,
          content: result.response,
          isBot: true,
          embed: result.embed && (result.embed.title || result.embed.description) ? result.embed : undefined
        }]);
        addTerminalLog("success", `[Robô] Enviou resposta no canal #${simulatedChannel}`);
      } else {
        addTerminalLog("warning", `[Robô] Nenhum comando ou evento ativo respondeu à mensagem "${userMsg}".`);
      }

    } catch (err: any) {
      setIsSimulatingResponse(false);
      addTerminalLog("error", `Erro de Simulação: ${err.message}`);
      setDiscordMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "PortulongBot",
        avatarColor: "from-red-500 to-orange-600",
        timestamp: timeStr,
        content: `⚠️ [ERRO DE MOTOR]: Ocorreu um problema ao simular este comando no servidor: ${err.message}`,
        isBot: true
      }]);
    }
  };

  // Convert English Python to Portulong with Gemini
  const translatePythonToPortulong = async () => {
    if (!inputPython.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pythonCode: inputPython })
      });
      const data = await res.json();
      if (data.ptgCode) {
        setTranslatedPortulong(data.ptgCode);
      } else {
        setTranslatedPortulong(`# Erro: ${data.error || "Formato inválido"}`);
      }
    } catch (err: any) {
      setTranslatedPortulong(`# Ocorreu um erro na tradução: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Explain user Portulong code with Gemini Tutor
  const explainCode = async () => {
    setIsAiAnswering(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, question: aiQuestion })
      });
      const data = await res.json();
      setAiAnswer(data.explanation || "Nenhuma resposta gerada.");
    } catch (err: any) {
      setAiAnswer(`Ocorreu um erro ao obter ajuda do tutor: ${err.message}`);
    } finally {
      setIsAiAnswering(false);
    }
  };

  // AI Assistant Chatbot
  const sendChatMessage = async () => {
    if (!chatMessageInput.trim()) return;
    const textMsg = chatMessageInput.trim();
    setChatMessageInput("");

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      content: textMsg,
      timestamp: new Date().toLocaleTimeString().slice(0, 5)
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setIsChatSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory.map(m => ({ role: m.sender === "user" ? "user" : "model", content: m.content })) })
      });
      const data = await res.json();
      
      const aiReply: ChatMessage = {
        id: Math.random().toString(),
        sender: "ai",
        content: data.reply || "Desculpe, tive um problema ao responder.",
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };
      setChatHistory(prev => [...prev, aiReply]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        id: Math.random().toString(),
        sender: "ai",
        content: `Erro ao comunicar com assistente: ${err.message}`,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Copy keyword helper
  const handleCopy = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedKeyword(word);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  // Generate and download client side ZIP using JSZip
  const handleDownloadDistribution = async () => {
    addTerminalLog("info", "Compilando e empacotando distribuição para o PIP/PyPI...");
    const zip = new JSZip();

    // Tenta obter o logo portulong.png para empacotar
    let logoBlob: Blob | null = null;
    try {
      const logoRes = await fetch("/portulong.png");
      if (logoRes.ok) {
        logoBlob = await logoRes.blob();
      }
    } catch (e) {
      console.warn("Não foi possível carregar o portulong.png para o ZIP:", e);
    }

    // 1. Root files
    zip.file("setup.py", `from setuptools import setup, find_packages

setup(
    name="portulong",
    version="1.0.0",
    author="Silvio & Portulong Community",
    author_email="silviok5000@gmail.com",
    description="Uma linguagem de programacao em portugues para criar facil bots do Discord baseada em Python.",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "discord.py>=2.0.0",
    ],
    entry_points={
        "console_scripts": [
            "portulong=portulong.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)`);

    zip.file("pyproject.toml", `[build-system]
requires = ["setuptools>=61.0.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "portulong"
version = "1.0.0"
description = "Linguagem de programacao em portugues baseada em Python para bots do Discord."
readme = "README.md"
authors = [{ name = "Silvio", email = "silviok5000@gmail.com" }]
dependencies = [
    "discord.py>=2.0.0"
]

[project.scripts]
portulong = "portulong.cli:main"`);

    zip.file("README.md", `# 🐉 Portulong 

Uma linguagem de programação moderna 100% em português voltada para facilitar o aprendizado de programação de iniciantes, com foco especial na criação de robôs do Discord profissionais de forma extremamente simples.

Baseada diretamente no interpretador do **Python** e construída sobre a biblioteca oficial **Discord.py**.

## 🚀 Como Instalar

Para instalar o compilador e ambiente de execução do Portulong, basta rodar o comando abaixo no seu terminal (requer Python 3.8+ instalado):

\`\`\`bash
pip install portulong.ptg
\`\`\`

## 💻 Como usar

Escreva o seu primeiro arquivo \`.ptg\`! Por exemplo, crie um arquivo chamado \`meu_bot.ptg\`:

\`\`\`python
importar portulong.discord_pt como discord

robo = discord.Robo(prefixo="!")

@robo.evento
definir assincrono ao_iniciar():
    escrever(f"Opa! Robô online como {robo.usuario}")

@robo.comando(nome="ola")
definir assincrono responder_ola(contexto):
    aguardar contexto.enviar(f"Olá {contexto.autor.nome}! Eu fui codificado em Portulong!")
\`\`\`

Para executar o seu robô no computador, basta rodar o comando:

\`\`\`bash
portulong meu_bot.ptg
\`\`\`

## ⚙️ Como funciona?

O Portulong transpila o código em português diretamente para Python válido em tempo de execução, preservando comentários e literais de string intactos, e mapeando as propriedades do Discord da forma mais intuitiva possível.

Desenvolvido com carinho para a comunidade brasileira 🇧🇷`);

    // 2. Package module directory: portulong/
    const packageFolder = zip.folder("portulong")!;
    
    packageFolder.file("__init__.py", `from .transpiler import transpile
from .discord_pt import Robo, wrap_object
`);

    packageFolder.file("transpiler.py", `import re

KEYWORDS_MAP = {
    "se": "if",
    "senao": "else",
    "senaose": "elif",
    "para": "for",
    "enquanto": "while",
    "definir": "def",
    "funcao": "def",
    "classe": "class",
    "importar": "import",
    "de": "from",
    "como": "as",
    "retornar": "return",
    "tentar": "try",
    "exceto": "except",
    "finalmente": "finally",
    "com": "with",
    "lambda": "lambda",
    "passar": "pass",
    "parar": "break",
    "continuar": "continue",
    "Verdadeiro": "True",
    "Falso": "False",
    "Nulo": "None",
    "e": "and",
    "ou": "or",
    "nao": "not",
    "em": "in",
    "eh": "is",
    "asseverar": "assert",
    "global": "global",
    "naolocal": "nonlocal",
    "levantar": "raise",
    "produzir": "yield",
    "assincrono": "async",
    "aguardar": "await",
}

BUILTINS_MAP = {
    "escrever": "print",
    "mostrar": "print",
    "ler": "input",
    "tamanho": "len",
    "inteiro": "int",
    "texto": "str",
    "real": "float",
    "decimal": "float",
    "boleano": "bool",
    "lista": "list",
    "dicionario": "dict",
    "conjunto": "set",
    "tupla": "tuple",
    "intervalo": "range",
    "abrir": "open",
    "tipo": "type",
    "somar": "sum",
    "absoluto": "abs",
    "maximo": "max",
    "minimo": "min",
    "arredondar": "round",
}

DISCORD_MAP = {
    "Robo": "Bot",
    "prefixo": "command_prefix",
    "evento": "event",
    "comando": "command",
    "nome": "name",
    "ajuda": "help",
    "enviar": "send",
    "responder": "reply",
    "deletar": "delete",
    "adicionar_reacao": "add_reaction",
    "remover_reacao": "remove_reaction",
    "expulsar": "kick",
    "banir": "ban",
    "limpar": "purge",
    "conteudo": "content",
    "autor": "author",
    "canal": "channel",
    "servidor": "guild",
    "mensagem": "message",
    "usuario": "user",
    "id": "id",
}

def transpile(code_str):
    strings = []
    comments = []
    
    # 1. Protect triple strings
    def repl_triple(m):
        strings.append(m.group(0))
        return f"__TRIPLE_STR_PLACEHOLDER_{len(strings)-1}__"
    processed = re.sub(r'"""[\\s\\S]*?"""', repl_triple, code_str)
    
    # 2. Protect single/double quotes
    def repl_str(m):
        strings.append(m.group(0))
        return f"__STR_PLACEHOLDER_{len(strings)-1}__"
    processed = re.sub(r'"([^"\\\\]|\\\\.)*"', repl_str, processed)
    processed = re.sub(r"'([^'\\\\]|\\\\.)*'", repl_str, processed)
    
    # 3. Protect comments
    def repl_com(m):
        comments.append(m.group(0))
        return f"__COM_PLACEHOLDER_{len(comments)-1}__"
    processed = re.sub(r'#.*', repl_com, processed)
    
    # Combine maps
    full_map = {**KEYWORDS_MAP, **BUILTINS_MAP, **DISCORD_MAP}
    sorted_keys = sorted(full_map.keys(), key=len, reverse=True)
    
    for key in sorted_keys:
        val = full_map[key]
        escaped_key = re.escape(key)
        processed = re.sub(rf'\\b{escaped_key}\\b', val, processed)
        
    # Restore comments
    for i in reversed(range(len(comments))):
         processed = processed.replace(f"__COM_PLACEHOLDER_{i}__", comments[i])
         
    # Restore strings
    for i in reversed(range(len(strings))):
         processed = processed.replace(f"__STR_PLACEHOLDER_{i}__", strings[i])
         processed = processed.replace(f"__TRIPLE_STR_PLACEHOLDER_{i}__", strings[i])
         
    return processed
`);

    packageFolder.file("cli.py", `import sys
import os
from .transpiler import transpile

def main():
    if len(sys.argv) < 2:
        print("🐉 Portulong CLI v1.0.0")
        print("Uso: portulong <arquivo.ptg>")
        sys.exit(1)
        
    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"Erro: Arquivo '{filepath}' nao encontrado.")
        sys.exit(1)
        
    with open(filepath, 'r', encoding='utf-8') as f:
        ptg_code = f.read()
        
    # Translate PTG to standard python code
    py_code = transpile(ptg_code)
    
    # Inject directory of execution in python system path for library finding
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Run the compiled code dynamically inside standard python context
    exec(py_code, {'__name__': '__main__'})
`);

    packageFolder.file("discord_pt.py", `import discord
from discord.ext import commands
import asyncio

class DynamicProxy:
    def __init__(self, obj):
        super().__setattr__('_obj', obj)

    def __getattr__(self, name):
        translations = {
            'conteudo': 'content',
            'autor': 'author',
            'canal': 'channel',
            'nome': 'name',
            'id': 'id',
            'servidor': 'guild',
            'mensagem': 'message',
            'usuario': 'user',
            'canal_sistema': 'system_channel',
            'permissoes': 'permissions',
            'expulsar_membros': 'kick_members',
            'gerenciar_mensagens': 'manage_messages',
        }
        eng_name = translations.get(name, name)
        val = getattr(self._obj, eng_name)
        if callable(val):
            method_translations = {
                'enviar': 'send',
                'responder': 'reply',
                'deletar': 'delete',
                'adicionar_reacao': 'add_reaction',
                'remover_reacao': 'remove_reaction',
                'expulsar': 'kick',
                'banir': 'ban',
                'limpar': 'purge',
            }
            eng_method = method_translations.get(name, name)
            actual_method = getattr(self._obj, eng_method)
            
            def wrapped_method(*args, **kwargs):
                if 'nome' in kwargs:
                    kwargs['name'] = kwargs.pop('nome')
                if 'excluir_depois' in kwargs:
                    kwargs['delete_after'] = kwargs.pop('excluir_depois')
                if 'limite' in kwargs:
                    kwargs['limit'] = kwargs.pop('limite')
                
                unwrapped_args = []
                for arg in args:
                    if hasattr(arg, '_obj'):
                        unwrapped_args.append(arg._obj)
                    else:
                        unwrapped_args.append(arg)
                
                unwrapped_kwargs = {}
                for k, v in kwargs.items():
                    if hasattr(v, '_obj'):
                        unwrapped_kwargs[k] = v._obj
                    else:
                        unwrapped_kwargs[k] = v
                        
                res = actual_method(*unwrapped_args, **unwrapped_kwargs)
                if asyncio.iscoroutine(res):
                    async def async_wrapper():
                        await_res = await res
                        return wrap_object(await_res)
                    return async_wrapper()
                return wrap_object(res)
            return wrapped_method
        return wrap_object(val)

    def __setattr__(self, name, value):
        translations = {
            'conteudo': 'content',
        }
        eng_name = translations.get(name, name)
        setattr(self._obj, eng_name, value)

def wrap_object(obj):
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool, dict, list, tuple, set)):
        return obj
    return DynamicProxy(obj)

class Robo(commands.Bot):
    def __init__(self, prefixo, *args, **kwargs):
        super().__init__(command_prefix=prefixo, *args, **kwargs)

    def comando(self, *args, **kwargs):
        if 'nome' in kwargs:
            kwargs['name'] = kwargs.pop('nome')
        if 'ajuda' in kwargs:
            kwargs['help'] = kwargs.pop('ajuda')
        
        def decorator(func):
            import functools
            @functools.wraps(func)
            async def wrapper(ctx, *args, **kwargs):
                wrapped_ctx = wrap_object(ctx)
                wrapped_args = [wrap_object(a) for a in args]
                wrapped_kwargs = {k: wrap_object(v) for k, v in kwargs.items()}
                return await func(wrapped_ctx, *wrapped_args, **wrapped_kwargs)
            return super(Robo, self).command(*args, **kwargs)(wrapper)
        return decorator

    def evento(self, *args, **kwargs):
        def decorator(func):
            import functools
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                wrapped_args = [wrap_object(a) for a in args]
                wrapped_kwargs = {k: wrap_object(v) for k, v in kwargs.items()}
                return await func(*wrapped_args, **wrapped_kwargs)
            event_mappings = {
                'ao_iniciar': 'on_ready',
                'ao_mensagem': 'on_message',
                'ao_entrar_membro': 'on_member_join',
            }
            mapped_name = event_mappings.get(func.__name__, func.__name__)
            wrapper.__name__ = mapped_name
            return super(Robo, self).event(*args, **kwargs)(wrapper)
        return decorator
`);

    // 3. User's Code
    zip.file("meu_bot.ptg", code);

    // 4. VS Code Extension & Auto Installer Setup
    zip.file("instalar.py", `import os
import sys
import json
import subprocess
import shutil

package_json = {
  "name": "portulong-vscode",
  "displayName": "Portulong support",
  "description": "Suporte de sintaxe e execução no terminal para a linguagem Portulong (.ptg)",
  "version": "1.0.0",
  "publisher": "silvio-blip",
  "icon": "portulong.png",
  "homepage": "${currentOrigin}/",
  "repository": {
    "type": "git",
    "url": "https://github.com/silvio-blip/portulong"
  },
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": [
    "Programming Languages"
  ],
  "activationEvents": [
    "onLanguage:portulong",
    "onCommand:portulong.executar"
  ],
  "main": "./src/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "portulong",
        "aliases": [
          "Portulong",
          "portulong"
        ],
        "extensions": [
          ".ptg"
        ],
        "configuration": "./language-configuration.json",
        "icon": {
          "light": "./portulong.png",
          "dark": "./portulong.png"
        }
      }
    ],
    "grammars": [
      {
        "language": "portulong",
        "scopeName": "source.portulong",
        "path": "./syntaxes/portulong.tmLanguage.json"
      }
    ],
    "commands": [
      {
        "command": "portulong.executar",
        "title": "Portulong: Executar Ficheiro",
        "icon": "\\$(play)"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "when": "editorLangId == portulong || resourceExtname == .ptg",
          "command": "portulong.executar",
          "group": "navigation"
        }
      ]
    },
    "keybindings": [
      {
        "command": "portulong.executar",
        "key": "ctrl+f5",
        "mac": "cmd+f5",
        "when": "editorTextFocus && editorLangId == portulong"
      }
    ]
  }
}

language_configuration = {
  "comments": {
    "lineComment": "#"
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  "autoClosingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\\"", "close": "\\"" },
    { "open": "'", "close": "'" }
  ],
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\\"", "\\""],
    ["'", "'"]
  ]
}

tmlanguage_json = {
  "\\$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "Portulong",
  "scopeName": "source.portulong",
  "patterns": [
    {
      "include": "#comments"
    },
    {
      "include": "#strings"
    },
    {
      "include": "#keywords"
    },
    {
      "include": "#constants"
    },
    {
      "include": "#builtin-functions"
    },
    {
      "include": "#discord"
    }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.line.number-sign.portulong",
          "match": "#.*$"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.double.portulong",
          "begin": "\\"",
          "end": "\\"",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": "\\\\\\\\."
            }
          ]
        },
        {
          "name": "string.quoted.single.portulong",
          "begin": "'",
          "end": "'",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": "\\\\\\\\."
            }
          ]
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.portulong",
          "match": "\\\\\\\\b(se|senao|senaose|para|enquanto|definir|funcao|classe|importar|de|como|retornar|tentar|exceto|finalmente|com|lambda|passar|parar|continuar|global|naolocal|levantar|produzir|assincrono|aguardar)\\\\\\\\b"
        },
        {
          "name": "keyword.operator.logical.portulong",
          "match": "\\\\\\\\b(e|ou|nao|em|eh|nao_eh)\\\\\\\\b"
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "name": "constant.language.portulong",
          "match": "\\\\\\\\b(verdadeiro|falso|nulo|Verdadeiro|Falso|Nulo)\\\\\\\\b"
        }
      ]
    },
    "builtin-functions": {
      "patterns": [
        {
          "name": "support.function.builtin.portulong",
          "match": "\\\\\\\\b(escrever|mostrar|ler|tamanho|inteiro|texto|real|decimal|boleano|lista|dicionario|conjunto|tupla|intervalo|abrir|tipo|somar|absoluto|maximo|minimo|arredondar|mapear|filtrar|ordenado|super|propriedade|zipar|enumerar|objeto|qualquer|todos|ajuda|identidade|reversivel|formatar|obter_atributo|definir_atributo|tem_atributo|excluir_atributo|representacao|proximo|iterador|eh_instancia|eh_subclasse)\\\\\\\\b"
        },
        {
          "name": "support.type.exception.portulong",
          "match": "\\\\\\\\b(Excessao|ErroDeValor|ErroDeTipo|ErroDeNome|ErroDeIndice|ErroDeChave|ErroDeImportacao|ErroDeAtributo|ErroDivisaoPorZero|FaltaDeMemoria|ParadaDeIteracao|ErroDoSistema|ArquivoNaoEncontrado|InterrupcaoPeloTeclado|ErroDeAsseveracao|ErroDeExecucao|ErroNaoImplementado)\\\\\\\\b"
        }
      ]
    },
    "discord": {
      "patterns": [
        {
          "name": "support.class.discord.portulong",
          "match": "\\\\\\\\b(Robo|discord|Intencoes|Membro|Canal|Servidor|Mensagem)\\\\\\\\b"
        },
        {
          "name": "support.function.discord.portulong",
          "match": "\\\\\\\\b(prefixo|evento|comando|nome|ajuda|enviar|responder|deletar|adicionar_reacao|remover_reacao|expulsar|banir|limpar|conteudo|autor|canal|servidor|mensagem|usuario|id)\\\\\\\\b"
        }
      ]
    }
  }
}

extension_js = """const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('portulong.executar', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('Nenhum ficheiro Portulong (.ptg) está aberto atualmente.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
            vscode.window.showErrorMessage('O ficheiro ativo não é um ficheiro Portulong (.ptg).');
            return;
        }

        document.save().then(() => {
            const filePath = document.fileName;
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong Executar');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong Executar');
            }
            terminal.show();
            terminal.sendText(\`portulong executar "\${filePath}"\`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
"""

def info(msg):
    print(f"\\\\033[1;34m[*] {msg}\\\\033[0m")

def success(msg):
    print(f"\\\\033[1;32m[+] {msg}\\\\033[0m")

def warn(msg):
    print(f"\\\\033[1;33m[!] {msg}\\\\033[0m")

def error(msg):
    print(f"\\\\033[1;31m[x] {msg}\\\\033[0m")

def main():
    print("="*60)
    print("   INSTALADOR AUTOMÁTICO DO PORTULONG E EXTENSÃO VS CODE")
    print("="*60)

    # 1. Instalar o Portulong e bibliotecas acessórias necessárias
    info("1/4. Instalando linguagem de programação Portulong e bibliotecas necessárias...")
    
    # Automatizar a instalação de todas as bibliotecas necessárias para rodar o Portulong e bots de Discord automaticamente
    info("Instalando/atualizando dependências essenciais (pip, discord.py, setuptools, portulong)...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], check=False)
        subprocess.run([sys.executable, "-m", "pip", "install", "discord.py", "setuptools"], check=False)
        success("Bibliotecas acessórias (discord.py, setuptools, pip) checadas e instaladas!")
    except Exception as e_deps:
        warn(f"Aviso ao verificar e preparar bibliotecas de suporte: {e_deps}")

    instalado_local = False
    
    # Se o script for corrido dentro do repositório onde existe o pyproject.toml
    if os.path.exists("pyproject.toml"):
        info("Encontrado 'pyproject.toml' localmente. Tentando instalar em modo editável/direto...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], check=True)
            success("Excelente! Portulong instalado em modo de desenvolvimento local com absoluto sucesso!")
            instalado_local = True
        except Exception as e_local:
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", "."], check=True)
                success("Excelente! Portulong instalado localmente com absoluto sucesso!")
                instalado_local = True
            except Exception as e_local_padrao:
                warn(f"Tentativa de instalação local falhou: {e_local_padrao}. Tentando via indexador remoto...")
                
    if not instalado_local:
        info("Instalando pacote 'portulong.ptg' oficial a partir do PyPI...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "portulong.ptg"], check=True)
            success("Portulong instalado com sucesso via pip!")
        except Exception as e:
            warn(f"Não foi possível instalar portulong.ptg automaticamente do PyPI: {e}")
            info("Certifique-se de rodar posteriormente no seu ambiente: pip install portulong.ptg")

    # 2. Criar a estrutura de ficheiros da Extensão VS Code
    ext_dir = "portulong-vscode"
    info(f"2/4. Criando diretórios da extensão VS Code em '{ext_dir}'...")
    
    os.makedirs(ext_dir, exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "syntaxes"), exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "src"), exist_ok=True)

    with open(os.path.join(ext_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "language-configuration.json"), "w", encoding="utf-8") as f:
        json.dump(language_configuration, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "syntaxes", "portulong.tmLanguage.json"), "w", encoding="utf-8") as f:
        json.dump(tmlanguage_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "src", "extension.js"), "w", encoding="utf-8") as f:
        f.write(extension_js)

    # Evitar duplicação de imagem em pastas principais e fora do projeto:
    # Baixa e configura diretamente no diretório do VS Code sem poluir a raiz
    ext_icon_path = os.path.join(ext_dir, "portulong.png")
    if not os.path.exists(ext_icon_path):
        if os.path.exists("portulong.png"):
            try:
                shutil.copy("portulong.png", ext_icon_path)
                info("Ícone 'portulong.png' copiado localmente para o diretório da extensão!")
            except Exception:
                pass
        else:
            info("Ícone 'portulong.png' não encontrado localmente. Procurando fontes alternativas...")
            urls = [
                "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/Wsii1RU.png&f=1",
                "${currentOrigin}/portulong.png",
                "https://portulong.vercel.app/portulong.png",
                "https://i.imgur.com/Wsii1RU.png"
            ]
            downloaded = False
            for url in urls:
                try:
                    info(f"Tentando baixar ícone de: {url}")
                    import urllib.request
                    req_obj = urllib.request.Request(
                        url, 
                        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                    )
                    with urllib.request.urlopen(req_obj, timeout=8) as response:
                        content_bytes = response.read()
                        if content_bytes.startswith(b'\\x89PNG\\r\\n\\x1a\\n') and len(content_bytes) > 50000:
                            with open(ext_icon_path, "wb") as f_img:
                                f_img.write(content_bytes)
                            success(f"Ícone 'portulong.png' transferido de {url} com sucesso!")
                            downloaded = True
                            break
                        else:
                            warn(f"Resposta de {url} não é um PNG válido (tipo incorreto).")
                except Exception as e_dl:
                    warn(f"Erro ao baixar de {url}: {e_dl}")
            
            if not downloaded:
                warn("Não foi possível transferir o ícone automaticamente. Você pode colocar manualmente um arquivo 'portulong.png' dentro de 'portulong-vscode/'.")

    # Limpeza de qualquer ícone duplicado no diretório atual (fora de qualquer pasta/raiz)
    # se o usuário tiver rodado o instalador que gerou o arquivo no diretório pai
    if os.path.exists("portulong.png"):
        try:
            os.remove("portulong.png")
            info("Removida cópia duplicada temporária do ícone na raiz para manter os seus diretórios limpos!")
        except Exception:
            pass

    success("Estrutura de ficheiros da extensão VS Code criada com perfeição!")

    # 3. Compilar a Extensão para .vsix utilizando npx de forma leve
    info("3/4. Compilando extensão para .vsix...")
    # Tenta verificar se o npx está disponível
    npx_path = shutil.which("npx")
    if npx_path:
        try:
            # Roda npx @vscode/vsce package no diretório da extensão
            info("Rodando vsce via npx temporário para gerar o instalador...")
            # Em sistemas Windows pode precisar do shell=True
            subprocess.run([npx_path, "-y", "@vscode/vsce", "package", "--allow-missing-repository"], cwd=ext_dir, check=True, shell=os.name == 'nt')
            success("Extensão compilada em ficheiro .vsix com sucesso!")
        except Exception as e:
            warn(f"Durante a compilação do vsce: {e}")
            warn("Se não tiver o Node.js/npm instalado, tudo bem! Os ficheiros foram todos criados.")
            warn(f"Dica: Acesse a pasta {ext_dir} e rode 'npx @vscode/vsce package' manualmente.")
    else:
        warn("npx ou Node.js não detetado no sistema.")
        warn("Os ficheiros da extensão foram gerados. Para compilar para VSIX, instale o Node.js e execute:")
        warn(f"  cd {ext_dir} && npx @vscode/vsce package")

    # 4. Tentar instalar diretamente no VS Code se o comando estiver disponível
    info("4/4. Tentando instalar a extensão diretamente no VS Code local...")
    code_path = shutil.which("code")
    if code_path:
        try:
            vsix_files = [f for f in os.listdir(ext_dir) if f.endswith(".vsix")]
            if vsix_files:
                vsix_filepath = os.path.join(ext_dir, vsix_files[0])
                info(f"Instalando {vsix_filepath} no VS Code...")
                subprocess.run([code_path, "--install-extension", vsix_filepath], check=True, shell=os.name == 'nt')
                success("Extensão Portulong instalada automaticamente no seu VS Code!")
                print("\\\\033[1;32mSeu VS Code agora está 100% equipado com suporte e o botão Play!\\\\033[0m")
            else:
                warn("Nenhum ficheiro .vsix encontrado para instalação automática.")
        except Exception as e:
            warn(f"Erro na instalação automática via 'code': {e}")
    else:
        info("Comando 'code' não configurado no terminal. Não se preocupe!")
        info(f"Você pode arrastar o ficheiro .vsix gerado na pasta {ext_dir} ou importar manualmente nas extensões do VS Code.")

    print("\\\\033[1;32m")
    print("="*60)
    print("   CONCLUÍDO COM SUCESSO! SEU AMBIENTE ESTÁ PRONTO.")
    print("="*60)
    print("\\\\033[0m")

if __name__ == '__main__':
    main()
`);

    // Add uninstaller script to the ZIP bundle
    zip.file("desinstalar.py", `import os
import sys
import subprocess
import shutil

def info(msg):
    print(f"[*] {msg}")

def success(msg):
    print(f"[+] {msg}")

def warn(msg):
    print(f"[!] {msg}")

def main():
    print("="*60)
    print("   DESINSTALADOR COMPLETO DO PORTULONG E DA EXTENSÃO VS CODE")
    print("="*60)

    # 1. Desinstalar pacotes do pip
    info("1/3. Desinstalando linguagens e bibliotecas Python instaladas...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "portulong.ptg"], check=False)
        success("Pacote 'portulong.ptg' desinstalado do pip com sucesso!")
    except Exception as e:
        warn(f"Erro ao desinstalar pelo pip: {e}")

    # 2. Desinstalar Extensão do VS Code
    info("2/3. Removendo a extensão diretamente do VS Code...")
    code_path = shutil.which("code")
    if code_path:
        try:
            subprocess.run([code_path, "--uninstall-extension", "silvio-blip.portulong-vscode"], check=True, shell=os.name == 'nt')
            success("Suporte à linguagem Portulong removido do VS Code com sucesso!")
        except Exception as e:
            warn(f"Erro ao pedir remoção automática da extensão ao comando 'code': {e}")
    else:
        info("Aviso: Comando 'code' não detetado no terminal. Se estiver na sua máquina local,")
        print("  abra as extensões no VS Code, procure por 'Portulong support' e clique em 'Desinstalar'.")

    # 3. Remover diretórios locais gerados pelo instalador
    info("3/3. Eliminando diretórios locais de compilação da extensão...")
    ext_dir = "portulong-vscode"
    if os.path.exists(ext_dir):
        try:
            shutil.rmtree(ext_dir)
            success(f"Diretório temporário '{ext_dir}' apagado com absoluto êxito!")
        except Exception as e:
            warn(f"Durante a eliminação da pasta '{ext_dir}': {e}")
            
    # Remove qualquer vsix gerado
    curr_files = os.listdir(".")
    for fn in curr_files:
        if fn.endswith(".vsix") and "portulong" in fn:
            try:
                os.remove(fn)
                success(f"Instalador empacotado '{fn}' destruído com sucesso!")
            except Exception:
                pass

    print()
    print("="*60)
    print("   DESINSTALADO COM SUCESSO! SEU AMBIENTE RETORNOU AO ORIGINAL")
    print("="*60)

if __name__ == "__main__":
    main()
`);

    // VS Code Extension directories structure inside Zip
    const extFolder = zip.folder("portulong-vscode")!;

    // Adiciona o logo da extensão se disponível
    if (logoBlob) {
      extFolder.file("portulong.png", logoBlob);
    }

    extFolder.file("package.json", JSON.stringify({
      name: "portulong-vscode",
      displayName: "Portulong support",
      description: "Suporte de sintaxe e execução no terminal para a linguagem Portulong (.ptg)",
      version: "1.0.0",
      publisher: "silvio-blip",
      icon: "portulong.png",
      homepage: currentOrigin + "/",
      repository: {
        type: "git",
        url: "https://github.com/silvio-blip/portulong"
      },
      engines: {
        vscode: "^1.74.0"
      },
      categories: ["Programming Languages"],
      activationEvents: [
        "onLanguage:portulong",
        "onCommand:portulong.executar"
      ],
      main: "./src/extension.js",
      contributes: {
        languages: [{
          id: "portulong",
          aliases: ["Portulong", "portulong"],
          extensions: [".ptg"],
          configuration: "./language-configuration.json",
          icon: {
            light: "./portulong.png",
            dark: "./portulong.png"
          }
        }],
        grammars: [{
          language: "portulong",
          scopeName: "source.portulong",
          path: "./syntaxes/portulong.tmLanguage.json"
        }],
        commands: [{
          command: "portulong.executar",
          title: "Portulong: Executar Ficheiro",
          icon: "$(play)"
        }],
        menus: {
          "editor/title": [{
            "when": "editorLangId == portulong || resourceExtname == .ptg",
            "command": "portulong.executar",
            "group": "navigation"
          }]
        },
        keybindings: [{
          command: "portulong.executar",
          key: "ctrl+f5",
          mac: "cmd+f5",
          when: "editorTextFocus && editorLangId == portulong"
        }]
      }
    }, null, 2));

    extFolder.file("language-configuration.json", JSON.stringify({
      comments: { lineComment: "#" },
      brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "\"", close: "\"" },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        ["{", "}"], ["[", "]"], ["(", ")"], ["\"", "\""], ["'", "'"]
      ]
    }, null, 2));

    const syntaxFolder = extFolder.folder("syntaxes")!;
    syntaxFolder.file("portulong.tmLanguage.json", JSON.stringify({
      $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
      name: "Portulong",
      scopeName: "source.portulong",
      patterns: [
        { include: "#comments" },
        { include: "#strings" },
        { include: "#keywords" },
        { include: "#constants" },
        { include: "#builtin-functions" },
        { include: "#discord" }
      ],
      repository: {
        comments: {
          patterns: [{
            name: "comment.line.number-sign.portulong",
            match: "#.*$"
          }]
        },
        strings: {
          patterns: [
            {
              name: "string.quoted.double.portulong",
              begin: "\"",
              end: "\"",
              patterns: [{
                name: "constant.character.escape.portulong",
                match: "\\\\."
              }]
            },
            {
              name: "string.quoted.single.portulong",
              begin: "'",
              end: "'",
              patterns: [{
                name: "constant.character.escape.portulong",
                match: "\\\\."
              }]
            }
          ]
        },
        keywords: {
          patterns: [
            {
              name: "keyword.control.portulong",
              match: "\\b(se|senao|senaose|para|enquanto|definir|funcao|classe|importar|de|como|retornar|tentar|exceto|finalmente|com|lambda|passar|parar|continuar|global|naolocal|levantar|produzir|assincrono|aguardar)\\b"
            },
            {
              name: "keyword.operator.logical.portulong",
              match: "\\b(e|ou|nao|em|eh|nao_eh)\\b"
            }
          ]
        },
        constants: {
          patterns: [{
            name: "constant.language.portulong",
            match: "\\b(verdadeiro|falso|nulo|Verdadeiro|Falso|Nulo)\\b"
          }]
        },
        "builtin-functions": {
          patterns: [
            {
              name: "support.function.builtin.portulong",
              match: "\\b(escrever|mostrar|ler|tamanho|inteiro|texto|real|decimal|boleano|lista|dicionario|conjunto|tupla|intervalo|abrir|tipo|somar|absoluto|maximo|minimo|arredondar|mapear|filtrar|ordenado|super|propriedade|zipar|enumerar|objeto|qualquer|todos|ajuda|identidade|reversivel|formatar|obter_atributo|definir_atributo|tem_atributo|excluir_atributo|representacao|proximo|iterador|eh_instancia|eh_subclasse)\\b"
            },
            {
              name: "support.type.exception.portulong",
              match: "\\b(Excessao|ErroDeValor|ErroDeTipo|ErroDeNome|ErroDeIndice|ErroDeChave|ErroDeImportacao|ErroDeAtributo|ErroDivisaoPorZero|FaltaDeMemoria|ParadaDeIteracao|ErroDoSistema|ArquivoNaoEncontrado|InterrupcaoPeloTeclado|ErroDeAsseveracao|ErroDeExecucao|ErroNaoImplementado)\\b"
            }
          ]
        },
        discord: {
          patterns: [
            {
              name: "support.class.discord.portulong",
              match: "\\b(Robo|discord|Intencoes|Membro|Canal|Servidor|Mensagem)\\b"
            },
            {
              name: "support.function.discord.portulong",
              match: "\\b(prefixo|evento|comando|nome|ajuda|enviar|responder|deletar|adicionar_reacao|remover_reacao|expulsar|banir|limpar|conteudo|autor|canal|servidor|mensagem|usuario|id)\\b"
            }
          ]
        }
      }
    }, null, 2));

    const srcFolder = extFolder.folder("src")!;
    srcFolder.file("extension.js", `const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('portulong.executar', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('Nenhum ficheiro Portulong (.ptg) está aberto atualmente.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
            vscode.window.showErrorMessage('O ficheiro ativo não é um ficheiro Portulong (.ptg).');
            return;
        }

        document.save().then(() => {
            const filePath = document.fileName;
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong Executar');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong Executar');
            }
            terminal.show();
            terminal.sendText(\`portulong executar "\${filePath}"\`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
`);

    // 5. Trigger download
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portulong_dist.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addTerminalLog("success", "Arquivo de distribuição 'portulong_dist.zip' compactado com sucesso! Baixando...");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 🚀 Brand Header Bar */}
      <header id="main-header" className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PortulongLogo size={48} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white font-mono">
                PORTU<span className="text-emerald-500 font-mono">LONG</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                v1.0.0
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-tight flex items-center gap-1.5 flex-wrap">
              Criador de Bots do Discord em Português • <a id="main-header-vercel-link" href={currentOrigin} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-mono font-medium">{currentHost}</a>
            </p>
          </div>
        </div>

        {/* 🧭 Tab Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
          <button
            id="tab-ide-btn"
            onClick={() => setActiveTab("ide")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all ${
              activeTab === "ide" 
                ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code size={14} />
            IDE & Simulador
          </button>
          
          <button
            id="tab-translator-btn"
            onClick={() => setActiveTab("translator")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all ${
              activeTab === "translator" 
                ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={14} />
            Tradutor Python
          </button>

          <button
            id="tab-docs-btn"
            onClick={() => setActiveTab("docs")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all ${
              activeTab === "docs" 
                ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen size={14} />
            Dicionário / Guia
          </button>

          <button
            id="tab-pypi-btn"
            onClick={() => setActiveTab("pypi")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-mono flex items-center gap-2 transition-all ${
              activeTab === "pypi" 
                ? "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu size={14} />
            Empacotar (PyPI)
          </button>
        </nav>
      </header>

      {/* 🔮 Workspace Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* 💡 Sub-guidance Info Panel */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/15 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 self-start">
              <Bot size={20} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Crie bots profissionais do Discord escrevendo código em português!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Utilize estruturas normais adaptadas do Python como <code className="text-emerald-400 bg-slate-800/60 px-1 py-0.5 rounded font-mono font-medium">se</code>, <code className="text-emerald-400 bg-slate-800/60 px-1 py-0.5 rounded font-mono font-medium">definir assincrono</code> e <code className="text-emerald-400 bg-slate-800/60 px-1 py-0.5 rounded font-mono font-medium">escrever()</code>.
              </p>
            </div>
          </div>
          <button 
            id="download-master-btn"
            onClick={handleDownloadDistribution}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black font-mono rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} />
            BAIXAR .ZIP DO COMPILADOR
          </button>
        </div>

        {/* 💻 TAB CONTENT: IDE & DISCORD CLIENT SIMULATOR */}
        {activeTab === "ide" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT AREA: Editor & Selector (Line count: 7 spans) */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-4">
              
              {/* Presets Toggle Header */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-slate-200">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Modelos Disponíveis</h3>
                  <p className="text-[11px] text-slate-500">Escolha um ponto de partida rápido em Portulong</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => selectPreset(tmpl.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activePreset === tmpl.id
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor Frame */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <PortulongLogo size={15} />
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        {TEMPLATES.find(t => t.id === activePreset)?.filename || "meu_bot.ptg"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id="reset-code-btn"
                      onClick={() => {
                        const original = TEMPLATES.find(t => t.id === activePreset);
                        if (original) setCode(original.code);
                      }}
                      title="Resetar arquivo ao padrão"
                      className="p-1 px-2.5 text-[11px] hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 border border-slate-800 rounded flex items-center gap-1 transition-all"
                    >
                      <RotateCcw size={11} />
                      Carregar Padrão
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div id="editor-wrapper" className="relative flex-1 flex bg-slate-900 font-mono text-sm leading-relaxed overflow-hidden">
                  {/* Fake Row line counters gutter */}
                  <div
                    ref={gutterRef}
                    className="bg-slate-950/60 p-4 text-right select-none text-slate-600 font-mono text-xs w-12 border-r border-slate-800/50 overflow-hidden flex flex-col py-4"
                    style={{ height: "100%", maxHeight: "500px" }}
                  >
                    <div className="flex flex-col gap-[3px]">
                      {Array.from({ length: Math.max(code.split("\n").length, 12) }).map((_, i) => (
                        <div key={i} className="font-mono h-5 flex items-center justify-end">{i + 1}</div>
                      ))}
                    </div>
                  </div>

                  {/* Real-time colorized interactive code canvas */}
                  <div className="flex-1 relative min-h-[380px] overflow-hidden">
                    {/* Rendered Colored Text (Underlay) */}
                    <pre
                      ref={preRef}
                      className="absolute inset-0 p-4 text-slate-300 font-mono text-xs leading-5 whitespace-pre pointer-events-none select-none overflow-auto border-0 m-0 bg-transparent scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                    >
                      {highlightPortulong(code)}
                    </pre>

                    {/* Actual Interactive Textarea (Overlay) */}
                    <textarea
                      id="code-editor-textarea"
                      value={code}
                      onChange={(e) => handleEditorChange(e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      onKeyUp={handleCursorCheck}
                      onSelect={handleCursorCheck}
                      onScroll={(e) => {
                        if (preRef.current) {
                          preRef.current.scrollTop = e.currentTarget.scrollTop;
                          preRef.current.scrollLeft = e.currentTarget.scrollLeft;
                        }
                        if (gutterRef.current) {
                          gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                        }
                      }}
                      className="absolute inset-0 bg-transparent p-4 text-transparent caret-white font-mono text-xs leading-5 focus:outline-none resize-none w-full h-full whitespace-pre overflow-auto font-medium border-0 m-0"
                      placeholder="Escreva seu código Portulong aqui..."
                      spellCheck="false"
                    />

                    {/* Floating Autocomplete Suggestions Panel */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute bottom-4 right-4 z-50 max-w-sm w-80 bg-slate-950/95 border border-emerald-500/30 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in divide-y divide-slate-800/60 flex flex-col font-mono text-[11px]">
                        {/* Header bar */}
                        <div className="bg-emerald-950/40 px-3 py-1.5 flex items-center justify-between text-[10px] text-emerald-400 font-bold tracking-wide uppercase border-b border-emerald-500/10">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Auto-completar Inteligente ({suggestions.length})
                          </span>
                          <span className="text-slate-500 lowercase font-medium text-[9px]">
                            [setas] navegar • [tab / enter] aplicar
                          </span>
                        </div>
                        {/* List items */}
                        <div className="max-h-48 overflow-y-auto scrollbar-thin">
                          {suggestions.map((item, index) => (
                            <button
                              key={item.key}
                              onClick={() => applySnippet(item)}
                              onMouseMove={() => setSelectedIndex(index)}
                              className={`w-full text-left p-2.5 transition-all flex flex-col gap-0.5 focus:outline-none ${
                                index === selectedIndex
                                  ? "bg-emerald-500/10 text-slate-100 border-l-2 border-emerald-400 pl-2 text-gold-300"
                                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className={index === selectedIndex ? "text-emerald-300" : "text-sky-300"}>
                                  {item.displayName}
                                </span>
                                <span className="bg-slate-900 border border-slate-800 text-slate-500 text-[9px] px-1 rounded font-normal uppercase">
                                  {item.key}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400/80 leading-normal font-sans">
                                {item.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Portulong - Baseado em Python</span>
                  <span>Linhas: {code.split("\n").length}</span>
                </div>
              </div>

              {/* Real-time Side-by-side python equivalent component */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-inner">
                <div className="bg-slate-950/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
                    <Terminal size={12} className="text-amber-500" />
                    Código Python Traduzido (.py equivalente)
                  </div>
                  <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded font-mono text-slate-400">
                    Transpilador Ativo
                  </span>
                </div>
                <div className="p-4 bg-slate-950/80 max-h-[160px] overflow-y-auto">
                  <pre className="text-slate-200 font-mono text-[11px] leading-5 whitespace-pre scrollbar-thin">
                    {highlightPython(pythonEquivalent || "# Codifique acima para começar a compilação...")}
                  </pre>
                </div>
              </div>

              {/* Explanation Assistant Tab Panel inside IDE */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-emerald-400" />
                  <h4 className="text-xs font-black font-mono tracking-wider text-slate-200 uppercase">
                    Assistente Tutor Portulong (IA)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Dúvidas sobre como esse código funciona? Clique em analisar ou faça perguntas diretamente ao compilador inteligente!
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ex: Como eu recebo a mensagem do usuário?"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
                  />
                  <button
                    id="explain-code-btn"
                    onClick={explainCode}
                    disabled={isAiAnswering}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 font-semibold rounded-lg font-mono text-xs transition-all flex items-center gap-1 border border-slate-700"
                  >
                    {isAiAnswering ? "Pensando..." : "Perguntar"}
                  </button>
                </div>

                {isAiAnswering && (
                  <div className="p-3 bg-slate-950 rounded-lg animate-pulse border border-slate-800 text-xs text-slate-400 font-mono">
                    Conectando ao modelo gemini-3.5-flash para ler os tokens do Portulong...
                  </div>
                )}

                {aiAnswer && !isAiAnswering && (
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg text-xs leading-5 max-h-[220px] overflow-y-auto">
                    <p className="font-bold text-emerald-400 mb-2 font-mono">💡 Resposta do Tutor:</p>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed font-sans">{aiAnswer}</p>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT AREA: Discord client & Console (Line count: 5 spans) */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
              
              {/* Discord App Simulator */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {/* Simulated Discord client Header */}
                <div className="bg-slate-950 p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-100 leading-tight">Simulador Discord</span>
                      <span className="text-[10px] text-slate-500 font-mono leading-none">Ambiente de Testes Virtual</span>
                    </div>
                  </div>
                  
                  {/* simulated server name indicator */}
                  <span className="text-[10px] bg-slate-800/80 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300 font-semibold tracking-wide">
                    Servidor: Portulong Devs
                  </span>
                </div>

                {/* Sub discord client sidebar + channel layout */}
                <div className="flex min-h-[350px] max-h-[420px] bg-slate-900">
                  
                  {/* Channels selection bar (discord style) */}
                  <div className="w-[120px] bg-slate-950/70 py-3 border-r border-slate-800/40 flex flex-col gap-1 select-none">
                    <span className="px-3 text-[9px] uppercase tracking-wider font-bold text-slate-500">
                      Canais
                    </span>
                    <button 
                      onClick={() => setSimulatedChannel("geral")}
                      className={`px-3 py-1 text-left text-[11px] font-semibold flex items-center gap-1 ${
                        simulatedChannel === "geral" ? "text-indigo-400 bg-slate-800/40 font-bold" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      # geral
                    </button>
                    <button 
                      onClick={() => setSimulatedChannel("comandos")}
                      className={`px-3 py-1 text-left text-[11px] font-semibold flex items-center gap-1 ${
                        simulatedChannel === "comandos" ? "text-indigo-400 bg-slate-800/40 font-bold" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      # comandos-bot
                    </button>
                    <button 
                      onClick={() => setSimulatedChannel("logs")}
                      className={`px-3 py-1 text-left text-[11px] font-semibold flex items-center gap-1 ${
                        simulatedChannel === "logs" ? "text-indigo-400 bg-slate-800/40 font-bold" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      # logs-do-sistema
                    </button>
                  </div>

                  {/* Messages workspace log area */}
                  <div className="flex-1 flex flex-col bg-[#313338] h-[340px] max-h-[400px]">
                    
                    {/* Chat Area output log */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                      {discordMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2.5 text-xs items-start animate-fade-in group">
                          {/* Avatar icon */}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${msg.avatarColor} text-white font-black flex items-center justify-center flex-shrink-0 relative`}>
                            {msg.sender[0].toUpperCase()}
                            {msg.isBot && (
                              <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-[8px] font-bold px-0.5 rounded text-white border border-[#313338] leading-none py-0.5 font-mono capitalize shadow">
                                BOT
                              </span>
                            )}
                          </div>
                          
                          {/* Username text wrap */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-semibold ${msg.isBot ? "text-emerald-300" : "text-white"}`}>
                                {msg.sender}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{msg.timestamp}</span>
                            </div>
                            <p className="text-[#dbdee1] mt-1 break-all select-text font-sans font-medium whitespace-pre-wrap">
                              {msg.content}
                            </p>

                            {/* Embed Render mock if any */}
                            {msg.embed && (
                              <div className="mt-2 pl-3 py-2 border-l-4 bg-[#1e1f22] rounded rounded-l-none" style={{ borderColor: msg.embed.color || "#10B981" }}>
                                {msg.embed.title && (
                                  <h4 className="font-bold text-white text-xs mb-1 font-sans">{msg.embed.title}</h4>
                                )}
                                {msg.embed.description && (
                                  <p className="text-slate-300 text-[11px] whitespace-pre-line font-medium font-sans leading-relaxed">{msg.embed.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isSimulatingResponse && (
                        <div className="flex gap-2.5 text-xs items-center animate-pulse text-indigo-300 font-mono">
                          <Plus size={14} className="animate-spin text-indigo-400" />
                          Processando resposta com compilador virtual do Portulong...
                        </div>
                      )}
                      
                      <div ref={discordEndRef} />
                    </div>

                    {/* Chat simulator manual input */}
                    <div className="p-3 bg-[#2b2d31] border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") simulateBotResponse();
                        }}
                        placeholder={`Mande mensagens em #${simulatedChannel} (Ex: !ping)`}
                        className="flex-1 bg-[#383a40] text-slate-100 rounded px-3 py-2 text-xs focus:outline-none"
                      />
                      <button
                        id="send-simulated-msg-btn"
                        onClick={simulateBotResponse}
                        className="px-3 bg-indigo-500 hover:bg-slate-700 text-white rounded transition-colors group flex items-center justify-center p-2 border border-slate-700"
                        title="Enviar para simular"
                      >
                        <Send size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Bot active execution terminal console */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold font-mono text-slate-400">
                    <Terminal size={12} className="text-emerald-500" />
                    Console do Compilador (Logs de Execução)
                  </div>
                  <button
                    id="clear-logs-btn"
                    onClick={() => {
                      setSimulatorLogs([
                        { id: "1", type: "info", time: "21:20:00", message: "Console de logs limpo pelo desenvolvedor." }
                      ]);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                
                {/* Console list output */}
                <div className="p-4 bg-slate-950 font-mono text-xs max-h-[180px] overflow-y-auto flex flex-col gap-2 min-h-[120px]">
                  {simulatorLogs.map((log) => (
                    <div key={log.id} className="text-slate-300 font-mono gap-1">
                      <span className="text-slate-600 mr-2 font-mono">[{log.time}]</span>
                      <span className={`font-mono ${
                        log.type === "success" 
                          ? "text-emerald-400" 
                          : log.type === "warning" 
                            ? "text-yellow-400" 
                            : log.type === "error" 
                              ? "text-red-400 font-bold" 
                              : "text-slate-400"
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* Chat Support Frame */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-black font-mono tracking-wider uppercase text-slate-200">
                    Bate-papo de Suporte Portulong
                  </h3>
                </div>
                <div className="bg-slate-950/80 rounded-lg p-3 overflow-y-auto max-h-[200px] mb-3 flex flex-col gap-2 min-h-[140px]">
                  {chatHistory.length === 0 ? (
                    <p className="text-[11px] text-slate-500 font-serif leading-relaxed italic text-center py-4">
                      Ex: Pergunte "Como eu faço um comando de banir?" ou "O que significa 'se membro.servidor'?" para tirar suas dúvidas de iniciante!
                    </p>
                  ) : (
                    chatHistory.map((m) => (
                      <div key={m.id} className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                        m.sender === "user" 
                          ? "bg-indigo-950/40 border border-indigo-800/15 text-indigo-200 self-end" 
                          : "bg-slate-900 text-slate-200 self-start border border-slate-800"
                      }`}>
                        <div className="text-[10px] opacity-60 font-mono mb-1 capitalize">
                          {m.sender === "user" ? "Eu" : "Mestre Portulong (IA)"}
                        </div>
                        <p className="whitespace-pre-line font-sans font-medium">{m.content}</p>
                      </div>
                    ))
                  )}
                  {isChatSending && (
                    <div className="p-2.5 bg-slate-900 rounded-lg text-xs text-slate-400 animate-pulse font-mono self-start border border-slate-800">
                      Mestre Portulong está digitando...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChatMessage();
                    }}
                    placeholder="Tire dúvidas sobre portulong..."
                    className="flex-1 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <button
                    id="chat-send-btn"
                    onClick={sendChatMessage}
                    disabled={isChatSending}
                    className="px-3 bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold rounded-lg border border-slate-700 transform duration-150 active:scale-95 text-xs"
                  >
                    Enviar
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 💻 TAB CONTENT: PYTHON TRANSLATOR */}
        {activeTab === "translator" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                Conversor de Inglês (Python) para Português (Portulong)
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tem algum comando ou bot já pronto em Python que você achou na internet? Cole o código original do Discord.py aqui embaixo e clique em traduzir. Nossa inteligência artificial e nosso transpiler farão a tradução 100% precisa das palavras-chave para Portulong!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Python Left Entry Column */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Code size={13} />
                  Código em Python de Entrada (.py inglês)
                </label>
                <div className="relative flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-xl min-h-[340px] overflow-hidden">
                  {/* Underlay Colorized Display */}
                  <pre
                    className="absolute inset-0 p-4 text-slate-350 font-mono text-xs leading-5 whitespace-pre pointer-events-none select-none overflow-hidden border-0 m-0 bg-transparent scrollbar-none"
                  >
                    {highlightPython(inputPython || "# Cole seu código Python aqui...")}
                  </pre>
                  {/* Overlay Interactive Textarea */}
                  <textarea
                    value={inputPython}
                    onChange={(e) => setInputPython(e.target.value)}
                    onScroll={(e) => {
                      const pre = e.currentTarget.previousSibling as HTMLPreElement;
                      if (pre) {
                        pre.scrollTop = e.currentTarget.scrollTop;
                        pre.scrollLeft = e.currentTarget.scrollLeft;
                      }
                    }}
                    className="absolute inset-0 bg-transparent p-4 text-transparent caret-white font-mono text-xs leading-5 focus:outline-none resize-none w-full h-full whitespace-pre overflow-auto font-medium border-0 m-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                    placeholder="Cole seu código Python de entrada aqui..."
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* Portulong Right Target Column */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-400" />
                  Código Processado em Portulong (.ptg português)
                </label>
                <div className="relative flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-xl min-h-[340px] overflow-hidden">
                  <pre className="flex-1 p-4 font-mono text-xs leading-5 whitespace-pre overflow-auto select-text text-slate-300 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pb-16">
                    {highlightPortulong(translatedPortulong || "# Clique em Traduzir para processar as palavras-chave...")}
                  </pre>
                  {translatedPortulong && (
                    <button
                      id="copy-translated-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(translatedPortulong);
                        alert("Código Portulong copiado!");
                      }}
                      className="absolute bottom-4 right-4 p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Copy size={13} />
                      Copiar Código
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center border-t border-slate-800 pt-6">
              <button
                id="translate-python-now-btn"
                onClick={translatePythonToPortulong}
                disabled={isTranslating}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-sm font-black font-mono tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-95 shadow-lg"
              >
                {isTranslating ? (
                  <>
                    <Plus size={16} className="animate-spin text-slate-950" />
                    Traduzindo com Inteligência Artificial...
                  </>
                ) : (
                  <>
                    Traduzir Agora para Portulong
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 💻 TAB CONTENT: REFERENCE DICTIONARY */}
        {activeTab === "docs" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-400" />
                  Dicionário Oficial & Guia de Sintaxe
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Encontre a tradução exata de loops, palavras-chave e métodos específicos do Discord.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2 select-none">
                <button
                  onClick={() => setCategoryFilter("tudo")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === "tudo" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Tudo
                </button>
                <button
                  onClick={() => setCategoryFilter("palavra-chave")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === "palavra-chave" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Palavras-Chave
                </button>
                <button
                  onClick={() => setCategoryFilter("embutido")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === "embutido" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Funções Embutidas
                </button>
                <button
                  onClick={() => setCategoryFilter("discord")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryFilter === "discord" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Discord
                </button>
              </div>
            </div>

            {/* Live dictionary lookup input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Busque por termos (Ex: se, senao, @robo.comando, escrever)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-emerald-500 text-slate-200 shadow-inner"
              />
            </div>

            {/* Bento Grid layout of dictionary keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DICTIONARY.filter(item => {
                const query = searchQuery.toLowerCase();
                const matchesSearch = item.portulong.toLowerCase().includes(query) || item.python.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
                const matchesCategory = categoryFilter === "tudo" || item.category === categoryFilter;
                return matchesSearch && matchesCategory;
              }).map((item) => (
                <div key={item.portulong} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between group transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                        item.category === "palavra-chave" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : item.category === "embutido" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}>
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleCopy(item.portulong)}
                        className="text-slate-600 hover:text-emerald-400 transition-colors p-1"
                        title="Copiar termo"
                      >
                        {copiedKeyword === item.portulong ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-sm font-bold font-mono text-emerald-400">{item.portulong}</h3>
                      <span className="text-slate-600 text-xs font-mono">→</span>
                      <span className="text-slate-500 text-xs font-mono select-all font-semibold italic">{item.python}</span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1 font-medium">{item.description}</p>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider block mb-1">Exemplo de Sintaxe:</span>
                    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 leading-snug whitespace-pre overflow-x-auto">
                      {item.example}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💻 TAB CONTENT: PIP / PYPI PUBLISHING PACKAGE EXPORT */}
        {activeTab === "pypi" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-8">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                Empacotador Oficial para PyPI (pip install portulong.ptg)
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Você quer que qualquer pessoa no mundo hospede e use sua nova linguagem de programação em português no terminal rodando <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">pip install portulong.ptg</code>? Nós criamos toda a estrutura necessária para você subir isso com facilidade para o PyPI!
              </p>
            </div>

            {/* 🛸 NOVO: INSTALAÇÃO AUTOMÁTICA EM 1 CLIQUE */}
            <div className="p-5 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/20 to-slate-950/40 shadow-inner flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-emerald-500/20 text-emerald-400 uppercase border border-emerald-500/30">
                  RECOMENDADO
                </span>
                <h3 className="text-sm font-black font-mono tracking-tight text-white flex items-center gap-2 mt-1.5">
                  ⚡ Auto-Instalador Inteligente de 1 Comando
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  Quer configurar a linguagem <code className="text-emerald-400 bg-slate-950 px-1 py-0.2 rounded font-mono">portulong.ptg</code> instalada do PyPI e ao mesmo tempo habilitar a <strong>Extensão Oficial do VS Code</strong> (com Destaque de Cores e o botão <strong>Play/Run</strong>) no seu terminal e editor de forma instantânea?
                </p>
                <div className="flex flex-wrap items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">Para Instalar:</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 font-mono text-xs text-emerald-400 shadow-inner select-all">
                      <span>python instalar.py</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">Para Desinstalar:</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 font-mono text-xs text-rose-400 shadow-inner select-all">
                      <span>python desinstalar.py</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <a
                  href="/api/instalar"
                  download="instalar.py"
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black font-mono tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  BAIXAR INSTALADOR
                </a>
                <a
                  href="/api/desinstalar"
                  download="desinstalar.py"
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-rose-400 hover:text-rose-300 font-bold font-mono tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={14} className="text-rose-500" />
                  DESINSTALADOR
                </a>
                <button
                  onClick={() => setActiveTab("docs")}
                  className="px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-bold font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen size={14} className="text-slate-500" />
                  DICIONÁRIO
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Directory Visualization Panel */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-850 rounded-xl p-5 shadow-inner">
                <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Terminal size={14} className="text-amber-500" />
                  Árvore de Arquivos do Pacote PIP
                </h3>

                <div className="font-mono text-xs text-slate-400 flex flex-col gap-2 font-medium">
                  <div className="flex items-center gap-2">📦 portulong_dist/</div>
                  <div className="flex items-center gap-2 pl-4 text-emerald-400">📄 setup.py <span className="text-slate-600 text-[10px] font-mono font-normal ml-1"># Instalador PyPI / Dependências</span></div>
                  <div className="flex items-center gap-2 pl-4 text-emerald-400">📄 pyproject.toml <span className="text-slate-600 text-[10px] font-mono font-normal ml-1"># Configuração das ferramentas</span></div>
                  <div className="flex items-center gap-2 pl-4 text-emerald-400">📄 README.md <span className="text-slate-600 text-[10px] font-mono font-normal ml-1"># Documentação em português</span></div>
                  <div className="flex items-center gap-2 pl-4">📂 portulong/</div>
                  <div className="flex items-center gap-2 pl-8 text-amber-300">📄 __init__.py <span className="text-slate-600 text-[10px] font-mono ml-1 font-normal"># Inicialização do módulo</span></div>
                  <div className="flex items-center gap-2 pl-8 text-amber-300">📄 transpiler.py <span className="text-slate-600 text-[10px] font-mono ml-1 font-normal"># Core de tradução Python</span></div>
                  <div className="flex items-center gap-2 pl-8 text-amber-300">📄 cli.py <span className="text-slate-600 text-[10px] font-mono ml-1 font-normal"># Executor terminal (portulong script.ptg)</span></div>
                  <div className="flex items-center gap-2 pl-8 text-amber-300">📄 discord_pt.py <span className="text-slate-600 text-[10px] font-mono ml-1 font-normal"># Wrapper Discord.py em PT</span></div>
                  <div className="flex items-center gap-2 pl-4 text-emerald-400">
                    <PortulongLogo size={14} />
                    <span>meu_bot.ptg</span>
                    <span className="text-slate-600 text-[10px] font-mono ml-1 font-normal"># Seu código ativo no editor</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-850 pt-5 flex flex-col gap-3">
                  <button
                    id="export-zip-dist-btn"
                    onClick={handleDownloadDistribution}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black font-mono tracking-wide rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download size={14} />
                    BAIXAR PACOTE DE DISTRIBUIÇÃO (.ZIP)
                  </button>
                  <p className="text-[10px] text-slate-500 leading-normal text-center max-w-[280px] mx-auto">
                    Compactamos todos os arquivos acima estruturados contendo o seu código do robô.
                  </p>
                </div>
              </div>

              {/* Step by step installation guide */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                    <Shield size={16} className="text-emerald-400" />
                    Como publicar e instalar sua linguagem?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Siga o passo a passo simplificado para registrar a Portulong na comunidade brasileira.
                  </p>
                </div>

                {/* Steps Accordion */}
                <div className="flex flex-col gap-4">
                  
                  {/* Passo 0: Trusted Publisher */}
                  <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 shadow-md bg-gradient-to-r from-emerald-950/10 to-transparent">
                    <h4 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest gap-2 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">0</span>
                      Configurar Trusted Publisher (Como no seu Print 📸)
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed font-semibold">
                      Na página do PyPI que você está visualizando no seu print, preencha os campos exatamente desta forma:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-slate-900/60 p-3.5 border border-slate-800 rounded-lg text-xs leading-normal font-mono text-slate-400">
                      <div>
                        <span className="text-emerald-400 font-bold block mb-1">🔹 PyPI Project Name:</span>
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">portulong</code>
                        <span className="text-[10px] text-slate-500 block mt-1">(Nome do pacote no PyPI. Se já estiver em uso, utilize um sufixo como portulong-bot)</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block mb-1">🔹 Owner (Dono):</span>
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">SeuUsuarioDoGitHub</code>
                        <span className="text-[10px] text-slate-500 block mt-1">(Seu apelido do GitHub que é dono do código do repositório)</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-emerald-400 font-bold block mb-1">🔹 Repository name:</span>
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">portulong</code>
                        <span className="text-[10px] text-slate-500 block mt-1">(O nome exato do seu repositório no seu GitHub)</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-emerald-400 font-bold block mb-1">🔹 Workflow name:</span>
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">publish.yml</code>
                        <span className="text-[10px] text-slate-500 block mt-1">(O arquivo de ações automático que criamos na pasta .github/workflows/)</span>
                      </div>
                      <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-bold block mb-1">🔹 Environment name (Opcional):</span>
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">pypi</code>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                      Clique no botão azul <strong className="text-emerald-400 font-mono">"Add"</strong> para salvar. Isso dará autorização para o Github Actions que configuramos no arquivo <code className="text-slate-300 bg-slate-900 px-1">.github/workflows/publish.yml</code> enviar atualizações automaticamente toda vez que você criar uma Tag de Versão ou Release no GitHub!
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                    <h4 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest gap-2 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">1</span>
                      Extrair e Configurar sua conta no PyPI
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Crie uma conta gratuita em <a href="https://pypi.org" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium">pypi.org</a> e gere uma chave de Token API em suas configurações de conta. Extraia os arquivos do ZIP que você baixou na sua máquina de desenvolvimento.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                    <h4 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest gap-2 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">2</span>
                      Compilar o módulo Python
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      No terminal do seu computador, navegue para a pasta extraída contendo o <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">setup.py</code> e use o built-in do python para compilar os arquivos de empacotamento:
                    </p>
                    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-amber-300 mt-2.5 overflow-x-auto">
                      pip install build wheel<br />
                      python -m build
                    </pre>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                    <h4 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest gap-2 flex items-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">3</span>
                      Fazer o Upload com o Twine
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Para subir sua linguagem para o banco mundial de pacotes públicos do PIP, use o assistente Twine:
                    </p>
                    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-amber-300 mt-2.5 overflow-x-auto">
                      pip install twine<br />
                      twine upload dist/*
                    </pre>
                    <p className="text-[10px] text-slate-500 mt-2">
                      * O terminal solicitará seu nome de usuário (insira <code className="text-indigo-400 font-mono">__token__</code>) e a chave API criada no passo 1.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* 📝 Tiny branding footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-slate-500 text-xs font-mono font-medium text-center tracking-tight mt-12">
        Portulong Studio © 2026. Criado sob medida em colaboração com Silvio. Desenvolvido para transformar o aprendizado de robôs do Discord em algo 100% nativo.
      </footer>
    </div>
  );
}

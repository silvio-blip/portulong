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
  Send,
  Hash,
  Mic,
  Headphones,
  Settings,
  Bell,
  Pin,
  Users,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Laptop,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import JSZip from "jszip";

import PortulongLogo from "./components/PortulongLogo";
import { transpilePortulong, translatePythonToPortulong as localTranslatePythonToPortulong } from "./utils/transpiler";
import { CodeTemplate, DiscordMessage, TerminalLog, DictionaryItem, ChatMessage } from "./types";

// Key translations dictionary for visual reference guide and search
const DICTIONARY: DictionaryItem[] = [
  // PALAVRAS-CHAVE DO FLUXO E ESTRUTURA
  { portulong: "se", python: "if", category: "palavra-chave", description: "Inicia um bloco de condição de fluxo.", example: "se condicao:\n    escrever('Verdadeiro')" },
  { portulong: "senao", python: "else", category: "palavra-chave", description: "Executa caso nenhuma condição anterior seja atendida.", example: "se condicao:\n    escrever('Certo')\nsenao:\n    escrever('Errado')" },
  { portulong: "senaose", python: "elif", category: "palavra-chave", description: "Condicional intermediária de fluxo.", example: "se x == 1:\n    escrever('Um')\nsenaose x == 2:\n    escrever('Dois')" },
  { portulong: "para", python: "for", category: "palavra-chave", description: "Loop de repetição controlado sobre um iterável.", example: "para i em intervalo(5):\n    escrever(i)" },
  { portulong: "enquanto", python: "while", category: "palavra-chave", description: "Loop de repetição enquanto a condição for verdadeira.", example: "enquanto repetindo:\n    escrever('Ativo')" },
  { portulong: "definir", python: "def", category: "palavra-chave", description: "Define uma nova função ou assinatura de método.", example: "definir somar(a, b):\n    retornar a + b" },
  { portulong: "funcao", python: "def", category: "palavra-chave", description: "Sinônimo de definir; declara uma nova função.", example: "funcao calcular_dobro(x):\n    retornar x * 2" },
  { portulong: "classe", python: "class", category: "palavra-chave", description: "Cria um modelo de objeto (classe).", example: "classe Jogador:\n    definir __init__(self):\n        self.pontos = 0" },
  { portulong: "importar", python: "import", category: "palavra-chave", description: "Importa módulos externos para o contexto.", example: "importar portulong.discord_pt como discord" },
  { portulong: "de", python: "from", category: "palavra-chave", description: "Parte estrutural para importar partes de um módulo.", example: "de discord.ext importar commands" },
  { portulong: "como", python: "as", category: "palavra-chave", description: "Define um alias/apelido para a biblioteca importada.", example: "importar portulong.discord_pt como discord" },
  { portulong: "retornar", python: "return", category: "palavra-chave", description: "Retorna um valor para quem chamou o método.", example: "definir dobro(n):\n    retornar n * 2" },
  { portulong: "tentar", python: "try", category: "palavra-chave", description: "Tenta rodar um bloco seguro tratando eventuais erros.", example: "tentar:\n    escrever(1 / 0)\nexceto ErroDivisaoPorZero:\n    escrever('Erro de divisão')" },
  { portulong: "exceto", python: "except", category: "palavra-chave", description: "Captura erros ocorridos dentro do bloco de tentativa (try/except).", example: "tentar:\n    fazer()\nexceto Excessao como e:\n    escrever(f'Deu erro: {e}')" },
  { portulong: "finalmente", python: "finally", category: "palavra-chave", description: "Bloco executado obrigatoriamente após tentar/exceto.", example: "tentar:\n    abrir_conexao()\nfinalmente:\n    fechar_conexao()" },
  { portulong: "com", python: "with", category: "palavra-chave", description: "Simplifica o tratamento de recursos (gerenciador de contexto).", example: "com abrir('arquivo.txt') como f:\n    conteudo = f.ler()" },
  { portulong: "lambda", python: "lambda", category: "palavra-chave", description: "Declara uma função anônima inline.", example: "dobro = lambda x: x * 2" },
  { portulong: "passar", python: "pass", category: "palavra-chave", description: "Instrução nula usada como preenchedor de bloco vazio.", example: "se condicao:\n    passar" },
  { portulong: "parar", python: "break", category: "palavra-chave", description: "Interrompe e sai imediatamente do loop atual.", example: "enquanto Verdadeiro:\n    se pronto:\n        parar" },
  { portulong: "continuar", python: "continue", category: "palavra-chave", description: "Pula para a próxima iteração do loop atual.", example: "para i em intervalo(5):\n    se i == 2:\n        continuar\n    escrever(i)" },
  { portulong: "Verdadeiro", python: "True", category: "palavra-chave", description: "Valor lógico afirmativo (boolean).", example: "ativo = Verdadeiro" },
  { portulong: "Falso", python: "False", category: "palavra-chave", description: "Valor lógico negativo (boolean).", example: "bloqueado = Falso" },
  { portulong: "Nulo", python: "None", category: "palavra-chave", description: "Representa a ausência de valor.", example: "valor = Nulo" },
  { portulong: "e", python: "and", category: "palavra-chave", description: "Operador lógico de conjunção (E). Ambos os termos devem ser verdadeiros.", example: "se ativo e nao bloqueado:\n    escrever('Permitido')" },
  { portulong: "ou", python: "or", category: "palavra-chave", description: "Operador lógico de disjunção (OU). Pelo menos um termo deve ser verdadeiro.", example: "se admin ou moderador:\n    escrever('Acesso concedido')" },
  { portulong: "nao", python: "not", category: "palavra-chave", description: "Operador lógico de negação (NÃO).", example: "se nao carregado:\n    escrever('Aguarde...')" },
  { portulong: "em", python: "in", category: "palavra-chave", description: "Verifica se um item existe dentro de uma coleção.", example: "se 'oi' em mensagem.conteudo:\n    escrever('Cumprimento detectado')" },
  { portulong: "eh", python: "is", category: "palavra-chave", description: "Compara a identidade de dois objetos (se são o mesmo objeto).", example: "se valor eh Nulo:\n    escrever('Sem valor')" },
  { portulong: "nao_eh", python: "is not", category: "palavra-chave", description: "Verifica se dois objetos possuem identidades diferentes.", example: "se conexao nao_eh Nulo:\n    escrever('Online')" },
  { portulong: "asseverar", python: "assert", category: "palavra-chave", description: "Afirma que algo é Verdadeiro; dispara exceção se for Falso.", example: "asseverar idade >= 18, 'Menor de idade'" },
  { portulong: "global", python: "global", category: "palavra-chave", description: "Declara que uma variável dentro da função pertence ao escopo global.", example: "global total_mensagens\ntotal_mensagens += 1" },
  { portulong: "naolocal", python: "nonlocal", category: "palavra-chave", description: "Declara que a variável pertence ao escopo externo de função aninhada.", example: "naolocal contador\ncontador += 1" },
  { portulong: "levantar", python: "raise", category: "palavra-chave", description: "Lança/dispara ativamente um erro ou exceção.", example: "levantar ErroDeValor('Número fora do intervalo')" },
  { portulong: "produzir", python: "yield", category: "palavra-chave", description: "Retorna um gerador em suspensão temporária.", example: "definir gerar_numeros():\n    produzir 1" },
  { portulong: "assincrono", python: "async", category: "palavra-chave", description: "Define que a função roda de forma assíncrona (concorrente).", example: "definir assincrono ao_iniciar():\n    escrever('Robô Online')" },
  { portulong: "aguardar", python: "await", category: "palavra-chave", description: "Aguarda a resolução de uma corrotina assíncrona.", example: "aguardar canal.enviar('Olá')" },

  // FUNÇÕES EMBUTIDAS (BUILT-INS)
  { portulong: "escrever", python: "print", category: "embutido", description: "Escreve informações de saída no console do terminal.", example: "escrever('LOG DE EXECUÇÃO')" },
  { portulong: "mostrar", python: "print", category: "embutido", description: "Sinônimo de escrever; imprime dados na tela.", example: "mostrar(f'O autor é {autor}')" },
  { portulong: "ler", python: "input", category: "embutido", description: "Recebe uma entrada de texto digitada pelo terminal.", example: "nome = ler('Nome: ')" },
  { portulong: "tamanho", python: "len", category: "embutido", description: "Retorna a contagem de elementos de listas ou caracteres.", example: "tamanho('Português')" },
  { portulong: "inteiro", python: "int", category: "embutido", description: "Converte um valor decimal ou textual para número inteiro.", example: "idade = inteiro('18')" },
  { portulong: "texto", python: "str", category: "embutido", description: "Converte qualquer valor para texto (string).", example: "txt = texto(2026)" },
  { portulong: "real", python: "float", category: "embutido", description: "Converte valores para número decimal/ponto flutuante.", example: "peso = real('72.5')" },
  { portulong: "decimal", python: "float", category: "embutido", description: "Sinônimo de real; converte valores para floats.", example: "valor = decimal(10)" },
  { portulong: "boleano", python: "bool", category: "embutido", description: "Converte qualquer valor para tipo de lógica booleana.", example: "b = boleano(1)" },
  { portulong: "lista", python: "list", category: "embutido", description: "Cria um vetor mutável em português.", example: "itens = lista()" },
  { portulong: "dicionario", python: "dict", category: "embutido", description: "Cria um mapeamento de chave-valor (objeto json).", example: "dados = dicionario(canal=123)" },
  { portulong: "conjunto", python: "set", category: "embutido", description: "Cria uma coleção de elementos únicos não ordenados.", example: "unicos = conjunto([1, 1, 2])" },
  { portulong: "tupla", python: "tuple", category: "embutido", description: "Cria uma sequência imutável de elementos.", example: "par = tupla([1, 2])" },
  { portulong: "intervalo", python: "range", category: "embutido", description: "Imprime uma sequência de controle iterável.", example: "para x em intervalo(1, 11):\n    escrever(x)" },
  { portulong: "abrir", python: "open", category: "embutido", description: "Abre arquivos locais com gerenciador de contexto do sistema.", example: "com abrir('dados.txt', 'r') como f:\n    texto = f.ler()" },
  { portulong: "tipo", python: "type", category: "embutido", description: "Retorna a classe ou tipo de dados de uma variável.", example: "tipo('texto') == texto" },
  { portulong: "somar", python: "sum", category: "embutido", description: "Soma elements numéricos de um iterável.", example: "somar([10, 20, 30])" },
  { portulong: "absoluto", python: "abs", category: "embutido", description: "Retorna o valor absoluto de um número.", example: "absoluto(-5)" },
  { portulong: "maximo", python: "max", category: "embutido", description: "Retorna o maior valor de uma lista ou argumentos.", example: "maximo(2, 8, 4)" },
  { portulong: "minimo", python: "min", category: "embutido", description: "Retorna o menor valor de uma lista ou argumentos.", example: "minimo(2, 8, 4)" },
  { portulong: "arredondar", python: "round", category: "embutido", description: "Arredonda um número float para casas decimais.", example: "arredondar(3.1415, 2)" },
  { portulong: "mapear", python: "map", category: "embutido", description: "Aplica uma função sobre todos os itens de um iterável.", example: "mapear(inteiro, ['1', '2'])" },
  { portulong: "filtrar", python: "filter", category: "embutido", description: "Filtra elementos de um iterável baseado em uma função booleana.", example: "filtrar(lambda x: x > 2, [1, 2, 3])" },
  { portulong: "ordenado", python: "sorted", category: "embutido", description: "Retorna uma nova lista contendo itens ordenados de um vetor.", example: "ordenado([3, 1, 2])" },
  { portulong: "super", python: "super", category: "embutido", description: "Chama dinamicamente a classe progenitora pai.", example: "super().__init__()" },
  { portulong: "propriedade", python: "property", category: "embutido", description: "Decorador nativo para criar atributos getter/setter de classe.", example: "@propriedade\ndefinir nome_do_bot(self):\n    retornar self._nome" },
  { portulong: "zipar", python: "zip", category: "embutido", description: "Combina múltiplos iteráveis elemento a elemento simultâneos.", example: "zipar(nomes, idades)" },
  { portulong: "enumerar", python: "enumerate", category: "embutido", description: "Gera tuplas contendo índice e elemento de um iterável.", example: "para idx, item em enumerar(valores):\n    escrever(idx, item)" },
  { portulong: "objeto", python: "object", category: "embutido", description: "Classe genérica pai de todas as outras estruturas.", example: "classe Customizada(objeto):\n    passar" },
  { portulong: "qualquer", python: "any", category: "embutido", description: "Retorna Verdadeiro se ao menos um item de um iterável for verdadeiro.", example: "qualquer([Falso, Verdadeiro])" },
  { portulong: "todos", python: "all", category: "embutido", description: "Retorna Verdadeiro apenas se TODOS os elementos de um vetor forem verdadeiros.", example: "todos([Verdadeiro, Verdadeiro])" },
  { portulong: "ajuda", python: "help", category: "embutido", description: "Retorna o manual explicativo interno do objeto pelo terminal.", example: "ajuda(lista)" },
  { portulong: "identidade", python: "id", category: "embutido", description: "Retorna o endereço físico identificador único do objeto.", example: "identidade(objeto)" },
  { portulong: "reversivel", python: "reversed", category: "embutido", description: "Retorna o iterável lido de trás para frente.", example: "reversivel([1, 2, 3])" },
  { portulong: "formatar", python: "format", category: "embutido", description: "Formata valores baseando em especificações em português.", example: "formatar(12.555, '.2f')" },
  { portulong: "obter_atributo", python: "getattr", category: "embutido", description: "Recupera dinamicamente a propriedade de um objeto.", example: "obter_atributo(bot, 'usuario')" },
  { portulong: "definir_atributo", python: "setattr", category: "embutido", description: "Altera ou insere propriedades dinâmicas sobre uma classe.", example: "definir_atributo(bot, 'ativo', Verdadeiro)" },
  { portulong: "tem_atributo", python: "hasattr", category: "embutido", description: "Informa se o objeto contém a propriedade especificada.", example: "tem_atributo(mensagem, 'conteudo')" },
  { portulong: "excluir_atributo", python: "delattr", category: "embutido", description: "Deleta uma propriedade ou método de forma dinâmica.", example: "excluir_atributo(autor, 'avatar')" },
  { portulong: "representacao", python: "repr", category: "embutido", description: "Gera a representação textual técnica para depurar.", example: "representacao(bot)" },
  { portulong: "proximo", python: "next", category: "embutido", description: "Obtém o elemento seguinte de um iterador.", example: "proximo(meu_iterador)" },
  { portulong: "iterador", python: "iter", category: "embutido", description: "Prepara ou converte o iterável para rodar progressivamente.", example: "it = iterador([1, 2])" },
  { portulong: "eh_instancia", python: "isinstance", category: "embutido", description: "Compara classes; verifica se herda ou pertence àquela estrutura.", example: "eh_instancia(membro, Membro)" },
  { portulong: "eh_subclasse", python: "issubclass", category: "embutido", description: "Informa se uma classe descende diretamente de outra progenitora.", example: "eh_subclasse(CanalTexto, Canal)" },

  // ERROS E EXCEÇÕES CORE (CLASSES DE EXCEÇÃO)
  { portulong: "Excessao", python: "Exception", category: "embutido", description: "Classe genérica representativa de qualquer erro operacional básico.", example: "exceto Excessao como e:\n    escrever(e)" },
  { portulong: "ErroDeValor", python: "ValueError", category: "embutido", description: "Exceção disparada quando o argumento possui tipo correto, mas valor inadequado.", example: "inteiro('texto')" },
  { portulong: "ErroDeTipo", python: "TypeError", category: "embutido", description: "Exceção indicando operação sobre tipos incoerentes simultâneos.", example: "1 + '2'" },
  { portulong: "ErroDeNome", python: "NameError", category: "embutido", description: "Disparado quando o programa aponta para identificador/variável não existente.", example: "escrever(variavel_fantasma)" },
  { portulong: "ErroDeIndice", python: "IndexError", category: "embutido", description: "Erro alertador de estouro de tamanho de limite em vetores/lista.", example: "[1, 2][5]" },
  { portulong: "ErroDeChave", python: "KeyError", category: "embutido", description: "Recuperação incorreta de chave inexistente sobre dicionários.", example: "{'id': 1}['nome']" },
  { portulong: "ErroDeImportacao", python: "ImportError", category: "embutido", description: "Falha na exportação ou carregamento de recursos externos.", example: "importar pacote_inexistente" },
  { portulong: "ErroDeAtributo", python: "AttributeError", category: "embutido", description: "Disparado quando tenta-se executar propriedade ausente num objeto.", example: "bot.deletar_mundo()" },
  { portulong: "ErroDivisaoPorZero", python: "ZeroDivisionError", category: "embutido", description: "Operação matemática impossível detectada pelo Python.", example: "1 / 0" },
  { portulong: "FaltaDeMemoria", python: "MemoryError", category: "embutido", description: "Indica escassez de recursos de memória física.", example: "levantar FaltaDeMemoria()" },
  { portulong: "ParadaDeIteracao", python: "StopIteration", category: "embutido", description: "Avisador interno para forçar término de laço em iterador.", example: "levantar ParadaDeIteracao()" },
  { portulong: "ErroDoSistema", python: "OSError", category: "embutido", description: "Problemas na interface com o sistema operacional hospedeiro.", example: "levantar ErroDoSistema()" },
  { portulong: "ArquivoNaoEncontrado", python: "FileNotFoundError", category: "embutido", description: "Caminho de leitura incorreto ou ausente fisicamente.", example: "abrir('vazio.ptg')" },
  { portulong: "InterrupcaoPeloTeclado", python: "KeyboardInterrupt", category: "embutido", description: "Disparado quando o usuário força o término do bot via terminal (Ctrl+C).", example: "exceto InterrupcaoPeloTeclado:\n    parar_bot()" },
  { portulong: "ErroDeAsseveracao", python: "AssertionError", category: "embutido", description: "Sinalizador de colapso de teste ou regra predefinida.", example: "asseverar Falso" },
  { portulong: "ErroDeExecucao", python: "RuntimeError", category: "embutido", description: "Erro de escopo operacional não definido de forma trivial.", example: "levantar ErroDeExecucao()" },
  { portulong: "ErroNaoImplementado", python: "NotImplementedError", category: "embutido", description: "Classe virtual aguardando preenchimento real posterior de lógica.", example: "definir rodar(self):\n    levantar ErroNaoImplementado()" },

  // COMPONENTES CORE E WRAPPER DO DISCORD
  { portulong: "discord", python: "discord", category: "discord", description: "Módulo principal do wrapper para desenvolvimento do Discord.", example: "importar portulong.discord_pt como discord" },
  { portulong: "Bot", python: "Bot", category: "discord", description: "Inicia a classe representadora da conexão física do bot no Discord.", example: "bot = discord.Bot(prefixo='!', intents=discord.Intencoes.tudo())" },
  { portulong: "discord.Intencoes", python: "discord.Intents", category: "discord", description: "Gere opções de eventos e dados de escopo nos servidores.", example: "intents = discord.Intencoes.tudo()" },
  { portulong: "discord.Cor", python: "discord.Color", category: "discord", description: "Paleta de cores em português (vermelho, azul, verde, roxo etc).", example: "cor = discord.Cor.verde()" },
  { portulong: "discord.Embutido", python: "discord.Embed", category: "discord", description: "Construtor de ricos cards de anúncio/mensagens.", example: "cartao = discord.Embutido('Título', 'Subtítulo', cor=discord.Cor.azul())" },
  { portulong: "discord.Arquivo", python: "discord.File", category: "discord", description: "Permite envio de arquivos locais ou virtuais para canais.", example: "foto = discord.Arquivo('logo.png')" },
  { portulong: "discord.ui", python: "discord.ui", category: "discord", description: "Módulo para botões, caixas de diálogo, texto e reações.", example: "importar portulong.discord_pt como discord\nvazio = discord.ui.Visualizacao()" },
  { portulong: "prefixo", python: "command_prefix", category: "discord", description: "Configuração do prefixo inicial dos comandos do bot.", example: "bot = Bot(prefixo='!')" },
  { portulong: "evento", python: "event", category: "discord", description: "Decorador que registra escutas de gatilhos automáticos.", example: "@bot.evento\ndefinir assincrono ao_iniciar():\n    passar" },
  { portulong: "comando", python: "command", category: "discord", description: "Decorador que registra comandos disparados por chats.", example: "@bot.comando(nome='oi')\ndefinir assincrono responder_oi(contexto):\n    passar" },
  { portulong: "nome", python: "name", category: "discord", description: "Atributo de nome das entidades ou parâmetros das APIs do Discord.", example: "escrever(membro.nome)" },
  { portulong: "ajuda", python: "help", category: "discord", description: "Mensagem ou helper acoplável de texto explicativo em comandos.", example: "@bot.comando(nome='ajuda_limp', ajuda='Limpar chat')" },

  // GATILHOS DE EVENTOS DO DISCORD
  { portulong: "ao_iniciar", python: "on_ready", category: "discord", description: "Gatilho automático disparado ao completar login na API do Discord.", example: "@bot.evento\ndefinir assincrono ao_iniciar():\n    escrever('Estou online!')" },
  { portulong: "ao_mensagem", python: "on_message", category: "discord", description: "Ativado ao enviar mensagem em canais visíveis.", example: "@bot.evento\ndefinir assincrono ao_mensagem(mensagem):\n    se 'oi' em mensagem.conteudo.lower():\n        aguardar mensagem.canal.enviar('Olá')" },
  { portulong: "ao_entrar_membro", python: "on_member_join", category: "discord", description: "Reconhece o momento em que um usuário ingressa no servidor.", example: "@bot.evento\ndefinir assincrono ao_entrar_membro(membro):\n    escrever(f'{membro.nome} entrou!')" },
  { portulong: "ao_sair_membro", python: "on_member_remove", category: "discord", description: "Gatilho para detecção de exclusão ou saída de membros.", example: "@bot.evento\ndefinir assincrono ao_sair_membro(membro):\n    escrever(f'{membro.nome} saiu do servidor.')" },

  // MÉTODOS DE CONTROLE / TRANSPILAÇÃO DO WRAPPER
  { portulong: "enviar", python: "send", category: "discord", description: "Método para envio de mensagens, embutidos e componentes de visualização.", example: "aguardar contexto.enviar('Oi', embutido=meu_embed)" },
  { portulong: "responder", python: "reply", category: "discord", description: "Método que responde com menção e thread contextual de origem.", example: "aguardar contexto.responder('Resposta direta')" },
  { portulong: "deletar", python: "delete", category: "discord", description: "Elimina de forma permanente o recurso oponente (mensagem etc).", example: "aguardar mensagem.deletar()" },
  { portulong: "limpar", python: "purge", category: "discord", description: "Remocação em lote de logs de chats por tamanho.", example: "aguardar canal.limpar(limite=10)" },
  { portulong: "adicionar_reacao", python: "add_reaction", category: "discord", description: "Insere reações de emojis sobre mensagens.", example: "aguardar mensagem.adicionar_reacao('🟢')" },
  { portulong: "remover_reacao", python: "remove_reaction", category: "discord", description: "Exclui uma reação selecionada do emoji na mensagem.", example: "aguardar mensagem.remover_reacao('🟢', usuario)" },
  { portulong: "expulsar", python: "kick", category: "discord", description: "Expulsa um membro infrator do servidor atual.", example: "aguardar membro.expulsar(motivo='Regra violada')" },
  { portulong: "banir", python: "ban", category: "discord", description: "Bane permanentemente o usuário do servidor.", example: "aguardar membro.banir(motivo='Spam')" },
  { portulong: "castigar", python: "timeout", category: "discord", description: "Silencia o membro por uma duração de tempo de segundos.", example: "aguardar membro.castigar(300, motivo='Flood')" },
  { portulong: "remover_castigo", python: "remove_timeout", category: "discord", description: "Revoga o silenciamento ativo sobre o membro.", example: "aguardar membro.remover_castigo()" },
  { portulong: "adicionar_cargo", python: "add_roles", category: "discord", description: "Acopla cargos e permissões ao usuário selecionado.", example: "aguardar membro.adicionar_cargo(cargo_vip)" },
  { portulong: "remover_cargo", python: "remove_roles", category: "discord", description: "Desliga e remove cargos predefinidos do membro.", example: "aguardar membro.remover_cargo(cargo_vip)" },
  { portulong: "editar", python: "edit", category: "discord", description: "Muda o nome, posições e configurações das APIs.", example: "aguardar membro.editar(apelido='Administrador')" },

  // ATRIBUTOS E PROPRIEDADES DE ENTIDADES
  { portulong: "conteudo", python: "content", category: "discord", description: "Guarda o texto cru textual despachado em uma mensagem.", example: "escrever(mensagem.conteudo)" },
  { portulong: "autor", python: "author", category: "discord", description: "Referência da classe Membro/Usuario que executou a ação.", example: "escrever(mensagem.autor.nome)" },
  { portulong: "canal", python: "channel", category: "discord", description: "Referência do canal de texto ou voz de origem.", example: "aguardar mensagem.canal.enviar('Sucesso')" },
  { portulong: "servidor", python: "guild", category: "discord", description: "Referência do servidor hospedeiro que abriga as atividades.", example: "escrever(contexto.servidor.nome)" },
  { portulong: "mensagem", python: "message", category: "discord", description: "Entidade representadora da transmissão com ID e anexos.", example: "escrever(mensagem.id)" },
  { portulong: "usuario", python: "user", category: "discord", description: "Entidade básica representante do bot ou da conta Discord.", example: "escrever(bot.usuario)" },
  { portulong: "id", python: "id", category: "discord", description: "O identificador numérico exclusivo das entidades.", example: "escrever(canal.id)" },
  { portulong: "membro", python: "member", category: "discord", description: "Referência de usuário dentro do contexto do servidor.", example: "escrever(membro.apelido)" },
  { portulong: "apelido", python: "display_name", category: "discord", description: "Nome alternativo exibido pelo membro no servidor atual.", example: "escrever(autor.apelido)" },
  { portulong: "mencao", python: "mention", category: "discord", description: "Gera a menção com @ em português.", example: "escrever(autor.mencao)" },
  { portulong: "membros", python: "members", category: "discord", description: "Coleção completa dos membros que participam da guilda.", example: "escrever(tamanho(servidor.membros))" },
  { portulong: "cargos", python: "roles", category: "discord", description: "Vetor que lista os níveis ou cargos existentes no servidor.", example: "escrever(tamanho(servidor.cargos))" },
  { portulong: "canais", python: "channels", category: "discord", description: "Lista de todos os canais do servidor.", example: "para can em servidor.canais:\n    escrever(can.nome)" },
  { portulong: "icone_url", python: "icon", category: "discord", description: "Retorna a imagem/logo representativa do servidor.", example: "imagem = servidor.icone_url" },
  { portulong: "criado_em", python: "created_at", category: "discord", description: "Data de criação técnica original da entidade.", example: "escrever(membro.criado_em)" },
  { portulong: "cargo_topo", python: "top_role", category: "discord", description: "Informa o cargo mais alto ocupado pelo membro.", example: "escrever(membro.cargo_topo.nome)" },
  { portulong: "titulo", python: "title", category: "discord", description: "Informa ou altera o título dos cartões ou componentes.", example: "cartao = discord.Embutido(titulo='Anúncio')" },
  { portulong: "descricao", python: "description", category: "discord", description: "Atributo de descrição contida em cartões embutidos.", example: "cartao.descricao = 'Algo'" },

  // COMPONENTES DE INTERFACES INTERATIVAS (DISCORD.UI)
  { portulong: "discord.ui.Botao", python: "discord.ui.Button", category: "discord", description: "Gera botões interativos anexados à mensagem.", example: "meu_btn = discord.ui.Botao(rotulo='Votar', estilo='sucesso')" },
  { portulong: "discord.ui.Selecao", python: "discord.ui.Select", category: "discord", description: "Componente drop-down de seleção única ou múltipla para formulários.", example: "menu = discord.ui.Selecao(marcador='Escolha o seu cargo')" },
  { portulong: "discord.ui.OpcaoSelecao", python: "discord.SelectOption", category: "discord", description: "Gera uma opção anexável a uma lista suspensa de Seleção.", example: "opcao = discord.ui.OpcaoSelecao(rotulo='Premium', valor='1')" },
  { portulong: "discord.ui.CaixaTexto", python: "discord.ui.TextInput", category: "discord", description: "Campo de preenchimento textual para entrada de dados em Modals.", example: "nome_input = discord.ui.CaixaTexto(rotulo='Primeiro Nome', estilo='curto')" },
  { portulong: "discord.ui.Modal", python: "discord.ui.Modal", category: "discord", description: "Popup/Janela de diálogo formulária que sobrepõe o chat.", example: "formulario = discord.ui.Modal(titulo='Inscrição')" },
  { portulong: "discord.ui.Visualizacao", python: "discord.ui.View", category: "discord", description: "Container visual que agrupa e despacha botões e listas.", example: "painel = discord.ui.Visualizacao(tempo_esgotado=60)" },
];

const TEMPLATES: CodeTemplate[] = [
  {
    id: "bot-completo",
    name: "🚀 Bot Showroom Completo",
    description: "Nosso bot oficial super completo para testar: ajuda, painéis interativos (botão/modal), minijogos e muito mais!",
    filename: "bot_completo.ptg",
    code: `# 🤖 BOT DE DEMONSTRAÇÃO COMPLETO EM PORTULONG 🐉
# Este arquivo serve para você testar TODOS os recursos da linguagem e do wrapper do Discord!
# Copie, transpile, modifique e divirta-se!

importar portulong.discord_pt como discord

# Instancia o bot com prefixo '!' e todas as intenções ativadas
bot = discord.Bot(prefixo="!", intents=discord.Intencoes.tudo())

# Evento: Disparado quando o bot faz login com sucesso na API
@bot.evento
definir assincrono ao_iniciar():
    escrever("==================================================")
    escrever(f"⚡ [SISTEMA] O bot {bot.usuario} está online!")
    escrever("🚀 Programado 100% em Portulong (.ptg)")
    escrever("== Use '!' no Discord para testar os comandos ===")
    escrever("==================================================")

# 1. COMANDO SIMPLES: Ajuda dinâmica do bot
@bot.comando(nome="ajuda")
definir assincrono enviar_ajuda(ctx):
    # Cria um cartão de anúncio embutido (Embed) lindo
    cartao = discord.Embutido(
        titulo="🐉 Guia de Ajuda do Portulong Bot",
        descricao="Bem-vindo ao bot oficial de testes construído na linguagem Portulong! Veja meus comandos abaixo:",
        cor=discord.Cor.azul()
    )
    
    # Adicionando campos informativos de utilidades
    cartao.adicionar_campo(nome="🤖 !ajuda", valor="Mostra este belo menu interativo em português.", em_linha=Falso)
    cartao.adicionar_campo(nome="📁 !painel", valor="Cria botões de interação que abrem um Modal de cadastro.", em_linha=Falso)
    cartao.adicionar_campo(nome="🎯 !advinha", valor="Inicia um minijogo divertido de advinhação de número.", em_linha=Falso)
    cartao.adicionar_campo(nome="🧮 !calc", valor="Realiza cálculos matemáticos rápidos (ex: !calc 10 + 5).", em_linha=Falso)
    cartao.adicionar_campo(nome="🧹 !limpar", valor="Exclui mensagens do canal (para moderadores).", em_linha=Falso)
    
    cartao.definir_rodape(texto="Compilado perfeitamente de Portulong para Python 🐍")
    
    aguardar ctx.enviar(embutido=cartao)

# 2. COMANDO AVANÇADO COM COMPONENTES VISUAIS (BOTOES, SELECOES E MODAL)
@bot.comando(nome="painel")
definir assincrono enviar_painel(ctx):
    # Cria uma view interativa
    painel = discord.ui.Visualizacao(tempo_esgotado=120)
    
    # Cria um botão de estilo sucesso
    botao_registro = discord.ui.Botao(
        rotulo="📝 Abrir Registro",
        estilo="sucesso",
        id_personalizado="botao_registrar_membro"
    )
    
    # Callback disparado quando alguém clica no botão "Abrir Registro"
    definir assincrono ao_clicar_registro(interacao):
        # Constrói a janela popup interativa (Modal)
        formulario = discord.ui.Modal(titulo="Cadastro da Comunidade Portulong", id_personalizado="form_cadastro")
        
        # Cria as caixas de texto internas do modal
        input_nome = discord.ui.CaixaTexto(rotulo="Qual seu nome completo?", id_personalizado="nome_completo", estilo="curto")
        input_hab = discord.ui.CaixaTexto(rotulo="Principal linguagem que você programa?", id_personalizado="vibe_ling", estilo="curto")
        input_motivo = discord.ui.CaixaTexto(rotulo="Por que quer se juntar a nós?", id_personalizado="motivo_registro", estilo="longo")
        
        # Adiciona os inputs ao formulário do modal
        formulario.adicionar_item(input_nome)
        formulario.adicionar_item(input_hab)
        formulario.adicionar_item(input_motivo)
        
        # Callback para processar o envio do formulário do Modal
        definir assincrono ao_submeter_formulario(interacao_modal):
            # Obtém as respostas digitadas pelo usuário de forma segura
            nome = interacao_modal.dados["nome_completo"]
            hab = interacao_modal.dados["vibe_ling"]
            motivo = interacao_modal.dados["motivo_registro"]
            
            # Constrói o cartão de perfil do novo cadastrado
            perfil = discord.Embutido(titulo="✅ Novo Cadastro Recebido!", cor=discord.Cor.verde())
            perfil.adicionar_campo(nome="👤 Nome", valor=nome, em_linha=Verdadeiro)
            perfil.adicionar_campo(nome="💻 Programa em", valor=hab, em_linha=Verdadeiro)
            perfil.adicionar_campo(nome="📝 Motivação", valor=motivo, em_linha=Falso)
            perfil.definir_autor(nome=interacao_modal.autor.nome)
            
            # Responde o modal informando que foi gravado
            aguardar interacao_modal.responder(texto="Seu cadastro foi salvo com êxito!", embutido=perfil)
            
        formulario.ao_submeter = ao_submeter_formulario
        
        # Abre o modal no ecrã do utilizador que clicou
        aguardar interacao.enviar_modal(formulario)
        
    # Vincula o gatilho de clique ao botão
    botao_registro.ao_clicar = ao_clicar_registro
    
    # Adiciona o botão do painel
    painel.adicionar_item(botao_registro)
    
    aguardar ctx.enviar(
        conteudo="Clique no botão abaixo para abrir o formulário interativo de cadastro:",
        visualizacao=painel
    )

# 3. COMANDO DIVERTIDO: Minijogo de Advinhação de Número
@bot.comando(nome="advinha")
definir assincrono iniciar_advinha(ctx):
    importar random
    numero_secreto = random.randint(1, 10)
    
    aguardar ctx.enviar("🎲 Eu pensei em um número entre **1 e 10**. Você tem **3 tentativas** para adivinhar! Qual o seu palpite?")
    
    # Função auxiliar para validar se a resposta vem da mesma pessoa e canal
    definir verificar_resposta(mensagem):
        retornar mensagem.autor == ctx.autor e mensagem.canal == ctx.canal
        
    tentativas = 0
    enquanto tentativas < 3:
        tentar:
            # Aguarda o jogador enviar uma resposta por chat
            palpite_msg = aguardar bot.aguardar_resposta(filtro=verificar_resposta, tempo_esgotado=30.0)
            valor_palpite = inteiro(palpite_msg.conteudo)
            
            se valor_palpite == numero_secreto:
                aguardar ctx.enviar(f"🎉 PARABÉNS! {ctx.autor.mencao} acertou o número secreto (**{numero_secreto}**)! Você é um gênio!")
                retornar
            senaose valor_palpite < numero_secreto:
                aguardar ctx.enviar("🔼 Dica: O número secreto é **maior** do que seu palpite! Tente novamente:")
            senao:
                aguardar ctx.enviar("🔽 Dica: O número secreto é **menor** do que seu palpite! Tente novamente:")
                
            tentativas = tentativas + 1
        exceto ErroDeValor:
            aguardar ctx.enviar("⚠️ Por favor, digite um número inteiro válido!")
        exceto Excessao:
            aguardar ctx.enviar(f"⏱️ O tempo acabou! O número secreto era **{numero_secreto}**.")
            retornar
            
    aguardar ctx.enviar(f"😢 Suas tentativas acabaram! O número secreto era **{numero_secreto}**. Mais sorte na próxima!")

# 4. COMANDO CALCULADORA DINÂMICA (Ex: !calc 15 * 3)
@bot.comando(nome="calc")
definir assincrono calcular_expressao(ctx, n1: real, operador, n2: real):
    se operador == "+":
        res = n1 + n2
    senaose operador == "-":
        res = n1 - n2
    senaose operador == "*" ou operador == "x":
        res = n1 * n2
    senaose operador == "/":
        se n2 == 0:
            aguardar ctx.enviar("❌ Erro: Divisão por zero não é permitida matematicamente!")
            retornar
        res = n1 / n2
    senao:
        aguardar ctx.enviar("⚠️ Operador inválido. Use: +, -, * ou /")
        retornar
        
    aguardar ctx.enviar(f"🧮 **Calculadora Portulong**\nExpressão: \`{n1} {operador} {n2}\`\nResultado: **{res}**")

# ====================================================================
# 🔑 SEÇÃO DE INICIALIZAÇÃO DO BOT (TOKEN DO DISCORD)
# Insira seu token confidencial do Discord abaixo.
# Atenção: Você pode guardar seu token no arquivo '.env' do seu servidor
# no formato TOKEN=seu_token_aqui ou passá-lo diretamente na inicialização:
# ====================================================================
bot.rodar("INSIRA_SEU_TOKEN_DE_DISCORD_AQUI")
`
  },
  {
    id: "boas-vindas",
    name: "Bot Boas-vindas",
    description: "Reage a novos membros com saudações amigáveis no canal padrão.",
    filename: "bot_boas_vindas.ptg",
    code: `# Exemplo 1: Bot de Boas-vindas em Portulong
# Arquivo: bot_boas_vindas.ptg

importar portulong.discord_pt como discord

# Inicializa o bot com o prefixo '!'
bot = discord.Bot(prefixo="!")

# Evento ativado quando o bot se conecta
@bot.evento
definir assincrono ao_iniciar():
    escrever(f"Bot conectado com sucesso como {bot.usuario}!")

# Evento ativado quando um membro entra no servidor
@bot.evento
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

bot = discord.Bot(prefixo="!")

@bot.evento
definir assincrono ao_iniciar():
    escrever("Bot online e pronto para comandos em português!")

# Comando simples !ping
@bot.comando(nome="ping")
definir assincrono resposta_ping(ctx):
    aguardar ctx.enviar("🏓 Pong! O bot está rodando perfeitamente em Portulong.")

# Comando !diga <texto> que ecoa a frase do usuário
@bot.comando(nome="diga", ajuda="Faz o bot repetir o texto enviado")
definir assincrono resposta_falar(ctx, texto):
    aguardar ctx.enviar(f"O usuário **{ctx.autor.nome}** mandou dizer: {texto}")

# Comando !pergunta que simula respostas simples
@bot.comando(nome="pergunta")
definir assincrono resposta_pergunta(ctx, pergunta):
    fala = f"Hum, você perguntou: '{pergunta}'. Minha resposta é: Sim, com certeza! 👍"
    aguardar ctx.enviar(fala)
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

bot = discord.Bot(prefixo="!")

@bot.evento
definir assincrono ao_iniciar():
    escrever("Sistema avançado de segurança ativado nos canais.")

# Comando !limpar <quantidade> para deletar mensagens anteriores
@bot.comando(nome="limpar")
definir assincrono limpar_chat(ctx, quantidade: inteiro = 10):
    # Verifica se o solicitante tem permissão de gerenciar mensagens
    se ctx.autor.permissoes.gerenciar_mensagens:
        aguardar ctx.canal.limpar(limite=quantidade)
        aguardar ctx.enviar(f"🧹 {quantidade} mensagens apagadas com sucesso por {ctx.autor.nome}!", excluir_depois=5)
    senao:
        aguardar ctx.enviar("❌ Desculpe, você não tem a permissão de 'Gerenciar Mensagens' para usar isso.")

# Comando !expulsar <membro>
@bot.comando(nome="expulsar")
definir assincrono expulsar_membro(ctx, membro: discord.Membro):
    se ctx.autor.permissoes.expulsar_membros:
        aguardar membro.expulsar()
        aguardar ctx.enviar(f"🚨 {membro.nome} foi banido/expulso por violar as regras do servidor!")
    senao:
        aguardar ctx.enviar("❌ Acesso negado. Apenas moderadores autorizados podem usar esse comando.")
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

bot = discord.Bot(prefixo="!")

@bot.evento
definir assincrono ao_iniciar():
    escrever("Módulo de cálculos matemáticos carregado.")

# Comando !somar <numero1> <numero2>
@bot.comando(nome="somar")
definir assincrono somar_numeros(ctx, n1: real, n2: real):
    soma = n1 + n2
    aguardar ctx.enviar(f"📊 **Calculadora Portulong**:\nO resultado da soma de {n1} + {n2} é igual a: **{soma}**")

# Comando !multiplicar <numero1> <numero2>
@bot.comando(nome="vezes")
definir assincrono multiplicar_numeros(ctx, n1: real, n2: real):
    resultado = n1 * n2
    aguardar ctx.enviar(f"✖️ O resultado de {n1} multiplicado por {n2} é igual a: **{resultado}**")
`
  }
];

// Função de realce de sintaxe robusta para Portulong (.ptg) com Linter e Validação integrada em tempo real
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
    "Robo", "Bot", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem", "discord",
    "Cor", "Embutido", "Modal", "ModalPT", "CaixaTexto", "Botao", "Selecao", "Visualizacao", "OpcaoSelecao",
    "VisualizacaoLayout", "Recipiente", "ExibicaoTexto", "Secao", "Separador", "Miniatura", "LinhaAcao", "cor_destaque", "tempo_esgotado",
    "comando", "evento", "contexto", "membro", "canal", "servidor", "mensagem", 
    "usuario", "enviar", "responder", "deletar", "adicionar_reacao", 
    "remover_reacao", "expulsar", "banir", "limpar", "conteudo", "autor", 
    "id", "canal_sistema", "permissoes", "expulsar_membros", "gerenciar_mensagens",
    "adicionar_campo", "definir_autor", "definir_imagem", "definir_miniatura", "definir_rodape", "limpar_campos"
  ]);

  // English Python keywords mapped to Portulong suggestions to raise instant IDE syntax checking alerts
  const PYTHON_SUGGESTIONS: Record<string, string> = {
    "if": "se",
    "else": "senao",
    "elif": "senaose",
    "for": "para",
    "while": "enquanto",
    "def": "definir",
    "class": "classe",
    "import": "importar",
    "from": "de",
    "as": "como",
    "return": "retornar",
    "try": "tentar",
    "except": "exceto",
    "finally": "finalmente",
    "with": "com",
    "lambda": "lambda",
    "pass": "passar",
    "break": "parar",
    "continue": "continuar",
    "True": "Verdadeiro",
    "False": "Falso",
    "None": "Nulo",
    "and": "e",
    "or": "ou",
    "not": "nao",
    "in": "em",
    "is": "eh",
    "print": "escrever",
    "input": "ler",
    "len": "tamanho"
  };

  const PYTHON_ERRORS = new Set(Object.keys(PYTHON_SUGGESTIONS));

  // Lista estática de exclusão / fallback para evitar falsos positivos
  const CORE_ALLOWED = new Set([
    "self", "contexto", "ctx", "bot", "client", "args", "kwargs", "ptg", "canal_id", "token", "mensagem",
    "os", "sys", "re", "json", "math", "random", "time", "datetime", "asyncio", "discord", "commands",
    "__init__", "__name__", "__main__", "append", "remove", "pop", "split", "join", "strip", "lower", "upper",
    "replace", "keys", "values", "items", "get", "update", "exec", "len",
    "Exception", "ValueError", "TypeError", "NameError", "IndexError", "KeyError", 
    "ImportError", "AttributeError", "ZeroDivisionError", "MemoryError", "StopIteration", 
    "OSError", "FileNotFoundError", "KeyboardInterrupt", "AssertionError", "RuntimeError", "NotImplementedError"
  ]);

  // Coleção dinâmica para guardar declarações locais do usuário
  const LOCAL_DECLS = new Set<string>();

  try {
    // 1. Extração dinâmica de nomes de funções/definições locais (suporta assincrono)
    const fnRegex = /\b(?:funcao|definir)\s+(?:assincrono\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let localMatch;
    while ((localMatch = fnRegex.exec(rawCode)) !== null) {
      LOCAL_DECLS.add(localMatch[1]);
    }

    // 2. Extração de classes
    const clRegex = /\bclasse\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    while ((localMatch = clRegex.exec(rawCode)) !== null) {
      LOCAL_DECLS.add(localMatch[1]);
    }

    // 3. Extração de variáveis atribuídas localmente (ex: token = "...")
    const assignRegex = /^[ \t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*=/gm;
    while ((localMatch = assignRegex.exec(rawCode)) !== null) {
      const vars = localMatch[1].split(",");
      vars.forEach(v => LOCAL_DECLS.add(v.trim()));
    }

    // 4. Extração de variáveis de loops (para x em intervalo:)
    const loopRegex = /\bpara\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s+em\b/g;
    while ((localMatch = loopRegex.exec(rawCode)) !== null) {
      const vars = localMatch[1].split(",");
      vars.forEach(v => LOCAL_DECLS.add(v.trim()));
    }

    // 5. Extração de parâmetros de função locais (suporta assincrono e parâmetros nomeados / valores padrão)
    const paramsRegex = /\b(?:funcao|definir)\s+(?:assincrono\s+)?[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/g;
    while ((localMatch = paramsRegex.exec(rawCode)) !== null) {
      const paramsRaw = localMatch[1].split(",");
      paramsRaw.forEach(p => {
        const pNome = p.trim().split(/\s*:/)[0].split(/\s*=/)[0].trim();
        if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) {
          LOCAL_DECLS.add(pNome);
        }
      });
    }

    // 6. Extração de imports e aliases locais (de xxx importar yyy)
    const impFromRegex = /\bde\s+[a-zA-Z0-9_.]+\s+importar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
    while ((localMatch = impFromRegex.exec(rawCode)) !== null) {
      const nomes = localMatch[1].split(",");
      nomes.forEach(n => LOCAL_DECLS.add(n.trim()));
    }

    const impRegex = /\bimportar\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
    while ((localMatch = impRegex.exec(rawCode)) !== null) {
      const partes = localMatch[1].split(",");
      partes.forEach(p => {
        const pTrim = p.trim();
        if (pTrim.includes(" como ")) {
          const alias = pTrim.split(" como ")[1].trim();
          LOCAL_DECLS.add(alias);
        } else {
          LOCAL_DECLS.add(pTrim);
        }
      });
    }

    // 7. Extração de variáveis locais de exceção (ex: exceto Excessao como erro: ou except Exception as erro:)
    const excRegex = /\b(?:exceto|except)\s+[a-zA-Z0-9_\.]+(?:\s+(?:como|as)\s+([a-zA-Z_][a-zA-Z0-9_]*))?/g;
    while ((localMatch = excRegex.exec(rawCode)) !== null) {
      if (localMatch[1]) {
        LOCAL_DECLS.add(localMatch[1].trim());
      }
    }
  } catch (err) {
    console.error("Erro no parser preliminar do linter:", err);
  }

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
      } else if (PYTHON_ERRORS.has(word)) {
        const suggestion = PYTHON_SUGGESTIONS[word];
        elements.push(
          <span 
            key={key++} 
            title={`Erro de Sintaxe: Escreva '${suggestion}' em vez de '${word}' em Portulong.`} 
            className="text-red-400 bg-red-950/40 border-b-2 border-red-500 font-bold font-mono px-0.5 rounded cursor-help animate-pulse"
          >
            {word}
          </span>
        );
      } else if (BUILTINS.has(word)) {
        elements.push(<span key={key++} className="text-cyan-400 font-medium font-mono">{word}</span>);
      } else if (DISCORD.has(word)) {
        elements.push(<span key={key++} className="text-indigo-400 font-semibold font-mono">{word}</span>);
      } else if (/^\d+$/.test(word)) {
        elements.push(<span key={key++} className="text-purple-400 font-mono">{word}</span>);
      } else if (rawCode[match.index + word.length] === '(') {
        elements.push(<span key={key++} className="text-emerald-400 font-mono font-medium">{word}</span>);
      } else {
        // Ramo else: Palavra identificadora genérica. Rodar linter para verificar se é válida
        const isAttribute = (() => {
          let idx = match.index - 1;
          while (idx >= 0 && /\s/.test(rawCode[idx])) {
            idx--;
          }
          return idx >= 0 && rawCode[idx] === '.';
        })();

        const isDecorator = (() => {
          let idx = match.index - 1;
          while (idx >= 0 && /\s/.test(rawCode[idx])) {
            idx--;
          }
          return idx >= 0 && rawCode[idx] === '@';
        })();

        const isKeywordArgument = (() => {
          let idx = match.index + word.length;
          while (idx < rawCode.length && /\s/.test(rawCode[idx])) {
            idx++;
          }
          return idx < rawCode.length && rawCode[idx] === '=' && (idx + 1 >= rawCode.length || rawCode[idx + 1] !== '=');
        })();

        // Se for uma palavra maior que 1 letra, que não é atributo/objeto, não é argumento e não é declarada no escopo, aponta erro de sintaxe
        const isInvalid = word.length > 1 && !isAttribute && !isDecorator && !isKeywordArgument && !CORE_ALLOWED.has(word) && !LOCAL_DECLS.has(word);

        if (isInvalid) {
          elements.push(
            <span 
              key={key++} 
              title={`A palavra '${word}' não é uma palavra-chave integrada e não foi declarada localmente.`} 
              className="text-red-400 border-b border-dashed border-red-500 bg-red-950/20 font-mono px-0.5 rounded cursor-help"
            >
              {word}
            </span>
          );
        } else {
          elements.push(<span key={key++} className="text-slate-200 font-mono">{word}</span>);
        }
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
    snippet: "definir assincrono nome_funcao(ctx):\n    aguardar ctx.enviar(\"Texto\")\n",
    description: "Define uma nova função assíncrona portuguesa (suporta ctx ou contexto)"
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
    snippet: "@robo.comando(nome=\"ping\", ajuda=\"Comando de resposta rápida\")\ndefinir assincrono resposta_ping(ctx):\n    aguardar ctx.enviar(\"🏓 Pong!\")\n",
    description: "Cria um comando de texto interativo !ping para o bot (suporta ctx ou contexto)"
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
    displayName: "ctx.enviar(...)",
    snippet: "aguardar ctx.enviar(\"Sua mensagem aqui!\")",
    description: "Envia uma mensagem de texto simples ao canal ativo (suporta ctx ou contexto)"
  },
  {
    key: "responder",
    displayName: "ctx.responder(...)",
    snippet: "aguardar ctx.responder(\"Sua resposta!\")",
    description: "Responde de forma encadeada diretamente à mensagem original (suporta ctx ou contexto)"
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

// Propriedades e Métodos de Contexto (ctx / contexto)
const CONTEXT_PROPERTIES = [
  {
    key: "enviar",
    displayName: "enviar(conteudo)",
    snippet: "enviar(\"mensagem\")",
    description: "Envia uma mensagem de texto simples ao canal ativo"
  },
  {
    key: "responder",
    displayName: "responder(conteudo)",
    snippet: "responder(\"resposta\")",
    description: "Responde de forma direta e contextual com menção"
  },
  {
    key: "autor",
    displayName: "autor",
    snippet: "autor",
    description: "Membro autor que executou o comando ou enviou a mensagem"
  },
  {
    key: "autor.nome",
    displayName: "autor.nome",
    snippet: "autor.nome",
    description: "Retorna o nome completo atualizado do usuário autor"
  },
  {
    key: "autor.mencao",
    displayName: "autor.mencao",
    snippet: "autor.mencao",
    description: "Menção interativa com marcação do autor (@Usuário)"
  },
  {
    key: "autor.apelido",
    displayName: "autor.apelido",
    snippet: "autor.apelido",
    description: "Apelido localizado ou nome descritivo do autor no servidor"
  },
  {
    key: "canal",
    displayName: "canal",
    snippet: "canal",
    description: "Canal originário de texto ou voz do gatilho"
  },
  {
    key: "canal.limpar",
    displayName: "canal.limpar(limite)",
    snippet: "canal.limpar(10)",
    description: "Elimina um lote de mensagens anteriores do canal de chat"
  },
  {
    key: "servidor",
    displayName: "servidor",
    snippet: "servidor",
    description: "Servidor / Guilda Discord onde ocorreu o evento"
  },
  {
    key: "servidor.nome",
    displayName: "servidor.nome",
    snippet: "servidor.nome",
    description: "Nome de exibição oficial do servidor de hospedagem"
  },
  {
    key: "servidor.membros",
    displayName: "servidor.membros",
    snippet: "servidor.membros",
    description: "Lista de todos os membros que pertencem a este servidor"
  },
  {
    key: "servidor.canais",
    displayName: "servidor.canais",
    snippet: "servidor.canais",
    description: "Lista de canais disponíveis construídos no servidor"
  },
  {
    key: "mensagem",
    displayName: "mensagem",
    snippet: "mensagem",
    description: "O objeto mensagem completo de recepção"
  },
  {
    key: "mensagem.conteudo",
    displayName: "mensagem.conteudo",
    snippet: "mensagem.conteudo",
    description: "Texto bruto contido no pacote da mensagem original"
  },
  {
    key: "mensagem.deletar",
    displayName: "mensagem.deletar()",
    snippet: "mensagem.deletar()",
    description: "Deleta/Remove permanentemente esta mensagem da visualização"
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
  const [pythonWarnings, setPythonWarnings] = useState<{ py: string; ptg: string; lines: number[] }[]>([]);
  const [pythonEquivalent, setPythonEquivalent] = useState("");
  const [activePreset, setActivePreset] = useState(TEMPLATES[0].id);
  const [ideLayout, setIdeLayout] = useState<"compact" | "detailed">("compact");
  const [installTab, setInstallTab] = useState<"auto" | "vscode" | "pip" | "files">("auto");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
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

  const [compilationStatus, setCompilationStatus] = useState<"success" | "warning" | "error">("success");

  // Dynamic analysis function for checking syntax and keywords
  const testPortulongCode = (codeText: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let prefix = "!";
    let commandsCount = 0;
    const detectedReplacements: { py: string; ptg: string; lines: number[] }[] = [];

    // Check prefix
    const prefixMatch = codeText.match(/prefixo\s*=\s*["']([^"']+)["']/);
    if (prefixMatch) {
      prefix = prefixMatch[1];
    }

    const lines = codeText.split("\n");

    const pythonReplacements: Record<string, string> = {
      // Palavras-chave do fluxo e declarações
      "if": "se",
      "else": "senao",
      "elif": "senaose",
      "for": "para",
      "while": "enquanto",
      "def": "definir",
      "class": "classe",
      "import": "importar",
      "from": "de",
      "as": "como",
      "return": "retornar",
      "try": "tentar",
      "except": "exceto",
      "finally": "finalmente",
      "pass": "passar",
      "break": "parar",
      "continue": "continuar",
      "True": "Verdadeiro",
      "False": "Falso",
      "None": "Nulo",
      "and": "e",
      "or": "ou",
      "not": "nao",
      "in": "em",
      "is": "eh",
      "lambda": "lambda",
      "async": "assincrono",
      "await": "aguardar",
      "global": "global",
      "nonlocal": "naolocal",
      "raise": "levantar",
      "yield": "produzir",
      "assert": "asseverar",

      // Funções Embutidas (Built-ins)
      "print": "escrever",
      "input": "ler",
      "len": "tamanho",
      "int": "inteiro",
      "str": "texto",
      "float": "real",
      "bool": "boleano",
      "list": "lista",
      "dict": "dicionario",
      "set": "conjunto",
      "tuple": "tupla",
      "range": "intervalo",
      "open": "abrir",
      "type": "tipo",
      "sum": "somar",
      "abs": "absoluto",
      "max": "maximo",
      "min": "minimo",
      "round": "arredondar",
      "zip": "zipar",
      "enumerate": "enumerar",
      "any": "qualquer",
      "all": "todos",

      // Erros comuns (Exceptions)
      "Exception": "Excessao",
      "ValueError": "ErroDeValor",
      "TypeError": "ErroDeTipo",
      "NameError": "ErroDeNome",
      "IndexError": "ErroDeIndice",
      "KeyError": "ErroDeChave",

      // Coisas do Discord Wrapper
      "on_ready": "ao_iniciar",
      "on_message": "ao_mensagem",
      "on_member_join": "ao_entrar_membro",
      "on_member_remove": "ao_sair_membro",
      "on_reaction_add": "ao_reacao_adicionada",
      "on_reaction_remove": "ao_reacao_removida",
      "add_reaction": "adicionar_reacao",
      "remove_reaction": "remover_reacao",
      "clear_reactions": "remover_todas_as_reacoes",
      "send": "enviar",
      "reply": "responder",
      "delete": "deletar",
      "purge": "limpar",
      "ban": "banir",
      "kick": "expulsar",
      "timeout": "castigar",
      "add_roles": "adicionar_cargo",
      "remove_roles": "remover_cargo",
      "edit": "editar",
      "move_to": "mover_para",
      "ctx\\.send": "contexto.enviar",
      "ctx\\.reply": "contexto.responder",
      "message\\.content": "mensagem.conteudo",
      "message\\.author": "mensagem.autor",
      "message\\.channel": "mensagem.canal",
      "message\\.guild": "mensagem.servidor",
      "member\\.kick": "membro.expulsar",
      "member\\.ban": "membro.banir",
      "message\\.delete": "mensagem.deletar",
      "channel\\.purge": "canal.limpar",
      "@bot\\.event": "@bot.evento",
      "@client\\.event": "@bot.evento",
      "@robo\\.event": "@robo.evento",
      "@bot\\.command": "@bot.comando",
      "@client\\.command": "@bot.comando",
      "@robo\\.command": "@robo.comando",
      "run": "executar",
      "execute": "executar"
    };

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Ignora trechos de strings e blocos de comentários para não termos falsos positivos de termos como "is", "in", etc.
      let cleanLine = trimmed;
      cleanLine = cleanLine.replace(/"([^"\\]|\\.)*"/g, "");
      cleanLine = cleanLine.replace(/'([^'\\]|\\.)*'/g, "");
      cleanLine = cleanLine.replace(/#.*/, "");

      const blockKeywords = ["se", "senaose", "senao", "para", "enquanto", "definir", "funcao", "classe", "tentar", "exceto"];
      const firstWordMatch = cleanLine.trim().match(/^([a-zA-Z0-9_\/à-ú]+)/);
      if (firstWordMatch) {
        const firstWord = firstWordMatch[1];
        if (blockKeywords.includes(firstWord) && !trimmed.endsWith(":")) {
          errors.push(`Erro de Sintaxe (Linha ${lineNum}): Falta do caractere dois-pontos ':' ao final da linha do bloco de decisão.`);
        }
      }

      // Detect common syntax errors in Discord / UI method arguments (missing quotes for strings)
      const discordMethodPattern = /(adicionar_campo|enviar|responder|Embutido|Botao|Selecao|Modal|ModalPT|CaixaTexto|castigar)/;
      if (discordMethodPattern.test(trimmed)) {
        const firstParen = trimmed.indexOf("(");
        const lastParen = trimmed.lastIndexOf(")");
        if (firstParen !== -1 && lastParen !== -1 && lastParen > firstParen) {
          const argsStr = trimmed.substring(firstParen + 1, lastParen);
          const argMatches = argsStr.matchAll(/([a-zA-Z0-9_]+)\s*=\s*([^,)]+)/g);
          for (const match of argMatches) {
            const argName = match[1];
            const argValue = match[2].trim();
            const stringParams = ["nome", "valor", "titulo", "descricao", "rotulo", "marcador", "id_personalizado", "motivo", "cor"];
            if (stringParams.includes(argName)) {
              const isQuoted = (argValue.startsWith("'") && argValue.endsWith("'")) || 
                               (argValue.startsWith('"') && argValue.endsWith('"')) ||
                               ((argValue.startsWith("f'") || argValue.startsWith("r'") || argValue.startsWith("b'")) && argValue.endsWith("'")) ||
                               ((argValue.startsWith('f"') || argValue.startsWith('r"') || argValue.startsWith('b"')) && argValue.endsWith('"'));
              const isBooleanOrNull = ["Verdadeiro", "Falso", "Nulo"].includes(argValue);
              const isNumeric = /^\d+(\.\d+)?$/.test(argValue) || /^0[xX][0-9a-fA-F]+$/.test(argValue);
              const isValidVariable = /^[a-zA-Z_][a-zA-Z0-9_\.\[\]\(\)]*$/.test(argValue);

              if (!isQuoted && !isBooleanOrNull && !isNumeric) {
                if (argValue.includes(" ") || !isValidVariable) {
                  errors.push(`Erro de Sintaxe (Linha ${lineNum}): O argumento '${argName}' em '${trimmed.match(discordMethodPattern)![1]}' parece ser um text sem aspas: '${argValue}'. Por favor, use aspas.`);
                }
              }
            }
          }
        }
      }

      for (const pyKey in pythonReplacements) {
        const pyDisp = pyKey.replace(/\\/g, "");
        const ptgWord = pythonReplacements[pyKey];
        let wordBoundRegex;
        if (pyKey.startsWith("@")) {
          wordBoundRegex = new RegExp(`${pyKey}\\b`);
        } else {
          wordBoundRegex = new RegExp(`\\b${pyKey}\\b`);
        }
        if (wordBoundRegex.test(cleanLine)) {
          warnings.push(`Aviso de Sintaxe (Linha ${lineNum}): Termo Python '${pyDisp}' encontrado. Substitua por '${ptgWord}'.`);
          const existing = detectedReplacements.find(r => r.py === pyDisp);
          if (existing) {
            if (!existing.lines.includes(lineNum)) {
              existing.lines.push(lineNum);
            }
          } else {
            detectedReplacements.push({ py: pyDisp, ptg: ptgWord, lines: [lineNum] });
          }
        }
      }

      if (trimmed.includes("@robo.comando") || trimmed.includes("@bot.comando")) {
        commandsCount++;
      }
    }

    if (!codeText.includes("importar portulong.discord_pt")) {
      warnings.push("Aviso de Dependência: Certifique-se de importar 'portulong.discord_pt' para registrar seu bot.");
    }
    if (!codeText.includes("Robo(") && !codeText.includes("Robo (") && !codeText.includes("Bot(") && !codeText.includes("Bot (")) {
      warnings.push("Aviso de Inicialização: Não foi encontrada a instância virtual 'Bot(prefixo=...)' ou 'Robo(prefixo=...)'.");
    }

    return {
      status: errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "success",
      errors,
      warnings,
      prefix,
      commandsCount,
      detectedReplacements
    };
  };

  const handleCompileAndTest = () => {
    addTerminalLog("info", "⚙️ [COMPILADOR] Iniciando testes estáticos do código .ptg...");
    
    setTimeout(() => {
      const result = testPortulongCode(code);
      
      if (result.errors.length > 0) {
        result.errors.forEach(err => {
          addTerminalLog("error", `❌ ${err}`);
        });
        addTerminalLog("error", `⚠️ Compilação falhou! Encontrado ${result.errors.length} erro(s).`);
      } else {
        if (result.warnings.length > 0) {
          result.warnings.forEach(warn => {
            addTerminalLog("warning", `⚠️ ${warn}`);
          });
        }
        addTerminalLog("success", `✅ Código compilado com sucesso! Nenhuma anomalia de sintaxe estrutural encontrada.`);
        addTerminalLog("info", `🤖 Robô Virtual: Inicializado com prefixo "${result.prefix}".`);
        addTerminalLog("info", `📊 Total de comandos registrados no escopo: ${result.commandsCount} comandos.`);
      }
      setCompilationStatus(result.status);
      setPythonWarnings(result.detectedReplacements);
    }, 300);
  };

  // Transpile portulong changes instantly
  useEffect(() => {
    try {
      const transpiled = transpilePortulong(code);
      setPythonEquivalent(transpiled);
    } catch (err) {
      console.error(err);
    }

    const testTimer = setTimeout(() => {
      const result = testPortulongCode(code);
      setCompilationStatus(result.status);
      setPythonWarnings(result.detectedReplacements);
    }, 400);

    return () => clearTimeout(testTimer);
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
      const matchPonto = textBeforeCaret.match(/(?:ctx|contexto)\.([\w_]*)$/i);

      if (matchPonto) {
        const word = matchPonto[1].toLowerCase();
        setActiveWord(word);

        // Filtra propriedades do contexto (ctx / contexto)
        const filtered = CONTEXT_PROPERTIES.filter(item =>
          item.key.startsWith(word) || item.displayName.toLowerCase().includes(word)
        );

        if (filtered.length > 0) {
          setSuggestions(filtered);
          setShowSuggestions(true);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
        }
      } else if (match) {
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
    const matchPonto = textBeforeCaret.match(/(?:ctx|contexto)\.([\w_]*)$/i);

    if (matchPonto) {
      const word = matchPonto[1].toLowerCase();
      setActiveWord(word);

      // Filtra propriedades do contexto (ctx / contexto)
      const filtered = CONTEXT_PROPERTIES.filter(item =>
        item.key.startsWith(word) || item.displayName.toLowerCase().includes(word)
      );

      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else if (match) {
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

  // Run or transpile simulator with AI & Deterministic interpreter
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

    // 1. Run compiler tests beforehand to see if there are syntax errors!
    const testResult = testPortulongCode(code);
    if (testResult.status === "error") {
      setTimeout(() => {
        setIsSimulatingResponse(false);
        addTerminalLog("error", `❌ Erro de Simulação bloqueado: corrija o Erro de Sintaxe no editor antes de executar.`);
        setDiscordMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: "Sistema de Compilação",
          avatarColor: "from-red-500 to-rose-600",
          timestamp: timeStr,
          content: `❌ [ERRO DE COMPILAÇÃO]: O seu bot não pôde processar este comando porque contém um Erro de Sintaxe no código do editor. Corrija o arquivo .ptg primeiro!`,
          isBot: true
        }]);
      }, 500);
      return;
    }

    // 2. Deterministic Client-side simulator check
    let commandHandled = false;
    const prefix = testResult.prefix;
    if (userMsg.startsWith(prefix)) {
      const commandName = userMsg.slice(prefix.length).split(" ")[0].trim();
      const commandArgs = userMsg.slice(prefix.length + commandName.length).trim().split(" ");

      // Let's search the Portulong code for this command:
      // We search for @robo.comando(nome="COMMAND_NAME") or similar
      const escapedCmdName = commandName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const cmdRegex = new RegExp(`@robo\\.comando\\s*\\(\\s*(?:nome\\s*=\\s*)?["']${escapedCmdName}["']\\s*\\)[\\s\\S]*?(?:definir|funcao|def)\\s+assincrono\\s+(\\w+)` , 'i');
      const hasCommand = code.match(cmdRegex);

      if (hasCommand) {
        commandHandled = true;
        addTerminalLog("info", `⚡ [SIMULADOR] Comando ${prefix}${commandName} interceptado com sucesso no editor de código!`);
        
        // Find inside body
        const matchIndex = code.indexOf(hasCommand[0]);
        const snippetFromCommand = code.slice(matchIndex);
        
        // Find template responses
        const sendRegex = /aguardar\s+contexto\s*\.\s*enviar\s*\(\s*(f?["'][\s\S]*?["']|[^)]*)\s*\)/;
        const sendMatch = snippetFromCommand.match(sendRegex);

        let botReply = "";
        let botEmbed: any = undefined;

        if (sendMatch) {
          let template = sendMatch[1];
          if (template.startsWith("f") && (template.includes('"') || template.includes("'"))) {
            const stripped = template.replace(/^f["']|["']$/g, '');
            botReply = stripped.replace(/\{contexto\.autor\.nome\}/g, "Mestre_Do_Portulong");
            
            if (commandArgs.length > 0 && commandArgs[0] !== "") {
              botReply = botReply.replace(/\{[^}]+\}/g, commandArgs.join(" "));
            } else {
              botReply = botReply.replace(/\{[^}]+\}/g, "membro");
            }
          } else {
            botReply = template.replace(/^["']|["']$/g, '');
          }
        } else {
          botReply = "Comando executado com sucesso!";
        }

        // Check if there's any Embed in the command block
        if (snippetFromCommand.match(/discord\s*\.\s*Embutido/) || snippetFromCommand.match(/Embutido/)) {
          let embedTitle = "Título Personalizado";
          let embedDesc = "Descrição do embed customizado.";
          
          const titleMatch = snippetFromCommand.match(/titulo\s*=\s*["']([^"']+)["']/i) || snippetFromCommand.match(/title\s*=\s*["']([^"']+)["']/i);
          if (titleMatch) embedTitle = titleMatch[1];
          
          const descMatch = snippetFromCommand.match(/descricao\s*=\s*["']([^"']+)["']/i) || snippetFromCommand.match(/description\s*=\s*["']([^"']+)["']/i);
          if (descMatch) embedDesc = descMatch[1];

          botEmbed = {
            title: embedTitle,
            description: embedDesc,
            color: "#10B981"
          };
          botReply = ""; 
        }

        setTimeout(() => {
          setIsSimulatingResponse(false);
          setDiscordMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: "PortulongBot",
            avatarColor: "from-green-500 to-emerald-600",
            timestamp: timeStr,
            content: botReply,
            isBot: true,
            embed: botEmbed
          }]);
          addTerminalLog("success", `[Robô] Enviou resposta no canal #${simulatedChannel}`);
        }, 600);
        return;
      }
    }

    if (commandHandled) return;

    // 3. Fallback to AI Simulator for conversational / complex checks
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

  // Convert English Python to Portulong deterministically
  const translatePythonToPortulong = () => {
    if (!inputPython.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      try {
        const translated = localTranslatePythonToPortulong(inputPython);
        setTranslatedPortulong(translated);
      } catch (err: any) {
        setTranslatedPortulong(`# Ocorreu um erro na tradução local: ${err.message}`);
      } finally {
        setIsTranslating(false);
      }
    }, 150);
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
    name="portulong.ptg",
    version="1.0.1",
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
name = "portulong.ptg"
version = "1.0.1"
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

## 🚀 Instalação e Configuração

Ficou incrivelmente simples instalar todo o ecossistema Portulong nativamente no seu terminal (eliminando comandos estilo \`curl\` externos)!

Siga os dois passos abaixo:

### 🔹 Passo 1: Instalar o compilador núcleo (via pip)
No terminal, execute:
\`\`\`bash
pip install portulong.ptg
\`\`\`

### 🔹 Passo 2: Instalar a extensão e recursos (via CLI Portulong)
Com o núcleo instalado, execute o novo instalador integrado que baixa extensões do VS Code, realces de cores, autocompletar e o botão Play nativo:
\`\`\`bash
portulong instalar
\`\`\`

---

#### 🔹 Atualizar o Compilador (Upgrade)
Caso já tenhas a linguagem e queiras atualizar para a versão mais recente (v1.0.71):
\`\`\`bash
pip install --upgrade portulong.ptg
\`\`\`

#### 🔹 Desinstalar o Compilador
Se desejares remover completamente o pacote do compilador do seu sistema:
\`\`\`bash
pip uninstall -y portulong.ptg
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
    "executar": "run",
    "rodar": "run",
    "conteudo": "content",
    "autor": "author",
    "canal": "channel",
    "servidor": "guild",
    "mensagem": "message",
    "usuario": "user",
    "id": "id",
    "VisualizacaoLayout": "LayoutView",
    "Recipiente": "Container",
    "ExibicaoTexto": "TextDisplay",
    "Secao": "Section",
    "Separador": "Separator",
    "Miniatura": "Thumbnail",
    "LinhaAcao": "ActionRow",
    "cor_destaque": "accent_color",
    "tempo_esgotado": "timeout",
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
        
    # Corrigir ordem de def async (português "definir assincrono") para "async def" exigido pelo Python
    processed = re.sub(r'\\bdef\\s+async\\b', 'async def', processed)
        
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
import functools
import inspect
import datetime

def unwrap_object(obj):
    return obj._obj if hasattr(obj, '_obj') else obj

def wrap_object(obj):
    if obj is None or hasattr(obj, '_obj'): return obj
    if isinstance(obj, discord.Embed): return Embutido(obj)
    if isinstance(obj, list):
        return [wrap_object(item) for item in obj]
    if isinstance(obj, tuple):
        return tuple(wrap_object(item) for item in obj)
    if isinstance(obj, dict):
        return {k: wrap_object(v) for k, v in obj.items()}
    if not isinstance(obj, (str, int, float, bool, set)):
        return ObjetoProxy(obj)
    return obj

class ObjetoProxy:
    def __init__(self, obj):
        super().__setattr__('_obj', obj)

    def __getattr__(self, name):
        tradutor_atributos = {
            'conteudo': 'content',
            'autor': 'author',
            'canal': 'channel',
            'nome': 'name',
            'id': 'id',
            'servidor': 'guild',
            'mensagem': 'message',
            'usuario': 'user',
            'membro': 'member',
            'apelido': 'display_name',
            'mencao': 'mention',
            'mencionar': 'mention',
            'membros': 'members',
            'cargos': 'roles',
            'canais': 'channels',
            'icone_url': 'icon',
            'criado_em': 'created_at',
            'entrou_em': 'joined_at',
            'cargo_topo': 'top_role',
            'cor': 'color',
            'descricao': 'description',
            'titulo': 'title',
            'campos': 'fields',
            'valor': 'value',
        }
        
        tradutor_metodos = {
            'enviar': 'send',
            'responder': 'reply',
            'deletar': 'delete',
            'limpar': 'purge',
            'adicionar_reacao': 'add_reaction',
            'remover_reacao': 'remove_reaction',
            'remover_todas_as_reacoes': 'clear_reactions',
            'banir': 'ban',
            'expulsar': 'kick',
            'castigar': 'timeout',
            'timeout': 'timeout',
            'remover_castigo': 'remove_timeout',
            'remover_timeout': 'remove_timeout',
            'adicionar_cargo': 'add_roles',
            'adicionar_cargos': 'add_roles',
            'remover_cargo': 'remove_roles',
            'remover_cargos': 'remove_roles',
            'editar': 'edit',
            'mover_para': 'move_to',
            'silenciar': 'mute',
            'desensurdecer': 'deafen',
        }

        real_name = tradutor_atributos.get(name) or tradutor_metodos.get(name, name)
        original_attr = getattr(self._obj, real_name)
        
        if callable(original_attr):
            @functools.wraps(original_attr)
            def metodo_empacotado(*args, **kwargs):
                tradutor_kwargs = {
                    'motivo': 'reason',
                    'nome': 'name',
                    'descricao': 'description',
                    'cor': 'color',
                    'titulo': 'title',
                    'apelido': 'nick',
                    'nick': 'nick',
                    'embutido': 'embed',
                    'embutidos': 'embeds',
                    'limite': 'limit',
                    'em_linha': 'inline',
                    'arquivo': 'file',
                    'arquivos': 'files',
                    'duracao': 'duration',
                    'visualizacao': 'view',
                    'view': 'view',
                }
                
                novas_kwargs = {}
                for k, v in kwargs.items():
                    novas_kwargs[tradutor_kwargs.get(k, k)] = unwrap_object(v)
                
                if real_name == 'timeout':
                    until_val = novas_kwargs.get('until') or (args[0] if args else None)
                    duracao_val = novas_kwargs.pop('duration', None)
                    
                    if duracao_val is not None:
                        if isinstance(duracao_val, (int, float)):
                            until_val = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=duracao_val)
                        elif isinstance(duracao_val, datetime.timedelta):
                            until_val = datetime.datetime.now(datetime.timezone.utc) + duracao_val
                        else:
                            until_val = duracao_val
                    
                    if until_val is not None:
                        novas_kwargs['until'] = until_val
                        args = args[1:] if args else ()
                
                args_desempacotados = [unwrap_object(arg) for arg in args]
                resultado = original_attr(*args_desempacotados, **novas_kwargs)
                
                if asyncio.iscoroutine(resultado):
                    async def wrapper_assincrono():
                        return wrap_object(await resultado)
                    return wrapper_assincrono()
                return wrap_object(resultado)
            return metodo_empacotado
        return wrap_object(original_attr)

    @property
    def mencao(self):
        return getattr(unwrap_object(self), 'mention', '')

    async def castigar(self, duracao, motivo=None):
        until = None
        if duracao is not None:
            if isinstance(duracao, (int, float)):
                until = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=duracao)
            elif isinstance(duracao, datetime.timedelta):
                until = datetime.datetime.now(datetime.timezone.utc) + duracao
            else:
                until = duracao
        obj_real = unwrap_object(self)
        if hasattr(obj_real, 'timeout'):
            return wrap_object(await obj_real.timeout(until, reason=motivo))
        elif hasattr(obj_real, 'edit'):
            return wrap_object(await obj_real.edit(timed_out_until=until, reason=motivo))

    async def remover_castigo(self, motivo=None):
        obj_real = unwrap_object(self)
        if hasattr(obj_real, 'timeout'):
            return wrap_object(await obj_real.timeout(None, reason=motivo))

    async def enviar(self, *args, **kwargs):
        tradutor_kwargs = {
            'embutido': 'embed',
            'embutidos': 'embeds',
            'arquivo': 'file',
            'arquivos': 'files',
            'visualizacao': 'view',
            'view': 'view',
        }
        novas_kwargs = {}
        for k, v in kwargs.items():
            novas_kwargs[tradutor_kwargs.get(k, k)] = unwrap_object(v)
            
        args_desempacotados = [unwrap_object(arg) for arg in args]
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.send(*args_desempacotados, **novas_kwargs))

    async def responder(self, *args, **kwargs):
        tradutor_kwargs = {
            'embutido': 'embed',
            'embutidos': 'embeds',
            'arquivo': 'file',
            'arquivos': 'files',
            'visualizacao': 'view',
            'view': 'view',
        }
        novas_kwargs = {}
        for k, v in kwargs.items():
            novas_kwargs[tradutor_kwargs.get(k, k)] = unwrap_object(v)
            
        args_desempacotados = [unwrap_object(arg) for arg in args]
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.reply(*args_desempacotados, **novas_kwargs))

    async def banir(self, motivo=None, apagar_mensagens_dias=0):
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.ban(reason=motivo, delete_message_days=apagar_mensagens_dias))

    async def expulsar(self, motivo=None):
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.kick(reason=motivo))

    async def adicionar_cargo(self, cargo, motivo=None):
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.add_roles(unwrap_object(cargo), reason=motivo))

    async def adicionar_cargos(self, *cargos, motivo=None):
        obj_real = unwrap_object(self)
        cargos_desempacotados = [unwrap_object(c) for c in cargos]
        return wrap_object(await obj_real.add_roles(*cargos_desempacotados, reason=motivo))

    async def remover_cargo(self, cargo, motivo=None):
        obj_real = unwrap_object(self)
        return wrap_object(await obj_real.remove_roles(unwrap_object(cargo), reason=motivo))

    async def remover_cargos(self, *cargos, motivo=None):
        obj_real = unwrap_object(self)
        cargos_desempacotados = [unwrap_object(c) for c in cargos]
        return wrap_object(await obj_real.remove_roles(*cargos_desempacotados, reason=motivo))

    async def editar(self, **kwargs):
        obj_real = unwrap_object(self)
        tradutor_kwargs = {
            'apelido': 'nick',
            'nome': 'name',
            'motivo': 'reason',
            'cargo_topo': 'top_role',
            'cor': 'color',
        }
        novas_kwargs = {}
        for k, v in kwargs.items():
            novas_kwargs[tradutor_kwargs.get(k, k)] = unwrap_object(v)
        return wrap_object(await obj_real.edit(**novas_kwargs))

    def __eq__(self, other):
        return unwrap_object(self) == unwrap_object(other)

    def __ne__(self, other):
        return unwrap_object(self) != unwrap_object(other)

    def __hash__(self):
        return hash(unwrap_object(self))

    def __str__(self):
        return str(unwrap_object(self))

    def __repr__(self):
        return repr(unwrap_object(self))

class ContextoPT(ObjetoProxy):
    def __init__(self, ctx):
        super().__init__(ctx)
        self.autor = wrap_object(ctx.author)
        self.canal = wrap_object(ctx.channel)
        self.servidor = wrap_object(ctx.guild)
        self.mensagem = wrap_object(ctx.message)

    async def enviar(self, *args, **kwargs):
        return await super().enviar(*args, **kwargs)

    async def responder(self, *args, **kwargs):
        return await super().responder(*args, **kwargs)

class IntencoesPT(discord.Intents):
    def __setattr__(self, name, value):
        tradutor = {
            'membros': 'members',
            'membro': 'members',
            'conteudo_mensagem': 'message_content',
            'conteudo_mensagens': 'message_content',
            'presencas': 'presences',
            'mensagens': 'messages',
            'reacoes': 'reactions',
            'digitando': 'typing',
            'servidores': 'guilds',
            'integracoes': 'integrations',
            'webhooks': 'webhooks',
            'convites': 'invites',
            'voz': 'voice_states',
            'moderacao': 'moderation',
            'banimentos': 'bans',
            'emojis': 'emojis_and_stickers',
        }
        real_name = tradutor.get(name, name)
        super().__setattr__(real_name, value)

    def __getattr__(self, name):
        tradutor = {
            'membros': 'members',
            'membro': 'members',
            'conteudo_mensagem': 'message_content',
            'conteudo_mensagens': 'message_content',
            'presencas': 'presences',
            'mensagens': 'messages',
            'reacoes': 'reactions',
            'digitando': 'typing',
            'servidores': 'guilds',
            'integracoes': 'integrations',
            'webhooks': 'webhooks',
            'convites': 'invites',
            'voz': 'voice_states',
            'moderacao': 'moderation',
            'banimentos': 'bans',
            'emojis': 'emojis_and_stickers',
        }
        real_name = tradutor.get(name, name)
        return getattr(self, real_name)

class Intencoes:
    @classmethod
    def default(cls):
        inst = discord.Intents.default()
        new_inst = IntencoesPT()
        for slot in discord.Intents.__slots__:
            setattr(new_inst, slot, getattr(inst, slot))
        return new_inst

    @classmethod
    def tudo(cls):
        inst = discord.Intents.all()
        new_inst = IntencoesPT()
        for slot in discord.Intents.__slots__:
            setattr(new_inst, slot, getattr(inst, slot))
        return new_inst

class Cor(discord.Color):
    @classmethod
    def azul(cls): return cls.blue()
    @classmethod
    def vermelho(cls): return cls.red()
    @classmethod
    def verde(cls): return cls.green()
    @classmethod
    def dourado(cls): return cls.gold()
    @classmethod
    def roxo(cls): return cls.purple()
    @classmethod
    def cinza(cls): return cls.light_gray()

class Embutido(discord.Embed):
    def __init__(self, *args, **kwargs):
        titulo = kwargs.pop('titulo', None) or kwargs.pop('title', None)
        descricao = kwargs.pop('descricao', None) or kwargs.pop('description', None)
        cor = kwargs.pop('cor', None) or kwargs.pop('color', None)
        
        if args:
            if len(args) >= 1: titulo = args[0]
            if len(args) >= 2: descricao = args[1]
            if len(args) >= 3: cor = args[2]
            
        c = cor if isinstance(cor, (discord.Color, int)) else None
        super().__init__(title=titulo, description=descricao, color=c, **kwargs)

    def adicionar_campo(self, *args, **kwargs):
        nome = kwargs.pop('nome', None) or kwargs.pop('name', None)
        valor = kwargs.pop('valor', None) or kwargs.pop('value', None)
        em_linha = kwargs.pop('em_linha', None) if 'em_linha' in kwargs else kwargs.pop('inline', True)
        
        if args:
            if len(args) >= 1: nome = args[0]
            if len(args) >= 2: valor = args[1]
            if len(args) >= 3: em_linha = args[2]
            
        self.add_field(name=nome, value=valor, inline=em_linha)
        return self

    def definir_autor(self, *args, **kwargs):
        nome = kwargs.pop('nome', None) or kwargs.pop('name', None)
        icone_url = kwargs.pop('icone_url', None) or kwargs.pop('icon_url', None)
        
        if args:
            if len(args) >= 1: nome = args[0]
            if len(args) >= 2: icone_url = args[1]
            
        self.set_author(name=nome, icon_url=icone_url)
        return self

    def definir_imagem(self, url):
        self.set_image(url=url)
        return self

    def definir_miniatura(self, url):
        self.set_thumbnail(url=url)
        return self

    def definir_rodape(self, texto, icone_url=None):
        self.set_footer(text=texto, icon_url=icone_url)
        return self

class Arquivo(discord.File):
    def __init__(self, fp, nome=None, *args, **kwargs):
        filename = nome or kwargs.pop('nome', None) or kwargs.pop('filename', None)
        super().__init__(fp=fp, filename=filename, *args, **kwargs)

class ComandoPT(commands.Command):
    async def invoke(self, ctx):
        ctx_pt = ContextoPT(ctx)
        if ctx.args:
            args_lista = list(ctx.args)
            args_lista[0] = ctx_pt
            ctx.args = tuple([args_lista[0]] + [wrap_object(arg) for arg in args_lista[1:]])
        if ctx.kwargs:
            ctx.kwargs = {k: wrap_object(v) for k, v in ctx.kwargs.items()}
        
        await super().invoke(ctx)

class Robo(commands.Bot):
    def __init__(self, prefixo=None, intents=None, *args, **kwargs):
        pref = prefixo or kwargs.pop('prefixo', None) or kwargs.pop('command_prefix', None)
        intt = intents or kwargs.pop('intents', None) or kwargs.pop('intencoes', None)
        super().__init__(command_prefix=pref, intents=intt, *args, **kwargs)

    async def get_context(self, message, *, cls=None):
        return await super().get_context(message, cls=cls or ContextoPT)

    def comando(self, *args_cmd, **kwargs_cmd):
        if 'nome' in kwargs_cmd: kwargs_cmd['name'] = kwargs_cmd.pop('nome')
        if 'ajuda' in kwargs_cmd: kwargs_cmd['help'] = kwargs_cmd.pop('ajuda')
        
        def decorador(func):
            cmd = ComandoPT(func, name=kwargs_cmd.get('name', func.__name__), *args_cmd, **kwargs_cmd)
            self.add_command(cmd)
            return func
        return decorador

    command = comando

    def evento(self, func):
        mapeamento = {
            'ao_iniciar': 'on_ready',
            'ao_mensagem': 'on_message',
            'ao_pronto': 'on_ready',
            'ao_entrar_membro': 'on_member_join',
            'ao_sair_membro': 'on_member_remove',
            'ao_reacao_adicionada': 'on_reaction_add',
            'ao_reacao_removida': 'on_reaction_remove',
        }
        name = func.__name__
        mapped_name = mapeamento.get(name, name)
        
        @functools.wraps(func)
        async def event_wrapper(*args, **kwargs):
            args_pt = [wrap_object(arg) for arg in args]
            kwargs_pt = {k: wrap_object(v) for k, v in kwargs.items()}
            return await func(*args_pt, **kwargs_pt)
            
        event_wrapper.__name__ = mapped_name
        return super().event(event_wrapper)

    event = evento

    def executar(self, token):
        self.run(token)

class Botao(discord.ui.Button):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        id_personalizado = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        estilo = kwargs.pop('estilo', None) or kwargs.pop('style', None)
        desativado = kwargs.pop('desativado', None) or kwargs.pop('disabled', False)
        emoji = kwargs.pop('emoji', None)
        url = kwargs.pop('url', None)
        
        if args:
            if len(args) >= 1: rotulo = args[0]
            if len(args) >= 2: estilo = args[1]
            if len(args) >= 3: id_personalizado = args[2]
            
        estilo_real = discord.ButtonStyle.secondary
        if estilo is not None:
            if isinstance(estilo, discord.ButtonStyle):
                estilo_real = estilo
            else:
                mapa_estilos = {
                    'azul': discord.ButtonStyle.primary,
                    'principal': discord.ButtonStyle.primary,
                    'cinza': discord.ButtonStyle.secondary,
                    'secundario': discord.ButtonStyle.secondary,
                    'verde': discord.ButtonStyle.success,
                    'sucesso': discord.ButtonStyle.success,
                    'vermelho': discord.ButtonStyle.danger,
                    'perigo': discord.ButtonStyle.danger,
                    'link': discord.ButtonStyle.link,
                }
                estilo_real = mapa_estilos.get(str(estilo).lower(), discord.ButtonStyle.secondary)
                
        super().__init__(
            label=rotulo,
            custom_id=id_personalizado,
            style=estilo_real,
            disabled=desativado,
            emoji=emoji,
            url=url,
            **kwargs
        )

class OpcaoSelecao(discord.SelectOption):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        valor = kwargs.pop('valor', None) or kwargs.pop('value', None)
        descricao = kwargs.pop('descricao', None) or kwargs.pop('description', None)
        emoji = kwargs.pop('emoji', None)
        padrao = kwargs.pop('padrao', None) or kwargs.pop('default', False)
        
        if args:
            if len(args) >= 1: rotulo = args[0]
            if len(args) >= 2: valor = args[1]
            if len(args) >= 3: descricao = args[2]
            
        super().__init__(
            label=rotulo,
            value=valor,
            description=descricao,
            emoji=emoji,
            default=padrao,
            **kwargs
        )

class Selecao(discord.ui.Select):
    def __init__(self, *args, **kwargs):
        marcador = kwargs.pop('texto_marcador', None) or kwargs.pop('marcador', None) or kwargs.pop('placeholder', None)
        min_val = kwargs.pop('minimo_valores', None) or kwargs.pop('min_valores', None) or kwargs.pop('min_values', 1)
        max_val = kwargs.pop('maximo_valores', None) or kwargs.pop('max_valores', None) or kwargs.pop('max_values', 1)
        opcoes = kwargs.pop('opcoes', None) or kwargs.pop('options', None) or []
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        desativado = kwargs.pop('desativado', None) or kwargs.pop('disabled', False)
        
        opcoes_reais = []
        for opt in opcoes:
            if isinstance(opt, discord.SelectOption):
                opcoes_reais.append(opt)
            elif isinstance(opt, dict):
                opcoes_reais.append(discord.SelectOption(
                    label=opt.get('rotulo') or opt.get('texto') or opt.get('label'),
                    value=opt.get('valor') or opt.get('value'),
                    description=opt.get('descricao') or opt.get('description'),
                    emoji=opt.get('emoji'),
                    default=opt.get('padrao') or opt.get('default', False)
                ))
            elif isinstance(opt, tuple) and len(opt) >= 2:
                desc = opt[2] if len(opt) > 2 else None
                opcoes_reais.append(discord.SelectOption(label=opt[0], value=opt[1], description=desc))
                
        super().__init__(
            placeholder=marcador,
            min_values=min_val,
            max_values=max_val,
            options=opcoes_reais,
            custom_id=id_pers,
            disabled=desativado,
            **kwargs
        )

class CaixaTexto(discord.ui.TextInput):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        estilo = kwargs.pop('estilo', None) or kwargs.pop('style', None)
        marcador = kwargs.pop('marcador', None) or kwargs.pop('texto_marcador', None) or kwargs.pop('placeholder', None)
        padrao = kwargs.pop('padrao', None) or kwargs.pop('valor_padrao', None) or kwargs.pop('default', None)
        obrigatorio = kwargs.pop('obrigatorio', None) or kwargs.pop('required', True)
        min_comp = kwargs.pop('comprimento_minimo', None) or kwargs.pop('min_comp', None) or kwargs.pop('min_length', None)
        max_comp = kwargs.pop('comprimento_maximo', None) or kwargs.pop('max_comp', None) or kwargs.pop('max_length', None)
        
        if args:
            if len(args) >= 1: rotulo = args[0]
            if len(args) >= 2: id_pers = args[1]
            
        estilo_real = discord.TextStyle.short
        if estilo is not None:
            if isinstance(estilo, discord.TextStyle):
                estilo_real = estilo
            else:
                mapa_estilo = {
                    'curto': discord.TextStyle.short,
                    'pequeno': discord.TextStyle.short,
                    'longo': discord.TextStyle.long,
                    'paragrafo': discord.TextStyle.long,
                    'grande': discord.TextStyle.long,
                }
                estilo_real = mapa_estilo.get(str(estilo).lower(), discord.TextStyle.short)
                
        super().__init__(
            label=rotulo,
            custom_id=id_pers,
            style=estilo_real,
            placeholder=marcador,
            default=padrao,
            required=obrigatorio,
            min_length=min_comp,
            max_length=max_comp,
            **kwargs
        )

class ModalPT(discord.ui.Modal):
    def __init__(self, *args, **kwargs):
        titulo = kwargs.pop('titulo', None) or kwargs.pop('title', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        
        if args:
            if len(args) >= 1: titulo = args[0]
            
        super().__init__(title=titulo, custom_id=id_pers, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

    async def on_submit(self, interaction: discord.Interaction):
        if hasattr(self, 'ao_submeter'):
            interacao_pt = ObjetoProxy(interaction)
            await self.ao_submeter(interacao_pt)
        else:
            await super().on_submit(interaction)

class Visualizacao(discord.ui.View):
    def __init__(self, *args, **kwargs):
        timeout = kwargs.pop('tempo_esgotado', None) or kwargs.pop('timeout', 180)
        super().__init__(timeout=timeout, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

    def remover_item(self, item):
        self.remove_item(unwrap_object(item))
        return self

    async def on_timeout(self):
        if hasattr(self, 'ao_esgotar_tempo'):
            await self.ao_esgotar_tempo()
        else:
            await super().on_timeout()

# ==========================================
# NOVOS COMPONENTES V2 (LAYOUTS & CONTAINERS)
# ==========================================
class ExibicaoTexto(discord.ui.TextDisplay):
    def __init__(self, texto, *args, **kwargs):
        super().__init__(texto, *args, **kwargs)

class Secao(discord.ui.Section):
    def __init__(self, texto, *args, **kwargs):
        acessorio = kwargs.pop('acessorio', None) or kwargs.pop('accessory', None)
        if acessorio is not None: 
            kwargs['accessory'] = unwrap_object(acessorio)
        super().__init__(texto, *args, **kwargs)

class Recipiente(discord.ui.Container):
    def __init__(self, *args, **kwargs):
        cor = kwargs.pop('cor_destaque', None) or kwargs.pop('accent_color', None)
        if cor is not None: kwargs['accent_color'] = cor
        super().__init__(*args, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

class VisualizacaoLayout(discord.ui.LayoutView):
    def __init__(self, *args, **kwargs):
        timeout = kwargs.pop('tempo_esgotado', None) or kwargs.pop('timeout', 180)
        super().__init__(timeout=timeout, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

class Separador(discord.ui.Separator):
    def __init__(self, *args, **kwargs):
        # Removemos qualquer tentativa de passar a palavra "linha" ou "divider"
        kwargs.pop('linha', None)
        kwargs.pop('divider', None)
        
        # Chamamos o motor original limpo!
        super().__init__(*args, **kwargs)

class Miniatura(discord.ui.Thumbnail):
    def __init__(self, url=None, *args, **kwargs):
        # Capturamos a URL quer ela venha com nome ou não
        u = url or kwargs.pop('url', None)
        
        try:
            # Estratégia 1: Tentar injetar de forma posicional, sem o nome "url="
            super().__init__(u, *args, **kwargs)
        except TypeError:
            # Estratégia 2: Se o motor V2 bloquear, nós criamos o objeto limpo 
            # e forçamos a propriedade url diretamente nas veias do objeto!
            super().__init__(*args, **kwargs)
            self.url = u

class LinhaAcao(discord.ui.ActionRow):
    def __init__(self, *args, **kwargs):
        super().__init__(*[unwrap_object(a) for a in args], **kwargs)




class UIWrapper:
    def __init__(self):
        self.Botao = Botao; self.Selecao = Selecao; self.OpcaoSelecao = OpcaoSelecao
        self.CaixaTexto = CaixaTexto; self.Modal = ModalPT; self.ModalPT = ModalPT
        self.Visualizacao = Visualizacao


        # --- ADICIONA ESTAS 4 LINHAS ---
        self.VisualizacaoLayout = VisualizacaoLayout
        self.Recipiente = Recipiente
        self.ExibicaoTexto = ExibicaoTexto
        self.Secao = Secao
        self.Separador = Separador
        self.Miniatura = Miniatura
        self.LinhaAcao = LinhaAcao
        # -------------------------------
        
        self.botao = self._botao_decorator; self.button = self._botao_decorator
        self.selecao = self._selecao_decorator; self.select = self._selecao_decorator

    def _botao_decorator(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('label', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('custom_id', None)
        estilo = kwargs.pop('estilo', None) or kwargs.pop('style', None)
        desativado = kwargs.pop('desativado', None) if 'desativado' in kwargs else kwargs.pop('disabled', False)
        emoji = kwargs.pop('emoji', None); url = kwargs.pop('url', None)
        
        estilo_real = discord.ButtonStyle.secondary
        if estilo is not None:
            mapa_estilos = {
                'azul': discord.ButtonStyle.primary, 'principal': discord.ButtonStyle.primary,
                'cinza': discord.ButtonStyle.secondary, 'secundario': discord.ButtonStyle.secondary,
                'verde': discord.ButtonStyle.success, 'sucesso': discord.ButtonStyle.success,
                'vermelho': discord.ButtonStyle.danger, 'perigo': discord.ButtonStyle.danger,
                'link': discord.ButtonStyle.link,
            }
            estilo_real = mapa_estilos.get(str(estilo).lower(), discord.ButtonStyle.secondary)
        
        argumentos = {'style': estilo_real, 'disabled': desativado}
        if rotulo is not None: argumentos['label'] = rotulo
        if emoji is not None: argumentos['emoji'] = emoji
        if url is not None: argumentos['url'] = url
        if id_pers is not None: argumentos['custom_id'] = id_pers
        return discord.ui.button(*args, **argumentos, **kwargs)

    def _selecao_decorator(self, *args, **kwargs):
        marcador = kwargs.pop('marcador', None) or kwargs.pop('placeholder', None)
        min_val = kwargs.pop('minimo_valores', None) or kwargs.pop('min_values', 1)
        max_val = kwargs.pop('maximo_valores', None) or kwargs.pop('max_values', 1)
        opcoes = kwargs.pop('opcoes', None) or kwargs.pop('options', [])
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('custom_id', None)
        desativado = kwargs.pop('desativado', None) if 'desativado' in kwargs else kwargs.pop('disabled', False)
        
        opcoes_reais = [opt._obj if hasattr(opt, '_obj') else opt for opt in opcoes]
        argumentos = {'min_values': min_val, 'max_values': max_val, 'disabled': desativado}
        if marcador is not None: argumentos['placeholder'] = marcador
        if id_pers is not None: argumentos['custom_id'] = id_pers
        if opcoes_reais: argumentos['options'] = opcoes_reais
        return discord.ui.select(*args, **argumentos, **kwargs)

    def __getattr__(self, name): return getattr(discord.ui, name)

ui = UIWrapper()

Membro = discord.Member
Usuario = discord.User
CanalTexto = discord.TextChannel
CanalVoz = discord.VoiceChannel
Cargo = discord.Role
Mensagem = discord.Message
Servidor = discord.Guild

Embed = Embutido
Color = Cor
Intents = Intencoes
File = Arquivo

class CommandsWrapper:
    def __init__(self):
        from discord.ext import commands as _real_commands
        self._real_commands = _real_commands
        self.Robo = Robo
        self.Bot = Robo

    def __getattr__(self, name):
        return getattr(self._real_commands, name)

commands = CommandsWrapper()

def __getattr__(name):
    aliases = {
        'Robo': Robo,
        'Bot': Robo,
        'Embutido': Embutido,
        'Embed': Embutido,
        'Cor': Cor,
        'Color': Cor,
        'Intencoes': Intencoes,
        'Intents': Intencoes,
        'Arquivo': Arquivo,
        'File': Arquivo,
        'ui': ui,
        'commands': commands,
        'Membro': Membro,
        'Usuario': Usuario,
        'CanalTexto': CanalTexto,
        'CanalVoz': CanalVoz,
        'Cargo': Cargo,
        'Mensagem': Mensagem,
        'Servidor': Servidor,
    }
    if name in aliases:
        return aliases[name]
    return getattr(discord, name)

Bot = Robo
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
  "version": "1.0.71",
  "publisher": "silvio-blip",
  "icon": "portulong.png",
  "homepage": "${currentOrigin}/",
  "repository": {
    "type": "git",
    "url": "https://github.com/silvio-blip/portulong"
  },
  "engines": {
    "vscode": "^1.60.0"
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
        "title": "Executar Portulong",
        "icon": "\\$(play)"
      }
    ],
    "menus": {
      "editor/title/run": [
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
      "include": "#definitions"
    },
    {
      "include": "#decorators"
    },
    {
      "include": "#keywords"
    },
    {
      "include": "#operators"
    },
    {
      "include": "#constants"
    },
    {
      "include": "#builtin-functions"
    },
    {
      "include": "#discord"
    },
    {
      "include": "#function-calls"
    },
    {
      "include": "#properties"
    }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.line.number-sign.portulong",
          "match": r"#.*$"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.triple.double.portulong",
          "begin": '"""',
          "end": '"""',
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\\\."
            }
          ]
        },
        {
          "name": "string.quoted.triple.single.portulong",
          "begin": "'''",
          "end": "'''",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\\\."
            }
          ]
        },
        {
          "name": "string.quoted.double.portulong",
          "begin": '"',
          "end": '"',
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": r"\\\\."
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
              "match": r"\\\\."
            }
          ]
        }
      ]
    },
    "definitions": {
      "patterns": [
        {
          "name": "meta.function.portulong",
          "match": r"\\b(funcao|definir)\\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "storage.type.function.portulong" },
            "2": { "name": "entity.name.function.portulong" }
          }
        },
        {
          "name": "meta.class.portulong",
          "match": r"\\b(classe)\\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "storage.type.class.portulong" },
            "2": { "name": "entity.name.type.class.portulong" }
          }
        }
      ]
    },
    "decorators": {
      "patterns": [
        {
          "name": "meta.function.decorator.portulong",
          "match": r"(@)([a-zA-Z_][a-zA-Z0-9_.]*)",
          "captures": {
            "1": { "name": "punctuation.definition.decorator.portulong" },
            "2": { "name": "entity.name.function.decorator.portulong" }
          }
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.import.portulong",
          "match": r"\\b(importar|de|como)\\b"
        },
        {
          "name": "keyword.control.conditional.portulong",
          "match": r"\\b(se|senao|senaose)\\b"
        },
        {
          "name": "keyword.control.repeat.portulong",
          "match": r"\\b(para|enquanto)\\b"
        },
        {
          "name": "keyword.control.flow.portulong",
          "match": r"\\b(retornar|parar|continuar|passar)\\b"
        },
        {
          "name": "keyword.control.exception.portulong",
          "match": r"\\b(tentar|exceto|finalmente|levantar)\\b"
        },
        {
          "name": "keyword.control.async.portulong",
          "match": r"\\b(assincrono|aguardar)\\b"
        },
        {
          "name": "keyword.control.portulong",
          "match": r"\\b(com|lambda|global|naolocal|produzir|asseverar)\\b"
        },
        {
          "name": "keyword.operator.logical.portulong",
          "match": r"\\b(e|ou|nao|em|eh|nao_eh)\\b"
        },
        {
          "name": "variable.language.special.self.portulong",
          "match": r"\\b(self|contexto)\\b"
        }
      ]
    },
    "operators": {
      "patterns": [
        {
          "name": "keyword.operator.portulong",
          "match": r"\\+|-|\\*|/|//|%|=|==|!=|<|>|<=|>=|\\+=|-="
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "name": "constant.numeric.portulong",
          "match": r"\\b([0-9]+(\\.[0-9]+)?)\\b"
        },
        {
          "name": "constant.language.portulong",
          "match": r"\\b(verdadeiro|falso|nulo|Verdadeiro|Falso|Nulo)\\b"
        }
      ]
    },
    "builtin-functions": {
      "patterns": [
        {
          "name": "support.function.builtin.portulong",
          "match": r"\\b(escrever|mostrar|ler|tamanho|inteiro|texto|real|decimal|boleano|lista|dicionario|conjunto|tupla|intervalo|abrir|tipo|somar|absoluto|maximo|minimo|arredondar|mapear|filtrar|ordenado|super|propriedade|zipar|enumerar|objeto|qualquer|todos|ajuda|identidade|reversivel|formatar|obter_atributo|definir_atributo|tem_atributo|excluir_atributo|representacao|proximo|iterador|eh_instancia|eh_subclasse)\\b"
        },
        {
          "name": "support.type.exception.portulong",
          "match": r"\\b(Excessao|ErroDeValor|ErroDeTipo|ErroDeNome|ErroDeIndice|ErroDeChave|ErroDeImportacao|ErroDeAtributo|ErroDivisaoPorZero|FaltaDeMemoria|ParadaDeIteracao|ErroDoSistema|ArquivoNaoEncontrado|InterrupcaoPeloTeclado|ErroDeAsseveracao|ErroDeExecucao|ErroNaoImplementado)\\b"
        }
      ]
    },
    "discord": {
      "patterns": [
        {
          "name": "support.class.discord.portulong",
          "match": r"\\b(Robo|discord|Intencoes|Membro|Canal|Servidor|Mensagem)\\b"
        },
        {
          "name": "support.function.discord.portulong",
          "match": r"\\b(prefixo|evento|comando|nome|ajuda|enviar|responder|deletar|adicionar_reacao|remover_reacao|expulsar|banir|limpar|conteudo|autor|canal|servidor|mensagem|usuario|id)\\b"
        }
      ]
    },
    "function-calls": {
      "patterns": [
        {
          "name": "meta.function-call.portulong",
          "match": r"\\b([a-zA-Z_][a-zA-Z0-9_]*)\\s*(?=\\()"
        }
      ]
    },
    "properties": {
      "patterns": [
        {
          "name": "variable.other.property.portulong",
          "match": r"(?<=\\.)[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }
      ]
    }
  }
}

extension_js = """const vscode = require('vscode');

function obterTextoSemStringsEComentarios(documento) {
    let texto = documento.getText();
    texto = texto.replace(/\"\"\"[\\\\s\\\\S]*?\"\"\"|'\\'\\'[\\\\s\\\\S]*?'\\'\\'/g, match => {
        return " ".repeat(match.length);
    });
    
    const linhas = texto.split(/\\\\r?\\\\n/);
    const linhasLimpas = linhas.map(linha => {
        let terminalClean = "";
        let insideString = false;
        let charString = null;
        let escorregou = false;
        
        for (let i = 0; i < linha.length; i++) {
            const c = linha[i];
            
            if (escorregou) {
                terminalClean += " ";
                escorregou = false;
                continue;
            }
            
            if (c === '\\\\\\\\') {
                terminalClean += " ";
                escorregou = true;
                continue;
            }
            
            if (insideString) {
                if (c === charString) {
                    insideString = false;
                }
                terminalClean += " ";
            } else {
                if (c === '#' && !insideString) {
                    terminalClean += " ".repeat(linha.length - i);
                    break;
                } else if (c === '"' || c === "'") {
                    insideString = true;
                    charString = c;
                    terminalClean += " ";
                } else {
                    terminalClean += c;
                }
            }
        }
        return terminalClean;
    });
    
    return linhasLimpas;
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
            "Excessao", "ErroDeValor", "ErroDeTipo", "ErroDeNome", "ErroDeIndice", "ErroDeChave",
            "ErroDeImportacao", "ErroDeAtributo", "ErroDivisaoPorZero", "FaltaDeMemoria", "ParadaDeIteracao",
            "ErroDoSistema", "ArquivoNaoEncontrado", "InterrupcaoPeloTeclado", "ErroDeAsseveracao",
            "ErroDeExecucao", "ErroNaoImplementado",
            "Robo", "Bot", "Intencoes", "Membro", "Canal", "Servidor", "Mensagem",
            "Cor", "Embutido", "Modal", "ModalPT", "CaixaTexto", "Botao", "Selecao", "Visualizacao", "OpcaoSelecao",
            "VisualizacaoLayout", "Recipiente", "ExibicaoTexto", "Secao", "Separador", "Miniatura", "LinhaAcao", "cor_destaque", "tempo_esgotado",
            "prefixo", "evento", "comando", "nome", "ajuda", "enviar", "responder", "deletar",
            "adicionar_reacao", "remover_reacao", "expulsar", "banir", "limpar", "conteudo",
            "autor", "canal", "servidor", "mensagem", "usuario", "id", "canal_sistema", "permissoes",
            "expulsar_membros", "gerenciar_mensagens",
            "adicionar_campo", "definir_autor", "definir_imagem", "definir_miniatura", "definir_rodape", "limpar_campos",
            "os", "sys", "re", "json", "math", "random", "time", "datetime", "discord", "commands", "intents", "asyncio"
        ]);
        
        const localDecls = new Set();
        
        linhasLimpas.forEach(linha => {
            const matchFuncao = linha.match(/\\\\b(?:funcao|definir)\\\\s+(?:assincrono\\\\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchFuncao) {
                localDecls.add(matchFuncao[1]);
            }
            
            const matchClasse = linha.match(/\\\\bclasse\\\\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (matchClasse) {
                localDecls.add(matchClasse[1]);
            }
            
            const matchAtribuicao = linha.match(/^[ \\\\t]*([a-zA-Z_][a-zA-Z0-9_]*(?:\\\\s*,\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\\\\s*=/);
            if (matchAtribuicao) {
                const variaveis = matchAtribuicao[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
            
            const matchPara = linha.match(/\\\\bpara\\\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\\\s*,\\\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\\\\s+em\\\\b/);
            if (matchPara) {
                const variaveis = matchPara[1].split(",");
                variaveis.forEach(v => localDecls.add(v.trim()));
            }
        
            const matchParams = linha.match(/\\\\b(?:funcao|definir)\\\\s+(?:assincrono\\\\s+)?[a-zA-Z_][a-zA-Z0-9_]*\\\\s*\\\\(([^)]*)\\\\)/);
            if (matchParams) {
                const paramsRaw = matchParams[1].split(",");
                paramsRaw.forEach(p => {
                    const pNome = p.trim().split(/\\\\s*:/)[0].split(/\\\\s*=/)[0].trim();
                    if (pNome && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pNome)) {
                        localDecls.add(pNome);
                    }
                });
            }
            
            const matchDeImportar = linha.match(/\\\\bde\\\\s+[a-zA-Z0-9_.]+\\\\s+importar\\\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\\\s*,\\\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchDeImportar) {
                const nomes = matchDeImportar[1].split(",");
                nomes.forEach(n => localDecls.add(n.trim()));
            }
            
            const matchImportar = linha.match(/\\\\bimportar\\\\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\\\\s*,\\\\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/);
            if (matchImportar) {
                const partes = matchImportar[1].split(",");
                partes.forEach(p => {
                    const pTrim = p.trim();
                    if (pTrim.includes(" como ")) {
                        const alias = pTrim.split(" como ")[1].trim();
                        localDecls.add(alias);
                    } else {
                        localDecls.add(pTrim);
                    }
                });
            }
        });
        
        linhasLimpas.forEach((linha, indiceLinha) => {
            const wordRegex = /\\\\b[a-zA-Z_][a-zA-Z0-9_]*\\\\b/g;
            let match;
            
            while ((match = wordRegex.exec(linha)) !== null) {
                const palavra = match[0];
                const indiceInicio = match.index;
                
                if (palavra.length <= 1) {
                    continue;
                }
                
                const textoAntes = linha.substring(0, indiceInicio);
                if (/\\\\.\\\\s*$/.test(textoAntes)) {
                    continue;
                }
                
                if (/@\\\\s*$/.test(textoAntes)) {
                    continue;
                }
                
                if (/^\\\\d+$/.test(palavra)) {
                    continue;
                }
                
                const textoDepois = CustomSubstring = linha.substring(indiceInicio + palavra.length);
                if (/^\\\\s*=(?!=)/.test(textoDepois)) {
                    continue;
                }
                if (/^\\\\s*['"]/.test(textoDepois)) {
                    continue;
                }
                
                if (!keywords.has(palavra) && !localDecls.has(palavra)) {
                    const range = new vscode.Range(
                        new vscode.Position(indiceLinha, indiceInicio),
                        new vscode.Position(indiceLinha, indiceInicio + palavra.length)
                    );
                    
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        "Sintaxe inválida: A palavra '" + palavra + "' não é uma palavra-chave integrada e não está definida no escopo local do Portulong.",
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

function activate(context) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('portulong');
    context.subscriptions.push(diagnosticsCollection);

    if (vscode.window.activeTextEditor) {
        atualizarDiagnosticos(vscode.window.activeTextEditor.document, diagnosticsCollection);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                atualizarDiagnosticos(editor.document, diagnosticsCollection);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            atualizarDiagnosticos(event.document, diagnosticsCollection);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument(doc => {
            diagnosticsCollection.delete(doc.uri);
        })
    );

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
            
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong');
            }
            
            terminal.show();
            // AQUI ESTÁ A MAGIA CORRIGIDA!
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
            success("Portulong instalado com sucesso via pip (pacote 'portulong.ptg')!")
        except Exception as e:
            warn(f"Não foi possível instalar o pacote 'portulong.ptg' automaticamente do PyPI: {e}")
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

    # Mover instalador e desinstalador para dentro da pasta portulong-vscode para manter a raiz limpa
    try:
        script_atual = os.path.abspath(sys.argv[0])
        script_basename = os.path.basename(script_atual)
        
        # Copia instalar.py (script atual) para dentro de ext_dir
        if os.path.exists(script_atual) and script_basename.endswith(".py"):
            shutil.copy(script_atual, os.path.join(ext_dir, "instalar.py"))
            info(f"Cópia do instalador salva com sucesso em '{ext_dir}/instalar.py'!")
            
        # Copia desinstalar.py para dentro de ext_dir
        # Procura tanto no diretório atual quanto no mesmo diretório do script atual
        des_orig = "desinstalar.py"
        if not os.path.exists(des_orig):
            parent_dir = os.path.dirname(script_atual)
            possible_des = os.path.join(parent_dir, "desinstalar.py")
            if os.path.exists(possible_des):
                des_orig = possible_des
                
        if os.path.exists(des_orig):
            shutil.copy(des_orig, os.path.join(ext_dir, "desinstalar.py"))
            info(f"Cópia do desinstalador salva com sucesso em '{ext_dir}/desinstalar.py'!")
    except Exception as e_copy:
        warn(f"Aviso ao organizar arquivos de suporte na pasta da extensão: {e_copy}")

    # Remove os arquivos externos (de fora) para manter a raiz totalmente limpa
    try:
        # Se copiou com sucesso para dentro, tenta apagar o de fora
        inside_instador = os.path.join(ext_dir, "instalar.py")
        if os.path.exists(inside_instador) and os.path.getsize(inside_instador) > 0:
            script_atual = os.path.abspath(sys.argv[0])
            # Garante que não estamos tentando deletar o arquivo de dentro da pasta portulong-vscode!
            if os.path.exists(script_atual) and "portulong-vscode" not in script_atual:
                os.remove(script_atual)
                success("Arquivo de instalação externo ('instalar.py' de fora) removido com sucesso para manter os seus diretórios perfeitamente limpos!")
                
        # Tenta apagar o desinstalar.py externo se copiado
        inside_desinstalador = os.path.join(ext_dir, "desinstalar.py")
        if os.path.exists(inside_desinstalador) and os.path.getsize(inside_desinstalador) > 0:
            des_orig = "desinstalar.py"
            if os.path.exists(des_orig) and os.path.abspath(des_orig) != os.path.abspath(inside_desinstalador):
                os.remove(des_orig)
                success("Arquivo de desinstalação externo ('desinstalar.py' de fora) removido com sucesso!")
    except Exception as e_del:
        warn(f"Durante a limpeza dos arquivos externos temporários: {e_del}")

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
        warn(f"Erro ao desinstalar 'portulong.ptg' pelo pip: {e}")

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
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ext_dir = "portulong-vscode"
    is_inside_ext = False
    
    # Se estamos sendo executados de dentro do diretório "portulong-vscode"
    if os.path.basename(script_dir) == "portulong-vscode":
        ext_dir = script_dir
        is_inside_ext = True

    if os.path.exists(ext_dir):
        try:
            if is_inside_ext:
                # Remove todos os arquivos exceto desinstalar.py (que está rodando) e instalar.py (pode estar na fila ou rodando de alguma forma)
                for item in os.listdir(ext_dir):
                    item_path = os.path.join(ext_dir, item)
                    if item in ["desinstalar.py", "instalar.py"]:
                        continue
                    try:
                        if os.path.isdir(item_path):
                            shutil.rmtree(item_path)
                        else:
                            os.remove(item_path)
                    except Exception:
                        pass
                success("Ficheiros de sintaxe e VSIX removidos da pasta 'portulong-vscode'!")
                info("Nota: Como o script está rodando por dentro dela, a pasta ficou vazia.")
                info("Você pode deletar a pasta 'portulong-vscode' vazia manualmente quando o terminal fechar.")
            else:
                shutil.rmtree(ext_dir)
                success(f"Diretório temporário '{ext_dir}' apagado com absoluto êxito!")
        except Exception as e:
            warn(f"Durante a eliminação da pasta '{ext_dir}': {e}")
            
    # Remove qualquer vsix gerado na raiz se rodado externamente
    try:
        curr_files = os.listdir(".")
        for fn in curr_files:
            if fn.endswith(".vsix") and "portulong" in fn:
                try:
                    os.remove(fn)
                    success(f"Instalador empacotado '{fn}' destruído com sucesso!")
                except Exception:
                    pass
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
      version: "1.0.71",
      publisher: "silvio-blip",
      icon: "portulong.png",
      homepage: currentOrigin + "/",
      repository: {
        type: "git",
        url: "https://github.com/silvio-blip/portulong"
      },
      engines: {
        vscode: "^1.60.0"
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
          title: "Executar Portulong",
          icon: "$(play)"
        }],
        menus: {
          "editor/title/run": [{
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
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong');
            }
            terminal.show();
            // AQUI ESTÁ A MAGIA CORRIGIDA!
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
                v1.0.71
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

        {/* 💻 TAB CONTENT: IDE & PORTULONG ENVIRONMENT GUIDE */}
        {activeTab === "ide" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT AREA: Editor & Selector */}
            <div className={`${ideLayout === "detailed" ? "col-span-1 lg:col-span-12" : "col-span-1 lg:col-span-12 xl:col-span-7"} flex flex-col gap-4`}>
              
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
                      id="toggle-layout-btn"
                      onClick={() => setIdeLayout(ideLayout === "compact" ? "detailed" : "compact")}
                      title={ideLayout === "compact" ? "Expandir para tela cheia" : "Retornar para layout compacto"}
                      className={`p-1.5 px-2.5 text-[11px] rounded flex items-center gap-1 transition-all font-mono select-none cursor-pointer border ${
                        ideLayout === "detailed"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-inner"
                          : "text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/40"
                      }`}
                    >
                      {ideLayout === "compact" ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                      {ideLayout === "compact" ? "Expandir IDE" : "Compactar IDE"}
                    </button>

                    <button
                      id="reset-code-btn"
                      onClick={() => {
                        const original = TEMPLATES.find(t => t.id === activePreset);
                        if (original) setCode(original.code);
                      }}
                      title="Resetar arquivo ao padrão"
                      className="p-1 px-2.5 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 border border-slate-800 rounded flex items-center gap-1 transition-all cursor-pointer font-mono"
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
                      className="absolute inset-0 p-4 text-slate-300 font-mono text-xs leading-5 whitespace-pre pointer-events-none select-none overflow-hidden border-0 m-0 bg-transparent font-medium"
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
                              key={`${item.key}-${index}`}
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

                {pythonWarnings.length > 0 && (
                  <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-amber-300 font-mono gap-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                      <span>
                        <strong>{pythonWarnings.length} termo(s) em Python detectado(s):</strong>{" "}
                        {pythonWarnings.map(w => `'${w.py}' (linha ${w.lines.join(", ")})`).join(", ")}. Esqueceu de traduzir?
                      </span>
                    </div>
                    <button
                      id="autoconvert-python-btn"
                      onClick={() => {
                        try {
                          const corrected = localTranslatePythonToPortulong(code);
                          setCode(corrected);
                          addTerminalLog("success", "✨ [AUTOCORRETOR] Termos Python detectados foram traduzidos para Portulong com sucesso!");
                        } catch (e: any) {
                          addTerminalLog("error", `❌ Falha ao aplicar autocorreção: ${e.message}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded flex items-center gap-1 transition-all text-[11px] cursor-pointer shadow border border-amber-400/20 shrink-0"
                    >
                      <Sparkles size={11} className="fill-current" /> Auto-corrigir todos
                    </button>
                  </div>
                )}

                <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-4">
                    <span>Portulong - Baseado em Python</span>
                    <span className="text-slate-700">|</span>
                    <span>Linhas: {code.split("\n").length}</span>
                    <span className="text-slate-700">|</span>
                    <div className="flex items-center gap-1.5 font-sans font-semibold">
                      <span className={`w-2 h-2 rounded-full ${compilationStatus === "success" ? "bg-emerald-500 animate-pulse" : compilationStatus === "warning" ? "bg-yellow-500" : "bg-red-500"}`} />
                      <span className="text-[10px] text-slate-300">
                        Sintaxe: {compilationStatus === "success" ? "OK • Sem Erros" : compilationStatus === "warning" ? "Avisos Detectados" : "Erro de Sintaxe"}
                      </span>
                    </div>
                  </div>
                  <button
                    id="trigger-compile-test-btn"
                    onClick={handleCompileAndTest}
                    className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-md hover:text-emerald-300 flex items-center gap-1 transition-all text-[11px] font-black font-mono shadow-sm"
                  >
                    <Play size={10} className="fill-current text-emerald-400" />
                    TESTAR COMPILAÇÃO
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT AREA: Guia de Instalação e Configuração de Ambiente Portulong 🐉 */}
            <div className={`${ideLayout === "detailed" ? "col-span-1 lg:col-span-12 mt-6" : "col-span-1 lg:col-span-12 xl:col-span-12 xl:col-span-5"} flex flex-col gap-6`}>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
                {/* Header do Guia */}
                <div className="bg-slate-950/50 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                      <Laptop size={16} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Guia de Instalação</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Configure seu computador para rodar Portulong nativamente</span>
                    </div>
                  </div>
                </div>

                {/* Abas do Menu de Instalação */}
                <div className="bg-slate-950/20 border-b border-slate-800/50 p-2 flex flex-wrap gap-1">
                  <button
                    onClick={() => setInstallTab("auto")}
                    className={`flex-1 min-w-[80px] text-center py-2 px-1 text-[11px] font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      installTab === "auto"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    📦 Automático
                  </button>
                  <button
                    onClick={() => setInstallTab("vscode")}
                    className={`flex-1 min-w-[80px] text-center py-2 px-1 text-[11px] font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      installTab === "vscode"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    🎨 VS Code (Cores)
                  </button>
                  <button
                    onClick={() => setInstallTab("pip")}
                    className={`flex-1 min-w-[80px] text-center py-2 px-1 text-[11px] font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      installTab === "pip"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    🧱 Via Pip (Manual)
                  </button>
                  <button
                    onClick={() => setInstallTab("files")}
                    className={`flex-1 min-w-[80px] text-center py-2 px-1 text-[11px] font-bold font-mono rounded-lg transition-all cursor-pointer ${
                      installTab === "files"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    📂 Descarregar
                  </button>
                </div>

                {/* Conteúdo das Abas com Animação */}
                <div className="p-5 flex-1 flex flex-col gap-4 bg-slate-950/10 text-slate-300 text-xs leading-relaxed">
                  <AnimatePresence mode="wait">
                    {installTab === "auto" && (
                      <motion.div
                        key="auto"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-4 font-sans"
                      >
                        <p>
                          A partir da <strong>versão 1.0.71</strong>, obter o ecossistema completo do Portulong ficou extremamente rápido e integrado. Eliminamos comandos complexos estilo <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-medium">curl</code> externos! Siga estes dois passos simples:
                        </p>
                        
                        <div className="flex flex-col gap-3">
                          {/* Passo 1 - pip */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">🔹 Passo 1: Instale o compilador núcleo (via PIP)</span>
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-slate-300 relative group flex items-center justify-between gap-3 text-[11px]">
                              <span className="select-all break-all">pip install portulong.ptg</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText("pip install portulong.ptg");
                                  setCopiedCommand("pip-cmd");
                                  setTimeout(() => setCopiedCommand(null), 2000);
                                }}
                                className={`p-1.5 rounded transition-all cursor-pointer shrink-0 ${copiedCommand === "pip-cmd" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 group-hover:text-slate-300 hover:bg-slate-800"}`}
                                title="Copiar Comando"
                              >
                                {copiedCommand === "pip-cmd" ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* Passo 2 - portulong instalar */}
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">🔹 Passo 2: Configure os recursos nativos (via CLI)</span>
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-slate-300 relative group flex items-center justify-between gap-3 text-[11px]">
                              <span className="select-all break-all">portulong instalar</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText("portulong instalar");
                                  setCopiedCommand("install-cmd");
                                  setTimeout(() => setCopiedCommand(null), 2000);
                                }}
                                className={`p-1.5 rounded transition-all cursor-pointer shrink-0 ${copiedCommand === "install-cmd" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 group-hover:text-slate-300 hover:bg-slate-800"}`}
                                title="Copiar Comando"
                              >
                                {copiedCommand === "install-cmd" ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg mt-1 flex gap-2 items-start">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                          <p className="text-[11px] text-slate-400 leading-normal">
                            <strong>O que essa CLI faz?</strong> Ela executa consultas seguras para obter as extensões VS Code originais, destaques de cores do editor, ícones de dragões exclusivos e atalhos globais de compilação automaticamente para você!
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {installTab === "vscode" && (
                      <motion.div
                        key="vscode"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-4 font-sans"
                      >
                        <p>
                          A extensão oficial traz realce visual profissional com as cores corretas para seus ficheiros <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-medium">.ptg</code>, suporte a autocompletar e o botão de Play/Executar de 1 clique integrado!
                        </p>
                        
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 flex items-center justify-center shrink-0 font-mono text-xs">1</span>
                            <div>
                              <h4 className="font-bold text-slate-200">Descarregue o Arquivo Extensão VSIX</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">Faça download em um clique do ficheiro <code className="text-slate-300 font-mono">portulong-vscode-1.0.71.vsix</code> no menu "Descarregar" ao lado.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 flex items-center justify-center shrink-0 font-mono text-xs">2</span>
                            <div>
                              <h4 className="font-bold text-slate-200">Instale Manualmente no VS Code</h4>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                Abra o Visual Studio Code, vá até a aba de Extensões (<code className="text-emerald-400 font-mono">Ctrl+Shift+X</code>), clique nos três pontinhos (<code className="bg-slate-950 px-1 py-0.5 font-mono text-slate-300 rounded font-medium">...</code>) no cabeçalho do painel esquerdo e selecione <strong>"Instalar a partir de VSIX..."</strong>. Selecione o arquivo baixado.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 flex items-center justify-center shrink-0 font-mono text-xs">3</span>
                            <div>
                              <h4 className="font-bold text-slate-200">Aproveite os Recursos Completos!</h4>
                              <ul className="list-disc pl-4 mt-1 text-[11px] text-slate-400 flex flex-col gap-1 leading-normal">
                                <li>✨ <strong>Destaque de sintaxe nativo</strong> colorindo seu código em tempo real.</li>
                                <li>🏷️ <strong>Ícones de dragão customizados</strong> para seus arquivos de código.</li>
                                <li>▶️ Botão de <strong>Play Inteligente</strong> no topo do editor para executar seu robô instantaneamente!</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {installTab === "pip" && (
                      <motion.div
                        key="pip"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-4 font-sans"
                      >
                        <p>
                          Se você prefere instalar e rodar os programas por linha de comando sem as extensões ou scripts automáticos, basta registrar diretamente do servidor de pacotes oficiais do Python usando o gerenciador de pacotes <code className="text-emerald-400 font-mono">pip</code>:
                        </p>
                        
                        <div className="flex flex-col gap-1.5 mt-2">
                          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Registrar via PIP:</span>
                          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-slate-300 relative group flex items-center justify-between gap-3 text-[11px]">
                            <span>pip install portulong.ptg</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText("pip install portulong.ptg");
                                setCopiedCommand("pip");
                                setTimeout(() => setCopiedCommand(null), 2000);
                              }}
                              className={`p-1.5 rounded transition-all cursor-pointer ${copiedCommand === "pip" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 group-hover:text-slate-300 hover:bg-slate-800"}`}
                              title="Copiar Comando"
                            >
                              {copiedCommand === "pip" ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-2">
                          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Como compilar arquivos:</span>
                          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-slate-400 text-[11px] leading-relaxed">
                            <span className="text-emerald-400 font-mono">portulong meu_bot.ptg</span>
                            <p className="mt-2 text-slate-500 font-sans leading-normal">
                              Isso transpilará o arquivo Portulong e gerará um script executável em Python temporário no seu terminal.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {installTab === "files" && (
                      <motion.div
                        key="files"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col gap-4 font-sans"
                      >
                        <p>
                          Faça download manual de qualquer arquivo da nossa suíte oficial de recursos diretamente do servidor para testar no computador:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-1.5">
                          <a
                            href="/instalar.py"
                            download="instalar.py"
                            className="p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/30 rounded-xl flex flex-col gap-1.5 transition-all text-left text-slate-200"
                          >
                            <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-emerald-400">
                              <FileCode size={14} />
                              instalar.py
                            </div>
                            <span className="text-[10px] text-slate-400 leading-normal font-sans">Script inteligente de instalação de dependências e caminhos.</span>
                          </a>

                          <a
                            href="/desinstalar.py"
                            download="desinstalar.py"
                            className="p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-rose-500/30 rounded-xl flex flex-col gap-1.5 transition-all text-left text-slate-200"
                          >
                            <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-rose-400">
                              <FileCode size={14} />
                              desinstalar.py
                            </div>
                            <span className="text-[10px] text-slate-400 leading-normal font-sans">Remoção limpa dos caminhos e chaves do editor.</span>
                          </a>

                          <a
                            href="/portulong-vscode-1.0.71.vsix"
                            download="portulong-vscode-1.0.71.vsix"
                            className="p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-sky-500/30 rounded-xl flex flex-col gap-1.5 transition-all text-left text-slate-200 col-span-2"
                          >
                            <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-sky-400">
                              <Laptop size={14} />
                              portulong-vscode-1.0.71.vsix
                            </div>
                            <span className="text-[10px] text-slate-400 leading-normal font-sans">Pacote empacotado da Extensão Oficial de realce, realce de cores e de ícones para o editor VS Code.</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                Tem algum comando ou bot já pronto em Python que você achou na internet? Cole o código original do Discord.py aqui embaixo e clique em traduzir. Nosso motor de transpilação determinístico e matemático fará a tradução 100% precisa das palavras-chave para Portulong sem o uso de IA!
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
                    Traduzindo Deterministicamente via Tokens...
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
                <div key={`${item.portulong}-${item.category}`} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between group transition-all">
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

            {/* 🖥️ NOVO: PAINEL DE CONTROLE DE COMANDOS DO SISTEMA (Gerencie via Terminal) */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-black font-mono tracking-widest uppercase text-slate-300 flex items-center gap-1.5">
                  <Terminal size={14} className="text-indigo-400" />
                  Gerenciamento Direto via Terminal (Comandos PyPI & Extensão)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                  Execute estes comandos no terminal da sua máquina para ter controle total sobre a linguagem no seu sistema operacional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
                {/* Instalar Pacote */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-black font-mono tracking-wider text-emerald-400 uppercase">Instalar Linguagem</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
                      Cria o compilador e ambiente local de execução da linguagem Portulong.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-emerald-400 select-all flex items-center justify-between shadow-inner">
                    <span>pip install portulong.ptg</span>
                  </div>
                </div>

                {/* Atualizar / Upgrade */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-black font-mono tracking-wider text-amber-400 uppercase">Atualizar Linguagem</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
                      Atualiza o interpretador local para receber correções e novas palavras-chave.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-amber-300 select-all flex items-center justify-between shadow-inner">
                    <span>pip install --upgrade portulong.ptg</span>
                  </div>
                </div>

                {/* Desinstalar Compilador */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-black font-mono tracking-wider text-rose-500 uppercase">Desinstalar Pacote</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
                      Remove o compilador e limpa as referências de comandos do pip.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-rose-400 select-all flex items-center justify-between shadow-inner">
                    <span>pip uninstall -y portulong.ptg</span>
                  </div>
                </div>

                {/* Remover Extensão e Ambiente */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-[10px] font-black font-mono tracking-wider text-purple-400 uppercase">Remover Tudo</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal font-medium">
                      Desinstala a Extensão VS Code, arquivos locais e remove o pacote de uma só vez.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-purple-300 select-all flex items-center justify-between shadow-inner">
                    <span>python desinstalar.py</span>
                  </div>
                </div>
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
                        <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">portulong.ptg</code>
                        <span className="text-[10px] text-slate-500 block mt-1">(O nome exato do seu pacote registrado no PyPI)</span>
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

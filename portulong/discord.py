"""
Módulo Discord para Portulong (100% Português de Portugal)
Traduz e encapsula a biblioteca discord.py para sintaxe nativa Portulong.
Permite criar bots com comandos por prefixo, comandos de barra (slash commands),
eventos e mensagens incorporadas (embeds).
"""

import sys
import asyncio

# Tenta carregar discord.py real se estiver instalado no ambiente
try:
    import discord
    from discord.ext import commands as discord_commands
    from discord import app_commands
    TEM_DISCORD_LIB = True
except ImportError:
    TEM_DISCORD_LIB = False

class Incorporado:
    """Mensagem incorporada (Embed) 100% em Português."""
    def __init__(self, titulo="", descricao="", cor=0x5865F2):
        self.titulo = titulo
        self.descricao = descricao
        if isinstance(cor, str):
            cor = int(cor.lstrip("#"), 16) if cor.startswith("#") else 0x5865F2
        self.cor = cor
        self.campos = []
        self.rodape = None
        self.imagem = None
        self.miniatura = None
        self.autor_dados = None

    def adicionar_campo(self, nome, valor, em_linha=True):
        """Adiciona um campo ao embed."""
        self.campos.append({"nome": nome, "valor": valor, "inline": em_linha})
        return self

    def definir_rodape(self, texto, icone=None):
        """Define o rodapé da mensagem incorporada."""
        self.rodape = {"text": texto, "icon_url": icone}
        return self

    def definir_imagem(self, url):
        """Define a imagem principal do embed."""
        self.imagem = url
        return self

    def definir_miniatura(self, url):
        """Define a miniatura (thumbnail) do embed."""
        self.miniatura = url
        return self

    def definir_autor(self, nome, icone=None):
        """Define o autor do embed."""
        self.autor_dados = {"name": nome, "icon_url": icone}
        return self

    def para_discord_embed(self):
        """Converte para objeto discord.Embed nativo do discord.py."""
        if not TEM_DISCORD_LIB:
            return self
        emb = discord.Embed(title=self.titulo, description=self.descricao, color=self.cor)
        for c in self.campos:
            emb.add_field(name=c["nome"], value=c["valor"], inline=c["inline"])
        if self.rodape:
            emb.set_footer(**self.rodape)
        if self.imagem:
            emb.set_image(url=self.imagem)
        if self.miniatura:
            emb.set_thumbnail(url=self.miniatura)
        if self.autor_dados:
            emb.set_author(**self.autor_dados)
        return emb


class ContextoPortulong:
    """Contexto de execução de comando traduzido para Português."""
    def __init__(self, ctx_nativo=None):
        self._ctx = ctx_nativo
        if ctx_nativo:
            self.autor = UtilizadorPortulong(ctx_nativo.author)
            self.canal = CanalPortulong(ctx_nativo.channel)
            self.servidor = ServidorPortulong(ctx_nativo.guild) if ctx_nativo.guild else None
            self.mensagem = MensagemPortulong(ctx_nativo.message)
        else:
            self.autor = UtilizadorPortulong(None)
            self.canal = CanalPortulong(None)
            self.servidor = None
            self.mensagem = None

    async def responder_async(self, conteudo="", incorporado=None):
        emb = incorporado.para_discord_embed() if isinstance(incorporado, Incorporado) else incorporado
        if self._ctx:
            if hasattr(self._ctx, "reply"):
                return await self._ctx.reply(conteudo, embed=emb)
            elif hasattr(self._ctx, "response"):
                return await self._ctx.response.send_message(conteudo, embed=emb)
        print(f"[Discord Resposta] {conteudo}")

    async def enviar_async(self, conteudo="", incorporado=None):
        emb = incorporado.para_discord_embed() if isinstance(incorporado, Incorporado) else incorporado
        if self._ctx and hasattr(self._ctx, "send"):
            return await self._ctx.send(conteudo, embed=emb)
        print(f"[Discord Envio] {conteudo}")

    def responder(self, conteudo="", incorporado=None):
        """Responde ao comando (Síncrono/Assíncrono transparente em Portulong)."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return asyncio.create_task(self.responder_async(conteudo, incorporado))
            return loop.run_until_complete(self.responder_async(conteudo, incorporado))
        except Exception:
            print(f"[Discord Resposta] {conteudo}")

    def enviar(self, conteudo="", incorporado=None):
        """Envia mensagem no canal do comando."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return asyncio.create_task(self.enviar_async(conteudo, incorporado))
            return loop.run_until_complete(self.enviar_async(conteudo, incorporado))
        except Exception:
            print(f"[Discord Envio] {conteudo}")


class UtilizadorPortulong:
    def __init__(self, autor_nativo):
        self._autor = autor_nativo
        self.nome = getattr(autor_nativo, "name", "Utilizador")
        self.id = getattr(autor_nativo, "id", 0)
        self.mencao = getattr(autor_nativo, "mention", f"@{self.nome}")
        self.bot = getattr(autor_nativo, "bot", False)

    def __str__(self):
        return self.nome


class CanalPortulong:
    def __init__(self, canal_nativo):
        self._canal = canal_nativo
        self.nome = getattr(canal_nativo, "name", "geral")
        self.id = getattr(canal_nativo, "id", 0)

    def enviar(self, conteudo="", incorporado=None):
        emb = incorporado.para_discord_embed() if isinstance(incorporado, Incorporado) else incorporado
        if self._canal and hasattr(self._canal, "send"):
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    return asyncio.create_task(self._canal.send(conteudo, embed=emb))
                return loop.run_until_complete(self._canal.send(conteudo, embed=emb))
            except Exception:
                pass
        print(f"[{self.nome}] {conteudo}")


class ServidorPortulong:
    def __init__(self, guild_nativo):
        self._guild = guild_nativo
        self.nome = getattr(guild_nativo, "name", "Servidor")
        self.id = getattr(guild_nativo, "id", 0)
        self.membros = getattr(guild_nativo, "member_count", 0)


class MensagemPortulong:
    def __init__(self, msg_nativa):
        self._msg = msg_nativa
        self.conteudo = getattr(msg_nativa, "content", "")
        self.autor = UtilizadorPortulong(getattr(msg_nativa, "author", None))
        self.canal = CanalPortulong(getattr(msg_nativa, "channel", None))

    def responder(self, conteudo):
        if self._msg and hasattr(self._msg, "reply"):
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    return asyncio.create_task(self._msg.reply(conteudo))
                return loop.run_until_complete(self._msg.reply(conteudo))
            except Exception:
                pass
        print(f"[Resposta Mensagem] {conteudo}")


class BotDiscord:
    """Bot Discord 100% em Português de Portugal."""
    def __init__(self, prefixo="!", descricao="Bot criado em Portulong"):
        self.prefixo = prefixo
        self.descricao = descricao
        self.comandos_registados = {}
        self.comandos_barra_registados = {}
        self.eventos_registados = {}
        self.utilizador = None

        if TEM_DISCORD_LIB:
            intents = discord.Intents.default()
            intents.message_content = True
            intents.members = True
            self._bot = discord_commands.Bot(command_prefix=prefixo, description=descricao, intents=intents)
            self._configurar_eventos_nativos()
        else:
            self._bot = None

    def _configurar_eventos_nativos(self):
        if not self._bot:
            return

        @self._bot.event
        async def on_ready():
            self.utilizador = UtilizadorPortulong(self._bot.user)
            print(f"🤖 Bot Portulong conectado como: {self._bot.user.name} ({self._bot.user.id})")
            if "quando_pronto" in self.eventos_registados:
                fn = self.eventos_registados["quando_pronto"]
                if asyncio.iscoroutinefunction(fn):
                    await fn()
                else:
                    fn()

            # Sincronizar comandos de barra
            try:
                sinc = await self._bot.tree.sync()
                if sinc:
                    print(f"⚡ {len(sinc)} comandos de barra sincronizados!")
            except Exception as e:
                pass

        @self._bot.event
        async def on_message(message):
            if message.author.bot:
                return
            if "ao_receber_mensagem" in self.eventos_registados:
                msg_pt = MensagemPortulong(message)
                fn = self.eventos_registados["ao_receber_mensagem"]
                if asyncio.iscoroutinefunction(fn):
                    await fn(msg_pt)
                else:
                    fn(msg_pt)
            await self._bot.process_commands(message)

    def comando(self, nome=None, descricao=None):
        """Decorador para registar um comando por prefixo (ex: !ola)."""
        def decorador(funcao):
            cmd_nome = nome or funcao.__name__
            self.comandos_registados[cmd_nome] = funcao

            if self._bot:
                @self._bot.command(name=cmd_nome, help=descricao or "")
                async def comando_envolvido(ctx, *args):
                    ctx_pt = ContextoPortulong(ctx)
                    if asyncio.iscoroutinefunction(funcao):
                        await funcao(ctx_pt, *args)
                    else:
                        funcao(ctx_pt, *args)

            return funcao
        return decorador

    def comando_barra(self, nome, descricao="Comando em Portulong"):
        """Decorador para registar um Slash Command (comando de barra /nome)."""
        def decorador(funcao):
            self.comandos_barra_registados[nome] = funcao

            if self._bot:
                @self._bot.tree.command(name=nome, description=descricao)
                async def slash_envolvido(interacao: discord.Interaction):
                    ctx_pt = ContextoPortulong(interacao)
                    if asyncio.iscoroutinefunction(funcao):
                        await funcao(ctx_pt)
                    else:
                        funcao(ctx_pt)

            return funcao
        return decorador

    def quando_pronto(self, funcao):
        """Evento executado quando o bot se conecta com sucesso."""
        self.eventos_registados["quando_pronto"] = funcao
        return funcao

    def ao_receber_mensagem(self, funcao):
        """Evento executado quando o bot recebe uma nova mensagem."""
        self.eventos_registados["ao_receber_mensagem"] = funcao
        return funcao

    def iniciar(self, token):
        """Inicia a conexão do bot com o token fornecido."""
        if not token:
            print("❌ Erro: Token do Discord não foi fornecido.")
            return

        if TEM_DISCORD_LIB and self._bot:
            print(f"🚀 A ligar Bot Discord com o prefixo '{self.prefixo}' ...")
            try:
                self._bot.run(token)
            except Exception as e:
                print(f"❌ Erro ao iniciar Bot Discord: {e}")
        else:
            print("⚠️ AVISO: A biblioteca 'discord.py' ainda não está instalada no seu sistema.")
            print("👉 Para conectar ao servidor real do Discord, instale com:")
            print("   pip install discord.py")
            print(f"🤖 [Modo Simulado Portulong] Bot configurado com prefixo '{self.prefixo}'.")
            print(f"📌 {len(self.comandos_registados)} comandos por prefixo registados.")
            print(f"📌 {len(self.comandos_barra_registados)} comandos de barra registados.")


def CriarBot(prefixo="!", descricao="Bot criado em Portulong"):
    """Função utilitária em português para criar instância do bot."""
    return BotDiscord(prefixo=prefixo, descricao=descricao)

def instalar():
    """Instala discord.py automaticamente com um comando."""
    from .instalador import instalar_discord
    return instalar_discord()

# Aliases em português
Bot = BotDiscord
Embed = Incorporado
Contexto = ContextoPortulong
instalar_discord = instalar
Instalar = instalar

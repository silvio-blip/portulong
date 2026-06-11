"""
Wrapper em português de Portugal para a biblioteca discord.py (Portulong Discord).
Desenvolvido por uma arquitetura orientada a herança e delegação robusta.
"""

import discord
from discord.ext import commands
import asyncio
import functools
from datetime import timedelta

class ObjetoProxy:
    """
    Proxy genérico que intercepta chamadas de métodos e propriedades
    e as traduz do português para as APIs originais em inglês.
    """
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
            'canal_sistema': 'system_channel',
            'permissoes': 'permissions',
            'expulsar_membros': 'kick_members',
            'gerenciar_mensagens': 'manage_messages',
        }
        real_name = tradutor_atributos.get(name, name)
        original_attr = getattr(self._obj, real_name)
        
        if callable(original_attr):
            tradutor_metodos = {
                'enviar': 'send',
                'responder': 'reply',
                'deletar': 'delete',
                'adicionar_reacao': 'add_reaction',
                'remover_reacao': 'remove_reaction',
                'expulsar': 'kick',
                'banir': 'ban',
                'limpar': 'purge',
                'purgar': 'purge',
            }
            real_method_name = tradutor_metodos.get(name, name)
            original_method = getattr(self._obj, real_method_name)
            
            @functools.wraps(original_attr)
            def metodo_empacotado(*args, **kwargs):
                if 'nome' in kwargs:
                    kwargs['name'] = kwargs.pop('nome')
                if 'excluir_depois' in kwargs:
                    kwargs['delete_after'] = kwargs.pop('excluir_depois')
                if 'limite' in kwargs:
                    kwargs['limit'] = kwargs.pop('limite')
                if 'motivo' in kwargs:
                    kwargs['reason'] = kwargs.pop('motivo')
                if 'embutido' in kwargs:
                    kwargs['embed'] = kwargs.pop('embutido')
                
                args_desempacotados = [unwrap_object(arg) for arg in args]
                kwargs_desempacotados = {k: unwrap_object(v) for k, v in kwargs.items()}
                
                resultado = original_method(*args_desempacotados, **kwargs_desempacotados)
                
                if asyncio.iscoroutine(resultado):
                    async def wrapper_assincrono():
                        return wrap_object(await resultado)
                    return wrapper_assincrono()
                    
                return wrap_object(resultado)
            return metodo_empacotado
            
        return wrap_object(original_attr)

    def __setattr__(self, name, value):
        tradutor_atributos = {
            'conteudo': 'content',
        }
        real_name = tradutor_atributos.get(name, name)
        val = unwrap_object(value)
        setattr(self._obj, real_name, val)

    def __str__(self):
        return str(self._obj)

    def __repr__(self):
        return repr(self._obj)

    def __eq__(self, other):
        return unwrap_object(self) == unwrap_object(other)

# --- 1. UTILITÁRIOS E BASE ---

class Intencoes:
    """Wrapper em português para as Intents do Discord."""
    def __init__(self, original_intents=None):
        self._obj = original_intents or discord.Intents.default()

    @classmethod
    def todas_as_intencoes(cls):
        return cls(discord.Intents.all())

    @classmethod
    def padrao(cls):
        return cls(discord.Intents.default())

    @property
    def todas(self):
        self._obj = discord.Intents.all()
        return self

    def __getattr__(self, name):
        return getattr(self._obj, name)

    def __setattr__(self, name, value):
        if name == '_obj':
            super().__setattr__(name, value)
        else:
            setattr(self._obj, name, value)


class Cor(discord.Color):
    """Representa cores em português para embutidos e cargos."""
    @classmethod
    def azul(cls): return cls.blue()
    @classmethod
    def vermelho(cls): return cls.red()
    @classmethod
    def verde(cls): return cls.green()
    @classmethod
    def ouro(cls): return cls.gold()
    @classmethod
    def laranja(cls): return cls.orange()
    @classmethod
    def roxo(cls): return cls.purple()
    @classmethod
    def cinza(cls): return cls.grey()
    @classmethod
    def preto(cls): return cls.dark_theme()
    @classmethod
    def branco(cls): return cls.from_rgb(255, 255, 255)


class Embutido(discord.Embed):
    """Wrapper para Embeds do Discord em português."""
    def __init__(self, titulo=None, descricao=None, cor=None, *args, **kwargs):
        color_val = cor
        if isinstance(cor, Cor):
            color_val = cor
        elif isinstance(cor, int):
            color_val = discord.Color(cor)
        super().__init__(title=titulo, description=descricao, color=color_val, *args, **kwargs)

    def adicionar_campo(self, nome, valor, em_linha=True):
        self.add_field(name=nome, value=valor, inline=em_linha)
        return self

    def definir_rodape(self, texto, icone_url=None):
        self.set_footer(text=texto, icon_url=icone_url)
        return self

    def definir_autor(self, nome, url=None, icone_url=None):
        self.set_author(name=nome, url=url, icon_url=icone_url)
        return self

    def definir_imagem(self, url):
        self.set_image(url=url)
        return self

    def definir_miniatura(self, url):
        self.set_thumbnail(url=url)
        return self


# --- 2. CARGOS ---

class Cargo:
    """Wrapper para Cargo (Role) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def cor(self):
        return wrap_object(self._obj.color)

    @property
    def id(self):
        return self._obj.id

    async def editar(self, *args, **kwargs):
        if 'nome' in kwargs:
            kwargs['name'] = kwargs.pop('nome')
        if 'cor' in kwargs:
            kwargs['color'] = unwrap_object(kwargs.pop('cor'))
        await self._obj.edit(*args, **kwargs)

    async def deletar(self, *args, **kwargs):
        await self._obj.delete(*args, **kwargs)


# --- 3. ENTIDADES DE UTILIZADOR ---

class Usuario:
    """Wrapper para Usuário (User) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def id(self):
        return self._obj.id

    @property
    def avatar_url(self):
        return self._obj.display_avatar.url if self._obj.display_avatar else None

    async def enviar(self, *args, **kwargs):
        if 'embutido' in kwargs:
            kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        res = await self._obj.send(*args, **kwargs)
        return wrap_object(res)


class Membro:
    """Wrapper para Membro (Member) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def id(self):
        return self._obj.id

    @property
    def status(self):
        return str(self._obj.status)

    @property
    def atividade(self):
        return self._obj.activity

    @property
    def cargos(self):
        return [wrap_object(c) for c in self._obj.roles]

    async def expulsar(self, *args, **kwargs):
        if 'motivo' in kwargs:
            kwargs['reason'] = kwargs.pop('motivo')
        await self._obj.kick(*args, **kwargs)

    async def banir(self, *args, **kwargs):
        if 'motivo' in kwargs:
            kwargs['reason'] = kwargs.pop('motivo')
        await self._obj.ban(*args, **kwargs)

    async def desbanir(self, *args, **kwargs):
        if hasattr(self._obj.guild, 'unban'):
            await self._obj.guild.unban(self._obj)

    async def dar_timeout(self, duracao_segundos, *args, **kwargs):
        """Aplica um timeout temporal (duracao em segundos) ao membro."""
        if 'motivo' in kwargs:
            kwargs['reason'] = kwargs.pop('motivo')
        delta = timedelta(seconds=duracao_segundos)
        await self._obj.timeout(delta, *args, **kwargs)

    async def remover_timeout(self, *args, **kwargs):
        """Remove o timeout atual do membro."""
        if 'motivo' in kwargs:
            kwargs['reason'] = kwargs.pop('motivo')
        await self._obj.timeout(None, *args, **kwargs)

    async def adicionar_cargo(self, cargo, *args, **kwargs):
        cargo_obj = unwrap_object(cargo)
        await self._obj.add_roles(cargo_obj, *args, **kwargs)

    async def remover_cargo(self, cargo, *args, **kwargs):
        cargo_obj = unwrap_object(cargo)
        await self._obj.remove_roles(cargo_obj, *args, **kwargs)


# --- 4. CANAIS ---

class CanalTexto:
    """Wrapper para Canal de Texto (TextChannel) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def id(self):
        return self._obj.id

    @property
    def servidor(self):
        return wrap_object(self._obj.guild)

    async def enviar(self, *args, **kwargs):
        if 'embutido' in kwargs:
            kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        res = await self._obj.send(*args, **kwargs)
        return wrap_object(res)

    async def deletar(self, *args, **kwargs):
        await self._obj.delete(*args, **kwargs)

    async def purgar(self, *args, **kwargs):
        if 'limite' in kwargs:
            kwargs['limit'] = kwargs.pop('limite')
        res = await self._obj.purge(*args, **kwargs)
        return [wrap_object(m) for m in res]

    async def limpar_mensagens(self, *args, **kwargs):
        return await self.purgar(*args, **kwargs)


class CanalVoz:
    """Wrapper para Canal de Voz (VoiceChannel) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def id(self):
        return self._obj.id

    @property
    def membros(self):
        return [wrap_object(m) for m in self._obj.members]

    async def conectar(self, *args, **kwargs):
        return await self._obj.connect(*args, **kwargs)

    async def desconectar(self, *args, **kwargs):
        voice_client = self._obj.guild.voice_client
        if voice_client:
            await voice_client.disconnect(*args, **kwargs)


# --- 5. SERVIDORES ---

class Servidor:
    """Wrapper para Servidor (Guild) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def nome(self):
        return self._obj.name

    @property
    def id(self):
        return self._obj.id

    @property
    def dono(self):
        return wrap_object(self._obj.owner)

    @property
    def membros(self):
        return [wrap_object(m) for m in self._obj.members]

    @property
    def canais(self):
        return [wrap_object(c) for c in self._obj.channels]

    @property
    def cargos(self):
        return [wrap_object(r) for r in self._obj.roles]

    async def criar_canal_texto(self, nome, *args, **kwargs):
        res = await self._obj.create_text_channel(name=nome, *args, **kwargs)
        return wrap_object(res)

    async def criar_canal_voz(self, nome, *args, **kwargs):
        res = await self._obj.create_voice_channel(name=nome, *args, **kwargs)
        return wrap_object(res)

    async def criar_cargo(self, nome, *args, **kwargs):
        if 'cor' in kwargs:
            kwargs['color'] = unwrap_object(kwargs.pop('cor'))
        res = await self._obj.create_role(name=nome, *args, **kwargs)
        return wrap_object(res)


# --- 6. MENSAGENS ---

class Mensagem:
    """Wrapper para Mensagem (Message) do Discord."""
    def __init__(self, original):
        self._obj = original

    @property
    def conteudo(self):
        return self._obj.content

    @property
    def autor(self):
        return wrap_object(self._obj.author)

    @property
    def canal(self):
        return wrap_object(self._obj.channel)

    @property
    def servidor(self):
        return wrap_object(self._obj.guild)

    @property
    def id(self):
        return self._obj.id

    async def deletar(self, *args, **kwargs):
        await self._obj.delete(*args, **kwargs)

    async def editar(self, *args, **kwargs):
        if 'conteudo' in kwargs:
            kwargs['content'] = kwargs.pop('conteudo')
        if 'embutido' in kwargs:
            kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        await self._obj.edit(*args, **kwargs)

    async def adicionar_reacao(self, emoji, *args, **kwargs):
        await self._obj.add_reaction(emoji, *args, **kwargs)

    async def remover_reacao(self, emoji, membro_ou_usuario, *args, **kwargs):
        membro_obj = unwrap_object(membro_ou_usuario)
        await self._obj.remove_reaction(emoji, membro_obj, *args, **kwargs)

    async def limpar_reacoes(self, *args, **kwargs):
        await self._obj.clear_reactions(*args, **kwargs)

    async def fixar(self, *args, **kwargs):
        await self._obj.pin(*args, **kwargs)

    async def desfixar(self, *args, **kwargs):
        await self._obj.unpin(*args, **kwargs)


# --- 7. CONTEXTO ---

class Contexto:
    """Wrapper para Contexto de Comando (Context) em português."""
    def __init__(self, original):
        self._obj = original

    @property
    def autor(self):
        return wrap_object(self._obj.author)

    @property
    def mensagem(self):
        return wrap_object(self._obj.message)

    @property
    def servidor(self):
        return wrap_object(self._obj.guild)

    @property
    def canal(self):
        return wrap_object(self._obj.channel)

    async def enviar(self, *args, **kwargs):
        if 'embutido' in kwargs:
            kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        res = await self._obj.send(*args, **kwargs)
        return wrap_object(res)

    async def responder(self, *args, **kwargs):
        if 'embutido' in kwargs:
            kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        res = await self._obj.reply(*args, **kwargs)
        return wrap_object(res)


# --- DETECTAR E CONVERTER ---

def wrap_object(obj):
    if obj is None:
        return None
    if hasattr(obj, '_obj'):
        return obj
    
    if isinstance(obj, commands.Context):
        return Contexto(obj)
    elif isinstance(obj, discord.Message):
        return Mensagem(obj)
    elif isinstance(obj, discord.Member):
        return Membro(obj)
    elif isinstance(obj, discord.User):
        return Usuario(obj)
    elif isinstance(obj, discord.Guild):
        return Servidor(obj)
    elif isinstance(obj, discord.TextChannel):
        return CanalTexto(obj)
    elif isinstance(obj, discord.VoiceChannel):
        return CanalVoz(obj)
    elif isinstance(obj, discord.Role):
        return Cargo(obj)
    elif isinstance(obj, discord.Embed):
        return Embutido(obj)
    elif isinstance(obj, discord.Intents):
        return Intencoes(obj)
    elif isinstance(obj, discord.Color):
        return Cor(obj.value)
    
    if not isinstance(obj, (str, int, float, bool, dict, list, tuple, set)):
        return ObjetoProxy(obj)
    return obj

def unwrap_object(obj):
    if hasattr(obj, '_obj'):
        return obj._obj
    return obj


# --- 8. CORE DO BOT ---

class Robo(commands.Bot):
    """
    Classe principal do Robô Portulong herdada de commands.Bot.
    Implementa suporte a eventos e comandos totalmente traduzidos.
    """
    def __init__(self, prefixo, *args, **kwargs):
        if 'intents' not in kwargs:
            kwargs['intents'] = discord.Intents.all()
        # Desempacota wrapper Intencoes
        if isinstance(kwargs['intents'], Intencoes):
            kwargs['intents'] = kwargs['intents']._obj
        super().__init__(command_prefix=prefixo, *args, **kwargs)

    def comando(self, *args, **kwargs):
        if 'nome' in kwargs:
            kwargs['name'] = kwargs.pop('nome')
        if 'ajuda' in kwargs:
            kwargs['help'] = kwargs.pop('ajuda')
            
        def decorador(funcao):
            @functools.wraps(funcao)
            async def wrapper(ctx, *args_f, **kwargs_f):
                ctx_portugues = wrap_object(ctx)
                args_portugues = [wrap_object(a) for a in args_f]
                kwargs_portugues = {k: wrap_object(v) for k, v in kwargs_f.items()}
                return await funcao(ctx_portugues, *args_portugues, **kwargs_portugues)
            return super(Robo, self).command(*args, **kwargs)(wrapper)
        return decorador

    def evento(self, *args, **kwargs):
        def decorador(funcao):
            @functools.wraps(funcao)
            async def wrapper(*args_f, **kwargs_f):
                args_portugues = [wrap_object(a) for a in args_f]
                kwargs_portugues = {k: wrap_object(v) for k, v in kwargs_f.items()}
                return await funcao(*args_portugues, **kwargs_portugues)
            
            mapeamento_eventos = {
                'ao_iniciar': 'on_ready',
                'ao_mensagem': 'on_message',
                'ao_entrar_membro': 'on_member_join',
            }
            nome_original = funcao.__name__
            nome_traduzido = mapeamento_eventos.get(nome_original, nome_original)
            wrapper.__name__ = nome_traduzido
            return super(Robo, self).event(*args, **kwargs)(wrapper)
        return decorador

    def executar(self, token, *args, **kwargs):
        """Inicializa e executa o robô usando o token de acesso fornecido."""
        self.run(token, *args, **kwargs)

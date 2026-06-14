import discord
from discord.ext import commands
import asyncio
import functools
import inspect

def unwrap_object(obj):
    return obj._obj if hasattr(obj, '_obj') else obj

def wrap_object(obj):
    if obj is None or hasattr(obj, '_obj'): return obj
    if isinstance(obj, discord.Embed): return Embutido(obj)
    if not isinstance(obj, (str, int, float, bool, dict, list, tuple, set)):
        return ObjetoProxy(obj)
    return obj

class ObjetoProxy:
    def __init__(self, obj):
        super().__setattr__('_obj', obj)

    def __getattr__(self, name):
        tradutor_geral = {
            'conteudo': 'content', 'autor': 'author', 'canal': 'channel',
            'nome': 'name', 'id': 'id', 'servidor': 'guild', 'mensagem': 'message',
            'usuario': 'user', 'enviar': 'send', 'responder': 'reply',
            'deletar': 'delete', 'adicionar_reacao': 'add_reaction'
        }
        
        real_name = tradutor_geral.get(name, name)
        original_attr = getattr(self._obj, real_name)
        
        if callable(original_attr):
            @functools.wraps(original_attr)
            def metodo_empacotado(*args, **kwargs):
                if 'nome' in kwargs: kwargs['name'] = kwargs.pop('nome')
                if 'embutido' in kwargs: kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
                
                args_desempacotados = [unwrap_object(arg) for arg in args]
                kwargs_desempacotados = {k: unwrap_object(v) for k, v in kwargs.items()}
                
                resultado = original_attr(*args_desempacotados, **kwargs_desempacotados)
                
                if asyncio.iscoroutine(resultado):
                    async def wrapper_assincrono():
                        return wrap_object(await resultado)
                    return wrapper_assincrono()
                return wrap_object(resultado)
            return metodo_empacotado
        return wrap_object(original_attr)

class ContextoPT(ObjetoProxy):
    def __init__(self, ctx):
        super().__init__(ctx)
        self.autor = wrap_object(ctx.author)
        self.canal = wrap_object(ctx.channel)
        self.servidor = wrap_object(ctx.guild)
        self.mensagem = wrap_object(ctx.message)

    async def enviar(self, *args, **kwargs):
        if 'embutido' in kwargs: kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        return wrap_object(await self._obj.send(*args, **kwargs))

    async def responder(self, *args, **kwargs):
        if 'embutido' in kwargs: kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        return wrap_object(await self._obj.reply(*args, **kwargs))

class Intencoes:
    @classmethod
    def default(cls):
        return discord.Intents.default()

class Cor(discord.Color):
    @classmethod
    def azul(cls): return cls.blue()

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
        em_linha = kwargs.pop('em_linha', None) if 'em_linha' in kwargs else (kwargs.pop('inline', True))
        
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

class Robo(commands.Bot):
    def __init__(self, prefixo=None, intents=None, *args, **kwargs):
        # Suporta tanto passagem de parâmetro em português quanto inglês (original)
        pref = prefixo or kwargs.pop('prefixo', None) or kwargs.pop('command_prefix', None)
        intt = intents or kwargs.pop('intents', None) or kwargs.pop('intencoes', None)
        super().__init__(command_prefix=pref, intents=intt, *args, **kwargs)

    def comando(self, *args_cmd, **kwargs_cmd):
        if 'nome' in kwargs_cmd: kwargs_cmd['name'] = kwargs_cmd.pop('nome')
        if 'ajuda' in kwargs_cmd: kwargs_cmd['help'] = kwargs_cmd.pop('ajuda')
        
        def decorador(func):
            sig = inspect.signature(func)
            @functools.wraps(func)
            async def wrapper(ctx, *args, **kwargs):
                ctx_pt = ContextoPT(ctx)
                return await func(ctx_pt, *args, **kwargs)
            wrapper.__signature__ = sig
            self.add_command(commands.Command(wrapper, name=kwargs_cmd.get('name', func.__name__), *args_cmd, **kwargs_cmd))
            return wrapper
        return decorador

    command = comando

    def evento(self, func):
        mapeamento = {
            'ao_iniciar': 'on_ready',
            'ao_mensagem': 'on_message',
            'ao_pronto': 'on_ready'
        }
        name = func.__name__
        mapped_name = mapeamento.get(name, name)
        func.__name__ = mapped_name
        return super().event(func)

    event = evento

    def executar(self, token):
        self.run(token)

# Aliases
Embed = Embutido
Color = Cor
Intents = Intencoes

import discord.ui as ui

# Wrapper para o módulo discord.ext.commands
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
    # Fallback para o módulo discord original para qualquer atributo não mapeado
    return getattr(discord, name)
Bot = Robo

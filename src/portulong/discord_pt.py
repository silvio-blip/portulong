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

class ContextoPT:
    def __init__(self, ctx):
        self._ctx = ctx
        self.autor = wrap_object(ctx.author)
        self.canal = wrap_object(ctx.channel)
        self.servidor = wrap_object(ctx.guild)
        self.mensagem = wrap_object(ctx.message)

    async def enviar(self, *args, **kwargs):
        if 'embutido' in kwargs: kwargs['embed'] = unwrap_object(kwargs.pop('embutido'))
        return wrap_object(await self._ctx.send(*args, **kwargs))

    def __getattr__(self, name):
        return getattr(self._ctx, name)

class Intencoes:
    @classmethod
    def default(cls):
        return discord.Intents.default()

class Cor(discord.Color):
    @classmethod
    def azul(cls): return cls.blue()

class Embutido(discord.Embed):
    def __init__(self, titulo=None, descricao=None, cor=None, *args, **kwargs):
        c = cor if isinstance(cor, (discord.Color, int)) else None
        super().__init__(title=titulo, description=descricao, color=c, *args, **kwargs)
    def adicionar_campo(self, nome, valor, em_linha=True):
        self.add_field(name=nome, value=valor, inline=em_linha)
        return self
    def definir_autor(self, nome, icone_url=None):
        self.set_author(name=nome, icon_url=icone_url)
        return self

class Robo(commands.Bot):
    def __init__(self, prefixo, intents, *args, **kwargs):
        super().__init__(command_prefix=prefixo, intents=intents, *args, **kwargs)

    def comando(self, *args_cmd, **kwargs_cmd):
        def decorador(func):
            sig = inspect.signature(func)
            @functools.wraps(func)
            async def wrapper(ctx, *args, **kwargs):
                ctx_pt = ContextoPT(ctx)
                return await func(ctx_pt, *args, **kwargs)
            wrapper.__signature__ = sig
            self.add_command(commands.Command(wrapper, name=func.__name__, *args_cmd, **kwargs_cmd))
            return wrapper
        return decorador

    def evento(self, func):
        mapeamento = {'ao_iniciar': 'on_ready', 'ao_mensagem': 'on_message'}
        func.__name__ = mapeamento.get(func.__name__, func.__name__)
        return self.event(func)

    def executar(self, token):
        self.run(token)

# Aliases
Embed = Embutido
Color = Cor
Intents = Intencoes
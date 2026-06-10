"""
Wrapper em português para a biblioteca discord.py (Portulong Discordia).
Cria mapeamentos dinâmicos das API's para português.
"""

import discord
from discord.ext import commands
import asyncio
import functools

class ObjetoProxy:
    """
    Proxy dinâmico que intercepts chamadas de métodos e propriedades
    e as traduz do português para as APIs originais em inglês do discord.py.
    """
    def __init__(self, obj):
        super().__setattr__('_obj', obj)

    def __getattr__(self, name):
        # Dicionário de tradução de propriedades para o inglês
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
        
        # Se for um método chamável, empacotamos para interceptar parâmetros
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
            }
            
            real_method_name = tradutor_metodos.get(name, name)
            original_method = getattr(self._obj, real_method_name)
            
            @functools.wraps(original_attr)
            def metodo_empacotado(*args, **kwargs):
                # Traduz chaves de parâmetros de português para inglês
                if 'nome' in kwargs:
                    kwargs['name'] = kwargs.pop('nome')
                if 'excluir_depois' in kwargs:
                    kwargs['delete_after'] = kwargs.pop('excluir_depois')
                if 'limite' in kwargs:
                    kwargs['limit'] = kwargs.pop('limite')
                
                # Desempacota ObjetoProxy dos argumentos posicionais
                args_desempacotados = [
                    arg._obj if isinstance(arg, ObjetoProxy) else arg
                    for arg in args
                ]
                
                # Desempacota ObjetoProxy dos argumentos de palavra-chave
                kwargs_desempacotados = {
                    k: (v._obj if isinstance(v, ObjetoProxy) else v)
                    for k, v in kwargs.items()
                }
                
                resultado = original_method(*args_desempacotados, **kwargs_desempacotados)
                
                # Trata corrotinas assíncronas do discord.py
                if asyncio.iscoroutine(resultado):
                    async def wrapper_assincrono():
                        res = await resultado
                        return empacotar_objeto(res)
                    return wrapper_assincrono()
                    
                return empacotar_objeto(resultado)
            return metodo_empacotado
            
        return empacotar_objeto(original_attr)

    def __setattr__(self, name, value):
        tradutor_atributos = {
            'conteudo': 'content',
        }
        real_name = tradutor_atributos.get(name, name)
        val = value._obj if isinstance(value, ObjetoProxy) else value
        setattr(self._obj, real_name, val)

    def __str__(self):
        return str(self._obj)

    def __repr__(self):
        return repr(self._obj)

    def __eq__(self, other):
        if isinstance(other, ObjetoProxy):
            return self._obj == other._obj
        return self._obj == other

def empacotar_objeto(obj):
    """
    Empacota objetos de retorno em proxies traduzidos para português se necessário.
    """
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool, dict, list, tuple, set)):
        return obj
    return ObjetoProxy(obj)

class Robo(commands.Bot):
    """
    Classe principal do Robô Portulong herdada de commands.Bot.
    Implementa decoradores em português.
    """
    def __init__(self, prefixo, *args, **kwargs):
        if 'intents' not in kwargs:
            kwargs['intents'] = discord.Intents.all()
        super().__init__(command_prefix=prefixo, *args, **kwargs)

    def comando(self, *args, **kwargs):
        if 'nome' in kwargs:
            kwargs['name'] = kwargs.pop('nome')
        if 'ajuda' in kwargs:
            kwargs['help'] = kwargs.pop('ajuda')
            
        def decorador(funcao):
            @functools.wraps(funcao)
            async def wrapper(ctx, *args_f, **kwargs_f):
                ctx_portugues = empacotar_objeto(ctx)
                args_portugues = [empacotar_objeto(a) for a in args_f]
                kwargs_portugues = {k: empacotar_objeto(v) for k, v in kwargs_f.items()}
                return await funcao(ctx_portugues, *args_portugues, **kwargs_portugues)
            return super(Robo, self).command(*args, **kwargs)(wrapper)
        return decorador

    def evento(self, *args, **kwargs):
        def decorador(funcao):
            @functools.wraps(funcao)
            async def wrapper(*args_f, **kwargs_f):
                args_portugues = [empacotar_objeto(a) for a in args_f]
                kwargs_portugues = {k: empacotar_objeto(v) for k, v in kwargs_f.items()}
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

# Aliases para compatibilidade estrutural
Intencoes = discord.Intents
Membro = discord.Member
Canal = discord.TextChannel
Servidor = discord.Guild
Mensagem = discord.Message

import os
import discord
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
        # O MEGA DICIONÁRIO DE ATRIBUTOS
        tradutor_atributos = {
            'conteudo': 'content', 'autor': 'author', 'canal': 'channel',
            'nome': 'name', 'id': 'id', 'servidor': 'guild', 'mensagem': 'message',
            'usuario': 'user', 'membro': 'member', 'apelido': 'display_name',
            'mencao': 'mention', 'mencionar': 'mention', 'membros': 'members',
            'cargos': 'roles', 'canais': 'channels', 'icone_url': 'icon',
            'criado_em': 'created_at', 'entrou_em': 'joined_at', 'cargo_topo': 'top_role',
            'cor': 'color', 'descricao': 'description', 'titulo': 'title',
            'campos': 'fields', 'valor': 'value', 'resposta': 'response',
            'dados': 'data', 'anexos': 'attachments', 'embutidos': 'embeds',
            'reacoes': 'reactions', 'dono': 'owner', 'icone': 'icon',
            'banner': 'banner', 'canais_texto': 'text_channels',
            'canais_voz': 'voice_channels', 'categorias': 'categories',
            'permissoes': 'permissions', 'url': 'url'
        }
        
        # O MEGA DICIONÁRIO DE MÉTODOS
        tradutor_metodos = {
            'enviar': 'send', 'responder': 'reply', 'deletar': 'delete', 'apagar': 'delete',
            'limpar': 'purge', 'adicionar_reacao': 'add_reaction',
            'remover_reacao': 'remove_reaction', 'remover_todas_as_reacoes': 'clear_reactions',
            'banir': 'ban', 'expulsar': 'kick', 'castigar': 'timeout',
            'timeout': 'timeout', 'remover_castigo': 'remove_timeout',
            'remover_timeout': 'remove_timeout', 'adicionar_cargo': 'add_roles',
            'adicionar_cargos': 'add_roles', 'remover_cargo': 'remove_roles',
            'remover_cargos': 'remove_roles', 'editar': 'edit',
            'mover_para': 'move_to', 'silenciar': 'mute', 'desensurdecer': 'deafen',
            'fixar': 'pin', 'desfixar': 'unpin', 'obter_membro': 'get_member',
            'obter_canal': 'get_channel', 'obter_cargo': 'get_role',
            'enviar_mensagem': 'send_message', 'editar_mensagem': 'edit_message',
            'enviar_modal': 'send_modal', 'diferir': 'defer', 'pensar': 'defer'
        }

        real_name = tradutor_atributos.get(name) or tradutor_metodos.get(name, name)
        original_attr = getattr(self._obj, real_name)
        
        if callable(original_attr):
            @functools.wraps(original_attr)
            def metodo_empacotado(*args, **kwargs):
                # O MEGA DICIONÁRIO DE PARÂMETROS
                tradutor_kwargs = {
                    'motivo': 'reason', 'nome': 'name', 'descricao': 'description',
                    'cor': 'color', 'titulo': 'title', 'apelido': 'nick', 'nick': 'nick',
                    'embutido': 'embed', 'embutidos': 'embeds', 'limite': 'limit',
                    'em_linha': 'inline', 'arquivo': 'file', 'arquivos': 'files',
                    'duracao': 'duration', 'visualizacao': 'view', 'view': 'view',
                    'conteudo': 'content', 'efemero': 'ephemeral', 'fantasma': 'ephemeral',
                    'url': 'url', 'suprimir_embutidos': 'suppress_embeds'
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

class ContextoPT(ObjetoProxy):
    def __init__(self, ctx):
        super().__init__(ctx)
        self.autor = wrap_object(ctx.author)
        self.canal = wrap_object(ctx.channel)
        self.servidor = wrap_object(ctx.guild)
        self.mensagem = wrap_object(ctx.message)

class IntencoesPT:
    def __init__(self, obj):
        self._obj = obj

    def __setattr__(self, name, value):
        if name == '_obj':
            super().__setattr__(name, value)
            return
        tradutor = {
            'membros': 'members', 'membro': 'members', 'conteudo_mensagem': 'message_content',
            'conteudo_mensagens': 'message_content', 'presencas': 'presences', 'mensagens': 'messages',
            'reacoes': 'reactions', 'digitando': 'typing', 'servidores': 'guilds', 'integracoes': 'integrations',
            'webhooks': 'webhooks', 'convites': 'invites', 'voz': 'voice_states', 'moderacao': 'moderation',
            'banimentos': 'bans', 'emojis': 'emojis_and_stickers',
        }
        real_name = tradutor.get(name, name)
        setattr(self._obj, real_name, value)

    def __getattr__(self, name):
        tradutor = {
            'membros': 'members', 'membro': 'members', 'conteudo_mensagem': 'message_content',
            'conteudo_mensagens': 'message_content', 'presencas': 'presences', 'mensagens': 'messages',
            'reacoes': 'reactions', 'digitando': 'typing', 'servidores': 'guilds', 'integracoes': 'integrations',
            'webhooks': 'webhooks', 'convites': 'invites', 'voz': 'voice_states', 'moderacao': 'moderation',
            'banimentos': 'bans', 'emojis': 'emojis_and_stickers',
        }
        real_name = tradutor.get(name, name)
        return getattr(self._obj, real_name)

class Intencoes:
    @classmethod
    def default(cls): return IntencoesPT(discord.Intents.default())
    @classmethod
    def tudo(cls): return IntencoesPT(discord.Intents.all())

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

    # Propriedades Nativas do Embed em Português!
    @property
    def titulo(self): return self.title
    @titulo.setter
    def titulo(self, valor): self.title = valor

    @property
    def descricao(self): return self.description
    @descricao.setter
    def descricao(self, valor): self.description = valor

    @property
    def cor(self): return self.color
    @cor.setter
    def cor(self, valor): self.color = valor

    @property
    def url(self): return getattr(self, '_url', None)
    @url.setter
    def url(self, valor): self._url = valor

    def adicionar_campo(self, *args, **kwargs):
        nome = kwargs.pop('nome', None) or kwargs.pop('name', None)
        valor = kwargs.pop('valor', None) or kwargs.pop('value', None)
        em_linha = kwargs.pop('em_linha', None) if 'em_linha' in kwargs else kwargs.pop('inline', True)
        self.add_field(name=nome, value=valor, inline=em_linha)
        return self

    def definir_autor(self, *args, **kwargs):
        nome = kwargs.pop('nome', None) or kwargs.pop('name', None)
        icone_url = kwargs.pop('icone_url', None) or kwargs.pop('icon_url', None)
        self.set_author(name=nome, icon_url=icone_url)
        return self

    def definir_imagem(self, url):
        self.set_image(url=url)
        return self

    def definir_miniatura(self, url):
        self.set_thumbnail(url=url)
        return self

    def definir_rodape(self, texto, icone_url=None):
        if icone_url:
            self.set_footer(text=texto, icon_url=icone_url)
        else:
            self.set_footer(text=texto)
        return self

    def limpar_campos(self):
        self.clear_fields()
        return self

class Arquivo(discord.File):
    def __init__(self, fp, nome=None, *args, **kwargs):
        filename = nome or kwargs.pop('nome', None) or kwargs.pop('filename', None)
        super().__init__(fp=fp, filename=filename, *args, **kwargs)

class Robo(commands.Bot):
    def __init__(self, prefixo=None, intents=None, *args, **kwargs):
        pref = prefixo or kwargs.pop('prefixo', None) or kwargs.pop('command_prefix', None)
        intt = intents or kwargs.pop('intents', None) or kwargs.pop('intencoes', None)
        if hasattr(intt, '_obj'): intt = intt._obj
        super().__init__(command_prefix=pref, intents=intt, *args, **kwargs)

    @property
    def usuario(self): return wrap_object(self.user)

    async def sincronizar_comandos(self):
        return await self.tree.sync()

    def comando_barra(self, *args_cmd, **kwargs_cmd):
        if 'nome' in kwargs_cmd: kwargs_cmd['name'] = kwargs_cmd.pop('nome')
        if 'descricao' in kwargs_cmd: kwargs_cmd['description'] = kwargs_cmd.pop('descricao')
        
        def decorador(func):
            if 'name' not in kwargs_cmd: kwargs_cmd['name'] = func.__name__
            if 'description' not in kwargs_cmd: kwargs_cmd['description'] = "Sem descrição"
            
            @functools.wraps(func)
            async def wrapper(interaction: discord.Interaction, *args_f, **kwargs_f):
                interacao_pt = ObjetoProxy(interaction)
                args_pt = [wrap_object(arg) for arg in args_f]
                kwargs_pt = {k: wrap_object(v) for k, v in kwargs_f.items()}
                return await func(interacao_pt, *args_pt, **kwargs_pt)
                
            wrapper.__signature__ = inspect.signature(func)
            return self.tree.command(*args_cmd, **kwargs_cmd)(wrapper)
        return decorador

    def comando(self, *args_cmd, **kwargs_cmd):
        if 'nome' in kwargs_cmd: kwargs_cmd['name'] = kwargs_cmd.pop('nome')
        if 'ajuda' in kwargs_cmd: kwargs_cmd['help'] = kwargs_cmd.pop('ajuda')
        
        def decorador(func):
            if 'name' not in kwargs_cmd: kwargs_cmd['name'] = func.__name__
            
            @functools.wraps(func)
            async def func_pt(ctx, *args, **kwargs):
                ctx_pt = ContextoPT(ctx)
                args_pt = [wrap_object(arg) for arg in args]
                kwargs_pt = {k: wrap_object(v) for k, v in kwargs.items()}
                return await func(ctx_pt, *args_pt, **kwargs_pt)
                
            cmd = commands.Command(func_pt, *args_cmd, **kwargs_cmd)
            self.add_command(cmd)
            return func
        return decorador

    command = comando

    def evento(self, func):
        mapeamento = {
            'ao_iniciar': 'on_ready', 'ao_mensagem': 'on_message', 'ao_pronto': 'on_ready',
            'ao_entrar_membro': 'on_member_join', 'ao_sair_membro': 'on_member_remove',
            'ao_reacao_adicionada': 'on_reaction_add', 'ao_reacao_removida': 'on_reaction_remove',
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
    def executar(self, token): self.run(token)

class Botao(discord.ui.Button):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        estilo = kwargs.pop('estilo', None) or kwargs.pop('style', None)
        desativado = kwargs.pop('desativado', None) if 'desativado' in kwargs else kwargs.pop('disabled', False)
        emoji = kwargs.pop('emoji', None)
        url = kwargs.pop('url', None)
        
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
                
        argumentos = {'label': rotulo, 'style': estilo_real, 'disabled': desativado}
        if emoji is not None: argumentos['emoji'] = emoji
        if url is not None: argumentos['url'] = url
        if id_pers is not None: argumentos['custom_id'] = id_pers
            
        super().__init__(**argumentos, **kwargs)

class OpcaoSelecao(discord.SelectOption):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        valor = kwargs.pop('valor', None) or kwargs.pop('value', None)
        descricao = kwargs.pop('descricao', None) or kwargs.pop('description', None)
        emoji = kwargs.pop('emoji', None)
        padrao = kwargs.pop('padrao', None) if 'padrao' in kwargs else kwargs.pop('default', False)
        
        argumentos = {'label': rotulo, 'value': valor, 'default': padrao}
        if descricao is not None: argumentos['description'] = descricao
        if emoji is not None: argumentos['emoji'] = emoji
        super().__init__(**argumentos, **kwargs)

class Selecao(discord.ui.Select):
    def __init__(self, *args, **kwargs):
        marcador = kwargs.pop('texto_marcador', None) or kwargs.pop('marcador', None) or kwargs.pop('placeholder', None)
        min_val = kwargs.pop('minimo_valores', None) or kwargs.pop('min_valores', None) or kwargs.pop('min_values', 1)
        max_val = kwargs.pop('maximo_valores', None) or kwargs.pop('max_valores', None) or kwargs.pop('max_values', 1)
        opcoes = kwargs.pop('opcoes', None) or kwargs.pop('options', None) or []
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        desativado = kwargs.pop('desativado', None) if 'desativado' in kwargs else kwargs.pop('disabled', False)
        
        opcoes_reais = []
        for opt in opcoes:
            if hasattr(opt, '_obj'): opcoes_reais.append(opt._obj)
            else: opcoes_reais.append(opt)
                
        argumentos = {'min_values': min_val, 'max_values': max_val, 'options': opcoes_reais, 'disabled': desativado}
        if marcador is not None: argumentos['placeholder'] = marcador
        if id_pers is not None: argumentos['custom_id'] = id_pers
        super().__init__(**argumentos, **kwargs)

class CaixaTexto(discord.ui.TextInput):
    def __init__(self, *args, **kwargs):
        rotulo = kwargs.pop('rotulo', None) or kwargs.pop('texto', None) or kwargs.pop('label', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        estilo = kwargs.pop('estilo', None) or kwargs.pop('style', None)
        marcador = kwargs.pop('marcador', None) or kwargs.pop('texto_marcador', None) or kwargs.pop('placeholder', None)
        padrao = kwargs.pop('padrao', None) or kwargs.pop('valor_padrao', None) or kwargs.pop('default', None)
        obrigatorio = kwargs.pop('obrigatorio', None) if 'obrigatorio' in kwargs else kwargs.pop('required', True)
        min_comp = kwargs.pop('comprimento_minimo', None) or kwargs.pop('min_comp', None) or kwargs.pop('min_length', None)
        max_comp = kwargs.pop('comprimento_maximo', None) or kwargs.pop('max_comp', None) or kwargs.pop('max_length', None)
        
        estilo_real = discord.TextStyle.short
        if estilo is not None:
            mapa_estilo = {
                'curto': discord.TextStyle.short, 'longo': discord.TextStyle.long, 'paragrafo': discord.TextStyle.long,
            }
            estilo_real = mapa_estilo.get(str(estilo).lower(), discord.TextStyle.short)
                
        argumentos = {'label': rotulo, 'style': estilo_real, 'required': obrigatorio}
        if id_pers is not None: argumentos['custom_id'] = id_pers
        if marcador is not None: argumentos['placeholder'] = marcador
        if padrao is not None: argumentos['default'] = padrao
        if min_comp is not None: argumentos['min_length'] = min_comp
        if max_comp is not None: argumentos['max_length'] = max_comp
        super().__init__(**argumentos, **kwargs)

    @property
    def valor(self):
        return self.value

class ModalPT(discord.ui.Modal):
    def __init_subclass__(cls, **kwargs):
        if 'titulo' in kwargs: kwargs['title'] = kwargs.pop('titulo')
        if 'id_personalizado' in kwargs: kwargs['custom_id'] = kwargs.pop('id_personalizado')
        super().__init_subclass__(**kwargs)

    def __init__(self, *args, **kwargs):
        titulo = kwargs.pop('titulo', None) or kwargs.pop('title', None)
        id_pers = kwargs.pop('id_personalizado', None) or kwargs.pop('id', None) or kwargs.pop('custom_id', None)
        argumentos = {}
        if titulo is not None: argumentos['title'] = titulo
        if id_pers is not None: argumentos['custom_id'] = id_pers
        super().__init__(**argumentos, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

    async def on_submit(self, interaction: discord.Interaction):
        if hasattr(self, 'ao_submeter'):
            await self.ao_submeter(ObjetoProxy(interaction))
        else:
            await super().on_submit(interaction)

class Visualizacao(discord.ui.View):
    def __init__(self, *args, **kwargs):
        timeout = kwargs.pop('tempo_esgotado', None) or kwargs.pop('timeout', 180)
        super().__init__(timeout=timeout, **kwargs)

    def adicionar_item(self, item):
        self.add_item(unwrap_object(item))
        return self

    async def on_timeout(self):
        if hasattr(self, 'ao_esgotar_tempo'): await self.ao_esgotar_tempo()
        else: await super().on_timeout()


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

# Conversores e Tipagens
Membro = discord.Member; Usuario = discord.User; CanalTexto = discord.TextChannel
CanalVoz = discord.VoiceChannel; Cargo = discord.Role; Mensagem = discord.Message; Servidor = discord.Guild

class CommandsWrapper:
    def __init__(self):
        from discord.ext import commands as _real_commands
        self._real_commands = _real_commands
    def __getattr__(self, name): return getattr(self._real_commands, name)
commands = CommandsWrapper()

def __getattr__(name):
    aliases = {
        'Robo': Robo, 'Bot': Robo, 'Embutido': Embutido, 'Embed': Embutido,
        'Cor': Cor, 'Color': Cor, 'Intencoes': Intencoes, 'Intents': Intencoes,
        'Arquivo': Arquivo, 'File': Arquivo, 'ui': ui, 'commands': commands,
        'Membro': Membro, 'Usuario': Usuario, 'CanalTexto': CanalTexto,
        'CanalVoz': CanalVoz, 'Cargo': Cargo, 'Mensagem': Mensagem, 'Servidor': Servidor,
    }
    if name in aliases: return aliases[name]
    return getattr(discord, name)
Bot = Robo

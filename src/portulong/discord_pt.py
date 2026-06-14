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

class Intencoes:
    @classmethod
    def default(cls):
        return discord.Intents.default()

    @classmethod
    def tudo(cls):
        return discord.Intents.all()

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

class Robo(commands.Bot):
    def __init__(self, prefixo=None, intents=None, *args, **kwargs):
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


# Wrappers da UI (Modal, Button, Select, View, TextInput)
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

class UIWrapper:
    def __init__(self):
        self.Botao = Botao
        self.Selecao = Selecao
        self.OpcaoSelecao = OpcaoSelecao
        self.CaixaTexto = CaixaTexto
        self.Modal = ModalPT
        self.Visualizacao = Visualizacao
        
        self.Button = Botao
        self.Select = Selecao
        self.SelectOption = OpcaoSelecao
        self.TextInput = CaixaTexto
        self.View = Visualizacao
        
        self.EstiloTexto = discord.TextStyle
        self.TextStyle = discord.TextStyle
        self.EstiloBotao = discord.ButtonStyle
        self.ButtonStyle = discord.ButtonStyle

    def __getattr__(self, name):
        return getattr(discord.ui, name)

ui = UIWrapper()

# Conversores e Tipagens do Core Discord em Português
Membro = discord.Member
Usuario = discord.User
CanalTexto = discord.TextChannel
CanalVoz = discord.VoiceChannel
Cargo = discord.Role
Mensagem = discord.Message
Servidor = discord.Guild

# Aliases
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
    # Tradução de topo para aliases no escopo global de discord_pt
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


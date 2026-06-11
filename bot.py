import discord
from discord.ext import commands
from discord import ui

# Configuração base do bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"O robô {bot.user} ligou com sucesso e está pronto para os testes!")

# 1. Comando Básico: Olá
@bot.command()
async def ola(ctx):
    await ctx.send(f"Olá, {ctx.author.name}! Bem-vindo ao servidor.")

# 2. Comando Básico: Bom dia
@bot.command()
async def bom_dia(ctx):
    await ctx.send("☀️ Bom dia! Que o teu dia seja incrível e muito produtivo!")

# 3. Comando Intermédio: Embed (Cartão Bonito)
@bot.command()
async def info(ctx):
    # Criar o Embed com cor e título
    cartao = discord.Embed(
        title="✨ Informações do Sistema",
        description="Este é um Embed gerado para testar o motor matemático!",
        color=discord.Color.blue()
    )
    # Adicionar campos de informação
    cartao.add_field(name="Usuário", value=ctx.author.name, inline=True)
    cartao.add_field(name="Servidor", value=ctx.guild.name, inline=True)
    cartao.set_footer(text="Processado com excelência.")
    
    await ctx.send(embed=cartao)

# 4. Comando Avançado: Modal (Formulário via Botão)

# Passo A: Criar a classe do Modal
class MeuModal(ui.Modal, title='Formulário de Teste'):
    resposta = ui.TextInput(label='O que achas desta funcionalidade?', style=discord.TextStyle.paragraph)

    async def on_submit(self, interaction: discord.Interaction):
        # O que acontece quando o utilizador clica em "Enviar" no modal
        await interaction.response.send_message(f"Obrigado pela tua resposta: {self.resposta.value}", ephemeral=True)

# Passo B: Criar a classe do Botão que vai abrir o Modal
class BotaoModal(ui.View):
    @discord.ui.button(label="Abrir Formulário", style=discord.ButtonStyle.green)
    async def abrir(self, interaction: discord.Interaction, button: discord.ui.Button):
        # Abre o modal na cara do utilizador
        await interaction.response.send_modal(MeuModal())

# Passo C: O comando que envia a mensagem com o botão no chat
@bot.command()
async def formulario(ctx):
    await ctx.send("Clica no botão abaixo para abrir o Modal de teste!", view=BotaoModal())

# Iniciar o bot
bot.run("SEU_TOKEN_AQUI")

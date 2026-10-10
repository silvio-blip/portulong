"""
Módulo Bots Portulong (Discord, Telegram e Automação)
100% em Português de Portugal.
"""

from . import discord

class PortulongBot:
    """Suporte geral para bots e automação em Portulong."""
    def __init__(self, nome="Bot Portulong"):
        self.nome = nome

    def executar_tarefa(self, tarefa):
        print(f"[{self.nome}] A executar tarefa: {tarefa}")
        return True

# Integração direta do submódulo Discord dentro de bots
Discord = discord.BotDiscord
CriarBotDiscord = discord.CriarBot
Incorporado = discord.Incorporado
Contexto = discord.ContextoPortulong

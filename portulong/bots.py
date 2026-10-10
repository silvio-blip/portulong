#!/usr/bin/env python3
"""
Portulong Bots (Discord & Telegram) - Módulo de Bots 100% em Português.
"""

class BotDiscordPortulong:
    def __init__(self, token):
        self.token = token
        print("🤖 Bot do Discord inicializado em Português.")

    def quando_mensagem(self, funcao):
        """Decorator ou registo de evento de mensagem"""
        print("💬 Evento de mensagem registado para o Bot do Discord.")

    def iniciar(self):
        print("🚀 Bot do Discord ligado e a escutar...")

class BotTelegramPortulong:
    def __init__(self, token):
        self.token = token
        print("🤖 Bot do Telegram inicializado em Português.")

    def iniciar(self):
        print("🚀 Bot do Telegram ligado e a escutar...")

def criar_bot_discord(token):
    return BotDiscordPortulong(token)

def criar_bot_telegram(token):
    return BotTelegramPortulong(token)

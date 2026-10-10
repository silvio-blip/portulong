#!/usr/bin/env python3
"""
Portulong Base de Dados (Supabase / PostgreSQL) - Módulo de BD 100% em Português.
"""

class BaseDadosPortulong:
    def __init__(self, url="", chave=""):
        self.url = url
        self.chave = chave

    def consultar(self, tabela, filtro=None):
        """Consulta registos numa tabela"""
        # Traduzido nativamente para JS
        return f"__supabase.from('{tabela}').select('*')"

    def inserir(self, tabela, dados):
        """Insere dados numa tabela"""
        return f"__supabase.from('{tabela}').insert({dados})"

    def atualizar(self, tabela, filtro, dados):
        """Atualiza registos numa tabela"""
        return f"__supabase.from('{tabela}').update({dados}).eq('{list(filtro.keys())[0]}', '{list(filtro.values())[0]}')"

    def remover(self, tabela, filtro):
        """Remove registos numa tabela"""
        return f"__supabase.from('{tabela}').delete().eq('{list(filtro.keys())[0]}', '{list(filtro.values())[0]}')"

    def subscrever(self, tabela, evento, callback):
        """Subscreve a alterações em tempo real"""
        return f"__supabase.channel('{tabela}').on('postgres_changes', {{ event: '{evento}', schema: 'public', table: '{tabela}' }}, {callback}).subscribe()"

def ligar_supabase(url, chave):
    return BaseDadosPortulong(url, chave)

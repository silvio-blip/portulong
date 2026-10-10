#!/usr/bin/env python3
"""
Portulong Erros - Tratamento amigável de erros de sintaxe em Português de Portugal.
"""

class ErroSintaxePortulong(Exception):
    pass

def relatar_erro_sintaxe(linha_num, texto_linha, mensagem):
    print("\n" + "=" * 60)
    print(f"❌ ERRO DE SINTAXE EM PORTULONG [Linha {linha_num}]")
    print("=" * 60)
    print(f"  > {texto_linha}")
    print("-" * 60)
    print(f"💡 Causa: {mensagem}")
    print("=" * 60 + "\n")
    raise ErroSintaxePortulong(f"Erro na linha {linha_num}: {mensagem}")

from src.portulong.transpilador import transpilar_codigo

codigo_portulong = """
@bot.evento
definir assincrono on_ready():
    escrever(f"O robô {bot.user} ligou com sucesso e está pronto para os testes!")
"""

print(transpilar_codigo(codigo_portulong))

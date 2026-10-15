
from conexao import conectar_banco

try:
    with conectar_banco() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute("SELECT current_database(), current_user;")
            resultado = cursor.fetchone()

            print("Conexão realizada com sucesso!")
            print("Banco:", resultado[0])
            print("Usuário:", resultado[1])

except Exception as erro:
    print("Erro ao conectar ao PostgreSQL:")
    print(erro)

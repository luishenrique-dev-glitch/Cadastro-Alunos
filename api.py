
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from psycopg.errors import UniqueViolation
from pwdlib import PasswordHash
from starlette.middleware.sessions import SessionMiddleware

from conexao import conectar_banco


# ========================================
# CONFIGURAÇÕES
# ========================================

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    session_cookie="sessao_usuario",
    same_site="lax",
    https_only=False,  # Apenas para desenvolvimento local
    max_age=3600,
)

password_hash = PasswordHash.recommended()


# ========================================
# MODELOS DOS DADOS
# ========================================

class Usuario(BaseModel):
    nome: str
    email: EmailStr
    senha: str


class Login(BaseModel):
    email: EmailStr
    senha: str


# ========================================
# ROTA INICIAL
# ========================================

@app.get("/")
def inicio():
    return {
        "mensagem": "Backend do cadastro funcionando!"
    }


# ========================================
# CADASTRAR USUÁRIO
# ========================================

@app.post("/cadastro", status_code=201)
def cadastrar_usuario(usuario: Usuario):
    senha_criptografada = password_hash.hash(
        usuario.senha
    )

    try:
        with conectar_banco() as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO usuarios (
                        nome,
                        email,
                        senha_hash
                    )
                    VALUES (%s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        usuario.nome,
                        str(usuario.email),
                        senha_criptografada,
                    ),
                )

                novo_id = cursor.fetchone()[0]

        return {
            "mensagem": "Usuário cadastrado com sucesso!",
            "id": novo_id,
            "nome": usuario.nome,
            "email": str(usuario.email),
        }

    except UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="Este e-mail já está cadastrado.",
        )


# ========================================
# REALIZAR LOGIN
# ========================================

@app.post("/login")
def fazer_login(
    dados: Login,
    request: Request,
):
    with conectar_banco() as conexao:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nome, senha_hash
                FROM usuarios
                WHERE LOWER(email) = LOWER(%s);
                """,
                (str(dados.email),),
            )

            usuario = cursor.fetchone()

    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos.",
        )

    senha_correta = password_hash.verify(
        dados.senha,
        usuario[2],
    )

    if not senha_correta:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos.",
        )

    # Criar a sessão autenticada
    request.session.clear()

    request.session["usuario_id"] = usuario[0]
    request.session["nome"] = usuario[1]

    return {
        "mensagem": "Login realizado com sucesso!",
        "id": usuario[0],
        "nome": usuario[1],
    }

# ========================================
# VERIFICAR USUÁRIO AUTENTICADO
# ========================================

@app.get("/me")
def verificar_sessao(request: Request):
    usuario_id = request.session.get("usuario_id")

    if usuario_id is None:
        raise HTTPException(
            status_code=401,
            detail="Você não está autenticado.",
        )

    return {
        "autenticado": True,
        "id": usuario_id,
        "nome": request.session.get("nome"),
    }

# ========================================
# REALIZAR LOGOUT
# ========================================

@app.post("/logout")
def fazer_logout(request: Request):
    request.session.clear()

    return {
        "mensagem": "Logout realizado com sucesso!"
    }

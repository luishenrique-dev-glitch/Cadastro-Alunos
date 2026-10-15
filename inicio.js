
// ========================================
// ELEMENTOS DA PÁGINA INICIAL
// ========================================

const tituloBoasVindas = document.getElementById("tituloBoasVindas");
const botaoSair = document.getElementById("botaoSair");

const API = "http://127.0.0.1:8000";

// ========================================
// VERIFICAR A SESSÃO NO BACKEND
// ========================================

async function verificarSessao() {
    try {
        const resposta = await fetch(`${API}/me`, {
            method: "GET",
            credentials: "include"
        });

        if (!resposta.ok) {
            localStorage.removeItem("nomeUsuario");
            window.location.replace("index.html");
            return;
        }

        const dados = await resposta.json();

        tituloBoasVindas.textContent =
            `Bem-vindo, ${dados.nome}!`;

    } catch (erro) {
        tituloBoasVindas.textContent =
            "Não foi possível verificar sua sessão.";

        botaoSair.disabled = true;
    }
}

verificarSessao();

// ========================================
// SAIR DA CONTA
// ========================================

botaoSair.addEventListener("click", async function () {
    botaoSair.disabled = true;

    try {
        const resposta = await fetch(`${API}/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (!resposta.ok) {
            alert("Não foi possível encerrar a sessão.");
            botaoSair.disabled = false;
            return;
        }

        localStorage.removeItem("nomeUsuario");

        window.location.replace("index.html");

    } catch (erro) {
        alert("Erro de conexão ao tentar sair da conta.");
        botaoSair.disabled = false;
    }
});

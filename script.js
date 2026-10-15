
 // ========================================
 // ELEMENTOS DO CADASTRO
 // ========================================

const formulario = document.getElementById("formCadastro");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

const mensagem = document.getElementById("mensagem");
const erro = document.getElementById("erro");

const requisitoTamanho = document.getElementById("requisitoTamanho");
const requisitoNumero = document.getElementById("requisitoNumero");
const requisitoEspecial = document.getElementById("requisitoEspecial");
const requisitoLetra = document.getElementById("requisitoLetra");

const botaoSenha = document.getElementById("botaoSenha");

const API = "http://127.0.0.1:8000";


// ========================================
// MOSTRAR OU OCULTAR SENHAS DO CADASTRO
// ========================================

botaoSenha.addEventListener("click", function () {
    const mostrar = campoSenha.type === "password";

    campoSenha.type = mostrar ? "text" : "password";
    confirmarSenha.type = mostrar ? "text" : "password";

    botaoSenha.textContent = mostrar
        ? "Ocultar senha"
        : "Mostrar senha";
});


// ========================================
// VALIDAR REQUISITOS DA SENHA
// ========================================

function validarSenha() {
    const senha = campoSenha.value;

    const tamanhoValido = senha.length >= 8;
    const numeroValido = /[0-9]/.test(senha);
    const especialValido = /[^A-Za-z0-9]/.test(senha);
    const letraValida = /[A-Za-zÀ-ÿ]/.test(senha);

    requisitoTamanho.textContent =
        `${tamanhoValido ? "✓" : "○"} 8 caracteres ou mais`;

    requisitoNumero.textContent =
        `${numeroValido ? "✓" : "○"} Pelo menos um número`;

    requisitoEspecial.textContent =
        `${especialValido ? "✓" : "○"} Um caractere especial`;

    requisitoLetra.textContent =
        `${letraValida ? "✓" : "○"} Pelo menos uma letra`;

    return (
        tamanhoValido &&
        numeroValido &&
        especialValido &&
        letraValida
    );
}

campoSenha.addEventListener("input", function () {
    mensagem.textContent = "";
    erro.textContent = "";
    validarSenha();
});


// ========================================
// CADASTRAR USUÁRIO
// ========================================

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    mensagem.textContent = "";
    erro.textContent = "";

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;
    const senhaConfirmada = confirmarSenha.value;

    if (nome.length < 3) {
        erro.textContent =
            "O nome deve conter pelo menos 3 caracteres.";
        return;
    }

    if (!validarSenha()) {
        erro.textContent =
            "Sua senha ainda não atende a todos os requisitos.";
        return;
    }

    if (senha !== senhaConfirmada) {
        erro.textContent = "As senhas não são iguais.";
        return;
    }

    try {
        const resposta = await fetch(`${API}/cadastro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            erro.textContent =
                typeof dados.detail === "string"
                    ? dados.detail
                    : "Não foi possível realizar o cadastro.";
            return;
        }

        mensagem.textContent = "Cadastro realizado com sucesso!";

        formulario.reset();
        validarSenha();

    } catch (erroConexao) {
        erro.textContent =
            "Não foi possível conectar ao servidor. Verifique se a API está funcionando.";
    }
});


// ========================================
// ALTERNAR ENTRE CADASTRO E LOGIN
// ========================================

const areaCadastro = document.getElementById("areaCadastro");
const areaLogin = document.getElementById("areaLogin");

const irParaLogin = document.getElementById("irParaLogin");
const voltarCadastro = document.getElementById("voltarCadastro");

irParaLogin.addEventListener("click", function () {
    areaCadastro.hidden = true;
    areaLogin.hidden = false;
});

voltarCadastro.addEventListener("click", function () {
    areaLogin.hidden = true;
    areaCadastro.hidden = false;
});


// ========================================
// ELEMENTOS DO LOGIN
// ========================================

const formLogin = document.getElementById("formLogin");
const emailLogin = document.getElementById("emailLogin");
const senhaLogin = document.getElementById("senhaLogin");

const mensagemLogin = document.getElementById("mensagemLogin");
const erroLogin = document.getElementById("erroLogin");

const botaoSenhaLogin =
    document.getElementById("botaoSenhaLogin");


// ========================================
// MOSTRAR OU OCULTAR SENHA DO LOGIN
// ========================================

botaoSenhaLogin.addEventListener("click", function () {
    const mostrar = senhaLogin.type === "password";

    senhaLogin.type = mostrar ? "text" : "password";

    botaoSenhaLogin.textContent = mostrar
        ? "Ocultar senha"
        : "Mostrar senha";
});


// ========================================
// REALIZAR LOGIN
// ========================================

formLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    mensagemLogin.textContent = "";
    erroLogin.textContent = "";

    try {
        const resposta = await fetch(`${API}/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailLogin.value.trim(),
                senha: senhaLogin.value
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            erroLogin.textContent =
                typeof dados.detail === "string"
                    ? dados.detail
                    : "E-mail ou senha incorretos.";
            return;
        }

        localStorage.setItem("nomeUsuario", dados.nome);

        window.location.href = "inicio.html";

    } catch (erroConexao) {
        erroLogin.textContent =
            "Não foi possível conectar ao servidor. Verifique se a API está funcionando.";
    }
});


// ========================================
// REALIZAR LOGOUT
// ========================================

async function fazerLogout() {
    try {
        const resposta = await fetch(`${API}/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (!resposta.ok) {
            alert("Não foi possível encerrar a sessão.");
            return;
        }

        localStorage.removeItem("nomeUsuario");

        window.location.replace("index.html");

    } catch (erroConexao) {
        alert(
            "Não foi possível conectar ao servidor para encerrar a sessão."
        );
    }
}

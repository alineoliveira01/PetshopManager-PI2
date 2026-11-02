// ==========================================
// CONFIGURAÇÕES
// ==========================================

const API_AUTH = "/api/auth";
const PAGINA_INICIAL = "index.html";


// ==========================================
// ELEMENTOS DAS TELAS
// ==========================================

const telaLogin = document.getElementById("telaLogin");
const telaRecuperacao = document.getElementById("telaRecuperacao");
const telaNovaSenha = document.getElementById("telaNovaSenha");


// ==========================================
// NAVEGAÇÃO ENTRE AS TELAS
// ==========================================

function mostrarTela(tela) {

    telaLogin.classList.add("tela-oculta");
    telaRecuperacao.classList.add("tela-oculta");
    telaNovaSenha.classList.add("tela-oculta");

    tela.classList.remove("tela-oculta");
}


// Abrir recuperação
document.getElementById("abrirRecuperacao").addEventListener("click", () => {
    mostrarTela(telaRecuperacao);
});


// Voltar ao login
document.getElementById("voltarLogin").addEventListener("click", () => {
    mostrarTela(telaLogin);
});

document.getElementById("voltarLoginNovaSenha").addEventListener("click", () => {
    mostrarTela(telaLogin);
});


// ==========================================
// MOSTRAR OU OCULTAR SENHA
// ==========================================

document.querySelectorAll(".mostrar-senha").forEach(botao => {

    botao.addEventListener("click", () => {

        const campo = document.getElementById(botao.dataset.alvo);

        if (campo.type === "password") {
            campo.type = "text";
            botao.setAttribute("aria-label", "Ocultar senha");
        } else {
            campo.type = "password";
            botao.setAttribute("aria-label", "Mostrar senha");
        }

    });

});


// ==========================================
// FUNÇÃO AUXILIAR PARA REQUISIÇÕES
// ==========================================

async function requisicaoAPI(url, dados) {

    const resposta = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            resultado.message || resultado.mensagem || "Não foi possível realizar a operação."
        );
    }

    return resultado;
}


// ==========================================
// MENSAGENS
// ==========================================

function mostrarMensagem(elemento, mensagem, tipo) {

    elemento.textContent = mensagem;

    elemento.classList.remove("erro", "sucesso");

    if (tipo) {
        elemento.classList.add(tipo);
    }
}


// ==========================================
// LOGIN
// ==========================================

const formEntrar = document.getElementById("formEntrar");

formEntrar.addEventListener("submit", async evento => {

    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;

    const mensagem = document.getElementById("mensagemLogin");
    const botao = formEntrar.querySelector("button[type='submit']");

    if (!usuario || !senha) {
        mostrarMensagem(mensagem, "Preencha todos os campos.", "erro");
        return;
    }

    botao.disabled = true;
    botao.textContent = "AGUARDE...";

    mostrarMensagem(mensagem, "", "");

    try {

        await requisicaoAPI(`${API_AUTH}/login`, {
            usuario,
            senha
        });

        // A autenticação deverá ser mantida pelo backend,
        // preferencialmente através de cookie seguro.

        window.location.href = PAGINA_INICIAL;

    } catch (erro) {

        mostrarMensagem(
            mensagem,
            erro.message || "Não foi possível realizar o login.",
            "erro"
        );

    } finally {

        botao.disabled = false;
        botao.textContent = "ENTRAR";

    }

});


// ==========================================
// RECUPERAÇÃO DE SENHA
// ==========================================

const formRecuperacao = document.getElementById("formRecuperacao");

formRecuperacao.addEventListener("submit", async evento => {

    evento.preventDefault();

    const email = document.getElementById("emailRecuperacao").value.trim();

    const mensagem = document.getElementById("mensagemRecuperacao");
    const botao = formRecuperacao.querySelector("button[type='submit']");

    if (!email) {
        mostrarMensagem(mensagem, "Informe seu e-mail.", "erro");
        return;
    }

    botao.disabled = true;
    botao.textContent = "ENVIANDO...";

    mostrarMensagem(mensagem, "", "");

    try {

        await requisicaoAPI(`${API_AUTH}/forgot-password`, {
            email
        });

        mostrarMensagem(
            mensagem,
            "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.",
            "sucesso"
        );

        formRecuperacao.reset();

    } catch (erro) {

        mostrarMensagem(
            mensagem,
            erro.message || "Não foi possível solicitar a recuperação.",
            "erro"
        );

    } finally {

        botao.disabled = false;
        botao.textContent = "ENVIAR SOLICITAÇÃO";

    }

});


// ==========================================
// REDEFINIÇÃO DE SENHA
// ==========================================

// O token será recebido através do link enviado por e-mail.

const parametrosURL = new URLSearchParams(window.location.search);

const tokenRecuperacao = parametrosURL.get("token");


// Se existir um token, mostrar a tela de nova senha.

if (tokenRecuperacao) {

    mostrarTela(telaNovaSenha);

}


// ==========================================
// CADASTRAR NOVA SENHA
// ==========================================

const formNovaSenha = document.getElementById("formNovaSenha");

formNovaSenha.addEventListener("submit", async evento => {

    evento.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    const mensagem = document.getElementById("mensagemNovaSenha");
    const botao = formNovaSenha.querySelector("button[type='submit']");

    if (!tokenRecuperacao) {

        mostrarMensagem(
            mensagem,
            "Link de recuperação inválido ou ausente.",
            "erro"
        );

        return;
    }

    if (novaSenha.length < 8) {

        mostrarMensagem(
            mensagem,
            "A senha deve possuir pelo menos 8 caracteres.",
            "erro"
        );

        return;
    }

    if (novaSenha !== confirmarSenha) {

        mostrarMensagem(
            mensagem,
            "As senhas informadas não são iguais.",
            "erro"
        );

        return;
    }

    botao.disabled = true;
    botao.textContent = "SALVANDO...";

    mostrarMensagem(mensagem, "", "");

    try {

        await requisicaoAPI(`${API_AUTH}/reset-password`, {
            token: tokenRecuperacao,
            novaSenha
        });

        mostrarMensagem(
            mensagem,
            "Senha alterada com sucesso! Você já pode entrar.",
            "sucesso"
        );

        formNovaSenha.reset();

        // Remove o token da URL após a redefinição.
        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
            mostrarTela(telaLogin);
        }, 2000);

    } catch (erro) {

        mostrarMensagem(
            mensagem,
            erro.message || "Não foi possível redefinir a senha.",
            "erro"
        );

    } finally {

        botao.disabled = false;
        botao.textContent = "SALVAR NOVA SENHA";

    }

});
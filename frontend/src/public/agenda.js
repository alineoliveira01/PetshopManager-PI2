
/* SEMANA ATUAL */

let dataReferencia = new Date();
let agendamentoSelecionado = null;
let modoEdicao = false;
let criandoNovoAgendamento = false;
let clienteSelecionadoAgenda = null;
let petSelecionadoAgenda = null;
let cliquesBuscaVazia = 0;



/* SERVIÇOS E CONFIGURAÇÕES */

const servicosPadrao = [
    { codigo: 1, nome: "BANHO", cor: "#B5DFF0" , duracaoPadrao: 30 },
    { codigo: 2, nome: "TOSA", cor: "#F5DEA0" , duracaoPadrao: 30 },
    { codigo: 3, nome: "TOSA HIGIÊNICA", cor: "#B9D9A8" , duracaoPadrao: 30 },
    { codigo: 4, nome: "TOSA PREMIUM", cor: "#F2A5A0" , duracaoPadrao: 30 },
    { codigo: 5, nome: "OUTRA CATEGORIA", cor: "#80D5CC" , duracaoPadrao: 30 },
    { codigo: 6, nome: "OUTRA CATEGORIA", cor: "#CBB9E8" , duracaoPadrao: 30 },
    { codigo: 7, nome: "OUTRA CATEGORIA", cor: "#EDB9CB" , duracaoPadrao: 30 },
    { codigo: 8, nome: "OUTRA CATEGORIA", cor: "#F4B16D", duracaoPadrao: 30  },
    { codigo: 9, nome: "OUTRA CATEGORIA", cor: "#83C8F0" , duracaoPadrao: 30 },
    { codigo: 10, nome: "OUTRA CATEGORIA", cor: "#e6e5d8", duracaoPadrao: 30  }
];

const CHAVE_CONFIGURACOES = "agendaConfiguracoes";


function carregarConfiguracoes() {
    try {
        const salvas = JSON.parse(
            localStorage.getItem(CHAVE_CONFIGURACOES)
        );

        if (salvas) {
            return {
                horarioInicial: salvas.horarioInicial || "08:00",
                horarioFinal: salvas.horarioFinal || "20:00",

                servicos: servicosPadrao.map(padrao => {
                    const salvo = salvas.servicos?.find(
                        item => item.codigo === padrao.codigo
                    );

                    return {
                        ...padrao,
                        nome: salvo?.nome || padrao.nome,
                        cor: salvo?.cor || padrao.cor,
                        duracaoPadrao:
                            Number(salvo?.duracaoPadrao) ||
                            Number(padrao.duracaoPadrao) ||
                            30
                    };
                })
            };
        }
    } catch (erro) {
        console.warn(
            "Não foi possível carregar as configurações.",
            erro
        );
    }

    return {
        horarioInicial: "08:00",
        horarioFinal: "20:00",
        servicos: servicosPadrao.map(servico => ({
            ...servico,
            duracaoPadrao: Number(servico.duracaoPadrao) || 30
        }))
    };
}

let configuracoesAgenda = carregarConfiguracoes();
let servicosConfigurados = configuracoesAgenda.servicos;

/* IDENTIFICA O SERVIÇO PELO NOME OU CÓDIGO */

function identificarServico(entrada) {
    const texto = entrada.trim().toUpperCase();

    if (!texto) {
        return { nome: "", codigo: null, cor: null };
    }

    const porCodigo = servicosConfigurados.find(
        servico => String(servico.codigo) === texto
    );

    if (porCodigo) {
        return porCodigo;
    }

    const porNome = servicosConfigurados.find(
        servico => servico.nome.toUpperCase() === texto
    );

    if (porNome) {
        return porNome;
    }

    // Permite digitar um serviço personalizado.
    return {
        nome: texto,
        codigo: null,
        cor: null
    };
}

/* INÍCIO DA SEMANA */

function inicioDaSemana(data) {
    const resultado = new Date(data);
    const dia = resultado.getDay();
    const diferenca = dia === 0 ? -6 : 1 - dia;

    resultado.setDate(resultado.getDate() + diferenca);
    resultado.setHours(0, 0, 0, 0);

    return resultado;
}

/* MOSTRA AS DATAS */

function atualizarSemana() {
    const segunda = inicioDaSemana(dataReferencia);

    const datas = [
        "dataSegunda",
        "dataTerca",
        "dataQuarta",
        "dataQuinta",
        "dataSexta",
        "dataSabado",
        "dataDomingo"
    ];

    datas.forEach((id, indice) => {
        const data = new Date(segunda);
        data.setDate(segunda.getDate() + indice);

        document.getElementById(id).textContent =
            String(data.getDate()).padStart(2, "0") + "/" +
            String(data.getMonth() + 1).padStart(2, "0");
    });
}


/* NAVEGAÇÃO DA SEMANA */

const btnSemanaAnterior = document.getElementById("btnSemanaAnterior");

if (btnSemanaAnterior) {
    btnSemanaAnterior.addEventListener("click", () => {
        dataReferencia.setDate(dataReferencia.getDate() - 7);
        atualizarSemana();
        criarAgendamentosTeste();
    });
}

atualizarSemana();

const btnProximaSemana = document.getElementById("btnProximaSemana");

if (btnProximaSemana) {
    btnProximaSemana.addEventListener("click", () => {
        dataReferencia.setDate(dataReferencia.getDate() + 7);
        atualizarSemana();
        criarAgendamentosTeste();
    });
}

    

/* AGENDAMENTOS */

const CHAVE_AGENDAMENTOS = "agendaAgendamentos";

const agendamentosPadrao = [];

function carregarAgendamentos() {
    try {
        const salvos = localStorage.getItem(CHAVE_AGENDAMENTOS);

        if (salvos !== null) {
            return JSON.parse(salvos);
        }
    } catch (erro) {
        console.error("Não foi possível carregar os agendamentos.", erro);
    }

    return agendamentosPadrao.map(agendamento => ({ ...agendamento }));
}

let agendamentosTeste = carregarAgendamentos();

function salvarAgendamentos() {
    try {
        const dados = agendamentosTeste.map(
            ({ bloco, ...agendamento }) => agendamento
        );

        localStorage.setItem(
            CHAVE_AGENDAMENTOS,
            JSON.stringify(dados)
        );
    } catch (erro) {
        console.error("Não foi possível salvar os agendamentos.", erro);
        alert("NÃO FOI POSSÍVEL SALVAR OS AGENDAMENTOS.");
    }
}

/* CALCULA O HORÁRIO FINAL */

function calcularHorarioFim(inicio, duracao) {
    const [hora, minuto] = inicio.split(":").map(Number);
    const total = hora * 60 + minuto + duracao;

    return (
        String(Math.floor(total / 60)).padStart(2, "0") +
        ":" +
        String(total % 60).padStart(2, "0")
    );
}

/* MONTA O BLOCO VISUAL */

function atualizarBloco(agendamento) {
    const bloco = agendamento.bloco;
    if (!bloco) return;

    const servico = identificarServico(
    agendamento.codigoServico != null
        ? String(agendamento.codigoServico)
        : agendamento.servico
);

// Mantém o nome digitado se for um serviço personalizado.
const categoria = servicosConfigurados.find(
    item => item.codigo === agendamento.codigoServico
);

const nomeServico = categoria
    ? categoria.nome
    : agendamento.servico || servico.nome;

bloco.replaceChildren();

    const titulo = document.createElement("strong");
    titulo.textContent =
        `${agendamento.inicio} - ` +
        `${calcularHorarioFim(
            agendamento.inicio,
            agendamento.duracao
        )} | ${agendamento.cliente}`;

    const pet = document.createElement("span");
    pet.textContent = agendamento.pet;

    const descricao = document.createElement("small");
    descricao.textContent = nomeServico;

    bloco.append(titulo, pet, descricao);

    bloco.style.backgroundColor = categoria
        ? categoria.cor
        : "#8bbec5";

    bloco.style.borderColor = categoria
        ? categoria.cor
        : "#74a5b7";

    const [hora, minuto] = agendamento.inicio
    .split(":")
    .map(Number);

const [horaInicial, minutoInicial] =
    configuracoesAgenda.horarioInicial
        .split(":")
        .map(Number);

const minutosDesdeInicio =
    (hora * 60 + minuto) -
    (horaInicial * 60 + minutoInicial);

bloco.style.marginTop =
    `${(minutosDesdeInicio / 60) * 120 }px`;

bloco.style.height =
    `${(agendamento.duracao / 60) * 120}px`;
    }
/* ABRE A JANELA DE AGENDAMENTO */

function abrirAgendamento(agendamento) {
    agendamentoSelecionado = agendamento;
    criandoNovoAgendamento = false;

    document.getElementById("infoCliente").textContent =
        agendamento.cliente;

    document.getElementById("infoPet").textContent =
        agendamento.pet;

    document.getElementById("infoServico").textContent =
        agendamento.servico;

    document.getElementById("infoHorario").textContent =
        `${agendamento.inicio} - ` +
        calcularHorarioFim(
            agendamento.inicio,
            agendamento.duracao
        );

    // CALCULAR A DATA DO AGENDAMENTO
    const dataSemana = inicioDaSemana(dataReferencia);
    const dataSelecionada = new Date(dataSemana);

    dataSelecionada.setDate(
        dataSemana.getDate() + agendamento.dia - 1
    );

    document.getElementById("infoData").textContent =
        dataSelecionada.toLocaleDateString("pt-BR");

    document.getElementById("janelaAgendamento").style.display =
        "flex";
}
/* CRIA OS AGENDAMENTOS */


function criarAgendamentosTeste() {
    const camada = document.getElementById("camadaAgendamentos");


   if (!camada) {
        console.error("CAMADA DE AGENDAMENTOS NÃO ENCONTRADA NESTA PÁGINA.");
        return;
    }
    const segunda = inicioDaSemana(dataReferencia);

    // LIMPA OS BLOCOS DA SEMANA ANTERIOR
    camada.replaceChildren();

    agendamentosTeste.forEach((agendamento, indice) => {
        // IGNORA AGENDAMENTOS SEM DATA COMPLETA
        if (!agendamento.data) return;

        // CONVERTE A DATA DD/MM/AAAA PARA UMA DATA VÁLIDA
        const [dia, mes, ano] = agendamento.data.split("/").map(Number);
        const dataAgendamento = new Date(ano, mes - 1, dia);
        dataAgendamento.setHours(0, 0, 0, 0);

        // VERIFICA SE A DATA PERTENCE À SEMANA EXIBIDA
        const diferencaDias = Math.round(
            (dataAgendamento - segunda) / (1000 * 60 * 60 * 24)
        );

        if (diferencaDias < 0 || diferencaDias > 6) return;

        const bloco = document.createElement("div");

        bloco.className = "agendamento-teste";
        bloco.dataset.agendamentoId = indice;

        agendamento.bloco = bloco;

        // POSICIONA NA COLUNA DO DIA
        bloco.style.gridColumn = diferencaDias + 2;
        bloco.style.gridRow = "1 / -1";
        bloco.style.margin = "0 4px";

        atualizarBloco(agendamento);
        camada.appendChild(bloco);

        bloco.addEventListener("click", () => {
            abrirAgendamento(agendamento);
        });
    });
}

criarAgendamentosTeste();


/* DIVISÕES DE 15 MINUTOS */

function criarDivisoes15Minutos() {
    document.querySelectorAll(".espaco-dia").forEach(espaco => {
        ["divisao-15", "divisao-30", "divisao-45"]
            .forEach(classe => {
                const divisao = document.createElement("div");
                divisao.className = `divisao ${classe}`;
                espaco.appendChild(divisao);
            });
    });
}

criarDivisoes15Minutos();

/* MOSTRA OU ESCONDE OS CAMPOS DE EDIÇÃO */

function definirModoEdicao(editar) {
    document.querySelectorAll(".info-agendamento span")
        .forEach(elemento => {
            elemento.style.display = editar ? "none" : "";
        });

    document.querySelectorAll(".info-agendamento input")
        .forEach(elemento => {
            elemento.style.display = editar ? "block" : "none";
        });

    document.getElementById("btnEditarAgendamento").textContent =
        editar ? "SALVAR" : "EDITAR";

    // MOSTRA OU ESCONDE O BOTÃO CANCELAR EDIÇÃO
    document.getElementById("btnCancelarEdicao").hidden = !editar;
    document.getElementById("btnExcluirAgendamento").hidden = editar;    
    modoEdicao = editar;
}


/* EDITAR E SALVAR */

document.getElementById("btnEditarAgendamento")
    .addEventListener("click", () => {
        if (!agendamentoSelecionado) return;

        if (!modoEdicao) {
            document.getElementById("editarCliente").value =
                agendamentoSelecionado.cliente;

            document.getElementById("editarPet").value =
                agendamentoSelecionado.pet;

            document.getElementById("editarServico").value =
                agendamentoSelecionado.servico;

            document.getElementById("editarInicio").value =
                agendamentoSelecionado.inicio;

            definirModoEdicao(true);
            return;
        }

        const inicio = document.getElementById("editarInicio").value;
        const entradaServico =
            document.getElementById("editarServico").value;

        if (!inicio || !entradaServico.trim()) {
            alert("Informe o horário e o serviço.");
            return;
        }

        const servico = identificarServico(entradaServico);

        agendamentoSelecionado.cliente =
            document.getElementById("editarCliente")
                .value.trim().toUpperCase();

        agendamentoSelecionado.pet =
            document.getElementById("editarPet")
                .value.trim().toUpperCase();

        agendamentoSelecionado.inicio = inicio;
        agendamentoSelecionado.servico = servico.nome;
        agendamentoSelecionado.codigoServico = servico.codigo;
        agendamentoSelecionado.duracao =
            servico.duracaoPadrao || 30;

if (criandoNovoAgendamento) {
    agendamentosTeste.push(agendamentoSelecionado);
    criandoNovoAgendamento = false;
}

criarAgendamentosTeste();


    atualizarBloco(agendamentoSelecionado);
    salvarAgendamentos();

        document.getElementById("infoCliente").textContent =
            agendamentoSelecionado.cliente;

        document.getElementById("infoPet").textContent =
            agendamentoSelecionado.pet;

        document.getElementById("infoServico").textContent =
            agendamentoSelecionado.servico;

        document.getElementById("infoHorario").textContent =
            `${inicio} - ` +
            calcularHorarioFim(
                inicio,
                agendamentoSelecionado.duracao
            );

        definirModoEdicao(false);

        document.getElementById("janelaAgendamento").style.display =
            "none";
    });
    
/* EXCLUIR AGENDAMENTO */

document.getElementById("btnExcluirAgendamento")
    .addEventListener("click", () => {
        if (!agendamentoSelecionado) return;

        const confirmar = confirm(
            "DESEJA REALMENTE EXCLUIR ESTE AGENDAMENTO?"
        );

        if (!confirmar) return;

        const indice = agendamentosTeste.indexOf(
            agendamentoSelecionado
        );

        if (indice === -1) {
            alert("NÃO FOI POSSÍVEL LOCALIZAR O AGENDAMENTO.");
            return;
        }

        // REMOVE O BLOCO DA AGENDA
        if (agendamentoSelecionado.bloco) {
            agendamentoSelecionado.bloco.remove();
        }

        // REMOVE O REGISTRO
        agendamentosTeste.splice(indice, 1);

        // SALVA A ALTERAÇÃO
        salvarAgendamentos();

        // FECHA A JANELA
        document.getElementById("janelaAgendamento").style.display =
            "none";

        // LIMPA A SELEÇÃO
        agendamentoSelecionado = null;

        definirModoEdicao(false);
    });


/* CANCELAR EDIÇÃO DO AGENDAMENTO */

document.getElementById("btnCancelarEdicao")
    .addEventListener("click", () => {
        if (!agendamentoSelecionado) return;

        // RESTAURA OS VALORES ORIGINAIS NOS CAMPOS
        document.getElementById("editarCliente").value =
            agendamentoSelecionado.cliente || "";

        document.getElementById("editarPet").value =
            agendamentoSelecionado.pet || "";

        document.getElementById("editarServico").value =
            agendamentoSelecionado.servico || "";

        document.getElementById("editarInicio").value =
            agendamentoSelecionado.inicio || "";

        // RESTAURA AS INFORMAÇÕES EXIBIDAS
        document.getElementById("infoCliente").textContent =
            agendamentoSelecionado.cliente || "";

        document.getElementById("infoPet").textContent =
            agendamentoSelecionado.pet || "";

        document.getElementById("infoServico").textContent =
            agendamentoSelecionado.servico || "";

        document.getElementById("infoHorario").textContent =
            `${agendamentoSelecionado.inicio} - ` +
            calcularHorarioFim(
                agendamentoSelecionado.inicio,
                agendamentoSelecionado.duracao
            );

        // VOLTA AO MODO DE VISUALIZAÇÃO
        definirModoEdicao(false);
    });

/* FECHAR JANELA */

document.getElementById("fecharAgendamento")
    .addEventListener("click", () => {
        if (modoEdicao && !confirm("Sair sem salvar?")) {
            return;
        }

        document.getElementById("janelaAgendamento").style.display =
            "none";

        definirModoEdicao(false);
    });


/* JANELA DE CONFIGURAÇÕES */

const botaoConfiguracoes =
    document.getElementById("btnConfiguracoesAgenda");

const janelaConfiguracoes =
    document.getElementById("janelaConfiguracoes");

const listaConfiguracaoServicos =
    document.getElementById("listaConfiguracaoServicos");

function atualizarLegendaServicos() {
    document.querySelectorAll(".categoria-servico").forEach(
        (elemento, indice) => {
            const servico = servicosConfigurados[indice];

            if (!servico) return;

            // ATUALIZA O NOME
            const nome = elemento.querySelector(".nome-categoria")
                || elemento.lastElementChild;

            if (nome) {
                nome.textContent = servico.nome;
            }

            // ATUALIZA A COR DO NÚMERO NO MENU LATERAL
            const identificacao = elemento.querySelector(".cor-categoria");

            if (identificacao) {
                identificacao.style.backgroundColor = servico.cor;
            }
        }
    );
}
/* ABRIR CONFIGURAÇÕES PELO MENU LATERAL */

const linkConfiguracoesMenu =
    document.getElementById("linkConfiguracoesMenu");

if (linkConfiguracoesMenu) {
    linkConfiguracoesMenu.addEventListener("click", (evento) => {
        evento.preventDefault();

        window.location.href =
            "agenda.html?abrirConfiguracoes=1";
    });
}

/* ABRIR CONFIGURAÇÕES AO ENTRAR NA AGENDA */

const parametrosURL = new URLSearchParams(window.location.search);

if (parametrosURL.get("abrirConfiguracoes") === "1") {
    document.getElementById("btnConfiguracoesAgenda")?.click();

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}

function montarListaConfiguracao() {
    listaConfiguracaoServicos.replaceChildren();

    servicosConfigurados.forEach(servico => {
        const linha = document.createElement("div");
        linha.className = "linha-configuracao-servico";

        // NÚMERO DA CATEGORIA
        const identificacao = document.createElement("span");
        identificacao.textContent = servico.codigo;
        identificacao.className = "numero-configuracao-servico";

        // SELETOR DE COR
        const seletorCor = document.createElement("input");
        seletorCor.type = "color";
        seletorCor.value = servico.cor;
        seletorCor.dataset.corCodigo = servico.codigo;
        seletorCor.className = "seletor-cor-configuracao";
        seletorCor.setAttribute(
            "aria-label",
            `Cor da categoria ${servico.codigo}`
        );

        // NOME DO SERVIÇO
        const campo = document.createElement("input");
        campo.type = "text";
        campo.value = servico.nome;
        campo.maxLength = 40;
        campo.dataset.codigo = servico.codigo;
        campo.setAttribute(
            "aria-label",
            `Nome do serviço ${servico.codigo}`
        );

        campo.addEventListener("input", () => {
            campo.value = campo.value.toUpperCase();
        });

        // DURAÇÃO PADRÃO EM MINUTOS
        const duracao = document.createElement("input");
        duracao.type = "number";
        duracao.min = "1";
        duracao.max = "600";
        duracao.step = "1";
        duracao.value = servico.duracaoPadrao ?? 30;
        duracao.dataset.duracaoCodigo = servico.codigo;
        duracao.setAttribute(
            "aria-label",
            `Duração padrão de ${servico.nome}, em minutos`
        );

        linha.append(
            identificacao,
            seletorCor,
            campo,
            duracao
        );

        listaConfiguracaoServicos.appendChild(linha);
    });
}

/* OPÇÕES DE HORÁRIO: 08:00 ATÉ 20:00 */

function preencherHorarios(id, horarioSelecionado) {
    const campo = document.getElementById(id);
    campo.replaceChildren();

    for (let hora = 8; hora <= 20; hora++) {
        const horario = `${String(hora).padStart(2, "0")}:00`;
        const opcao = document.createElement("option");

        opcao.value = horario;
        opcao.textContent = horario;

        campo.appendChild(opcao);
    }

    campo.value = horarioSelecionado;

    if (!campo.value) {
        campo.value = id === "horarioInicial" ? "08:00" : "20:00";
    }
}


function abrirConfiguracoes() {
    preencherHorarios(
        "horarioInicial",
        configuracoesAgenda.horarioInicial );

    preencherHorarios(
        "horarioFinal",
        configuracoesAgenda.horarioFinal );

   
montarListaConfiguracao();

janelaConfiguracoes.style.display = "flex";

const botao = document.getElementById("btnConfiguracoesAgenda");
const painel = janelaConfiguracoes.querySelector(".configuracoes-agenda");

const posicao = botao.getBoundingClientRect();


const alturaPainel = painel.offsetHeight;
const margem = 10;

const topoIdeal = posicao.bottom + 8;
const topoMaximo = window.innerHeight - alturaPainel - margem;

painel.style.top = `${Math.max(margem, Math.min(topoIdeal, topoMaximo))}px`;
painel.style.right = "5px";
painel.style.left = "auto";


}

function salvarConfiguracoes() {
    const horarioInicial =
        document.getElementById("horarioInicial").value;

    const horarioFinal =
        document.getElementById("horarioFinal").value;

    if (!horarioInicial || !horarioFinal) {
        alert("INFORME O HORÁRIO INICIAL E O HORÁRIO FINAL.");
        return;
    }

    const inicioMinutos = horarioInicial
        .split(":")
        .reduce((total, valor) => total * 60 + Number(valor), 0);

    const fimMinutos = horarioFinal
        .split(":")
        .reduce((total, valor) => total * 60 + Number(valor), 0);

    if (
        horarioInicial.endsWith(":00") === false ||
        horarioFinal.endsWith(":00") === false
    ) {
        alert("UTILIZE HORÁRIOS CHEIOS, COMO 08:00 OU 17:00.");
        return;
    }

    if (fimMinutos <= inicioMinutos) {
        alert("O HORÁRIO FINAL DEVE SER POSTERIOR AO INICIAL.");
        return;
    }

   
    const novosServicos = [
        ...listaConfiguracaoServicos.querySelectorAll("input[data-codigo]")
    ].map(campo => {
        const codigo = Number(campo.dataset.codigo);

        const padrao = servicosPadrao.find(
            item => item.codigo === codigo
        );

        const servicoSalvo = servicosConfigurados.find(
            item => item.codigo === codigo
        );

        const seletorCor = listaConfiguracaoServicos.querySelector(
            `input[data-cor-codigo="${codigo}"]`
        );

        const campoDuracao = listaConfiguracaoServicos.querySelector(
            `input[data-duracao-codigo="${codigo}"]`
        );

        return {
            ...padrao,
            nome: campo.value.trim().toUpperCase()
                || servicoSalvo?.nome
                || padrao.nome,
            cor: seletorCor?.value
                || servicoSalvo?.cor
                || padrao.cor,
            duracaoPadrao: Number(campoDuracao?.value)
                || servicoSalvo?.duracaoPadrao
                || padrao.duracaoPadrao
                || 30
        };
    });


    configuracoesAgenda = {
        horarioInicial,
        horarioFinal,
        servicos: novosServicos
    };

    servicosConfigurados = configuracoesAgenda.servicos;

    try {
        localStorage.setItem(
            CHAVE_CONFIGURACOES,
            JSON.stringify(configuracoesAgenda)
        );
    } catch (erro) {
        alert("NÃO FOI POSSÍVEL SALVAR AS CONFIGURAÇÕES NO NAVEGADOR.");
        console.error(erro);
        return;
    }

    atualizarLegendaServicos();

    agendamentosTeste.forEach(atualizarBloco);

    aplicarHorarioFuncionamento();

    janelaConfiguracoes.style.display = "none";
}

botaoConfiguracoes.addEventListener("click", abrirConfiguracoes);

document.getElementById("fecharConfiguracoes")
    .addEventListener("click", () => {
        janelaConfiguracoes.style.display = "none";
    });

document.getElementById("btnSalvarConfiguracoes")
    .addEventListener("click", salvarConfiguracoes);

atualizarLegendaServicos();


/* HORÁRIO DE FUNCIONAMENTO */

function aplicarHorarioFuncionamento() {
    const horaInicial = Number(
        configuracoesAgenda.horarioInicial.split(":")[0]
    );

    const horaFinal = Number(
        configuracoesAgenda.horarioFinal.split(":")[0]
    );

    const linhas = document.querySelectorAll(
        "#agendaGeral .linha-agenda"
    );

    let quantidadeVisivel = 0;

    linhas.forEach(linha => {
        const campoHorario =
            linha.querySelector(".horario") ||
            linha.firstElementChild;

        const textoHorario = campoHorario?.textContent.trim();
        const hora = Number(textoHorario?.split(":")[0]);

        if (!Number.isFinite(hora)) return;

        const visivel = hora >= horaInicial && hora <= horaFinal;
        linha.style.display = visivel ? "" : "none";

        if (visivel) quantidadeVisivel++;
    });

    const camada = document.getElementById("camadaAgendamentos");

    camada.style.height = `${quantidadeVisivel * 80}px`;
    camada.style.gridTemplateRows =
        `repeat(${quantidadeVisivel}, 80px)`;

    agendamentosTeste.forEach(agendamento => {
        const [hora, minuto] = agendamento.inicio
            .split(":")
            .map(Number);

        const inicio = hora * 60 + minuto;
        const fim = inicio + agendamento.duracao;
        const limiteInicial = horaInicial * 60;
        const limiteFinal = horaFinal * 60;

        if (!agendamento.bloco) return;

    agendamento.bloco.style.display =
        inicio >= limiteInicial && fim <= limiteFinal
            ? ""
            : "none";
    });
}

aplicarHorarioFuncionamento();

/* BUSCA DE CLIENTES NA AGENDA */


const campoBuscaAgenda =
    document.getElementById("campoBuscaAgenda");

const btnPesquisarAgenda =
    document.getElementById("btnPesquisarAgenda");

const resultadoBuscaAgenda =
    document.getElementById("resultadoBuscaAgenda");

btnPesquisarAgenda.addEventListener("click", pesquisarClienteAgenda);


/* BUSCA AUTOMÁTICA AO DIGITAR */

let temporizadorBuscaAgenda;

campoBuscaAgenda.addEventListener("input", function() {
    clearTimeout(temporizadorBuscaAgenda);

    const termo = campoBuscaAgenda.value.trim();

    // Limpa os resultados quando o campo fica vazio
    if (!termo) {
        resultadoBuscaAgenda.replaceChildren();
        clienteSelecionadoAgenda = null;
        petSelecionadoAgenda = null;
        return;
    }

    // Aguarda uma pequena pausa antes de pesquisar
    temporizadorBuscaAgenda = setTimeout(() => {
        pesquisarClienteAgenda();
    }, 300);
});


campoBuscaAgenda.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        pesquisarClienteAgenda();
    }
});

async function pesquisarClienteAgenda() {
    const busca = campoBuscaAgenda.value.trim();

    if (!busca) {
        cliquesBuscaVazia++;

        if (cliquesBuscaVazia >= 2) {
            alert("DIGITE O NOME, TELEFONE OU CPF/CNPJ DO CLIENTE.");
            cliquesBuscaVazia = 0;
        }

        campoBuscaAgenda.focus();
        return;
    }

    cliquesBuscaVazia = 0;
    clienteSelecionadoAgenda = null;
    petSelecionadoAgenda = null;
    resultadoBuscaAgenda.replaceChildren();

    try {
        const resposta = await fetch(
            `http://localhost:3000/clientes?busca=${encodeURIComponent(busca)}`
        );

        const clientes = await resposta.json();

        if (!resposta.ok) {
            throw new Error(clientes.erro || "Erro ao buscar clientes.");
        }

       
if (!Array.isArray(clientes) || clientes.length === 0) {
    resultadoBuscaAgenda.replaceChildren();

    const aviso = document.createElement("p");
    aviso.textContent = "NENHUM CLIENTE ENCONTRADO.";

    const botaoCadastro = document.createElement("button");
    botaoCadastro.type = "button";
    botaoCadastro.textContent = "CADASTRAR NOVO CLIENTE";
    botaoCadastro.className = "botao-cadastrar-cliente-agenda";

    botaoCadastro.addEventListener("click", () => {
        window.location.href = "cliente.html";
    });

    const linhaAviso = document.createElement("div");
    linhaAviso.className = "linha-aviso-cliente";
    linhaAviso.append(aviso, botaoCadastro);

    resultadoBuscaAgenda.appendChild(linhaAviso);
    return;
}

        clientes.forEach(cliente => {
            const linha = document.createElement("div");
            linha.className = "resultado-cliente-agenda";

            const nome = document.createElement("span");
            nome.textContent = cliente.nome;

            const telefone = document.createElement("small");
            telefone.textContent = cliente.telefone || "";

            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "SELECIONAR";

            botao.addEventListener("click", () => {
                selecionarClienteAgenda(cliente);
            });

            linha.append(nome, telefone, botao);
            resultadoBuscaAgenda.appendChild(linha);
        });
    } catch (erro) {
        console.error("Erro ao buscar clientes:", erro);
        resultadoBuscaAgenda.textContent =
            "NÃO FOI POSSÍVEL CONECTAR AO SERVIDOR.";
    }
}


async function selecionarClienteAgenda(cliente) {
    clienteSelecionadoAgenda = cliente;
    petSelecionadoAgenda = null;
    resultadoBuscaAgenda.replaceChildren();

    const painelPets = document.createElement("div");
    painelPets.className = "painel-pets-agenda";

    const titulo = document.createElement("p");
    titulo.className = "cliente-selecionado-agenda";
    titulo.textContent = `CLIENTE: ${cliente.nome}`;

    const instrucao = document.createElement("p");
    instrucao.className = "instrucao-pets-agenda";
    instrucao.textContent = "SELECIONE O PET:";

    const listaPets = document.createElement("div");
    listaPets.className = "lista-pets-agenda";

    painelPets.append(titulo, instrucao, listaPets);
    resultadoBuscaAgenda.appendChild(painelPets);

    try {
        const resposta = await fetch(
            `http://localhost:3000/pets/${cliente.id}`
        );

        const pets = await resposta.json();

        if (!resposta.ok) {
            throw new Error("Erro ao carregar os pets.");
        }

        if (!Array.isArray(pets) || pets.length === 0) {
            const aviso = document.createElement("p");
            aviso.textContent = "ESTE CLIENTE NÃO POSSUI PETS CADASTRADOS.";
            listaPets.appendChild(aviso);
            return;
        }

        pets.forEach(pet => {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "botao-pet-agenda";
            botao.textContent = pet.nomePet;

            botao.addEventListener("click", () => {
                petSelecionadoAgenda = pet;
                listaPets.querySelectorAll("button").forEach(botaoPet => {
                    botaoPet.classList.remove("pet-selecionado");
                });

                botao.classList.add("pet-selecionado");
            });

            listaPets.appendChild(botao);
        });
    } catch (erro) {
        console.error("Erro ao carregar pets:", erro);
        listaPets.textContent = "NÃO FOI POSSÍVEL CARREGAR OS PETS.";
    }
}
// ABRIR NOVO AGENDAMENTO AO CLICAR NA AGENDA SEMANAL

function abrirNovoAgendamento(dia, horario) {
    const dataSemana = inicioDaSemana(dataReferencia);
    const dataSelecionada = new Date(dataSemana);

    dataSelecionada.setDate(
        dataSemana.getDate() + dia - 1
    );
    
/* IMPEDIR AGENDAMENTOS EM DIAS PASSADOS */

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const dataVerificada = new Date(dataSelecionada);
dataVerificada.setHours(0, 0, 0, 0);

if (dataVerificada < hoje) {
    alert("NÃO É POSSÍVEL AGENDAR EM DIA ANTERIOR AO ATUAL.");
    return;
}
    const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR");

    const novoAgendamento = {
    dia: dia,
    data: dataFormatada,
    inicio: horario,
    duracao: 30,
    cliente: "",
    idCliente: null,
    pet: "",
    idPet: null,
    servico: "",
    codigoServico: null
};
   // VINCULAR CLIENTE E PET PELOS IDS
if (clienteSelecionadoAgenda && petSelecionadoAgenda) {
    novoAgendamento.cliente =
        clienteSelecionadoAgenda.nome.toUpperCase();

    novoAgendamento.idCliente =
        clienteSelecionadoAgenda.id;

    novoAgendamento.pet =
        petSelecionadoAgenda.nomePet.toUpperCase();

    novoAgendamento.idPet =
        petSelecionadoAgenda.id;
}

    agendamentoSelecionado = novoAgendamento;
    criandoNovoAgendamento = true;

    console.log("CLIENTE SELECIONADO:", clienteSelecionadoAgenda);
    console.log("PET SELECIONADO:", petSelecionadoAgenda);
    console.log("NOVO AGENDAMENTO:", novoAgendamento);
    document.getElementById("infoCliente").textContent = "";
    document.getElementById("infoPet").textContent = "";
    document.getElementById("infoServico").textContent = "";

    // DATA E HORÁRIO SELECIONADOS
    document.getElementById("infoData").textContent = dataFormatada;
    document.getElementById("infoHorario").textContent = horario;

    document.getElementById("editarCliente").value = novoAgendamento.cliente;

    document.getElementById("editarPet").value = novoAgendamento.pet;
    document.getElementById("editarServico").value = "";
    document.getElementById("editarInicio").value = horario;

    document.getElementById("janelaAgendamento").style.display = "flex";

    definirModoEdicao(true);

    // MANTER A DATA VISÍVEL DURANTE A EDIÇÃO//
    document.getElementById("infoData").style.display = "flex";

    document.getElementById("btnEditarAgendamento").textContent = "SALVAR";
}
    document.addEventListener("click", function (evento) {
    const espaco = evento.target.closest(".espaco-dia");

    if (!espaco) return;



    console.log("CLIQUE NO ESPAÇO VAZIO DA AGENDA");



    const linha = espaco.closest(".linha-agenda");
    if (!linha) return;

    const campoHorario = linha.querySelector(".horario");
    if (!campoHorario) return;

    const hora = Number(
        campoHorario.textContent.trim().split(":")[0]
    );

    const retangulo = espaco.getBoundingClientRect();

    if (retangulo.height === 0) return;

    const posicaoY = evento.clientY - retangulo.top;

    const minutos = Math.min(
        45,
        Math.max(0, Math.floor(
            (posicaoY / retangulo.height) * 4
        ) * 15)
    );

    const coluna = Array.from(
        linha.querySelectorAll(".espaco-dia")
    ).indexOf(espaco);

    if (coluna < 0 || coluna > 6) return;

    const horario =
        String(hora).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0");

    abrirNovoAgendamento(coluna + 1, horario);
});

// RECOLHE BLOCOS CONFIGURAÇÃO//
document.querySelectorAll(".titulo-secao-configuracao")
    .forEach(botao => {
        botao.addEventListener("click", () => {
            const expandido =
                botao.getAttribute("aria-expanded") === "true";

            const conteudo = document.getElementById(
                botao.getAttribute("aria-controls")
            );

            botao.setAttribute("aria-expanded", String(!expandido));
            conteudo.hidden = expandido;
        });
    });
    function restaurarConfiguracoesPadrao() {
    const confirmar = confirm(
        "DESEJA RESTAURAR HORÁRIOS, CORES, " +
        "NOMES E DURAÇÕES PADRÃO DOS SERVIÇOS?"
    );

    if (!confirmar) return;

    configuracoesAgenda = {
        horarioInicial: "08:00",
        horarioFinal: "20:00",
        servicos: servicosPadrao.map(servico => ({
            ...servico,
            duracaoPadrao: Number(servico.duracaoPadrao) || 30
        }))
    };

    servicosConfigurados = configuracoesAgenda.servicos;

    try {
        localStorage.setItem(
            CHAVE_CONFIGURACOES,
            JSON.stringify(configuracoesAgenda)
        );
    } catch (erro) {
        alert("NÃO FOI POSSÍVEL SALVAR AS CONFIGURAÇÕES.");
        console.error(erro);
        return;
    }

    preencherHorarios("horarioInicial", "08:00");
    preencherHorarios("horarioFinal", "20:00");

    montarListaConfiguracao();
    atualizarLegendaServicos();

    alert("CONFIGURAÇÕES PADRÃO RESTAURADAS.");
}
document
    .getElementById("btnRestaurarPadroes")
    .addEventListener("click", restaurarConfiguracoesPadrao);

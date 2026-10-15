
/* SEMANA ATUAL */

let dataReferencia = new Date();
let agendamentoSelecionado = null;
let modoEdicao = false;


/* SERVIÇOS E CONFIGURAÇÕES */

const servicosPadrao = [
    { codigo: 1, nome: "BANHO", cor: "#ADD8E6" },
    { codigo: 2, nome: "TOSA", cor: "#F5D76E" },
    { codigo: 3, nome: "TOSA HIGIÊNICA", cor: "#A9D6A0" },
    { codigo: 4, nome: "TOSA MANUAL", cor: "#F4B66A" },
    { codigo: 5, nome: "OUTRA CATEGORIA", cor: "#CDB8E8" },
    { codigo: 6, nome: "OUTRA CATEGORIA", cor: "#EDB6CC" },
    { codigo: 7, nome: "OUTRA CATEGORIA", cor: "#A8DCD7" },
    { codigo: 8, nome: "OUTRA CATEGORIA", cor: "#F2B5A7" },
    { codigo: 9, nome: "OUTRA CATEGORIA", cor: "#B8CCF0" },
    { codigo: 10, nome: "OUTRA CATEGORIA", cor: "#D9DEE3" }
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
                        nome: salvo?.nome || padrao.nome
                    };
                })
            };
        }
    } catch (erro) {
        console.warn("Não foi possível carregar as configurações.", erro);
    }

    return {
        horarioInicial: "08:00",
        horarioFinal: "20:00",
        servicos: servicosPadrao.map(servico => ({ ...servico }))
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

document.getElementById("btnSemanaAnterior")
    .addEventListener("click", () => {
        dataReferencia.setDate(dataReferencia.getDate() - 7);
        atualizarSemana();
    });

document.getElementById("btnProximaSemana")
    .addEventListener("click", () => {
        dataReferencia.setDate(dataReferencia.getDate() + 7);
        atualizarSemana();
    });

atualizarSemana();

/* AGENDAMENTOS DE TESTE */


/* AGENDAMENTOS SALVOS */

const CHAVE_AGENDAMENTOS = "agendaAgendamentos";

const agendamentosPadrao = [
    {
        dia: 6,
        inicio: "10:37",
        duracao: 30,
        cliente: "MARIA SILVA",
        pet: "TOBI",
        servico: "BANHO",
        codigoServico: 1
    },
    {
        dia: 6,
        inicio: "11:20",
        duracao: 30,
        cliente: "JOÃO SANTOS",
        pet: "LUNA",
        servico: "TOSA",
        codigoServico: 2
    }
];

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

    const horaInicial = Number(
    configuracoesAgenda.horarioInicial.split(":")[0]
);

const minutosDesdeInicio =
    (hora - horaInicial) * 60 + minuto;

    bloco.style.marginTop =
        `${(minutosDesdeInicio / 60) * 80}px`;

    bloco.style.height =
        `${(agendamento.duracao / 60) * 80}px`;
}

/* ABRE A JANELA DE AGENDAMENTO */

function abrirAgendamento(agendamento) {
    agendamentoSelecionado = agendamento;

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

    document.getElementById("janelaAgendamento").style.display =
        "flex";
}

/* CRIA OS AGENDAMENTOS */

function criarAgendamentosTeste() {
    const camada = document.getElementById("camadaAgendamentos");

    agendamentosTeste.forEach((agendamento, indice) => {
        const bloco = document.createElement("div");

        bloco.className = "agendamento-teste";
        bloco.dataset.agendamentoId = indice;

        agendamento.bloco = bloco;

        bloco.style.gridColumn = agendamento.dia + 1;
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

            const nome = elemento.querySelector(
                ".nome-categoria"
            );

            if (nome) {
                nome.textContent = servico.nome;
            } else if (elemento.lastElementChild) {
                elemento.lastElementChild.textContent = servico.nome;
            }
        }
    );
}

function montarListaConfiguracao() {
    listaConfiguracaoServicos.replaceChildren();

    servicosConfigurados.forEach(servico => {
        const linha = document.createElement("div");
        linha.className = "linha-configuracao-servico";

        const identificacao = document.createElement("span");
        identificacao.textContent = servico.codigo;
        identificacao.className = "numero-configuracao-servico";

        const cor = document.createElement("span");
        cor.className = "amostra-cor-configuracao";
        cor.style.backgroundColor = servico.cor;

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

        linha.append(identificacao, cor, campo);
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
        ...listaConfiguracaoServicos.querySelectorAll("input")
    ].map(campo => {
        const padrao = servicosPadrao.find(
            item => item.codigo === Number(campo.dataset.codigo)
        );

        return {
            ...padrao,
            nome: campo.value.trim().toUpperCase() || padrao.nome
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

        agendamento.bloco.style.display =
            inicio >= limiteInicial && fim <= limiteFinal
                ? ""
                : "none";
    });
}

aplicarHorarioFuncionamento();

/* BUSCA DE CLIENTES NA AGENDA */

let clienteSelecionadoAgenda = null;
let petSelecionadoAgenda = null;

const campoBuscaAgenda =
    document.getElementById("campoBuscaAgenda");

const btnPesquisarAgenda =
    document.getElementById("btnPesquisarAgenda");

const resultadoBuscaAgenda =
    document.getElementById("resultadoBuscaAgenda");

btnPesquisarAgenda.addEventListener("click", pesquisarClienteAgenda);

campoBuscaAgenda.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        pesquisarClienteAgenda();
    }
});

async function pesquisarClienteAgenda() {
    const busca = campoBuscaAgenda.value.trim();

    if (!busca) {
        alert("DIGITE O NOME, TELEFONE OU CPF/CNPJ DO CLIENTE.");
        campoBuscaAgenda.focus();
        return;
    }

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


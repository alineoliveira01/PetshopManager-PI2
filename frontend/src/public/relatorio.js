
/* RELATÓRIOS - PETSHOPMANAGER */

const CHAVE_AGENDAMENTOS_RELATORIO = "agendaAgendamentos";
const URL_API_RELATORIOS = "http://localhost:3000";

const dataInicial = document.getElementById("dataInicial");
const dataFinal = document.getElementById("dataFinal");
const filtroCliente = document.getElementById("filtroCliente");
const filtroPet = document.getElementById("filtroPet");
const filtroProcedimento = document.getElementById("filtroProcedimento");
const btnConsultar = document.getElementById("btnConsultar");
const btnLimpar = document.getElementById("btnLimpar");
const listaRelatorios = document.getElementById("listaRelatorios");
const totalResultados = document.getElementById("totalResultados");
const btnExportarPDF = document.getElementById("btnExportarPDF");
const btnExportarExcel = document.getElementById("btnExportarExcel");

let dadosRelatorioPDF = [];

let clientesRelatorio = [];
let petsRelatorio = [];

const cachePetsRelatorio = new Map();

async function buscarPetRelatorio(idPet) {
    if (!idPet) return null;

    if (cachePetsRelatorio.has(idPet)) {
        return cachePetsRelatorio.get(idPet);
    }

    try {
        const resposta = await fetch(
            `${URL_API_RELATORIOS}/pet/${idPet}`
        );

        if (!resposta.ok) return null;

        const pet = await resposta.json();

        cachePetsRelatorio.set(idPet, pet);

        return pet;
    } catch (erro) {
        console.error("Erro ao consultar pet:", erro);
        return null;
    }
}

function carregarAgendamentosRelatorio() {
    try {
        const dados = localStorage.getItem(
            CHAVE_AGENDAMENTOS_RELATORIO
        );

        if (dados === null) return [];

        const agendamentos = JSON.parse(dados);

        return Array.isArray(agendamentos) ? agendamentos : [];
    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);
        return [];
    }
}

function normalizarTexto(valor) {
    return String(valor || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
}

function converterData(data) {
    if (!data) return null;

    const partes = data.split("/");

    if (partes.length !== 3) return null;

    const [dia, mes, ano] = partes.map(Number);

    if (!dia || !mes || !ano) return null;

    return new Date(ano, mes - 1, dia);
}

function preencherProcedimentos(agendamentos) {
    const procedimentos = new Map();

    agendamentos.forEach(agendamento => {
        if (!agendamento.servico) return;

        const codigo = agendamento.codigoServico ?? "";
        const chave = `${codigo}|${agendamento.servico}`;

        procedimentos.set(chave, {
            codigo,
            nome: agendamento.servico
        });
    });

    filtroProcedimento.replaceChildren();

    const opcaoTodos = document.createElement("option");
    opcaoTodos.value = "";
    opcaoTodos.textContent = "TODOS OS PROCEDIMENTOS";
    filtroProcedimento.appendChild(opcaoTodos);

    [...procedimentos.values()]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .forEach(procedimento => {
            const opcao = document.createElement("option");

            opcao.value = procedimento.nome;
            opcao.textContent = procedimento.codigo !== ""
                ? `${procedimento.codigo} - ${procedimento.nome}`
                : procedimento.nome;

            filtroProcedimento.appendChild(opcao);
        });
}

async function carregarDadosAuxiliares() {
    try {
        const resposta = await fetch(
            `${URL_API_RELATORIOS}/clientes`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar os clientes.");
        }

        clientesRelatorio = await resposta.json();
    } catch (erro) {
        console.error("Erro ao consultar clientes:", erro);
        clientesRelatorio = [];
    }
}

function adicionarCelula(linha, valor) {
    const celula = document.createElement("td");
    celula.textContent = valor || "—";
    linha.appendChild(celula);
}

function mostrarMensagem(mensagem) {
    listaRelatorios.replaceChildren();

    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.colSpan = 7;
    celula.textContent = mensagem;

    linha.appendChild(celula);
    listaRelatorios.appendChild(linha);
}

async function consultarRelatorios() {
    const agendamentos = carregarAgendamentosRelatorio();

    preencherProcedimentos(agendamentos);

    const inicioFiltro = dataInicial.value
        ? new Date(`${dataInicial.value}T00:00:00`)
        : null;

    const fimFiltro = dataFinal.value
        ? new Date(`${dataFinal.value}T00:00:00`)
        : null;

    if (inicioFiltro && fimFiltro && inicioFiltro > fimFiltro) {
        alert("A DATA INICIAL NÃO PODE SER POSTERIOR À DATA FINAL.");
        return;
    }

    const clienteBusca = normalizarTexto(filtroCliente.value);
    const petBusca = normalizarTexto(filtroPet.value);
    const procedimentoBusca = normalizarTexto(
        filtroProcedimento.value
    );
  

    const resultados = agendamentos.filter(agendamento => {
        const data = converterData(agendamento.data);

        if (inicioFiltro && (!data || data < inicioFiltro)) {
            return false;
        }

        if (fimFiltro && (!data || data > fimFiltro)) {
            return false;
        }

        if (
            clienteBusca &&
            !normalizarTexto(agendamento.cliente).includes(clienteBusca)
        ) {
            return false;
        }

        if (
            petBusca &&
            !normalizarTexto(agendamento.pet).includes(petBusca)
        ) {
            return false;
        }

        if (
            procedimentoBusca &&
            normalizarTexto(agendamento.servico) !== procedimentoBusca
        ) {
            return false;
        }

        return true;
    });

    listaRelatorios.replaceChildren();

    if (resultados.length === 0) {
     mostrarMensagem(
    "NENHUM ATENDIMENTO ENCONTRADO COM ESSES FILTROS."
);

        totalResultados.textContent = "0 ATENDIMENTOS ENCONTRADOS.";
        return;
    }

    
dadosRelatorioPDF = [];

for (const agendamento of resultados) {
    const linha = document.createElement("tr");

    const pet = await buscarPetRelatorio(agendamento.idPet);

    const nomePet = pet?.nomePet || agendamento.pet || "—";
    const sexoPet = pet?.sexo || "—";
    const procedimento = agendamento.servico || "—";

    const detalhes = pet
        ? [
            pet.detalhesServico,
            pet.caracteristicasPet,
            pet.observacoes
        ].filter(Boolean).join(" | ")
        : "";

    adicionarCelula(linha, agendamento.data);
    adicionarCelula(linha, agendamento.cliente);
    adicionarCelula(linha, nomePet);
    adicionarCelula(linha, sexoPet);
    adicionarCelula(linha, procedimento);
    adicionarCelula(linha, detalhes || "—");

    listaRelatorios.appendChild(linha);

    dadosRelatorioPDF.push([
        agendamento.data || "—",
        agendamento.cliente || "—",
        nomePet,
        sexoPet,
        procedimento,
        detalhes || "—"
    ]);
}

    totalResultados.textContent =
        `${resultados.length} ATENDIMENTO(S) ENCONTRADO(S).`;
}

btnConsultar.addEventListener("click", consultarRelatorios);

btnLimpar.addEventListener("click", () => {
    dataInicial.value = "";
    dataFinal.value = "";
    filtroCliente.value = "";
    filtroPet.value = "";
    filtroProcedimento.value = "";
    
    consultarRelatorios();
});

async function iniciarRelatorios() {
    await carregarDadosAuxiliares();

    const agendamentos = carregarAgendamentosRelatorio();

    preencherProcedimentos(agendamentos);
    consultarRelatorios();
}

iniciarRelatorios();

/* EXPORTAR RELATÓRIO EM PDF */

btnExportarPDF.addEventListener("click", () => {
    if (dadosRelatorioPDF.length === 0) {
        alert("CONSULTE OS ATENDIMENTOS ANTES DE EXPORTAR O PDF.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("NÃO FOI POSSÍVEL CARREGAR A BIBLIOTECA DE PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const documento = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    documento.setFont("helvetica", "bold");
    documento.setFontSize(16);
    documento.text("PETSHOP - RELATÓRIO DE ATENDIMENTOS", 14, 16);

    documento.setFont("helvetica", "normal");
    documento.setFontSize(10);

    const periodo = dataInicial.value || dataFinal.value
        ? `PERÍODO: ${dataInicial.value || "INÍCIO NÃO INFORMADO"} ATÉ ${dataFinal.value || "DATA ATUAL"}`
        : "PERÍODO: TODOS OS ATENDIMENTOS";

    documento.text(periodo, 14, 24);
    documento.text(
        `TOTAL DE ATENDIMENTOS: ${dadosRelatorioPDF.length}`,
        14,
        30
    );
    documento.text(
        `GERADO EM: ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        36
    );

    documento.autoTable({
        startY: 42,
        head: [[
            "DATA",
            "CLIENTE",
            "PET",
            "SEXO",
            "PROCEDIMENTO",
            "DETALHES"
        ]],
        body: dadosRelatorioPDF,
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak"
        },
        headStyles: {
            fillColor: [82, 116, 129],
            textColor: 255
        },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 38 },
            2: { cellWidth: 28 },
            3: { cellWidth: 18 },
            4: { cellWidth: 38 },
            5: { cellWidth: "auto" }
        },
        margin: {
            left: 14,
            right: 14
        }
    });

    documento.save("relatorio-petshop.pdf");
});
/* EXPORTAR RELATÓRIO PARA EXCEL */

btnExportarExcel.addEventListener("click", () => {
    if (dadosRelatorioPDF.length === 0) {
        alert("CONSULTE OS ATENDIMENTOS ANTES DE EXPORTAR.");
        return;
    }

    if (typeof XLSX === "undefined") {
        alert("NÃO FOI POSSÍVEL CARREGAR A BIBLIOTECA DO EXCEL.");
        return;
    }

    const cabecalho = [
        "DATA",
        "CLIENTE",
        "PET",
        "SEXO",
        "PROCEDIMENTO",
        "DETALHES"
    ];

    const dados = [
        ["PETSHOP - RELATÓRIO DE ATENDIMENTOS"],
        [`PERÍODO: ${dataInicial.value || "INÍCIO NÃO INFORMADO"} ATÉ ${dataFinal.value || "DATA ATUAL"}`],
        [`TOTAL DE ATENDIMENTOS: ${dadosRelatorioPDF.length}`],
        [],
        cabecalho,
        ...dadosRelatorioPDF
    ];

    const planilha = XLSX.utils.aoa_to_sheet(dados);

    planilha["!cols"] = [
        { wch: 14 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 25 },
        { wch: 50 }
    ];

    const pastaTrabalho = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        pastaTrabalho,
        planilha,
        "Relatório"
    );

    XLSX.writeFile(
        pastaTrabalho,
        "relatorio-petshop.xlsx"
    );
});
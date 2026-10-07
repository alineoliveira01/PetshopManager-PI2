/* SEMANA ATUAL */

let dataReferencia = new Date();

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


/* SEMANA ANTERIOR */

document.getElementById("btnSemanaAnterior").addEventListener("click", () => {
    dataReferencia.setDate(dataReferencia.getDate() - 7);
    atualizarSemana();
});


/* PRÓXIMA SEMANA */

document.getElementById("btnProximaSemana").addEventListener("click", () => {
    dataReferencia.setDate(dataReferencia.getDate() + 7);
    atualizarSemana();
});


/* INICIA NA SEMANA ATUAL */

atualizarSemana();
/* TESTE DE AGENDAMENTOS */

const agendamentosTeste = [
    {
        dia: 6,
        inicio: "10:37",
        duracao: 30
    },
    {
        dia: 6,
        inicio: "11:20",
        duracao: 30
    }
];

function criarAgendamentosTeste() {

    const camada = document.getElementById("camadaAgendamentos");

    agendamentosTeste.forEach(agendamento => {

        const [hora, minuto] = agendamento.inicio
            .split(":")
            .map(Number);

        const fimMinutos =
            hora * 60 +
            minuto +
            agendamento.duracao;

        const horaFim = Math.floor(fimMinutos / 60);
        const minutoFim = fimMinutos % 60;

        const linha = hora - 8 + 1;

        const bloco = document.createElement("div");

        bloco.className = "agendamento-teste";

        bloco.innerHTML = `
            TESTE
            <small>
                ${agendamento.inicio} -
                ${String(horaFim).padStart(2, "0")}:
                ${String(minutoFim).padStart(2, "0")}
            </small>
        `;

        bloco.style.gridColumn = agendamento.dia;
        bloco.style.gridRow = linha;
        bloco.style.top = `${(minuto / 60) * 80}px`;
        bloco.style.height = `${(agendamento.duracao / 60) * 80}px`;

        camada.appendChild(bloco);
    });
}

criarAgendamentosTeste();
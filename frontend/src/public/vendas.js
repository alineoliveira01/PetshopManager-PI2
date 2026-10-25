const formVenda = document.getElementById("formVenda");
const buscaCliente = document.getElementById("buscaClienteVenda");
const dadosCliente = document.getElementById("dadosClienteSelecionado");
const dadosPet = document.getElementById("dadosPet");
const tiposVenda = document.querySelectorAll('input[name="tipoVenda"]');

/* NOVA VENDA */

document.getElementById("btnNovaVenda").addEventListener("click", () => {
    formVenda.reset();
    buscaCliente.hidden = false;
    dadosCliente.hidden = true;
    dadosPet.hidden = true;
    document.getElementById("dataVenda").value = new Date().toISOString().split("T")[0];
});

/* TIPO DE VENDA */

tiposVenda.forEach(tipo => {
    tipo.addEventListener("change", () => {
        const vendaCliente = tipo.value === "cliente";
        buscaCliente.hidden = !vendaCliente;
        dadosCliente.hidden = true;
        dadosPet.hidden = true;
    });
});

/* BUSCAR CLIENTE PARA A VENDA */

const campoBuscaCliente = document.getElementById("campoBuscaCliente");
const btnPesquisarCliente = document.getElementById("btnPesquisarCliente");
const listaClientesVenda = document.getElementById("listaClientesVenda");
const tabelaClientesVenda = document.getElementById("tabelaClientesVenda");

btnPesquisarCliente.addEventListener("click", pesquisarClientesVenda);

async function pesquisarClientesVenda() {
    const termo = campoBuscaCliente.value.trim();

    if (!termo) {
        tabelaClientesVenda.innerHTML = "";
        listaClientesVenda.hidden = true;
        alert("Digite o nome do cliente ou do pet.");
        campoBuscaCliente.focus();
        return;
    }

    try {
        const agendamentosSalvos = JSON.parse(
        localStorage.getItem("agendaAgendamentos") || "[]"
    );

        const agendamentos = agendamentosSalvos.filter(agendamento => {
        const cliente = (agendamento.cliente || "").toUpperCase();
        const pet = (agendamento.pet || "").toUpperCase();
        const busca = termo.toUpperCase();

        return cliente.includes(busca) || pet.includes(busca);
    });

    
        agendamentosEncontradosVenda = agendamentos;
        tabelaClientesVenda.innerHTML = "";

        if (agendamentos.length === 0) {
            tabelaClientesVenda.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum agendamento encontrado.</td>
                </tr>
            `;
        } else {
            agendamentos.forEach((agendamento, indice) => {
                const linha = document.createElement("tr");

                [
                    agendamento.data || "",
                    agendamento.inicio || "",
                    agendamento.cliente || "",
                    agendamento.pet || "",
                    agendamento.servico || ""
                ].forEach(valor => {
                    const celula = document.createElement("td");
                    celula.textContent = valor;
                    linha.appendChild(celula);
                });

                const celulaAcao = document.createElement("td");
                const botao = document.createElement("button");

                botao.type = "button";
                botao.textContent = "Selecionar";

                botao.addEventListener("click", () => {
                    selecionarAgendamentoVenda(agendamento);
                });

                celulaAcao.appendChild(botao);
                linha.appendChild(celulaAcao);
                tabelaClientesVenda.appendChild(linha);
            });
        }

        listaClientesVenda.hidden = false;


    } catch (erro) {
    console.error("Erro ao pesquisar agendamentos:", erro);
    alert("Não foi possível carregar os agendamentos.");
}
}

/* AGENDAMENTOS ENCONTRADOS PARA A VENDA */
let agendamentosEncontradosVenda = [];

/* SELECIONAR AGENDAMENTO PARA A VENDA */
async function selecionarAgendamentoVenda(agendamento) {
    const campoIdCliente = document.getElementById("idClienteVenda");
    const campoNomeCliente = document.getElementById("clienteSelecionado");
    const campoTelefone = document.getElementById("telefoneCliente");
    const campoCpfCnpj = document.getElementById("cpfCnpjCliente");
    
    document.getElementById("atendimentoVenda").value =
    agendamento.servico || "";

    campoNomeCliente.value = agendamento.cliente || "";
    campoTelefone.value = "";
    campoCpfCnpj.value = "";

    try {
    const resposta = await fetch(
        `http://localhost:3000/clientes?busca=${encodeURIComponent(agendamento.cliente || "")}`
    );

    const clientes = await resposta.json();

    if (!resposta.ok) {
        throw new Error(clientes.erro || "Erro ao consultar cliente.");
    }

    const cliente = clientes.find(
        item => item.nome?.toUpperCase() ===
            (agendamento.cliente || "").toUpperCase()
    );

    if (cliente) {
        campoIdCliente.value = cliente.id;
        campoNomeCliente.value = cliente.nome || "";
        campoTelefone.value = cliente.telefone || "";
        campoCpfCnpj.value = cliente.cpfCnpj || "";
    } else {
        campoIdCliente.value = "";
        alert("Não foi encontrado o cadastro completo deste cliente.");
    }
} catch (erro) {
    console.error("Erro ao consultar cadastro do cliente:", erro);
    campoIdCliente.value = "";
    alert("Não foi possível carregar os dados completos do cliente.");
}
    const campoPet = document.getElementById("petSelecionado");
    campoPet.replaceChildren();

    const opcaoPet = document.createElement("option");
    opcaoPet.value = agendamento.pet || "";
    opcaoPet.textContent = agendamento.pet || "Pet não informado";
    campoPet.appendChild(opcaoPet);

    // A DATA DO AGENDAMENTO NÃO CONFIRMA A ÚLTIMA VISITA REALIZADA.
    document.getElementById("ultimaVisita").value = "";

    buscaCliente.hidden = true;
    listaClientesVenda.hidden = true;
    dadosCliente.hidden = false;
    dadosClienteSelecionado.hidden = false;
    dadosPet.hidden = false;
}



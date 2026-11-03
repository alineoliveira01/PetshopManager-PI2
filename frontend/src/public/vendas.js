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


let petsVendaCliente = [];
let petPadraoVendaId = "";


async function carregarPetsVenda(idCliente, nomePetAgendamento) {

    try {
        const resposta = await fetch(
            `http://localhost:3000/pets/${idCliente}`
        );

        const pets = await resposta.json();

        if (!resposta.ok) {
            throw new Error(pets.erro || "Erro ao carregar pets.");
        }

        petsVendaCliente = pets;

        // Identifica o pet do agendamento selecionado
        const petPadrao = pets.find(pet =>
            pet.nomePet?.toUpperCase() ===
            (nomePetAgendamento || "").toUpperCase()
        );

        petPadraoVendaId = petPadrao ? String(petPadrao.id) : "";
       

        // Atualiza o campo Pet que já existe nos dados da venda
        const campoPet = document.getElementById("petSelecionado");

        campoPet.replaceChildren();

        pets.forEach(pet => {
            const opcao = document.createElement("option");

            opcao.value = pet.id;
            opcao.textContent = pet.nomePet;

            if (String(pet.id) === petPadraoVendaId) {
                opcao.selected = true;
            }

            campoPet.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar pets da venda:", erro);
        petsVendaCliente = [];
        petPadraoVendaId = "";

        alert("Não foi possível carregar os pets deste cliente.");
    }
}

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
        if (campoIdCliente.value) {
        await carregarPetsVenda(
            campoIdCliente.value,
            agendamento.pet
        );
    }

    // A DATA DO AGENDAMENTO NÃO CONFIRMA A ÚLTIMA VISITA REALIZADA.
    document.getElementById("ultimaVisita").value = "";

    buscaCliente.hidden = true;
    listaClientesVenda.hidden = true;
    dadosCliente.hidden = false;
    dadosClienteSelecionado.hidden = false;
    dadosPet.hidden = false;
}

// ADICIONAR ITEM À VENDA

const btnAdicionarItem = document.getElementById("btnAdicionarItem");
const tabelaItensVenda = document.getElementById("tabelaItensVenda");

btnAdicionarItem.addEventListener("click", function () {

    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td>
           <select class="tipoItem">
                <option value="servico">Serviço</option>
                <option value="produto">Produto</option>
            </select>
        </td>

                <td>
            <input type="text" class="nomeItem"
                   placeholder="Produto ou serviço">
        </td>

        <td>
            <select class="petItem">
                <option value="">Sem pet</option>
            </select>
        </td>

        <td>
            <input type="number" class="quantidadeItem"
                   min="1" value="1">
        </td>

        <td>
            <input type="number" class="valorUnitario"
                   min="0" step="0.01" placeholder="0,00">
        </td>

        <td>
            <input type="number" class="descontoItem"
                   min="0" step="0.01" value="0">
        </td>

        <td>
            <input type="number" class="totalItem"
                   readonly value="0">
        </td>

        <td>
            <button type="button" class="btnExcluirItem">
                Excluir
            </button>
        </td>
    `;

    tabelaItensVenda.appendChild(linha);

    // CARREGAR PETS NA LINHA DA VENDA

    const campoPetItem = linha.querySelector(".petItem");

    petsVendaCliente.forEach(pet => {
        const opcao = document.createElement("option");

        opcao.value = pet.id;
        opcao.textContent = pet.nomePet;

        campoPetItem.appendChild(opcao);
    });

    // PET ATUALMENTE SELECIONADO

    const petAtual = document.getElementById("petSelecionado");

    campoPetItem.value = petAtual.value || String(petPadraoVendaId);

    // SELECIONAR O PET DO AGENDAMENTO

    const tipoItem = linha.querySelector(".tipoItem");

    tipoItem.addEventListener("change", function() {

        if (this.value === "servico") {
            const petAtual = document.getElementById("petSelecionado");

            campoPetItem.value =
                petAtual.value || String(petPadraoVendaId);

        } else {
            campoPetItem.value = "";
        }

    });

    if (tipoItem.value === "servico") {
        campoPetItem.value =
            petAtual.value || String(petPadraoVendaId);
    }

    atualizarEventosItem(linha);

});

// ATUALIZAR VALORES DO ITEM

function atualizarEventosItem(linha) {

    const quantidade = linha.querySelector(".quantidadeItem");
    const valorUnitario = linha.querySelector(".valorUnitario");
    const desconto = linha.querySelector(".descontoItem");
    const total = linha.querySelector(".totalItem");

    function calcularItem() {

        const qtd = Number(quantidade.value) || 0;
        const valor = Number(valorUnitario.value) || 0;
        const desc = Number(desconto.value) || 0;

        total.value = Math.max(0, (qtd * valor) - desc).toFixed(2);

        calcularValoresVenda();
    }

    quantidade.addEventListener("input", calcularItem);
    valorUnitario.addEventListener("input", calcularItem);
    desconto.addEventListener("input", calcularItem);

    linha.querySelector(".btnExcluirItem")
        .addEventListener("click", function () {

            linha.remove();
            calcularValoresVenda();

        });
}


// CALCULAR VALORES GERAIS DA VENDA

function calcularValoresVenda() {

    let bruto = 0;

    document.querySelectorAll(".totalItem").forEach(item => {
        bruto += Number(item.value) || 0;
    });

    const descontoVenda = Number(
        document.getElementById("descontoVenda").value
    ) || 0;

    const taxaPagamento = Number(
        document.getElementById("taxaPagamento").value
    ) || 0;

    const valorVenda = Math.max(0, bruto - descontoVenda);
    const valorLiquido = Math.max(0, valorVenda - taxaPagamento);

    document.getElementById("valorBruto").value = bruto.toFixed(2);

    document.getElementById("valorVenda").value =
        valorVenda.toFixed(2);

    document.getElementById("valorLiquido").value =
        valorLiquido.toFixed(2);

    calcularTroco();
}


// ATUALIZAR CÁLCULOS QUANDO ALTERAR DESCONTO OU TAXA

document.getElementById("descontoVenda")
    .addEventListener("input", calcularValoresVenda);

document.getElementById("taxaPagamento")
    .addEventListener("input", calcularValoresVenda);


// CALCULAR TROCO

function calcularTroco() {

    const recebido = Number(
        document.getElementById("valorRecebido").value
    ) || 0;

    const liquido = Number(
        document.getElementById("valorLiquido").value
    ) || 0;

    document.getElementById("troco").value =
        Math.max(0, recebido - liquido).toFixed(2);
}

document.getElementById("valorRecebido")
    .addEventListener("input", calcularTroco);

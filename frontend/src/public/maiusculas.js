
/* CONVERTE TEXTO EM MAIÚSCULAS */

document.addEventListener("input", event => {
    const campo = event.target;

    if (
        !campo.matches(
            'input[type="text"], input:not([type]), textarea')) {
        return;
    }
    const inicio = campo.selectionStart;
    const fim = campo.selectionEnd;
    const valor = campo.value.toUpperCase();

    if (campo.value !== valor) {
        campo.value = valor;

        if (inicio !== null && fim !== null) {
            campo.setSelectionRange(inicio, fim);
        }
    }
});

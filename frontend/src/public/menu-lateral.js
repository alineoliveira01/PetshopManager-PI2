
/* ABRIR E ESCONDER MENU LATERAL */

const menuLateral = document.getElementById("menuLateral");
const btnRecolherMenu = document.getElementById("btnRecolherMenu");
const btnAbrirMenu = document.getElementById("btnAbrirMenu");

if (menuLateral && btnRecolherMenu && btnAbrirMenu) {
    btnRecolherMenu.addEventListener("click", () => {
        menuLateral.classList.add("escondido");
        btnAbrirMenu.hidden = false;
    });

    btnAbrirMenu.addEventListener("click", () => {
        menuLateral.classList.remove("escondido");
        btnAbrirMenu.hidden = true;
    });
}


const definirTema = tema => document.documentElement.className = tema;
const local = localStorage.getItem('tema');

if (local == 1) {
    definirTema('escuro');
} else {
    localStorage.setItem('tema', 0);
    definirTema('claro');
}

function temaAtual (valor) {
    if (valor == 0) {
        localStorage.setItem('tema', 0);
        definirTema('claro');
    }
    if (valor == 1) {
        localStorage.setItem('tema', 1);
        definirTema('escuro');
    }
}
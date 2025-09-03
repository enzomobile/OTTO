document.querySelectorAll(".botao-navegar").forEach(function(botao) {
    botao.addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });
});
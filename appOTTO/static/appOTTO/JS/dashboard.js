document.addEventListener("DOMContentLoaded", function () {
    // Depois de deslogar, se o usuário voltar para a página de dashboard, ele será redirecionado para a página de login.
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });
});

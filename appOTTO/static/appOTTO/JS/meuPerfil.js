document.addEventListener('submit', function verificacao(e) {
    e.preventDefault();
    var usuario = document.forms["form"]["nome_usuario"].value;
    var completo = document.forms["form"]["nome_completo"].value;

    if (usuario.trim() == "" && completo.trim() == "") {
        alert("Preencha pelo menos um dos campos.");
        return;
    };

    if (confirm("Tem certeza de que deseja alterar seu(s) nome(s)?") == true) {
        e.target.submit();
    };
    return;
});
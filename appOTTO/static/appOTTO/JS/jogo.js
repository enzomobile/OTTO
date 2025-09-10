 // Inicializar workspace SEM toolbox
 const workspace = Blockly.inject('blocklyDiv', { toolbox: null });

 // Função para criar blocos a partir do footer
 function criarBloco(tipo) {
     const bloco = workspace.newBlock(tipo);
     bloco.initSvg();
     bloco.render();

     // Centralizar no workspace
     const metrics = workspace.getMetrics();
     const centerX = (metrics.viewWidth / 2) - (bloco.getHeightWidth().width / 2);
     const centerY = (metrics.viewHeight / 2) - (bloco.getHeightWidth().height / 2);

     bloco.moveBy(centerX, centerY);
 }

const respostasFases = [
    null,                // índice 0 (ignorado, já que começa da fase 1)
    "0",             // fase 1: deve ter "print"
    "if",                // fase 2: deve usar "if"
    "while",             // fase 3: deve usar "while"
    "for",               // fase 4: deve usar "for"
    "function",          // fase 5: deve usar "function"
    "variable",          // fase 6: exemplo
    "repeat",            // fase 7: exemplo
    "math",              // fase 8: exemplo
    "logic",             // fase 9: exemplo
    "array"              // fase 10: exemplo
];


function mostrarCodigo(numeroFase) {
    var codigo = Blockly.Python.workspaceToCode(workspace).trim();;
    document.getElementById("codigoGerado").textContent = codigo;

    // Resposta esperada da fase
    var respostaEsperada = respostasFases[numeroFase];

    if (respostaEsperada == codigo) {
        mostrarMensagem("Parabéns! Você concluiu a fase.", "success");
        setTimeout(function() {
            concluirFase(numeroFase);
        }, 3000); 
    } else {
        mostrarMensagem("Ops! Tente novamente.", "error");
    }
}

function concluirFase(numero) {
    // Redireciona para salvar no banco e depois abrir pos_fase.html
    window.location.href = `/concluir_fase/${numero}/`;
}

// Função para mostrar mensagens (usando CSS já existente)
function mostrarMensagem(texto, tipo) {
    // remove mensagens antigas
    document.querySelectorAll(".messages").forEach(m => m.remove());

    const ul = document.createElement("ul");
    ul.className = "messages " + tipo;
    ul.innerHTML = `<li>${texto}</li>`;
    document.body.appendChild(ul);

    // sumir depois de 3s
    setTimeout(() => ul.remove(), 3000);
}


// Pega o ícone e a lista
const menuIcon = document.getElementById("menuIcon");
const menuLista = document.getElementById("menuLista");

// Quando clicar no ícone ☰, alterna mostrar/esconder
menuIcon.addEventListener("click", function() {
    menuLista.style.display = (menuLista.style.display === "flex") ? "none" : "flex";
});

const Jogabilidade = document.getElementById("Jogabilidade");
const JogabilidadeImg = document.getElementById("JogabilidadeImg");

// Clicar no li abre a imagem
Jogabilidade.addEventListener("click", function() {
    JogabilidadeImg.style.display = "block";
});

// Clicar na imagem fecha (sem reabrir)
JogabilidadeImg.addEventListener("click", function(event) {
    event.stopPropagation(); // impede que clique "suba" para o li
    JogabilidadeImg.style.display = "none";
});


const Ul = document.getElementById("Ul");
const Sair = document.getElementById("Sair");
const DivSair = document.getElementById("DivSair");
const NãoSair = document.getElementById("NãoSair");
const Retomar = document.getElementById("Retomar");
// Clicar no li abre a imagem
Sair.addEventListener("click", function() {
    Ul.style.display = "none";
    DivSair.style.display = "flex";
});
NãoSair.addEventListener("click", function() {
    DivSair.style.display = "none";
    Ul.style.display = "flex";
});
Retomar.addEventListener("click", function() {
    menuLista.style.display = (menuLista.style.display === "flex") ? "none" : "flex";
});
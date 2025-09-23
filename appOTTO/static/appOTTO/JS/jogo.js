 // Inicializar workspace SEM toolbox
 const workspace = Blockly.inject('blocklyDiv', { toolbox: null });

 function adicionarVariavel(nome) {
    if (!workspace.getVariable(nome)) {
        workspace.createVariable(nome);
    }
    // já insere o bloco "definir variável"
    var block = workspace.newBlock('variables_set');
    block.setFieldValue(nome, 'VAR');
    block.initSvg();
    block.render();
}


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
    null,

    "print('Bom dia Otto')",

    `

fruta = None


fruta = 'Banana'

if fruta == 'Banana':
  print('Fruta certa')
else:
  print('Fruta errada')

`,
    
    `
    nota1 = None
nota2 = None
nota3 = None
media = None


nota1 = 7
nota2 = 8
nota3 = 6
media = (nota1 + nota2) + nota3
if media == 7:
  print('Aprovado!')
else:
  print('Reprovado!')`,  
           
   // fase 4: deve usar "for"
    `import random

resposta = None
tentativa = None


resposta = random.randint(1, 4)
tentativa = 1
for count in range(4):
  if tentativa == resposta:
    print('Certo!')
  else:
    print('Errado!')
    tentativa = tentativa + 1`,   
               
    "function",          // fase 5: deve usar "function"
    "variable",          // fase 6: exemplo
    "repeat",            // fase 7: exemplo
    "math",              // fase 8: exemplo
    "logic",             // fase 9: exemplo
    "array"              // fase 10: exemplo
];

function normalize(str) {
    return str
        .replace(/\r\n/g, '\n')   // padroniza quebras de linha
        .replace(/\s+$/gm, '')    // remove espaços no final de cada linha
        .replace(/^\s+$/gm, '')   // remove espaços no início de cada linha
        .trim();                  // remove espaços no início e fim da string inteira
}

function mostrarCodigo(numeroFase) {
    var codigo = Blockly.Python.workspaceToCode(workspace);
    document.getElementById("codigoGerado").textContent = codigo;

    var respostaEsperada = respostasFases[numeroFase];

    if (normalize(respostaEsperada) === normalize(codigo)) {
        mostrarMensagem("Parabéns! Você concluiu a fase.", "success");
        setTimeout(function() {
            concluirFase(numeroFase);
        }, 3000); 
    } else {
        mostrarMensagem("Ops! Tente novamente.", "error");
        console.log("Gerado:", codigo);
        console.log("Esperado:", respostaEsperada);
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
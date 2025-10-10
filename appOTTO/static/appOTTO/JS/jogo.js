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

//Fase 1
"print('Bom dia Otto!')",

// Fase 2
`
fruta = None


fruta = 'Banana'

if fruta == 'Banana':
  print('Fruta certa')
else:
  print('Fruta errada!')
`,

//Fase 3
`
nota1 = None
nota2 = None
nota3 = None
media = None


nota1 = 7
nota2 = 8
nota3 = 6
media = ((nota1 + nota2) + nota3) / 3
if media == 7:
  print('Aprovado!')
else:
  print('Reprovado!')
`,

// fase 4
`
import random

resposta = None
tentativa = None


resposta = random.randint(1, 4)
tentativa = 1
for count in range(4):
  if tentativa == resposta:
    print('Certo!')
  else:
    print('Errado!')
    tentativa = tentativa + 1
`,

// fase 5
`
carrinho = None
oculos = None


carrinho = 0
oculos = 1
for count in range(3):
  carrinho = carrinho + oculos
if carrinho >= 3:
  print('Carrinho cheio!')
else:
  print('Ainda há espaço no carrinho!')
`,

// fase 6
`
chuveiro = None
alvo = None


chuveiro = 30
alvo = 37
while chuveiro != alvo:
  if chuveiro > alvo:
    chuveiro = chuveiro - 1
  elif chuveiro < alvo:
    chuveiro = chuveiro + 1
print('Temperatura ideal!')
`,

// fase 7
`
carteira = None
lanche = None
resposta = None
troco = None


carteira = 50
lanche = 15
resposta = 35
troco = carteira - lanche
if troco == resposta:
  print('O troco está certo!')
else:
  print('O troco está errado!')
`,

// fase 8
`
contador = None
treino = None

def treinar():
  global contador, treino
  contador = contador + 1
  print('Exercícios feitos:' + str(contador))


contador = 0
treino = True
if treino == True:
  treinar()
`,

// fase 9
`
contas = None


contas = []
contas[0] = 5
contas[1] = 20
contas[2] = 15
print(contas)
`,

// fase 10
`
luzes = None
musica = None
plateia = None
ritmo = None
luzes = True
musica = True
plateia = True
ritmo = 1
if luzes and musica and plateia:
  while ritmo <= 3:
    print('Tocando ritmo ' + str(plateia))
    ritmo = ritmo + 1
  print('Show completo! Todos aplaudem!')
else:
  print('Algo deu errado! O show não pode começar.')
`            
];

function normalize(str) {
    return str
        .replace(/\r\n/g, '\n')   // padroniza quebras de linha
        .replace(/\s+$/gm, '')    // remove espaços no final de cada linha
        .replace(/^\s+$/gm, '')   // remove espaços no início de cada linha
        .trim();                  // remove espaços no início e fim da string inteira
}

// --- Funções auxiliares (cole acima ou no topo do arquivo jogo.js) ---
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

function normalize(str) {
  if (str === undefined || str === null) return '';
  return String(str)
      .replace(/\r\n/g, '\n')   // padroniza quebras de linha
      .replace(/\s+$/gm, '')    // remove espaços no final de cada linha
      .replace(/^\s+$/gm, '')   // remove linhas que só têm espaços
      .trim();                  // remove espaços no início/fim geral
}

// encontra a **primeira** linha diferente (de cima para baixo)
// retorna objeto { index, esperado, gerado } ou null se não houver diferenças
function firstMismatchLine(geradoRaw, esperadoRaw) {
  const glines = normalize(geradoRaw).split('\n');
  const elines = normalize(esperadoRaw).split('\n');
  const max = Math.max(glines.length, elines.length);
  for (let i = 0; i < max; i++) {
      const g = (glines[i] !== undefined) ? glines[i] : '';
      const e = (elines[i] !== undefined) ? elines[i] : '';
      if (g !== e) {
          return { index: i, esperado: e, gerado: g };
      }
  }
  return null;
}

// renderiza o código dentro do <pre id="codigoGerado"> e destaca a linha errada (se passada)
function renderCodigoComDestaque(codigoRaw, erroIndex) {
  const pre = document.getElementById("codigoGerado");
  const codigo = normalize(codigoRaw);
  let lines = codigo.split('\n').map(l => escapeHtml(l));

  // garante que exista a linha a ser destacada (se erroIndex for maior que número de linhas)
  if (erroIndex !== null && erroIndex !== undefined) {
      while (lines.length <= erroIndex) lines.push(''); // linhas vazias extras
  }

  if (erroIndex !== null && erroIndex !== undefined && erroIndex >= 0 && erroIndex < lines.length) {
      lines[erroIndex] = `<mark>${lines[erroIndex] || '&nbsp;'}</mark>`;
  }

  // Usa innerHTML dentro do pre para preservar a tag <mark> + quebras de linha em <pre>
  pre.innerHTML = lines.join('\n');
  // rolar até a linha marcada (se existir)
  const mark = pre.querySelector('mark');
  if (mark) {
      // scroll suave até a linha marcada
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// --- Substitua sua função mostrarCodigo por esta ---
function mostrarCodigo(numeroFase) {
  // pega o código gerado (bruto) e já exibe (normalizado) no pre
  const codigoRaw = Blockly.Python.workspaceToCode(workspace);
  // primeiro apenas renderiza o código (sem destaque) para o usuário ver imediatamente
  renderCodigoComDestaque(codigoRaw, null);

  const respostaEsperada = respostasFases[numeroFase] || '';

  const mismatch = firstMismatchLine(codigoRaw, respostaEsperada);

  if (!mismatch) {
      // sem diferenças -> sucesso
      mostrarMensagem("Parabéns! Você concluiu a fase.", "success");
      setTimeout(function() {
          concluirFase(numeroFase);
      }, 3000);
  } else {
      // destaca somente a primeira linha errada e mostra a mensagem com detalhes
      renderCodigoComDestaque(codigoRaw, mismatch.index);

      const esperadoEsc = escapeHtml(mismatch.esperado || '(vazio)');
      const geradoEsc = escapeHtml(mismatch.gerado || '(vazio)');

      const texto =
  `Linha ${mismatch.index + 1} incorreta.\n` +
  `Esperado: ${esperadoEsc}\n` +
  `Seu código: ${geradoEsc}`;

      mostrarMensagem(texto, "error");

      // logs para debug
      console.log("Primeira diferença encontrada na linha", mismatch.index + 1);
      console.log("Esperado:", mismatch.esperado);
      console.log("Gerado:", mismatch.gerado);
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

// Botão "Rever descrição"
const btnDescricao = document.getElementById("ReverDescricao"); // seu botão existente
const modalDescricao = document.getElementById("descricaoModal");
const fecharDescricao = document.getElementById("fecharDescricao");

if (btnDescricao) {
    btnDescricao.addEventListener("click", function() {
        modalDescricao.style.display = "flex"; // mostra o modal
    });
}

if (fecharDescricao) {
    fecharDescricao.addEventListener("click", function() {
        modalDescricao.style.display = "none"; // esconde o modal
    });
}
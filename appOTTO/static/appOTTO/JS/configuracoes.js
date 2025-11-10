// O input vai começar com o valor que estiver no item 'vlibras', o switch fica dinâmico
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('vlibras').value = localStorage.getItem('vlibras');
    if (document.getElementById('vlibras').value == 1) {
        document.getElementById("vlibras").checked = true;
    }
});

// Ao clicar no botão, pega o valor do input e verifica qual valor vai pro item 'vlibras' (localStorage)
// Então a página recarrega e mostra (ou não) o Vlibras
function vlibras() {
    var checkbox = document.getElementById('vlibras').value;
    if (checkbox == 0) {
        localStorage.setItem('vlibras', 1);
        document.getElementById('vlibras').value = 1;
    } else {
        localStorage.setItem('vlibras', 0);
        document.getElementById('vlibras').value = 0;
    }
    window.location.reload();
}

document.querySelectorAll(".botao-navegar").forEach(function(botao) {
    botao.addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });
});

function conteudoNav(botaoClicado) {
    const botoes = document.querySelectorAll('.botao');
    const conteudos = document.querySelectorAll('.conteudo-box');

    // 1. Remove classe ativa de todos os botões
    botoes.forEach(botao => botao.classList.remove('active'));

    // 2. Adiciona classe ativa ao botão clicado
    botaoClicado.classList.add('active');

    // 3. Esconde todos os conteúdos
    conteudos.forEach(conteudo => conteudo.style.display = 'none');

    // 4. Mostra o conteúdo correspondente
    const alvo = botaoClicado.getAttribute('data-alvo');
    const container = document.querySelector(`.container-${alvo}`);
    if (container) {
        container.style.display = 'block';
    }

    const ativo = localStorage.getItem('tema');

    if (ativo == 1) {
        document.getElementById('b').className = 'active';
        document.getElementById('a').className = 'none';
    } else {
        document.getElementById('a').className = 'active';
        document.getElementById('b').className = 'none';
    }
}

function abrirAjuda(botao) {
    const alvo = botao.getAttribute('data-alvo');

    // Esconde o menu
    document.querySelector('.conteudo-ajuda-menu').style.display = 'none';

    // Mostra a área de conteúdo
    document.querySelector('.conteudo-ajuda-conteudo').style.display = 'block';

    // Mostra a área de conteúdo
    document.querySelector('.conteudo-nav').style.display = 'none';

    // Esconde todos os conteúdos internos
    document.querySelectorAll('.ajuda-item').forEach(div => {
        div.style.display = 'none';
    });

    // Mostra o conteúdo correspondente ao botão clicado
    const conteudoSelecionado = document.querySelector(`.conteudo-ajuda-${alvo}`);
    if (conteudoSelecionado) {
        conteudoSelecionado.style.display = 'block';
    }
}

function voltarAjuda() {
    // Esconde os conteúdos internos
    document.querySelector('.conteudo-ajuda-conteudo').style.display = 'none';
    document.querySelectorAll('.ajuda-item').forEach(div => {
        div.style.display = 'none';
    });

    // Mostra o menu novamente
    document.querySelector('.conteudo-ajuda-menu').style.display = 'flex'; // ou 'block' dependendo do seu layout

    // Mostra o menu novamente
    document.querySelector('.conteudo-nav').style.display = 'flex'; // ou 'block' dependendo do seu layout
}

function toggleFaq(button) {
  const resposta = button.parentElement.nextElementSibling;
  if (resposta.style.display === "flex") {
    resposta.style.display = "none";
    button.textContent = "+";
  } else {
    resposta.style.display = "flex";
    button.textContent = "-";
  }
}

function formContato(){

    document.querySelector('.form-contato').style.display = 'none';

    document.querySelector('.form-suporte').style.display = 'flex'

    // Esconde os conteúdos internos
    document.querySelector('.conteudo-ajuda-conteudo').style.display = 'none';
    document.querySelectorAll('.ajuda-item').forEach(div => {
        div.style.display = 'none';
    });

    // Mostra o menu novamente
    document.querySelector('.conteudo-ajuda-menu').style.display = 'flex'; // ou 'block' dependendo do seu layout

    // Mostra o menu novamente
    document.querySelector('.conteudo-nav').style.display = 'flex'; // ou 'block' dependendo do seu layout
}
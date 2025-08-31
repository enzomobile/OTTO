document.querySelectorAll(".botao-navegar").forEach(function(botao) {
    botao.addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });
});

document.querySelectorAll(".btn-voltar").forEach(function(botao) {
    botao.addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });
});

const carrosselInner = document.querySelector('.carrossel-inner');
const items = document.querySelectorAll('.carrossel-inner .item');
let currentIndex = 0;

function updateSlide() {
  const width = document.querySelector('.carrossel-viewport').offsetWidth;
  carrosselInner.style.transform = `translateX(-${currentIndex * width}px)`;
}

// Avançar
document.getElementById('next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % items.length;
  clearInterval(intervalo);
  atualizarSozinho();
  updateSlide();
});

// Voltar
document.getElementById('prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  clearInterval(intervalo);
  atualizarSozinho();
  updateSlide();
});

// Troca automática a cada 10s
function atualizarSozinho() {
  intervalo = setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    updateSlide();
  }, 10000);
}

// Ajustar ao redimensionar
window.addEventListener('resize', updateSlide);

// Inicializar
atualizarSozinho();
updateSlide();
document.addEventListener("DOMContentLoaded", () => {
 
  if (!("speechSynthesis" in window)) {
    alert("Seu navegador não suporta leitura em voz alta. Use Chrome ou Edge.");
    return;
  }

  let leituraAtiva = false;
  const modoLeitura = document.getElementById("modoLeitura");
  let vozPronta = false;

  // Desbloqueia a voz
  function desbloquearVoz() {
    if (!vozPronta) {
      const utter = new SpeechSynthesisUtterance("Leitor de voz pronto.");
      utter.lang = "pt-BR";
      speechSynthesis.speak(utter);
      vozPronta = true;
      console.log("🔊 Voz desbloqueada pelo clique do usuário");
    }
  }
  document.addEventListener("click", desbloquearVoz, { once: true });

  function falarTexto(texto) {
    if (!leituraAtiva) return;
    if (!vozPronta) {
      console.warn("Tentando falar antes de desbloquear a voz.");
      return;
    }

    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 1;
    fala.pitch = 1;
    speechSynthesis.speak(fala);
  }

//switch
  if (modoLeitura) {
    modoLeitura.addEventListener("change", () => {
      leituraAtiva = modoLeitura.checked;
      if (leituraAtiva) {
        localStorage.setItem("leitorAtivo", "true");
        falarTexto("Leitor de texto ativado. Clique em qualquer texto para ouvir.");
      } else {
        localStorage.setItem("leitorAtivo", "false");
        speechSynthesis.cancel();
        falarTexto("Leitor de texto desativado.");
      }
    });

    const salvo = localStorage.getItem("leitorAtivo");
    if (salvo === "true") {
      leituraAtiva = true;
      modoLeitura.checked = true;
      falarTexto("Leitor de texto ativado.");
    }
  } else {
    console.error("⚠️ Switch 'modoLeitura' não encontrado no HTML!");
  }

  // Lê qualquer texto clicado
  document.addEventListener("click", (event) => {
    const el = event.target;
    if (
      leituraAtiva &&
      el.textContent.trim().length > 0 &&
      !el.closest(".switch") &&
      el.tagName !== "INPUT"
    ) {
      falarTexto(el.textContent.trim());
    }
  });
});

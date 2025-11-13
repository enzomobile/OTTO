// leitor de voz
class LeitorVozInvisivel {
    constructor() {
        this.ativo = false;
        this.timeoutLeitura = null;
        this.ultimoElemento = null;
        this.ultimoTexto = '';
        this.isMobile = this.detectarMobile();
        
        this.inicializar();
    }
    
    detectarMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    }
    
    inicializar() {
        this.criarToggleInvisivel();
        this.configurarEventos();
        this.carregarEstado();
        
        if (this.isMobile) {
            console.log('Leitor Mobile carregado - Toque triplo para ativar/desativar');
        } else {
            console.log('Leitor Desktop carregado - Use Ctrl+Shift+V');
        }
    }
    
    criarToggleInvisivel() {
        if (document.getElementById('leitorVozInvisivel')) return;
        
        const toggle = document.createElement('div');
        toggle.id = 'leitorVozInvisivel';
        toggle.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 1px !important;
            height: 1px !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            overflow: hidden !important;
            z-index: -9999 !important;
        `;
        
        toggle.innerHTML = `
            <label class="leitor-switch">
                <input id="leitorVoz" class="leitor-checkbox" type="checkbox">
                <span class="leitor-slider"></span>
            </label>
            <span class="leitor-label">🔊</span>
        `;
        
        document.body.appendChild(toggle);
        this.adicionarCSSInvisivel();
    }
    
    adicionarCSSInvisivel() {
        const style = document.createElement('style');
        style.textContent = `
            .leitor-switch {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
            }
            .leitor-checkbox {
                opacity: 0;
                width: 0;
                height: 0;
                position: absolute;
            }
            .leitor-slider {
                display: none !important;
            }
            .leitor-label {
                display: none !important;
            }
            
            /* Highlight para mobile e desktop */
            .leitor-lendo {
                outline: 2px solid #2196F3 !important;
                outline-offset: 2px !important;
                background-color: rgba(33, 150, 243, 0.1) !important;
                transition: all 0.3s ease !important;
            }
            
            /* Feedback visual para mobile */
            .leitor-status {
                position: fixed !important;
                top: 10px !important;
                right: 10px !important;
                background: #2196F3 !important;
                color: white !important;
                padding: 8px 12px !important;
                border-radius: 20px !important;
                font-size: 12px !important;
                z-index: 10000 !important;
                opacity: 0.9 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    configurarEventos() {
        const checkbox = document.getElementById('leitorVoz');
        if (!checkbox) return;
        
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.ativar();
            } else {
                this.desativar();
            }
        });
        
        // EVENTOS PARA DESKTOP
        if (!this.isMobile) {
            document.addEventListener('mouseover', (e) => {
                if (this.ativo) {
                    this.processarElemento(e.target);
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                    e.preventDefault();
                    this.toggleLeitor();
                }
            });
        }
        
        // EVENTOS PARA MOBILE
        if (this.isMobile) {
            let lastTouchTime = 0;
            let touchCount = 0;
            
            document.addEventListener('touchstart', (e) => {
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastTouchTime;
                
                if (timeDiff < 300) {
                    touchCount++;
                } else {
                    touchCount = 1;
                }
                
                lastTouchTime = currentTime;
                
                // Toque triplo para ativar/desativar
                if (touchCount === 3) {
                    e.preventDefault();
                    this.toggleLeitor();
                    touchCount = 0;
                    
                    // Feedback visual
                    this.mostrarStatusMobile(this.ativo ? 'Leitor ATIVADO' : 'Leitor DESATIVADO');
                }
                
                // Processar elemento tocado
                if (this.ativo) {
                    const touch = e.touches[0];
                    const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (elemento) {
                        this.processarElemento(elemento);
                    }
                }
            });
            
            // Swipe para parar leitura
            let startX, startY;
            
            document.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            document.addEventListener('touchend', (e) => {
                if (!this.ativo) return;
                
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Swipe longo para cima para parar leitura
                if (Math.abs(diffY) > 100 && Math.abs(diffY) > Math.abs(diffX)) {
                    window.speechSynthesis.cancel();
                    this.mostrarStatusMobile('Leitura parada');
                }
            });
        }
        
        // Evento comum para ambos
        document.addEventListener('click', () => {
            if (this.ativo) {
                window.speechSynthesis.cancel();
            }
        });
    }
    
    mostrarStatusMobile(mensagem) {
        // Remove status anterior se existir
        const statusAnterior = document.querySelector('.leitor-status');
        if (statusAnterior) {
            statusAnterior.remove();
        }
        
        const status = document.createElement('div');
        status.className = 'leitor-status';
        status.textContent = mensagem;
        document.body.appendChild(status);
        
        // Remove após 2 segundos
        setTimeout(() => {
            if (status.parentNode) {
                status.remove();
            }
        }, 2000);
    }
    
    toggleLeitor() {
        const checkbox = document.getElementById('leitorVoz');
        if (!checkbox) return;
        
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
    }
    
    carregarEstado() {
        const checkbox = document.getElementById('leitorVoz');
        if (!checkbox) return;
        
        const estado = localStorage.getItem('leitorVozInvisivel');
        checkbox.checked = estado === 'true';
        
        if (checkbox.checked) {
            setTimeout(() => this.ativar(), 500);
        }
    }
    
    ativar() {
        console.log('Leitor ATIVADO');
        this.ativo = true;
        localStorage.setItem('leitorVozInvisivel', 'true');
        
        if (this.isMobile) {
            this.mostrarStatusMobile('Leitor ATIVADO - Toque triplo para desativar');
        }
        
        window.speechSynthesis.cancel();
    }
    
    desativar() {
        console.log('Leitor DESATIVADO');
        this.ativo = false;
        localStorage.setItem('leitorVozInvisivel', 'false');
        
        if (this.isMobile) {
            this.mostrarStatusMobile('Leitor DESATIVADO - Toque triplo para ativar');
        }
        
        window.speechSynthesis.cancel();
        clearTimeout(this.timeoutLeitura);
        
        document.querySelectorAll('.leitor-lendo').forEach(el => {
            el.classList.remove('leitor-lendo');
        });
    }
    
    processarElemento(elemento) {
        if (!this.ativo) return;
        if (elemento === this.ultimoElemento) return;
        
        this.ultimoElemento = elemento;
        clearTimeout(this.timeoutLeitura);
        
        const elementoTexto = this.encontrarElementoComTexto(elemento);
        if (!elementoTexto) return;
        
        const texto = this.extrairTexto(elementoTexto);
        if (!this.isTextoValido(texto)) return;
        
        // Destacar elemento
        this.destacarElemento(elementoTexto);
        
        // Timeout menor para mobile
        const timeoutMobile = this.isMobile ? 300 : 500;
        
        this.timeoutLeitura = setTimeout(() => {
            this.lerTexto(texto, elementoTexto);
        }, timeoutMobile);
    }
    
    encontrarElementoComTexto(elemento) {
        if (this.isElementoValido(elemento) && this.isTextoValido(this.extrairTexto(elemento))) {
            return elemento;
        }
        
        let elementoAtual = elemento.parentElement;
        for (let i = 0; i < 3 && elementoAtual; i++) {
            if (this.isElementoValido(elementoAtual) && this.isTextoValido(this.extrairTexto(elementoAtual))) {
                return elementoAtual;
            }
            elementoAtual = elementoAtual.parentElement;
        }
        
        return null;
    }
    
    isElementoValido(elemento) {
        const tagName = elemento.tagName.toLowerCase();
        const elementosInvalidos = [
            'script', 'style', 'meta', 'link', 'br', 'hr', 
            'input', 'button', 'select', 'textarea', 'svg', 'path'
        ];
        
        return !elementosInvalidos.includes(tagName);
    }
    
    extrairTexto(elemento) {
        const clone = elemento.cloneNode(true);
        const elementosRemover = clone.querySelectorAll(
            'script, style, nav, header, footer, aside, .menu, .ad, [aria-hidden="true"]'
        );
        elementosRemover.forEach(el => el.remove());
        
        const texto = clone.textContent || clone.innerText;
        return texto.replace(/\s+/g, ' ').trim();
    }
    
    isTextoValido(texto) {
        return texto && 
               texto.length > 2 && 
               texto.length < 500 &&
               !texto.match(/^[0-9\s\.\,\-\+\/\*]+$/) &&
               !texto.includes('{') &&
               !texto.includes('function') &&
               texto !== this.ultimoTexto;
    }
    
    destacarElemento(elemento) {
        document.querySelectorAll('.leitor-lendo').forEach(el => {
            el.classList.remove('leitor-lendo');
        });
        elemento.classList.add('leitor-lendo');
    }
    
    lerTexto(texto, elemento) {
        if (!this.ativo) return;
        
        this.ultimoTexto = texto;
        
        console.log('📖 Lendo:', texto.substring(0, 80) + '...');
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.volume = 0.9;
        
        utterance.onstart = () => {
            console.log('Iniciou leitura');
        };
        
        utterance.onend = () => {
            elemento.classList.remove('leitor-lendo');
        };
        
        utterance.onerror = () => {
            elemento.classList.remove('leitor-lendo');
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

// Inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.leitorVozInvisivel = new LeitorVozInvisivel();
    });
} else {
    window.leitorVozInvisivel = new LeitorVozInvisivel();
}
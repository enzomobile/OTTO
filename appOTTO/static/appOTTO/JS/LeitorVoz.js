// leitor de voz para todas as telas
class LeitorVozInvisivel {
    constructor() {
        this.ativo = false;
        this.timeoutLeitura = null;
        this.ultimoElemento = null;
        this.ultimoTexto = '';
        
        this.inicializar();
    }
    
    inicializar() {
        // Criar o toggle switch INVISÍVEL
        this.criarToggleInvisivel();
        
        this.configurarEventos();
        
        this.carregarEstado();
        
        console.log('🎯 Leitor Invisível carregado - Use Ctrl+Shift+V para ativar/desativar');
    }
    
    criarToggleInvisivel() {
        if (document.getElementById('leitorVozInvisivel')) return;
        // Criar elemento invisivel
        const toggle = document.createElement('div');
        toggle.id = 'leitorVozInvisivel';
        toggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            opacity: 0.1;
            transition: opacity 0.3s;
        `;
        
        toggle.innerHTML = `
            <label class="leitor-switch">
                <input id="leitorVoz" class="leitor-checkbox" type="checkbox">
                <span class="leitor-slider"></span>
            </label>
            <span class="leitor-label">🔊</span>
        `;
        
        document.body.appendChild(toggle);
        
        // Mostrar ao passar o mouse (melhora a acessibilidade)
        toggle.addEventListener('mouseenter', () => {
            toggle.style.opacity = '1';
        });
        
        toggle.addEventListener('mouseleave', () => {
            if (!this.ativo) {
                toggle.style.opacity = '0.1';
            }
        });
        
        // Adiciona o css
        this.adicionarCSSInvisivel();
    }
    
    adicionarCSSInvisivel() {
        const style = document.createElement('style');
        style.textContent = `
            .leitor-switch {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 20px;
                vertical-align: middle;
            }
            .leitor-checkbox {
                opacity: 0;
                width: 0;
                height: 0;
                position: absolute;
            }
            .leitor-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 20px;
            }
            .leitor-slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            .leitor-checkbox:checked + .leitor-slider {
                background-color: #2196F3;
            }
            .leitor-checkbox:checked + .leitor-slider:before {
                transform: translateX(20px);
            }
            .leitor-label {
                margin-left: 5px;
                font-size: 12px;
                vertical-align: middle;
                color: #666;
            }
            
            /* Highlight MÍNIMO para elemento sendo lido */
            .leitor-lendo {
                outline: 2px dashed #2196F3 !important;
                outline-offset: 2px;
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
        
        // Evento de mouseover
        document.addEventListener('mouseover', (e) => {
            if (this.ativo) {
                this.processarElemento(e.target);
            }
        });
        
        // Atalho de teclado (Ctrl+Shift+V)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggleLeitor();
            }
        });
        
        // Parar leitura ao clicar
        document.addEventListener('click', () => {
            if (this.ativo) {
                window.speechSynthesis.cancel();
            }
        });
    }
    
    toggleLeitor() {
        const checkbox = document.getElementById('leitorVoz');
        if (!checkbox) return;
        
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
        
        // Feedback visual
        const toggle = document.getElementById('leitorVozInvisivel');
        if (toggle) {
            toggle.style.opacity = '1';
            setTimeout(() => {
                if (!this.ativo) {
                    toggle.style.opacity = '0.1';
                }
            }, 2000);
        }
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
        console.log('🎯 Leitor ATIVADO (Passe o mouse sobre o texto)');
        this.ativo = true;
        localStorage.setItem('leitorVozInvisivel', 'true');
        
        // Mostrar toggle quando ativo
        const toggle = document.getElementById('leitorVozInvisivel');
        if (toggle) {
            toggle.style.opacity = '0.8';
        }
        
        window.speechSynthesis.cancel();
    }
    
    desativar() {
        console.log('🛑 Leitor DESATIVADO');
        this.ativo = false;
        localStorage.setItem('leitorVozInvisivel', 'false');
        
        // Esconder toggle quando nao usado
        const toggle = document.getElementById('leitorVozInvisivel');
        if (toggle) {
            toggle.style.opacity = '0.1';
        }
        
        window.speechSynthesis.cancel();
        clearTimeout(this.timeoutLeitura);
        
        // Remover o destaque do mouse
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
        
        // Destacar ao redor de um modo bem simples
        this.destacarElemento(elementoTexto);
        
        this.timeoutLeitura = setTimeout(() => {
            this.lerTexto(texto, elementoTexto);
        }, 500);
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
            console.log('✅ Iniciou leitura');
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

//inicia
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.leitorVozInvisivel = new LeitorVozInvisivel();
    });
} else {
    window.leitorVozInvisivel = new LeitorVozInvisivel();
}
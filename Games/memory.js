function initMemory(domContainer) {
    // 1. SINAL DE ATIVAÇÃO
    window.gameActive = true; 

    domContainer.innerHTML = ''; 
    const icons = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉'];
    const cards = [...icons, ...icons]; 
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matches = 0;

    // Embaralhar
    cards.sort(() => Math.random() - 0.5);
    
    // Criar Grid de Cartas
    cards.forEach(icon => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.icon = icon;

        cardElement.innerHTML = `
            <div class="front-face">${icon}</div>
            <div class="back-face">?</div>
        `;

        cardElement.addEventListener('click', flipCard);
        domContainer.appendChild(cardElement);
    });

    function flipCard() {
        if (!window.gameActive || lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        matches++;
        resetBoard();
        if (matches === icons.length) {
            showGameOver();
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            if (!window.gameActive) return;
            if (firstCard) firstCard.classList.remove('flip');
            if (secondCard) secondCard.classList.remove('flip');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // --- NOVA FUNÇÃO DE FIM DE JOGO (DOM) ---
    function showGameOver() {
        if (!window.gameActive) return;
        window.gameActive = false;

        saveHighScore('memory', matches);

        // Criar overlay de vitória
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '100';
        overlay.style.borderRadius = '10px';
        overlay.style.color = 'white';
        overlay.style.textAlign = 'center';

        overlay.innerHTML = `
            <h2 style="font-size: 2rem; color: #facc15; margin-bottom: 10px;">VITÓRIA!</h2>
            <p style="font-size: 1.2rem;">Você encontrou todos os pares!</p>
            <p style="font-size: 0.9rem; margin-top: 20px; opacity: 0.8;">Reiniciando...</p>
        `;

        domContainer.style.position = 'relative';
        domContainer.appendChild(overlay);

        setTimeout(() => {
            // Reinicia usando a lógica suave do Hub
            resetCurrentGame('memory');
        }, 2000);
    }
}
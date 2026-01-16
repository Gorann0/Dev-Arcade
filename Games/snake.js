function initSnake(canvas) {
    const ctx = canvas.getContext("2d");
    window.gameActive = true; 

    const box = 20;
    let snake = [{ x: 9 * box, y: 10 * box }];
    let direction = "";
    let nextDirection = ""; 
    let score = 0;
    let isGameOverHandled = false;

    let food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
    };

    const levels = [
        { snake: "#00FF00", bg: "#000000" }, 
        { snake: "#00D4FF", bg: "#0f172a" }, 
        { snake: "#FF00FF", bg: "#2e1065" }, 
        { snake: "#FFFF00", bg: "#422006" }, 
        { snake: "#FF0000", bg: "#450a0a" }  
    ];

    function handleKeyDown(event) {
        if (!window.gameActive || isGameOverHandled) return;
        const key = event.keyCode;
        if (key == 37 && direction != "RIGHT") nextDirection = "LEFT";
        else if (key == 38 && direction != "DOWN") nextDirection = "UP";
        else if (key == 39 && direction != "LEFT") nextDirection = "RIGHT";
        else if (key == 40 && direction != "UP") nextDirection = "DOWN";
    }

    window.addEventListener("keydown", handleKeyDown);

    let lastRenderTime = 0;
    const SNAKE_SPEED = 10; 

    function draw(currentTime) {
        if (!window.gameActive) return; 

        currentAnimationFrame = requestAnimationFrame(draw);

        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
        lastRenderTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        direction = nextDirection;
        
        let currentLevel = Math.min(Math.floor(score / 10), levels.length - 1);
        let colors = levels[currentLevel];

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // UI
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillStyle = "#38bdf8"; 
        ctx.fillText("Best: " + getHighScore('snake'), 10, 40);

        // Cobra
        for (let i = 0; i < snake.length; i++) {
            // O segredo do brilho está aqui dentro do IF:
            if (i == 0) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = colors.snake;
            } else {
                ctx.shadowBlur = 0;
            }

            // Aqui desenha o corpo
            ctx.fillStyle = (i == 0) ? colors.snake : shadeColor(colors.snake, -40);
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            
            // Aqui desenha a linha divisória
            ctx.strokeStyle = colors.bg;
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        // MUITO IMPORTANTE: Resetar o brilho para zero aqui 
        // para a comida e o score não ficarem borrados
        ctx.shadowBlur = 0;

        // Comida
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(food.x + box/2, food.y + box/2, box/2 - 2, 0, Math.PI * 2);
        ctx.fill();

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction == "LEFT") snakeX -= box;
        if (direction == "UP") snakeY -= box;
        if (direction == "RIGHT") snakeX += box;
        if (direction == "DOWN") snakeY += box;

        let newHead = { x: snakeX, y: snakeY };

        // Colisão
        if (direction !== "" && (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake))) {
            gameOver(colors.snake);
            return; 
        }

        if (snakeX == food.x && snakeY == food.y) {
            score++;
            food = {
                x: Math.floor(Math.random() * 19 + 1) * box,
                y: Math.floor(Math.random() * 19 + 1) * box
            };
        } else if (direction !== "") {
            snake.pop();
        }

        if (direction !== "") snake.unshift(newHead);
    }

    function gameOver(snakeColor) {
        if (isGameOverHandled) return;
        isGameOverHandled = true;
        window.gameActive = false;

        saveHighScore('snake', score);

        // Efeito Visual de Morte (Cobra Branca)
        ctx.fillStyle = "#FFFFFF"; 
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        // Texto de Game Over
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
        
        ctx.font = "16px Arial";
        ctx.fillText("Reiniciando...", canvas.width/2, canvas.height/2 + 30);

        setTimeout(() => {
            if (document.getElementById('mainCanvas')) {
                resetCurrentGame('snake');
            }
        }, 1200);
    }

    function collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x == array[i].x && head.y == array[i].y) return true;
        }
        return false;
    }

    function shadeColor(color, percent) {
        let num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
    }

    requestAnimationFrame(draw);

}


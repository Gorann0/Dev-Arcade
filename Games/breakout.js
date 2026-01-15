function initBreakout(canvas) {
    const ctx = canvas.getContext('2d');
    window.gameActive = true; 

    // Variáveis de Estado
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameStarted = false;
    let isGameOver = false;
    let particles = [];
    let powerUps = [];
    let paddleWidthDefault = 75;

    const BALL_ACCELERATION = 1.02;
    const MAX_SPEED = 8;

    let balls = [{
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: 8,
        dx: 3,
        dy: -3,
        color: '#FFD700',
        history: []
    }];

    const paddle = {
        height: 10,
        width: 75,
        x: (canvas.width - 75) / 2,
        speed: 7,
        rightPressed: false,
        leftPressed: false,
        color: '#8B0000'
    };

    const brick = {
        rowCount: 5,
        columnCount: 8,
        width: 50,
        height: 15,
        padding: 5,
        offsetTop: 40,
        offsetLeft: 35,
        colors: ['#FF6347', '#FFD700', '#ADFF2F', '#00BFFF', '#BA55D3']
    };

    let bricks = [];
    for (let c = 0; c < brick.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brick.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    function createParticles(x, y, color) {
        for (let i = 0; i < 6; i++) {
            particles.push({
                x: x, y: y,
                size: Math.random() * 3,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: color
            });
        }
    }
    
    function drawBall() {
        balls.forEach(ball => {
            ball.history.forEach((pos, index) => {
                const opacity = (index / ball.history.length) * 0.4;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, ball.radius * (index / ball.history.length), 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.globalAlpha = opacity;
                ctx.fill();
                ctx.closePath();
            });
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 8;
            ctx.shadowColor = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        });
    }

    function drawPaddle() {
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    }

    function drawBricks() {
        let allBroken = true;
        for (let c = 0; c < brick.columnCount; c++) {
            for (let r = 0; r < brick.rowCount; r++) {
                if (bricks[c][r].status === 1) {
                    allBroken = false;
                    let bX = (c * (brick.width + brick.padding)) + brick.offsetLeft;
                    let bY = (r * (brick.height + brick.padding)) + brick.offsetTop;
                    bricks[c][r].x = bX;
                    bricks[c][r].y = bY;
                    ctx.fillStyle = brick.colors[r];
                    ctx.fillRect(bX, bY, brick.width, brick.height);
                }
            }
        }
        if (allBroken) resetBricks();
    }

    function loop() {
        if (!window.gameActive) return; 
        update();
        draw();
        currentAnimationFrame = requestAnimationFrame(loop);
    }

    function handleKeyDown(e) {
        if (!window.gameActive || isGameOver) return;
        if (e.key === "Enter") gameStarted = true;
        if (e.key === "ArrowRight") paddle.rightPressed = true;
        if (e.key === "ArrowLeft") paddle.leftPressed = true;
    }

    function handleKeyUp(e) {
        if (e.key === "ArrowRight") paddle.rightPressed = false;
        if (e.key === "ArrowLeft") paddle.leftPressed = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function update() {
        if (!gameStarted || isGameOver) return;
        updatePowerUps();
        for (let i = balls.length - 1; i >= 0; i--) {
            let b = balls[i];
            b.history.push({ x: b.x, y: b.y });
            if (b.history.length > 6) b.history.shift();
            b.x += b.dx; b.y += b.dy;
            if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.dx = -b.dx;
            if (b.y - b.radius < 0) b.dy = -b.dy;
            if (b.y + b.radius > canvas.height - paddle.height && b.x > paddle.x && b.x < paddle.x + paddle.width) {
                let collidePoint = (b.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                let angle = collidePoint * (Math.PI / 3);
                let speed = Math.min(MAX_SPEED, Math.sqrt(b.dx * b.dx + b.dy * b.dy) * BALL_ACCELERATION);
                b.dx = speed * Math.sin(angle);
                b.dy = -speed * Math.cos(angle);
            }
            for (let c = 0; c < brick.columnCount; c++) {
                for (let r = 0; r < brick.rowCount; r++) {
                    let br = bricks[c][r];
                    if (br.status === 1) {
                        if (b.x > br.x && b.x < br.x + brick.width && b.y > br.y && b.y < br.y + brick.height) {
                            b.dy = -b.dy;
                            br.status = 0; 
                            score++;
                            createParticles(br.x + brick.width/2, br.y + brick.height/2, brick.colors[r]);
                            if (Math.random() < 0.2) {
                                powerUps.push({ x: br.x + brick.width / 2, y: br.y, type: Math.random() > 0.5 ? 'wide' : 'multi' });
                            }
                        }
                    }
                }
            }
            if (b.y + b.radius > canvas.height) {
                balls.splice(i, 1);
                if (balls.length === 0) {
                    lives--;
                    if (lives <= 0) triggerGameOver();
                    else {
                        gameStarted = false;
                        balls = [{ x: canvas.width / 2, y: canvas.height - 30, radius: 8, dx: 3, dy: -3, color: '#FFD700', history: [] }];
                        paddle.x = (canvas.width - paddle.width) / 2;
                    }
                }
            }
        }
        if (paddle.rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
        if (paddle.leftPressed && paddle.x > 0) paddle.x -= paddle.speed;
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].x += particles[i].speedX;
            particles[i].y += particles[i].speedY;
            particles[i].life -= 0.02;
            if (particles[i].life <= 0) particles.splice(i, 1);
        }
    }

    function triggerGameOver() {
        if (isGameOver) return;
        isGameOver = true;
        saveHighScore('breakout', score); // Salva o recorde
        gameStarted = false;

        const drawGameOverScreen = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.font = "bold 30px Arial";
            ctx.fillText("FIM DE JOGO!", canvas.width / 2, canvas.height / 2 - 30);
            ctx.font = "20px Arial";
            ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
            
            // Recorde em destaque amarelo
            ctx.fillStyle = "#facc15";
            ctx.fillText(`Melhor: ${getHighScore('breakout')}`, canvas.width / 2, canvas.height / 2 + 45);
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.font = "14px Arial";
            ctx.fillText("Reiniciando...", canvas.width / 2, canvas.height / 2 + 85);

            if (isGameOver) requestAnimationFrame(drawGameOverScreen);
            if (!window.gameActive) return; 
        };
        drawGameOverScreen();

        setTimeout(() => {
            if (window.gameActive) {
                isGameOver = false;
                resetCurrentGame('breakout');
            }
        }, 2000);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawBricks(); drawPaddle(); drawBall();

        powerUps.forEach(p => {
            ctx.fillStyle = p.type === 'wide' ? "#00FF00" : "#00FFFF";
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.closePath();
        });

        particles.forEach(p => {
            ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        // UI - Score atual e Recorde no topo
        ctx.fillStyle = "white"; 
        ctx.font = "bold 16px Arial"; 
        ctx.textAlign = "left";
        ctx.fillText(`PONTOS: ${score}`, 15, 25);
        
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "bold 12px Arial";
        ctx.fillText(`BEST: ${getHighScore('breakout')}`, canvas.width / 2, 25);

        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.fillText(`VIDAS: ${lives}`, canvas.width - 15, 25);

        if (!gameStarted && !isGameOver) {
            ctx.fillStyle = "white"; ctx.textAlign = "center";
            ctx.font = "bold 18px Arial";
            ctx.fillText("ENTER PARA COMEÇAR", canvas.width / 2, canvas.height / 2 + 50);
        }
    }

    function updatePowerUps() {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            let p = powerUps[i]; p.y += 2;
            if (p.y + 5 > canvas.height - paddle.height && p.x > paddle.x && p.x < paddle.x + paddle.width) {
                applyPowerUp(p.type); powerUps.splice(i, 1);
            } else if (p.y > canvas.height) powerUps.splice(i, 1);
        }
    }

    function applyPowerUp(type) {
        if (type === 'wide') {
            paddle.width = 120;
            setTimeout(() => { if(window.gameActive) paddle.width = paddleWidthDefault; }, 8000);
        } else if (type === 'multi') {
            balls.push({ x: paddle.x + paddle.width/2, y: canvas.height - 30, radius: 8, dx: (Math.random()-0.5)*6, dy: -3, color: '#00FFFF', history: [] });
        }
    }

    function resetBricks() {
        level++;
        brick.colors = brick.colors.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
        for (let c = 0; c < brick.columnCount; c++) {
            for (let r = 0; r < brick.rowCount; r++) bricks[c][r].status = 1;
        }
    }
    loop();
}
class SantaGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('santaHighScore')) || 0;
        
        // Load images
        this.loadImages();
        
        // Initialize game objects
        this.initializeGame();
        
        // Set up controls
        this.setupControls();
        
        // Update UI
        this.updateScores();
        
        // Setup screens
        this.setupScreens();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    loadImages() {
        this.images = {
            santa: new Image(),
            gift: new Image(),
            obstacle: new Image()
        };

        this.images.santa.src = 'santa.png';
        this.images.gift.src = 'gift.png';
        this.images.obstacle.src = 'obstacle.png';
    }

    initializeGame() {
        // Initialize Santa
        const santaSize = Math.min(this.canvas.width * 0.1, 64);
        this.santa = {
            x: this.canvas.width / 2 - santaSize / 2,
            y: this.canvas.height - santaSize - 20,
            width: santaSize,
            height: santaSize,
            speed: this.canvas.width * 0.005
        };

        // Initialize arrays
        this.gifts = [];
        this.obstacles = [];
        this.snowflakes = [];
    }

    setupControls() {
        // Keyboard controls
        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);

        // Touch controls
        let touchStartX = 0;
        
        this.canvas.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        });

        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const touch = e.touches[0];
            const diffX = touch.clientX - touchStartX;
            touchStartX = touch.clientX;

            let newX = this.santa.x + diffX;
            newX = Math.max(0, Math.min(this.canvas.width - this.santa.width, newX));
            this.santa.x = newX;
        });
    }

    setupScreens() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        
        // Show high score
        document.getElementById('highScore').textContent = this.highScore;
    }

    updateScores() {
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.updateScores();
        
        // Hide screens
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Reset game objects
        this.initializeGame();
        
        // Start spawning
        this.giftInterval = setInterval(() => this.spawnGift(), 1000);
        this.obstacleInterval = setInterval(() => this.spawnObstacle(), 1500);
        
        // Start game loop
        this.gameLoop();
    }

    spawnGift() {
        if (!this.gameRunning) return;
        
        const size = Math.min(this.canvas.width * 0.05, 30);
        this.gifts.push({
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: this.canvas.height * 0.003
        });
    }

    spawnObstacle() {
        if (!this.gameRunning) return;
        
        const size = Math.min(this.canvas.width * 0.05, 30);
        this.obstacles.push({
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: this.canvas.height * 0.004
        });
    }

    createSnowflake() {
        this.snowflakes.push({
            x: Math.random() * this.canvas.width,
            y: -10,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 1,
            wind: Math.random() * 0.5 - 0.25
        });
    }

    update() {
        // Update Santa
        if (this.keys.ArrowLeft) {
            this.santa.x = Math.max(0, this.santa.x - this.santa.speed);
        }
        if (this.keys.ArrowRight) {
            this.santa.x = Math.min(this.canvas.width - this.santa.width, this.santa.x + this.santa.speed);
        }

        // Update gifts
        for (let i = this.gifts.length - 1; i >= 0; i--) {
            const gift = this.gifts[i];
            gift.y += gift.speed;

            if (this.checkCollision(this.santa, gift)) {
                this.score += 10;
                this.updateScores();
                this.gifts.splice(i, 1);
            } else if (gift.y > this.canvas.height) {
                this.gifts.splice(i, 1);
            }
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += obstacle.speed;

            if (this.checkCollision(this.santa, obstacle)) {
                this.gameOver();
            } else if (obstacle.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update snowflakes
        if (Math.random() < 0.1) this.createSnowflake();
        
        for (let i = this.snowflakes.length - 1; i >= 0; i--) {
            const snowflake = this.snowflakes[i];
            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.wind;

            if (snowflake.y > this.canvas.height) {
                this.snowflakes.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snowflakes
        this.ctx.fillStyle = 'white';
        this.snowflakes.forEach(snowflake => {
            this.ctx.beginPath();
            this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw game objects
        this.ctx.drawImage(this.images.santa, this.santa.x, this.santa.y, this.santa.width, this.santa.height);
        
        this.gifts.forEach(gift => {
            this.ctx.drawImage(this.images.gift, gift.x, gift.y, gift.width, gift.height);
        });
        
        this.obstacles.forEach(obstacle => {
            this.ctx.drawImage(this.images.obstacle, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    gameOver() {
        this.gameRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('santaHighScore', this.highScore);
        }
        
        // Clear intervals
        clearInterval(this.giftInterval);
        clearInterval(this.obstacleInterval);
        
        // Update UI
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    gameLoop() {
        if (this.gameRunning) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when window loads
window.onload = () => {
    const game = new SantaGame();
};
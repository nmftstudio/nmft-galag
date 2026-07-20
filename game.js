// ============================================
// NMFT GALAGA - ARCADE SPACE SHOOTER
// Desarrollado por NMFT Studio (nmft.ar)
// ============================================

(function() {
    'use strict';

    // ============================================
    // CONFIGURACION Y CONSTANTES
    // ============================================
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 700;

    const WEAPONS = {
        LASER: {
            id: 'laser',
            name: 'LASER SIMPLE',
            key: '1',
            damage: 1,
            speed: 8,
            fireRate: 200,
            color: '#00f0ff',
            particles: '#00f0ff',
            unlocked: true,
            description: 'Disparo basico rapido',
            icon: '⚡'
        },
        DOUBLE: {
            id: 'double',
            name: 'DOBLE LASER',
            key: '2',
            damage: 1.5,
            speed: 7,
            fireRate: 180,
            color: '#ff00ff',
            particles: '#ff00ff',
            unlocked: false,
            description: 'Dos disparos simultaneos',
            icon: '⚡⚡'
        },
        SPREAD: {
            id: 'spread',
            name: 'DISPERSION',
            key: '3',
            damage: 1,
            speed: 6,
            fireRate: 250,
            color: '#00ff88',
            particles: '#00ff88',
            unlocked: false,
            description: 'Tres disparos en abanico',
            icon: '✦'
        },
        PLASMA: {
            id: 'plasma',
            name: 'PLASMA PESADO',
            key: '4',
            damage: 3,
            speed: 5,
            fireRate: 350,
            color: '#ff8800',
            particles: '#ff8800',
            unlocked: false,
            description: 'Disparo poderoso lento',
            icon: '☀'
        }
    };

    const SCENARIOS = [
        {
            name: 'NEBULOSA CRISTAL',
            bgColor: '#0a0a1a',
            starColor: '#ffffff',
            starSpeed: 0.5,
            enemyColor: '#ff0044',
            enemyBulletColor: '#ff4444',
            bossColor: '#ff0066',
            particles: ['#00f0ff', '#ff00ff', '#ffffff']
        },
        {
            name: 'CINTURON DE ASTEROIDES',
            bgColor: '#1a0a0a',
            starColor: '#ffccaa',
            starSpeed: 0.8,
            enemyColor: '#ff8800',
            enemyBulletColor: '#ffaa00',
            bossColor: '#ff6600',
            particles: ['#ff8800', '#ffcc00', '#ff4400']
        },
        {
            name: 'VORTICE ESTELAR',
            bgColor: '#0a0a2a',
            starColor: '#aaaaff',
            starSpeed: 1.2,
            enemyColor: '#aa00ff',
            enemyBulletColor: '#cc44ff',
            bossColor: '#8800ff',
            particles: ['#aa00ff', '#6600ff', '#cc88ff']
        },
        {
            name: 'AGUJERO NEGRO',
            bgColor: '#050505',
            starColor: '#ff4444',
            starSpeed: 1.5,
            enemyColor: '#ff0000',
            enemyBulletColor: '#ff2222',
            bossColor: '#cc0000',
            particles: ['#ff0000', '#ff4444', '#880000']
        },
        {
            name: 'DIMENSION FINAL',
            bgColor: '#0a0010',
            starColor: '#ff00ff',
            starSpeed: 2.0,
            enemyColor: '#ff00ff',
            enemyBulletColor: '#ff44ff',
            bossColor: '#ff00aa',
            particles: ['#ff00ff', '#ff00aa', '#ff88ff']
        }
    ];

    const ENEMY_TYPES = {
        GRUNT: { type: 'grunt', score: 100, hp: 1, speed: 2, pattern: 'straight' },
        ZAPPER: { type: 'zapper', score: 200, hp: 2, speed: 3, pattern: 'zigzag' },
        DIVE: { type: 'dive', score: 300, hp: 1, speed: 4, pattern: 'dive' },
        TANK: { type: 'tank', score: 500, hp: 5, speed: 1, pattern: 'slow' },
        ELITE: { type: 'elite', score: 800, hp: 3, speed: 2.5, pattern: 'circle' },
        BOSS: { type: 'boss', score: 5000, hp: 50, speed: 1.5, pattern: 'boss' }
    };

    const POWERUP_TYPES = {
        STAR: { type: 'star', color: '#ffff00', icon: '★', value: 500 },
        WEAPON: { type: 'weapon', color: '#00ff88', icon: 'W', value: 0 },
        SHIELD: { type: 'shield', color: '#00f0ff', icon: 'S', value: 0 },
        LIFE: { type: 'life', color: '#ff0044', icon: 'L', value: 0 }
    };

    // ============================================
    // CLASES DEL JUEGO
    // ============================================

    class Particle {
        constructor(x, y, color, speed, life, size) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            this.life = life;
            this.maxLife = life;
            this.size = size || Math.random() * 3 + 1;
            this.decay = 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            this.vx *= 0.98;
            this.vy *= 0.98;
        }

        draw(ctx) {
            const alpha = this.life / this.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Star {
        constructor(w, h, speed) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speed = (Math.random() * 0.5 + 0.1) * speed;
            this.brightness = Math.random();
            this.twinkleSpeed = Math.random() * 0.05 + 0.01;
        }

        update(h) {
            this.y += this.speed;
            this.brightness += this.twinkleSpeed;
            if (this.y > h) {
                this.y = 0;
                this.x = Math.random() * CANVAS_WIDTH;
            }
        }

        draw(ctx, color) {
            const alpha = 0.3 + Math.abs(Math.sin(this.brightness)) * 0.7;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Bullet {
        constructor(x, y, vx, vy, color, damage, isEnemy = false, size = 3) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.damage = damage;
            this.isEnemy = isEnemy;
            this.size = size;
            this.active = true;
            this.trail = [];
        }

        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.shift();

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -10 || this.x > CANVAS_WIDTH + 10 || 
                this.y < -10 || this.y > CANVAS_HEIGHT + 10) {
                this.active = false;
            }
        }

        draw(ctx) {
            // Trail
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Bullet
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Player {
        constructor() {
            this.x = CANVAS_WIDTH / 2;
            this.y = CANVAS_HEIGHT - 80;
            this.width = 30;
            this.height = 30;
            this.speed = 5;
            this.hp = 3;
            this.maxHp = 5;
            this.shield = 0;
            this.maxShield = 100;
            this.weapon = 'laser';
            this.weaponLevel = 1;
            this.lastShot = 0;
            this.invulnerable = 0;
            this.trail = [];
            this.engineParticles = [];
            this.engineParticles = [];
        }

        update(keys, mouseX) {
            // Movimiento con teclas
            if (keys['ArrowLeft'] || keys['a']) this.x -= this.speed;
            if (keys['ArrowRight'] || keys['d']) this.x += this.speed;
            if (keys['ArrowUp'] || keys['w']) this.y -= this.speed;
            if (keys['ArrowDown'] || keys['s']) this.y += this.speed;

            // Movimiento con mouse (si esta activo)
            if (mouseX !== null) {
                const targetX = mouseX;
                this.x += (targetX - this.x) * 0.1;
            }

            // Limites
            this.x = Math.max(this.width, Math.min(CANVAS_WIDTH - this.width, this.x));
            this.y = Math.max(this.height, Math.min(CANVAS_HEIGHT - this.height, this.y));

            // Trail
            this.trail.push({ x: this.x, y: this.y + 15 });
            if (this.trail.length > 10) this.trail.shift();

            // Particulas del motor
            this.engineParticles.push(new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y + 15,
                '#00f0ff',
                2,
                20,
                Math.random() * 3 + 1
            ));

            if (this.invulnerable > 0) this.invulnerable--;
        }

        shoot(currentTime) {
            const weapon = WEAPONS[this.weapon.toUpperCase()];
            if (!weapon) return [];

            if (currentTime - this.lastShot < weapon.fireRate) return [];
            this.lastShot = currentTime;

            const bullets = [];
            const w = WEAPONS[this.weapon.toUpperCase()];

            switch (this.weapon) {
                case 'laser':
                    bullets.push(new Bullet(
                        this.x, this.y - 15,
                        0, -w.speed,
                        w.color, w.damage * this.weaponLevel
                    ));
                    break;
                case 'double':
                    bullets.push(new Bullet(
                        this.x - 10, this.y - 10,
                        0, -w.speed,
                        w.color, w.damage * this.weaponLevel
                    ));
                    bullets.push(new Bullet(
                        this.x + 10, this.y - 10,
                        0, -w.speed,
                        w.color, w.damage * this.weaponLevel
                    ));
                    break;
                case 'spread':
                    bullets.push(new Bullet(
                        this.x, this.y - 15,
                        0, -w.speed,
                        w.color, w.damage * this.weaponLevel
                    ));
                    bullets.push(new Bullet(
                        this.x, this.y - 15,
                        -1.5, -w.speed * 0.9,
                        w.color, w.damage * this.weaponLevel
                    ));
                    bullets.push(new Bullet(
                        this.x, this.y - 15,
                        1.5, -w.speed * 0.9,
                        w.color, w.damage * this.weaponLevel
                    ));
                    break;
                case 'plasma':
                    bullets.push(new Bullet(
                        this.x, this.y - 15,
                        0, -w.speed,
                        w.color, w.damage * this.weaponLevel,
                        false, 6
                    ));
                    break;
            }

            return bullets;
        }

        draw(ctx) {
            // Invulnerabilidad parpadeante
            if (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2 === 0) {
                ctx.globalAlpha = 0.3;
            }

            // Trail
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#00f0ff';
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Escudo
            if (this.shield > 0) {
                ctx.save();
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3 + (this.shield / this.maxShield) * 0.4;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Nave
            ctx.save();
            ctx.translate(this.x, this.y);

            // Sombra
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 15;

            // Cuerpo principal
            ctx.fillStyle = '#0a1a2a';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(-12, 10);
            ctx.lineTo(-8, 15);
            ctx.lineTo(0, 12);
            ctx.lineTo(8, 15);
            ctx.lineTo(12, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cabina
            ctx.fillStyle = '#00f0ff';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, -2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Alas
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(-12, 5);
            ctx.lineTo(-20, 12);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(12, 5);
            ctx.lineTo(20, 12);
            ctx.lineTo(12, 10);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
            ctx.globalAlpha = 1;
        }

        hit(damage) {
            if (this.invulnerable > 0) return false;

            if (this.shield > 0) {
                this.shield -= damage * 20;
                if (this.shield < 0) this.shield = 0;
                return false;
            }

            this.hp -= damage;
            this.invulnerable = 60;
            return true;
        }
    }

    class Enemy {
        constructor(type, x, y, scenario) {
            const config = ENEMY_TYPES[type.toUpperCase()] || ENEMY_TYPES.GRUNT;
            this.type = config.type;
            this.x = x;
            this.y = y - 80; // Empieza 80px arriba de la posición de formación
            this.hp = config.hp;
            this.maxHp = config.hp;
            this.speed = config.speed;
            this.score = config.score;
            this.pattern = config.pattern;
            this.color = scenario.enemyColor;
            this.bulletColor = scenario.enemyBulletColor;
            this.active = true;
            this.angle = 0;
            this.diveTargetX = 0;
            this.diveTargetY = 0;
            this.diving = false;
            this.lastShot = 0;
            this.formationX = x;
            this.formationY = y;
            this.entering = true;
            this.enterSpeed = 2;
            this.size = type === 'boss' ? 40 : (type === 'tank' ? 22 : 15);
        }

        update(player, time) {
            if (this.entering) {
                this.y += this.enterSpeed;
                if (this.y >= this.formationY) {
                    this.entering = false;
                    this.y = this.formationY;
                }
                return [];
            }

            this.angle += 0.05;

            switch (this.pattern) {
                case 'straight':
                    this.x = this.formationX + Math.sin(this.angle) * 30;
                    break;
                case 'zigzag':
                    this.x = this.formationX + Math.sin(this.angle * 2) * 60;
                    this.y = this.formationY + Math.sin(this.angle) * 10;
                    break;
                case 'dive':
                    if (!this.diving && Math.random() < 0.005) {
                        this.diving = true;
                        this.diveTargetX = player.x;
                        this.diveTargetY = CANVAS_HEIGHT + 50;
                    }
                    if (this.diving) {
                        const dx = this.diveTargetX - this.x;
                        const dy = this.diveTargetY - this.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > 5) {
                            this.x += (dx / dist) * this.speed * 2;
                            this.y += (dy / dist) * this.speed * 2;
                        } else {
                            this.diving = false;
                            this.y = -50;
                            this.x = this.formationX;
                        }
                    } else {
                        this.x = this.formationX + Math.sin(this.angle) * 20;
                    }
                    break;
                case 'slow':
                    this.x = this.formationX + Math.sin(this.angle * 0.5) * 15;
                    break;
                case 'circle':
                    this.x = this.formationX + Math.cos(this.angle) * 40;
                    this.y = this.formationY + Math.sin(this.angle) * 20;
                    break;
                case 'boss':
                    this.x = this.formationX + Math.sin(this.angle * 0.3) * 100;
                    this.y = this.formationY + Math.sin(this.angle * 0.5) * 30;
                    break;
            }

            // Disparar
            if (!this.diving && !this.entering && time - this.lastShot > 1500 + Math.random() * 1000) {
                this.lastShot = time;
                return this.shoot(player);
            }

            return [];
        }

        shoot(player) {
            const bullets = [];
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 3;

            if (this.type === 'boss') {
                // Boss dispara en patrones
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i + this.angle;
                    bullets.push(new Bullet(
                        this.x, this.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        this.bulletColor, 1, true
                    ));
                }
            } else {
                bullets.push(new Bullet(
                    this.x, this.y + 10,
                    (dx / dist) * speed,
                    (dy / dist) * speed,
                    this.bulletColor, 1, true
                ));
            }

            return bullets;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Brillo
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.fillStyle = this.color + '33';

            switch (this.type) {
                case 'grunt':
                    // Forma de abeja simple
                    ctx.beginPath();
                    ctx.moveTo(0, -12);
                    ctx.lineTo(-10, 0);
                    ctx.lineTo(-8, 12);
                    ctx.lineTo(0, 8);
                    ctx.lineTo(8, 12);
                    ctx.lineTo(10, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Ojos
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(-3, -2, 2, 0, Math.PI * 2);
                    ctx.arc(3, -2, 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'zapper':
                    // Forma angular
                    ctx.beginPath();
                    ctx.moveTo(0, -15);
                    ctx.lineTo(-12, -5);
                    ctx.lineTo(-8, 5);
                    ctx.lineTo(-15, 15);
                    ctx.lineTo(0, 10);
                    ctx.lineTo(15, 15);
                    ctx.lineTo(8, 5);
                    ctx.lineTo(12, -5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    break;

                case 'dive':
                    // Forma de flecha
                    ctx.beginPath();
                    ctx.moveTo(0, -15);
                    ctx.lineTo(-8, 0);
                    ctx.lineTo(-12, 15);
                    ctx.lineTo(0, 10);
                    ctx.lineTo(12, 15);
                    ctx.lineTo(8, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Ala
                    ctx.beginPath();
                    ctx.moveTo(-8, 5);
                    ctx.lineTo(-18, 0);
                    ctx.lineTo(-8, 10);
                    ctx.moveTo(8, 5);
                    ctx.lineTo(18, 0);
                    ctx.lineTo(8, 10);
                    ctx.stroke();
                    break;

                case 'tank':
                    // Forma robusta
                    ctx.beginPath();
                    ctx.moveTo(0, -18);
                    ctx.lineTo(-15, -5);
                    ctx.lineTo(-18, 10);
                    ctx.lineTo(-10, 18);
                    ctx.lineTo(10, 18);
                    ctx.lineTo(18, 10);
                    ctx.lineTo(15, -5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Detalles
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'elite':
                    // Forma elegante
                    ctx.beginPath();
                    ctx.moveTo(0, -18);
                    ctx.lineTo(-12, -8);
                    ctx.lineTo(-15, 5);
                    ctx.lineTo(-8, 18);
                    ctx.lineTo(0, 12);
                    ctx.lineTo(8, 18);
                    ctx.lineTo(15, 5);
                    ctx.lineTo(12, -8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Nucleo
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = 0.8;
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'boss':
                    // Forma masiva
                    ctx.beginPath();
                    ctx.moveTo(0, -35);
                    ctx.lineTo(-25, -20);
                    ctx.lineTo(-35, 0);
                    ctx.lineTo(-30, 20);
                    ctx.lineTo(-15, 35);
                    ctx.lineTo(0, 25);
                    ctx.lineTo(15, 35);
                    ctx.lineTo(30, 20);
                    ctx.lineTo(35, 0);
                    ctx.lineTo(25, -20);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Ojos del boss
                    ctx.fillStyle = '#ff0000';
                    ctx.shadowColor = '#ff0000';
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(-10, -5, 5, 0, Math.PI * 2);
                    ctx.arc(10, -5, 5, 0, Math.PI * 2);
                    ctx.fill();
                    // Barra de vida del boss
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#333';
                    ctx.fillRect(-30, -45, 60, 5);
                    ctx.fillStyle = '#ff0044';
                    ctx.fillRect(-30, -45, 60 * (this.hp / this.maxHp), 5);
                    break;
            }

            ctx.restore();
        }

        hit(damage) {
            this.hp -= damage;
            if (this.hp <= 0) {
                this.active = false;
                return true;
            }
            return false;
        }
    }

    class PowerUp {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.config = POWERUP_TYPES[type.toUpperCase()];
            this.active = true;
            this.angle = 0;
            this.speed = 1.5;
        }

        update() {
            this.y += this.speed;
            this.angle += 0.05;
            if (this.y > CANVAS_HEIGHT + 20) this.active = false;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.shadowColor = this.config.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = this.config.color;

            // Forma de diamante
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-10, 0);
            ctx.closePath();
            ctx.fill();

            // Icono
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.config.icon, 0, 0);

            ctx.restore();
        }
    }

    class Explosion {
        constructor(x, y, color, count = 15) {
            this.x = x;
            this.y = y;
            this.particles = [];
            for (let i = 0; i < count; i++) {
                this.particles.push(new Particle(
                    x, y,
                    color,
                    Math.random() * 6 + 2,
                    Math.random() * 30 + 20,
                    Math.random() * 4 + 2
                ));
            }
            this.active = true;
        }

        update() {
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.life > 0);
            if (this.particles.length === 0) this.active = false;
        }

        draw(ctx) {
            this.particles.forEach(p => p.draw(ctx));
        }
    }

    // ============================================
    // CLASE PRINCIPAL DEL JUEGO
    // ============================================
    class GalagaGame {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();

            this.keys = {};
            this.mouseX = null;
            this.gameState = 'menu'; // menu, playing, paused, gameover, transition, weapon_select

            this.player = null;
            this.bullets = [];
            this.enemies = [];
            this.powerups = [];
            this.particles = [];
            this.explosions = [];
            this.stars = [];

            this.score = 0;
            this.level = 1;
            this.enemiesDestroyed = 0;
            this.wave = 1;
            this.waveEnemies = 0;
            this.waveSpawned = 0;
            this.waveDelay = 0;

            this.highScore = parseInt(localStorage.getItem('nmft_galaga_highscore') || '0');
            this.unlockedWeapons = JSON.parse(localStorage.getItem('nmft_galaga_weapons') || '["laser"]');

            this.currentScenario = SCENARIOS[0];
            this.levelTransitionTime = 0;
            this.bossSpawned = false;

            this.lastTime = 0;
            this.animationId = null;

            this.setupEventListeners();
            this.setupUI();
            this.initStars();
        }

        setupCanvas() {
            this.canvas.width = CANVAS_WIDTH;
            this.canvas.height = CANVAS_HEIGHT;

            // Escalar canvas para mantener aspect ratio
            const container = document.getElementById('game-container');
            const resize = () => {
                const rect = container.getBoundingClientRect();
                const scale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT);
                this.canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
                this.canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
            };
            resize();
            window.addEventListener('resize', resize);
        }

        initStars() {
            this.stars = [];
            for (let i = 0; i < 100; i++) {
                this.stars.push(new Star(CANVAS_WIDTH, CANVAS_HEIGHT, this.currentScenario.starSpeed));
            }
        }

        setupEventListeners() {
            // Teclado
            document.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;

                if (e.key === 'p' || e.key === 'P') {
                    if (this.gameState === 'playing') this.pause();
                    else if (this.gameState === 'paused') this.resume();
                }

                // Cambio de arma
                if (this.gameState === 'playing') {
                    if (e.key === '1') this.changeWeapon('laser');
                    if (e.key === '2' && this.unlockedWeapons.includes('double')) this.changeWeapon('double');
                    if (e.key === '3' && this.unlockedWeapons.includes('spread')) this.changeWeapon('spread');
                    if (e.key === '4' && this.unlockedWeapons.includes('plasma')) this.changeWeapon('plasma');
                }

                // Prevenir scroll
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                    e.preventDefault();
                }
            });

            document.addEventListener('keyup', (e) => {
                this.keys[e.key] = false;
            });

            // Mouse/Touch
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = CANVAS_WIDTH / rect.width;
                this.mouseX = (e.clientX - rect.left) * scaleX;
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.mouseX = null;
            });

            // Touch
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = CANVAS_WIDTH / rect.width;
                this.mouseX = (e.touches[0].clientX - rect.left) * scaleX;
            });

            this.canvas.addEventListener('touchend', () => {
                this.mouseX = null;
            });
        }

        setupUI() {
            // Botones del menu principal
            document.getElementById('btn-start').addEventListener('click', () => this.startGame());
            document.getElementById('btn-instructions').addEventListener('click', () => this.showScreen('instructions-screen'));
            document.getElementById('btn-credits').addEventListener('click', () => this.showScreen('credits-screen'));
            document.getElementById('btn-back-inst').addEventListener('click', () => this.showScreen('start-screen'));
            document.getElementById('btn-back-cred').addEventListener('click', () => this.showScreen('start-screen'));

            // Botones de pausa
            document.getElementById('btn-resume').addEventListener('click', () => this.resume());
            document.getElementById('btn-restart-pause').addEventListener('click', () => this.startGame());
            document.getElementById('btn-menu-pause').addEventListener('click', () => this.showScreen('start-screen'));

            // Botones de game over
            document.getElementById('btn-retry').addEventListener('click', () => this.startGame());
            document.getElementById('btn-menu').addEventListener('click', () => this.showScreen('start-screen'));

            // Boton de seleccion de arma
            document.getElementById('btn-continue-weapon').addEventListener('click', () => {
                this.hideScreen('weapon-select');
                this.gameState = 'playing';
                this.lastTime = performance.now();
                this.gameLoop(this.lastTime);
            });

            // High score
            document.getElementById('high-score').textContent = this.highScore;
        }

        showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => {
                s.classList.remove('active');
                s.classList.add('hidden');
            });
            document.getElementById(screenId).classList.remove('hidden');
            document.getElementById(screenId).classList.add('active');

            if (screenId === 'start-screen') {
                document.getElementById('hud').classList.add('hidden');
                this.gameState = 'menu';
                document.getElementById('high-score').textContent = this.highScore;
            }
        }

        hideScreen(screenId) {
            document.getElementById(screenId).classList.remove('active');
            document.getElementById(screenId).classList.add('hidden');
        }

        startGame() {
            // Resetear estado
            this.player = new Player();
            this.bullets = [];
            this.enemies = [];
            this.powerups = [];
            this.particles = [];
            this.explosions = [];
            this.score = 0;
            this.level = 1;
            this.enemiesDestroyed = 0;
            this.wave = 1;
            this.waveEnemies = 0;
            this.waveSpawned = 0;
            this.waveDelay = 0;
            this.bossSpawned = false;
            this.currentScenario = SCENARIOS[0];
            this.initStars();

            // Desbloquear armas segun progreso guardado
            Object.keys(WEAPONS).forEach(key => {
                WEAPONS[key].unlocked = this.unlockedWeapons.includes(WEAPONS[key].id);
            });

            this.hideScreen('start-screen');
            this.hideScreen('gameover-screen');
            this.hideScreen('pause-screen');
            document.getElementById('hud').classList.remove('hidden');

            this.updateHUD();
            this.spawnWave();

            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }

        pause() {
            this.gameState = 'paused';
            document.getElementById('pause-screen').classList.remove('hidden');
            document.getElementById('pause-screen').classList.add('active');
        }

        resume() {
            this.hideScreen('pause-screen');
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
        }

        changeWeapon(weaponId) {
            if (WEAPONS[weaponId.toUpperCase()] && WEAPONS[weaponId.toUpperCase()].unlocked) {
                this.player.weapon = weaponId;
                this.updateHUD();
            }
        }

        spawnWave() {
            const levelConfig = this.getLevelConfig();
            this.waveEnemies = levelConfig.count;
            this.waveSpawned = 0;
            this.waveDelay = 0;
        }

        getLevelConfig() {
            const configs = [
                { types: ['grunt'], count: 8, rows: 2 },
                { types: ['grunt', 'zapper'], count: 12, rows: 3 },
                { types: ['grunt', 'zapper', 'dive'], count: 15, rows: 3 },
                { types: ['zapper', 'dive', 'tank'], count: 18, rows: 4 },
                { types: ['grunt', 'zapper', 'dive', 'tank', 'elite'], count: 20, rows: 4 },
                { types: ['elite', 'tank'], count: 15, rows: 3 },
                { types: ['grunt', 'zapper', 'dive', 'tank', 'elite'], count: 25, rows: 5 },
                { types: ['elite', 'tank'], count: 20, rows: 4 },
                { types: ['zapper', 'dive', 'elite'], count: 22, rows: 4 },
                { types: ['boss'], count: 1, rows: 1 }, // Boss
            ];

            const idx = Math.min(this.level - 1, configs.length - 1);
            return configs[idx];
        }

        spawnEnemy() {
            const config = this.getLevelConfig();
            const type = config.types[Math.floor(Math.random() * config.types.length)];

            let x, y;
            if (type === 'boss') {
                x = CANVAS_WIDTH / 2;
                y = -60;
            } else {
                const cols = Math.ceil(config.count / config.rows);
                const colWidth = CANVAS_WIDTH / (cols + 2);
                const col = this.waveSpawned % cols;
                const row = Math.floor(this.waveSpawned / cols);
                x = colWidth * (col + 1.5);
                y = -30 - (row * 50);
            }

            this.enemies.push(new Enemy(type, x, y, this.currentScenario));
            this.waveSpawned++;
        }

        spawnPowerUp(x, y) {
            const rand = Math.random();
            let type = 'star';
            if (rand < 0.05) type = 'weapon';
            else if (rand < 0.08) type = 'shield';
            else if (rand < 0.10) type = 'life';

            this.powerups.push(new PowerUp(x, y, type));
        }

        checkCollisions() {
            // Balas del jugador vs enemigos
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (bullet.isEnemy) continue;

                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

                    if (dist < enemy.size + bullet.size) {
                        bullet.active = false;

                        if (enemy.hit(bullet.damage)) {
                            // Enemigo destruido
                            this.score += enemy.score;
                            this.enemiesDestroyed++;
                            this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color, 
                                enemy.type === 'boss' ? 50 : 20));

                            // Chance de powerup
                            if (Math.random() < 0.15) {
                                this.spawnPowerUp(enemy.x, enemy.y);
                            }

                            // Desbloquear arma al destruir ciertos enemigos
                            this.checkWeaponUnlocks();
                        } else {
                            // Hit pero no destruido
                            this.explosions.push(new Explosion(bullet.x, bullet.y, bullet.color, 5));
                        }

                        break;
                    }
                }
            }

            // Balas enemigas vs jugador
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (!bullet.isEnemy) continue;

                const dist = Math.hypot(bullet.x - this.player.x, bullet.y - this.player.y);
                if (dist < 15 + bullet.size) {
                    bullet.active = false;
                    if (this.player.hit(bullet.damage)) {
                        this.explosions.push(new Explosion(this.player.x, this.player.y, '#00f0ff', 20));
                        if (this.player.hp <= 0) {
                            this.gameOver();
                            return;
                        }
                    }
                }
            }

            // Enemigos vs jugador (colision)
            for (let enemy of this.enemies) {
                const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
                if (dist < enemy.size + 15) {
                    if (this.player.hit(1)) {
                        this.explosions.push(new Explosion(this.player.x, this.player.y, '#00f0ff', 20));
                        enemy.active = false;
                        this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color, 15));
                        if (this.player.hp <= 0) {
                            this.gameOver();
                            return;
                        }
                    }
                }
            }

            // Powerups vs jugador
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                const pu = this.powerups[i];
                const dist = Math.hypot(pu.x - this.player.x, pu.y - this.player.y);

                if (dist < 25) {
                    this.applyPowerUp(pu);
                    pu.active = false;
                }
            }
        }

        applyPowerUp(pu) {
            switch (pu.config.type) {
                case 'star':
                    this.score += pu.config.value;
                    break;
                case 'weapon':
                    this.player.weaponLevel = Math.min(this.player.weaponLevel + 1, 5);
                    // Desbloquear siguiente arma si aplica
                    const weaponOrder = ['laser', 'double', 'spread', 'plasma'];
                    const currentIdx = weaponOrder.indexOf(this.player.weapon);
                    if (currentIdx < weaponOrder.length - 1) {
                        const nextWeapon = weaponOrder[currentIdx + 1];
                        if (!this.unlockedWeapons.includes(nextWeapon)) {
                            this.unlockedWeapons.push(nextWeapon);
                            WEAPONS[nextWeapon.toUpperCase()].unlocked = true;
                            localStorage.setItem('nmft_galaga_weapons', JSON.stringify(this.unlockedWeapons));
                        }
                    }
                    break;
                case 'shield':
                    this.player.shield = this.player.maxShield;
                    break;
                case 'life':
                    this.player.hp = Math.min(this.player.hp + 1, this.player.maxHp);
                    break;
            }
            this.updateHUD();
        }

        checkWeaponUnlocks() {
            // Desbloquear armas basado en puntuacion
            const thresholds = [
                { weapon: 'double', score: 1000 },
                { weapon: 'spread', score: 3000 },
                { weapon: 'plasma', score: 6000 }
            ];

            thresholds.forEach(t => {
                if (this.score >= t.score && !this.unlockedWeapons.includes(t.weapon)) {
                    this.unlockedWeapons.push(t.weapon);
                    WEAPONS[t.weapon.toUpperCase()].unlocked = true;
                    localStorage.setItem('nmft_galaga_weapons', JSON.stringify(this.unlockedWeapons));
                }
            });
        }

        nextLevel() {
            this.level++;

            if (this.level > SCENARIOS.length) {
                // Victoria total
                this.gameOver(true);
                return;
            }

            this.currentScenario = SCENARIOS[this.level - 1];
            this.initStars();
            this.wave = 1;
            this.bossSpawned = false;

            // Mostrar transicion
            this.gameState = 'transition';
            document.getElementById('transition-title').textContent = 
                `ESCENARIO ${this.level}: ${this.currentScenario.name}`;
            document.getElementById('transition-subtitle').textContent = 'Preparando siguiente zona...';
            document.getElementById('level-transition').classList.remove('hidden');
            document.getElementById('level-transition').classList.add('active');

            // Preview del escenario
            const preview = document.getElementById('scenario-preview');
            preview.style.background = this.currentScenario.bgColor;
            preview.innerHTML = `<div style="color:${this.currentScenario.enemyColor};font-size:2rem;text-align:center;padding-top:40px;">👾</div>`;

            setTimeout(() => {
                this.hideScreen('level-transition');
                this.spawnWave();
                this.gameState = 'playing';
                this.lastTime = performance.now();
                this.gameLoop(this.lastTime);
            }, 3000);
        }

        showWeaponSelect() {
            this.gameState = 'weapon_select';
            const grid = document.getElementById('weapons-grid');
            grid.innerHTML = '';

            Object.values(WEAPONS).forEach(w => {
                const card = document.createElement('div');
                card.className = `weapon-card ${w.unlocked ? '' : 'locked'} ${w.id === this.player.weapon ? 'selected' : ''}`;
                card.innerHTML = `
                    <div class="weapon-icon">${w.icon}</div>
                    <div class="weapon-title">${w.name}</div>
                    <div class="weapon-desc">${w.description}</div>
                    ${w.unlocked ? `<span class="weapon-key">${w.key}</span>` : '<span class="weapon-key">🔒</span>'}
                `;

                if (w.unlocked) {
                    card.addEventListener('click', () => {
                        this.player.weapon = w.id;
                        document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        this.updateHUD();
                    });
                }

                grid.appendChild(card);
            });

            document.getElementById('weapon-select').classList.remove('hidden');
            document.getElementById('weapon-select').classList.add('active');
        }

        gameOver(victory = false) {
            this.gameState = 'gameover';

            // Guardar high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('nmft_galaga_highscore', this.highScore.toString());
                document.querySelector('.new-record').classList.remove('hidden');
            } else {
                document.querySelector('.new-record').classList.add('hidden');
            }

            // Actualizar pantalla de game over
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-level').textContent = this.level;
            document.getElementById('final-enemies').textContent = this.enemiesDestroyed;

            if (victory) {
                document.querySelector('#gameover-screen h2').textContent = '¡VICTORIA!';
            } else {
                document.querySelector('#gameover-screen h2').textContent = 'GAME OVER';
            }

            document.getElementById('gameover-screen').classList.remove('hidden');
            document.getElementById('gameover-screen').classList.add('active');
        }

        updateHUD() {
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;

            const weapon = WEAPONS[this.player.weapon.toUpperCase()];
            document.getElementById('weapon-name').textContent = weapon ? weapon.name : 'LASER';

            const weaponProgress = (this.player.weaponLevel / 5) * 100;
            document.getElementById('weapon-progress').style.width = weaponProgress + '%';

            // Vidas
            const livesContainer = document.getElementById('lives');
            livesContainer.innerHTML = '';
            for (let i = 0; i < this.player.hp; i++) {
                const life = document.createElement('div');
                life.className = 'life-icon';
                livesContainer.appendChild(life);
            }

            // Escudo
            const shieldPercent = (this.player.shield / this.player.maxShield) * 100;
            document.getElementById('shield-fill').style.width = shieldPercent + '%';
        }

        // ============================================
        // GAME LOOP
        // ============================================
        gameLoop(timestamp) {
            if (this.gameState !== 'playing') return;

            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.update(deltaTime);
            this.draw();

            this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
        }

        update(deltaTime) {
            // Actualizar estrellas
            this.stars.forEach(star => star.update(CANVAS_HEIGHT));

            // Actualizar jugador
            this.player.update(this.keys, this.mouseX);

            // Disparar
            if (this.keys[' '] || this.keys['Space']) {
                const newBullets = this.player.shoot(performance.now());
                this.bullets.push(...newBullets);
            }

            // Spawnear enemigos
            if (this.waveSpawned < this.waveEnemies) {
                this.waveDelay += deltaTime;
                if (this.waveDelay > 800) {
                    this.spawnEnemy();
                    this.waveDelay = 0;
                    console.log('Enemy spawned! Total:', this.enemies.length, 'Wave spawned:', this.waveSpawned, 'Wave enemies:', this.waveEnemies);
                }
            }

            // Actualizar balas
            this.bullets.forEach(b => b.update());
            this.bullets = this.bullets.filter(b => b.active);

            // Actualizar enemigos
            let allEnemiesDead = true;
            this.enemies.forEach(e => {
                const enemyBullets = e.update(this.player, performance.now());
                if (enemyBullets.length > 0) {
                    this.bullets.push(...enemyBullets);
                }
                if (e.active) allEnemiesDead = false;
            });
            this.enemies = this.enemies.filter(e => e.active);
            if (this.enemies.length > 0) {
                console.log('Enemies active:', this.enemies.length, 'Positions:', this.enemies.map(e => ({x: Math.round(e.x), y: Math.round(e.y), entering: e.entering})));
            }

            // Actualizar powerups
            this.powerups.forEach(p => p.update());
            this.powerups = this.powerups.filter(p => p.active);

            // Actualizar explosiones
            this.explosions.forEach(e => e.update());
            this.explosions = this.explosions.filter(e => e.active);

            // Actualizar particulas del motor
            this.player.engineParticles.forEach(p => p.update());
            this.player.engineParticles = this.player.engineParticles.filter(p => p.life > 0);

            // Colisiones
            this.checkCollisions();

            // Verificar si la wave termino
            if (allEnemiesDead && this.waveSpawned >= this.waveEnemies) {
                if (this.level % 5 === 0 && !this.bossSpawned) {
                    // Boss level
                } else {
                    this.wave++;
                    if (this.wave > 3) {
                        this.nextLevel();
                    } else {
                        this.spawnWave();
                    }
                }
            }

            this.updateHUD();
        }

        draw() {
            const ctx = this.ctx;

            // Fondo
            ctx.fillStyle = this.currentScenario.bgColor;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Estrellas
            this.stars.forEach(star => star.draw(ctx, this.currentScenario.starColor));

            // Particulas del motor
            this.player.engineParticles.forEach(p => p.draw(ctx));

            // Powerups
            this.powerups.forEach(p => p.draw(ctx));

            // Balas
            this.bullets.forEach(b => b.draw(ctx));

            // Enemigos
            this.enemies.forEach(e => e.draw(ctx));

            // Jugador
            this.player.draw(ctx);

            // Explosiones
            this.explosions.forEach(e => e.draw(ctx));

            // Efecto de scanline
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
                ctx.fillRect(0, y, CANVAS_WIDTH, 2);
            }

            // Vignette
            const gradient = ctx.createRadialGradient(
                CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
                CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    // ============================================
    // INICIAR JUEGO
    // ============================================
    window.addEventListener('DOMContentLoaded', () => {
        window.game = new GalagaGame();
    });

})();

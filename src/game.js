'use strict';

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
});

var player = null;
var aliens = null;
var bullets = null;
var bulletTime = 0;
var firingTimer = 0;
var enemyBullets = null;
var explosions = null;
var fireButton = null;
var cursors = null;
var sKey = null;
var livingEnemies = [];
var lives = null;
var stateText = null;
var scoreText = null;
var score = 0;

function preload() {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('alien', 'assets/alien.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('background', 'assets/stars.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    var background = game.add.sprite(0, 0, 'background');
    background.width = game.world.width;
    background.height = game.world.height;
    background.smoothed = false;
    background.alpha = 0.25;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    lives = game.add.group();
    for (var i = 0; i < 3; i += 1) {
        var ship = lives.create(game.world.width - 150 + (50 * i), 60, 'ship');
        ship.anchor.setTo(0.5);
        ship.scale.setTo(0.25)
        ship.alpha = 0.75;
    }

    stateText = game.add.text(game.world.centerX, game.world.centerY, '', {
        font: '50px Arial',
        fill: '#fff',
        align: 'center'
    });
    stateText.anchor.setTo(0.5);
    stateText.visible = false;

    player = game.add.sprite(game.world.centerX, game.world.height - 100, 'ship');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.scale.setTo(0.45);
    player.anchor.setTo(0.5);
    player.enableBody = true;
    player.body.collideWorldBounds = true;

    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    scoreText = game.add.text(20, 20, 'Score: 0', {
        fill: '#fff'
    });

    cursors = game.input.keyboard.createCursorKeys();
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createAliens() {
    for (var y = 0; y < 3; y += 1) {
        for (var x = 0; x < 10; x += 1) {
            var alien = aliens.create(x * 55, y * 60, 'alien');
            alien.anchor.setTo(0.5);
            alien.scale.setTo(0.25);
            alien.body.moves = false;
        }
    }

    aliens.x = 50;
    aliens.y = 85;

    var tween = game.add.tween(aliens).to( { x: game.world.width - 550 }, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

function setupInvader(invader) {
    invader.anchor.x = 0.35;
    invader.anchor.y = 0.35;
    invader.animations.add('kaboom');
}

function fireBulvar() {
    if (game.time.now > bulletTime) {
        var bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(player.x, player.y + -50);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }
}

function enemyFires() {
    var enemyBullet = enemyBullets.getFirstExists(false);
    livingEnemies.length = 0;

    aliens.forEachAlive(function (alien) {
        livingEnemies.push(alien);
    });

    if (enemyBullet && livingEnemies.length > 0) {
        var random = game.rnd.integerInRange(0, livingEnemies.length - 1);
        var shooter = livingEnemies[random];

        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet, player, 120);
        firingTimer = game.time.now + 2000;
    }
}

function collisionHandler(bullet, alien) {
    bullet.kill();
    alien.kill();

    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    score += 10;

    scoreText.text = `Score: ${score}`;

    if (aliens.countLiving() < 1) {
        enemyBullets.callAll('kill');
        stateText.text = 'You Win!\nPlay Again?';
        stateText.visible = true;

        game.input.onTap.addOnce(restart, this);
    }
}

function enemyHitsPlayer(player, bullet) {
    bullet.kill();

    var live = lives.getFirstAlive();
    if (live) {
        live.kill();
    }

    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x + 10, player.body.y + 30);
    explosion.play('kaboom', 30, false, true);

    if (lives.countLiving() < 1) {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text = 'Game Over\nRestart?';
        stateText.visible = true;
        game.input.onTap.addOnce(restart, this);
    }
}

function restart() {
    lives.callAll('revive');
    aliens.removeAll();
    createAliens();
    player.revive();
    stateText.visible = false;
    score = 0;
    scoreText.text = `Score: ${score}`;
    player.reset(game.world.centerX, game.world.height - 100);
}

function update() {
    if (player.alive) {
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 200;
        } else if (cursors.up.isDown) {
            player.body.velocity.y = -200;
        } else if (cursors.down.isDown) {
            player.body.velocity.y = 200;
        }

        if (sKey.isDown) {
            player.angle += 1;
        }

        if (fireButton.isDown) {
            fireBulvar();
        }

        if (game.time.now > firingTimer) {
            enemyFires();
        }

        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }
}

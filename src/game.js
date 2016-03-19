'use strict';

let game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
});

let player = null;
let cursors = null;
let sKey = null;

function preload() {
    game.load.image('ship', 'assets/ship.png');
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    player = game.add.sprite(400, 500, 'ship');
    player.scale.setTo(0.45);
    player.anchor.setTo(0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
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
    }
}

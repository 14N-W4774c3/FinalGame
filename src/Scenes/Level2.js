class Platformer2 extends Phaser.Scene {
    constructor(lives) {
        super("platformerScene2");
        this.lives = lives
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 500;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.pause = false;

        // VFX Timers
        this.jumpTick = 0;
        this.landTick = 0;
        this.lifeTick = 0;

        // Pickup Animation Timer
        this.heartBeat = 0;
    }

    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        // Create Buttons
        this.buttonYes = this.add.sprite(370, 500, "buttonGraphic").setScale(1.75, 1);
        this.buttonNo = this.add.sprite(780, 500, "buttonGraphic").setScale(1.75, 1);
        this.buttonContinue = this.add.sprite(500, 500, "buttonGraphic").setScale(1.75, 1);
        this.buttonYes.setScrollFactor(0);
        this.buttonNo.setScrollFactor(0);
        this.buttonContinue.setScrollFactor(0);
        this.buttonYes.visible = false;
        this.buttonNo.visible = false;
        this.buttonContinue.visible = false;

        // Create Text
        this.gameOverText = this.add.text(500, 200, "Game Over").setScrollFactor(0);
        this.continueText = this.add.text(500, 250, "Do You Want To Continue?").setScrollFactor(0);
        this.yesText = this.add.text(350, 500, "Yes").setScrollFactor(0);
        this.noText = this.add.text(750, 500, "No").setScrollFactor(0);
        this.clearText = this.add.text(500, 200, "Oarim cleared Level 2").setScrollFactor(0);
        this.nextLevelText = this.add.text(500, 500, "Level 3").setScrollFactor(0);
        this.gameOverText.visible = false;
        this.continueText.visible = false;
        this.yesText.visible = false;
        this.noText.visible = false;
        this.clearText.visible = false;
        this.nextLevelText.visible = false;

        // Create a new tilemap game object which uses 18x18 pixel tiles
        this.map = this.add.tilemap("platformer-level", 18, 18, 45, 20);
        
        // Load Tilesets
        this.tileset = [
            this.map.addTilesetImage("Industrial", "tilemap_indus"), 
            this.map.addTilesetImage("Neutral", "tilemap_tiles"),
            this.map.addTilesetImage("Food", "tilemap_food"),
            this.map.addTilesetImage("Stone", "tilemap_stone"),
            this.map.addTilesetImage("Rock", "tilemap_rock")
        ];

        // Create map layers
        this.caverns = this.map.createLayer("Caverns", this.tileset, 0, 0);
        this.pipes = this.map.createLayer("Piping", this.tileset, 0, 0);
        this.background = this.map.createLayer("Background", this.tileset, 0, 0);
        this.platforms = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.barrier = this.map.createLayer("Barrier", this.tileset, 0, 0);
        this.acid = this.map.createLayer("Acid", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.roof = this.map.createLayer("Roof", this.tileset, 0, 0);
        this.foreground = this.map.createLayer("Foreground", this.tileset, 0, 0);
        
        this.physics.world.setBounds(0, 0, game.width, game.height, true, true, true, false);

        // Make them collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.barrier.setCollisionByProperty({
            collides: true
        });
        this.platforms.setCollisionByProperty({
            collides: true
        });
        this.roof.setCollisionByProperty({
            collides: true
        });
        // ACID IMPLEMENTATION

        // Set spawn point and end point
        this.spawnPoint = this.map.findObject("Objects", obj => obj.name === "spawn");
        this.endPoint = this.map.createFromObjects("Objects", {
            name: "endpoint",
            key: "indusList",
            frame: 58
        });

        // Create hearts
        this.hearts = this.map.createFromObjects("Objects", {
            name: "heart",
            key: "spriteList",
            frame: 44
        });

        // Enable object collisions
        this.physics.world.enable(this.hearts, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endPoint, Phaser.Physics.Arcade.STATIC_BODY);
        this.heartGroup = this.add.group(this.hearts);

        // Particle VFX
        // Walking
        this.walkVFX = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_05.png'],
            random: true,
            scale: {start: 0.03, end: 0.075},
            maxAliveParticles: 5,
            lifespan: 350,
            gravityY: 100,
            alpha: {start: 1.0, end: 0.1},}
        );
        this.walkVFX.stop();

        // Jumping
        this.jumpVFX = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_09.png', 'smoke_10.png'],
            random: true,
            scale: {start: 0.03, end: 0.075},
            maxAliveParticles: 3,
            lifespan: 250,
            gravityY: 150,
            alpha: {start: 1.0, end: 0.1},});
        this.jumpVFX.stop();

        // Landing
        this.landVFX = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_07.png', 'smoke_05.png'],
            random: true,
            scale: {start: 0.03, end: 0.075},
            maxAliveParticles: 3,
            lifespan: 250,
            gravityY: 100,
            velocityY: 75,
            alpha: {start: 1.0, end: 0.1},
        });
        this.landVFX.stop();

        // Collecting Lives
        this.lifeVFX = this.add.particles(0, 0, "kenny-particles", {
            frame: ['symbol_01.png'],
            random: true,
            scale: {start: 0.03, end: 0.075},
            maxAliveParticles: 5,
            lifespan: 350,
            gravityY: -100,
            alpha: {start: 1.0, end: 0.1},
        });
        this.lifeVFX.stop();

        // Set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.barrier);
        this.physics.add.collider(my.sprite.player, this.platforms);
        this.physics.add.collider(my.sprite.player, this.roof);

        // Heart Collision Implementation
        this.physics.add.overlap(my.sprite.player, this.heartGroup, (obj1, obj2) => {
            this.lifeVFX.setX(obj2.x);
            this.lifeVFX.setY(obj2.y);
            this.lifeVFX.start();
            this.lifeTick = 20;
            this.sound.play("powerup");
            obj2.destroy();
            this.lives ++;
        });

        // Level End Condition
        this.physics.add.overlap(my.sprite.player, this.endPoint, (obj1, obj2) => {
            this.winGame();
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        this.resetCamera();

        this.animatedTiles.init(this.map);
    }
    update() {}

    // Function for game overs
    gameOver(){
        this.pause = true;
        this.gameOverText.visible = true;
        this.continueText.visible = true;
        this.yesText.visible = true;
        this.buttonYes.visible = true;
        this.buttonYes.setInteractive();
        this.noText.visible = true;
        this.buttonNo.visible = true;
        this.buttonNo.setInteractive();
    }
    // Function for completing the level
    winGame(){
        this.pause = true;
        this.youWonText.setX(this.cameras.main.worldView.x + 350);
        this.youWonText.setDepth(10);
        this.youWonText.visible = true;
        this.restartText.setX(this.cameras.main.worldView.x + 350);
        this.restartText.setDepth(12);
        this.restartText.visible = true;
        this.buttonRestart.setPosition(this.cameras.main.worldView.x + 350, 200);
        this.buttonRestart.setDepth(11);
        this.buttonRestart.setInteractive();
    }
    // Function for killing the player
    loseLife(){
        my.sprite.player.destroy();
        console.log("Killed Player");
        this.lives--;
        console.log("Lives remaining: "+this.lives);
        my.sprite.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        console.log("Player spawned at "+ my.sprite.player.x +", "+ my.sprite.player.x);
        this.resetCamera();
        return;
    }
    // Function for resetting the camera
    resetCamera(){
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        return;
    }
}
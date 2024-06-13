class Platformer2 extends Phaser.Scene {
    constructor() {
        super("platformerScene2");
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
        if (!this.lives){
            this.lives = 2;
        }

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
        // Create a new tilemap game object which uses 18x18 pixel tiles
        this.map = this.add.tilemap("platformer-level2", 18, 18, 45, 20);
        
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
        this.pipes = this.map.createLayer("Piping", this.tileset, 0, 0).setScrollFactor(1, 0.5);
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
        this.roof.setCollisionByProperty({
            collides: true
        });

        // Set spawn point and end point
        this.spawnPoint = this.map.findObject("Objects", obj => obj.name === "spawn");
        this.endPoint = this.map.createFromObjects("Objects", {
            name: "endpoint",
            key: "indusList",
            frame: 58
        });
        this.killZone = this.map.createFromObjects("Objects", {
            name: "killzone",
            key: "indusList",
            frame: 45
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
        this.physics.world.enable(this.killZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.killZoneGroup = this.add.group(this.killZone);
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

        // Acid Collision Implementation
        this.physics.add.overlap(my.sprite.player, this.killZoneGroup, (obj1, obj2) => {
            this.loseLife();
        });

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
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.rKey = this.input.keyboard.addKey('R');

        this.resetCamera();

        this.animatedTiles.init(this.map);

        // Create Buttons
        this.buttonYes = this.add.sprite(515, 510, "buttonGraphic").setScale(1.75, 1);
        this.buttonNo = this.add.sprite(885, 510, "buttonGraphic").setScale(1.75, 1);
        this.buttonContinue = this.add.sprite(685, 510, "buttonGraphic").setScale(1.75, 1);
        this.buttonYes.setScrollFactor(0);
        this.buttonNo.setScrollFactor(0);
        this.buttonContinue.setScrollFactor(0);
        this.buttonYes.visible = false;
        this.buttonNo.visible = false;
        this.buttonContinue.visible = false;

        // Create Text
        this.gameOverText = this.add.text(600, 300, "Game Over").setScrollFactor(0);
        this.continueText = this.add.text(600, 350, "Do You Want To Continue?").setScrollFactor(0);
        this.yesText = this.add.text(500, 500, "Yes").setScrollFactor(0);
        this.noText = this.add.text(870, 500, "No").setScrollFactor(0);
        this.clearText = this.add.text(600, 300, "Oarim cleared Level 2").setScrollFactor(0);
        this.nextLevelText = this.add.text(650, 500, "Level 3").setScrollFactor(0);
        this.gameOverText.visible = false;
        this.continueText.visible = false;
        this.yesText.visible = false;
        this.noText.visible = false;
        this.clearText.visible = false;
        this.nextLevelText.visible = false;
    }
    update() {
        if (this.pause == false){
            // Check Lives
            if (this.lives == 0){
                this.gameOver();
            }
            
            // Death Checks
            // Crushing
            if (my.sprite.player.body.blocked.up && my.sprite.player.body.blocked.down){
                this.loseLife();
            }

            // Particle Tracking
            if(this.jumpTick > 0){
                this.jumpTick--;
                if(this.jumptick == 0){
                    this.jumpVFX.stop();
                }
            }
            if(this.landTick > 0){
                this.landTick--;
                if(this.landTick == 0){
                    this.landVFX.stop();
                }
            }
            if(this.lifeTick > 0){
                this.lifeTick--;
                if(this.lifeTick == 0){
                    this.lifeVFX.stop();
                }
            }

            // Heart Animation
            this.heartBeat++;
            if(this.heartBeat%120==0){
                for(let heart of this.hearts){
                    if (heart.scale == 1){
                        heart.scale = 1.5;
                    }
                }
            }
            if((this.heartBeat+110)%120==0){
                for(let heart of this.hearts){
                    if (heart.scale == 1.5){
                        heart.scale = 1;
                    }
                }
            }

            /* Layer Movement - Level 2
             Upon elevator lever being pulled, the platform starts lowering
             A few seconds later, it speeds up and the roof starts dropping
             A few seconds after that, it is destroyed and the roof drops faster
             Upon the barrier lever being pulled, the barrier slowly opens

             Unfortunately, I could get neither the levers nor the moving layers to play nice.
             So all we get is this sad comment - the repository history will include my scraps.
            */


            // Player Movement
            if(cursors.left.isDown) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
                my.sprite.player.resetFlip();
                my.sprite.player.anims.play('walk', true);
                this.walkVFX.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                this.walkVFX.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                // Only play smoke effect if touching the ground
                if (my.sprite.player.body.blocked.down) {
                    this.walkVFX.start();
                }
            } else if(cursors.right.isDown) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
                my.sprite.player.setFlip(true, false);
                my.sprite.player.anims.play('walk', true);
                this.walkVFX.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                this.walkVFX.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
                // Only play smoke effect if touching the ground
                if (my.sprite.player.body.blocked.down) {
                    this.walkVFX.start();
                }
            } else {
                // Set acceleration to 0 and have DRAG take over
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
                this.walkVFX.stop();
            }
    
            // player jump
            // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
            }
            if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpVFX.start();
                this.jumpTick = 5;
            }
            // Maunal Restart - REMOVE FOR FINAL VERSION
            if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.scene.restart();
            }         
        }

        // Button Interactions
        this.buttonYes.on('pointerdown', () => {
            this.scene.restart();
        });
        this.buttonNo.on('pointerdown', () => {
            this.scene.start("titleScene");
        });
        this.buttonContinue.on('pointerdown', () => {
            this.scene.start("platformerScene3");
        });
    }

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
        this.clearText.visible = true;
        this.nextLevelText.visible = true;
        this.buttonContinue.visible = true;
        this.buttonContinue.setInteractive();
    }
    // Function for killing the player
    loseLife(){
        my.sprite.player.destroy();
        this.lives--;
        if (this.lives > 0){
            my.sprite.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, "platformer_characters", "tile_0000.png");
            my.sprite.player.setCollideWorldBounds(true);
            this.resetCollision();
            this.resetCamera();
        }
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
    // Function for resetting collision
    resetCollision(){
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.overlap(my.sprite.player, this.killZoneGroup, (obj1, obj2) => {
            this.loseLife();
        });
        this.physics.add.overlap(my.sprite.player, this.heartGroup, (obj1, obj2) => {
            this.lifeVFX.setX(obj2.x);
            this.lifeVFX.setY(obj2.y);
            this.lifeVFX.start();
            this.lifeTick = 20;
            this.sound.play("powerup");
            obj2.destroy();
            this.lives ++;
        });
        this.physics.add.overlap(my.sprite.player, this.endPoint, (obj1, obj2) => {
            this.winGame();
        });
    }
}
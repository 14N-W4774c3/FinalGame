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

        // Layer Movement Timers
        this.platformTick = -1;
        this.barrierTick = -1;
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

        // Create Levers
        this.leverPlatform = this.map.createFromObjects("Objects", {
            name: "levertop",
            key: "spriteList",
            frame: 66
        });
        this.leverBarrier = this.map.createFromObjects("Objects", {
            name: "levermid",
            key: "spriteList",
            frame: 66
        });

        // Enable object collisions
        this.physics.world.enable(this.hearts, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endPoint, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.leverPlatform, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.leverBarrier, Phaser.Physics.Arcade.STATIC_BODY);
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
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.rKey = this.input.keyboard.addKey('R');

        this.resetCamera();

        this.animatedTiles.init(this.map);
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
            // Acid

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

            // Lever Animation Handler
            this.leverBarrier.on(Phaser.Animations.Events.Animation_Complete, () => {
                this.barrierTick = 0;
            });
            this.leverPlatform.on(Phaser.Animations.Events.Animation_Complete, () => {
                this.platformTick = 0;
            });

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
            */
            if (this.platformTick >= 0){
                this.platformTick++;
                if (this.platformTick % 10 == 0){
                    this.platforms.Y += 3;
                }
                if (this.platformTick > 180 && this.platformTick % 10 == 0){
                    this.platforms.Y += 3;
                    this.roof.Y += 3;
                }
                if (this.platformTick = 360){
                    this.platforms.destroy();
                }
                if (this.platformTick > 360 && this.platformTick % 10){
                    this.roof.Y += 3;
                }
            }
            if (this.barrierTick >= 0){
                this.barrierTick++;
                if (this.barrierTick % 5 == 0){
                    this.barrier.X += 3;
                }
                if (this.barrierTick == 180){
                    this.barrierTick = -1;
                }
            }

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
                if (this.jumpboost){
                    my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY*1.5);
                }
                else {
                    my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                    this.jumpVFX.start();
                    this.jumpTick = 5;
                }
            }
            
            // Object Interaction
            if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
                if (!this.barrierLeverActive && this.leverBarrier.body.touching){// INSERT OVERLAP CHECK HERE
                    this.barrierLeverActive = true;
                    this.leverBarrier.play("lever");
                }
                if (!this.platformLeverActive && this.leverPlatform.body.touching){
                    this.platformLeverActive = true;
                    this.leverPlatform.play("lever");
                }
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
        console.log("Killed Player");
        this.lives--;
        console.log("Lives remaining: "+this.lives);
        this.roof.Y = 0;
        this.barrier.Y = 0;
        if (!this.platforms){
            this.platforms = this.map.createLayer("Platforms", this.tileset, 0, 0);
        }
        else {
            this.platforms.Y = 0;
        }
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
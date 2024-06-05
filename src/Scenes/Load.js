class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("tilemap_indus", "industrial_tilemap_packed.png");
        this.load.tilemapTiledJSON("platformer-level", "platformer-level.tmj");

        // Load Particles
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        this.load.audio("powerup", "impactMining_003.ogg");

        // Load Buttons
        this.load.image("buttonGraphic", "red.png");

        // Load Title Screen
        this.load.image("titlePage", "title.png");

        // Object Sprites
        this.load.spritesheet('spriteList', 'tilemap_packed.png', {frameWidth: 18, frameHeight: 18});
        this.load.spritesheet('indusList', 'industrial_tilemap_packed.png', {frameWidth: 18, frameHeight: 18});
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("titleScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
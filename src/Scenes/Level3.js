class Platformer3 extends Phaser.Scene {
    constructor() {
        super("platformerScene3");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.lives = 2;
        this.pause = false;
        this.jumpTick = 0;
        this.landTick = 0;
        this.lifeTick = 0;
        this.heartBeat = 0;
    }
}
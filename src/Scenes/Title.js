class Title extends Phaser.Scene {
    constructor (){
        super("titleScene");
    }
    create (){
        // LOOK UP HOW TO PROPERLY REFERENCE GAME DIMENSIONS
        this.titleText = this.add.text(400, 200, "Oarim in the Depths", {align: 'center'});
        this.playText = this.add.text(200, 500, "Play", {align: 'center'});
        this.creditsText = this.add.text(600, 500, "Credits", {align: 'center'});

        this.buttonPlay = this.add.nineslice(200, 500, "buttonGraphic");
        this.buttonCredits = this.add.nineslice(600, 500, "buttonGraphic");
    }
    update (){
        this.buttonPlay.on('pointerdown', () => {
            this.scene.start("platformerScene1")
        });
        this.buttonCredits.on('pointerdown', () => {
            this.scene.start("creditsScene")
        });
    }
}

class Credits extends Phaser.Scene {
    constructor (){
        super("creditsScene");
    }
    create () {
        this.creditsTitle = this.add.text(400, 200, "Credits", {align: 'center'});
        this.programCredits = this.add.text(400, 300, "Programming by Ian Wallace", {align: 'center'});
        this.assistCredits = this.add.text(400, 400, "Built off base code from Jim Whitehead", {align: 'center'});
        this.animationCredits = this.add.text(400, 500, "Animated Tiles plugin by Niklas Berg (2018)", {align: 'center'});
        this.artCredits = this.add.text(400, 600, "Art assets from Kenney Assets", {align: 'center'});
        this.soundCredits = this.add.text(400, 700, "Audio assets from Kenney Assets", {align: 'center'});

    }
}
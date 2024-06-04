class Title extends Phaser.Scene {
    constructor (){
        super("titleScene");
    }
    create (){
        // LOOK UP HOW TO PROPERLY REFERENCE GAME DIMENSIONS
        this.titleText = this.add.text(350, 200, "Oarim in the Depths", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
        });

        // REPLACE WITH MODIFIED SPRITE - NINESLICE HAS YET TO DISPLAY
        //this.buttonPlay = new NineSlice(200, 500, "buttonGraphic", 0, 128, 110, 64, 64);
        //this.buttonCredits = new NineSlice(600, 500, "buttonGraphic", 0, 128, 110, 64, 64);
        this.buttonPlay = this.add.sprite(220, 510, "buttonGraphic").setScale(1.75, 1);
        this.buttonCredits = this.add.sprite(630, 510, "buttonGraphic").setScale(1.75, 1);
        this.buttonPlay.setInteractive();
        this.buttonCredits.setInteractive();

        this.playText = this.add.text(200, 500, "Play");
        this.creditsText = this.add.text(600, 500, "Credits");
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
    init() {
        this.config = {
            align: 'center',
        }
    }

    create () {
        this.creditsTitle = this.add.text(400, 150, "Credits", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
            align: 'center',
        });
        // Text alignment only applies to MULTI-LINE text; revise so all are one object
        this.programCredits = this.add.text(100, 200, "Programming by Ian Wallace", this.config);
        this.assistCredits = this.add.text(100, 250, "Built off base code from Jim Whitehead", this.config);
        this.animationCredits = this.add.text(100, 300, "Animated Tiles plugin by Niklas Berg (2018)", this.config);
        this.artCredits = this.add.text(100, 350, "Art assets from Kenney Assets", this.config);
        this.soundCredits = this.add.text(100, 400, "Audio assets from Kenney Assets", this.config);

        //this.buttonReturn = this.add.nineslice(400, 550, "buttonGraphic");
        this.buttonReturn = this.add.sprite(400, 560, "buttonGraphic").setScale(1.75, 1);
        this.buttonReturn.setInteractive();

        this.returnText = this.add.text(370, 550, "Return", this.config);
    }
    update (){
        this.buttonReturn.on('pointerdown', () => {
            this.scene.start("titleScene");
        });
    }
}
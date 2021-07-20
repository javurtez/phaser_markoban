import MainGame from "../Scenes/MainGame";
import MainMenu from "../Scenes/MainMenu";

export default class GamePanel extends Phaser.GameObjects.Container {

    constructor(scene: MainGame, x: number, y: number) {
        super(scene, x, y, null);

        var bgLevel = scene.add.sprite(0, 0, "bg").setScale(.6).setOrigin(.5);
        var resumeBtn = scene.add.sprite(0, -50, "button").setInteractive().setOrigin(.5).setScale(.35).setScrollFactor(0).
            on("pointerdown", () => {
                this.Close();
            });
        var backToMenuBtn = scene.add.sprite(0, 50, "button").setInteractive().setOrigin(.5).setScale(.35).setScrollFactor(0).
            on("pointerdown", () => {
                this.Close();
                this.scene.scene.start(MainMenu.Name);
            });
        var resumeTxt = scene.add.text(resumeBtn.x, resumeBtn.y, "Resume").setOrigin(.5).setFontSize(33).setFontStyle("Bold");
        var backTxt = scene.add.text(backToMenuBtn.x, backToMenuBtn.y, "Back to Menu").setOrigin(.5).setFontSize(33).setFontStyle("Bold");

        this.setScrollFactor(0);
        this.add([bgLevel, resumeBtn, backToMenuBtn, backTxt, resumeTxt]);

        scene.add.existing(this);

        this.setVisible(false);
        this.setActive(false);
    }

    public Open(): void {
        this.setVisible(true);
        this.setActive(true);
        this.scene.add.tween({
            targets: this,
            scale: {
                from: 0,
                to: 1
            },
            ease: 'Linear',
            duration: 200,
            onComplete: () => {
            }
        })
    }
    public Close(): void {
        this.scene.add.tween({
            targets: this,
            scale: {
                from: 1,
                to: 0
            },
            ease: 'Linear',
            duration: 200,
            onComplete: () => {
                this.setVisible(false);
                this.setActive(false);
            }
        })
    }
}

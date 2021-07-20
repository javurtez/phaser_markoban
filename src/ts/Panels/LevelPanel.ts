import Constants from "../Constants";
import MainGame from "../Scenes/MainGame";

export default class LevelPanel extends Phaser.GameObjects.Container {

    levelText: Phaser.GameObjects.Text;
    nextBtn: Phaser.GameObjects.Sprite;
    nextText: Phaser.GameObjects.Text;
    moveText: Phaser.GameObjects.Text;
    constructor(scene: MainGame, x: number, y: number) {
        super(scene, x, y, null);

        this.levelText = scene.add.text(-230, -35, "").setOrigin(1, .5).setFontSize(33).setFontStyle("Bold");
        this.nextBtn = scene.add.sprite(350, -35, "button").setOrigin(.5).setScale(.2).setScrollFactor(0).
            setInteractive().
            on("pointerdown", () => this.OnNext(scene));
        this.nextText = scene.add.text(this.nextBtn.x, this.nextBtn.y, "Next").setOrigin(.5).setFontSize(33).setFontStyle("Bold");
        
        var restartBtn = scene.add.sprite(0, -35, "button").setOrigin(.5).setScale(.2).setScrollFactor(0).
            setInteractive().
            on("pointerdown", () => this.OnRestart(scene));
        var restartText = scene.add.text(restartBtn.x, restartBtn.y, "Restart").setOrigin(.5).setFontSize(33).setFontStyle("Bold");

        this.moveText = scene.add.text(-75, 15, "Moves: 0").setOrigin(0, .5).setFontSize(33);

        this.add([this.levelText, this.nextBtn, this.nextText, restartBtn, restartText, this.moveText]);

        this.HideNext();

        this.setScrollFactor(0);

        scene.add.existing(this);
    }

    public ShowNext(): void {
        this.nextBtn.setVisible(true).setActive(true);
        this.nextText.setVisible(true).setActive(true);
    }
    public HideNext(): void {
        this.nextBtn.setVisible(false).setActive(false);
        this.nextText.setVisible(false).setActive(false);
    }

    public SetMove(moveCount: number): void {
        this.moveText.setText("Moves: " + moveCount);
    }
    public SetLevel(level: number): void {
        this.levelText.setText("Level: " + level + " / " + Constants.MaxLevel);
    }

    public OnRestart(scene: MainGame): void {
        scene.RestartLevel();
    }
    public OnNext(scene: MainGame): void {
        scene.NextLevel();
    }
}

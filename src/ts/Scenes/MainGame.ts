import Utilities from "../Utilities";
import LevelContainer from "../Prefabs/LevelContainer"
import LevelPanel from "../Panels/LevelPanel";
import Constants from "../Constants";
import GamePanel from "../Panels/GamePanel";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	player: Phaser.GameObjects.Sprite;
	nextLevel: LevelContainer;
	level: LevelContainer;
	levelPanel: LevelPanel;
	gamePanel: GamePanel;
	curLevel: number;
	canControl: boolean;

	moveCount: number;

	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#3498db");

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

		this.cameras.main.zoom = .7;

		this.moveCount = 0;

		this.levelPanel = new LevelPanel(this, screenCenterX, -25);
		this.levelPanel.SetLevel(Constants.Level);

		this.gamePanel = new GamePanel(this, screenCenterX, screenCenterY);
		this.gamePanel.setDepth(1);

		this.curLevel = Constants.Level - 1;

		var config = {
			key: 'player_run',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2, first: 0 }),
			frameRate: 6,
			repeat: -1
		};
		this.anims.create(config);
		this.player = this.add.sprite(0, -1000, "player").setOrigin(.5).setScale(.9).play('player_run');

		this.time.delayedCall(100, () => this.NextLevel(true));

		this.input.keyboard.addKey('W').on('down', () => this.MovePlayer(new Phaser.Math.Vector2(0, -1)));
		this.input.keyboard.addKey('S').on('down', () => this.MovePlayer(new Phaser.Math.Vector2(0, 1)));
		this.input.keyboard.addKey('A').on('down', () => this.MovePlayer(new Phaser.Math.Vector2(-1, 0)));
		this.input.keyboard.addKey('D').on('down', () => this.MovePlayer(new Phaser.Math.Vector2(1, 0)));

		this.input.keyboard.addKey('ESC').on('down', () => this.ShowGameMenu());

		this.events.on('shutdown', this.Destroy, this);
	}

	public update(): void {
		if (!this.canControl) return;
		if (this.level != null) {
			this.level.update();
		}
	}

	private Destroy(): void {
		this.input.keyboard.removeAllListeners();
		this.events.removeListener('shutdown', this.Destroy, this);

		this.levelPanel.destroy();
		this.gamePanel.destroy();
		this.player.destroy();
		this.level.destroy();
		if (this.nextLevel) {
			this.nextLevel.destroy();
		}

		this.level = null;
		this.nextLevel = null;
		this.levelPanel = null;
		this.gamePanel = null;
		this.player = null;
	}

	private MovePlayer(v: Phaser.Math.Vector2): void {
		if (this.gamePanel.active) return;
		if (!this.canControl) return;
		if (this.level == null) return;
		if (this.level.IsMoveable(v)) {
			this.player.x += v.x * 64;
			this.player.y += v.y * 64;

			this.moveCount++;
			this.levelPanel.SetMove(this.moveCount);
		}
	}

	private ShowGameMenu(): void {
		if (this.gamePanel.active) {
			this.gamePanel.Close();
		}
		else {
			this.gamePanel.Open();
		}
	}

	public RestartLevel(): void {
		this.curLevel--;
		this.moveCount = 0;
		this.levelPanel.SetMove(0);
		this.NextLevel(true);
	}
	public NextLevel(isStart: boolean = false): void {
		this.curLevel++;
		this.moveCount = 0;
		this.levelPanel.SetMove(0);

		this.levelPanel.SetLevel(this.curLevel);
		this.levelPanel.HideNext();

		if (this.curLevel > Constants.MaxLevel) {
			return;
		}

		var addPos = 228.57;
		var pos = this.curLevel == 1 ? ((this.curLevel) * addPos) : ((this.curLevel * 5) * addPos);
		this.nextLevel = new LevelContainer(this, this.levelPanel, pos, addPos, this.curLevel);
		this.nextLevel.SetPhysics(this.player);

		this.player.setDepth(1);
		this.player.setPosition(pos + this.nextLevel.spawnObject.x, addPos + this.nextLevel.spawnObject.y);

		var loadLevel =  parseInt(localStorage.getItem(Constants.LevelSaveKey));
		if (this.curLevel > loadLevel) {
			localStorage.setItem(Constants.LevelSaveKey, this.curLevel.toString());
		}

		if (!isStart) {
			this.canControl = false;
			this.tweens.add({
				targets: this.cameras.main,
				scrollX: this.nextLevel.x - 250,
				duration: 1000,
				onComplete: () => {
					if (this.level != null) {
						this.level.destroy();
					}
					this.level = this.nextLevel;
					this.canControl = true;
				}
			});
		}
		else {
			if (this.level != null) {
				this.level.destroy();
			}
			this.cameras.main.scrollX = this.nextLevel.x - 250;
			this.level = this.nextLevel;
			this.canControl = true;
		}

	}
}

import Constants from "../Constants";
import AudioManager from "../Managers/AudioManager";
import Utilities from "../Utilities";
import MainGame from "./MainGame";

export default class MainMenu extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainMenu";

	levelSelect: Phaser.GameObjects.Container;

	public create(): void {
		Utilities.LogSceneMethodEntry("MainMenu", "create");

		Constants.SaveLevel = parseInt(localStorage.getItem(Constants.LevelSaveKey)) || 1;
		//Constants.SaveLevel = Constants.MaxLevel;

		this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor(Constants.BackgroundHex);

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

		this.levelSelect = this.add.container(screenCenterX, screenCenterY);

		var bgLevel = this.add.sprite(0, 0, "bg").setScale(.6).setOrigin(.5);
		this.levelSelect.add(bgLevel);
		var xLimit = 5;
		var yCount = 0;
		var xCount = 1;
		for (var i = 1; i <= Constants.MaxLevel; i++) {
			if (i != 1 && (i - 1) % xLimit == 0) {
				yCount++;
				xCount = 1;
			}
			var btn = this.add.sprite(-150 + (75 * (xCount - 1)), -200 + (yCount * 75), "frame").setInteractive().setOrigin(.5).setScale(.3);
			var txt = this.add.text(btn.x, btn.y, "" + i).setOrigin(.5).setFontSize(22);

			if (Constants.SaveLevel >= i) {
				const level = i;
				btn.on("pointerdown", () => {
					this.StartGame(level);
				});
			}
			else {
				btn.setTexture("frame_unable");
			}

			this.levelSelect.add([btn, txt]);
			xCount++;
		}

		var timer = 200;
		var newGameBtn = this.add.sprite(screenCenterX, screenCenterY, "button").setInteractive().setOrigin(.5).setScale(.3).
			on("pointerdown", () => {
				if (this.levelSelect.active) return;
				this.SelectLevelActive(true);
				this.levelSelect.scale = 0;
				this.tweens.add({
					targets: this.levelSelect,
					duration: timer,
					scale: 1
				})
			});
		this.add.text(newGameBtn.x, newGameBtn.y, "New Game").setOrigin(.5).setFontSize(33).setFontStyle("Bold");
		newGameBtn.setScrollFactor(0);

		var soundToggle = this.add.sprite(newGameBtn.x, newGameBtn.y + 100, AudioManager.Instance.IsMuted ? "volume_off" : "volume_on").setOrigin(.5);
		soundToggle.setInteractive();
		soundToggle.on("pointerdown", ()=> this.VolumeSet(soundToggle), this);
		soundToggle.setScale(2.5);
		soundToggle.setScrollFactor(0);

		// var fullScreenBtn = this.add.sprite(screenCenterX, screenCenterY, "button").setInteractive().setOrigin(.5).setScale(.3).
		// 	on("pointerdown", () => {
		// 		if (this.scale.isFullscreen) {
		// 			this.scale.stopFullscreen();
		// 			// On stop fulll screen
		// 		} else {
		// 			this.scale.startFullscreen();
		// 			// On start fulll screen
		// 		}
		// 	});
		// this.add.text(fullScreenBtn.x, fullScreenBtn.y, "Full Screen").setOrigin(.5).setFontSize(33).setFontStyle("Bold");
		// fullScreenBtn.setScrollFactor(0);

		for (var i = 1; i < 7; i++) {
			var xPos = (64 * i) - 32;
			var yPos = (64 * i) + 32;
			this.add.sprite(xPos, 32, "block").setOrigin(.5);
			if (i != 6) {
				this.add.sprite(32, yPos, "block").setOrigin(.5);
			}
		}
		for (var i = 1; i < 7; i++) {
			var xPos = 832 - ((64 * i));
			var yPos = 568 - ((64 * i));
			this.add.sprite(xPos, 568, "block").setOrigin(.5);
			if (i != 6) {
				this.add.sprite(768, yPos, "block").setOrigin(.5);
			}
		}

		this.levelSelect.setDepth(1);
		this.SelectLevelActive(false);

		this.input.keyboard.addKey('ESC').on('down', () => this.BackLevel());

		this.events.on('shutdown', this.Destroy, this);
	}

	private Destroy(): void {
		this.input.keyboard.removeKey('ESC');
		this.events.removeListener('shutdown', this.Destroy, this);
	}
	private BackLevel(): void {
		if (!this.levelSelect.active) return;
		if (this.scale.isFullscreen) return;
		this.tweens.add({
			targets: this.levelSelect,
			duration: 200,
			scale: 0,
			onComplete: () => {
				this.SelectLevelActive(false);
			}
		});
	}

	private VolumeSet(toggle): void {
		AudioManager.Instance.SetMute(!AudioManager.Instance.IsMuted);

		toggle.setTexture(AudioManager.Instance.IsMuted ? "volume_off" : "volume_on");
	}

	private SelectLevelActive(isActive: boolean): void {
		this.levelSelect.setVisible(isActive);
		this.levelSelect.setActive(isActive);
	}

	private StartGame(i: number): void {
		if (!this.levelSelect.active) return;
		console.log(i);
		Constants.Level = i;
		this.scene.start(MainGame.Name);
	}
}

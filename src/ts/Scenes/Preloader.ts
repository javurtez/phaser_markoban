import SplashScreen from "./SplashScreen";
import Utilities from "../Utilities";
import Constants from "../Constants";
import AudioManager from "../Managers/AudioManager";

export default class Preloader extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "Preloader";

	public preload(): void {
		this.addProgressBar();
		
		this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor(Constants.BackgroundHex);

		this.load.path = "assets/";

		this.load.spritesheet("player", "spritesheet.png", { frameWidth: 74, frameHeight: 74 });

		this.load.image("block", "block_03.png");
		this.load.image("ground", "ground_06.png");
		this.load.image("key", "ground_03.png");
		this.load.image("crate", "crate_42.png");
		this.load.image("crate_open", "crate_45.png");
		this.load.image("spawn", "crate_42.png");

		this.load.image("bg", "UI/bg_01_02.png");
		this.load.image("frame", "UI/frame_c2_01.png");
		this.load.image("frame_unable", "UI/frame_c3_01.png");
		this.load.image("button", "UI/Plank_09.png");
		this.load.image("volume_on", "UI/VolumeOn.png");
		this.load.image("volume_off", "UI/VolumeOff.png");
		
		this.load.audio("crate_enter", "Audio/crate_enter.mp3");
		this.load.audio("crate_exit", "Audio/crate_exit.mp3");
		this.load.audio("push", "Audio/push.mp3");
		this.load.audio("bgm", "Audio/goof_mischief.mp3");

		for (var i = 1; i <= Constants.MaxLevel; i++) {
			this.load.json("level_" + i, "Level/Level_" + i + ".json");
		}
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");

		AudioManager.Init();

		this.scene.start(SplashScreen.Name);
	}

	/**
	 * Adds a progress bar to the display, showing the percentage of assets loaded and their name.
	 */
	private addProgressBar(): void {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		/** Customizable. This text color will be used around the progress bar. */
		const outerTextColor = '#ffffff';

		const progressBar = this.add.graphics();
		const progressBox = this.add.graphics();
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

		const loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: "Loading...",
			style: {
				font: "20px monospace",
				color: outerTextColor
			}
		});
		loadingText.setOrigin(0.5, 0.5);

		const percentText = this.make.text({
			x: width / 2,
			y: height / 2 - 5,
			text: "0%",
			style: {
				font: "18px monospace",
				color: "#ffffff"
			}
		});
		percentText.setOrigin(0.5, 0.5);

		const assetText = this.make.text({
			x: width / 2,
			y: height / 2 + 50,
			text: "",
			style: {
				font: "18px monospace",
				color: outerTextColor
			}
		});

		assetText.setOrigin(0.5, 0.5);

		this.load.on("progress", (value: number) => {
			percentText.setText(parseInt(value * 100 + "", 10) + "%");
			progressBar.clear();
			progressBar.fillStyle(0xffffff, 1);
			progressBar.fillRect((width / 4) + 10, (height / 2) - 30 + 10, (width / 2 - 10 - 10) * value, 30);
		});

		this.load.on("fileprogress", (file: Phaser.Loader.File) => {
			assetText.setText("Loading asset: " + file.key);
		});

		this.load.on("complete", () => {
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
			assetText.destroy();
		});
	}
}

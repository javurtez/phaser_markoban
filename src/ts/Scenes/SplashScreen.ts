import AudioManager from "../Managers/AudioManager";
import Utilities from "../Utilities";
import MainMenu from "./MainMenu";

export default class SplashScreen extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "SplashScreen";

	public create(): void {
		Utilities.LogSceneMethodEntry("SplashScreen", "create");

		AudioManager.Instance.PlayBGM(this, "bgm");

		this.loadMainMenu();
	}

	/**
	 * Load the next scene, the main menu.
	 */
	private loadMainMenu(): void {
		this.scene.start(MainMenu.Name);
	}
}

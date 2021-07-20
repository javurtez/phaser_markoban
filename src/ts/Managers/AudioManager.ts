import Constants from "../../Constants";

export default class AudioManager {
    private static audioManagerSingleton: AudioManager;

    private allBackgroundAudio: Phaser.Sound.BaseSound[] = [];

    private isMute: boolean;
    private volume: number;

    public static Init(): void {
        if (!AudioManager.audioManagerSingleton) {
            AudioManager.audioManagerSingleton = new AudioManager();

            AudioManager.audioManagerSingleton.SetMute((localStorage.getItem(Constants.MuteSaveKey) == "1" ? true : false) || false);
        } else {
            throw new Error('You can only initialize one manager instance');
        }
    }

    static get Instance() {
        if (!AudioManager.audioManagerSingleton) {
            throw new Error('initialize Instantiator First!');
        }

        return AudioManager.audioManagerSingleton;
    }

    set Volume(volume: number) {
        this.volume = volume;
    }
    get Volume() {
        return this.volume;
    }
    get IsMuted() {
        return this.isMute;
    }

    public SetMute(isMute: boolean): void {
        this.isMute = isMute;

        if (this.isMute) {
            for (var i = 0; i < this.allBackgroundAudio.length; i++) {
                this.allBackgroundAudio[i].pause();
            }
        }
        else {
            for (var i = 0; i < this.allBackgroundAudio.length; i++) {
                this.allBackgroundAudio[i].resume();
            }
        }
        localStorage.setItem(Constants.MuteSaveKey, this.isMute ? "1" : "0")
    }
    public PlaySFXOneShot(scene: Phaser.Scene, key: string, volumeSfx: number = -1): void {
        if (this.isMute) return;
        scene.sound.play(key, {
            volume: volumeSfx == -1 ? this.volume : volumeSfx
        });
    }
    public PlaySFX(scene: Phaser.Scene, key: string, volumeSfx: number = -1): void {
        let sfx: Phaser.Sound.BaseSound = scene.sound.get(key);

        if (!sfx) {
            sfx = scene.sound.add(key, {
                mute: this.isMute,
                volume: volumeSfx == - 1 ? this.volume : volumeSfx,
                loop: false
            });
        }

        if (!this.isMute) {
            sfx.play();
        }
    }
    public PauseBGM(scene: Phaser.Scene, key: string): void {
        let bgm: Phaser.Sound.BaseSound = scene.sound.get(key);

        if (!bgm) return;

        bgm.pause();
    }
    public PlayBGM(scene: Phaser.Scene, key: string, replayIfSame: boolean = false): void {
        let bgm: Phaser.Sound.BaseSound = scene.sound.get(key);
        
        if (replayIfSame) {
            bgm.pause();
        }

        if (!bgm) {
            bgm = scene.sound.add(key, {
                loop: true,
                volume: .6
            });
            this.allBackgroundAudio.push(bgm);
            bgm.play();
        }

        if (this.isMute) {
            bgm.pause();
        }
        else {
            if (replayIfSame) {
                bgm.play();
            }
        }
    }
}

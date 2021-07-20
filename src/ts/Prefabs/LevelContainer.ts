import AudioManager from "../Managers/AudioManager";
import LevelPanel from "../Panels/LevelPanel";
import MainGame from "../Scenes/MainGame";
import CrateObject from "./CrateObject";

const block = "block";
const key = "key";

export default class LevelContainer extends Phaser.GameObjects.Container {
    spawnObject: Phaser.GameObjects.Sprite;
    private areaArray: number[][];
    private crateArray: CrateObject[];
    private keyArray: Phaser.GameObjects.Sprite[];
    private keyCount: number = 0;
    private levelPanel: LevelPanel;

    public AllKeyOpen(): boolean {
        return this.keyArray.length == this.keyCount;
    }

    constructor(scene: Phaser.Scene, lPanel: LevelPanel, x: number, y: number, nlevel: number) {
        super(scene, x, y);

        this.keyCount = 0;
        this.levelPanel = lPanel;
        this.areaArray = [];
        this.crateArray = [];
        this.keyArray = [];

        var level = scene.cache.json.get('level_' + nlevel);
        // var startX = -x / 4;
        // var startY = -y + 64;
        var startX = -57;
        var startY = -164;
        var size = 64;
        Object.keys(level).forEach(key => {
            for (var i = 0; i < Object.values(level[key]).length; i++) {
                var levelArr = Object.values(level[key]);
                for (var f = 0; f < (levelArr[i] as number[]).length; f++) {
                    for (var g = 0; g < (levelArr[i][f] as number[]).length; g++) {
                        var block;
                        if (levelArr[i][f][g] == 1) {
                            block = scene.add.sprite(startX + (g * size), startY + (f * size), "block").setOrigin(.5);
                        }
                        else if (levelArr[i][f][g] == 0 || levelArr[i][f][g] == 2 || levelArr[i][f][g] == 3) {
                            block = scene.add.sprite(startX + (g * size), startY + (f * size), "ground").setOrigin(.5);
                            //this.sendToBack(block);
                        }
                        else if (levelArr[i][f][g] == 4 || levelArr[i][f][g] == 6 || levelArr[i][f][g] == 7) {
                            block = scene.add.sprite(startX + (g * size), startY + (f * size), "key").setOrigin(.5);
                            scene.physics.add.existing(block);
                            this.keyArray.push(block);
                        }

                        if (block != null) {
                            this.add(block);
                        }

                        if (levelArr[i][f][g] == 3 || levelArr[i][f][g] == 7) {
                            block = new CrateObject(scene, startX + (g * size), startY + (f * size), "crate").setScale(.6).setOrigin(.5);
                            scene.physics.add.existing(block);
                            this.crateArray.push(block as CrateObject);
                            this.add(block);
                        }
                        else if (levelArr[i][f][g] == 2 || levelArr[i][f][g] == 6) {
                            this.spawnObject = scene.add.sprite(startX + (g * size), startY + (f * size), "spawn").setOrigin(.5);
                            this.spawnObject.setVisible(false);
                            this.playerVectorPosition = new Phaser.Math.Vector2(f, g);
                            this.add(this.spawnObject);
                        }
                    }
                    const myClonedArray = Object.assign([], levelArr[i][f]);
                    this.areaArray.push(myClonedArray);
                }
            }
        });

        scene.add.existing(this);
    }

    public update(): void {
        this.crateArray.forEach(element => {
            var elementBody = (element as Phaser.Types.Physics.Arcade.GameObjectWithBody).body;

            var wasTouching = element.hasCollide;
            var touching = elementBody.embedded;

            if (element.currentCollide == null || element.currentCollide.name != key) return;

            if (touching && !wasTouching) element.emit("overlapstart");
            else if (!touching && wasTouching) element.emit("overlapend");
        });
    }

    public SetPhysics(player: Phaser.GameObjects.Sprite): void {
        if (player.body == null) {
            this.scene.physics.add.existing(player);
        }
        this.scene.physics.add.overlap(player, this.crateArray, (play, crate) => {
            var crateSprite = (crate as Phaser.GameObjects.Sprite);
            crateSprite.x += (this.dir.x * 64);
            crateSprite.y += (this.dir.y * 64);
            this.bringToTop(crateSprite);

            crate.active = false;
            
            AudioManager.Instance.PlaySFXOneShot(this.scene, "push");

            this.scene.time.delayedCall(100, () => {
                crate.active = true;
            });
        });

        this.keyArray.forEach(element => {
            element.setName(key);
        });
        this.crateArray.forEach(element => {
            element.
                on("overlapstart", () => {
                    element.setTexture("crate_open");
                    element.hasCollide = true;
                    this.keyCount++;
                    AudioManager.Instance.PlaySFXOneShot(this.scene, "crate_enter");
                    if (this.AllKeyOpen()) {
                        this.levelPanel.ShowNext();
                    }
                }).
                on("overlapend", () => {
                    element.setTexture("crate");
                    element.hasCollide = false;
                    element.currentCollide = null;
                    this.keyCount--;
                    AudioManager.Instance.PlaySFXOneShot(this.scene, "crate_exit");
                    this.levelPanel.HideNext();
                });
        });
        this.scene.physics.add.overlap(this.keyArray, this.crateArray, (key, crate) => {
            var crateObject = (crate as CrateObject);
            if (crateObject.currentCollide != null) return;
            crateObject.currentCollide = (key as Phaser.GameObjects.Sprite);
        });
    }

    dir: Phaser.Math.Vector2;
    playerVectorPosition: Phaser.Math.Vector2;
    public IsMoveable(v: Phaser.Math.Vector2, isPlayer: boolean = true): boolean {
        var pos;
        if (isPlayer) {
            pos = this.areaArray[this.playerVectorPosition.x + v.y][this.playerVectorPosition.y + v.x];
            this.dir = v;
        }
        else {
            pos = this.areaArray[this.playerVectorPosition.x + (v.y * 2)][this.playerVectorPosition.y + (v.x * 2)];
        }
        if (pos != 1) {
            if (pos == 3) {
                if (isPlayer) {
                    var isMove = this.IsMoveable(v, false);
                    if (isMove) {
                        this.playerVectorPosition.x += v.y;
                        this.playerVectorPosition.y += v.x;

                        this.areaArray[this.playerVectorPosition.x][this.playerVectorPosition.y] = 0;
                        this.areaArray[this.playerVectorPosition.x + v.y][this.playerVectorPosition.y + v.x] = 3;
                    }
                    return isMove;
                }
                else {
                    return false;
                }
            }
            if (isPlayer) {
                this.playerVectorPosition.x += v.y;
                this.playerVectorPosition.y += v.x;
            }
            return true;
        }
        return false;
    }
}

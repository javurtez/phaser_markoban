export default class CrateObject extends Phaser.GameObjects.Sprite {
    public hasCollide: boolean = false;
    public currentCollide: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        this.currentCollide = null;    
        
        scene.add.existing(this);
    }
}

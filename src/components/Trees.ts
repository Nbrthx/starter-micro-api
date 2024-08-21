import { Game as Lobby } from "../scenes/Lobby";
import { Game as Hamemayu } from "../scenes/Hamemayu";

export class Trees{
    static collision(scene: Phaser.Scene & { collider: Phaser.Physics.Arcade.Body[] }, objects: Phaser.Types.Tilemaps.TiledObject[]){
        objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            let width: integer = obj.width as integer
            let height: integer = obj.height as integer
            scene.collider.push(scene.physics.add.body(x, y, width, height).setImmovable(true))
        })
    }

    static tree1(scene: Lobby | Hamemayu, objects: Phaser.Types.Tilemaps.TiledObject[]){
        objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            const tree = scene.physics.add.image(x, y, 'tree1').setOrigin(0.5, 0.8)
            tree.body.setSize(18, 12)
            tree.setImmovable(true)
            tree.setOffset(16, 52)
            scene.collider.push(tree)
        })
    }

    static tree2(scene: Lobby | Hamemayu, objects: Phaser.Types.Tilemaps.TiledObject[]){
        objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            const tree = scene.physics.add.image(x, y, 'tree2').setOrigin(0.5, 0.8)
            tree.setDepth(y)
            tree.body.setSize(24, 12)
            tree.setImmovable(true)
            tree.setOffset(12, 52)
            scene.collider.push(tree)
        })
    }

    static home1(scene: Lobby | Hamemayu, objects: Phaser.Types.Tilemaps.TiledObject[]){
        objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            const tree = scene.physics.add.image(x, y, 'home1').setOrigin(0.5, 0.8)
            tree.setDepth(y)
            tree.setImmovable(true)
            scene.collider.push(tree)
        })
    }
}
import { Game as Lobby } from "../scenes/Lobby";
import { Game as Hamemayu } from "../scenes/Hamemayu";
import { Game as Hutan } from "../scenes/Hutan";
import { Game as Kolam } from "../scenes/Kolam";
import { Game as Rumah } from "../scenes/Rumah";
import { Joystick } from "./Joystick";
import Plant from "../prefabs/Plant";
import { Player } from "../prefabs/Player";
import { Home } from "../prefabs/Home";


const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
const item = document.getElementById('item');
const itemAmount = document.getElementById('item-amount');
const changeBtn = document.getElementById('switch');

export class Controller{
    static movement(scene: Phaser.Scene & { player: Player, joystick: Joystick }){
        const cursors: any = scene.input.keyboard?.addKeys('W,A,S,D', false) as Phaser.Input.Keyboard.KeyboardManager;
        
        if (cursors.A.isDown) {
            scene.player.dir.x = -1
        } else if (cursors.D.isDown) {
            scene.player.dir.x = 1
        } else {
            scene.player.dir.x = scene.joystick.x
        }

        if (cursors.W.isDown) {
            scene.player.dir.y = -1
        } else if (cursors.S.isDown) {
            scene.player.dir.y = 1
        } else {
            scene.player.dir.y = scene.joystick.y
        }
    }

    static changeButton(scene: Lobby | Hamemayu | Hutan | Kolam | Rumah){
        const changeBtnEvent = () => {
            scene.inventory.changeItem()
            if(item) item.className = 'item-'+scene.inventory.currentName()
            if(itemAmount){
                if(scene.inventory.current == 0 || scene.inventory.current == 3) itemAmount.style.display = 'none'
                else itemAmount.style.display = 'block'
                itemAmount.innerHTML = scene.inventory.items[scene.inventory.current].amount+'x'
            }
        }

        changeBtn?.addEventListener('touchstart', changeBtnEvent, true)
        
        scene.attack?.addEventListener('touchstart', scene.attackEvent, true)
        const j = scene.input.keyboard?.addKey('J', false)
        const k = scene.input.keyboard?.addKey('K', false)
        if(j) j.on('down', () => scene.attackEvent())
        if(k) k.on('down', () => changeBtnEvent())
    }

    static basic(scene: Lobby | Hamemayu){
        scene.attack = document.getElementById('attack');

        if(joystick && stick) scene.joystick = new Joystick(joystick, stick);
        scene.attackEvent = () => {
            if(scene.player && scene.player.active && !scene.player.attacking && scene.inventory.current == 0){
                scene.player.attack()

                scene.socket.emit('attack', {
                    map: scene.map,
                    x: scene.player.x,
                    y: scene.player.y,
                    dir: scene.player.dir
                })
            }
        }

        this.changeButton(scene)
    }

    static hutan(scene: Hutan){
        scene.attack = document.getElementById('attack');

        if(joystick && stick) scene.joystick = new Joystick(joystick, stick);
        scene.attackEvent = () => {
            if(scene.player && scene.player.active && !scene.player.attacking){
                if(scene.inventory.current == 0){
                    scene.player.attack()

                    scene.socket.emit('attack', {
                        map: scene.map,
                        x: scene.player.x,
                        y: scene.player.y,
                        dir: scene.player.dir
                    })
                }
                else if(scene.inventory.current == 1){
                    scene.physics.overlap(scene.player, scene.plants, (e, f) => {
                        if(f instanceof Plant && !f.planted){
                            if(scene.inventory.removeItem('pohon', 1)) f.plant(scene.player)
                            if(itemAmount) itemAmount.innerHTML = scene.inventory.items[scene.inventory.current].amount+'x'
                        }
                    })
                }
                else if(scene.inventory.current == 2){
                    scene.physics.overlap(scene.player, scene.plants, (e, f) => {
                        if(f instanceof Plant && !f.complete && f.planted){
                            if(scene.inventory.removeItem('ember', 1) && f.grow(scene.player)) scene.addCounter()
                            if(itemAmount) itemAmount.innerHTML = scene.inventory.items[scene.inventory.current].amount+'x'
                            console.log(scene.counter)
                        }
                    })
                }
            }
        }

        this.changeButton(scene)
    }

    static kolam(scene: Kolam){
        scene.attack = document.getElementById('attack');

        if(joystick && stick) scene.joystick = new Joystick(joystick, stick);
        scene.attackEvent = () => {
            if(scene.player && scene.player.active && !scene.player.attacking){
                if(scene.inventory.current == 0){
                    scene.player.attack()

                    scene.socket.emit('attack', {
                        map: scene.map,
                        x: scene.player.x,
                        y: scene.player.y,
                        dir: scene.player.dir
                    })
                }
                else if(scene.inventory.current == 3){
                    const x = scene.player.x
                    const y = scene.player.y
                    if(scene.embung.hasTileAtWorldXY(x-8, y)){
                        scene.embung.removeTileAtWorldXY(x-8, y)
                        scene.addCounter()
                    }
                    if(scene.embung.hasTileAtWorldXY(x+8, y)){
                        scene.embung.removeTileAtWorldXY(x+8, y)
                        scene.addCounter()
                    }
                }
            }
        }

        this.changeButton(scene)
    }

    static rumah(scene: Rumah){
        scene.attack = document.getElementById('attack');

        if(joystick && stick) scene.joystick = new Joystick(joystick, stick);
        scene.attackEvent = () => {
            if(scene.player && scene.player.active && !scene.player.attacking){
                if(scene.inventory.current == 0){
                    scene.player.attack()

                    scene.socket.emit('attack', {
                        map: scene.map,
                        x: scene.player.x,
                        y: scene.player.y,
                        dir: scene.player.dir
                    })
                }
                else if(scene.inventory.current == 4){
                    scene.physics.overlap(scene.player, scene.homes, (e, f) => {
                        if(f instanceof Home && !f.complete){
                            if(scene.inventory.removeItem('kayu', 1) && f.fix(scene.player)) scene.addCounter()
                            if(itemAmount) itemAmount.innerHTML = scene.inventory.items[scene.inventory.current].amount+'x'
                            console.log(scene.counter)
                        }
                    })
                }
            }
        }

        this.changeButton(scene)
    }
}
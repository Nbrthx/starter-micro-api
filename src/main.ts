import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

const width = screen.width>screen.height?screen.width/screen.height:screen.height/screen.width

const config: Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: width*720,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#444648',
    fps: {
        target: 60
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: !0
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

export default new Game(config);

const reqfull = document.getElementById('request-fullscreen')
document.getElementById('app')?.addEventListener("fullscreenchange", () => {
    if(reqfull && document.fullscreenElement){
        reqfull.style.display = "none"
    }
    else{
        reqfull?reqfull.style.display = "block" : null
    }
})

declare global {
    interface Navigator {
        virtualKeyboard: any;
    }
}

if('virtualKeyboard' in navigator)
navigator.virtualKeyboard.overlaysContent = true
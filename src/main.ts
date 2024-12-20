import { Boot } from './scenes/_Boot';
import { GameOver } from './scenes/_GameOver';
import { MainMenu } from './scenes/_MainMenu';
import { Preloader } from './scenes/_Preloader';

import { Credit } from './scenes/Credit';

import { Game as Lobby } from './scenes/Lobby';
import { Game as Hamemayu } from './scenes/Hamemayu';
import { Game as Hutan } from './scenes/Hutan';
import { Game as Eling } from './scenes/Eling';
import { Game as Kolam } from './scenes/Kolam';
import { Game as Rukun } from './scenes/Rukun';
import { Game as Rumah } from './scenes/Rumah';
import { Game as Tutorial } from './scenes/Tutorial';

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
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Lobby,
        Hamemayu,
        Hutan,
        Eling,
        Kolam,
        Rukun,
        Rumah,
        Tutorial,
        GameOver,
        Credit
    ]
};

export default new Game(config);

const reqfull = document.getElementById('request-fullscreen')
const app = document.getElementById('app')
if(reqfull){
    reqfull.style.display = "block"
    reqfull.addEventListener('click', () => {
        if (app && app.requestFullscreen) {
            app.requestFullscreen();
        } else if ((app as any).webkitRequestFullscreen) { /* Safari */
            (app as any).webkitRequestFullscreen();
        }
        else {
            alert("Browser tidak mendukung fullscreen")
            reqfull.style.display = "none"
        }
    })
}

app?.addEventListener("fullscreenchange", () => {
    if(reqfull && (document.fullscreenElement)){
        reqfull.style.display = "none"
    }
    else{
        if(reqfull) reqfull.style.display = "block"
    }
})

declare global {
    interface Navigator {
        virtualKeyboard: any;
    }
}

if('virtualKeyboard' in navigator)
navigator.virtualKeyboard.overlaysContent = true
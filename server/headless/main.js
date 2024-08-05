const { JSDOM } = require("jsdom");
const ioc = require('socket.io-client')

const dom = new JSDOM("", {
    
    runScripts: "dangerously",
    pretendToBeVisual: true,
    resources: "usable",
});

HTMLVideoElement = dom.window.HTMLVideoElement;
HTMLCanvasElement = require("canvas").Canvas;
XMLHttpRequest = dom.window.XMLHttpRequest;
Element = dom.window.Element;
Image = dom.window.Image;
navigator = dom.window.navigator;
window = dom.window;
window.focus = () => {}
document = dom.window.document;

require("phaser");

const coor = (x, xx = 1) => x*16+xx;

class Lobby extends Phaser.Scene {
    constructor () {
        super('Lobby');
    }
    create(){
        console.log('it works', require('../index'))
        const socket = ioc('http://localhost:3000', { transports: ['websocket'] })

        // MAP
        const map = this.make.tilemap({ key: 'map' });
        const tileset= map.addTilesetImage('overworld', 'tileset');
        this.layer1 = map.createLayer('background', tileset, 0, 0);
        this.layer2 = map.createLayer('wall', tileset, 0, 0).setCollisionByExclusion([-1]);
        this.layer3 = map.getObjectLayer('wall2');

        const collider = []
        collider.push(this.layer2)

        // Others
        this.players = this.add.group()

        socket.on('new-player', () => {
            const player = this.physics.add.body(0, 0, 100, 100)
            player.setImmovable(true)
            this.others.add(player)
        })

        // Custom Collision
        this.layer3.objects.forEach((obj) => {
            collider.push(this.physics.add.body(x, y, width, height).setImmovable(true))
        })
    }
}

new Phaser.Game({
    type: Phaser.HEADLESS,
    customEnvironment: true,
    loader: {
        imageLoadType: Phaser.Loader.GetURL
    },
    width: 1280,
    height: 720,
    physics: {
        default: "arcade",
    },
    scene: [Lobby],
});
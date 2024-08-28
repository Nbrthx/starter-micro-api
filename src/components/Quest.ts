import { Inventory } from "./Inventory";
import { Stats } from "./Stats";

export class Quest {

  quests: string[][];
  opened: boolean = false;

  constructor() {
    this.quests = [[
        `<h2>"Memayu Hayuning Bawana"</h2>`,
        'Selamat datang di wilayah Giri Amerta, Kulo Raden Pramudana penjaga wilayah ini',
        'Wilayah ini menghadapi permasalahan tanah longsor akibat perubahan iklim',
        'Curah hujan yang tinggi dan dipicu oleh maraknya aksi penebangan pohon di hutan mengakibatkan semakin tingginya kerentanan wilayah ini terhadap bencana longsor akibat perubahan iklim',
        'Kita harus senantiasa menjaga dan melestarikan alam semesta ini agar terhindar dari bencana',
        'Maka terapkanlah pitutur luhur Hamemayu Hayuning Bawana',
        'Lakukanlah aksi konservasi dengan menanam dan merawat pohon',
        'Berhati-hatilah dengan serangan musuh penebang pohon liar',
        'Kamu akan mendapatkan reward: <br />pohon 12x / 18x / 24x<br />ember 60x / 90x / 120x<br /><br />XP 1x / 2x / 3x<br /><br /> atas kerja kerasmu menerapkan pitutur luhur ini',
      ],

      [
        `<h2>"Eling Lan Waspodo"</h2>`,
        'Selamat datang di wilayah Banyu Watu, Kulo Mbah Surakso penjaga wilayah ini',
        'Wilayah ini menghadapi permasalahan bencana kekeringan akibat perubahan iklim',
        'Peningkatan suhu bumi dan dipicu oleh maraknya aksi eksploitasi air tanah mengakibatkan bencana kekeringan di wilayah ini',
        'Kita harus senantiasa siap siaga dan waspada dalam menghadapi kekeringan akibat perubahan iklim',
        'Maka terapkanlah pitutur luhur Eling Lan Waspodo',
        'Lakukanlah aksi konservasi dengan membangun telaga sebagai penangkap dan penampung air hujan',
        'Dan berhati-hatilah dengan serangan musuh pengeksploitasi air tanah',
        'Kamu akan mendapatkan reward: <br />kayu 2x / 4x / 6x<br />XP 2x / 4x / 6x<br /><br /> atas kerja kerasmu menerapkan pitutur luhur ini',
      ],
      
      [
        `<h2>"Rukun Agawe Santosa"</h2>`,
        'Selamat datang di wilayah Wantirta, Kulo Ki Ageng Panjer penjaga wilayah ini',
        'Wilayah ini baru saja dilanda banjir bandang akibat dampak perubahan iklim',
        'Banyak rumah yang hancur dan aksi penimbun bahan bangunan dan logistik dimana-mana',
        'Bangunlah kembali rumah-rumah di desa ini bersama seluruh pemain lainnya dengan semangat gotong royong',
        'Terapkanlah pitutur luhur Rukun Agawe Santosa',
        'Berhati-hatilah dengan serangan musuh penimbun bahan bangunan dan logistik',
        'Kamu akan mendapatkan reward: <br />XP 2x<br /><br /> atas kerja kerasmu menerapkan pitutur luhur ini',
      ]
    ]
  }

  requestQuest(index: number, inventory: Inventory, stats: Stats, questGoEvent: EventListener, questCancelEvent: EventListener){
    if(!this.quests[index] && this.opened) return

    this.opened = true

    const questBox = document.getElementById('quest-box')
    const level = stats.getLevel()
    const needItem = index == 0 ? inventory.items[1].amount >= 12 && inventory.items[2].amount >= 60 : true

    let count = 1
    let count2 = 0
    if(questBox) questBox.innerHTML = this.quests[index][0]

    const nextListener = (e: Event) => {
      count++
      if(count < this.quests[index].length-1){
        count2 = 0
        if(questBox) questBox.innerHTML = this.quests[index][0]
        tick();
        (e.target as HTMLButtonElement).removeEventListener('click', nextListener)
      }
      else{
        const easy = needItem ? '<button id="go" value="easy">Beginer</button>' : '<button id="go" disabled value="easy">Beginer</button>'
        const normal = level >= 3 && needItem ? '<button id="go2" value="normal">Intermediate</button>' : '<button id="go2" disabled value="normal">Intermediate (butuh lvl.3)</button>'
        const hard = level >= 5 && needItem ? '<button id="go3" value="hard">Advanced</button>' : '<button id="go3" disabled value="hard">Advanced (butuh lvl.5)</button>'
        const misi = index == 2 ? '<button id="go">Ayo</button>' : easy+normal+hard
        const cancel = '<button id="cancel">Nggak Dulu</button>'
        if(questBox) questBox.innerHTML = this.quests[index][0]+this.quests[index][this.quests[index].length-1]+misi+cancel

        const questGo = document.getElementById("go") as HTMLButtonElement;
        const questGo2 = document.getElementById("go2") as HTMLButtonElement;
        const questGo3 = document.getElementById("go3") as HTMLButtonElement;
        const questCancel = document.getElementById("cancel");

        questGo.addEventListener("click", questGoEvent, true);
        if(questGo2) questGo2.addEventListener("click", questGoEvent, true);
        if(questGo3) questGo3.addEventListener("click", questGoEvent, true);
        questCancel?.addEventListener("click", questCancelEvent, true);
      }
    }

    const tick = () => {
      if(questBox) questBox.innerHTML += this.quests[index][count][count2]
      count2++
      if(count2 < this.quests[index][count].length){
        if(this.quests[index][count][count2-1] == ',') setTimeout(tick, 500)
        else setTimeout(tick, 40)
      }
      else{
        if(questBox) questBox.innerHTML += '<br /><button id="next">Next</button>'
        const next = document.getElementById('next')

        next?.addEventListener('click', nextListener)
      }
    }

    if(needItem){
      tick()
    }
    else{
      const cancel = '<button id="cancel">Okee</button>'
      if(questBox) questBox.innerHTML += 'Butuh item:<br /> pohon 12x<br />ember 60x<br />untuk melaksanakan misi ini<br />'+cancel

      const questCancel = document.getElementById("cancel") as HTMLButtonElement;
      questCancel.addEventListener("click", questCancelEvent, true);
    }
  }

  removeListenerQuest(){
    const questBox = document.getElementById('quest-box')
    if(questBox) questBox.style.display = 'none'
    this.opened = false
  }
}

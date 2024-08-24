import { Inventory } from "./Inventory";
import { Stats } from "./Stats";

export class Quest {

  quests: string[];

  constructor() {
    this.quests = [
      `<h2>"Memayu Hayuning Bawana"</h2>
      <p>
          Kamu diperintahkan untuk memperindah indahnya bumi. <br/>
          Salah satu cara untuk memperindah bumi, yaitu dengan merawat apa yang sudah indah di bumi. <br />
          Contoh sederhananya adalah merawat pohon. <br/>
          Tidak jarang manusia malah menebangnya secara liar tanpa memperhitungkan kerugianya. <br/>
          Karena itu misi kamu saat ini adalah menanam kembali pohon ditempat yang gersang. <br />
      </p>`,

      `<h2>"Eling lan Waspodo"</h2>
      <p>
          Perubahan iklim menjadi salah satu ancaman bagi kita semua. <br/>
          Kita perlu ingat bahwa perubahan iklim dapat mengakibatkan kekeringan. <br />
          Untuk mencegah dampak buruk dari kekeringan, kita perlu menyiapkan cadangan air. <br/>
          Karena itu misi kamu saat ini adalah membangun embung. <br />
      </p>`,
      
      `<h2>"Rukun Agawe Santoso"</h2>
      <p>
          Hidup diunia ini tidak sendirian. <br/>
          Kita hidup bersama banyak manusia lain. <br />
          Disaat ada tetangga kita sedang kena musibah, sebagain manusia baik kita harus membantu. <br/>
          Contohnya saat bencana banjir. <br/>
          Karena itu misi kamu saat ini adalah membangun kembali rumah warga yang roboh bersama-sama. <br />
      </p>`
    ]
  }

  completeQuest(index: number){
    if(!this.quests[index]) ReadableStreamDefaultController
  }

  requestQuest(index: number, inventory: Inventory, stats: Stats){
    if(!this.quests[index]) return

    const questBox = document.getElementById('quest-box')
    const level = stats.getLevel()

    const needItem = index == 0 ? inventory.items[1].amount >= 12 && inventory.items[2].amount >= 60 : true

    if(questBox){
      const easy = needItem ? '<button id="go" value="easy">Mudah</button>' : '<button id="go" disabled value="easy">Mudah</button>'
      const normal = level >= 3 && needItem ? '<button id="go2" value="normal">Normal</button>' : '<button id="go2" disabled value="normal">Normal (lvl.3)</button>'
      const hard = level >= 5 && needItem ? '<button id="go3" value="hard">Syulit</button>' : '<button id="go3" disabled value="hard">Syulit (lvl.5)</button>'
      const misi = index == 2 ? '<button id="go">Ayo</button>' : easy+normal+hard
      const cancel = '<button id="cancel">Nggak Dulu</button>'
      questBox.innerHTML = this.quests[index]+misi+cancel
    }
  }
}

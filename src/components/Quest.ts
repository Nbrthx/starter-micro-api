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
      
      `<h2>"Gotong Royong Agawe Santoso"</h2>
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

  requestQuest(index: number){
    if(!this.quests[index]) return

    const questBox = document.getElementById('quest-box')

    if(questBox){
      const completed = '<button id="go">Ayo</button><button id="cancel">Nggak Dulu</button>'
      questBox.innerHTML = this.quests[index]+completed
    }
  }
}

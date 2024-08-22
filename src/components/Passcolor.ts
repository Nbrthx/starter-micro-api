function getPasscolor(text256: string) {
    var c = document.createElement("canvas")
    c.width = 4
    c.height = 4
    var ctx = c.getContext("2d") as CanvasRenderingContext2D
  
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (i * 4 + j < 10) {
          ctx.fillStyle = "#" + text256.substr((i * 4 + j) * 6, 6)
          ctx.fillRect(j, i, 1, 1)
        } else {
          ctx.fillStyle = "#" + text256.substr(60 + j, 1).repeat(6)
          ctx.fillRect(j, i, 1, 1)
        }
      }
    }
  
    return c
  }
  
  function readPasscolor(data: Blob, result: (text: string) => void) {
    var c = document.createElement("canvas")
    c.width = 4
    c.height = 4
    var ctx = c.getContext("2d") as CanvasRenderingContext2D
  
    var reader = new FileReader();
    reader.readAsDataURL(data);
  
    var text = ""
  
    reader.onload = e => {
      var img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        var colordata = ctx.getImageData(0, 0, 4, 4).data
        for(var i = 0; i < 40; i++)
          if((i+1)%4!=0)
          text += colordata[i].toString(16).length == 2?
          colordata[i].toString(16) : "0"+colordata[i].toString(16)
        for(var i = 48; i < 64; i+=4)
          text += colordata[i].toString(16)[0]
        result(text)
      }
    }
  }
  
  function downloadImg(canv: HTMLCanvasElement) {
    var anchor = document.createElement("a");
    anchor.download = "passcolor";
    anchor.href = canv.toDataURL("image/png");
    anchor.click()
  }
  
  export { getPasscolor, readPasscolor, downloadImg }
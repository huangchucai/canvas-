var f1 = null;
function appendFile(path) {
  var img = new Image();
  img.src = path; // 传过来的图片路径在这里用。 
  img.onload = function () {
    var that = this; //生成比例 
    var w = that.width, h = that.height, scale = w / h;
    w = 480 || w; //480 你想压缩到多大，改这里 
    h = w / scale;
    //生成canvas 
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(that, 0, 0, w, h);
    var base64 = canvas.toDataURL('image/jpeg', 1 || 0.8); //1最清晰，越低越模糊。有一点不清楚这里明明设置的是jpeg。弹出 base64 开头的一段 data：image/png;却是png // 
    alert(base64);
    f1 = base64; // 把base64数据丢过去，上传要用。 
    var pic = document.getElementById("x");
    pic.src = base64; //这里丢到img 的 src 里面就能看到效果了 
  }
}

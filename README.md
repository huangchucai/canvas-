# 图片的上传和压缩

**前言：** 楼主之前一直对图片上传感到很好奇，我们怎么得到上传的文件呢？然后怎么显示给用户呢？怎么上传给服务器呢？

## 1.input的file类型

```html
<input type='file' multiple>
```



HTML5新增了的input 为file的输入框，可以上传文件，并且把文件放到计算机缓存中，方便我们之后的获取和使用。我们可以通过监听上传图片后触发的`change`事件，来获取对应的`value`和`files`

#### value(string)

一般的类型的输入框我们都会先研究它的`value`的值, `type=file`的value有点不一样，由于没有输入内容，只是上传文件，所以可以联想到可能和文件名有关系。

```javascript
//<input type='file' multiple id='ipt'> 
如果是单个文件的话，ipt.value = C:\fakepath\文件名
如果是多个文件的话，ipt.value = C:\fakepath\文件名(文件的第一个)

//eg：我们上传的图片的文件名为1.jpg
=>  ipt.value = 'C:\fakepath\1.jpg'
```

#### files属性(object)

对于`type= file`的输入框有一个非常重要的属性`files`用来存放上传文件的基本信息。它是一个对象，包含每一个文件和文件的长度(`length`)。

每个 File 对象包含了下列信息: 

* name:  文件名
* lastModified：UNIX timestamp 形式的最后修改时间.
* lastModifiedDate： `Date`形式你的最后修改时间
* size:  文件的字节大小
* type:  DOMString文件的MIME类型（媒体类型，**常用的文件拓展名**）

```html
<input type="file" id="ipt" name='pic' multiple>

<script>
	ipt.addEventListener('change', function() {
      console.log(this.value);
      console.log(this.files) // {0: File, length: 1}
	},false)
</script>
```

---

## 2.FileReader()

`FileReader()`对象用于异步获取计算器的缓存区的存放数据，通过制定`file` 或`blob`**对象**来指定获取文件或数据。

### readAsDataURL(file)

实例化的后的`reader`的`readAsDataURL`方法表示开始读取制定的文件，由于读取文件是异步的，所以当读取文件完成的时候，`readyState`会变成2，如果绑定了onloadend事件处理程序,则调用之。

```html
<input type="file" id="fileElem" multiple accept="image/*">
   
<script>
  let read = new FileReader();
  fileElem.addEventListener('change', function(e){
    let file = this.files[0];
    read.readAsDataURL(file);
    // 没有完成前是不会执行的
    if(read.readyState === 2) {
      console.log('done')
    }
    console.log(read.readyState) // 1 
    read.onloadend = function(cacheFile) {
      console.log(read.readyState) // 2
      console.log(cacheFile) // 得到了数据，可以显示图片和其他基本信息 cacheFile.target.result
      console.log('已经完成')
    }
  },false)
</script>
```

**总结：** 但是我们一般在使用的时候都是使用 `onload`来处理当异步请求完成后的一系列的操作

```javascript
// 一般习惯
read.onload = function(cacheFile) {
  // 放置图片
  //   var pic = document.getElementById("img");
  //   pic.src = this.result;
}
```

---

## 3.URL.createObjectURL

`window.URL.createObjectURL`和`window.revokeObjectURL()`是正在试验的api，但是楼主试过，不兼容老系统，现在是可以用的。

```javascript
objectURL = window.URL.createObjectURL(blob);
// blob 是用来创建 URL 的 File 对象或者 Blob 对象
// objectURL 得到一个生产的图片地址
```

```html
  <input type="file" id="fileElem" multiple accept="image/*">
  <img src="" alt="" id="img">

  <script>
    let img = document.querySelector('#img')
    let read = new FileReader();
    fileElem.addEventListener('change', function(e){
      let file = this.files[0];
      console.log(window.URL.createObjectURL(file))	
      // 类似blob:http://192.168.57.1:8000/ab842bfb-5543-441f-8c2c-148a52e72cf9
      img.src = window.URL.createObjectURL(file);
      // 当图片加载完成后，清除内部缓存
      img.onload = function() {
        window.URL.revokeObjectURL(this.src)
      }
    },false)
  </script>
```

**总结：** 我们使用`createObjectURL`比使用`FileReader`简单很多，同样都是传递一个file对象或者blob对象。`createObjectURL`直接返回的是图片的地址。

---

## 4. canvas压缩

有些时候，再上传图片的时候，可以通过后端来压缩图片然后上传给服务器，也可以通过前端压缩好后，提交给后台，然后再给服务器。这里讲的是前端通过`canvas`压缩，然后在提交给后端。`canvas`提供2个转换图片的方法：

1. `canvas.toDataURL(mimeType)`

   ```javascript
   canvas.toDataURL(mimeType, qualityArgument)
   //   mimeType表示canvas导出来的base64图片的类型，默认是png格式，也即是默认值是'image/png'，我们也可以指定为jpg格式'image/jpeg'或者webp等格式。file对象中的file.type就是文件的mimeType类型，在转换时候正好可以直接拿来用（如果有file对象）。
   ```

2. canvas.toBlob() 

    `toBlob()`方法是异步的，因此多了个`callback`参数，这个`callback`回调方法默认的第一个参数就是转换好的`blob`文件信息

   ```javascript
   canvas.toBlob(callback, mimeType)
   // 可以把canvas转换成Blob文件，通常用在文件上传中，因为是二进制的，对后端更加友好。
   // canvas转为blob并上传
   canvas.toBlob(function(blob) {
     // 图片ajax上传
     var xhr = new XMLHttpRequest();
     // 开始上传
     xhr.open("POST", 'upload.php', true);
     xhr.send(blob);
   })
   ```

#### canvas压缩的原理

1. 创建`canvas`标签，通过获得图片的`width`和`height来渲染canvas的宽高`
2. 清除之前的画布，以免之前的重新渲染
3. 通过`canvas.getContext('2d')`的drawImage()进行压缩
4. `canvas.toBlob()`传递给后台或者`canvas.toDataURL()`返回base64再传递给后台

**例子：**

```javascript
// canvas.toDataURL()方法
function getBase64Image(img) {
  let canvas = document.createElement('canvas');
  // 画布宽高度
  canvas.width = img.width;
  canvas.height = img.height;
  let cxt = canvas.getContext('2d');
  // 填充内容
  cxt.drawImage(img, 0, 0, img.width, img.height);
  // 后缀名
  let ext = img.src.substring(img.src.lastIndexOf('.')+1).toLowerCase();
  let dataURL = canvas.toDateURL("image/"+ ext);
  return dataURL
}
img.onload = function () {
  let data = getBase64Image(img);
  // data上传给后台
}

// canvas.toBlob()
img.onload = function () {
  let canvas = document.createElement('canvas');
  canvas.width = this.width;
  canvas.height = this.height;
  let cxt = canvas.getContext('2d');
  // 清除画布
  context.clearRect(0, 0, targetWidth, targetHeight);
  // 图片压缩
  cxt.drawImage(this, 0, 0, this.width, this.height);
  // canvas转为blob并上传
  canvas.toBlob(function (blob) {
        // 图片ajax上传
        var xhr = new XMLHttpRequest();
        // 文件上传成功
        xhr.onreadystatechange = function() {
            if (xhr.status == 200) {
                // xhr.responseText就是返回的数据
            }
        };
        // 开始上传
        xhr.open("POST", 'upload.php', true);
        xhr.send(blob);    
  }, file.type || 'image/png');
}
```

---

## 5. 总结和全部例子

#### 图片本地浏览用到的知识

1.  `<input type='file' multiple id= "ipt">` 上传文件  
2.  `ipt.files`获取上传的文件对象获取对应的`file`信息
3.  通过`window.URL.createObjectURL(file)` 或者 `FileReader()`构造函数的实例的`readAsDataURL(file)`异步获取数据
4.  把获得图片地址赋值给`img`标签

#### 图片前端压缩

1. 在图片加载完成后创建`canvas`标签 ，设置它的宽高等于图片的宽高

2. 调用`canvas`的`getContext('2d')`方法获取画布(cxt)

3. 通过`cxt.drawImage(img, 0, 0, img.width, img.height)`填充画布(压缩图片)

4. 通过canvas.toDataURL('image.'+ 文件名)获取base64的压缩图片上传。

   或者通过`canvas.toBlob(function(blob){ ......上传代码  }, file.type || 'image/png')`

   ​

### 参考文献

[张鑫旭老师的图片压缩和上传](http://www.zhangxinxu.com/wordpress/2017/07/html5-canvas-image-compress-upload/)

[用 Canvas 技术压缩要上传的图片](https://juejin.im/entry/560a726960b2ad8a22a538fc)


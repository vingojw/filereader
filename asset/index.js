var Vue = require('vue');

new Vue({
    el: 'body',
    data: {
        items: [],
        offset: 0,
        imgdata: '',
        buf: []
    },
    filters: {
        ascii: function (buf) {
            var t;

            t = String.fromCharCode.apply(String, buf.map(function (a) {
                return parseInt(a, 16)
            }));
            //要保留的字符写在正则里
            t = t.replace(/[^ A-Za-z0-9!@#$%^&*\(\)\-_=+\[\]\{\}\|\\;:'"<>?,./`~]/g, '.');
            //HTML字符转义
            t = t.replace(/</g, '<');
            return t;
        }
    },
    methods: {
        imgChange: function () {
            var _this = this;
            var els = this.$els;
            var file = els.choose.files[0];
            var fr = new FileReader();
            _this.items = [];
            fr.onload = function (file) {
                _this.render(new Uint8Array(this.result));
            }
            fr.readAsArrayBuffer(file) //得到一个数组 file.currentTarget.result 拿到的是 ArrayBuffer  但是 要显示 ArrayBuffer 还需要 一个辅助类 ArrayBufferView   https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView

            //用来显示图片
            var frimg = new FileReader();
            frimg.onload = function (file) {
                _this.imgdata = this.result;
            }
            frimg.readAsDataURL(file);

        },
        render: function (d) {
            var _this = this;
            (function set() {
                _this.buf = d.slice(_this.offset, _this.offset += 16);
                if (!_this.buf.length) {
                    return;
                };
                var _s = [];
                _this.buf.forEach(function (a) {
                    _s.push(('0' + a.toString(16)).slice(-2).toUpperCase());
                });
                _this.items.push(_s);
                setTimeout(set, 10);
            })();
        }
    },
    ready:function(){
        var _this = this;
        var gif= 'http://localhost:8080/asset/333.gif';
        pixel.parse(gif).then(function(images){

          console.log(images); 
          for (var i = 0; i < images.length; i++) {
            var cvs = document.createElement('canvas');
            var ctx=cvs.getContext("2d");
            var w = images[i].width;
            var h = images[i].height;
            var d = images[i];
            cvs.width = w;
            cvs.height = h;
            //ctx.drawImage(d,w,h);  
            var imgData = ctx.createImageData(w,h);
            for (var j=0;j<d.data.length;j+=4){
                imgData.data[j+0]=d.data[j+0];
                imgData.data[j+1]=d.data[j+1];
                imgData.data[j+2]=d.data[j+2];
                imgData.data[j+3]=d.data[j+3];
            }
            //ctx.putImageData(d,w,h);
            /*
                putImageData  有7个参数 
                第一个 是 imageData
                2、3分别是 图像的坐标
                4、5要画到画布的坐标
                6、7则是画的宽度
             */
            ctx.putImageData(d,0,0,0,0,w,h); 
            _this.$els.canvas.appendChild(cvs);
          };
          //console.log(images.loopCount); // 0(Infinite)
          //console.log(images[0]);
        });
    }
});


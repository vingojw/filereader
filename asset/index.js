var Vue = require('vue');

new Vue({
    el: 'body',
    data: {
        items: [],
        w:0,//一般gif大小是一样的
        h:0,
        offset: 0,
        imgurl:'',    //文本框url
        imgresult: '',//用来显示图片
        imageDatas:[],//用来存放每一帧的数据
        buf: []       //用来在显示
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
        blurFn:function(){
            //可能存在跨域
            // if(this.imgurl.match(/^https?:\/\//)){
            //     this.stepbystep(this.imgurl);
            //     return;
            // }
            // console.log('bad url');
        },
        imgChange: function () {
            var _this = this;
            var els = this.$els;
            var file = els.choose.files[0];
            _this.go(file);
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
        },
        play:function(){
            var _this = this;
            var stageD = this.$els.stage;
            var ct=stageD.getContext("2d");
            var i = 0,len = _this.imageDatas.length;

            stageD.width = _this.w;
            stageD.height = _this.h;
            (function draw(){
                if(i++ == len-1){
                    i = 0;
                };
                setTimeout(function(){
                    ct.putImageData.apply(ct,_this.imageDatas[i].args);
                    //清空
                    //ctx.clearRect(0,0,1000,1000);
                    draw();
                },_this.imageDatas[i].delay);
            })();
        },
        go:function(file){
            var _this = this;
            var fr = new FileReader();
            _this.items = [];
            fr.onload = function (file) {
                _this.render(new Uint8Array(this.result));
            }
            fr.readAsArrayBuffer(file) //得到一个数组 file.currentTarget.result 拿到的是 ArrayBuffer  但是 要显示 ArrayBuffer 还需要 一个辅助类 ArrayBufferView   https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView

            //用来显示图片
            var frimg = new FileReader();
            frimg.onload = function (file) {
                _this.imgresult = this.result;
                _this.stepbystep(this.result);
            }
            frimg.readAsDataURL(file);
        },
        stepbystep:function(gif){
            var _this = this;
            //支持 路径 文件 二进制
            pixel.parse(gif).then(function(images){

              //console.log(images);
              // gif图片每一帧大小一样
              _this.w = images[0].width;
              _this.h = images[0].height;
              for (var i = 0; i < images.length; i++) {
                var cvs = document.createElement('canvas');
                var ctx=cvs.getContext("2d");
                var imgI = images[i];
                var w = imgI.width;
                var h = imgI.height;
                var d = imgI;
                cvs.width = w;
                cvs.height = h;
                // var imgData = ctx.createImageData(w,h);
                // for (var j=0;j<d.data.length;j+=4){
                //     imgData.data[j+0]=d.data[j+0];
                //     imgData.data[j+1]=d.data[j+1];
                //     imgData.data[j+2]=d.data[j+2];
                //     imgData.data[j+3]=d.data[j+3];
                // }

                //http://www.w3school.com.cn/tags/canvas_putimagedata.asp
                /*
                    imgData 规定要放回画布的 ImageData 对象。
                    x   ImageData 对象左上角的 x 坐标，以像素计。               -- 也就是从图像的那里开始
                    y   ImageData 对象左上角的 y 坐标，以像素计。
                    dirtyX  可选。水平值（x），以像素计，在画布上放置图像的位置。   -- 从画布的那里开始
                    dirtyY  可选。水平值（y），以像素计，在画布上放置图像的位置。
                    dirtyWidth  可选。在画布上绘制图像所使用的宽度。             -- 画多大范围
                    dirtyHeight 可选。在画布上绘制图像所使用的高度。
                 */
                ctx.putImageData(d,0,0,0,0,w,h);
                _this.imageDatas.push({args:[d,0,0,0,0,w,h],delay:imgI.delay});
                var _div = document.createElement('div');
                var _span = document.createElement('span');
                _span.innerText = imgI.delay+"ms";
                _div.appendChild(_span);
                _div.appendChild(cvs);
                _this.$els.canvas.appendChild(_div);
              };
              //console.log(images.loopCount); // 0(Infinite)
              //console.log(images[0]);
              _this.play();
            });
        }
    },
    ready:function(){
        //文件拖拽
        var _this = this;
        var filedrag = _this.$els.filedrag;

        // file drag hover
        function FileDragHover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.target.className = (e.type == "dragover" ? "hover" : "");
        }
        // file selection
        function FileSelectHandler(e) {
            // cancel event and hover styling
            FileDragHover(e);
            // fetch FileList object
            var files = e.target.files || e.dataTransfer.files;
            _this.go(files[0]);
        }
        filedrag.addEventListener("dragover", FileDragHover, false);   //拖进
        filedrag.addEventListener("dragleave", FileDragHover, false);  //拖出
        filedrag.addEventListener("drop", FileSelectHandler, false);   //放下
    }
});

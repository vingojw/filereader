var pixelGif = require('pixel-gif');
var file= './asset/222.gif';

pixelGif.parse(file).then(function(images){
  var i= 0;

  console.log(images.loopCount); // 0(Infinite)

  var nextImage= function(){
    var imageData= images[i++];
    if(imageData==null) return;

    console.log(imageData.delay);
    nextImage();
  }

  nextImage();
});
console.log(pixelGif);
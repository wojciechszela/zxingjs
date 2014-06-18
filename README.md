zxingjs
=======

JavaScript port of popular [zxing](https://github.com/zxing/zxing) library. Work in progress. Plan:

1. Reading popular barcodes (DONE)
2. Reading QR codes (in progress)
3. Documentation, examples and tests for points
4. Reading RSS
5. Reading Data Matrix
6. Generating barcodes
7. Generating QR codes
8. Generating RSS codes
9. Generating Data Matrix codes
10. More documentation, examples and tests
11. Clean-up and optimizations (mostly speed, as well refactoring code to be a bit more JS friendly, supporting more environments)

Dependencies:
* [requirejs](http://requirejs.org/)
* [mout](https://github.com/mout/mout)
* [dejavu](http://indigounited.com/dejavu/)
* [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
 
Quick and dirty example

```javascript
require([
    'zxing/oned/MultiFormatOneDReader',
    'zxing/BinaryBitmap',
    'zxing/RGBLuminanceSource',
    'zxing/common/GlobalHistogramBinarizer'
], function (MultiFormatOneDReader, BinaryBitmap, RGBLuminanceSource, GlobalHistogramBinarizer) {
    try {
        var canvas = document.getElementById('canvas');
        var image  = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

        var reader = new MultiFormatOneDReader();
        var bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(new RGBLuminanceSource(canvas.width, canvas.height, image.data)));
        var result = reader.decode(bitmap, {});
    } catch (e) {
    }
});
```

For more details please wait for documentation and examples, or refer to source code and original [zxing](https://github.com/zxing/zxing) library. This JavaScript port tries to stay as close to original as possible.

var plotly = require('plotly')("fletcherist", "4UDtnIH9B8jcfRyyvGF9")

const { presets } = require('./index')


var data = [{x:presets.gaussian.x, y:presets.gaussian.y, type: 'bar'}];
var layout = {fileopt : "overwrite", filename : "simple-node-example"};

plotly.plot(data, layout, function (err, msg) {
  if (err) return console.log(err);
  console.log(msg);
});
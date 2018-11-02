
var WIDTH = 800;
var HEIGHT = 600;
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 600;
var mouse = {x:0, y:0, lastX:0, lastY:0, x1:0, y1:0, x2:0, y2:0 };
var c;
var tool = 'pencil';
var mouse_down = false;
var pencilWidth = 1;
var brushSize = 8;
var mirror = { x:false, y:false };

// undo history
var undoHistory = [];
var historyLevels = 10;
var historyPosition = -1;

var colors = ['#ffffff', '#000000', '#e40f18', '#3fa535', '#3e4899', '#ffef0f', '#d0b7af'];
var color = colors[1];

var toolButtons = [];
toolButtons.push(['clear', 'clearCanvas()']);
toolButtons.push(['save', 'saveImage()']);
toolButtons.push(['pencil', 'selectPencil()']);
toolButtons.push(['brush', 'selectBrush()']);
//toolButtons.push(['fill', 'selectFill()']);
toolButtons.push(['mirrorX', 'toggleMirrorX()']);
toolButtons.push(['mirrorY', 'toggleMirrorY()']);
toolButtons.push(['undo', 'undo()']);
toolButtons.push(['redo', 'redo()']);


function addToolButtons ()
{
  var html = '';

  for (var i = 0; i < toolButtons.length; i++) {
    if (!toolButtons[i]) { continue; }
    var left = (i % 2) * 60;
    var top = Math.floor(i / 2) * 60;
    html += '<div id="' + toolButtons[i][0] + '" onclick="' + toolButtons[i][1] + '" class="bu-tool" style="left:' + left + 'px;top:' + top + 'px;"></div>';
  }

  document.write(html);
}



function ini_draw ()
{

  c = new Canvas({ id:'canvas', width:CANVAS_WIDTH, height:CANVAS_HEIGHT, autoDrawCanvas:false });

  resizeDoc();

  window.addEventListener('resize', function () { resizeDoc(); });

  // mouse events
  document.body.addEventListener('mousemove', function (e) { move_me(e); });
  document.getElementById('canvas').addEventListener('mousedown', function (e) { down_me(e); } );
  document.getElementById('canvas').addEventListener('mouseup', function (e) { addHistory(); } );
  document.body.addEventListener('mouseup', function (e) { mouse_down = false; } );


  // touch events
  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  	if (e.targetTouches.length == 1) {
  		var touch = e.targetTouches[0];
  	}
    move_me(touch);
  });

  document.getElementById('canvas').addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (e.targetTouches.length == 1) {
      var touch = e.targetTouches[0];
    }
    down_me(touch);
  });

  document.getElementById('canvas').addEventListener('touchend', function (e) { addHistory(); } );
  document.body.addEventListener('touchend', function (e) { mouse_down = false; } );

  addColors();
  setColor(1);
  clearCanvas();
  addHistory();
  selectPencil();

  console.log('draw ready....');

}


function resizeDoc ()
{

  WIDTH = $(window).width();
  HEIGHT = $(window).height();
  CANVAS_WIDTH = WIDTH - $('#controls').width();
  CANVAS_HEIGHT = HEIGHT;

  $('#container').width(WIDTH);
  $('#container').height(HEIGHT);
  $('#controls').height(HEIGHT);
  $('#canvas').width(CANVAS_WIDTH);
  $('#canvas').height(CANVAS_HEIGHT);

  c.width = CANVAS_WIDTH;
  c.height = CANVAS_HEIGHT;

  var el = document.getElementById('canvas');
  el.width = CANVAS_WIDTH;
  el.height = CANVAS_HEIGHT;

}



function saveImage ()
{
  var link = document.getElementById('save-link');
  link.setAttribute('download', 'my_image.png');
  var canvas = document.getElementById('canvas');
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}




function addHistory ()
{

  if (historyPosition >=0) {
    undoHistory.splice(historyPosition + 1, historyLevels);
    historyPosition = -1;
  }

  var im = c.imageData();
  undoHistory.push(im);

  while (undoHistory.length > historyLevels) {
    undoHistory.shift();
  }

}


function undo ()
{
  if (historyPosition < 0) {
    historyPosition = undoHistory.length - 2;
  } else if (historyPosition > 0) {
    historyPosition = historyPosition - 1;
  } else {
    return false;
  }
  c.imageData(undoHistory[historyPosition]);
}


function redo () {
  if (historyPosition < 0) {
    return false;
  } else if (historyPosition < undoHistory.length - 1) {
    historyPosition++;
  }
  c.imageData(undoHistory[historyPosition]);
}




function down_me (e)
{

  //if (e.button != 0) { return false; }

  mouse.x = e.pageX - $('#canvas').offset().left;
  mouse.y = e.pageY - $('#canvas').offset().top;

  mouse.lastX = mouse.x;
  mouse.lastY = mouse.y;

  mouse_down = true;

  if (tool == 'brush') { brush(); }
  if (tool == 'pencil') { pencil(); }
  if (tool == 'fill') { fill(); }

}






function move_me (e)
{

  mouse.x = e.pageX - $('#canvas').offset().left;
  mouse.y = e.pageY - $('#canvas').offset().top;

  // used by mirror functions
  mouse.x1 = CANVAS_WIDTH - mouse.x;
  mouse.y1 = CANVAS_HEIGHT - mouse.y;
  mouse.x2 = CANVAS_WIDTH - mouse.lastX;
  mouse.y2 = CANVAS_HEIGHT - mouse.lastY;

  if (mouse_down)
  {

    if (tool == 'brush') { brush(); }
    if (tool == 'pencil') { pencil(); }

  }

  mouse.lastX = mouse.x;
  mouse.lastY = mouse.y;

}








function brush ()
{

  c.circle(mouse.x, mouse.y, brushSize, {fillStyle:color, strokeStyle:c.transparent});

  if (mirror.x) { c.circle(mouse.x1, mouse.y, brushSize, { fillStyle:color, strokeStyle:c.transparent }); }
  if (mirror.y) { c.circle(mouse.x, mouse.y1, brushSize, { fillStyle:color, strokeStyle:c.transparent }); }
  if (mirror.x && mirror.y) { c.circle(mouse.x1, mouse.y1, brushSize, { fillStyle:color, strokeStyle:c.transparent }); }

}




function pencil ()
{

  c.line(mouse.x, mouse.y, mouse.lastX, mouse.lastY, { lineWidth:pencilWidth, strokeStyle:color });

  if (mirror.x) { c.line(mouse.x1, mouse.y, mouse.x2, mouse.lastY, { lineWidth:pencilWidth, strokeStyle:color }); }
  if (mirror.y) { c.line(mouse.x, mouse.y1, mouse.lastX, mouse.y2, { lineWidth:pencilWidth, strokeStyle:color }); }
  if (mirror.x && mirror.y) { c.line(mouse.x1, mouse.y1, mouse.x2, mouse.y2, { lineWidth:pencilWidth, strokeStyle:color }); }

}





function fill ()
{

  var clickedColor = c.getPixel(mouse.x, mouse.y);
  clickedColor = [clickedColor[0], clickedColor[1], clickedColor[2]];

  var hex = color;
  if (hex[0] != '#') { hex = '#' + hex; }
  while (hex.length < 7) { hex += '0'; }
  var r = parseInt(hex[1] + hex[2], 16);
  var g = parseInt(hex[3] + hex[4], 16);
  var b = parseInt(hex[5] + hex[6], 16);
  var fillColor = [r, g, b];

  var stack = [[mouse.x, mouse.y]];

  while (stack.length > 0) {

    var pixel = stack.shift();

    // fill this pixel
    c.pixel(pixel[0], pixel[1], { fillStyle:color });

    // examine neighbours - add to stack?

    // above
    var p = [pixel[0], pixel[1] - 1];
    if (pixelWithinBounds(p) && !pointInStack(p, stack)) {
      var pColor = c.getPixel(p[0], p[1]);
      pColor = [pColor[0], pColor[1], pColor[2]];
      if ( colorsMatch(pColor, clickedColor) && !colorsMatch(pColor, fillColor) ) { stack.push(p); }
    }

    // right
    var p = [pixel[0] + 1, pixel[1]];
    if (pixelWithinBounds(p) && !pointInStack(p, stack)) {
      var pColor = c.getPixel(p[0], p[1]);
      pColor = [pColor[0], pColor[1], pColor[2]];
      if ( colorsMatch(pColor, clickedColor) && !colorsMatch(pColor, fillColor) ) { stack.push(p); }
    }

    // down
    var p = [pixel[0], pixel[1] + 1];
    if (pixelWithinBounds(p) && !pointInStack(p, stack)) {
      var pColor = c.getPixel(p[0], p[1]);
      pColor = [pColor[0], pColor[1], pColor[2]];
      if ( colorsMatch(pColor, clickedColor) && !colorsMatch(pColor, fillColor) ) { stack.push(p); }
    }

    // left
    var p = [pixel[0] - 1, pixel[1]];
    if (pixelWithinBounds(p) && !pointInStack(p, stack)) {
      var pColor = c.getPixel(p[0], p[1]);
      pColor = [pColor[0], pColor[1], pColor[2]];
      if ( colorsMatch(pColor, clickedColor) && !colorsMatch(pColor, fillColor) ) { stack.push(p); }
    }

  }

}


function pointInStack (p, stack)
{

  for (var i = 0; i < stack.length; i++) {
    if (p[0] == stack[i][0] && p[1] == stack[i][1]) { return true; }
  }

  return false;

}




function pixelWithinBounds (p)
{
  if (p[0] >= 0 && p[0] < c.width && p[1] >= 0 && p[1] < c.height) {
    return true;
  }
  return false;
}



function colorsMatch (c1, c2)
{
  if (c1.length != c2.length) { return false; }

  for (var i = 0; i < c1.length;i++) {
    if (c1[i] != c2[i]) { return false; }
  }

  return true;
}


function addColors ()
{

  var html = '';

  for (var i = 0; i < colors.length; i++) {
    var col = colors[i];
    var h = 100 / colors.length;
    var cb = '<div id="color-' + i + '" class="color-block" style="height:' + h + '%;background:' + col + ';" onclick="setColor(\'' + i + '\');"></div>';
    html += cb;
  }

  $('#colors').html(html);

}









function setColor (colorIndex){
  $('.color-block').removeClass('selected-color');
  $('#color-' + colorIndex).addClass('selected-color');
  color = colors[colorIndex];
}








/* ******** tool buttons ******** */

function clearCanvas ()
{
  addHistory();
  c.clear(colors[0]);
}





function selectPencil ()
{
  tool = 'pencil';
  $('.bu-tool').removeClass('bu-tool-selected');
  $('#pencil').addClass('bu-tool-selected');
}



function selectBrush ()
{
  tool = 'brush';
  $('.bu-tool').removeClass('bu-tool-selected');
  $('#brush').addClass('bu-tool-selected');
}


function selectFill ()
{
  tool = 'fill';
  $('.bu-tool').removeClass('bu-tool-selected');
  $('#fill').addClass('bu-tool-selected');
}


function toggleMirrorX ()
{
  mirror.x = !mirror.x;
  if (mirror.x) {
    $('#mirrorX').addClass('bu-tool-selected');
  } else {
    $('#mirrorX').removeClass('bu-tool-selected');
  }
}


function toggleMirrorY ()
{
  mirror.y = !mirror.y;
  if (mirror.y) {
    $('#mirrorY').addClass('bu-tool-selected');
  } else {
    $('#mirrorY').removeClass('bu-tool-selected');
  }
}










//

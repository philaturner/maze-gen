var scl = 25;
var cols, rows;
var cellGrid = [];
var currentCell;
var pathStack = [];
var gridSize = 100;
var hOffset = gridSize + 5;
var vOffset = gridSize + 5;
var zaxis = 6;
var qaxis = 6;
var fSlider;
var xyProb = 100;
var initalFR = 3;

function setup(){
  //add canvas
  var canvas = createCanvas(630, 630);
  canvas.parent(gameContainer);

  //framerate slider
  fSlider = createSlider(1, 55, initalFR);
  fSlider.position(90, height + 28);
  textSize(15);
  fill(0);
  noStroke();

  frameRate(fSlider.value());
  cols = gridSize / scl//floor(width / scl);
  rows = gridSize / scl //floor(height / scl);

  //setup cells
  for (var q = 0; q < qaxis; q++){
  var qGrid = [];
    for (var z = 0; z < zaxis; z++){
      var tempGrid = [];
      for (var j = 0; j < rows; j++){
        for (var i = 0; i < cols; i++){
          var cell = new Cell(i, j, z, q);
            tempGrid.push(cell);
        }
      }
      qGrid.push(tempGrid);
    }
    cellGrid.push(qGrid);
  }

  //initalise current random start cell
  // var rq = floor(random(0,qaxis-1));
  // var rz = floor(random(0,zaxis-1));
  // var rindex = floor(random(0,24));
  //console.log(rq,rz,rindex);
  //currentCell = cellGrid[rq][rz][rindex];

  //fixed start position
  currentCell = cellGrid[3][3][13];
}

function draw(){
  background(88);

  //update framerate to slider value
  var fr = fSlider.value();
  frameRate(fr);

  //render cells
  for (var q = 0; q < qaxis; q++){
    for (var z = 0; z < zaxis; z++){
      for (var i = 0; i < cellGrid[q][z].length; i++){
        cellGrid[q][z][i].render();
      }
    }
  }
  //flag cell as visited
  currentCell.visited = true;

  //next cell is an available neighbour cell
  var nextCell = currentCell.checkNeighbours();

  //if defined make current cell the next one
  if (nextCell){
    pathStack.push(currentCell);
    //remove lines between current and next
    removeLines(currentCell, nextCell);
    addMarker(currentCell, nextCell);
    //update current cell to be next cell
    currentCell = nextCell;
  }
  //check for not neightbours
  if (!nextCell && pathStack.length > 0){
    var poppedCell = pathStack.pop();
    currentCell = poppedCell;
  }
}

function removeLines(a,b){
  var x = a.i - b.i;
  if (x == 1){ // to left of current
    a.walls[3] = false;
    b.walls[1] = false;
  }
  if (x == -1){ // to right of current
    a.walls[1] = false;
    b.walls[3] = false;
  }
  var y = a.j - b.j;
  if (y == 1){ // to top of current
    a.walls[0] = false;
    b.walls[2] = false;
  }
  if (y == -1){ // to bottom of current
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

//add markers showing z and q movements
function addMarker(a,b){
  if (a.z != b.z){
    a.zmarker = true;
    b.zmarker = true;
    if((b.z - a.z) != 0){
      var col = getRandomColor();
      a.zfill = col;
      b.zfill = col;
    }
  }
  if (a.q != b.q){
    a.qmarker = true;
    b.qmarker = true;
    if((b.q - a.q) != 0){
      var col = getRandomColor();
      a.qfill = col;
      b.qfill = col;
    }
  }
}

//main cell object
function Cell(i, j, z, q){
  this.i = i;
  this.j = j;
  this.z = z;
  this.q = q;
  this.visited = false;
  this.zmarker = false;
  this.zfill = getRandomColor();
  this.qmarker = false;
  this.qfill = getRandomColor();

  //top, right, bottom, left
  this.walls = [true, true, true, true];

  this.checkNeighbours = function(){
    var neighbours = [];

    //2D check through neighbours
    var above = cellGrid[q][z][calcIndex(i,j-1)];
    var right = cellGrid[q][z][calcIndex(i+1,j)];
    var below = cellGrid[q][z][calcIndex(i,j+1)];
    var left = cellGrid[q][z][calcIndex(i-1,j)];

    //3D check
    if (z != 0) var infront = cellGrid[q][z-1][calcIndex(i,j)];
    if(calcZ(z+1)) var behind = cellGrid[q][z+1][calcIndex(i,j)];

    //4d check
    if (q !=0) var qUp = cellGrid[q-1][z][calcIndex(i,j)];
    if(calcZ(q+1)) var qDown = cellGrid[q+1][z][calcIndex(i,j)];

    //push into array if valid neighbour
    for (var d = 0; d < xyProb; d++){
      //add multiple times to array to increase chance of picking x,y direction
      if (above && !above.visited) neighbours.push(above);
      if (right && !right.visited) neighbours.push(right);
      if (below && !below.visited) neighbours.push(below);
      if (left && !left.visited) neighbours.push(left);
    }

    if (infront && !infront.visited) neighbours.push(infront);
    if (behind && !behind.visited) neighbours.push(behind);
    if (qUp && !qUp.visited) neighbours.push(qUp);
    if (qDown && !qDown.visited) neighbours.push(qDown);

    //pick a random neighbour
    if (neighbours.length > 0){
      //console.log('Found ' + neighbours.length + " neighbours");
      var r = floor(random(0,neighbours.length));
      return neighbours[r]
    }
  }

  this.render = function() {
    var x = (this.i * scl) + (z * hOffset);
    var y = (this.j * scl) + (q * vOffset);
    stroke(255);

    //draw walls
    for (var i = 0; i < this.walls.length; i++){
      if (this.walls[i] == true){
        switch(i) {
          case 0:
            line(x,y,x+scl,y); //top
            break;
          case 1:
            line(x+scl,y,x+scl,y+scl); //right
            break;
          case 2:
            line(x+scl,y+scl,x,y+scl); //bottom
            break;
          case 3:
            line(x,y+scl,x,y); //left
            break;
        }
      }
    }
    //sets marker for z movement
    if (this.zmarker){
      noStroke();
      fill(this.zfill);
      ellipse(x+scl/2,y+scl/2,scl/6,scl/6);
    }

    //sets marker for q axis movement
    if (this.qmarker){
      noStroke();
      fill(this.qfill);
      ellipse(x+scl/2,y+scl/2,scl/3,scl/3);
      //triangle(x,y,x+scl/2,y+scl/2,x-scl/2,y-scl/2);
    }

    //colour current cell
    if (this == currentCell){
      noStroke();
      fill(0,255,0,50);
      rect(x,y,scl,scl);
    }

    //if visted change colour
    if (this.visited){
      noStroke();
      fill(225,0,0,50);
      rect(x,y,scl,scl);
    }

  }
}

//calculates index of 1d array based on grid layout
function calcIndex(i,j){
  //check for valid index
  if (i < 0 || j < 0 || i > cols-1 || j > rows-1){
    return -1
  }
  return i + j * rows
}

//stops invalid z movement
function calcZ(a){
  //check for valid index
  if (a == 0){
    return a
  }
  if (a == -1){
    return undefined
  }
  if (a > zaxis-1){
    return undefined
  }
  return a
}

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var scl = 20;
var cols, rows;
var cellGrid = [];
var currentCell;
var pathStack = [];
var hOffset = 210;

function setup(){
  createCanvas(830,200);
  //frameRate(20);
  cols = 200 / scl//floor(width / scl);
  rows = 200/ scl //floor(height / scl);
  zaxis = 4;

  //setup cells
  for (var z = 0; z < zaxis; z++){
    var tempGrid = [];
    for (var j = 0; j < rows; j++){
      for (var i = 0; i < cols; i++){
        var cell = new Cell(i, j, z);
          tempGrid.push(cell);
          //cellGrid[z] = cellGrid[0].push(cell);
      }
    }
    cellGrid[z] = tempGrid;
  }
  //initalise current random start cell
  currentCell = cellGrid[0][floor(random(0,cellGrid[0].length))];
}

function draw(){
  background(88);
  for (var z = 0; z < zaxis; z++){
    for (var i = 0; i < cellGrid[z].length; i++){
      cellGrid[z][i].render();
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

function Cell(i, j, z){
  this.i = i;
  this.j = j;
  this.z = z;
  this.visited = false;

  //top, right, bottom, left
  this.walls = [true, true, true, true];

  this.checkNeighbours = function(){
    var neighbours = [];
    //check through all neighbours and push into array if valid
    var above = cellGrid[0][calcIndex(i,j-1)];
    var right = cellGrid[0][calcIndex(i+1,j)];
    var below = cellGrid[0][calcIndex(i,j+1)];
    var left = cellGrid[0][calcIndex(i-1,j)];

    if (above && !above.visited) neighbours.push(above);
    if (right && !right.visited) neighbours.push(right);
    if (below && !below.visited) neighbours.push(below);
    if (left && !left.visited) neighbours.push(left);
    //if are neighbours pick a random one
    if (neighbours.length > 0){
      var r = floor(random(0,neighbours.length));
      return neighbours[r]
    }

  }

  this.render = function() {
    var x = (this.i * scl) + (z * hOffset);
    var y = (this.j * scl);
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
    //color current cell
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

function calcIndex(i,j){
  //check for valid index
  if (i < 0 || j < 0 || i > cols-1 || j > rows-1){
    return -1
  }
  return i + j * rows
}

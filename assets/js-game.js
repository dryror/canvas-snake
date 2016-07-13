// Context of the canvas
var context;

// Size of the canvas
var width=600;
var height=400;

// Snake information
var gameSpeed;
var snakeSize;

// Size of each snake block
var bitSize = 10;

// Direction of travel
var DIRECTION = {
  LEFT : 0,
  UP : 1,
  RIGHT : 2,
  DOWN : 3
};
var currentDirection;

// Game mode
var GAMEMODE = {
  PAUSE : 0,
  PLAY : 1
};
var currentMode;

// Players score
var currentScore;

// Coordinates of the snake
var xPos;
var yPos;

// Coordinates of the food
var xFood;
var yFood;

// Coordinates of the poop
var xPoop;
var yPoop;

var isKeyPressed;

// Called when the size is first visited
// Sets up the canvas and starts the game
function init() {
  document.onkeydown = keydown;

  // Set the context for the canvas
  context = document.getElementById("canvas").getContext("2d");

  // Start the game
  startGame();
}

// Starts the game. Draws the canvas and the snake, then starts moving the snake.
function startGame() {
  // Clear the canvas
  context.clearRect(0,0,width,height+50);

  // Initial snake speed and size
  gameSpeed = 1000/10;
  snakeSize = 4;
  currentMode = GAMEMODE.PLAY;
  isKeyPressed = false;

  // Initialize to poop
  xPoop = [];
  yPoop = [];

  // Initial snake coordinates
  xPos = [];
  yPos = [];
  var x = width / 2;
  var y = height / 2;
  for (var i = 0; i < snakeSize; i++) {
    xPos.push(x);
    yPos.push(y);
    x -= bitSize;
  }

  // Starting score
  currentScore = 0;

  // Starting direction
  currentDirection = DIRECTION.RIGHT;

  // Set food location
  generateFood();

  // Start moving the snake
  if (typeof game_loop != 'undefined') {
    clearInterval(game_loop);
  }
  game_loop = setInterval(moveSnake, gameSpeed);
}

// Draws the current state of the snake
function drawSnake() {
  context.clearRect(0,0, width, height+50);
  context.lineWidth = 1;

  //border of game area
  context.strokeStyle = "#424242"; // colour of the outline
  context.strokeRect(0, 0, width, height);

  // Draw a bit for all coordinates of the snake
  for (var i = 0; i < snakeSize; i++) {
    // Body of each bit
    context.fillStyle = "#0F0"; // colour of the snake
    context.fillRect(xPos[i], yPos[i], bitSize, bitSize);

    // Outline to separate the bits
    context.strokeStyle = "#FFF"; // colour of the outline
    context.strokeRect(xPos[i], yPos[i], bitSize, bitSize);
  }

  // Draw the food
  context.fillStyle = "#F00";
  context.fillRect(xFood, yFood, bitSize, bitSize);

  // Draw the poop
  context.fillStyle = "#6B4C13";
  for (var i = 0; i < xPoop.length; i++) {
    context.fillRect(xPoop[i], yPoop[i], bitSize, bitSize);
  }

  // Show the current score
  score();
}

function generateFood() {
  xFood = Math.floor(width*Math.random()/bitSize)*bitSize;
  yFood = Math.floor(height*Math.random()/bitSize)*bitSize;

  // Make sure the food doesn't generate on the snake
  for (var i = 0; i < snakeSize; i++) {
    if (xFood == xPos[i] && yFood == yPos[i]) {
      generateFood();
    }
  }

  // Make sure the food doesn't generate on the poop
  for (var i = 0; i < xPoop.length; i++) {
    if (xFood == xPoop[i] && yFood == yPoop[i]) {
      generateFood();
    }
  }
}

// Change the direction of the snake based on key presses.
function keydown(ev) {
  keyPressed = ev.keyCode;

  // Prevent scrolling from the arrow keys
  if (keyPressed == 38 || keyPressed == 40) {
    ev.preventDefault();
  }

  switch(keyPressed) {
    // Space pressed
    case 32:
      pauseGame();
      break;
    // Left pressed
    case 37:
      if (currentDirection == DIRECTION.RIGHT) {
        break;
      }
      if (isKeyPressed == true) {
        break;
      }
      isKeyPressed = true;
      currentDirection = DIRECTION.LEFT;
      break;
    // Up pressed
    case 38:
      if (currentDirection == DIRECTION.DOWN) {
        break;
      }
      if (isKeyPressed == true) {
        break;
      }
      isKeyPressed = true;
      currentDirection = DIRECTION.UP;
      break;
    // Right pressed
    case 39:
      if (currentDirection == DIRECTION.LEFT) {
        break;
      }
      if (isKeyPressed == true) {
        break;
      }
      isKeyPressed = true;
      currentDirection = DIRECTION.RIGHT;
      break;
    // Down pressed
    case 40:
      if (currentDirection == DIRECTION.UP) {
        break;
      }
      if (isKeyPressed == true) {
        break;
      }
      isKeyPressed = true;
      currentDirection = DIRECTION.DOWN;
      break;
    // Enter pressed, restarts the game
    case 13:
      startGame();
      break;
  }
}

// Move the snake in the current direction of travel
function moveSnake() {

  switch(currentDirection) {
    case DIRECTION.LEFT:
      xPos.unshift(xPos[0] - bitSize);
      yPos.unshift(yPos[0]);
      break;
    case DIRECTION.UP:
      xPos.unshift(xPos[0]);
      yPos.unshift(yPos[0] - bitSize);
      break;
    case DIRECTION.RIGHT:
      xPos.unshift(xPos[0] + bitSize);
      yPos.unshift(yPos[0]);
      break;
    case DIRECTION.DOWN:
      xPos.unshift(xPos[0]);
      yPos.unshift(yPos[0] + bitSize);
      break;
  }

  // Move the snake again
  isKeyPressed = false;

  // Check for collisions
  if (snakeSize >= 4) {
    if (collision() == true) {
      gameOver();
      return;
    }
  }

  // Move the snake
  if (xPos[0] == xFood && yPos[0] == yFood) {
    generateFood();
    snakeSize ++;
    currentScore ++;
    if (currentScore%3 == 0) {
      poop();
    }
  } else {
    xPos.pop();
    yPos.pop();
  }

  // Draw the snake in the new position
  drawSnake();
}

// Check if the head of the snake ran into the border or part of the snake
function collision() {
  // Get the current position of the head of the snake
  var snakeHeadX = xPos[0];
  var snakeHeadY = yPos[0];

  // Check if it ran into the border
  if (snakeHeadX < 0 || snakeHeadX >= width) {
    return true;
  }

  if (snakeHeadY < 0 || snakeHeadY >= height) {
    return true;
  }

  // Check if it ran into itself
  for (var i = 1; i < snakeSize; i++) {
    if (snakeHeadX == xPos[i] && snakeHeadY == yPos[i]) {
      return true;
    }
  }

  // Check if you ran into poop
  for (var i = 0; i < xPoop.length; i ++) {
    if (snakeHeadX == xPoop[i] && snakeHeadY == yPoop[i]) {
      return true;
    }
  }

  return false;
}

function score() {
  context.fillStyle = "#424242";
  context.font = "bold 13pt Arial";
  context.textAlign = "center";
  context.fillText("Score: "+currentScore, width/2, height+30);
}

function poop() {
  xPoop.push(xPos[snakeSize-1]);
  yPoop.push(yPos[snakeSize-1]);
}

function pauseGame() {
  if (currentMode == GAMEMODE.PAUSED) {
    //resume game
    game_loop = setInterval(moveSnake, gameSpeed);
    currentMode = GAMEMODE.PLAY;
    return;
  }

  // Stop moving
  clearInterval(game_loop);
  currentMode = GAMEMODE.PAUSED;
}

function gameOver() {
  // Stop moving
  clearInterval(game_loop);
  // Display game over message
  context.fillStyle = "#424242";
  context.font = "bold 40pt Arial";
    context.textAlign = "center";
    context.fillText("Game Over", width/2, height/2);
    context.font = "bold 20pt Arial";
    context.fillText("Enter for new game", width/2, height/2 + 25);
}

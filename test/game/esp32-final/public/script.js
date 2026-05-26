const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');

const GROUND_OFFSET = 126;
const MIN_GAP = 450;
const MAX_GAP = 1050;

// Dummy feedback functions
const gameOverFeedback = () => { };
const scoreFeedback = () => { };

const levelUpFlash = () => { };

// Images
const duckImg = new Image();
const duckJumpImg = new Image();
const duckDashImg = new Image();

const obstacleImg1 = new Image();
const obstacleImg2 = new Image();
const obstacleImg3 = new Image();

// Game state
let groundY = 0;

let playerY = 0;
let velocityY = 0;

let isJumping = false;
let isDashing = false;
let isSpeedBoost = false;

let gameOver = false;
let gameOverShown = false;

let score = 0;
let lastLevelUpScore = 0;

let playerInitialized = false;

let obstacles = [];
let targetGap = 0;

// Salto logic
let jumpCounter = 0;
let nextSaltoJump = 5 + Math.floor(Math.random() * 5);

let isSaltoJump = false;
let jumpStartY = 0;

// Settings
const openSettings = () => {
  document.querySelector('#settingsPanel')?.classList.remove('hidden');
};

const closeSettings = () => {
  document.querySelector('#settingsPanel')?.classList.add('hidden');
};

// Canvas
const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};


// Assets
const loadAssets = () => {
  duckImg.src = '../assets/duck.png';
  duckJumpImg.src = '../assets/duck2.png';
  duckDashImg.src = '../assets/duck3.png';

  obstacleImg1.src = '../assets/obstacle1.png';
  obstacleImg2.src = '../assets/obstacle2.png';
  obstacleImg3.src = '../assets/obstacle3.png';
};

// Collision
const checkCollision = (
  playerX,
  playerY,
  playerWidth,
  playerHeight,
  obstacleX,
  obstacleY,
  obstacleWidth,
  obstacleHeight
) => {
  return (//check if squares overlap?
    playerX < obstacleX + obstacleWidth &&
    playerX + playerWidth > obstacleX &&
    playerY < obstacleY + obstacleHeight &&
    playerY + playerHeight > obstacleY
  );
};

// Input
const handleKeyDown = (e) => {
  //check if space bar is tapped via the condition setting it to true or false
  const isSpace = e.code === 'Space' || e.key === ' ';

  if (
    isSpace && //space is pressed
    !isJumping && //is not jumping
    playerY >= groundY - GROUND_OFFSET - 5 && //player is almost basically on the ground with margin of 5px
    !gameOver //game is not over yet
  ) {
    velocityY = -18; //setting velocity of player on Y access
    isJumping = true;

    jumpStartY = playerY; //records jump start point

    jumpCounter++; //counts jumps to know when a salto should occur.

    if (jumpCounter === nextSaltoJump) {
      isSaltoJump = true; 
      nextSaltoJump = jumpCounter + 5 + Math.floor(Math.random() * 5);//resets new random amount of jumps before a salto
    }

  }

  if (isSpace && gameOver) {
    location.reload(); //reloads the entire webpage to reset the entire game. Might want to change this.
  }
};

// Player
const updatePlayer = () => {
  playerY += velocityY; //update playerY with the velocity from the jump (-18)

  if (playerY < groundY - GROUND_OFFSET) { //if the player is higher than the ground
    velocityY += 0.6; //the velocity of the jump lowers
  } else {
    playerY = groundY - GROUND_OFFSET; //if player Y is smaller or equal to ground level it snaps to ground
    velocityY = 0;
    isJumping = false;

    if (isSaltoJump) {
      isSaltoJump = false; //salt become false
    }
  }
};

const drawPlayer = () => {
  const duckWidth = isDashing ? 180 : 126;
  const duckHeight = isDashing ? 65 : 126;

  const duckY = isDashing ? playerY + 61 : playerY;

  const currentDuckImg = isDashing
    ? duckDashImg
    : isJumping
      ? duckJumpImg
      : duckImg;

  let rotationAngle = 0;

  if (isSaltoJump && isJumping) {
    if (velocityY < 0) { //still going up?
      const verticalDistance = Math.abs(jumpStartY - playerY);//how far has he jumped?

      rotationAngle = Math.min((verticalDistance / 270) * 360, 360); //calc angle
    } else {
      rotationAngle = 360;
    }
  }

  if (rotationAngle > 0) {
    ctx.save(); //save current transformations 

    const centerX = 80 + duckWidth / 2; //get center point 
    const centerY = duckY + duckHeight / 2; //get center point

    ctx.translate(centerX, centerY); //translating the 0 point.

    ctx.rotate((rotationAngle * Math.PI) / 180); //rotate canvas by converting degrees into radians

    ctx.drawImage( 
      currentDuckImg,
      -duckWidth / 2, //to center point of image
      -duckHeight / 2, //to center point of imag 
      duckWidth,
      duckHeight
    );

    ctx.restore(); //restore the previous transformation settings from before saving.
  } else {
    ctx.drawImage(currentDuckImg, 80, duckY, duckWidth, duckHeight);//draw normal image.
  }
};

// Obstacles
const spawnObstacle = () => {
  const rand = Math.random(); //set a random value

  const obstacleType =
    rand < 0.33
      ? 1
      : rand < 0.67
        ? 2
        : 3; //use this type of dice roll method


  let imgRef;

  if (obstacleType === 1) { //set an obstacle based on the random value
    imgRef = obstacleImg1;
  } else if (obstacleType === 2) {
    imgRef = obstacleImg2;
  } else {
    imgRef = obstacleImg3;
  }

  const originalWidth = //“If the image has loaded correctly and has a width bigger than 0, use the image width.Otherwise use 50.”
    imgRef.complete && imgRef.width > 0
      ? imgRef.width
      : 50;

  const originalHeight =
    imgRef.complete && imgRef.height > 0
      ? imgRef.height
      : 100;

  const width = originalWidth / 1.5;
  const height = originalHeight / 1.5;

  const obstacleY = //because zero point is in upper left corner of the obstacle.
    obstacleType === 3
      ? groundY - height - 100
      : groundY - height;

  obstacles.push({ //push into obstacle array.
    x: canvas.width,
    y: obstacleY,
    width,
    height,
    type: obstacleType,
    wasJumpedOver: false
  });

  targetGap =
    MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP); //set new targetGap
};

const updateObstacles = () => {
  let shouldSpawn = false;

  if (obstacles.length === 0) {
    shouldSpawn = true;
  } else {
    const lastObstacle = obstacles[obstacles.length - 1]; //grab the last obstacle

    const distanceFromRightEdge = canvas.width - lastObstacle.x; //check the distance between the obstacle and the right edge

    if (distanceFromRightEdge > targetGap) {//check if the distance from the right edge is larger thn the targetgap
      shouldSpawn = true; 
    }
  }

  if (shouldSpawn) {
    spawnObstacle(); //spawn Obstacle
  }

  const baseSpeed = Math.min(6 + score * 0.15, 14); //updates gamespeed when score gets higher with a max of 14

  const obstacleSpeed = isSpeedBoost 
    ? baseSpeed * 1.3 //increase speed when there is a speedboost.
    : baseSpeed;

  for (let i = obstacles.length - 1; i >= 0; i--) { //go over all obstacles
    const obstacle = obstacles[i]; //grab an obstacle out of the array

    if (playerY < groundY - GROUND_OFFSET - 10) { //when the object is on screen and the player is in the air, he get's a score which doesnt really make sense but who cares.
      obstacle.wasJumpedOver = true;
    }

    obstacle.x -= obstacleSpeed; //move the object to the left

    if (obstacle.x + obstacle.width < 0) {// is off screen?
      if (obstacle.wasJumpedOver) { // has been jumped over?
        score += isSpeedBoost ? 3 : 1; //if there was a speedboost 

        document.querySelector('#score').textContent = score; 

        scoreFeedback();

        if (
          score % 10 === 0 && //if score is a jump of 10 a speedboost occurs for 3 seconds
          score > lastLevelUpScore
        ) {
          lastLevelUpScore = score;

          levelUpFlash();

          isSpeedBoost = true;

          setTimeout(() => {
            isSpeedBoost = false;
          }, 3000);
        }
      }

      obstacles.splice(i, 1); //removes 1 obstacle starting at index
    }
  }
};

const drawObstacles = () => {
  for (const obstacle of obstacles) {
    let img;

    if (obstacle.type === 1) {
      img = obstacleImg1;
    } else if (obstacle.type === 2) {
      img = obstacleImg2;
    } else {
      img = obstacleImg3;
    }

    if (img.complete) {
      ctx.drawImage(
        img,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    }
  }
};

// Game
const checkGameOver = () => {
  const playerWidth = isDashing ? 180 : 126;
  const playerHeight = isDashing ? 65 : 126;

  const hitboxY = isDashing //dashing is sliding
    ? playerY + 61 //lower hitbox
    : playerY;

  for (const obstacle of obstacles) { //for each obstacle
    if (
      checkCollision(
        80, //duck never moves horizontally, and is fixed at 80px from canvas.
        hitboxY,
        playerWidth,
        playerHeight,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      )
    ) {
      gameOver = true;

      gameOverFeedback();
    }
  }
};

const drawGround = () => {
  ctx.fillStyle = '#ffffff';

  ctx.fillRect(
    0,
    groundY,
    canvas.width,
    1
  );
};

const drawBackground = () => {
  ctx.fillStyle = '#1a1a1a';

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
};

const showGameOverModal = () => {
  if (gameOver && !gameOverShown) {
    document.querySelector('#finalScore').textContent = score;

    document
      .querySelector('#gameOverModal')
      ?.classList.remove('hidden');

    gameOverShown = true;
  }
};

const update = () => { //checks if game is over and updates the player and the obstacles
  if (gameOver) return;

  updatePlayer();
  updateObstacles();

  checkGameOver();
};

const render = () => {
  drawBackground();

  groundY = canvas.height / 2;

  if (!playerInitialized) {
    playerY = groundY - GROUND_OFFSET;
    playerInitialized = true;
  }

  drawGround();

  drawPlayer();

  drawObstacles();

  showGameOverModal();
};

const gameLoop = () => {
  const settingsPanel = document.querySelector('#settingsPanel');

  if (
    settingsPanel &&
    !settingsPanel.classList.contains('hidden') //if settingspannel is vissible thn the game is just set to paused and returns (no update and render, but does use request animation frame so that it can pick up where it left, when pannel is closed)
  ) {
    requestAnimationFrame(gameLoop);
    return;
  }

  update();

  render();

  requestAnimationFrame(gameLoop);
};

// Setup
const setupEventListeners = () => {
  window.addEventListener('resize', resizeCanvas);//rezizing with window resizing

  document.addEventListener('keydown', handleKeyDown);//

  document
    .querySelector('#settingsBtn')
    ?.addEventListener('click', openSettings);

  document
    .querySelector('#closeSettingsBtn')
    ?.addEventListener('click', closeSettings);
};

const init = () => {
  resizeCanvas();
  loadAssets();
  setupEventListeners();
  gameLoop();
};

document.addEventListener('DOMContentLoaded', init);





// // Dummy feedback functions (no ESP32)
// function gameOverFeedback() {}
// function scoreFeedback() {}
// function buzzerBeep() {}
// function levelUpFlash() {}



// // Remove calibration logic (not needed)
// let sensorCalibration = {
//   potMin: null,
//   potMax: null
// };

// let currentSensorValue = 0;


// function openSettings() {
//   document.querySelector('#settingsPanel').classList.remove('hidden');
// }

// function closeSettings() {
//   document.querySelector('#settingsPanel').classList.add('hidden');
// }

// function updateCalibrationDisplay() {
//   const minDisplay = document.querySelector('#minValue');
//   const maxDisplay = document.querySelector('#maxValue');
  
//   if (minDisplay) {
//     minDisplay.textContent = sensorCalibration.potMin !== null 
//       ? `Min: ${sensorCalibration.potMin}` 
//       : 'Min: Not set';
//   }
  
//   if (maxDisplay) {
//     maxDisplay.textContent = sensorCalibration.potMax !== null 
//       ? `Max: ${sensorCalibration.potMax}` 
//       : 'Max: Not set';
//   }
// }

// function setMinCalibration() {}
// function setMaxCalibration() {}
// function clearCalibration() {}


// document.addEventListener('DOMContentLoaded', function() {
//   const settingsBtn = document.querySelector('#settingsBtn');
//   const closeSettingsBtn = document.querySelector('#closeSettingsBtn');
//   if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
//   if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
//   updateCalibrationDisplay();
// });


// // gme logic and canvas

// const canvas = document.querySelector('#gameCanvas');
// const ctx = canvas.getContext('2d');

// function resizeCanvas() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }

// resizeCanvas();
// window.addEventListener('resize', resizeCanvas);

// const duckImg = new Image();
// duckImg.src = '../assets/duck.png';

// const duckJumpImg = new Image();
// duckJumpImg.src = '../assets/duck2.png';

// const duckDashImg = new Image();
// duckDashImg.src = '../assets/duck3.png';

// const obstacleImg1 = new Image();
// obstacleImg1.src = '../assets/obstacle1.png';

// const obstacleImg2 = new Image();
// obstacleImg2.src = '../assets/obstacle2.png';

// const obstacleImg3 = new Image();
// obstacleImg3.src = '../assets/obstacle3.png';

// const GROUND_OFFSET = 126; 
// let groundY = 0; 

// let isJumping = false;
// let isDashing = false;
// let isSpeedBoost = false;  
// let playerY = 0; 
// let velocityY = 0;
// let score = 0;
// let gameOver = false;
// let gameOverShown = false;  
// let lastScoreTime = 0;
// let wasJumping = false;
// let wasDashing = false;
// let lastButtonState = false;
// let lastSettingsState = false;  
// let lastPotValue = 0;
// let potResetToLow = false;
// let restartTriggered = false;
// let lastLevelUpScore = 0;  

// // Ssalto logic
// let jumpCounter = 0;  
// let nextSaltoJump = 5 + Math.floor(Math.random() * 5);  
// let isSaltoJump = false;  
// let jumpStartY = 0;  
// let jumpPeakY = 0;  

// // dinosaur game obstacle logic
// let obstacles = [];
// let targetGap = 0; 
// const MIN_GAP = 450; 
// const MAX_GAP = 1050; 



// // Keyboard controls: spacebar to jump, R to restart
// document.addEventListener('keydown', function(e) {
//   if ((e.code === 'Space' || e.key === ' ') && !isJumping && playerY >= (groundY - GROUND_OFFSET - 5) && !gameOver) {
//     velocityY = -18;
//     isJumping = true;
//     jumpStartY = playerY;
//     jumpCounter++;
//     if (jumpCounter === nextSaltoJump) {
//       isSaltoJump = true;
//       nextSaltoJump = jumpCounter + 5 + Math.floor(Math.random() * 5);
//     }
//     buzzerBeep();
//   }
//   if ((e.code === 'Space' || e.key === ' ') && gameOver) {
//     location.reload();
//   }
// });

// function checkCollision(playerX, playerY, playerWidth, playerHeight, obstacleX, obstacleY, obstacleWidth, obstacleHeight) {
//   return playerX < obstacleX + obstacleWidth &&
//          playerX + playerWidth > obstacleX &&
//          playerY < obstacleY + obstacleHeight &&
//          playerY + playerHeight > obstacleY;
// }

// // endless game loop 
// function gameLoop() {
//   ctx.fillStyle = "#1a1a1a";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
  
//   groundY = canvas.height / 2;
//   if (playerY === 0) {
//     playerY = groundY - GROUND_OFFSET; 
//   }

//   const settingsPanel = document.querySelector('#settingsPanel');
//   if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
//     requestAnimationFrame(gameLoop);
//     return;  
//   }

//   if (!gameOver) {
//     playerY += velocityY;
//     if (playerY < groundY - GROUND_OFFSET) {
//       let gravityScale = 1.0;  
//       if (sensorCalibration.potMin !== null && sensorCalibration.potMax !== null) {
//         const normalizedPot = Math.max(0, Math.min(1, (currentSensorValue - sensorCalibration.potMin) / (sensorCalibration.potMax - sensorCalibration.potMin)));
//         gravityScale = 0.5 + (normalizedPot * 1.5);  
//       }
//       velocityY += 0.6 * gravityScale; 
//     } else {
//       playerY = groundY - GROUND_OFFSET;    
//       velocityY = 0;
//       isJumping = false; 
//     }

//     if (isJumping && !wasJumping) {
//       buzzerBeep();
//       wasJumping = true;
//     }
//     if (!isJumping) {
//       wasJumping = false;
//     }

//     if (isDashing && !wasDashing) {
//       buzzerBeep();
//       wasDashing = true;
//     }
//     if (!isDashing) {
//       wasDashing = false;
//     }

//     let shouldSpawn = false;

//     if (obstacles.length === 0) {
//       shouldSpawn = true;
//     } else {
//       const lastObstacle = obstacles[obstacles.length - 1];
      
//       const distanceFromRightEdge = canvas.width - lastObstacle.x;

//       if (distanceFromRightEdge > targetGap) {
//         shouldSpawn = true;
//       }
//     }

//     if (shouldSpawn) {
//       const rand = Math.random();
//       const obstacleType = rand < 0.33 ? 1 : rand < 0.67 ? 2 : 3;
      
//       let imgRef;
//       if (obstacleType === 1) imgRef = obstacleImg1;
//       else if (obstacleType === 2) imgRef = obstacleImg2;
//       else imgRef = obstacleImg3;
      
//       const originalWidth = (imgRef.complete && imgRef.width > 0) ? imgRef.width : 50;
//       const originalHeight = (imgRef.complete && imgRef.height > 0) ? imgRef.height : 100;
      
//       const width = originalWidth / 1.5;
//       const height = originalHeight / 1.5;
      
//       const obstacleY = obstacleType === 3 ? groundY - height - 100 : groundY - height;
      
//       obstacles.push({
//         x: canvas.width,
//         y: obstacleY,
//         width: width,   
//         height: height, 
//         type: obstacleType,  
//         wasJumpedOver: false  
//       });

//       targetGap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
//     }

//     let baseSpeed = Math.min(6 + (score * 0.15), 14); 
//     const obstacleSpeed = isSpeedBoost ? baseSpeed * 2 : baseSpeed; 
    
//     for (let i = obstacles.length - 1; i >= 0; i--) {
//       if (playerY < groundY - GROUND_OFFSET - 10) {
//         obstacles[i].wasJumpedOver = true;
//       }
      
//       obstacles[i].x -= obstacleSpeed; 
      
//       if (obstacles[i].x < -20) {
//         if (obstacles[i].wasJumpedOver) {
//           score += isSpeedBoost ? 3 : 1;  
          
//           const htmlScore = document.getElementById('score');
//           if (htmlScore) {
//             htmlScore.textContent = score;
//           }
          
//           if (score % 10 === 0 && score > lastLevelUpScore) {
//             lastLevelUpScore = score;
//             levelUpFlash();
//           }
//         }
        
//         obstacles.splice(i, 1);
//       }
//     }

//     const playerWidth = isDashing ? 180 : 126;  
//     const playerHeight = isDashing ? 65 : 126;  
    
//     const hitboxY = isDashing ? playerY + 61 : playerY; 
    
//     for (let obstacle of obstacles) {
//       if (checkCollision(80, hitboxY, playerWidth, playerHeight, obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
//         gameOver = true;
//         restartTriggered = false;
//         gameOverFeedback();
//       }
//     }
//   }

//   if (duckImg.complete || duckJumpImg.complete) {
//     const duckWidth = isDashing ? 180 : 126;  
//     const duckHeight = isDashing ? 65 : 126;  
    
//     const duckY = isDashing ? playerY + 61 : playerY;  
    
//     const currentDuckImg = isDashing ? duckDashImg : (isJumping ? duckJumpImg : duckImg);
    
//     let rotationAngle = 0;
//     if (isSaltoJump && isJumping) {
//       if (velocityY < 0) {
//         const verticalDistance = Math.abs(jumpStartY - playerY);
//         rotationAngle = Math.min((verticalDistance / 270) * 360, 360);
//       } else {
//         rotationAngle = 360;
//       }
//     }
    
//     if (rotationAngle > 0) {
//       const centerY = duckY + duckHeight / 2;
//       ctx.drawImage(currentDuckImg, -duckWidth / 2, -duckHeight / 2, duckWidth, duckHeight);
//       ctx.restore();  
//     } else {
//       ctx.drawImage(currentDuckImg, 80, duckY, duckWidth, duckHeight);
//     }
    
//     if (!isJumping && isSaltoJump) {
//       isSaltoJump = false;
//     }
//   }

//   for (let obstacle of obstacles) {
//     let img;
//     if (obstacle.type === 1) {
//       img = obstacleImg1;
//     } else if (obstacle.type === 2) {
//       img = obstacleImg2;
//     } else {
//       img = obstacleImg3;
//     }
//     if (img.complete) {
//       ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
//     }
//   }

//   ctx.fillStyle = "#ffffff";
//   ctx.fillRect(0, groundY, canvas.width, 1);
  

//   // Gravity display removed (no potentiometer)

//   if (gameOver && !gameOverShown) {
//     document.querySelector('#finalScore').textContent = score;
//     document.querySelector('#gameOverModal').classList.remove('hidden');
//     gameOverShown = true;
//   }

//   requestAnimationFrame(gameLoop);
// }

// gameLoop();
import { useEffect, useRef, useState } from "react";
import duckImgSrc from "../assets/game/run.png";
import duckJumpImgSrc from "../assets/game/jump.png";
import duckDashImgSrc from "../assets/game/duck3.png";
import obstacleImg1Src from "../assets/game/obstacle1.png";
import obstacleImg2Src from "../assets/game/obstacle2.png";
import obstacleImg3Src from "../assets/game/obstacle3.png";
import floorImgSrc from "../assets/game/floor.png";
import building1src from "../assets/game/building1.png";

export default function Game({ onGameOver, attempt, image }) {
    // React References and States
    const canvasRef = useRef(null);
    const restartRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const onGameOverRef = useRef(onGameOver);

    const [score, setScore] = useState(0);
    const [gameOverState, setGameOver] = useState(false);
    const [countDown, setCountDown] = useState(true);
    const [count, setCount] = useState(3);
    
    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    useEffect(() => {//should not be hit by re-renders
        const $canvas = canvasRef.current;

        if (!$canvas) return;

        const ctx = $canvas.getContext("2d");
        if (!ctx) return;

        //  Game Constants 
        const GROUND_OFFSET = 126;
        const MIN_GAP = 450;
        const MAX_GAP = 1050;
        const JUMP_VELOCITY = -18;
        const EARLY_RELEASE_MULT = 0.4;

        // Game State Variables 
        let animationId;
        let groundY = window.innerHeight * 0.85;
        let playerY = 0;
        let velocityY = 0;

        let isJumping = false;
        let isDashing = false;
        let isSpeedBoost = false;
        let isGameOver = false;
        let gameOverShown = false;
        let isCountingDown = true;

        let lastLevelUpScore = 0;
        let playerInitialized = false;
        let obstacles = [];
        let targetGap = 0;
        let currentScore = 0;
        let currentSpeed = 0;
        let backgroundOffset = 0;
        let buildings = [];

        // Input state to prevent auto-repeat
        let spaceHeld = false;

        // Salto logic for visual flair
        let jumpCounter = 0;
        let nextSaltoJump = 5 + Math.floor(Math.random() * 5);
        let isSaltoJump = false;
        let jumpStartY = 0;

        // Feedback placeholders
        const gameOverFeedback = () => { };
        const scoreFeedback = () => { };
        const levelUpFlash = () => { };

        // Image Assets
        const duckImg = new Image();
        const duckJumpImg = new Image();
        const duckDashImg = new Image();
        const obstacleImg1 = new Image();
        const obstacleImg2 = new Image();
        const obstacleImg3 = new Image();
        const floorImg = new Image();
        const buildingImg1 = new Image();
        const buildingImg2 = new Image();
        const buildingImg3 = new Image();
        const faceImg = new Image(); // Stores the captured face image

        const canDrawImage = (img) => img && img.complete && img.naturalWidth > 0;

        // Initialization Functions 

        // Adjust canvas dimensions to fill the current window width and height.
        const resizeCanvas = () => {
            $canvas.width = window.innerWidth;
            $canvas.height = window.innerHeight;
            groundY = $canvas.height * 0.85; // Keep ground at the center
        };

        // Assign sources to image objects so they begin downloading from Vite's bundled paths.
        const loadAssets = () => {
            duckImg.src = duckImgSrc;
            duckJumpImg.src = duckJumpImgSrc;
            duckDashImg.src = duckDashImgSrc;
            obstacleImg1.src = obstacleImg1Src;
            obstacleImg2.src = obstacleImg2Src;
            obstacleImg3.src = obstacleImg3Src;
            floorImg.src = floorImgSrc;
            buildingImg1.src = building1src;
            
            // If an image was captured, set its source
            if (image) {
                faceImg.src = image;
            }
        };

        // Helper to check if two rectangular bounding boxes overlap
        const checkCollision = (px, py, pw, ph, ox, oy, ow, oh) => {
            return (
                px < ox + ow &&
                px + pw > ox &&
                py < oy + oh &&
                py + ph > oy
            );
        };

        //Input Handlers 

        const handleKeyDown = (e) => {
            const isJumpInput = //check event what started the event
                e.code === "Space" ||
                e.key === " " ||
                e.type === "pointerdown";

            if (isJumpInput && e.type === "keydown") {
                if (spaceHeld) return;
                spaceHeld = true;
            }

            if (isCountingDown) return;

            // If player initiates a jump and is on the ground
            if (
                isJumpInput && //the jump input must be correct
                !isJumping && //the player must not be jumping
                playerY >= groundY - GROUND_OFFSET - 5 && //the player must be on the ground with a margin of 5px (player = 126px large and 0 point is upperLeftCorner)
                !isGameOver && //game can't be over
                !isCountingDown //prevent jump during countdown
            ) { //if all the above conditions are true, then the player can jump
                velocityY = JUMP_VELOCITY; //set the velocity of the player to the jump velocity
                isJumping = true; //set the player to jumping
                jumpStartY = playerY; //set the jump start y to the player y
                jumpCounter++; //increment the jump counter

                // Trigger a random salto jump every few normal jumps
                if (jumpCounter === nextSaltoJump) {
                    isSaltoJump = true;
                    nextSaltoJump = jumpCounter + 5 + Math.floor(Math.random() * 5);//random between 5 and 10 until next salto
                }
            }

            // Restart game on jump input if already game over
            if (isJumpInput && isGameOver) {
                restart();
            }
        };

        const handleKeyUp = (e) => {
            const isJumpRelease =
                e.code === "Space" ||
                e.key === " " ||
                e.type === "pointerup" ||
                e.type === "pointercancel";

            if (isJumpRelease) {
                spaceHeld = false;
            }

            if (isCountingDown) return;
            // If player releases jump early, cut their upward momentum
            if (isJumpRelease) {
                if (velocityY < 0) {
                    velocityY *= EARLY_RELEASE_MULT;
                }
            }
        };

        // Update Logic

        // Applies gravity and manages jumping state for the player
        const updatePlayer = () => {
            playerY += velocityY;

            // Apply gravity if player is above ground
            if (playerY < groundY - GROUND_OFFSET) {//if player is in the air, make them fall again
                velocityY += 0.6;
            } else {
                // Snap player to the ground
                playerY = groundY - GROUND_OFFSET;
                velocityY = 0; //set the jumping velocity to 0
                isJumping = false;
                if (isSaltoJump) isSaltoJump = false; //if the jump was a salto set it to false
            }
        };

        // Spawns a random obstacle at the right side of the screen
        const spawnObstacle = () => {
            const rand = Math.random(); //random number between 0 and 1
            const obstacleType = rand < 0.33 ? 1 : rand < 0.67 ? 2 : 3; //if the random number is less than 0.33, then the obstacle type is 1, if it is less than 0.67, then the obstacle type is 2, otherwise it is 3

            const imgRef = //determine obstacle type based on random number
                obstacleType === 1
                    ? obstacleImg1
                    : obstacleType === 2
                        ? obstacleImg2
                        : obstacleImg3;

            // Default dimensions if image is not fully loaded yet
            const width = (imgRef.width || 50) / 1.5;//rescale the images
            const height = (imgRef.height || 100) / 1.5;

            // Type 3 obstacles are flying, others are grounded
            const obstacleY =
                obstacleType === 3 ? groundY - height - 100 : groundY - height;// if the obstacle type is 3 put it in the air, otherwise put it on the floor.

            obstacles.push({//create the obstacle
                x: $canvas.width,
                y: obstacleY,
                width,
                height,
                type: obstacleType,
                wasJumpedOver: false,
            });

            // Set distance until the next obstacle spawns
            targetGap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        };

        // Moves obstacles leftward and handles score increments
        const updateObstacles = () => {
            let shouldSpawn = obstacles.length === 0;//if there are no obstacles, create one.

            if (!shouldSpawn) {//if there are obstacles 
                const last = obstacles[obstacles.length - 1]; //grab the last obstacle
                const dist = $canvas.width - last.x; //calculate the distance between the right side of the canvas and the last obstacle
                shouldSpawn = dist > targetGap; //if the distance is greater thn the randomly set targetGap, create a new obstacle
            }

            if (shouldSpawn) spawnObstacle();//spawn the obstacle

            // Game speeds up slightly as the score increases
            const baseSpeed = Math.min(6 + currentScore * 0.15, 14);
            currentSpeed = isSpeedBoost ? baseSpeed * 1.15 : baseSpeed;//if speed boost is true, the speed is 15% faster, otherwise it is normal

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const o = obstacles[i];

                // If player is in the air above an obstacle, register as jumped over
                if (playerY < groundY - GROUND_OFFSET - 10) {
                    o.wasJumpedOver = true;
                }

                o.x -= currentSpeed;//move obstacles to the left

                // Remove obstacle if it goes fully off the left side of the screen
                if (o.x + o.width < 0) {//ofscreen?
                    if (o.wasJumpedOver) {//was jumped over?
                        const added = isSpeedBoost ? 3 : 1;
                        currentScore += added; //update score 
                        setScore(currentScore); // Sync with React state for UI
                        scoreFeedback();

                        // Speed boost mechanic every 10 points
                        if (currentScore % 10 === 0 && currentScore > lastLevelUpScore) {
                            lastLevelUpScore = currentScore;
                            levelUpFlash();
                            isSpeedBoost = true;
                            setTimeout(() => {
                                isSpeedBoost = false;
                            }, 2000);
                        }
                    }

                    obstacles.splice(i, 1);//remove 1 item from the array starting at index i
                }
            }
        };


        const updateBuildings = () => {
            let rightmostX = 0;
            if (buildings.length > 0) {
                const last = buildings[buildings.length - 1];
                rightmostX = last.x + last.width;
            }

            // Use a while loop to instantly fill the screen on the first frame
            while (rightmostX <= $canvas.width + 100) {
                const rand = Math.random();
                const buildingType = rand < 0.33 ? 1 : rand < 0.67 ? 2 : 3;

                const imgRef = buildingType === 1 ? buildingImg1 :
                    buildingType === 2 ? (canDrawImage(buildingImg2) ? buildingImg2 : buildingImg1) :
                        (canDrawImage(buildingImg3) ? buildingImg3 : buildingImg1);

                const aspectRatio = canDrawImage(imgRef) ? (imgRef.height / imgRef.width) : 0.6;
                const width = $canvas.width * 0.8;
                const height = width * aspectRatio;
                const y = (groundY - 50) - height;

                // Spawn exactly at rightmostX (which is 0 when empty)
                const spawnX = rightmostX;

                buildings.push({
                    x: spawnX,
                    y: y,
                    width: width,
                    height: height,
                    type: buildingType,
                    imgRef: imgRef
                });
                
                rightmostX = spawnX + width;
            }

            for (let i = buildings.length - 1; i >= 0; i--) {
                const b = buildings[i];
                b.x -= currentSpeed;

                if (b.x + b.width < 0) {
                    buildings.splice(i, 1);
                }
            }

        }

        // Determines if the player has collided with any obstacles
        const checkGameOver = () => {
            if (isCountingDown) return; // Defensive check
            const w = isDashing ? 159 : 86;
            const h = isDashing ? 65 : 126;
            const hitY = isDashing ? playerY + 61 : playerY;


            for (const o of obstacles) {
                const shrink = 0.5; // Shrink obstacle hitbox width by 50% to be forgiving

                const collision = checkCollision( //check if rectangles intersect
                    80, // Player X fixed at 80
                    hitY,
                    w,
                    h,
                    o.x + (o.width * (1 - shrink)) / 2, // Centered hitbox
                    o.y,
                    o.width * shrink,
                    o.height
                );

                //if they collide but game is not over yet, end the game.
                if (collision && !isGameOver) {
                    isGameOver = true;
                    setGameOver(true); // Notify React to show modal
                    gameOverFeedback();
                    onGameOverRef.current?.(currentScore);
                    break;
                }
            }
        };

        // Combines all updates for the current frame
        const update = () => {
            if (isGameOver || isCountingDown) return;
            groundY = $canvas.height * 0.85;
            updatePlayer(); //update player position
            updateObstacles();
            updateBuildings();
            // Build logic 

            backgroundOffset += currentSpeed;
            checkGameOver();
        };

        // Render Logic 

        const drawBackground = () => {
            // Sky
            ctx.fillStyle = "#5796FF";
            ctx.fillRect(0, 0, $canvas.width, $canvas.height);

            // Buildings
            for (const b of buildings) {
                if (canDrawImage(b.imgRef)) {
                    ctx.drawImage(
                        b.imgRef,
                        b.x,
                        b.y,
                        b.width,
                        b.height
                    );
                }
            }

            // Floor
            if (canDrawImage(floorImg)) {
                const floorY = groundY - 50;
                const floorHeight = $canvas.height - floorY;
                const floorWidth = $canvas.width;
                let floorLoopOffset = backgroundOffset % floorWidth;

                ctx.drawImage(
                    floorImg,
                    -floorLoopOffset,
                    floorY,
                    floorWidth,
                    floorHeight
                );
                ctx.drawImage(
                    floorImg,
                    floorWidth - floorLoopOffset,
                    floorY,
                    floorWidth,
                    floorHeight
                );
            }
        };

        const drawGround = () => {
            // ctx.fillStyle = "#fff";
            // ctx.fillRect(0, groundY, $canvas.width, 1);
        };

        const drawPlayer = () => {
            const duckWidth = isDashing ? 159 : 86;
            const duckHeight = isDashing ? 65 : 126;
            const duckY = isDashing ? playerY + 61 : playerY;

            const currentDuckImg = isDashing
                ? duckDashImg
                : isJumping
                    ? duckJumpImg
                    : duckImg;

            let rotationAngle = 0;

            // Calculate rotation logic for saltos
            if (isSaltoJump && isJumping) {
                if (velocityY < 0) {
                    const verticalDistance = Math.abs(jumpStartY - playerY);//rotation logic
                    rotationAngle = Math.min((verticalDistance / 270) * 360, 360);
                } else {
                    rotationAngle = 360; // Complete flip on the way down
                }
            }

            // Fallback for when the duck image hasn't loaded yet
            if (!canDrawImage(currentDuckImg)) {
                ctx.fillStyle = "orange";
                ctx.fillRect(80, duckY, duckWidth, duckHeight);
                return;
            }

            if (rotationAngle > 0) {
                // Draw rotated player
                ctx.save();
                const centerX = 80 + duckWidth / 2;
                const centerY = duckY + duckHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((rotationAngle * Math.PI) / 180);

                // Draw the body first
                ctx.drawImage(
                    currentDuckImg,
                    -duckWidth / 2,
                    -duckHeight / 2,
                    duckWidth,
                    duckHeight
                );

                // If face image exists, draw it on the head (inline, no nested functions)
                if (canDrawImage(faceImg)) {
                    const offsetX = -duckWidth / 2;
                    const offsetY = -duckHeight / 2;
                    
                    // The face image is 400x400 with a 300px circular head.
                    // Scale it so the 300px circular part fits the duck's head size (~55px wide normal, ~35px dashing)
                    const faceScale = (isDashing ? 15 : 37) / 300;
                    const drawSize = 400 * faceScale;
                    
                    // Position relative to the character's top-left corner
                    const fx = isDashing 
                        ? offsetX + duckWidth * 0.55 - drawSize / 2 
                        : offsetX + duckWidth * 0.55 - drawSize / 2;
                    const fy = isDashing 
                        ? offsetY + duckHeight * 0.2 - drawSize / 2 
                        : offsetY + duckHeight * 0.2 - drawSize / 2;

                    ctx.drawImage(faceImg, fx, fy, drawSize, drawSize);
                }

                ctx.restore();
            } else {
                // Normal draw without rotation
                ctx.drawImage(currentDuckImg, 80, duckY, duckWidth, duckHeight);
                
                // Overlay face if it exists
                if (canDrawImage(faceImg)) {
                    // Scaling logic same as above
                    const faceScale = (isDashing ? 15 : 37) / 300;
                    const drawSize = 400 * faceScale;

                    const fx = isDashing 
                        ? 80 + duckWidth * 0.55 - drawSize / 2 
                        : 80 + duckWidth * 0.547 - drawSize / 2;
                    const fy = isDashing 
                        ? duckY + duckHeight * 0.2 - drawSize / 2 
                        : duckY + duckHeight * 0.18 - drawSize / 2;

                    ctx.drawImage(faceImg, fx, fy, drawSize, drawSize);
                }
            }
        };

        const drawObstacles = () => {
            for (const o of obstacles) {
                const img =
                    o.type === 1 ? obstacleImg1 :
                        o.type === 2 ? obstacleImg2 :
                            obstacleImg3;

                if (canDrawImage(img)) {
                    ctx.drawImage(img, o.x, o.y, o.width, o.height);
                } else {
                    // Fallback for when the obstacle image hasn't loaded yet
                    ctx.fillStyle = "crimson";
                    ctx.fillRect(o.x, o.y, o.width || 40, o.height || 80);
                }
            }
        };

        const showGameOverModal = () => {
            if (!isGameOver || gameOverShown) return;
            gameOverShown = true;
            setGameOver(true);
        };

        // Combines all drawing functions for the current frame
        const render = () => {
            drawBackground();

            // Set initial player height relative to ground once dimensions exist
            if (!playerInitialized) {
                playerY = groundY - GROUND_OFFSET;
                playerInitialized = true;
            }

            drawGround();
            drawPlayer();
            drawObstacles();
            showGameOverModal();
        };

        const startCountdown = () => {
            clearInterval(countdownTimerRef.current);

            isCountingDown = true;
            setCountDown(true);
            setCount(3);

            let value = 3;

            countdownTimerRef.current = setInterval(() => {
                value -= 1;

                if (value > 0) {
                    setCount(value);
                    return;
                }

                clearInterval(countdownTimerRef.current);
                setCountDown(false);
                isCountingDown = false;
            }, 1000);
        };


        const restart = () => {
            isGameOver = false;
            setGameOver(false);

            obstacles = [];
            buildings = [];
            currentScore = 0;
            currentSpeed = 0;
            backgroundOffset = 0;
            setScore(0);

            playerY = groundY - GROUND_OFFSET;
            velocityY = 0;

            isJumping = false;
            isSpeedBoost = false;
            isSaltoJump = false;

            jumpCounter = 0;
            lastLevelUpScore = 0;
            gameOverShown = false;

            updateBuildings();
            startCountdown();
        };




        // Main Game Loop
        const gameLoop = () => {
            update();
            render();
            // Continuously request the next frame from the browser
            animationId = requestAnimationFrame(gameLoop);
        };

        // Setup & Initialization (init) 
        const init = () => {
            resizeCanvas();
            loadAssets();
            
            // Ensure player starts on the ground
            playerY = groundY - GROUND_OFFSET;
            playerInitialized = true;

            setGameOver(false);
            setScore(0);

            restartRef.current = restart;
            window.addEventListener("resize", resizeCanvas);

            // Desktop Keyboard Listeners
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("keyup", handleKeyUp);

            // Mobile/Touch Listeners
            $canvas.addEventListener("pointerdown", handleKeyDown);
            $canvas.addEventListener("pointerup", handleKeyUp);
            $canvas.addEventListener("pointercancel", handleKeyUp);

            updateBuildings();
            startCountdown();
            // Start the game loop
            gameLoop();
        };

        init(); // Kick off the setup!

        // Cleanup
        // Remove listeners and halt animation frame when component unmounts to prevent memory leaks
        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(countdownTimerRef.current);
            window.removeEventListener("resize", resizeCanvas);

            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);

            $canvas.removeEventListener("pointerdown", handleKeyDown);
            $canvas.removeEventListener("pointerup", handleKeyUp);
            $canvas.removeEventListener("pointercancel", handleKeyUp);
        };
    }, [image]);

    //React JSX UI
    return (
        <>
            {countDown && (
                <div id="gameOverModal" className="settings__panel" tyle={{ textAlign: "center" }}>

                    <p className="modal__text">get ready...</p>
                    <h2 style={{ fontSize: "4rem", marginTop: "1rem", color: "white" }}>{count}</h2>

                </div>
            )}

            {gameOverState && !countDown && (
                <div id="gameOverModal" className="settings__panel">
                    <div className="settings__content">
                        <h2>GAME OVER</h2>
                        <p className="modal__score">
                            Your Score: <span id="finalScore">{score}</span>
                        </p>
                        <button
                            onClick={() => restartRef.current?.()}
                        >
                            Try Again
                        </button>


                        <p className="modal__text">Press space to restart</p>
                    </div>
                </div>
            )}
            <section className="game__nav">
                <button className="game__pause">⏸️</button>
                <div className="game__info">
                    <p className="game__attempt">Attempt {attempt}/3</p>
                    <p className="game__score">your score:  {score}</p>
                </div>
            </section>
            <canvas ref={canvasRef} id="gameCanvas" />
        </>
    );
}
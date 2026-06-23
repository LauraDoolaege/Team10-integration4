import { useEffect, useRef, useState } from "react";
import run1ImgSrc from "../assets/game/sprite/run1.avif";
import run2ImgSrc from "../assets/game/sprite/run2.avif";
import run3ImgSrc from "../assets/game/sprite/run3.avif";
import run4ImgSrc from "../assets/game/sprite/run4.avif";
import run5ImgSrc from "../assets/game/sprite/run5.avif";
import run6ImgSrc from "../assets/game/sprite/run6.avif";

import jumpImgSrc from "../assets/game/sprite/jump.avif";

import obstacleImg1Src from "../assets/game/obstacles/cone.avif";
import obstacleImg2Src from "../assets/game/obstacles/fence.avif";
import obstacleImg3Src from "../assets/game/obstacles/dove.avif";
import floorImgSrc from "../assets/game/floor.png";
import building1src from "../assets/game/buildings/building1.avif";
import building2src from "../assets/game/buildings/building2.avif"
import building3src from "../assets/game/buildings/building3.avif"
import building4src from "../assets/game/buildings/building4.avif"

export default function Game({ onGameOver, attempt, image }) {
    // React References and States
    const canvasRef = useRef(null);
    const restartRef = useRef(null);
    const pauseRef = useRef(null);
    const resumeRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const onGameOverRef = useRef(onGameOver);



    const [score, setScore] = useState(0);
    const [gameOverState, setGameOver] = useState(false);
    const [pausedState, setPaused] = useState(false);
    const [countDown, setCountDown] = useState(true);
    const [count, setCount] = useState(3);
    const [isLoadingAssets, setIsLoadingAssets] = useState(true);

    useEffect(() => {
        onGameOverRef.current = onGameOver;
    }, [onGameOver]);

    useEffect(() => {//should not be hit by re-renders
        const $canvas = canvasRef.current;

        if (!$canvas) return;

        const ctx = $canvas.getContext("2d");
        if (!ctx) return;

        // ----------------------------
        // IMAGE SAFETY LOADER
        // ----------------------------

        const loadImage = (src) =>
            new Promise((resolve) => {
                const img = new Image();
                img.src = src;

                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });

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

        let lastTime = performance.now();
        const fpsInterval = 1000 / 60; // Target 60 frames per second

        let isJumping = false;
        let isDashing = false;
        let isSpeedBoost = false;
        let isGameOver = false;
        let isPaused = false;
        let gameOverShown = false;
        let isCountingDown = true;

        // Animation state
        let animationFrame = 0;
        let animationCounter = 0;

        let assetsReady = false;
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
        let runImages = [];
        let jumpImg, obstacleImg1, obstacleImg2, obstacleImg3, floorImg, buildingImg1, buildingImg2, buildingImg3, buildingImg4;
        const faceImg = new Image(); // Stores the captured face image

        const canDrawImage = (img) => img && img.complete && img.naturalWidth > 0;

        // Initialization Functions 

        // Assign sources to image objects so they begin downloading from Vite's bundled paths.
        const loadAssets = async () => {
            const assets = await Promise.all([
                loadImage(run1ImgSrc),
                loadImage(run2ImgSrc),
                loadImage(run3ImgSrc),
                loadImage(run4ImgSrc),
                loadImage(run5ImgSrc),
                loadImage(run6ImgSrc),
                loadImage(jumpImgSrc),
                loadImage(obstacleImg1Src),
                loadImage(obstacleImg2Src),
                loadImage(obstacleImg3Src),
                loadImage(floorImgSrc),
                loadImage(building1src),
                loadImage(building2src),
                loadImage(building3src),
                loadImage(building4src),
            ]);

            runImages = assets.slice(0, 6);
            [
                jumpImg,
                obstacleImg1,
                obstacleImg2,
                obstacleImg3,
                floorImg,
                buildingImg1,
                buildingImg2,
                buildingImg3,
                buildingImg4,
            ] = assets.slice(6);

            // If an image was captured, set its source
            if (image) {
                faceImg.src = image;
            }

            assetsReady = true;
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

            if (isCountingDown || isPaused) return;

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

            if (isCountingDown || isPaused) return;
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
            const width = (imgRef?.width || 50) / 1.5;//rescale the images
            const height = (imgRef?.height || 100) / 1.5;

            // Type 3 obstacles are flying, others are grounded
            const obstacleY =
                obstacleType === 3 ? groundY - height - 100 : groundY - height;// if the obstacle type is 3 put it in the air, otherwise put it on the floor.

            obstacles.push({//create the obstacle
                x: logicalWidth,
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
                const dist = logicalWidth - last.x; //calculate the distance between the right side of the canvas and the last obstacle
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

            const buildingImages = [buildingImg1, buildingImg2, buildingImg3, buildingImg4];

            // Use a while loop to instantly fill the screen on the first frame
            while (rightmostX <= logicalWidth + 100) {
                const rand = Math.random();
                const buildingIndex = Math.floor(rand * buildingImages.length);
                const buildingType = buildingIndex + 1;

                const rawImg = buildingImages[buildingIndex];
                const imgRef = canDrawImage(rawImg) ? rawImg : buildingImg1;

                const aspectRatio = canDrawImage(imgRef) ? (imgRef.height / imgRef.width) : 0.6;
                const width = logicalWidth * 0.8;
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

        // Logical dimensions for game logic
        let logicalWidth = window.innerWidth;
        let logicalHeight = window.innerHeight;

        // Adjust canvas dimensions to fill the current window width and height.
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const parent = $canvas.parentElement;
            logicalWidth = (parent && parent.clientWidth) ? parent.clientWidth : window.innerWidth;
            logicalHeight = (parent && parent.clientHeight) ? parent.clientHeight : window.innerHeight;
       

            // Physical size
            $canvas.width = logicalWidth * dpr;
            $canvas.height = logicalHeight * dpr;

            // Logical size via CSS
            $canvas.style.width = `${logicalWidth}px`;
            $canvas.style.height = `${logicalHeight}px`;

            // Scale context once
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            
            // Set image smoothing once to avoid per-frame overhead
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            groundY = logicalHeight * 0.85;

            // Re-calculate buildings on resize to prevent stretching
            if (assetsReady) {
                buildings = [];
                updateBuildings();
            }
        };

        // Determines if the player has collided with any obstacles
        const checkGameOver = () => {
            if (isCountingDown || isPaused) return; // Defensive check
            const w = isDashing ? 159 : 86;
            const h = isDashing ? 65 : 126;
            const hitY = isDashing ? playerY + 61 : playerY;


            for (const o of obstacles) {
                // Use a full-width hitbox for the fence (type 2) and larger hitboxes for others
                const shrink = o.type === 2 ? 1.0 : 0.8;

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
            if (isGameOver || isCountingDown || isPaused) return;
            groundY = logicalHeight * 0.85;
            updatePlayer(); //update player position
            updateObstacles();
            updateBuildings();
            // Build logic 

            // Update animation frame for running
            if (!isJumping && !isDashing) {
                animationCounter++;
                if (animationCounter >= 3) { // Switch frame every 10 update ticks
                    animationFrame = (animationFrame + 1) % 6;
                    animationCounter = 0;
                }
            } else {
                // Reset animation state when not running
                animationFrame = 0;
                animationCounter = 0;
            }

            backgroundOffset += currentSpeed;
            checkGameOver();
        };

        // Render Logic 

        const drawBackground = () => {
            // Sky
            ctx.fillStyle = "#5796FF";
            ctx.fillRect(0, 0, logicalWidth, logicalHeight);

            // Buildings
            for (const b of buildings) {
                if (canDrawImage(b.imgRef)) {
                    ctx.drawImage(
                        b.imgRef,
                        Math.round(b.x),
                        Math.round(b.y),
                        Math.round(b.width),
                        Math.round(b.height)
                    );
                }
            }

            // Floor
            if (canDrawImage(floorImg)) {
                const floorY = Math.round(groundY - 50);
                const floorHeight = Math.round(logicalHeight - floorY);
                const floorWidth = Math.round(logicalWidth);
                let floorLoopOffset = Math.round(backgroundOffset % floorWidth);

                ctx.drawImage(
                    floorImg,
                    -floorLoopOffset,
                    floorY,
                    floorWidth + 1,
                    floorHeight
                );
                ctx.drawImage(
                    floorImg,
                    floorWidth - floorLoopOffset,
                    floorY,
                    floorWidth + 1,
                    floorHeight
                );
            }
        };

        const drawGround = () => {
            // ctx.fillStyle = "#fff";
            // ctx.fillRect(0, groundY, logicalWidth, 1);
        };

        const drawPlayer = () => {
            const playerWidth = 86;
            const playerHeight = 126;
            const py = Math.round(playerY); // Round to avoid sub-pixel pixelation

            const currentPlayerImg = isJumping
                ? jumpImg
                : runImages[animationFrame];

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

            // Fallback for when the player image hasn't loaded yet
            if (!canDrawImage(currentPlayerImg)) {
                ctx.fillStyle = "orange";
                ctx.fillRect(80, py, playerWidth, playerHeight);
                return;
            }

            ctx.save();
            // Set high quality smoothing specifically for the player
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (rotationAngle > 0) {
                // Draw rotated player
                const centerX = 80 + playerWidth / 2;
                const centerY = py + playerHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((rotationAngle * Math.PI) / 180);

                // Draw the body first
                ctx.drawImage(
                    currentPlayerImg,
                    -playerWidth / 2,
                    -playerHeight / 2,
                    playerWidth,
                    playerHeight
                );

                // If face image exists, draw it on the head (inline, no nested functions)
                if (canDrawImage(faceImg)) {
                    const offsetX = -playerWidth / 2;
                    const offsetY = -playerHeight / 2;

                    // The face image is 400x400 with a 300px circular head.
                    // Scale it so the 300px circular part fits the player's head size (~55px wide normal)
                    const faceScale = 45 / 300;
                    const drawSize = Math.round(400 * faceScale);

                    // Position relative to the character's top-left corner
                    // Adjust horizontal offset if jumping to keep centered on head
                    const headXMult = isJumping ? 0.48 : 0.55;
                    const fx = offsetX + playerWidth * headXMult - drawSize / 2;
                    const fy = offsetY + playerHeight * 0.2 - drawSize / 2;

                    ctx.drawImage(faceImg, Math.round(fx), Math.round(fy), drawSize, drawSize);
                }
            } else {
                // Normal draw without rotation
                ctx.drawImage(currentPlayerImg, 80, py, playerWidth, playerHeight);

                // Overlay face if it exists
                if (canDrawImage(faceImg)) {
                    // Scaling logic same as above
                    const faceScale = 45 / 300;
                    const drawSize = Math.round(400 * faceScale);

                    // Adjust horizontal offset if jumping to keep centered on head
                    const headXMult = isJumping ? 0.48 : 0.547;
                    const fx = 80 + playerWidth * headXMult - drawSize / 2;
                    const fy = py + playerHeight * 0.18 - drawSize / 2;

                    ctx.drawImage(faceImg, Math.round(fx), Math.round(fy), drawSize, drawSize);
                }
            }
            ctx.restore();
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
            if (!assetsReady) return;

            drawBackground();

            // Set initial player height relative to ground once dimensions exist
            if (!playerInitialized) {
                playerY = groundY - GROUND_OFFSET;
                playerInitialized = true;
            }

            drawGround();
            drawPlayer();
            drawObstacles();
            if (!isPaused) showGameOverModal();
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
                lastTime = performance.now(); // Reset time when gameplay officially starts

            }, 1000);
        };


        const restart = () => {
            isGameOver = false;
            setGameOver(false);
            isPaused = false;
            setPaused(false);

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

        const pause = () => {
            if (isGameOver || isCountingDown) return;
            isPaused = true;
            setPaused(true);
        };

        const resume = () => {
            isPaused = false;
            setPaused(false);
            startCountdown();
        };

        // Main Game Loop
        const gameLoop = (currentTime) => {
            // Keep requesting frames at the monitor's natural refresh rate
            animationId = requestAnimationFrame(gameLoop);

            const time = currentTime || performance.now();
            const elapsed = time - lastTime;

            // Throttle updates and rendering so they run at exactly 60 FPS,
            // regardless of the screen's refresh rate (60Hz, 120Hz, 144Hz, etc.)
            if (elapsed >= fpsInterval) {
                // Adjust lastTime to account for minor timing fluctuations
                lastTime = time - (elapsed % fpsInterval);
                update();
                render();
            }
        };

        // Setup & Initialization (init) 
        const init = async () => {
            // First pass at resizing
            resizeCanvas();

            await loadAssets();
            setIsLoadingAssets(false); // Set to false when all images are downloaded     

            // Second pass at resizing after assets are ready and layout settled
            setTimeout(() => {
                resizeCanvas();
                playerY = groundY - GROUND_OFFSET;
                playerInitialized = true;

                // Only start game logic after final stabilized resize
                updateBuildings();
                startCountdown();
            }, 50);

            setGameOver(false);
            setScore(0);

            restartRef.current = restart;
            pauseRef.current = pause;
            resumeRef.current = resume;
            window.addEventListener("resize", resizeCanvas);

            // Desktop Keyboard Listeners
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("keyup", handleKeyUp);

            // Mobile/Touch Listeners
            $canvas.addEventListener("pointerdown", handleKeyDown);
            $canvas.addEventListener("pointerup", handleKeyUp);
            $canvas.addEventListener("pointercancel", handleKeyUp);

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
            {isLoadingAssets && (
                <div id="loadingModal" className="settings__panel" style={{ textAlign: "center" }}>
                    <div className="settings__content">
                        <h2 className="title no-wrap" style={{ color: "white" }}>LOADING...</h2>
                        <div className="spinner" style={{ margin: "1.5rem auto", background: "transparent", boxShadow: "none", padding: 0 }}></div>
                        <p className="modal__text">Downloading game assets</p>
                    </div>
                </div>
            )}     

            {countDown && !isLoadingAssets && (
                <div id="gameOverModal" className="settings__panel" style={{ textAlign: "center" }}>

                    <p className="modal__text">get ready...</p>
                    <h2 style={{ fontSize: "4rem", marginTop: "1rem", color: "white" }}>{count}</h2>

                </div>
            )}

            {gameOverState && !countDown && (
                <div id="gameOverModal" className="settings__panel">
                    <div className="settings__content">
                        <h2 className="title no-wrap">GAME OVER</h2>
                        <p className="modal__score">
                            Your Score: <span id="finalScore">{score}</span>
                        </p>
                        <button
                            onClick={() => restartRef.current?.()}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {pausedState && !countDown && (
                <div id="pauseModal" className="settings__panel">
                    <div className="settings__content">
                        <h2 className="title no-wrap">PAUSED</h2>
                        <button
                            onClick={() => resumeRef.current?.()}
                        >
                            Resume
                        </button>
                    </div>
                </div>
            )}

            <section className="game__nav">
                <button className="game__pause" onClick={() => pauseRef.current?.()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32" fill="none">
                        <path d="M7 0C8.65685 6.44256e-08 10 1.34315 10 3V29C10 30.6569 8.65685 32 7 32H3C1.34315 32 0 30.6569 0 29V3C0 1.34315 1.34315 6.44256e-08 3 0H7ZM25 0C26.6569 6.44256e-08 28 1.34315 28 3V29C28 30.6569 26.6569 32 25 32H21C19.3431 32 18 30.6569 18 29V3C18 1.34315 19.3431 6.44256e-08 21 0H25Z" fill="#D0FF4C" />
                    </svg></button>
                <div className="game__info">
                    <p className="game__attempt">Attempt {attempt}/3</p>
                    <p className="game__score">your score: {score}</p>
                </div>
            </section>
            <canvas ref={canvasRef} id="gameCanvas" />
        </>
    );
}

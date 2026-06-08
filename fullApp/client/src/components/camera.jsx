import { useEffect, useRef, useState } from "react";

export default function FaceCapture({ setState, image, setImage }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Tracks whether the camera stream has started
    const [cameraStarted, setCameraStarted] = useState(false);

 //get camera access and attach it to video element.
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user", // front-facing camera (selfie mode)
                },
            });

        
            if (videoRef.current) {//if there is a videoRef attach the camera stream to it.
                videoRef.current.srcObject = stream;
            }

            setCameraStarted(true);
        } catch (err) {
            console.error("Camera access denied or error:", err);
        }
    };

   //stop camera when faceCapture unmounts
    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach((track) => track.stop());//stop stream
            }
        };
    }, []);

    //Captures the current video frame and crops it into a circle using canvas clipping, then converts it to a PNG image.
    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        const ctx = canvas.getContext("2d");

        // Set output image size
        canvas.width = 400;
        canvas.height = 400;

        // Define circular crop area (center of canvas)
        const centerX = canvas.width/2;
        const centerY = canvas.height / 2;
        const radius = 150;

        // Clear previous frame (important for repeated captures)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save canvas state before applying clipping mask
        ctx.save();

        // Create circular clipping region
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();//all future drawings can not be drawn out of previously drawn area.

        // Calculate source coordinates to mimic "object-fit: cover" (centered square crop)
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const size = Math.min(videoWidth, videoHeight);
        const sx = (videoWidth - size) / 2;
        const sy = (videoHeight - size) / 2;

        //Draw the current video frame into the canvas. Only the clipped circular region will be visible.
        ctx.drawImage(
            video,
            sx,
            sy,
            size,
            size,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Restore canvas so clipping doesn't affect future drawings
        ctx.restore();

        // Convert canvas to PNG image (base64 string)
        const imageData = canvas.toDataURL("image/png");

        // Store captured image in state
        setImage(imageData);
    };

    return (
        <div>
        
            <div style={{ display: image ? "none" : "block" }}>
                <div
                    style={{
                        position: "relative",
                        width: "25rem",
                        height: "25rem",
                    }}
                >
                    {/* Video feed + overlay container */}
                    <div className="camera-container">
                        <video ref={videoRef} autoPlay playsInline />
                        <div className="camera-overlay" />
                    </div>

                    {/* Visual guide for face positioning */}
                    <div
                        style={{
                            position: "absolute",
                            top: "3.125rem",
                            left: "3.125rem",
                            width: "18.75rem",
                            height: "18.75rem",
                            borderRadius: "50%",
                            border: "0.25rem solid white",
                            pointerEvents: "none",
                        }}
                    />
                </div>

                <div style={{ marginTop: "1rem" }}>
                    {!cameraStarted ? (
                        // Step 1: start camera
                        <button type="button" className="button-primary" onClick={startCamera}>
                            Start Camera
                        </button>
                    ) : (
                        // Step 2: take photo
                        <button type="button" className="button-primary" onClick={captureImage}>
                            Take Picture
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden canvas used only for processing the image */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* CAPTURED IMAGE PREVIEW */}
            {image && (
                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {/* Final cropped image preview */}
                    <img
                        src={image}
                        alt="Captured face"
                        width={300}
                        style={{
                            display: "block",
                            marginBottom: "1rem",
                            borderRadius: "50%",
                            border: "0.25rem solid white",
                        }}
                    />

                    {/* Retake or continue flow */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setImage(null)}
                        >
                            Retake Picture
                        </button>

                        {/* Move to next step in parent component */}
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setState && setState()}
                        >
                            Continue to Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
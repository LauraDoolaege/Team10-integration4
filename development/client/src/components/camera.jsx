import { useEffect, useRef, useState } from "react";

export default function FaceCapture({ setState, image, setImage }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

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

            streamRef.current = stream;
            if (videoRef.current) {//if there is a videoRef attach the camera stream to it.
                videoRef.current.srcObject = stream;
            }

            setCameraStarted(true);
        } catch (err) {
            console.error("Camera access denied or error:", err);
        }
    };

    // Re-attach stream if it exists but video element was re-created (e.g. after retake)
    useEffect(() => {
        if (!image && cameraStarted && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [image, cameraStarted]);

   //stop camera when faceCapture unmounts
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
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


        <div className="camera__wrapper">
            {!image ? (
                <div className="camera__content">
                    {/* Video feed + overlay container */}
                    <div className="camera-container">
                        <video className="video" ref={videoRef} autoPlay playsInline />
                        <div className="camera-overlay" />
                        <div className="camera-instruction" />
                    </div>

                    <div className="camera__text-container">
                        <h2 className="title camera__title">Say cheese!</h2>
                        <p className="text">Center your face inside the circle before taking the photo</p>
                    </div>

                    <div className="camera__button-container">
                        {!cameraStarted ? (
                            <button type="button" className="button-primary" onClick={startCamera}>
                                Start Camera
                            </button>
                        ) : (
                            <button type="button" className="button-primary" onClick={captureImage}>
                                Take Picture
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="camera__content">
                    {/* Preview matching the capture screen layout */}
                    <div className="camera-container camera-preview-container">
                        <img src={image} alt="Captured face" className="camera-preview-image" />
                    </div>

                    <div className="camera__text-container">
                        <h2 className="title camera__title">Looking good!</h2>
                        <p className="text">Want to use this photo?</p>
                    </div>

                    <div className="camera__button-container">
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => setState && setState()}
                        >
                            Looks good!
                        </button>
                        <button
                            type="button"
                            className="button__underlined"
                            onClick={() => setImage(null)}
                        >
                            Retake Picture
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden canvas used only for processing the image */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
}

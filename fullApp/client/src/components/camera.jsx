import { useEffect, useRef, useState } from "react";

export default function FaceCapture({ setState }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [image, setImage] = useState(null);
    const [cameraStarted, setCameraStarted] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraStarted(true);
        } catch (err) {
            console.error("Camera access denied or error:", err);
        }
    };

    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        const ctx = canvas.getContext("2d");

        canvas.width = 400;
        canvas.height = 400;

        const centerX = 200;
        const centerY = 200;
        const radius = 150;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            video,
            0,
            0,
            video.videoWidth,
            video.videoHeight,
            0,
            0,
            400,
            400
        );

        ctx.restore();

        const imageData = canvas.toDataURL("image/png");

        setImage(imageData);
    };

    return (
        <div>
            <div style={{ display: image ? "none" : "block" }}>
                <div
                    style={{
                        position: "relative",
                        width: "400px",
                        height: "400px",
                    }}
                >
                    <div className="camera-container">
                        <video ref={videoRef} autoPlay playsInline />
                        <div className="camera-overlay" />
                    </div>

                    {/* Circle guide */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50px",
                            left: "50px",
                            width: "300px",
                            height: "300px",
                            borderRadius: "50%",
                            border: "4px solid white",
                            pointerEvents: "none",
                        }}
                    />
                </div>

                <div style={{ marginTop: "1rem" }}>
                    {!cameraStarted ? (
                        <button className="button-primary" onClick={startCamera}>
                            Start Camera
                        </button>
                    ) : (
                        <button className="button-primary" onClick={captureImage}>
                            Take Picture
                        </button>
                    )}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                style={{ display: "none" }}
            />

            {image && (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <img
                        src={image}
                        alt="Captured face"
                        width={300}
                        style={{ display: "block", marginBottom: "1rem", borderRadius: "50%", border: "4px solid white" }}
                    />
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button className="button-primary" onClick={() => setImage(null)}>
                            Retake Picture
                        </button>
                        <button className="button-primary" onClick={() => setState && setState()}>
                            Continue to Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
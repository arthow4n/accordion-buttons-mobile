import React, { useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export const ImageViewer = ({ imageSrc, initialScale, initialPositionX, initialPositionY, initialRotation, onUpdateSettings }) => {
    const timeoutRef = useRef(null);
    const [rotation, setRotation] = useState(initialRotation || 0);
    const rotationRef = useRef(initialRotation || 0); // Keep ref for callbacks
    const transformRef = useRef({
        scale: initialScale || 1,
        positionX: initialPositionX || 0,
        positionY: initialPositionY || 0
    });
    const startAngleRef = useRef(0);
    const startRotationRef = useRef(0);

    useEffect(() => {
        const rot = initialRotation || 0;
        setRotation(rot);
        rotationRef.current = rot;
    }, [initialRotation]);

    const saveSettings = (scale, x, y, rot) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (onUpdateSettings) {
                onUpdateSettings({
                    imageScale: scale,
                    imagePositionX: x,
                    imagePositionY: y,
                    imageRotation: rot
                });
            }
        }, 500);
    };

    const handleTransform = (ref) => {
        transformRef.current = {
            scale: ref.state.scale,
            positionX: ref.state.positionX,
            positionY: ref.state.positionY
        };
        saveSettings(ref.state.scale, ref.state.positionX, ref.state.positionY, rotationRef.current);
    };

    const getAngle = (touches) => {
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            startAngleRef.current = getAngle(e.touches);
            startRotationRef.current = rotationRef.current;
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            const currentAngle = getAngle(e.touches);
            let angleDiff = currentAngle - startAngleRef.current;

            // Normalize angle diff to [-180, 180]
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;

            const newRotation = startRotationRef.current + angleDiff;
            setRotation(newRotation);
            rotationRef.current = newRotation;

            saveSettings(
                transformRef.current.scale,
                transformRef.current.positionX,
                transformRef.current.positionY,
                newRotation
            );
        }
    };

    return (
        <div
            style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}
            onTouchStartCapture={handleTouchStart}
            onTouchMoveCapture={handleTouchMove}
        >
            <TransformWrapper
                initialScale={initialScale || 1}
                initialPositionX={initialPositionX || 0}
                initialPositionY={initialPositionY || 0}
                minScale={0.5}
                maxScale={8}
                centerOnInit={!initialScale}
                onTransformed={handleTransform}
                wrapperStyle={{ width: "100%", height: "100%" }}
            >
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                    <img
                        src={imageSrc}
                        alt="Music Sheet"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transform: `rotate(${rotation}deg)`
                        }}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

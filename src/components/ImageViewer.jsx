import React, { useRef } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export const ImageViewer = ({ imageSrc, initialScale, initialPositionX, initialPositionY, onUpdateSettings }) => {
    const timeoutRef = useRef(null);

    const handleTransform = (ref) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            if (onUpdateSettings) {
                onUpdateSettings({
                    imageScale: ref.state.scale,
                    imagePositionX: ref.state.positionX,
                    imagePositionY: ref.state.positionY
                });
            }
        }, 500);
    };

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
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
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

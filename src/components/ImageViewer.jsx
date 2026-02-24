import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export const ImageViewer = ({ imageSrc }) => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={8}
                centerOnInit={true}
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

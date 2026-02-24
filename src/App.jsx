import React, { useState, useEffect } from 'react';
import { Accordion } from './components/Accordion';
import { Settings } from './components/Settings';
import { ImageViewer } from './components/ImageViewer';

function App() {
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('accordion-settings');
        // Merge saved settings with defaults to ensure new keys exist
        const defaults = {
            buttonSize: 60,
            rowGap: 10,
            colGap: 10,
            rowOffset: 30, // Half of button size usually
            accidentalType: 'sharp',
            panX: 0,
            panY: 0,
            isLocked: true,
            textRotation: 0,
            volume: 100,
            rotate180: false,
            splitScreenImage: null,
            splitScreenRatio: 0.5,
            splitScreenPosition: 'top'
        };
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    });

    useEffect(() => {
        try {
            localStorage.setItem('accordion-settings', JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings to localStorage:", e);
        }
    }, [settings]);

    const renderContent = () => {
        if (!settings.splitScreenImage) {
            return <Accordion settings={settings} updateSettings={setSettings} />;
        }

        const imageComponent = (
            <div style={{ flex: settings.splitScreenRatio, overflow: 'hidden', position: 'relative' }}>
                <ImageViewer imageSrc={settings.splitScreenImage} />
            </div>
        );

        const accordionComponent = (
            <div style={{ flex: 1 - settings.splitScreenRatio, overflow: 'hidden', position: 'relative' }}>
                <Accordion settings={settings} updateSettings={setSettings} />
            </div>
        );

        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                {settings.splitScreenPosition === 'top' ? (
                    <>
                        {imageComponent}
                        {accordionComponent}
                    </>
                ) : (
                    <>
                        {accordionComponent}
                        {imageComponent}
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {renderContent()}

            <button
                onClick={() => setShowSettings(true)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 50,
                    padding: '10px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    opacity: 0.7
                }}
            >
                ⚙️
            </button>

            {showSettings && (
                <Settings
                    settings={settings}
                    updateSettings={setSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}

export default App;

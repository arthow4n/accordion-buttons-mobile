import React, { useState, useEffect } from 'react';
import { Accordion } from './components/Accordion';
import { Settings } from './components/Settings';

function App() {
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('accordion-settings');
        return saved ? JSON.parse(saved) : {
            buttonSize: 60,
            rowGap: 10,
            colGap: 10,
            rowOffset: 30, // Half of button size usually
            accidentalType: 'sharp'
        };
    });

    useEffect(() => {
        localStorage.setItem('accordion-settings', JSON.stringify(settings));
    }, [settings]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Accordion settings={settings} />

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

import React from 'react';

export const Settings = ({ settings, updateSettings, onClose }) => {
    const handleChange = (key, value) => {
        const parsedValue = key === 'accidentalType' ? value : parseInt(value, 10);
        updateSettings({ ...settings, [key]: parsedValue });
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 100,
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
        }}>
            <h2>Settings</h2>

            <div className="control-group">
                <label>Accidentals:</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            name="accidentalType"
                            value="sharp"
                            checked={settings.accidentalType === 'sharp'}
                            onChange={(e) => handleChange('accidentalType', e.target.value)}
                        />
                        Sharps (#)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            name="accidentalType"
                            value="flat"
                            checked={settings.accidentalType === 'flat'}
                            onChange={(e) => handleChange('accidentalType', e.target.value)}
                        />
                        Flats (b)
                    </label>
                </div>
            </div>

            <div className="control-group">
                <label>Button Size (px): {settings.buttonSize}</label>
                <input
                    type="range"
                    min="30"
                    max="100"
                    value={settings.buttonSize}
                    onChange={(e) => handleChange('buttonSize', e.target.value)}
                />
            </div>

            <div className="control-group">
                <label>Row Gap (px): {settings.rowGap}</label>
                <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.rowGap}
                    onChange={(e) => handleChange('rowGap', e.target.value)}
                />
            </div>

            <div className="control-group">
                <label>Column Gap (px): {settings.colGap}</label>
                <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.colGap}
                    onChange={(e) => handleChange('colGap', e.target.value)}
                />
            </div>

            <div className="control-group">
                <label>Row Offset (px): {settings.rowOffset}</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.rowOffset}
                    onChange={(e) => handleChange('rowOffset', e.target.value)}
                />
            </div>

            <button
                onClick={onClose}
                style={{
                    padding: '15px',
                    backgroundColor: '#ffcd38',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000',
                    marginTop: '20px'
                }}
            >
                Close
            </button>
        </div>
    );
};

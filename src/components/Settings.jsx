import React from 'react';

export const Settings = ({ settings, updateSettings, onClose }) => {
    const handleChange = (key, value) => {
        if (key === 'accidentalType' || key === 'isLocked' || key === 'register' || key === 'rotate180') {
            updateSettings({ ...settings, [key]: value });
            return;
        }
        const parsedValue = parseInt(value, 10);
        updateSettings({ ...settings, [key]: isNaN(parsedValue) ? 0 : parsedValue });
    };

    const handleReset = () => {
        updateSettings({
            ...settings,
            buttonSize: 60,
            rowGap: 10,
            colGap: 10,
            rowOffset: 30,
            accidentalType: 'sharp',
            isLocked: true,
            textRotation: 0,
            volume: 100,
            rotate180: false
        });
    };

    const inputStyle = {
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#fff' }}>Settings</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <button
                onClick={() => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(e => {
                            console.log(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
                        });
                    } else {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        }
                    }
                }}
                style={{
                    padding: '15px',
                    backgroundColor: '#444',
                    border: '1px solid #666',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff',
                    cursor: 'pointer',
                    width: '100%'
                }}
            >
                Go Fullscreen
            </button>

            <div className="control-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2em', color: '#fff' }}>
                    <input
                        type="checkbox"
                        checked={settings.isLocked ?? true}
                        onChange={(e) => handleChange('isLocked', e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Lock Layout
                </label>
                <p style={{ fontSize: '0.8em', color: '#ccc', margin: '5px 0 0 30px' }}>
                    Uncheck to drag and pan the view. Lock to play.
                </p>
            </div>

            <div className="control-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2em', color: '#fff' }}>
                    <input
                        type="checkbox"
                        checked={settings.rotate180 ?? false}
                        onChange={(e) => handleChange('rotate180', e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Rotate 180°
                </label>
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Accidentals:</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', color: '#fff' }}>
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
                <label style={{ color: '#fff' }}>Sound Register</label>
                <select
                    value={settings.register || 'accordion'}
                    onChange={(e) => handleChange('register', e.target.value)}
                    style={{
                        ...inputStyle,
                        backgroundColor: '#333',
                        color: '#fff',
                        border: '1px solid #555'
                    }}
                >
                    <optgroup label="Standard">
                        <option value="accordion">Accordion (Default)</option>
                        <option value="master">Master (LMH)</option>
                        <option value="full_master">Full Master (LMMH)</option>
                    </optgroup>
                    <optgroup label="Single Reed">
                        <option value="clarinet">Clarinet (8')</option>
                        <option value="bassoon">Bassoon (16')</option>
                        <option value="piccolo">Piccolo (4')</option>
                    </optgroup>
                    <optgroup label="Dual Reed">
                        <option value="violin">Violin (MM)</option>
                        <option value="celeste">Celeste (MM Swing)</option>
                        <option value="bandoneon">Bandoneon (LM)</option>
                        <option value="oboe">Oboe (MH)</option>
                        <option value="organ">Organ (LH)</option>
                    </optgroup>
                    <optgroup label="Triple/Quad Reed">
                        <option value="musette">Musette (MMM)</option>
                        <option value="harmonium">Harmonium (LMM)</option>
                    </optgroup>
                </select>
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Button Size (px)</label>
                <input
                    type="number"
                    value={settings.buttonSize}
                    onChange={(e) => handleChange('buttonSize', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Row Gap (px)</label>
                <input
                    type="number"
                    value={settings.rowGap}
                    onChange={(e) => handleChange('rowGap', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Column Gap (px)</label>
                <input
                    type="number"
                    value={settings.colGap}
                    onChange={(e) => handleChange('colGap', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Row Offset (px)</label>
                <input
                    type="number"
                    value={settings.rowOffset}
                    onChange={(e) => handleChange('rowOffset', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Text Rotation (deg)</label>
                <input
                    type="number"
                    value={settings.textRotation || 0}
                    onChange={(e) => handleChange('textRotation', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="control-group">
                <label style={{ color: '#fff' }}>Volume (0-100)</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.volume ?? 100}
                    onChange={(e) => handleChange('volume', e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>

                <button
                    onClick={handleReset}
                    style={{
                        flex: 1,
                        padding: '15px',
                        backgroundColor: '#555',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    Reset
                </button>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        padding: '15px',
                        backgroundColor: '#ffcd38',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000',
                        cursor: 'pointer'
                    }}
                >
                    Done
                </button>
            </div>
        </div>
    );
};

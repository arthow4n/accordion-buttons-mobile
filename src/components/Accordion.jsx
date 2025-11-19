import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateLayout } from '../utils/layout';
import { audio } from '../utils/audio';

export const Accordion = ({ settings, updateSettings }) => {
    const [activeNotes, setActiveNotes] = useState(new Set());
    const containerRef = useRef(null);

    // Store active pointers and which note they are currently triggering
    const pointersRef = useRef(new Map()); // pointerId -> note

    // Panning state
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        initialPanX: 0,
        initialPanY: 0
    });

    const buttons = useMemo(() => {
        return generateLayout(5, 22, 2, settings.accidentalType); // 5 rows, 22 cols, start at C2
    }, [settings.accidentalType]);

    useEffect(() => {
        // Convert 0-100 to 0.0-1.0, but keep max volume reasonable (e.g., 0.5 was original max)
        // The user asked for 0-100. Let's map 100 to 0.5 (original master gain)
        const vol = (settings.volume ?? 100) / 100 * 0.5;
        audio.setVolume(vol);
    }, [settings.volume]);

    useEffect(() => {
        audio.setPreset(settings.register || 'accordion');
    }, [settings.register]);

    const handlePointerDown = (e) => {
        e.preventDefault(); // Prevent scrolling
        audio.init(); // Ensure audio context is resumed

        if (!settings.isLocked) {
            // Start panning
            dragRef.current = {
                isDragging: true,
                startX: e.clientX,
                startY: e.clientY,
                initialPanX: settings.panX || 0,
                initialPanY: settings.panY || 0
            };
            containerRef.current.setPointerCapture(e.pointerId);
            return;
        }

        const note = getNoteFromEvent(e);
        if (note !== null) {
            pointersRef.current.set(e.pointerId, note);
            playNote(note);
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();

        if (!settings.isLocked) {
            if (dragRef.current.isDragging) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;

                updateSettings(prev => ({
                    ...prev,
                    panX: dragRef.current.initialPanX + dx,
                    panY: dragRef.current.initialPanY + dy
                }));
            }
            return;
        }

        // Check if we are tracking this pointer
        if (!pointersRef.current.has(e.pointerId) && e.buttons === 0) return;

        const newNote = getNoteFromEvent(e);
        const oldNote = pointersRef.current.get(e.pointerId);

        if (newNote !== oldNote) {
            if (oldNote !== undefined) {
                stopNote(oldNote, e.pointerId);
            }
            if (newNote !== null) {
                pointersRef.current.set(e.pointerId, newNote);
                playNote(newNote);
            } else {
                pointersRef.current.delete(e.pointerId);
            }
        }
    };

    const handlePointerUp = (e) => {
        e.preventDefault();

        if (!settings.isLocked) {
            if (dragRef.current.isDragging) {
                dragRef.current.isDragging = false;
                containerRef.current.releasePointerCapture(e.pointerId);
            }
            return;
        }

        const note = pointersRef.current.get(e.pointerId);
        if (note !== undefined) {
            stopNote(note, e.pointerId);
            pointersRef.current.delete(e.pointerId);
        }
    };

    const getNoteFromEvent = (e) => {
        // We use document.elementFromPoint to find the target under the finger
        // because the event target might be the container if we moved quickly.
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.dataset.note) {
            return parseInt(element.dataset.note, 10);
        }
        return null;
    };

    const playNote = (note) => {
        // Check if note is already active (by another pointer?)
        // We count how many pointers are pressing this note?
        // For simplicity, just add to set.

        // Find frequency
        const btn = buttons.find(b => b.note === note);
        if (btn) {
            audio.play(note, btn.frequency);
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.add(note);
                return newSet;
            });
        }
    };

    const stopNote = (note, pointerId) => {
        // Check if any OTHER pointer is still holding this note
        let stillHeld = false;
        for (const [pid, n] of pointersRef.current.entries()) {
            if (pid !== pointerId && n === note) {
                stillHeld = true;
                break;
            }
        }

        if (!stillHeld) {
            audio.stop(note);
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(note);
                return newSet;
            });
        }
    };

    // Calculate container style based on settings
    // We need to position buttons absolutely or using grid?
    // Absolute positioning is easier for the specific staggered layout.

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                backgroundColor: '#222',
                cursor: !settings.isLocked ? 'grab' : 'default'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: `translate(${settings.panX || 0}px, ${settings.panY || 0}px)`,
                transition: !settings.isLocked && dragRef.current.isDragging ? 'none' : 'transform 0.1s ease-out',
                pointerEvents: !settings.isLocked ? 'none' : 'auto' // Disable button interaction when panning
            }}>
                {buttons.map(btn => {
                    // Layout calculation
                    // boardRow (0..4) -> X axis
                    // boardCol (0..12) -> Y axis

                    // X position: row index * (size + gap)
                    // We might want to center the whole board or start from left.
                    // Let's add some padding.
                    const left = 20 + btn.boardRow * (settings.buttonSize + settings.colGap);

                    // Y position: col index * (size + gap) + (row offset)
                    // We use settings.rowOffset to shift adjacent rows.
                    // Usually Row 1 is shifted down by half size relative to Row 0.
                    // So shift = boardRow * settings.rowOffset
                    let top = 50 + btn.boardCol * (settings.buttonSize + settings.rowGap) + (btn.boardRow * settings.rowOffset);

                    // Shift 4th and 5th rows (indices 3 and 4) up by one button step to align with 1st and 2nd rows
                    if (btn.boardRow >= 3) {
                        top -= (2 * settings.rowOffset);
                    }

                    const isActive = activeNotes.has(btn.note);

                    return (
                        <div
                            key={btn.id}
                            data-note={btn.note}
                            style={{
                                position: 'absolute',
                                top: `${top}px`,
                                left: `${left}px`,
                                width: `${settings.buttonSize}px`,
                                height: `${settings.buttonSize}px`,
                                borderRadius: '50%',
                                backgroundColor: isActive
                                    ? 'var(--button-active)'
                                    : (btn.isBlack ? 'var(--button-black)' : 'var(--button-white)'),
                                border: '2px solid #555',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive ? '#000' : (btn.isBlack ? '#fff' : '#000'),
                                fontWeight: 'bold',
                                fontSize: `${settings.buttonSize * 0.35}px`,
                                userSelect: 'none',
                                boxShadow: isActive ? '0 0 15px var(--button-active)' : '2px 2px 5px rgba(0,0,0,0.5)',
                                transform: isActive ? 'scale(0.95)' : 'scale(1)',
                                transition: 'transform 0.05s, background-color 0.05s',
                                zIndex: 10,
                                pointerEvents: 'auto'
                            }}
                        >
                            <span style={{
                                transform: `rotate(${settings.textRotation || 0}deg)`,
                                display: 'inline-block',
                                pointerEvents: 'none'
                            }}>
                                {btn.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

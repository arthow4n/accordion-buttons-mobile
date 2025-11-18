import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateLayout } from '../utils/layout';
import { audio } from '../utils/audio';

export const Accordion = ({ settings }) => {
    const [activeNotes, setActiveNotes] = useState(new Set());
    const containerRef = useRef(null);

    // Store active pointers and which note they are currently triggering
    const pointersRef = useRef(new Map()); // pointerId -> note

    const buttons = useMemo(() => {
        return generateLayout(5, 14, 3); // 5 rows, 14 cols, start at C3
    }, []);

    const handlePointerDown = (e) => {
        e.preventDefault(); // Prevent scrolling
        audio.init(); // Ensure audio context is resumed

        const note = getNoteFromEvent(e);
        if (note !== null) {
            pointersRef.current.set(e.pointerId, note);
            playNote(note);
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();

        // If this pointer is not tracked (e.g. started outside), ignore or start tracking?
        // Usually better to track if buttons are pressed.
        // But for glissando, we want to track movement.

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
                backgroundColor: '#222'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
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
                const top = 50 + btn.boardCol * (settings.buttonSize + settings.rowGap) + (btn.boardRow * settings.rowOffset);

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
                            zIndex: 10
                        }}
                    >
                        {btn.label}
                    </div>
                );
            })}
        </div>
    );
};

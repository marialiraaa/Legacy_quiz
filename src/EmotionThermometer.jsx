import React from 'react';
import './EmotionThermometer.css';

const EMOTION_LEVELS = [
    { score: 5, emoji: '😄', label: 'Tranquilo', color: '#1b5e20', bg: '#e8f5e9' },
    { score: 4, emoji: '🤔', label: 'Curioso', color: '#2e7d32', bg: '#f1f8e9' },
    { score: 3, emoji: '😐', label: 'Neutro', color: '#f57f17', bg: '#fffde7' },
    { score: 2, emoji: '😟', label: 'Preocupado', color: '#ef6c00', bg: '#fff3e0' },
    { score: 1, emoji: '😰', label: 'Desconfortável', color: '#c62828', bg: '#ffebee' },
];

export default function EmotionThermometer({ selectedEmotion, onSelectEmotion }) {
    const handleSelect = (item) => {
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        onSelectEmotion({
            emotionScore: item.score,
            emotionLabel: item.label,
        });
    };

    return (
        <div className="emotion-container">
            <p className="emotion-title">Como você se sente sobre isso?</p>
            <div className="emotion-row">
                {EMOTION_LEVELS.map((item) => {
                    const isSelected = selectedEmotion?.emotionScore === item.score;
                    const hasSelection = Boolean(selectedEmotion);

                    return (
                        <button
                            key={item.score}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className={`emotion-btn ${isSelected ? 'selected' : ''} ${hasSelection && !isSelected ? 'dimmed' : ''
                                }`}
                            style={{
                                borderColor: isSelected ? item.color : '#e0e0e0',
                                backgroundColor: isSelected ? item.bg : '#ffffff',
                            }}
                            aria-label={`${item.label} (Nota ${item.score})`}
                        >
                            <span className="emotion-emoji">{item.emoji}</span>
                            <span
                                className="emotion-label"
                                style={{ color: isSelected ? item.color : '#555' }}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
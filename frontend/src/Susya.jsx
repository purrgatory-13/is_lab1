import React from 'react';

export default function Susya({ onBack }) {
    return (
        <div>
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px'}}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
                ← Назад
            </button>
        </div>
    );
}
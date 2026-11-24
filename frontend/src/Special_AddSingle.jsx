import {useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import { apiFetch } from './api.js';

export default function Special_AddSingle({isOpen, onClose }) {
    const [bandId, setBandId] = useState('');
    const [band, setBand] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setBandId('');
            setBand(null);
        }
    }, [isOpen]);

    const handleFetchBand = () => {
        if (!bandId) {
            toast.warn("Введите ID группы");
            return;
        }

        apiFetch(`/bands/${bandId}`)
            .then(res => {
                if (!res.ok) throw new Error("Группа с таким ID не найдена");
                return res.json();
            })
            .then(data => {
                setBand(data);
            })
            .catch(err => {
                toast.error(err.message);
                setBand(null);
            });
    };

    const handleConfirm = () => {
        apiFetch(`/bands/${bandId}/addSingle`, {
            method: 'POST',
        })
            .then(res => {
                if (!res.ok) throw new Error("Не удалось добавить сингл");
                toast.success(`Сингл добавлен`);
                onClose();
            })
            .catch(err => toast.error(err.message));
    };

    if (!isOpen) return null;

    return (
        <div>
            <div>
                <h2>Добавление сингла</h2>

                <div style={{ margin: '15px 0' }}>
                    <label>ID группы: </label>
                    <input
                        type="number"
                        value={bandId}
                        onChange={(e) => setBandId(e.target.value)}
                    />
                    <button onClick={handleFetchBand} style={{ marginLeft: '10px' }}>Найти</button>
                </div>

                {band && (
                    <div>
                        <p><strong>Название:</strong> {band.name}</p>
                        <p><strong>Жанр:</strong> {band.genre}</p>
                        <p><strong>Текущих синглов:</strong> {band.singlesCount}</p>
                        <p>Сюда?</p>
                    </div>
                )}

                <div>
                    <button onClick={onClose}>Закрыть</button>
                    {band && (
                        <button onClick={handleConfirm}>
                            Добавить
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
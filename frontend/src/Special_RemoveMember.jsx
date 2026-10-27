import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function Special_RemoveMember({ isOpen, onClose }) {
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

        fetch(`http://localhost:8080/is_lab1/bands/${bandId}`)
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

    const handleConfirm = async () => {
        try {
            const res = await fetch(`http://localhost:8080/is_lab1/bands/${bandId}/removeMember`, {
                method: 'POST',
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Не удалось удалить участника");
            }

            toast.success("Участник удален из группы");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div>
            <div>
                <h2>Удаление участника из группы</h2>

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
                        <p><strong>Текущих участников:</strong> {band.numberOfParticipants}</p>
                        <p>Удалить участника отсюда?</p>
                    </div>
                )}

                <div>
                    <button onClick={onClose}>Закрыть</button>
                    {band && (
                        <button onClick={handleConfirm}>
                            Удалить участника
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
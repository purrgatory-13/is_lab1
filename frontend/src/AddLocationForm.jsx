import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiFetch } from './api.js';

export default function AddLocationForm({ onClose }) {
    const [formData, setFormData] = useState({
        x: '',
        y: '',
        z: '',
        name: ''
    });

    const CloseForm = () => {
        toast.error("Данные не сохранены");
        onClose();
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    const SubmitLocation = async () => {
        try {
            const payload = {
                x: Number(formData.x),
                y: Number(formData.y),
                z: Number(formData.z),
                name: formData.name || null
            };

            const response = await apiFetch('/locations', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при сохранении локации');
            }

            toast.success("Локация успешно добавлена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
            <h2>Добавить локацию</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginBottom: '15px' }}>
                <div>
                    <label>X: </label>
                    <input
                        type="number"
                        name="x"
                        value={formData.x}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Y: </label>
                    <input
                        type="number"
                        step="any"
                        name="y"
                        value={formData.y}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Z: </label>
                    <input
                        type="number"
                        name="z"
                        value={formData.z}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Название: </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={SubmitLocation}>Добавить</button>
                <button type="button" onClick={CloseForm}>Закрыть</button>
            </div>
        </div>
    );
}
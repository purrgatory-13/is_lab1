import { toast } from "react-toastify";
import { useState } from "react";
import { apiFetch } from "./api.js";

export default function AddAlbumForm({ onClose }) {
    const CloseForm = () => {
        toast.error("Данные не сохранены");
        onClose();
    };

    const [formData, setFormData] = useState({
        name: '',
        tracks: '',
        sales: ''
    });

    const [errors, setErrors] = useState({});

    function blockNonDigitsKeyDown(e) {
        if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
            e.preventDefault();
        }
    }

    function validate(data) {
        const nextErrors = {};

        if (!data.name || !data.name.trim()) {
            nextErrors.name = "Поле обязательно: укажите название альбома";
        }

        const tracksNum = Number(data.tracks);
        if (data.tracks === '' || !Number.isInteger(tracksNum) || tracksNum <= 0) {
            nextErrors.tracks = "Поле обязательно: введите целое число треков больше 0";
        }

        const salesNum = Number(data.sales);
        if (data.sales === '' || !Number.isInteger(salesNum) || salesNum <= 0) {
            nextErrors.sales = "Поле обязательно: введите целое число продаж больше 0";
        }

        return nextErrors;
    }

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === 'tracks' || name === 'sales') {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
    }

    const SubmitAlbum = async () => {
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.warn("Проверьте обязательные поля");
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                tracks: Number(formData.tracks),
                sales: Number(formData.sales)
            };

            const response = await apiFetch('/albums', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при сохранении альбома');
            }

            toast.success("Альбом успешно добавлен!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div>
            <div>
                <h1>Добавить альбом</h1>
                <p style={{ fontSize: '13px', color: '#666' }}>
                    Поля со звёздочкой (<strong>*</strong>) обязательны. В треки и продажи можно ввести только целые числа без знаков и дробей.
                </p>
                <button type="button" onClick={CloseForm}>Закрыть</button>

                <div>
                    <label>Название <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.name}</div>
                    )}
                </div>

                <div>
                    <label>Треки <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="tracks"
                        value={formData.tracks}
                        onKeyDown={blockNonDigitsKeyDown}
                        onChange={handleChange}
                    />
                    {errors.tracks && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.tracks}</div>
                    )}
                </div>

                <div>
                    <label>Продажи <span style={{ color: 'red' }}>*</span>:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="sales"
                        value={formData.sales}
                        onKeyDown={blockNonDigitsKeyDown}
                        onChange={handleChange}
                    />
                    {errors.sales && (
                        <div style={{ color: 'crimson', fontSize: '13px' }}>{errors.sales}</div>
                    )}
                </div>
            </div>

            {hasErrors && (
                <div style={{ color: 'crimson', marginTop: '10px', fontSize: '13px' }}>
                    Нельзя сохранить альбом, пока есть незаполненные или некорректные поля.
                </div>
            )}

            <div style={{ marginTop: '10px' }}>
                <button type="button" onClick={SubmitAlbum}>Добавить</button>
            </div>
        </div>
    );
}
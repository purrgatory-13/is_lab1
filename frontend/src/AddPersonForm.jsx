import { useState } from 'react';
import { toast } from 'react-toastify';

export default function AddPersonForm({ onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        eyeColor: 'GREEN',
        hairColor: 'GREEN',
        height: '',
        passportID: '',

        createNewLocation: false,
        locationId: '',
        newLocationX: '',
        newLocationY: '',
        newLocationZ: '',
        newLocationName: ''
    });

    const CloseForm = () => {
        toast.error("Данные не сохранены");
        onClose();
    };

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const SubmitPerson = async () => {
        try {
            const locationObj = formData.createNewLocation
                ? {
                    x: Number(formData.newLocationX),
                    y: Number(formData.newLocationY),
                    z: Number(formData.newLocationZ),
                    name: formData.newLocationName || null
                }
                : { id: Number(formData.locationId) };

            const payload = {
                name: formData.name,
                eyeColor: formData.eyeColor || null,
                hairColor: formData.hairColor || null,
                height: Number(formData.height),
                passportID: formData.passportID,
                location: locationObj
            };

            const response = await fetch('http://localhost:8080/is_lab1/person', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при сохранении персоны');
            }

            toast.success("Персона успешно добавлена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
            <h2>Добавить персону</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px', marginBottom: '15px' }}>
                <div>
                    <label>Имя: </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Цвет глаз: </label>
                    <select name="eyeColor" value={formData.eyeColor} onChange={handleChange}>
                        <option value="GREEN">GREEN</option>
                        <option value="RED">RED</option>
                        <option value="BLACK">BLACK</option>
                        <option value="BLUE">BLUE</option>
                        <option value="BROWN">BROWN</option>
                    </select>
                </div>
                <div>
                    <label>Цвет волос: </label>
                    <select name="hairColor" value={formData.hairColor} onChange={handleChange}>
                        <option value="GREEN">GREEN</option>
                        <option value="RED">RED</option>
                        <option value="BLACK">BLACK</option>
                        <option value="BLUE">BLUE</option>
                        <option value="BROWN">BROWN</option>
                    </select>
                </div>
                <div>
                    <label>Рост: </label>
                    <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Паспорт ID: </label>
                    <input
                        type="text"
                        name="passportID"
                        value={formData.passportID}
                        onChange={handleChange}
                    />
                </div>

                {/* ЛОКАЦИЯ ПЕРСОНЫ */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                    <div>
                        <label>Создать новую локацию?</label>
                        <input
                            type="checkbox"
                            name="createNewLocation"
                            checked={formData.createNewLocation}
                            onChange={handleChange}
                        />
                    </div>

                    {!formData.createNewLocation ? (
                        <div style={{ marginTop: '5px' }}>
                            <label>ID существующей локации: </label>
                            <input
                                type="number"
                                name="locationId"
                                value={formData.locationId}
                                onChange={handleChange}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                            <input type="number" name="newLocationX" placeholder="X" value={formData.newLocationX} onChange={handleChange} />
                            <input type="number" step="any" name="newLocationY" placeholder="Y" value={formData.newLocationY} onChange={handleChange} />
                            <input type="number" name="newLocationZ" placeholder="Z" value={formData.newLocationZ} onChange={handleChange} />
                            <input type="text" name="newLocationName" placeholder="Название локации" value={formData.newLocationName} onChange={handleChange} />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={SubmitPerson}>Добавить</button>
                <button type="button" onClick={CloseForm}>Закрыть</button>
            </div>
        </div>
    );
}
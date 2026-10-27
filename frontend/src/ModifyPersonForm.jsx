import {toast} from "react-toastify";
import {useState, useEffect} from "react";

export default function ModifyPersonForm({ personId, onClose }) {
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

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!personId) return;

        fetch(`http://localhost:8080/is_lab1/person/${personId}`)
            .then(res => {
                if (!res.ok) throw new Error("Не удалось загрузить данные персоны");
                return res.json();
            })
            .then(data => {
                setFormData({
                    name: data.name || '',
                    eyeColor: data.eyeColor || 'GREEN',
                    hairColor: data.hairColor || 'GREEN',
                    height: data.height ?? '',
                    passportID: data.passportID || '',

                    createNewLocation: false,
                    locationId: data.location?.id || '',
                    newLocationX: '',
                    newLocationY: '',
                    newLocationZ: '',
                    newLocationName: ''
                });
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.message);
                setLoading(false);
            });
    }, [personId]);

    const CloseForm = () => {
        toast.info("Изменения не сохранены");
        onClose();
    };

    const SubmitPerson = async () => {
        try {
            let locationObj = null;
            if (formData.createNewLocation) {
                locationObj = {
                    x: Number(formData.newLocationX),
                    y: Number(formData.newLocationY),
                    z: Number(formData.newLocationZ),
                    name: formData.newLocationName || null
                };
            } else {
                locationObj = { id: Number(formData.locationId) };
            }

            const payload = {
                name: formData.name,
                eyeColor: formData.eyeColor || null,
                hairColor: formData.hairColor || null,
                height: Number(formData.height),
                passportID: formData.passportID,
                location: locationObj
            };

            const response = await fetch(`http://localhost:8080/is_lab1/person/${personId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Ошибка при обновлении персоны');
            }

            toast.success("Персона успешно изменена!");
            onClose();
        } catch (err) {
            toast.error(err.message);
        }
    };

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    if (loading) {
        return <div>Загрузка данных персоны...</div>;
    }

    return (
        <div>
            <div className="ModifyFormDiv">
                <h2>Изменить персону (ID: {personId})</h2>
                <button onClick={CloseForm}>Закрыть</button>
                <div>
                    <label>Имя:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div>
                    <label>Цвет глаз:</label>
                    <select name="eyeColor" value={formData.eyeColor} onChange={handleChange}>
                        <option value="GREEN">GREEN</option>
                        <option value="RED">RED</option>
                        <option value="BLACK">BLACK</option>
                        <option value="BLUE">BLUE</option>
                        <option value="BROWN">BROWN</option>
                    </select>
                </div>
                <div>
                    <label>Цвет волос:</label>
                    <select name="hairColor" value={formData.hairColor} onChange={handleChange}>
                        <option value="GREEN">GREEN</option>
                        <option value="RED">RED</option>
                        <option value="BLACK">BLACK</option>
                        <option value="BLUE">BLUE</option>
                        <option value="BROWN">BROWN</option>
                    </select>
                </div>
                <div>
                    <label>Рост:</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} />
                </div>
                <div>
                    <label>Паспорт ID:</label>
                    <input type="text" name="passportID" value={formData.passportID} onChange={handleChange} />
                </div>

                {/* Локация */}
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
                    <div>
                        <label>ID существующей локации:</label>
                        <input type="number" name="locationId" value={formData.locationId} onChange={handleChange} />
                    </div>
                ) : (
                    <div>
                        <input type="number" name="newLocationX" placeholder="X" value={formData.newLocationX} onChange={handleChange} />
                        <input type="number" name="newLocationY" placeholder="Y" value={formData.newLocationY} onChange={handleChange} />
                        <input type="number" name="newLocationZ" placeholder="Z" value={formData.newLocationZ} onChange={handleChange} />
                        <input type="text" name="newLocationName" placeholder="Название локации" value={formData.newLocationName} onChange={handleChange} />
                    </div>
                )}
            </div>
            <div>
                <button onClick={SubmitPerson}>Подтвердить изменения</button>
            </div>
        </div>
    );
}
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function AuthForm({ onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.warn("Заполните все поля!");
            return;
        }

        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

        fetch(`http://localhost:8080/is_lab1${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // <--- ВАЖНО для приема кук
            body: JSON.stringify({ username, password })
        })
            .then(async res => {
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Ошибка авторизации");
                }
                return isLoginMode ? res.json() : res.text();
            })
            .then(() => {
                toast.success(isLoginMode ? "Успешный вход!" : "Регистрация успешна! Теперь войдите.");
                if (isLoginMode) {
                    onLoginSuccess(username); // Больше нет localStorage.setItem
                } else {
                    setIsLoginMode(true);
                }
            })
            .catch(err => {
                toast.error(err.message);
            });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f4f4f4'
        }}>
            <form onSubmit={handleSubmit} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                width: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>
                    {isLoginMode ? 'Вход' : 'Регистрация'}
                </h2>

                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '8px', fontSize: '14px' }}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '8px', fontSize: '14px' }}
                />

                <button type="submit" style={{
                    padding: '10px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}>
                    {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}
                >
                    {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
            </form>
        </div>
    );
}
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
            credentials: 'include',
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
                    onLoginSuccess(username);
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
            minHeight: '100svh',
            width: '100%'
        }}>
            <form onSubmit={handleSubmit} style={{
                width: '320px',
                maxWidth: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
                    {isLoginMode ? 'Вход' : 'Регистрация'}
                </h2>

                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                >
                    {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
            </form>
        </div>
    );
}
export default function Header({ onNavigate }) {

    const ToMainButton = () => {
        onNavigate('main');
    };

    const SpecialButton = () => {
        onNavigate('special');
    };

    return(
        <div>
            <h1>Лабораторная №1</h1>
            <h3>Вариант 12412</h3>
            <div>
                <button onClick={ToMainButton}>Группы</button>
                <button onClick={() => onNavigate('persons')}>Музыканты</button>
                <button onClick={() => onNavigate('albums')}>Альбомы</button>
                <button onClick={() => onNavigate('locations')}>Локации</button>
                <button onClick={SpecialButton}>Специальное</button>
            </div>
        </div>
    );
}
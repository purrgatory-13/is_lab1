import { useState, useEffect } from 'react'
import './App.css'
import Header from "./Header";
import BandTable from "./BandTable.jsx";
import LocationTable from "./LocationTable.jsx";
import PersonTable from "./PersonTable.jsx";
import AlbumTable from "./AlbumTable.jsx";
import Footer from './Footer'
import {ToastContainer} from "react-toastify";
import AddBandForm from "./AddBandForm.jsx";
import AddAlbumForm from "./AddAlbumForm.jsx";
import AddLocationForm from "./AddLocationForm.jsx";
import AddPersonForm from "./AddPersonForm.jsx";
import ModifyBandForm from "./ModifyBandForm.jsx";
import ModifyAlbumForm from "./ModifyAlbumForm.jsx";
import ModifyLocationForm from "./ModifyLocationForm.jsx";
import ModifyPersonForm from "./ModifyPersonForm.jsx";
import Special from "./Special.jsx";
import AuthForm from './AuthForm.jsx';
import Susya from './Susya.jsx';

function App() {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('main');
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isAddAlbumFormOpen, setIsAddAlbumFormOpen] = useState(false);
    const [isAddLocationFormOpen, setIsAddLocationFormOpen] = useState(false);
    const [isAddPersonFormOpen, setIsAddPersonFormOpen] = useState(false);
    const [selectedBandId, setSelectedBandId] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    useEffect(() => {
        const savedUser = getCookie('username');
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const handleLogout = () => {
        fetch('http://localhost:8080/is_lab1/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).finally(() => {
            setUser(null);
        });
    };

    if (!user) {
        return (
            <>
                <AuthForm onLoginSuccess={(username) => setUser(username)} />
                <ToastContainer position="top-right" autoClose={1000} />
            </>
        );
    }

    if (currentPage === 'syusa') {
        return <Susya onBack={() => setCurrentPage('special')} />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px', margin: '10px 0', flexDirection: 'row' }}>
                <span>Авторизован как: <strong>{user}</strong></span>
                <button onClick={handleLogout} style={{ padding: '4px 10px', cursor: 'pointer' }}>
                    Выйти
                </button>
            </div>

            <Header
                onNavigate={setCurrentPage}
                onOpenModifyForm={() => {}} />

            {currentPage === 'main' && <BandTable
                onOpenAddForm={() => setIsAddFormOpen(true)}
                onOpenModifyForm={(id) => setSelectedBandId(id)} />}

            {currentPage === 'locations' && <LocationTable
                onOpenAddLocationForm={() => setIsAddLocationFormOpen(true)}
                onOpenModifyLocationForm={(id) => setSelectedLocationId(id)} />}

            {currentPage === 'persons' && (
                <PersonTable
                    onOpenAddPersonForm={() => setIsAddPersonFormOpen(true)}
                    onOpenModifyPersonForm={(id) => setSelectedPersonId(id)}
                />
            )}

            {currentPage === 'albums' && (
                <AlbumTable
                    onOpenAddAlbumForm={() => setIsAddAlbumFormOpen(true)}
                    onOpenModifyAlbumForm={(id) => setSelectedAlbumId(id)}
                />
            )}

            {isAddFormOpen && <AddBandForm onClose={() => setIsAddFormOpen(false)} />}
            {isAddAlbumFormOpen && <AddAlbumForm onClose={() => setIsAddAlbumFormOpen(false)} />}
            {isAddLocationFormOpen && <AddLocationForm onClose={() => setIsAddLocationFormOpen(false)} />}
            {isAddPersonFormOpen && <AddPersonForm onClose={() => setIsAddPersonFormOpen(false)} />}

            {selectedBandId && (
                <ModifyBandForm
                    bandId={selectedBandId}
                    onClose={() => setSelectedBandId(null)}
                />
            )}

            {selectedLocationId && (
                <ModifyLocationForm
                    locationId={selectedLocationId}
                    onClose={() => setSelectedLocationId(null)}
                />
            )}

            {selectedAlbumId && (
                <ModifyAlbumForm
                    albumId={selectedAlbumId}
                    onClose={() => setSelectedAlbumId(null)}
                />
            )}

            {selectedPersonId && (
                <ModifyPersonForm
                    personId={selectedPersonId}
                    onClose={() => setSelectedPersonId(null)}
                />
            )}

            {currentPage === 'special' && (
                <Special
                    onOpenModifyForm={(id) => setSelectedBandId(id)}
                    onNavigate={setCurrentPage}
                />
            )}

            <ToastContainer position="top-right" autoClose={1000} />
            <Footer />
        </div>
    );
}

export default App
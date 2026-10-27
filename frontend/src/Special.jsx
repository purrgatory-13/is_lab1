import { useState } from 'react';
import { toast } from 'react-toastify';
import Special_AddSingle from "./Special_AddSingle.jsx";
import Special_RemoveMember from "./Special_RemoveMember.jsx";
import Special_SubstrSearch from "./Special_SubstrSearch.jsx";
import Special_FrontmanLowerThan from "./Special_FrontmanLowerThan.jsx";

export default function Special({ onOpenModifyForm, onNavigate }) { // <--- Добавили onNavigate
    const [isAddSingleOpen, setIsAddSingleOpen] = useState(false);
    const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false);
    const [isSubstrSearchOpen, setIsSubstrSearchOpen] = useState(false);
    const [isFrontManLowerOpen, setIsFrontManLowerOpen] = useState(false);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Специальные операции</h1>
            <p>(не военные)</p>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <div>
                    <button name={"substrSearch"} onClick={() => setIsSubstrSearchOpen(true)}>Поиск по подстроке</button>
                </div>
                <div>
                    <button name={"frontManLower"} onClick={() => setIsFrontManLowerOpen(true)}>У кого фронтмен меньше</button>
                </div>
                <div>
                    <button name={"addSingle"} onClick={() => setIsAddSingleOpen(true)}>Добавить сингл</button>
                </div>
                <div>
                    <button name={"deleteParticipant"} onClick={() => setIsRemoveMemberOpen(true)}>Снести участника</button>
                </div>
                <div>
                    <button name={"SUSYA"} onClick={() => onNavigate('syusa')}>Сюся</button> {/* <--- Переключаем на syusa */}
                </div>
            </div>

            <Special_AddSingle
                isOpen={isAddSingleOpen}
                onClose={() => setIsAddSingleOpen(false)}
            />

            <Special_RemoveMember
                isOpen={isRemoveMemberOpen}
                onClose={() => setIsRemoveMemberOpen(false)}
            />

            <Special_SubstrSearch
                isOpen={isSubstrSearchOpen}
                onClose={() => setIsSubstrSearchOpen(false)}
                onOpenModifyForm={onOpenModifyForm}
            />

            <Special_FrontmanLowerThan
                isOpen={isFrontManLowerOpen}
                onClose={() => setIsFrontManLowerOpen(false)}
                onOpenModifyForm={onOpenModifyForm}
            />
        </div>
    );
}
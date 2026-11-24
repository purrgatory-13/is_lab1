package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.example.entities.MusicBand;

import java.util.List;


@ApplicationScoped
@Transactional
public class MusicBandService {
    @Inject
    MusicBandDao dao;

    public void create(MusicBand mb){
        dao.create(mb);
    }

    public void update(MusicBand mb){
        dao.update(mb);
    }

    public MusicBand findById(int id){
        return dao.findById(id);
    }

    public List<MusicBand> findAll(){
        return dao.findAll();
    }

    public void remove(int id) {
        MusicBand band = dao.findById(id);
        if (band == null) {
            throw new IllegalArgumentException("Музыкальная группа для удаления не найдена");
        }

        dao.remove(id);
    }


    //Вернуть массив объектов, значение поля name которых содержит заданную подстроку.
    public List<MusicBand> findNameSubstr(String str){
        return dao.findNameSubstr(str);
    }

    //Вернуть массив объектов, значение поля frontMan которых меньше заданного.
    //(считаем что речь про айдишку)
    public List<MusicBand> frontManLowerThan(int number){
        return dao.frontManLowerThan(number);
    }

    //Вернуть количество объектов, значение поля albumsCount которых равно заданному.
    public Long countByAlbumCount(int count){
        return dao.countByAlbumsCount(count);
    }


    //Добавить новый сингл указанной группе.
    public void addNewSingle(int id){
        MusicBand band = dao.findById(id);
        if (band == null) {
            throw new IllegalArgumentException("Музыкальная группа не найдена");
        }
        
        dao.incrementSingle(id);
    }
    //Удалить из группы участника.
    public void removeMember(int id){
        MusicBand band = dao.findById(id);
        if (band == null) {
            throw new IllegalArgumentException("Музыкальная группа не найдена");
        }
        if (band.getNumberOfParticipants() <= 1) {
            throw new IllegalStateException("В группе должен быть хотя бы один участник");
        }
        dao.decrementMember(id);
    }

    public List<MusicBand> findPage(int page, int size) {
        return dao.findPage(page, size);
    }

    public long countAll() {
        return dao.countAll();
    }

    public List<MusicBand> findFilteredPage(String filterField, String filterValue, int page, int size) {
        return dao.findFilteredPage(filterField, filterValue, page, size);
    }

    public long countFiltered(String filterField, String filterValue) {
        return dao.countFiltered(filterField, filterValue);
    }
}

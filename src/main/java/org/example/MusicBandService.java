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

    public void updateBandData(int id, MusicBand incoming) {
        dao.updateBandData(id, incoming);
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

        if (band.getBestAlbum() != null || band.getFrontMan() != null) {
            throw new IllegalStateException("Нельзя удалить музыкальную группу, с ней связан альбом или фронтмен");
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
        dao.incrementSingle(id);
    }
    //Удалить из группы участника.
    public void removeMember(int id){
        dao.decrementMember(id);
    }
}

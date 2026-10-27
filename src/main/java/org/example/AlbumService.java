package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.example.entities.Album;

import java.util.List;

@ApplicationScoped
@Transactional
public class AlbumService {
    @Inject
    AlbumDao dao;

    public void create(Album a) {
        dao.create(a);
    }

    public void update(Album a) {
        dao.update(a);
    }

    public Album findById(int id) {
        return dao.findById(id);
    }

    public List<Album> findAll() {
        return dao.findAll();
    }

    public void remove(int id) {
        Album album = dao.findById(id);
        if (album == null) {
            throw new IllegalArgumentException("Альбом для удаления не найден");
        }
        if (dao.isReferencedByBands(id)) {
            throw new IllegalStateException("Нельзя удалить альбом, тк на него ссылается музыкальная группа");
        }
        dao.remove(id);
    }

    public List<Album> findNameSubstr(String str) {
        return dao.findNameSubstr(str);
    }
}
package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Album;

import java.util.List;

@ApplicationScoped
public class AlbumDao {

    @PersistenceContext
    EntityManager em;

    public void create(Album a) {
        em.persist(a);
    }

    public void update(Album a) {
        em.merge(a);
    }

    public Album findById(int id) {
        return em.find(Album.class, id);
    }

    public List<Album> findAll() {
        return em.createQuery("SELECT a FROM Album a", Album.class).getResultList();
    }

    public void remove(int id) {
        Album a = em.find(Album.class, id);
        if (a != null) {
            em.remove(a);
        }
    }

    public boolean isReferencedByBands(int albumId) {
        Long count = em.createQuery("SELECT COUNT(b) FROM MusicBand b WHERE b.bestAlbum.id = :id", Long.class)
                .setParameter("id", albumId)
                .getSingleResult();
        return count > 0;
    }

    public List<Album> findNameSubstr(String str) {
        return em.createQuery("SELECT a FROM Album a WHERE LOWER(a.name) LIKE LOWER(:searchPattern)")
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }
}
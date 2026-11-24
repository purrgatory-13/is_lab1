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
        return em.createQuery("SELECT a FROM Album a WHERE LOWER(a.name) LIKE LOWER(:searchPattern)", Album.class)
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }

    public List<Album> findPage(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        return em.createQuery("SELECT a FROM Album a ORDER BY a.id ASC", Album.class)
                .setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countAll() {
        return em.createQuery("SELECT COUNT(a) FROM Album a", Long.class)
                .getSingleResult();
    }

    public List<Album> findFilteredPage(String filterField, String filterValue, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        StringBuilder jpql = new StringBuilder("SELECT a FROM Album a WHERE 1=1");
        String expr = resolveStringFilterExpression(filterField);
        boolean hasFilter = expr != null && filterValue != null && !filterValue.isEmpty();

        if (hasFilter) {
            jpql.append(" AND ").append(expr).append(" = :filterValue");
        }
        jpql.append(" ORDER BY a.id ASC");

        var query = em.createQuery(jpql.toString(), Album.class);
        if (hasFilter) {
            query.setParameter("filterValue", filterValue);
        }
        return query.setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countFiltered(String filterField, String filterValue) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(a) FROM Album a WHERE 1=1");
        String expr = resolveStringFilterExpression(filterField);
        boolean hasFilter = expr != null && filterValue != null && !filterValue.isEmpty();

        if (hasFilter) {
            jpql.append(" AND ").append(expr).append(" = :filterValue");
        }

        var query = em.createQuery(jpql.toString(), Long.class);
        if (hasFilter) {
            query.setParameter("filterValue", filterValue);
        }
        return query.getSingleResult();
    }

    private String resolveStringFilterExpression(String field) {
        if (field == null) return null;
        return switch (field) {
            case "name" -> "a.name";
            default -> null;
        };
    }
}
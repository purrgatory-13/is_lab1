package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Location;

import java.util.List;

@ApplicationScoped
public class LocationDao {

    @PersistenceContext
    EntityManager em;

    public void create(Location l) {
        em.persist(l);
    }

    public void update(Location l) {
        em.merge(l);
    }

    public Location findById(int id) {
        return em.find(Location.class, id);
    }

    public List<Location> findAll() {
        return em.createQuery("SELECT l FROM Location l", Location.class).getResultList();
    }

    public void remove(int id) {
        Location l = em.find(Location.class, id);
        if (l != null) {
            em.remove(l);
        }
    }

    public boolean isReferencedByPersons(int locationId) {
        Long count = em.createQuery("SELECT COUNT(p) FROM Person p WHERE p.location.id = :id", Long.class)
                .setParameter("id", locationId)
                .getSingleResult();
        return count > 0;
    }

    public List<Location> findNameSubstr(String str) {
        return em.createQuery("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(:searchPattern)", Location.class)
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }

    public List<Location> findPage(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        return em.createQuery("SELECT l FROM Location l ORDER BY l.id ASC", Location.class)
                .setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countAll() {
        return em.createQuery("SELECT COUNT(l) FROM Location l", Long.class)
                .getSingleResult();
    }

    public List<Location> findFilteredPage(String filterField, String filterValue, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        StringBuilder jpql = new StringBuilder("SELECT l FROM Location l WHERE 1=1");
        String expr = resolveStringFilterExpression(filterField);
        boolean hasFilter = expr != null && filterValue != null && !filterValue.isEmpty();

        if (hasFilter) {
            jpql.append(" AND ").append(expr).append(" = :filterValue");
        }
        jpql.append(" ORDER BY l.id ASC");

        var query = em.createQuery(jpql.toString(), Location.class);
        if (hasFilter) {
            query.setParameter("filterValue", filterValue);
        }
        return query.setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countFiltered(String filterField, String filterValue) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(l) FROM Location l WHERE 1=1");
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
            case "name" -> "l.name";
            default -> null;
        };
    }
}
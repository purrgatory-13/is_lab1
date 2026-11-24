package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Location;
import org.example.entities.Person;

import java.util.List;

@ApplicationScoped
public class PersonDao {

    @PersistenceContext
    EntityManager em;

    public void create(Person p) {
        if (p.getLocation() != null && p.getLocation().getId() > 0) {
            Location managedLocation = em.find(Location.class, p.getLocation().getId());
            p.setLocation(managedLocation);
        }
        em.persist(p);
    }

    public void update(Person p) {
        if (p.getLocation() != null && p.getLocation().getId() > 0) {
            Location managedLocation = em.find(Location.class, p.getLocation().getId());
            p.setLocation(managedLocation);
        }
        em.merge(p);
    }

    public Person findById(int id) {
        return em.find(Person.class, id);
    }

    public List<Person> findAll() {
        return em.createQuery("SELECT p FROM Person p", Person.class).getResultList();
    }

    public void remove(int id) {
        Person p = em.find(Person.class, id);
        if (p != null) {
            em.remove(p);
        }
    }

    public List<Person> findNameSubstr(String str) {
        return em.createQuery("SELECT p FROM Person p WHERE LOWER(p.name) LIKE LOWER(:searchPattern)", Person.class)
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }

    public boolean isReferencedByBands(int personId) {
        Long count = em.createQuery("SELECT COUNT(b) FROM MusicBand b WHERE b.frontMan.id = :id", Long.class)
                .setParameter("id", personId)
                .getSingleResult();
        return count > 0;
    }

    public List<Person> findPage(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        return em.createQuery("SELECT p FROM Person p ORDER BY p.id ASC", Person.class)
                .setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countAll() {
        return em.createQuery("SELECT COUNT(p) FROM Person p", Long.class)
                .getSingleResult();
    }

    public List<Person> findFilteredPage(String filterField, String filterValue, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        StringBuilder jpql = new StringBuilder("SELECT p FROM Person p WHERE 1=1");
        String expr = resolveStringFilterExpression(filterField);
        boolean hasFilter = expr != null && filterValue != null && !filterValue.isEmpty();

        if (hasFilter) {
            jpql.append(" AND ").append(expr).append(" = :filterValue");
        }
        jpql.append(" ORDER BY p.id ASC");

        var query = em.createQuery(jpql.toString(), Person.class);
        if (hasFilter) {
            query.setParameter("filterValue", filterValue);
        }
        return query.setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countFiltered(String filterField, String filterValue) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(p) FROM Person p WHERE 1=1");
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
            case "name" -> "p.name";
            case "passportID" -> "p.passportID";
            case "location.name" -> "p.location.name";
            default -> null;
        };
    }
}
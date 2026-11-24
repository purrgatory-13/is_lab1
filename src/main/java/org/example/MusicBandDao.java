package org.example;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entities.Album;
import org.example.entities.Location;
import org.example.entities.MusicBand;
import org.example.entities.Person;

import java.util.List;

@ApplicationScoped
public class MusicBandDao {
    @PersistenceContext
    EntityManager em;

    public void create(MusicBand mb) {
        // 1. Лучший альбом
        if (mb.getBestAlbum() != null) {
            if (mb.getBestAlbum().getId() > 0) {
                // Если выбран существующий по ID — подтягиваем из базы
                Album album = em.find(Album.class, mb.getBestAlbum().getId());
                mb.setBestAlbum(album);
            } else {
                // Если создается новый — сбрасываем ID в 0/null, чтобы Hibernate понял, что это INSERT
                mb.getBestAlbum().setId(0); // или null, в зависимости от типа поля id в Album
            }
        }

        // 2. Фронтмен
        if (mb.getFrontMan() != null) {
            if (mb.getFrontMan().getId() > 0) {
                // Существующий фронтмен по ID
                Person person = em.find(Person.class, mb.getFrontMan().getId());
                mb.setFrontMan(person);
            } else {
                // Новый фронтмен — проверяем его локацию
                mb.getFrontMan().setId(0);

                if (mb.getFrontMan().getLocation() != null) {
                    if (mb.getFrontMan().getLocation().getId() > 0) {
                        // Существующая локация по ID
                        Location loc = em.find(Location.class, mb.getFrontMan().getLocation().getId());
                        mb.getFrontMan().setLocation(loc);
                    } else {
                        // Новая локация — сбрасываем ID
                        mb.getFrontMan().getLocation().setId(0);
                    }
                }
            }
        }

        em.persist(mb);
    }

    public void update(MusicBand mb) {
        if (mb.getBestAlbum() != null) {
            if (mb.getBestAlbum().getId() > 0) {
                Album album = em.find(Album.class, mb.getBestAlbum().getId());
                mb.setBestAlbum(album);
            } else {
                mb.setBestAlbum(null);
            }
        }
        if (mb.getFrontMan() != null && mb.getFrontMan().getId() > 0) {
            Person person = em.find(Person.class, mb.getFrontMan().getId());
            mb.setFrontMan(person);
        }
        em.merge(mb);
    }

    public void updateBandData(int id, MusicBand band) {
        MusicBand existing = em.find(MusicBand.class, id);
        if (existing != null) {
            existing.setName(band.getName());
            existing.setCoordinates(band.getCoordinates());
            existing.setGenre(band.getGenre());
            existing.setNumberOfParticipants(band.getNumberOfParticipants());
            existing.setSinglesCount(band.getSinglesCount());
            existing.setDescription(band.getDescription());
            existing.setAlbumsCount(band.getAlbumsCount());
            existing.setEstablishmentDate(band.getEstablishmentDate());

            if (band.getBestAlbum() != null && band.getBestAlbum().getId() > 0) {
                Album album = em.find(Album.class, band.getBestAlbum().getId());
                if (album != null) {
                    existing.setBestAlbum(album);
                }
            }

            if (band.getFrontMan() != null && band.getFrontMan().getId() > 0) {
                Person person = em.find(Person.class, band.getFrontMan().getId());
                if (person != null) {
                    existing.setFrontMan(person);
                }
            }

            em.merge(existing);
        }
    }

    public MusicBand findById(int id) {
        return em.find(MusicBand.class, id);
    }

    public List<MusicBand> findAll() {
        return em.createQuery("SELECT b FROM MusicBand b", MusicBand.class).getResultList();
    }

    public void remove(int id) {
        MusicBand band = em.find(MusicBand.class, id);
        if (band != null) {
            em.remove(band);
        }
    }

    public List<MusicBand> findNameSubstr(String str) {
        return em.createQuery("SELECT b FROM MusicBand b WHERE LOWER(b.name) LIKE LOWER(:searchPattern)")
                .setParameter("searchPattern", "%" + str + "%")
                .getResultList();
    }

    public void incrementSingle(int id) {
        em.createQuery("UPDATE MusicBand b SET b.singlesCount = COALESCE(b.singlesCount, 0) + 1 WHERE b.id = :id")
                .setParameter("id", id)
                .executeUpdate();
    }

    public void decrementMember(int id) {
        em.createQuery("UPDATE MusicBand b SET b.numberOfParticipants = COALESCE(b.numberOfParticipants, 0) - 1 WHERE b.id = :id")
                .setParameter("id", id)
                .executeUpdate();
    }

    public List<MusicBand> frontManLowerThan(int number) {
        return em.createQuery("SELECT b FROM MusicBand b WHERE b.frontMan.id < :number")
                .setParameter("number", number).getResultList();
    }

    public Long countByAlbumsCount(int count) {
        return em.createQuery("SELECT COUNT(b) FROM MusicBand b WHERE b.albumsCount = :count", Long.class)
                .setParameter("count", count).getSingleResult();
    }
    public List<MusicBand> findPage(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        return em
                .createQuery("SELECT b FROM MusicBand b ORDER BY b.id ASC", MusicBand.class)
                .setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countAll() {
        return em
                .createQuery("SELECT COUNT(b) FROM MusicBand b", Long.class)
                .getSingleResult();
    }

    public List<MusicBand> findFilteredPage(String filterField, String filterValue, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);

        StringBuilder jpql = new StringBuilder("SELECT b FROM MusicBand b WHERE 1=1");
        String expr = resolveStringFilterExpression(filterField);
        boolean hasFilter = expr != null && filterValue != null && !filterValue.isEmpty();

        if (hasFilter) {
            jpql.append(" AND ").append(expr).append(" = :filterValue");
        }
        jpql.append(" ORDER BY b.id ASC");

        var query = em.createQuery(jpql.toString(), MusicBand.class);
        if (hasFilter) {
            query.setParameter("filterValue", filterValue);
        }
        return query.setFirstResult(safePage * safeSize)
                .setMaxResults(safeSize)
                .getResultList();
    }

    public long countFiltered(String filterField, String filterValue) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(b) FROM MusicBand b WHERE 1=1");
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
            case "name" -> "b.name";
            case "description" -> "b.description";
            case "bestAlbum.name" -> "b.bestAlbum.name";
            case "frontMan.name" -> "b.frontMan.name";
            case "frontMan.passportID" -> "b.frontMan.passportID";
            case "frontMan.location.name" -> "b.frontMan.location.name";
            default -> null;
        };
    }
}
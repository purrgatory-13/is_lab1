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
        if (mb.getBestAlbum() != null && mb.getBestAlbum().getId() > 0) {
            Album album = em.find(Album.class, mb.getBestAlbum().getId());
            mb.setBestAlbum(album);
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
}
package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entities.MusicBand;

import java.util.List;

@Path("/bands")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MusicBandResource {

    public record PageResponse<T>(
            List<T> items,
            int page,
            int size,
            long totalItems,
            int totalPages
    ) {}

    @Inject
    private MusicBandService mbs;

    @GET
    public Response getList(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("filterField") String filterField,
            @QueryParam("filterValue") String filterValue
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);

        boolean useFilter = filterField != null && !filterField.isBlank()
                && filterValue != null && !filterValue.isEmpty();

        List<MusicBand> items = useFilter
                ? mbs.findFilteredPage(filterField.trim(), filterValue, safePage, safeSize)
                : mbs.findPage(safePage, safeSize);

        long totalItems = useFilter
                ? mbs.countFiltered(filterField.trim(), filterValue)
                : mbs.countAll();

        int totalPages = (int) Math.ceil((double) totalItems / safeSize);

        PageResponse<MusicBand> responseBody = new PageResponse<>(
                items,
                safePage,
                safeSize,
                totalItems,
                totalPages
        );
        return Response.ok(responseBody).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") int id) {
        MusicBand band = mbs.findById(id);
        if (band == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Музыкальная группа с таким ID не найдена")
                    .build();
        }
        return Response.ok(band).build();
    }

    @POST
    public Response createBand(MusicBand band) {
        try {
            mbs.create(band);
            return Response.status(Response.Status.CREATED).entity("Музыкальная группа успешно добавлена").build();
        } catch (Exception e) {
            String errorMessage = "Не удалось создать музыкальную группу";

            Throwable cause = e;
            while (cause != null) {
                String msg = cause.getMessage();
                if (msg != null) {
                    if (msg.contains("bestalbum_id")) {
                        errorMessage = "Этот альбом уже назначен лучшим у другой музыкальной группы";
                        break;
                    } else if (msg.contains("unique constraint") || msg.contains("duplicate key")) {
                        errorMessage = "Музыкальная группа с такими уникальными полями уже существует";
                        break;
                    } else if (msg.contains("NotNull") || msg.contains("ConstraintViolation")) {
                        errorMessage = "Заполнены не все обязательные поля или нарушены ограничения";
                        break;
                    }
                }
                cause = cause.getCause();
            }

            if (errorMessage.equals("Не удалось создать музыкальную группу") && e.getMessage() != null) {
                errorMessage = "Ошибка базы данных: " + e.getMessage();
            }

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorMessage)
                    .build();
        }
    }

    @PUT @Path("/{id}")
    public Response updateBand(@PathParam("id") int id, MusicBand band) {
        try {
            MusicBand existing = mbs.findById(id);
            if (existing == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкальная группа для обновления не найдена")
                        .build();
            }
            band.setId(id);
            mbs.update(band);
            return Response.ok("Музыкальная группа успешно обновлена").build();
        } catch (Exception e) {
            String errorMessage = "Не удалось обновить музыкальную группу";

            Throwable cause = e;
            while (cause != null) {
                String msg = cause.getMessage();
                if (msg != null) {
                    if (msg.contains("bestalbum_id")) {
                        errorMessage = "Этот альбом уже назначен лучшим у другой музыкальной группы";
                        break;
                    } else if (msg.contains("unique constraint") || msg.contains("duplicate key")) {
                        errorMessage = "Музыкальная группа с такими уникальными полями уже существует";
                        break;
                    } else if (msg.contains("NotNull") || msg.contains("ConstraintViolation")) {
                        errorMessage = "Заполнены не все обязательные поля или нарушены ограничения";
                        break;
                    }
                }
                cause = cause.getCause();
            }

            if (errorMessage.equals("Не удалось обновить музыкальную группу") && e.getMessage() != null) {
                errorMessage = "Ошибка базы данных: " + e.getMessage();
            }

            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorMessage)
                    .build();
        }
    }

    @DELETE @Path("/{id}")
    public Response deleteBand(@PathParam("id") int id) {
        try {
            MusicBand band = mbs.findById(id);
            if (band == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкальная группа для удаления не найдена")
                        .build();
            }
            mbs.remove(id);
            return Response.ok("Музыкальная группа успешно удалена").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Не удалось удалить музыкальную группу, так как на нее ссылаются другие объекты").build();
        }
    }

    @POST
    @Path("/{id}/addSingle")
    public Response addSingle(@PathParam("id") int id) {
        try {
            MusicBand band = mbs.findById(id);
            if (band == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкальная группа не найдена")
                        .build();
            }
            mbs.addNewSingle(id);
            return Response.ok("Сингл успешно добавлен").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Не удалось добавить сингл: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/{id}/removeMember")
    public Response removeMember(@PathParam("id") int id) {
        try {
            MusicBand band = mbs.findById(id);
            if (band == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Музыкальная группа не найдена")
                        .build();
            }
            mbs.removeMember(id);
            return Response.ok("Участник успешно удален").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Не удалось удалить участника: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/substr/{str}")
    public List<MusicBand> findSubstr(@PathParam("str") String str) {
        return mbs.findNameSubstr(str);
    }

    @GET
    @Path("/frontman-lower/{number}")
    public List<MusicBand> getFrontManLowerThan(@PathParam("number") int number) {
        return mbs.frontManLowerThan(number);
    }
}
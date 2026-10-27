package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.example.entities.User;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    private UserService userService;

    @POST
    @Path("/register")
    public Response register(User user) {
        try {
            userService.register(user);
            return Response.status(Response.Status.CREATED).entity("Регистрация успешна").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(e.getMessage() != null ? e.getMessage() : "Ошибка регистрации")
                    .build();
        }
    }

    @POST
    @Path("/login")
    public Response login(User user) {
        try {
            User loggedIn = userService.login(user.getUsername(), user.getPassword());

            // Создаем куку со сроком жизни, например, 1 день (86400 секунд)
            NewCookie cookie = new NewCookie.Builder("username")
                    .value(loggedIn.getUsername())
                    .path("/")
                    .maxAge(86400)
                    .httpOnly(false) // false, чтобы JavaScript на фронте мог ее прочитать при желании
                    .build();

            return Response.ok(loggedIn).cookie(cookie).build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(e.getMessage() != null ? e.getMessage() : "Ошибка авторизации")
                    .build();
        }
    }

    @POST
    @Path("/logout")
    public Response logout() {
        // Удаляем куку, устанавливая maxAge(0)
        NewCookie cookie = new NewCookie.Builder("username")
                .value("")
                .path("/")
                .maxAge(0)
                .build();

        return Response.ok("Выход выполнен").cookie(cookie).build();
    }
}
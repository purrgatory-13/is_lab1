package org.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.example.entities.User;

import java.util.Map;

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
            return Response.status(Response.Status.CREATED)
                    .entity(Map.of("message", "Регистрация успешна"))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage() != null ? e.getMessage() : "Ошибка регистрации"))
                    .build();
        }
    }

    @POST
    @Path("/login")
    public Response login(User user) {
        try {
            String token = userService.login(user.getUsername(), user.getPassword());
            return Response.ok(Map.of(
                            "token", token,
                            "username", user.getUsername()
                    ))
                    .header("Authorization", "Bearer " + token)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", e.getMessage() != null ? e.getMessage() : "Ошибка авторизации"))
                    .build();
        }
    }

    @POST
    @Path("/logout")
    public Response logout() {
        return Response.ok(Map.of("message", "Выход выполнен")).build();
    }
}
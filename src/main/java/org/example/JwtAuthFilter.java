package org.example;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.security.Principal;
import java.util.Map;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
            return;
        }

        String rawPath = requestContext.getUriInfo().getPath();
        String normalizedPath = normalizePath(rawPath);

        if (isPublicAuthPath(normalizedPath)) {
            return;
        }

        String token = extractBearerToken(requestContext.getHeaderString(HttpHeaders.AUTHORIZATION));
        if ((token == null || token.isBlank()) && isEventsPath(normalizedPath)) {
            token = requestContext.getUriInfo().getQueryParameters().getFirst("token");
        }

        if (token == null || token.isBlank()) {
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .type(MediaType.APPLICATION_JSON_TYPE)
                            .entity(Map.of("error", "Требуется авторизация: отсутствует токен"))
                            .build()
            );
            return;
        }

        String username = JwtUtil.validateAndGetUsername(token);
        if (username == null) {
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .type(MediaType.APPLICATION_JSON_TYPE)
                            .entity(Map.of("error", "Невалидный или просроченный JWT"))
                            .build()
            );
            return;
        }

        SecurityContext currentSecurityContext = requestContext.getSecurityContext();
        boolean isSecure = currentSecurityContext != null && currentSecurityContext.isSecure();
        requestContext.setSecurityContext(new SecurityContext() {
            @Override
            public Principal getUserPrincipal() {
                return () -> username;
            }

            @Override
            public boolean isUserInRole(String role) {
                return false;
            }

            @Override
            public boolean isSecure() {
                return isSecure;
            }

            @Override
            public String getAuthenticationScheme() {
                return "Bearer";
            }
        });
    }

    private String normalizePath(String path) {
        if (path == null) {
            return "";
        }
        String p = path.trim();
        while (p.startsWith("/")) {
            p = p.substring(1);
        }
        return p;
    }

    private boolean isPublicAuthPath(String normalizedPath) {
        return normalizedPath.equals("auth/login")
                || normalizedPath.endsWith("/auth/login")
                || normalizedPath.equals("auth/register")
                || normalizedPath.endsWith("/auth/register");
    }

    private boolean isEventsPath(String normalizedPath) {
        return normalizedPath.equals("events") || normalizedPath.endsWith("/events");
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader == null) {
            return null;
        }
        String prefix = "Bearer ";
        if (authHeader.regionMatches(true, 0, prefix, 0, prefix.length())) {
            return authHeader.substring(prefix.length()).trim();
        }
        return null;
    }
}
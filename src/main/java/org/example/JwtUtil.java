package org.example;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class JwtUtil {

    private static final String SECRET = System.getenv().getOrDefault(
            "JWT_SECRET",
            "change-this-super-secret-key-in-production-min-32-chars"
    );
    private static final long TTL_SECONDS = 86400L; // 24 часа
    private static final Pattern SUB_PATTERN = Pattern.compile("\"sub\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern EXP_PATTERN = Pattern.compile("\"exp\"\\s*:\\s*(\\d+)");

    private JwtUtil() {
    }

    public static String generateToken(String username) {
        long now = Instant.now().getEpochSecond();
        long exp = now + TTL_SECONDS;

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = "{\"sub\":\"" + escapeJson(username) + "\",\"iat\":" + now + ",\"exp\":" + exp + "}";

        String headerB64 = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
        String payloadB64 = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signingInput = headerB64 + "." + payloadB64;
        String signatureB64 = sign(signingInput);

        return signingInput + "." + signatureB64;
    }

    public static String validateAndGetUsername(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }

        String signingInput = parts[0] + "." + parts[1];
        String expectedSig = sign(signingInput);
        if (!MessageDigest.isEqual(
                expectedSig.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
        )) {
            return null;
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Matcher expMatcher = EXP_PATTERN.matcher(payloadJson);
            if (!expMatcher.find()) {
                return null;
            }
            long exp = Long.parseLong(expMatcher.group(1));
            if (Instant.now().getEpochSecond() >= exp) {
                return null;
            }

            Matcher subMatcher = SUB_PATTERN.matcher(payloadJson);
            if (!subMatcher.find()) {
                return null;
            }
            return unescapeJson(subMatcher.group(1));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (Exception e) {
            throw new IllegalStateException("Ошибка подписи JWT", e);
        }
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String unescapeJson(String value) {
        return value.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
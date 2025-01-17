package com.fptgang.backend.util;

import java.util.Base64;

public class FileUtils {
    public static byte[] decodeBase64(String base64) {
        return Base64.getDecoder().decode(base64);
    }

    public static String encodeBase64(byte[] bytes) {
        return Base64.getEncoder().encodeToString(bytes);
    }
}

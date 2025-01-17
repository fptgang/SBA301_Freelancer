package com.fptgang.backend.util;

import java.util.Base64;

public class ImageUtils {
    public static String getImageExtension(String base64Image) {
        String extension = "";
        if (base64Image.contains("data:image/jpeg;base64,")) {
            extension = "jpeg";
        } else if (base64Image.contains("data:image/png;base64,")) {
            extension = "png";
        } else if (base64Image.contains("data:image/jpg;base64,")) {
            extension = "jpg";
        } else if (base64Image.contains("data:image/gif;base64,")) {
            extension = "gif";
        }
        return extension;
    }


}

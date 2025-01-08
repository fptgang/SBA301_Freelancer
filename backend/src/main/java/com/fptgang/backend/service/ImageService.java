package com.fptgang.backend.service;

public interface ImageService {

    String uploadImage(String base64Image, String folder);
    String deleteImage(String publicId);
    

}

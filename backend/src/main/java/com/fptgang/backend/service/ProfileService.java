package com.fptgang.backend.service;


import com.fptgang.backend.model.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProfileService {
    Profile create(Profile profile);
    Profile update(Profile profile);
    Profile findByProfileId(long id);
    void deleteById(long id);
    Page<Profile> getAll(Pageable pageable, String filter);
}

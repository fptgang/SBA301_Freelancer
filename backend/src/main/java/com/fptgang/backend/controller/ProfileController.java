package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProfilesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.ProfileMapper;
import com.fptgang.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController implements ProfilesApi {
    private ProfileService profileService;
    private ProfileMapper profileMapper;

    @Autowired
    public ProfileController(ProfileService profileService, ProfileMapper profileMapper) {
        this.profileService = profileService;
        this.profileMapper = profileMapper;
    }


    @Override
    public ResponseEntity<ProfileDto> createProfile(ProfileDto profileDto) {
        var profile = profileMapper.toEntity(profileDto);
        return new ResponseEntity<>(profileMapper.toDTO(profileService.create(profile)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteProfile(Integer projectId) {
        return ProfilesApi.super.deleteProfile(projectId);
    }

    @Override
    public ResponseEntity<ProfileDto> getProfileById(Integer projectId) {
        return ProfilesApi.super.getProfileById(projectId);
    }

    @Override
    public ResponseEntity<GetProfiles200Response> getProfiles(GetAccountsPageableParameter pageable, String filter) {
        return ProfilesApi.super.getProfiles(pageable, filter);
    }

    @Override
    public ResponseEntity<ProfileDto> updateProfile(Integer profileId, ProfileDto profileDto) {
        return ProfilesApi.super.updateProfile(profileId, profileDto);
    }

}

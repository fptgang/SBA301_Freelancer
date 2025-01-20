package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProfilesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.ProfileMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.service.ProfileService;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@Slf4j
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
    public ResponseEntity<Void> deleteProfile(Integer profileId) {
        profileService.deleteById(profileId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProfileDto> getProfileById(Integer profileId) {
        return new ResponseEntity<>(profileMapper.toDTO(profileService.findByProfileId(profileId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetProfiles200Response> getProfiles(GetAccountsPageableParameter pageable, String filter) {
        log.info("Getting profiles");
        var page = OpenApiHelper.toPageable(pageable);
        var res = profileService.getAll(page, filter).map(profileMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetProfiles200Response.class);
    }

    @Override
    public ResponseEntity<ProfileDto> updateProfile(Integer profileId, ProfileDto profileDto) {
        return new ResponseEntity<>(profileMapper.toDTO(profileService.update(profileMapper.toEntity(profileDto))), HttpStatus.OK);
    }

}

package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProfilesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.ProfileFormMapper;
import com.fptgang.backend.mapper.ProfileMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProfileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class ProfileController implements ProfilesApi {
    private final ProfileService profileService;
    private final ProfileMapper profileMapper;
    private final ProfileFormMapper profileFormMapper;

    @Autowired
    public ProfileController(ProfileService profileService,
                             ProfileMapper profileMapper,
                             ProfileFormMapper profileFormMapper) {
        this.profileService = profileService;
        this.profileMapper = profileMapper;
        this.profileFormMapper = profileFormMapper;
    }

    /**
     * Can access: Freelancer
     */
    @Override
    public ResponseEntity<ProfileDto> createProfile(ProfileFormDto profileDto) {
        var profile = profileFormMapper.toEntity(profileDto);
        return new ResponseEntity<>(profileMapper.toDTO(profileService.create(profile), DetailLevel.FULL), HttpStatus.OK);
    }

    /**
     * Can access: Freelancer
     */
    @Override
    public ResponseEntity<ProfileDto> updateProfile(Long profileId, ProfileFormDto profileDto) {
        var profile = profileFormMapper.toEntity(profileDto);
        profile.setProfileId(profileId); // Override profileId
        log.info("Updating profile with id: {}", profileId);
        return new ResponseEntity<>(profileMapper.toDTO(profileService.update(profile),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetProfiles200Response> getProfiles(Pageable pageable, String filter, String search) {
        log.info("Getting profiles");
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = profileService
                .getAll(params.build())
                .map(profile -> profileMapper.toDTO(profile, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetProfiles200Response.class);
    }

    @Override
    public ResponseEntity<ProfileDto> getProfileById(Long profileId) {
        return new ResponseEntity<>(profileMapper.toDTO(profileService.findByProfileId(profileId), DetailLevel.FULL), HttpStatus.OK);
    }
}

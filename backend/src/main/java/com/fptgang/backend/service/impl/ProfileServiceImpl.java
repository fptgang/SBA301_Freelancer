package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.service.ProfileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepos profileRepos;

    public ProfileServiceImpl(ProfileRepos profileRepos) {
        this.profileRepos = profileRepos;
    }

    @Override
    public Profile create(Profile profile) {
        profile.setProfileId(null);
        return profileRepos.save(profile);
    }

    @Override
    public Profile update(Profile profile) {
        if(profile.getProfileId() == null){
            throw new InvalidInputException("Profile does not exist");
        }
        var existing = profileRepos.findByProfileId(profile.getProfileId()).orElseThrow(
                () -> new InvalidInputException("Profile does not exist"));
        EntityUtil.merge(existing, profile);

        return profileRepos.save(profile);
    }

    @Override
    public Profile findByProfileId(long id) {
        return profileRepos.findByProfileId(id).orElseThrow(
                () -> new InvalidInputException("Profile with id " + id + "not found"));
    }

    @Override
    public void deleteById(long id) {
        Profile profile = profileRepos.findByProfileId(id).orElseThrow(
                () -> new InvalidInputException("Profile with id " + id + "not found"));
        profile.setIsVisible(false);
        profileRepos.save(profile);
    }

    @Override
    public Page<Profile> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Profile>toSpec(), "profileId");
        return profileRepos.findAll(spec, params.getPageable());
    }

}

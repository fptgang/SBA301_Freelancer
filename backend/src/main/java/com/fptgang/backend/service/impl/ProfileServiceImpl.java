package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.service.ProfileService;
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
        return profileRepos.save(profile);
    }

    @Override
    public Profile update(Profile profile) {
        if(profile.getProfileId() == null || !profileRepos.existsById(profile.getProfileId())){
            throw new InvalidInputException("Profile does not exist");
        }
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
        profile.setVisible(false);
        profileRepos.save(profile);
    }

    @Override
    public Page<Profile> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Profile>toSpecification(filter);
        return profileRepos.findAll(spec, pageable);
    }

}

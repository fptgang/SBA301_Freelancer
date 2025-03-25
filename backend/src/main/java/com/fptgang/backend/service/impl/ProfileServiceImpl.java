package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.ProfileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepos profileRepos;
    private final AuthContext authContext;
    private final AccountRepos accountRepos;

    public ProfileServiceImpl(ProfileRepos profileRepos,
                              AuthContext authContext, AccountRepos accountRepos) {
        this.profileRepos = profileRepos;
        this.authContext = authContext;
        this.accountRepos = accountRepos;
    }

    @Override
    public Profile create(Profile profile) {
        if (authContext.requireRole() != Role.FREELANCER)
            throw new AccessDeniedException("Non-freelancer cannot create profile");
        if (profile == null) {
            throw new InvalidInputException("Profile cannot be null");
        }
        profile.setProfileId(null);
        profile.setAccount(accountRepos.getReferenceById(authContext.requireAccountId()));
        return profileRepos.save(profile);
    }

    @Override
    public Profile update(Profile profile) {
        if(profile.getProfileId() == null){
            throw new InvalidInputException("Profile does not exist");
        }

        var existing = profileRepos.findByProfileId(profile.getProfileId()).orElseThrow(
                () -> new InvalidInputException("Profile does not exist"));
        if (!existing.getIsVisible()) {
            throw new IllegalStateException("Cannot update a deleted profile");
        }
        authContext.requirePermissionOrAccountIds(Role.STAFF, existing.getAccount().getAccountId());

        if (profile.getSkills() != null && !profile.getSkills().equals(existing.getSkills())) {
            existing.getSkills().clear();
            for (var ps : profile.getSkills()) {
                ps.setProfile(existing);
                existing.getSkills().add(ps);
            }
        }

        EntityUtil.merge(existing, profile);

        return profileRepos.save(existing);
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

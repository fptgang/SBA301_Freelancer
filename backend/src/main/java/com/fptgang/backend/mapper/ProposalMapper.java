package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Proposal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class ProposalMapper extends BaseMapper<ProposalDto, Proposal> {


    @Autowired
    private ProposalRepos proposalRepos;

    @Autowired
    private ProjectRepos projectRepos;

    @Autowired
    private AccountRepos accountRepos;

    @Override
    public ProposalDto toDTO(Proposal entity) {
        if (entity == null) {
            return null;
        }

        ProposalDto proposalDto = new ProposalDto();
        proposalDto.setProposalId(entity.getProposalId() != null ? entity.getProposalId() : null);
        proposalDto.setProjectId(entity.getProject() != null ? entity.getProject().getProjectId() : null);
        proposalDto.setFreelancerId(entity.getFreelancer() != null ? entity.getFreelancer().getAccountId() : null);
        proposalDto.setStatus(mapRoleDto(entity.getStatus()));
        proposalDto.setCreatedAt(OffsetDateTime.from(entity.getCreatedAt()));
        proposalDto.setUpdatedAt(OffsetDateTime.from(entity.getUpdatedAt()));

        return proposalDto;
    }

    @Override
    public Proposal toEntity(ProposalDto dto) {
        if (dto == null) {
            return null;
        }
        Optional<Proposal> existingEntityOptional = proposalRepos.findByProposalId(dto.getProposalId());
        Optional<Project> projectOptional = projectRepos.findByProjectId(dto.getProjectId());
        Optional<Account> accountOptional = accountRepos.findByAccountId(dto.getFreelancerId());
        Account account = accountOptional.get();
        Project project = projectOptional.get();
        if (existingEntityOptional.isPresent()) {
            Proposal existEntity = existingEntityOptional.get();
            existEntity.setProject(dto.getProjectId() != null ? project : existEntity.getProject());
            existEntity.setUpdatedAt(LocalDateTime.from(Instant.now()));
            existEntity.setFreelancer(dto.getFreelancerId() != null ? account : existEntity.getFreelancer());
            existEntity.setStatus(dto.getStatus() != null ? mapRoleEntity(dto.getStatus()) : existEntity.getStatus());
            existEntity.setProposalId(dto.getProposalId() != null ? dto.getProposalId() : existEntity.getProposalId());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());

            return existEntity;
        }


        else{
            Proposal proposal = new Proposal();

            if (dto.getProposalId() != null) {
                proposal.setProposalId(dto.getProposalId());
            }

            if (dto.getProjectId() != null) {
                proposal.setProject(project);
            }

            if (dto.getFreelancerId() != null) {
                proposal.setFreelancer(account);
            }

            if (dto.getStatus() != null) {
                proposal.setStatus(mapRoleEntity(dto.getStatus()));
            }

            if (dto.getCreatedAt() != null) {
                proposal.setCreatedAt(dto.getCreatedAt().toLocalDateTime());
            }

            if (dto.getUpdatedAt() != null) {
                proposal.setUpdatedAt(dto.getUpdatedAt().toLocalDateTime());
            }

            if (dto.getIsVisible() != null) {
                proposal.setVisible(dto.getIsVisible());
            }


            return proposal;
        }
    }

    public ProposalDto.StatusEnum mapRoleDto(Proposal.ProposalStatus roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case PENDING:
                return ProposalDto.StatusEnum.PENDING;
            case ACCEPTED:
                return ProposalDto.StatusEnum.ACCEPTED;
            case REJECTED:
                return ProposalDto.StatusEnum.REJECTED;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }

    public Proposal.ProposalStatus mapRoleEntity(ProposalDto.StatusEnum roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case PENDING:
                return Proposal.ProposalStatus.PENDING;
            case ACCEPTED:
                return Proposal.ProposalStatus.ACCEPTED;
            case REJECTED:
                return Proposal.ProposalStatus.REJECTED;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }


}

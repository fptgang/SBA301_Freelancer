package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
        proposalDto.setProposalId(entity.getProposalId());
        proposalDto.setProjectId(entity.getProject().getProjectId());
        proposalDto.setFreelancerId(entity.getFreelancer().getAccountId());
        proposalDto.setStatus(mapRoleDto(entity.getStatus()));
        proposalDto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        proposalDto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        proposalDto.setIsVisible(entity.isVisible());

        return proposalDto;
    }

    @Override
    public Proposal toEntity(ProposalDto dto) {
        if (dto == null) {
            return null;
        }
        Optional<Proposal> existingEntityOptional = proposalRepos.findByProposalId(dto.getProposalId());

        if (existingEntityOptional.isPresent()) {
            Proposal existEntity = existingEntityOptional.get();

            // DTO chi duoc sua status va visible
            //existEntity.setProject(dto.getProjectId() != null ? project : existEntity.getProject());
            //existEntity.setFreelancer(dto.getFreelancerId() != null ? account : existEntity.getFreelancer());
            existEntity.setStatus(dto.getStatus() != null ? mapRoleEntity(dto.getStatus()) : existEntity.getStatus());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());

            return existEntity;
        }

        else{
            Proposal proposal = new Proposal();
            proposal.setProposalId(dto.getProposalId());

            if (dto.getProjectId() != null) {
                proposal.setProject(projectRepos.findByProjectId(dto.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("Project not found")));
            }

            if (dto.getFreelancerId() != null) {
                proposal.setFreelancer(accountRepos.findByAccountId(dto.getFreelancerId())
                        .orElseThrow(() -> new IllegalArgumentException("Freelancer not found")));
            }

            if (dto.getStatus() != null) {
                proposal.setStatus(mapRoleEntity(dto.getStatus()));
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

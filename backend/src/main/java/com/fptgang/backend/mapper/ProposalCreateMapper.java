package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProposalCreateDto;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.api.model.ProposalStatusDto;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Proposal.ProposalStatus;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProposalCreateMapper extends BaseMapper<ProposalCreateDto, Proposal> {
    private final ProjectRepos projectRepos;

    public ProposalCreateMapper(ProjectRepos projectRepos) {
        this.projectRepos = projectRepos;
    }

    @Override
    public Proposal toEntity(ProposalCreateDto dto) {
        if (dto == null) {
            return null;
        }

        Proposal entity = new Proposal();
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        entity.setNotes(dto.getNotes());
        entity.setBudget(dto.getBudget());

        return entity;
    }

    @Override
    public ProposalCreateDto toDTO(Proposal entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}
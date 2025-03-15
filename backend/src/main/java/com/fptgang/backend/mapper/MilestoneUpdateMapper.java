package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneUpdateDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
public class MilestoneUpdateMapper extends BaseMapper<MilestoneUpdateDto, Milestone> {
    @Override
    public Milestone toEntity(MilestoneUpdateDto dto) {
        return Milestone.builder()
                .milestoneId(dto.getMilestoneId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .deadline(DateTimeUtil.fromOffsetToLocal(dto.getDeadline()))
                .budgetRatio(dto.getBudgetRatio())
                .build();
    }

    @Override
    public MilestoneUpdateDto toDTO(Milestone entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}

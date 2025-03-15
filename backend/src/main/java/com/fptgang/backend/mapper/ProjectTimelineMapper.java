package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectTimelineDto;
import com.fptgang.backend.api.model.ProjectTimelineDtoMilestonesInner;
import com.fptgang.backend.util.DateTimeUtil;
import com.fptgang.backend.util.ProjectTimeline;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProjectTimelineMapper extends BaseMapper<ProjectTimelineDto, ProjectTimeline> {

    @Override
    public ProjectTimeline toEntity(ProjectTimelineDto dto) {
        return ProjectTimeline.builder()
                .projectStartDate(DateTimeUtil.fromOffsetToLocal(dto.getNewStartDate()))
                .milestoneDeadlines(dto.getMilestones().stream()
                        .filter(e -> e.getMilestoneId() != null && e.getNewDeadline() != null)
                        .collect(Collectors.toMap(
                                ProjectTimelineDtoMilestonesInner::getMilestoneId,
                                e -> DateTimeUtil.fromOffsetToLocal(e.getNewDeadline())
                        )))
                .build();
    }

    @Override
    public ProjectTimelineDto toDTO(ProjectTimeline entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}

package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class ProjectCategoryMapper extends BaseMapper<ProjectCategoryDto, ProjectCategory> {
    private final ProjectCategoryRepos projectCategoryRepos;

    public ProjectCategoryMapper(ProjectCategoryRepos projectCategoryRepos) {
        this.projectCategoryRepos = projectCategoryRepos;
    }

    @Override
    public ProjectCategory toEntity(ProjectCategoryDto dto) {
        if (dto == null) {
            return null;
        }

        ProjectCategory entity = new ProjectCategory();
        entity.setProjectCategoryId(dto.getProjectCategoryId());
        entity.setName(dto.getName());
        entity.setIsVisible(dto.getIsVisible());
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public ProjectCategoryDto toDTO(ProjectCategory entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProjectCategoryDto dto = new ProjectCategoryDto();
        dto.setProjectCategoryId(entity.getProjectCategoryId());
        dto.setName(entity.getName());
        dto.setIsVisible(entity.getIsVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        // Add more fields if needed for other detail levels

        return dto;
    }
}
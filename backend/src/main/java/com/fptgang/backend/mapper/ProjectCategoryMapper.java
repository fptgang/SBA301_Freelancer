package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.model.ProjectCategory;

import java.time.OffsetDateTime;

public class ProjectCategoryMapper extends BaseMapper<ProjectCategoryDto,ProjectCategory> {
    @Override
    ProjectCategoryDto toDTO(ProjectCategory entity) {
        if (entity == null) {
            return null;
        }

        ProjectCategoryDto dto = new ProjectCategoryDto();
        dto.setProjectCategoryId(entity.getProjectCategoryId());
        dto.setName(entity.getName());
        dto.setIsVisible(entity.isVisible());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().atOffset(OffsetDateTime.now().getOffset()) : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().atOffset(OffsetDateTime.now().getOffset()) : null);
        return dto;
    }

    @Override
    ProjectCategory toEntity(ProjectCategoryDto dto) {
        if (dto == null) {
            return null;
        }

        ProjectCategory projectCategory = new ProjectCategory();
        projectCategory.setProjectCategoryId(dto.getProjectCategoryId());
        projectCategory.setName(dto.getName());
        projectCategory.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : true);
        projectCategory.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toLocalDateTime() : null);
        projectCategory.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt().toLocalDateTime() : null);
        return projectCategory;
    }
}

package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class ProjectCategoryMapper extends BaseMapper<ProjectCategoryDto, ProjectCategory> {

    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;

    @Override
    public ProjectCategoryDto toDTO(ProjectCategory entity) {
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
    public ProjectCategory toEntity(ProjectCategoryDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<ProjectCategory> existingEntityOptional = projectCategoryRepos.findByProjectCategoryId(dto.getProjectCategoryId());
        if (existingEntityOptional.isPresent()) {
            ProjectCategory existEntity = existingEntityOptional.get();
            existEntity.setName(dto.getName() != null ? dto.getName() : existEntity.getName());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : true);
            existEntity.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt().toLocalDateTime() : existEntity.getUpdatedAt());

            return existEntity;
        } else {
            ProjectCategory projectCategory = new ProjectCategory();
            projectCategory.setProjectCategoryId(dto.getProjectCategoryId());
            projectCategory.setName(dto.getName());
            projectCategory.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : true);
            projectCategory.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toLocalDateTime() : null);
            projectCategory.setUpdatedAt(dto.getUpdatedAt() != null ? dto.getUpdatedAt().toLocalDateTime() : null);

            return projectCategory;
        }
    }
}

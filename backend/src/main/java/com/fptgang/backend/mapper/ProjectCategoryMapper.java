package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProjectCategoryMapper extends BaseMapper<ProjectCategoryDto, ProjectCategory> {

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

        return dto;
    }
}
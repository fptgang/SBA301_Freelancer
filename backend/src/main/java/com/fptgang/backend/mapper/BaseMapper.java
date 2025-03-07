package com.fptgang.backend.mapper;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @param <D> DTO type
 * @param <E> Entity type
 */
abstract class BaseMapper<D, E> {

    /**
     * Convert entity to DTO with specified detail level
     */
    public abstract D toDTO(E entity, DetailLevel level);

    /**
     * Convert DTO to entity
     */
    public abstract E toEntity(D dto);

    /**
     * Convert list of DTOs to list of entities
     */
    public List<E> toEntities(List<D> dtos) {
        if (dtos == null) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of entities to list of DTOs with FULL detail level
     */
    public List<D> toDTOs(List<E> entities) {
        return toDTOs(entities, DetailLevel.FULL);
    }

    /**
     * Convert list of entities to list of DTOs with specified detail level
     */
    public List<D> toDTOs(List<E> entities, DetailLevel level) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(entity -> toDTO(entity, level))
                .collect(Collectors.toList());
    }
}
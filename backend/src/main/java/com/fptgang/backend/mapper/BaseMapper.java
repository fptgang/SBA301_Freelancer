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
    public abstract E toEntity(D dto);

    public List<E> toEntities(List<D> dtos) {
        if (dtos == null) {
            return Collections.emptyList();
        }
        return dtos.stream()
                .filter(Objects::nonNull)
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public abstract D toDTO(E entity, DetailLevel level);

    public List<D> toDTOs(List<E> entities, DetailLevel level) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .filter(Objects::nonNull)
                .map(e -> toDTO(e, level))
                .collect(Collectors.toList());
    }
}
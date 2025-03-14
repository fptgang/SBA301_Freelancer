package com.fptgang.backend.mapper.template;

import java.util.Map;

public interface TemplateMapper<E> {
    Map<String, Object> create(E entity);
}
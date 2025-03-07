package com.fptgang.backend.util;

import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;

import java.lang.reflect.Field;

public class EntityUtil {
    public static <T> T merge(T existing, T newEntity) {
        if (newEntity == null) {
            return existing;
        }

        Class<?> clazz = existing.getClass();
        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object newValue = field.get(newEntity);

                // Skip if new value is null (preserve existing value)
                if (newValue == null) {
                    continue;
                }

                // If it's @OneToMany or @ManyToMany, do not override
                if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
                    continue;
                }

                // If it's @ManyToOne, @OneToOne or normal fields, allow override
                field.set(existing, newValue);

            } catch (IllegalAccessException e) {
                throw new RuntimeException("Error merging entities", e);
            }
        }
        return existing;
    }
}

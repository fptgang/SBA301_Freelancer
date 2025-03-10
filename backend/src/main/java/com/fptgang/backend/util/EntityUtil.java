package com.fptgang.backend.util;

import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import org.hibernate.Hibernate;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

public class EntityUtil {
    public static <T> T merge(T existing, T newEntity) {
        if (newEntity == null) {
            return existing;
        }

        Class<?> clazz = Hibernate.getClass(existing);
        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            if(field.isSynthetic() || Modifier.isStatic(field.getModifiers())) {
                continue;
            }

            try {
                Object newValue = field.get(newEntity);

                // Skip if new value is null (preserve existing value)
                if (newValue == null) {
                    continue;
                }

                // If it's @OneToMany or @ManyToMany, do not override
                if (field.isAnnotationPresent(OneToMany.class) ||
                        field.isAnnotationPresent(ManyToMany.class)) {
                    continue;
                }

                field.set(existing, newValue);

            } catch (IllegalAccessException e) {
                throw new RuntimeException("Error merging entities", e);
            }
        }
        return existing;
    }
}
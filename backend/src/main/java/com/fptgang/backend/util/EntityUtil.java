package com.fptgang.backend.util;

import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import org.hibernate.Hibernate;
import org.joor.Reflect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import java.util.Set;

public class EntityUtil {
    private static final Logger LOGGER = LoggerFactory.getLogger(EntityUtil.class);

    public static <T> T merge(T existing, T newEntity) {
        if (newEntity == null) {
            return existing;
        }

        Class<?> clazz = Hibernate.getClass(existing);
        Set<String> fieldChanged = new HashSet<>();

        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            if(field.isSynthetic() || Modifier.isStatic(field.getModifiers())) {
                continue;
            }

            try {
                Object newValue = get(newEntity, field.getName());

                // Skip if new value is null (preserve existing value)
                if (newValue == null) {
                    continue;
                }

                // If it's @OneToMany or @ManyToMany, do not override
                if (field.isAnnotationPresent(OneToMany.class) ||
                        field.isAnnotationPresent(ManyToMany.class) ||
                        field.isAnnotationPresent(Transient.class)) {
                    continue;
                }

                set(existing, field.getName(), newValue);
                fieldChanged.add(field.getName());
            } catch (Exception e) {
                if (e instanceof org.joor.ReflectException)
                    continue;
                throw new RuntimeException("Error merging entities", e);
            }
        }

        //LOGGER.info("Merged fields {} into {}", String.join(",", fieldChanged), clazz.getName());
        return existing;
    }

    private static String capitalize(String str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private static Object get(Object object, String field) {
        return Reflect.on(object).call("get" + capitalize(field)).get();
    }

    private static void set(Object object, String field, Object value) {
        Reflect.on(object).call("set" + capitalize(field), value);
    }
}
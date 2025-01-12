package com.fptgang.backend.util;

import jakarta.persistence.criteria.Path;
import org.joor.Reflect;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class OpenApiHelper {

    public static Pageable toPageable(Object pageableObj) {
        if (pageableObj == null) {
            return Pageable.unpaged();
        }

        Integer page = Reflect.on(pageableObj).field("page").get();
        Integer size = Reflect.on(pageableObj).field("size").get();
        List<String> sortFields = Reflect.on(pageableObj).field("sort").get();

        Sort sort = sortFields.stream()
                .map(sortField -> {
                    String[] parts = sortField.split(",", 2);
                    if (parts.length == 2) {
                        return new Sort.Order(Sort.Direction.fromString(parts[1]), parts[0]);
                    }
                    return new Sort.Order(Sort.Direction.ASC, parts[0]);
                })
                .collect(Collectors.collectingAndThen(Collectors.toList(), Sort::by));

        return PageRequest.of(page, size, sort);
    }

    public static <T> T toPage(Page<?> page, Class<T> clazz) {
        T response = Reflect.on(clazz).create().get();
        Reflect.on(response).set("content", page.getContent());
        Reflect.on(response).set("totalElements", page.getTotalElements());
        Reflect.on(response).set("totalPages", page.getTotalPages());
        Reflect.on(response).set("last", page.isLast());
        Reflect.on(response).set("first", page.isFirst());
        Reflect.on(response).set("numberOfElements", page.getNumberOfElements());
        Reflect.on(response).set("empty", page.isEmpty());
        return response;
    }

    public static <T> ResponseEntity<T> respondPage(Page<?> page, Class<T> clazz, HttpStatusCode code) {
        return new ResponseEntity<>(toPage(page, clazz), code);
    }

    public static <T> ResponseEntity<T> respondPage(Page<?> page, Class<T> clazz) {
        return new ResponseEntity<>(toPage(page, clazz), HttpStatus.OK);
    }

    public static <T> Specification<T> toSpecification(String filterString) {
        if (filterString == null)
            return Specification.anyOf();

        String[] filterParts = filterString.split(",", 3);

        if (filterParts.length != 3) {
            throw new IllegalArgumentException("Invalid filter format. Expected: field,op,value");
        }

        String field = filterParts[0];
        String operator = filterParts[1];
        String value = filterParts[2];

        return (root, query, criteriaBuilder) -> {
            Path<String> fieldPath = root.get(field);

            return switch (operator) {
                case "eq" -> criteriaBuilder.equal(fieldPath, value);
                case "ne" -> criteriaBuilder.notEqual(fieldPath, value);
                case "lt" -> criteriaBuilder.lessThan(fieldPath, value);
                case "gt" -> criteriaBuilder.greaterThan(fieldPath, value);
                case "lte" ->
                        criteriaBuilder.lessThanOrEqualTo(fieldPath, value);
                case "gte" ->
                        criteriaBuilder.greaterThanOrEqualTo(fieldPath, value);
                case "in" -> fieldPath.in(Arrays.asList(value.split(",")));
                case "nin" ->
                        criteriaBuilder.not(fieldPath.in(Arrays.asList(value.split(","))));
                case "contains" ->
                        criteriaBuilder.like(fieldPath, "%" + value + "%");
                case "ncontains" ->
                        criteriaBuilder.notLike(fieldPath, "%" + value + "%");
                case "containss" ->
                        criteriaBuilder.like(criteriaBuilder.lower(fieldPath), "%" + value.toLowerCase() + "%");
                case "ncontainss" ->
                        criteriaBuilder.notLike(criteriaBuilder.lower(fieldPath), "%" + value.toLowerCase() + "%");
                case "null" -> criteriaBuilder.isNull(fieldPath);
                case "nnull" -> criteriaBuilder.isNotNull(fieldPath);
                case "startswith" ->
                        criteriaBuilder.like(fieldPath, value + "%");
                case "nstartswith" ->
                        criteriaBuilder.notLike(fieldPath, value + "%");
                case "startswiths" ->
                        criteriaBuilder.like(criteriaBuilder.lower(fieldPath), value.toLowerCase() + "%");
                case "nstartswiths" ->
                        criteriaBuilder.notLike(criteriaBuilder.lower(fieldPath), value.toLowerCase() + "%");
                case "endswith" -> criteriaBuilder.like(fieldPath, "%" + value);
                case "nendswith" ->
                        criteriaBuilder.notLike(fieldPath, "%" + value);
                case "endswiths" ->
                        criteriaBuilder.like(criteriaBuilder.lower(fieldPath), "%" + value.toLowerCase());
                case "nendswiths" ->
                        criteriaBuilder.notLike(criteriaBuilder.lower(fieldPath), "%" + value.toLowerCase());
                default ->
                        throw new IllegalArgumentException("Unsupported operator: " + operator);
            };
        };
    }
}

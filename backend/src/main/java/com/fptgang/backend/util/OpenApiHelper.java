package com.fptgang.backend.util;

import jakarta.persistence.criteria.Path;
import org.joor.Reflect;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class OpenApiHelper {

    public static Pageable toPageable(Object pageableObj) {
        if (pageableObj == null) {
            return Pageable.unpaged();
        }

        Integer page = Reflect.on(pageableObj).field("page").get();
        Integer size = Reflect.on(pageableObj).field("size").get();
        List<String> sortFields = Reflect.on(pageableObj).field("sort").get();
        Sort sort = convertToSpringSort(sortFields);

        return PageRequest.of(page, size, sort);
    }

    private static Sort convertToSpringSort(List<String> sort) {
        String joinedSort = String.join(",", sort);
        List<Sort.Order> orders = new ArrayList<>();
        String[] fieldsAndOrders = joinedSort.split(",");

        for (int i = 0; i < fieldsAndOrders.length-1; i += 2) {
            String field = fieldsAndOrders[i];
            String order = fieldsAndOrders[i + 1];
            if (field.isEmpty() || order.isEmpty())
                continue;

            if ("asc".equalsIgnoreCase(order)) {
                orders.add(Sort.Order.asc(field));
            } else if ("desc".equalsIgnoreCase(order)) {
                orders.add(Sort.Order.desc(field));
            }
        }

        return Sort.by(orders);
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
        return toSpecification(filterString, null);
    }

    public static <T> Specification<T> toSpecification(String filterString, List<String> whitelistFields) {
        if (filterString == null)
            return Specification.anyOf();

        String[] filterParts = filterString.split(",", 3);

        if (filterParts.length != 3) {
            throw new IllegalArgumentException("Invalid filter format. Expected: field,op,value");
        }

        String field = filterParts[0];
        String operator = filterParts[1];
        String value = filterParts[2];

        if (whitelistFields != null && !whitelistFields.contains(field)) {
            throw new IllegalArgumentException("Invalid field: " + field);
        }

        return (root, query, criteriaBuilder) -> {
            Path<String> fieldPath = root.get(field);

            if (fieldPath == null) {
                return criteriaBuilder.or();
            }

            //parse boolean class if dete value is a true false value
            if (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false") ){
                return criteriaBuilder.equal(fieldPath, Boolean.parseBoolean(value));
            }
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

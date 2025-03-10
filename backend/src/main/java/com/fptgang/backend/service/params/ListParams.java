package com.fptgang.backend.service.params;

import com.fptgang.backend.util.OpenApiHelper;
import lombok.Data;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
public class ListParams {
    private Pageable pageable;
    private Map<String, String[]> filter;
    private String search;
    private boolean includeInvisible;

    private ListParams() {}

    private ListParams(Builder builder) {
        this.pageable = builder.pageable;
        this.filter = builder.filter;
        this.search = builder.search;
        this.includeInvisible = builder.includeInvisible;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Pageable pageable;
        private final Map<String, String[]> filter = new LinkedHashMap<>();
        private String search;
        private boolean includeInvisible;

        public Builder pageable(Pageable pageable) {
            this.pageable = pageable;
            return this;
        }

        public Builder filter(Map<String, String[]> filter) {
            this.filter.putAll(filter);
            return this;
        }

        public Builder filter(String filter) {
            this.filter.putAll(OpenApiHelper.parseFilters(filter));
            return this;
        }

        public Builder setFilter(String field, String op, Object value) {
            this.filter.put(field, new String[]{op, String.valueOf(value)});
            return this;
        }

        public Builder search(String search) {
            this.search = search;
            return this;
        }

        public Builder includeInvisible(boolean includeInvisible) {
            this.includeInvisible = includeInvisible;
            return this;
        }

        public ListParams build() {
            return new ListParams(this);
        }
    }

    public <T> Specification<T> toSpec() {
        if (!includeInvisible) {
            filter.put("isVisible", new String[]{"eq", "true"});
        }
        var spec = OpenApiHelper.<T>filtersToSpec(filter);
        if (search != null && !search.isEmpty()) {
            spec = spec.and(OpenApiHelper.searchToSpec(search));
        }
        return spec;
    }
}
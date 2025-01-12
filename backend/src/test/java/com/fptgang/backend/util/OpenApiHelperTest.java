package com.fptgang.backend.util;

import lombok.Builder;
import lombok.Data;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class OpenApiHelperTest {
    @Test
    public void testToPagable() {
        var p = OpenApiHelper.toPageable(PageableParameter.builder()
                .page(3)
                .sort(List.of("email,asc", "name,desc"))
                .size(20)
        );
        assertEquals(3, p.getPageNumber());
        assertEquals(20, p.getPageSize());
        assertEquals("email: ASC,name: DESC", p.getSort().toString());
    }

    @Test
    public void testToPage() {
        var ctn = List.of(
                new Dummy(),
                new Dummy(),
                new Dummy()
        );
        var p = OpenApiHelper.toPage(new PageImpl<>(
                ctn,
                PageRequest.of(1, 20),
                100
        ), ExampleGet200Response.class);
        assertEquals(ctn, p.getContent());
        assertEquals(100, p.getTotalElements());
        assertEquals(5, p.getTotalPages());
        assertFalse(p.getFirst());
        assertFalse(p.getLast());
        assertEquals(3, p.getNumberOfElements());
        assertFalse(p.getEmpty());
    }

    @Data
    private static class ExampleGet200Response {
        private List<Dummy> content = new ArrayList<>();
        private Long totalElements;
        private Integer totalPages;
        private Boolean last;
        private Boolean first;
        private Integer numberOfElements;
        private Boolean empty;
    }

    @Data
    private static class Dummy {

    }

    @Builder
    private static class PageableParameter {
        private Integer page;
        private Integer size;
        private List<String> sort;
    }
}

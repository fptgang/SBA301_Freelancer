package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.StatsApi;
import com.fptgang.backend.api.model.StringBigDecimalDatapointDto;
import com.fptgang.backend.api.model.StringIntegerDatapointDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.stats.StringBigDecimalDatapointMapper;
import com.fptgang.backend.mapper.stats.StringIntegerDatapointMapper;
import com.fptgang.backend.service.StatService;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class StatController implements StatsApi {

    private final StatService statService;
    private final StringBigDecimalDatapointMapper stringBigDecimalDatapointMapper;
    private final StringIntegerDatapointMapper stringIntegerDatapointMapper;

    public StatController(StatService statService, StringBigDecimalDatapointMapper stringBigDecimalDatapointMapper,StringIntegerDatapointMapper stringIntegerDatapointMapper) {
        this.statService = statService;
        this.stringBigDecimalDatapointMapper = stringBigDecimalDatapointMapper;
        this.stringIntegerDatapointMapper = stringIntegerDatapointMapper;
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getMonthlyNewCustomers() {
        var data = statService.getMonthlyNewCustomers();
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }
}

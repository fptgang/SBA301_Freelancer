package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.StatsApi;
import com.fptgang.backend.api.model.StringBigDecimalDatapointDto;
import com.fptgang.backend.api.model.StringIntegerDatapointDto;
import com.fptgang.backend.api.model.TransactionStatDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.stats.StringBigDecimalDatapointMapper;
import com.fptgang.backend.mapper.stats.StringIntegerDatapointMapper;
import com.fptgang.backend.mapper.stats.TransactionStatMapper;
import com.fptgang.backend.service.StatService;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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
    private final TransactionStatMapper transactionStatMapper;

    public StatController(StatService statService,
            StringBigDecimalDatapointMapper stringBigDecimalDatapointMapper,
            StringIntegerDatapointMapper stringIntegerDatapointMapper,
            TransactionStatMapper transactionStatMapper) {
        this.statService = statService;
        this.stringBigDecimalDatapointMapper = stringBigDecimalDatapointMapper;
        this.stringIntegerDatapointMapper = stringIntegerDatapointMapper;
        this.transactionStatMapper = transactionStatMapper;
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getMonthlyNewCustomers() {
        var data = statService.getMonthlyNewCustomers();
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<TransactionStatDto>> getTransactionStats( LocalDate startDate, LocalDate endDate,String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getTransactionStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> transactionStatMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getNewProjectStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getNewProjectStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getContractsSignedStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getContractsSignedStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getMilestonesCompletedStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getMilestonesCompletedStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringBigDecimalDatapointDto>> getFundsReleasedStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getFundsReleasedStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringBigDecimalDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getUserRegistrationsStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getUserRegistrationsStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<StringIntegerDatapointDto>> getProjectTerminationRateStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "month") String groupBy) {

        startDate = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        endDate = endDate != null ? endDate : LocalDate.now();

        var data = statService.getProjectTerminationRateStats(startDate, endDate, groupBy);
        var result = data.stream().map(d -> stringIntegerDatapointMapper.toDTO(d, DetailLevel.FULL)).toList();
        return ResponseEntity.ok(result);
    }
}

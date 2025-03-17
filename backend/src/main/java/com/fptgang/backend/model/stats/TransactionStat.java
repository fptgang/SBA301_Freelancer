package com.fptgang.backend.model.stats;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionStat {
    private String timePeriod;
    private Integer successful;
    private Integer pending;
    private Integer failed;
}
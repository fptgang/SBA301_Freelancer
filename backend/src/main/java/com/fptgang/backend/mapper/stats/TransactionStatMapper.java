package com.fptgang.backend.mapper.stats;

import com.fptgang.backend.api.model.TransactionStatDto;
import com.fptgang.backend.mapper.BaseMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.stats.TransactionStat;
import org.springframework.stereotype.Component;

@Component
public class TransactionStatMapper extends BaseMapper<TransactionStatDto, TransactionStat> {

    @Override
    public TransactionStatDto toDTO(TransactionStat entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        TransactionStatDto dto = new TransactionStatDto();
        dto.setTimePeriod(entity.getTimePeriod());
        dto.setSuccessful(entity.getSuccessful());
        dto.setPending(entity.getPending());
        dto.setFailed(entity.getFailed());

        return dto;
    }

    @Override
    public TransactionStat toEntity(TransactionStatDto dto) {
        if (dto == null) {
            return null;
        }

        TransactionStat entity = new TransactionStat();
        entity.setTimePeriod(dto.getTimePeriod());
        entity.setSuccessful(dto.getSuccessful());
        entity.setPending(dto.getPending());
        entity.setFailed(dto.getFailed());

        return entity;
    }
}
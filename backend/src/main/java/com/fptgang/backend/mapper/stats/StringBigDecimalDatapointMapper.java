package com.fptgang.backend.mapper.stats;

import com.fptgang.backend.api.model.StringBigDecimalDatapointDto;
import com.fptgang.backend.mapper.BaseMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import org.springframework.stereotype.Component;

@Component
public class StringBigDecimalDatapointMapper extends BaseMapper<StringBigDecimalDatapointDto, StringBigDecimalDatapoint> {
    @Override
    public StringBigDecimalDatapoint toEntity(StringBigDecimalDatapointDto dto) {
        return StringBigDecimalDatapoint.builder()
                .key(dto.getKey())
                .value(dto.getValue())
                .build();
    }

    @Override
    public StringBigDecimalDatapointDto toDTO(StringBigDecimalDatapoint entity, DetailLevel level) {
        return new StringBigDecimalDatapointDto().key(entity.getKey()).value(entity.getValue());
    }
}
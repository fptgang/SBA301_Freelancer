package com.fptgang.backend.mapper.stats;

import com.fptgang.backend.api.model.StringIntegerDatapointDto;
import com.fptgang.backend.mapper.BaseMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import org.springframework.stereotype.Component;

@Component
public class StringIntegerDatapointMapper extends BaseMapper<StringIntegerDatapointDto, StringIntegerDatapoint>  {
    @Override
    public StringIntegerDatapoint toEntity(StringIntegerDatapointDto dto) {
        return StringIntegerDatapoint.builder()
                .key(dto.getKey())
                .value(dto.getValue())
                .build();
    }

    @Override
    public StringIntegerDatapointDto toDTO(StringIntegerDatapoint entity, DetailLevel level) {
        return new StringIntegerDatapointDto().key(entity.getKey()).value(entity.getValue());
    }
}
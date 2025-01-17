package com.fptgang.backend.util;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public final class Fingerprint {
    private String sessionId;
    private String ipAddress;
    private String clientInfo;
}

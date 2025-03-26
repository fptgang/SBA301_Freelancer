package com.fptgang.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class HirableConfig {
    @Value("${hirable.project.min-project-start-delay:3}")
    private int minProjectStartDelay;

    @Value("${hirable.milestone.min-duration-between:3}")
    private int minMilestoneDurationBetween;

    @Value("${hirable.milestone.max-duration-between:30}")
    private int maxMilestoneDurationBetween;

    @Value("${hirable.milestone.max-amount:10}")
    private int maxMilestoneAmount;

    @Value("${hirable.project.termination-notice-period:2}")
    private int projectTerminationNoticePeriod;

    @Value("${hirable.proposal.application-cutoff-duration:1}")
    private int proposalApplicationCutoffDuration;

    @Value("${hirable.enable-sending-mail:false}")
    private boolean enableSendingMail;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;
}

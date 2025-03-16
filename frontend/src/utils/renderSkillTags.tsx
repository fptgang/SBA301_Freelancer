import { Space, Tag } from "antd";
import React from "react";
import { ProfileSkillDto, ProjectSkillDto } from "../../generated";

export const renderSkillTags = (
  skills: Array<ProfileSkillDto | ProjectSkillDto>
) => (
  <Space wrap>
    {skills.map((skillItem, index) => (
      <Tag color="blue" key={index}>
        {skillItem.skill?.name} - {skillItem.proficiency}
      </Tag>
    ))}
  </Space>
);

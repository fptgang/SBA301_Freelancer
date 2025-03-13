import { Card, Col, Collapse, Select, Typography } from "antd";
import React from "react";
import {
  ProficiencyEnum,
  ProjectCategoryDto,
  SkillDto,
} from "../../../../generated";
import { GetListResponse } from "@refinedev/core";

const RenderFilter: React.FC<{
  selectedSkills: SkillDto[];
  selectedLevel: ProficiencyEnum[];
  selectedCategories: ProjectCategoryDto[];
  skillsData: GetListResponse<SkillDto> | undefined;
  categoriesData: GetListResponse<ProjectCategoryDto> | undefined;
  levelOptions: ProficiencyEnum[];
  isSkillsLoading: boolean;
  isCategoriesLoading: boolean;
  setSelectedSkills: any;
  setSelectedLevel: any;
  setSelectedCategories: any;
  activeTab: string;
}> = ({
  selectedSkills,
  selectedLevel,
  selectedCategories,
  skillsData,
  categoriesData,
  levelOptions,
  isSkillsLoading,
  isCategoriesLoading,
  setSelectedSkills,
  setSelectedLevel,
  setSelectedCategories,
  activeTab,
}) => {
  return (
    <Card
      style={{
        // height: "100%",
        position: "sticky",
        top: "10vh",
      }}
    >
      <Typography.Title level={4}>Filter</Typography.Title>
      <Collapse
        defaultActiveKey={["1", "2", "3"]}
        ghost
        expandIconPosition="end"
      >
        <Collapse.Panel header="Skills" key="1">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select skills"
            loading={isSkillsLoading}
            className="mb-4"
            onChange={(value) => {
              setSelectedSkills(
                skillsData?.data?.filter((skill) =>
                  value.includes(skill.skillId)
                ) || []
              );
            }}
            value={selectedSkills.map((skill) => skill.skillId)}
          >
            {skillsData?.data?.map((skill) => (
              <Select.Option key={skill.skillId} value={skill.skillId}>
                {skill.name}
              </Select.Option>
            ))}
          </Select>
        </Collapse.Panel>
        <Collapse.Panel header="Experience Level" key="2">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Experience Level"
            className="mb-4"
            onChange={(value) => {
              setSelectedLevel(value);
              console.log(value);
            }}
            value={selectedLevel}
          >
            {levelOptions?.map((level) => (
              <Select.Option key={level} value={level}>
                {level}
              </Select.Option>
            ))}
          </Select>
        </Collapse.Panel>
        {activeTab === "projects" && (
          <Collapse.Panel header="Project Categories" key="3">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select Project Categories"
              className="mb-4"
              loading={isCategoriesLoading}
              onChange={(value) => {
                setSelectedCategories(
                  categoriesData?.data?.filter((c) => value.includes(c.name)) ||
                    []
                );
                console.log(value);
              }}
              value={selectedCategories.map((c) => c.name)}
            >
              {categoriesData?.data?.map((c) => (
                <Select.Option key={c.projectCategoryId} value={c.name}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Collapse.Panel>
        )}
      </Collapse>

      {/* <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Select Proficiency Level"
        className="mb-4"
        onChange={(value) => {
          setSelectedLevel(value);
          console.log(value);
        }}
        value={selectedLevel}
      >
        {levelOptions?.map((level) => (
          <Select.Option key={level} value={level}>
            {level}
          </Select.Option>
        ))}
      </Select>
      {activeTab === "projects" && (
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select Project Categories"
          className="mb-4"
          loading={isCategoriesLoading}
          onChange={(value) => {
            setSelectedCategories(
              categoriesData?.data?.filter((c) =>
                value.includes(c.projectCategoryId)
              ) || []
            );
            console.log(value);
          }}
          value={selectedCategories.map((c) => c.projectCategoryId)}
        >
          {categoriesData?.data?.map((c) => (
            <Select.Option
              key={c.projectCategoryId}
              value={c.projectCategoryId}
            >
              {c.name}
            </Select.Option>
          ))}
        </Select>
      )} */}
    </Card>
  );
};

export default RenderFilter;

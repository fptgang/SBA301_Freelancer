import React, { useState, useEffect } from "react";
import { Form, Input, Typography, Select, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { create } from "domain";

const { Title, Text } = Typography;

// Simplified proficiency enum - matches the one in other components
enum ProficiencyEnum {
  Beginner = "BEGINNER",
  Intermediate = "INTERMEDIATE",
  Expert = "EXPERT",
}

interface FreelancerProfileProps {
  form: any;
}

export const FreelancerProfile: React.FC<FreelancerProfileProps> = ({
  form,
}) => {
  // Mock skill options - in a real app, this would come from an API
  const { selectProps: skillSelectProps, queryResult: skillsQueryResult } =
    useSelect({
      resource: "skills",
      optionLabel: "name",
      optionValue: "skillId",
      pagination: {
        pageSize: 1000,
      },
    });
  const skillOptions = skillsQueryResult?.data?.data;

  return (
    <div className="w-full max-w-xl">
      <Title level={4} className="mb-6">
        Professional Profile
      </Title>
      <Text className="mb-6 block">
        Let's set up your freelancer profile to help clients find you
      </Text>

      <Form.Item
        name="overview"
        label="Professional Overview"
        rules={[
          { required: true, message: "Please provide a professional overview" },
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Describe your professional experience, expertise and skills"
        />
      </Form.Item>

      <Form.Item
        name="education"
        label="Education"
        rules={[
          {
            required: true,
            message: "Please provide your educational background",
          },
        ]}
      >
        <Input placeholder="Highest degree, institution, year" />
      </Form.Item>

      <Form.Item
        name="language"
        label="Primary Language"
        rules={[
          { required: true, message: "Please select your primary language" },
        ]}
      >
        <Select
          placeholder="Select your primary language"
          options={[
            { value: "English", label: "English" },
            { value: "Spanish", label: "Spanish" },
            { value: "French", label: "French" },
            { value: "German", label: "German" },
            { value: "Chinese", label: "Chinese" },
            { value: "Japanese", label: "Japanese" },
            { value: "Vietnamese", label: "Vietnamese" },
            { value: "Other", label: "Other" },
          ]}
        />
      </Form.Item>

      {/* Skills form list */}
      <Form.List name="profileSkills">
        {(fields, { add, remove }) => (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item label="Your Skills">
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    skill: undefined,
                    proficiency: ProficiencyEnum.Beginner,
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                Add Skill
              </Button>
            </Form.Item>

            {fields.map(({ key, name, ...restField }) => {
              // Get current field's skill ID to filter out from options
              const currentSkills = form.getFieldValue("profileSkills") || [];
              const usedSkillIds = currentSkills
                .map((s: any) => s?.skill?.skillId)
                .filter((id: number) => id !== undefined);

              // Filter out already selected skills
              const availableSkills = skillOptions?.filter(
                (skill) =>
                  !usedSkillIds.includes(skill.skillId) ||
                  currentSkills[name]?.skill?.skillId === skill.skillId
              );

              console.log("Available skills:", availableSkills);
              console.log("Used skill IDs:", usedSkillIds);
              console.log("Current skills:", currentSkills);

              return (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      { required: true, message: "Please select a skill" },
                    ]}
                  >
                    <Select
                      style={{ width: 200 }}
                      placeholder="Select skill"
                      options={availableSkills?.map((skill) => ({
                        value: skill.skillId,
                        label: skill.name,
                      }))}
                      onChange={(value) => {
                        const skill = skillOptions?.find(
                          (s) => s.skillId === value
                        );
                        form.setFieldValue(["profileSkills", name, "skill"], {
                          skillId: value,
                          name: skill?.name,
                        });
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "proficiency"]}
                    rules={[
                      { required: true, message: "Please select proficiency" },
                    ]}
                  >
                    <Select
                      style={{ width: 150 }}
                      placeholder="Select proficiency"
                      options={Object.values(ProficiencyEnum).map((p) => ({
                        value: p,
                        label:
                          p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
                      }))}
                    />
                  </Form.Item>

                  <Button type="text" danger onClick={() => remove(name)}>
                    <DeleteOutlined />
                  </Button>
                </Space>
              );
            })}
          </Space>
        )}
      </Form.List>

      <Form.Item
        name="isVisible"
        valuePropName="checked"
        initialValue={true}
        hidden
      >
        <Input type="checkbox" />
      </Form.Item>
    </div>
  );
};

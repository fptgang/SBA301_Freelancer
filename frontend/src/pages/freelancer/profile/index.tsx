import React, { useState } from "react";
import { useForm, Edit, useSelect } from "@refinedev/antd";
import {
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Input,
  Form,
  Select,
  notification,
  Button,
} from "antd";
import type { SelectProps } from "antd/es/select";
import {
  ProficiencyEnum,
  ProfileDto,
  ProfileFormDto,
  ProfileSkillDto,
  SkillDto,
} from "../../../../generated";
import { store } from "../../../store";
import { useShow } from "@refinedev/core";

const { TextArea } = Input;
const { Title } = Typography;

interface ISkillOption {
  value: number;
  label: string;
}

const FreelancerProfilePage: React.FC = () => {
  const user = store.getState().auth.account;
  const [newSkill, setNewSkill] = useState<Partial<ProfileSkillDto>>({});

  const { formProps, saveButtonProps, queryResult } = useForm<ProfileFormDto>({
    resource: "profiles",
    id: user?.profileId,
    action: "edit",
  });

  const { selectProps: skillSelectProps, queryResult: skillData } =
    useSelect<SkillDto>({
      resource: "skills",
      optionLabel: "name",
      optionValue: "skillId",
      pagination: { pageSize: 100 },
    });

  const skillOptions = skillData?.data?.data;

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title={<Title level={3}>Freelancer Profile</Title>}
      headerButtons={<></>}
    >
      <Form {...formProps} layout="vertical">
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Overview"
                name="overview"
                rules={[
                  { required: true, message: "Please enter an overview" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Introduce yourself and your experience"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Education"
                name="education"
                rules={[
                  {
                    required: true,
                    message: "Please enter education information",
                  },
                ]}
              >
                <TextArea
                  rows={2}
                  placeholder="Education level and certificates"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Language"
                name="language"
                rules={[{ required: true, message: "Please select language" }]}
              >
                <Input placeholder="Enter language" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.List name="skills">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Form.Item label="Skills">
                      <Space>
                        <Select
                          {...skillSelectProps}
                          placeholder="Select skill"
                          onSelect={(option) => {
                            setNewSkill((prev) => ({
                              ...prev,
                              skill: {
                                skillId: Number(option),
                                name:
                                  skillOptions?.find(
                                    (skill) => skill.skillId === Number(option)
                                  )?.name || "abc",
                              },
                            }));
                          }}
                          value={newSkill.skill?.skillId}
                        />
                        <Select
                          options={Object.values(ProficiencyEnum).map(
                            (value) => ({
                              label: value,
                              value,
                            })
                          )}
                          placeholder="Select proficiency level"
                          onSelect={(value) => {
                            setNewSkill((prev) => ({
                              ...prev,
                              proficiency: value as ProficiencyEnum,
                            }));
                          }}
                          value={newSkill?.proficiency}
                        />
                        <a
                          onClick={() => {
                            if (newSkill?.skill && newSkill?.proficiency) {
                              const currentSkills =
                                formProps.form?.getFieldValue("skills") || [];
                              const skillExists = currentSkills.some(
                                (item: ProfileSkillDto) =>
                                  item.skill?.skillId ===
                                  newSkill.skill?.skillId
                              );

                              if (skillExists) {
                                notification.warning({
                                  message: "This skill is existed",
                                });
                                return;
                              }

                              add(newSkill);
                              setNewSkill({});
                            }
                          }}
                        >
                          Add skill
                        </a>
                      </Space>
                    </Form.Item>
                    {fields.map(({ key, name }) => (
                      <Space key={key} align="baseline">
                        <Form.Item
                          name={[name, "skill", "name"]}
                          rules={[{ required: true }]}
                        >
                          <Select
                            {...skillSelectProps}
                            placeholder="Select skill"
                          />
                        </Form.Item>
                        <Form.Item
                          name={[name, "proficiency"]}
                          rules={[{ required: true }]}
                        >
                          <Select
                            options={Object.values(ProficiencyEnum).map(
                              (value) => ({
                                label: value,
                                value,
                              })
                            )}
                            placeholder="Select proficiency level"
                          />
                        </Form.Item>
                        <a onClick={() => remove(name)}>Remove</a>
                      </Space>
                    ))}
                  </Space>
                )}
              </Form.List>
            </Col>

            <Col span={24}>
              {queryResult?.data?.data?.skills?.map(
                (skill: ProfileSkillDto) => (
                  <Tag key={skill.profileSkillId} color="blue">
                    {skill.skill?.name} - {skill.proficiency}
                  </Tag>
                )
              )}
            </Col>
          </Row>
        </Card>
      </Form>
    </Edit>
  );
};

export default FreelancerProfilePage;

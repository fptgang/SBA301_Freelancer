import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Card,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AccountDto } from "../../../../generated";
import { useGetIdentity } from "@refinedev/core";

export const SkillsEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    redirect: false,
  });

  const skillsData = queryResult?.data?.data;

  const { selectProps: skillSelectProps } = useSelect({
    resource: "skills",
    defaultValue: skillsData?.skillId,
    optionLabel: "name",
  });

  const nameValidationRules = [
    { required: true, message: "Name is required" },
    { min: 2, message: "Must be at least 2 characters" },
    { max: 50, message: "Cannot exceed 50 characters" },
  ];

  const { data: user } = useGetIdentity<AccountDto>();
  const isAdmin = user?.role === "ADMIN";
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Card
        title={
          <span className="text-lg font-semibold flex items-center gap-2"></span>
        }
        className="mb-4"
      >
        <Form
          {...formProps}
          layout="vertical"
          className="space-y-4"
          requiredMark="optional"
        >
          <Row gutter={24}>
            <Col span={24} md={12}>
              <Form.Item
                label={<span className="flex items-center gap-2">Name</span>}
                name="name"
                rules={nameValidationRules}
                validateTrigger={["onChange", "onBlur"]}
              >
                <Input
                  placeholder="Enter skill name"
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {isAdmin && (
            <Row gutter={24}>
              <Col span={24} md={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <EyeOutlined />
                      Visibility
                      <Tooltip title="Controls whether this skill is visible to users">
                        <QuestionCircleOutlined className="text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  valuePropName="checked"
                  name="isVisible"
                  rules={[{ required: true }]}
                >
                  <Checkbox>Is Visible</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Card>
    </Edit>
  );
};

import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";

export const ReportsEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const reportsData = query?.data?.data;

  const { selectProps: reportSelectProps } = useSelect({
    resource: "reports",
    defaultValue: reportsData?.reportId,
  });

  const { selectProps: projectSelectProps } = useSelect({
    resource: "projects",
    defaultValue: reportsData?.projectId,
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Report"
          name={"reportId"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...reportSelectProps} />
        </Form.Item>
        <Form.Item
          label="Project"
          name={"projectId"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...projectSelectProps} />
        </Form.Item>
        <Form.Item
          label="Reason"
          name={["reason"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Status"
          name={["status"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Created At"
          name={["createdAt"]}
          rules={[
            {
              required: true,
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="Updated At"
          name={["updatedAt"]}
          rules={[
            {
              required: true,
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker />
        </Form.Item>
      </Form>
    </Edit>
  );
};

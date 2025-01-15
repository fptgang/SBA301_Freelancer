import React from "react";
import { useShow, useOne } from "@refinedev/core";
import {
  Show,
  TagField,
  TextField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import { Typography } from "antd";

const { Title } = Typography;

export const ProjectCategoriesShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  const { data: projectCategoryData, isLoading: projectCategoryIsLoading } =
    useOne({
      resource: "projectCategories",
      id: record?.projectCategoryId || "",
      queryOptions: {
        enabled: !!record,
      },
    });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Project Category</Title>
      {projectCategoryIsLoading ? (
        <>Loading...</>
      ) : (
        <>{projectCategoryData?.data?.projectCategoryId}</>
      )}
      <Title level={5}>Name</Title>
      <TextField value={record?.name} />
      {localStorage.getItem("role") == "ADMIN" ? (
        <>
          <Title level={5}>Is Visible</Title>
          <BooleanField value={record?.isVisible} />
        </>
      ) : (
        ""
      )}
      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updatedAt} />
    </Show>
  );
};

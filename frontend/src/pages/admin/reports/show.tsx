import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show, TagField, TextField, DateField } from "@refinedev/antd";
import { Typography } from "antd";
import { ReportDto } from "../../../../generated";

const { Title } = Typography;

export const ReportsShow = () => {
  const { query } = useShow<ReportDto>();
  const { data, isLoading } = query;

  const record = data?.data;

  const { data: reportData, isLoading: reportIsLoading } = useOne({
    resource: "reports",
    id: record?.reportId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const { data: projectData, isLoading: projectIsLoading } = useOne({
    resource: "projects",
    id: record?.projectId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Report</Title>
      {reportIsLoading ? (
        <>Loading...</>
      ) : (
        <>
          <TextField value={record?.reportId} />
        </>
      )}
      <Title level={5}>Project</Title>
      {projectIsLoading ? <>Loading...</> : <>{projectData?.data?.title}</>}
      <Title level={5}>Reason</Title>
      <TextField value={record?.reason} />
      <Title level={5}>Status</Title>
      <TextField value={record?.status} />
      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updatedAt} />
    </Show>
  );
};

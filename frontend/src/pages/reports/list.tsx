import React from "react";
import { BaseRecord, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Tooltip, notification, Button } from "antd";
import { ProjectDto, ReportDto } from "../../../generated";
import api from "../../config/openapi-config";
import { LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

export const ReportsList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
  const nav = useNavigate();

  const { data: reportData, isLoading: reportIsLoading } = useMany<ReportDto>({
    resource: "reports",
    ids: tableProps?.dataSource?.map((item) => item?.reportId) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const { data: projectData, isLoading: projectIsLoading } =
    useMany<ProjectDto>({
      resource: "projects",
      ids:
        reportData?.data
          ?.map((item) => item?.projectId)
          .filter((id): id is number => id !== undefined) ?? [],
      queryOptions: {
        enabled: !!tableProps?.dataSource,
      },
    });

  const joinProject = async (projectId: number) => {
    try {
      const response = await api
        .joinProject({ projectId: projectId })
        .then((res) => {
          notification.success({
            message: "Success",
            description: "You have successfully joined the project",
          });
          nav("/message", { state: { projectId: projectId } });
        });
    } catch (e) {
      console.log(e);
      notification.error({
        message: "Error",
        description: e?.message,
      });
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["reportId"]}
          title="Report"
          render={(value) => value}
        />

        <Table.Column
          dataIndex={["projectId"]}
          title="Project"
          render={(value) =>
            projectIsLoading ? (
              <>Loading...</>
            ) : (
              projectData?.data?.find((item) => item.projectId === value)?.title
            )
          }
        />
        <Table.Column
          dataIndex={["status"]}
          title="Status"
          render={(value) => value}
        />
        <Table.Column
          dataIndex={["createdAt"]}
          title="Created At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["updatedAt"]}
          title="Updated At"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: ReportDto) => (
            <Space size="middle">
              <Tooltip title="Edit Project">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.reportId}
                  disabled={record.status !== "UNSOLVED"}
                />
              </Tooltip>
              <Tooltip title="View Details">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.reportId}
                  disabled={false}
                />
              </Tooltip>
              {record.status === "UNSOLVED" && (
                <Tooltip title="Join Project">
                  <Button onClick={() => joinProject(record.projectId || 0)}>
                    <LoginOutlined />
                  </Button>
                </Tooltip>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

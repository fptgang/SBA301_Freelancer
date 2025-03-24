import React, {useEffect, useState} from "react";
import {HttpError, useGetIdentity, useShow} from "@refinedev/core";
import {AccountDto, ProjectDto} from "../../../../generated";
import {useParams} from "react-router";
import ProjectInternalDetail from "./private";
import ProjectPublicDetail from "./public";
import {Spin, Typography} from "antd";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useGetIdentity<AccountDto>();
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useShow<ProjectDto, HttpError>({
    resource: "projects",
    id,
  }).query;
  const [internalVersion, setInternalVersion] = useState(false)

  useEffect(() => {
    refetch();
  }, [refetch, user]);

  useEffect(() => {
    const project = data?.data;
    if (user && project && (project.client?.accountId === user.accountId ||
        project.contract?.freelancer?.accountId === user.accountId)) {
      setInternalVersion(true)
    }
  }, [data, user]);

  ////////////////////////////////

  if (isLoading) {
    return <Spin size="large" style={{ margin: "100px auto", display: "block" }} />
  }

  if (isError || !data?.data) {
    return (
      <Typography.Text
        strong
        style={{
          color: "red",
          display: "block",
          textAlign: "center",
          marginTop: 100,
        }}
      >
        Error loading project details
      </Typography.Text>
    );
  }

  return internalVersion ? <ProjectInternalDetail project={data.data} /> :
    <ProjectPublicDetail project={data.data} />
};

export default ProjectDetail;
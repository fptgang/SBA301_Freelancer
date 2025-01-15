import React from "react";
import { useShow, useOne } from "@refinedev/core";
import {
  Show,
  TagField,
  EmailField,
  TextField,
  BooleanField,
  DateField,
} from "@refinedev/antd";
import { Typography } from "antd";

const { Title } = Typography;

export const AccountsShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  const { data: accountData, isLoading: accountIsLoading } = useOne({
    resource: "accounts",
    id: record?.accountId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Account</Title>
      {accountIsLoading ? (
        <>Loading...</>
      ) : (
        <>{accountData?.data?.firstName + " " + accountData?.data?.lastName}</>
      )}
      <Title level={5}>Email</Title>
      <EmailField value={record?.email} />
      <Title level={5}>First Name</Title>
      <TextField value={record?.firstName} />
      <Title level={5}>Last Name</Title>
      <TextField value={record?.lastName} />
      <Title level={5}>Role</Title>
      <TextField value={record?.role} />
      <Title level={5}>Is Verified</Title>
      <BooleanField value={record?.isVerified} />
      <Title level={5}>Verified At</Title>
      <DateField value={record?.verifiedAt} />
      <Title level={5}>Is Visible</Title>
      <BooleanField value={record?.isVisible} />
      <Title level={5}>Created At</Title>
      <DateField value={record?.createdAt} />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updatedAt} />
    </Show>
  );
};

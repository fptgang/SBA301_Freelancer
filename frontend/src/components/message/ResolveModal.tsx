import { useCreate, useGetIdentity } from "@refinedev/core";
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Result,
  Row,
  Select,
  Tooltip,
  Typography,
} from "antd";
import React from "react";
import {
  AccountDto,
  ProjectDto,
  SolutionDto,
  SolutionDtoProjectStatusEnum,
  SolutionDtoTransferDepositToEnum,
} from "../../../generated";
import { store } from "../../store";
import { useForm } from "@refinedev/antd";
import { report } from "process";
import {
  QuestionCircleOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../services/api/openapi-config";
import { useNavigate } from "react-router";
interface ResolveModalProps {
  showResolveModal: boolean;
  setShowResolveModal: (value: boolean) => void;
  project: ProjectDto;
}
export const ResolveModal: React.FC<ResolveModalProps> = ({
  showResolveModal,
  setShowResolveModal,
  project,
}) => {
  const { data: user } = useGetIdentity<AccountDto>();
  const [form] = Form.useForm();
  const transferToRoleOptions = Object.values(SolutionDtoTransferDepositToEnum);
  const projectStatusOptions = Object.values(SolutionDtoProjectStatusEnum);
  const nav = useNavigate();
  const [haveAction, setHaveAction] = React.useState(false);

  const handleResolve = async (value: any) => {
    const solution: SolutionDto = {
      solution: value.solution,
      haveAction: haveAction,
      projectStatus: value.projectStatus,
      transferDepositTo: value.transferDepositTo,
    };
    await api
      .resolveReport({
        reportId:
          project.reports?.find((report) => report.status == "SOLVING")
            ?.reportId || 0,
        solutionDto: solution,
      })
      .then(async (data) => {
        console.log("Report resolved:", data);
        notification.success({
          message: "Report resolved successfully!",
        });
        setShowResolveModal(false);
        await api
          .leaveProject({ projectId: project.projectId || 0 })
          .then(() => {
            nav("/admin/reports");
          });
      })
      .catch((e) => {
        console.error(e);
        notification.error({
          message: "Deposit failed!",
        });
      });
    form.resetFields();
  };

  return (
    <Modal
      title={`Resolve ${project.title}`}
      visible={showResolveModal}
      footer={[
        <Button key="cancel" onClick={() => setShowResolveModal(false)}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            form.submit();
          }}
        >
          Submit
        </Button>,
      ]}
      onCancel={() => {
        setShowResolveModal(false);
        form.resetFields();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4"
        requiredMark="optional"
        onFinish={handleResolve}
      >
        <Form.Item
          label={
            <span className="flex items-center gap-2">
              <SolutionOutlined />
              Solution
            </span>
          }
          name="solution"
          rules={[{ required: true, message: "Solution is required" }]}
          validateTrigger={["onChange", "onBlur"]}
        >
          <Input.TextArea
            placeholder="Enter solution"
            className="w-full"
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={
            <span className="flex items-center gap-2">
              Will you have action on this report?
              <Tooltip title="Select an action to take on this project.">
                <QuestionCircleOutlined className="text-gray-400" />
              </Tooltip>
            </span>
          }
          name="haveAction"
          rules={[{ required: true, message: "You have to choose" }]}
        >
          <Select
            placeholder="Will you have action on this report:"
            className="w-full"
            optionFilterProp="label"
            defaultValue={"false"}
            value={haveAction ? "true" : "false"}
            onChange={(value) => setHaveAction(value === "true")}
          >
            <Select.Option value="true">Yes</Select.Option>
            <Select.Option value="false">No</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <span className="flex items-center gap-2">
              Action on Project
              <Tooltip title="Select an action to take on this project.">
                <QuestionCircleOutlined className="text-gray-400" />
              </Tooltip>
            </span>
          }
          name="projectStatus"
          rules={
            haveAction
              ? [{ required: true, message: "Please select an action" }]
              : []
          }
        >
          <Select
            placeholder="Select action"
            options={projectStatusOptions.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-full"
            showSearch
            optionFilterProp="label"
            disabled={!haveAction}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="flex items-center gap-2">
              <UserOutlined />
              Transfer To:
              <Tooltip title="Select a role to transfer this milestone deposit to">
                <QuestionCircleOutlined className="text-gray-400" />
              </Tooltip>
            </span>
          }
          name="transferDepositTo"
          rules={
            haveAction
              ? [{ required: true, message: "Please select a role" }]
              : []
          }
        >
          <Select
            placeholder="Select role"
            options={transferToRoleOptions.map((role) => ({
              label: role,
              value: role,
            }))}
            className="w-full"
            showSearch
            optionFilterProp="label"
            disabled={!haveAction}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

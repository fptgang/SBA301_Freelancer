import {
  Avatar,
  Badge,
  Button,
  List,
  Popconfirm,
  Select,
  Tag,
  Typography
} from "antd";
import ContractCreateButton from "./contract-create";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  UserOutlined
} from "@ant-design/icons";
import React, {useState} from "react";
import {
  ProjectDto,
  ProjectStatusDto,
  ProposalDto,
  ProposalStatusDto
} from "../../../../../generated";
import {useCustomMutation, useInvalidate, useList} from "@refinedev/core";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import FileList from "../../../../components/common/file-list";

const {Title, Text, Paragraph} = Typography;

const TabProposals: React.FC<{
  project: ProjectDto,
  openProfile: (profileId: number) => void,
  onContractMade: () => void,
}>
  = ({project, openProfile, onContractMade}) => {
  const [localSettings] = useLocalSettings()
  const [statusFilter, setStatusFilter] = useState<string | null>(
    (project.status === ProjectStatusDto.Open || project.status === ProjectStatusDto.Paused) ? "PENDING" :
      null);

  const {mutate: rejectProposal} = useCustomMutation();
  const {data: proposalsData, isLoading: isProposalsLoading} =
    useList<ProposalDto>({
      resource: "proposals",
      filters: [
        {
          field: "project.projectId",
          operator: "eq",
          value: project.projectId,
        },
        ...(statusFilter ? [{
          field: "status",
          operator: "eq" as const,
          value: statusFilter,
        }] : []),
      ],
    });

  const proposals = proposalsData?.data || [];
  const invalidate = useInvalidate();

  // Handle rejecting a proposal
  const handleRejectProposal = async (proposalId: number) => {
    try {
      rejectProposal({
        url: `proposals/${proposalId}/reject`,
        method: "put",
        values: {},
        successNotification: () => {
          return {
            type: "success",
            message: "Proposal rejected",
          };
        },
        errorNotification: () => {
          return {
            type: "error",
            message: "Failed to reject proposal",
          };
        },
      });

      // Manually invalidate the cache after successful mutation
      invalidate({
        resource: "proposals",
        invalidates: ["list", "many", "detail"],
      });
      invalidate({
        resource: "projects",
        id: project.projectId,
        invalidates: ["detail"],
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to reject proposal",
      });
    }
  };

  return <>
    <div className="mb-4">
      <Select
        style={{width: 200}}
        value={statusFilter}
        onChange={(value) => setStatusFilter(value)}
        allowClear
        placeholder="Filter by status"
        options={[
          {value: "PENDING", label: "Pending"},
          {value: "ACCEPTED", label: "Accepted"},
          {value: "REJECTED", label: "Rejected"},
          {value: "EXPIRED", label: "Expired"},
          {value: "WITHDRAWN", label: "Withdrawn"},
        ]}
        onClear={() => setStatusFilter("")}
      />
    </div>

    <List
      itemLayout="vertical"
      dataSource={proposals}
      className="proposal-list"
      renderItem={(proposal) => (
        <List.Item
          key={proposal.proposalId}
          className="rounded-lg mb-4 border border-gray-100 !p-5"
          actions={
            proposal.status === ProposalStatusDto.Pending
              ? [
                <div className="flex justify-end space-x-3 mt-4">
                  <Popconfirm
                    title="Are you sure you want to reject this proposal?"
                    onConfirm={() =>
                      handleRejectProposal(
                        proposal.proposalId || -1
                      )
                    }
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger>Reject Proposal</Button>
                  </Popconfirm>
                  <ContractCreateButton
                    proposal={proposal}
                    project={project}
                    onSubmit={onContractMade}
                  />
                </div>,
              ]
              : []
          }
        >
          <List.Item.Meta
            avatar={
              <Avatar
                icon={<UserOutlined/>}
                size={64}
                className="bg-blue-500"
                src={proposal.freelancer?.avatarUrl}
              />
            }
            title={
              <div className="flex justify-between items-center">
                <Text strong
                      className="text-lg cursor-pointer hover:text-blue-500"
                      onClick={() => openProfile(proposal.freelancer?.profileId || 0)}>
                  {`${proposal.freelancer?.firstName} ${proposal.freelancer?.lastName || ''}`}
                  {proposal.freelancer?.isVerified &&
                    <CheckCircleOutlined className="ml-1 text-blue-500"/>}
                </Text>
                <div className="flex items-center">
                  <Tag color="blue">Budget: ${proposal.budget}</Tag>
                  <Badge
                    status={
                      proposal.status === ProposalStatusDto.Accepted
                        ? "success"
                        : proposal.status === ProposalStatusDto.Rejected
                          ? "error"
                          : proposal.status === ProposalStatusDto.Withdrawn
                            ? "default"
                            : proposal.status === ProposalStatusDto.Expired
                              ? "warning"
                              : "processing"
                    }
                    text={
                      <span className="font-medium">
                        {proposal.status}
                      </span>
                    }
                    className="ml-2"
                  />
                </div>
              </div>
            }
            description={
              <div className="mt-2 text-gray-600">
                <div className="flex items-center mb-1">
                  <CalendarOutlined className="mr-2"/>
                  Submitted{" "}
                  {proposal.createdAt ? localSettings.formatDateTime(proposal.createdAt) : "N/A"}
                </div>
                <div className="flex items-center">
                  <MessageOutlined className="mr-2"/>
                  Proposal #{proposal.proposalId}
                </div>
              </div>
            }
          />

          {proposal.notes && (
            <>
              <Title level={5}>
                Proposal Notes
              </Title>
              <Paragraph
                className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md border border-gray-100">
                {proposal.notes}
              </Paragraph>
            </>)}

          {proposal.files && proposal.files.length > 0 && (
            <>
              <Title level={5} className="text-gray-700">
                Attachments
              </Title>
              <FileList files={proposal.files}/>
            </>
          )}
        </List.Item>
      )}
    />
  </>
};

export default TabProposals;
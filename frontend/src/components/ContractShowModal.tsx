import React, { useEffect, useState } from "react";
import { Modal, Typography, Descriptions, Space, Button, Spin } from "antd";
import { ContractDto } from "../../generated/models/ContractDto";
import { ContractStatusDto } from "../../generated/models/ContractStatusDto";
import api from "../services/api/openapi-config";
import dayjs from "dayjs";
import { useOne } from "@refinedev/core";
import {useLocalSettings} from "../hooks/useLocalSettings";

const { Title, Text } = Typography;

interface ContractShowModalProps {
  visible: boolean;
  onClose: () => void;
  contractId: number | undefined;
}

const ContractShowModal: React.FC<ContractShowModalProps> = ({
  visible,
  onClose,
  contractId,
}) => {
  const [localSettings] = useLocalSettings()
  const { data: contractData, isLoading: loading } = useOne<ContractDto>({
    resource: "contracts",
    id: contractId,
    queryOptions: {
      enabled: !!contractId,
    },
  });

  const contract = contractData?.data;

  return (
    <Modal
      title="Contract Details"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : contract ? (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={4}>Contract Information</Title>
            <Descriptions column={2}>
              <Descriptions.Item label="Contract ID">
                {contract.contractId}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Text
                  type={
                    contract.status === ContractStatusDto.Signed
                      ? "success"
                      : "danger"
                  }
                >
                  {contract.status}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {localSettings.formatDateTime(contract.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Budget">
                ${contract.budget}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <Title level={4}>Project Information</Title>
            <Descriptions column={2}>
              <Descriptions.Item label="Project ID">
                {contract.projectId}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <Title level={4}>Freelancer Information</Title>
            <Descriptions column={2}>
              <Descriptions.Item label="Name">
                {contract.freelancer?.firstName} {contract.freelancer?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {contract.freelancer?.email}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {contract.proposal && (
            <div>
              <Title level={4}>Proposal Information</Title>
              <Descriptions column={2}>
                <Descriptions.Item label="Proposal ID">
                  {contract.proposal.proposalId}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {contract.proposal.notes}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          {contract.contractFile && (
            <div>
              <Title level={4}>Contract File</Title>
              <a
                href={contract.contractFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                View Contract File
              </a>
            </div>
          )}
        </Space>
      ) : (
        <div className="text-center py-8">
          <Text type="secondary">No contract details available</Text>
        </div>
      )}
    </Modal>
  );
};

export default ContractShowModal;

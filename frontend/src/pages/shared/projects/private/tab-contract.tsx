import React from "react";
import {ProjectDto, AccountDto, ContractStatusDto} from "../../../../../generated";
import {Avatar, Button, Card, Col, Divider, List, Row, Table, Tag, Typography} from "antd";
import {FileTextOutlined, ToolOutlined} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import FileList from "../../../../components/common/file-list";
import { useGetIdentity } from "@refinedev/core";
import ContractSignButton from "../../../../components/contract/contract-sign-button";

const { Title, Text, Paragraph } = Typography;

const TabContract: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings();
  const { data: user } = useGetIdentity<AccountDto>();
  const contract = project.contract;

  if (!contract) {
    return <Text>No contract available</Text>;
  }

  const visibleMilestones = project.milestones?.filter(m => m.isVisible).map(m => ({
    ...m,
    contractualBudget: m.budgetRatio! * (contract.budget || 0)
  })) || [];

  const isFreelancer = user?.role === "FREELANCER";
  const canSignContract = isFreelancer && contract.status === ContractStatusDto.Unsigned;

  return <>
    <Card title="Contract Details" bordered={false} style={{ marginBottom: 24 }}>
<Row gutter={[16, 16]}>
        <Col span={24}>
          <Text strong>Project:</Text> <Text>{project.title}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Client:</Text> <Text>{`${project.client?.firstName} ${project.client?.lastName || ''}`}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Freelancer:</Text> <Text>{`${contract.freelancer?.firstName} ${contract.freelancer?.lastName || ''}`}</Text>
        </Col>
<Col span={12}>
  <Text strong>Created At:</Text> <Text>{localSettings.formatDateTime(contract.createdAt!)}</Text>
</Col>
<Col span={12}>
  <Text strong>Signed At:</Text> <Text>{contract.signedAt ? localSettings.formatDateTime(contract.signedAt) : 'Not signed yet'}</Text>
</Col>
      </Row>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text strong>Start Date:</Text> <Text>{localSettings.formatDateTime(project.startDate!)}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Total Budget:</Text> <Text>${contract.budget}</Text>
        </Col>

        <Col span={24}>
          <Text strong>Milestones:</Text>
          <Table
            dataSource={visibleMilestones}
            style={{ width: '100%', marginTop: '16px' }}
            pagination={false}
            rowKey="milestoneId"
          >
            <Table.Column title="Title" dataIndex="title" key="title" />
            <Table.Column title="Budget Ratio" dataIndex="budgetRatio" key="budgetRatio" render={(text) => `${(text * 100).toFixed(0)}%`} />
            <Table.Column title="Absolute Budget" dataIndex="contractualBudget" key="contractualBudget" render={(text) => `$${text.toFixed(2)}`} />
            <Table.Column title="Deadline" dataIndex="deadline" key="deadline" render={(text) => localSettings.formatDateTime(text)} />
          </Table>
        </Col>
      </Row>
              <Divider />
          <Title level={5} className="text-gray-700">
            Attachment
          </Title>
      {contract.contractFile ? (
          <FileList files={[contract.contractFile]} />
      ) : (
        <Text type="secondary" className="italic">No supporting document attached</Text>
      )}
    </Card>

    {canSignContract && (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ContractSignButton contract={contract} project={project} />
      </div>
    )}
  </>;
};

export default TabContract;
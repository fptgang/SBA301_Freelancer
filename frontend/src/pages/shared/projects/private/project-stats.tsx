import React from "react";
import {
  AccountDto,
  AccountDtoRoleEnum,
  ContractStatusDto,
  ProjectDto,
  ProjectStatusDto,
  ProposalStatusDto
} from "../../../../../generated";
import {Card, Col, Row, Statistic} from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined
} from "@ant-design/icons";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import {useGetIdentity} from "@refinedev/core";

const ProjectStats: React.FC<{ project: ProjectDto }> = ({project}) => {
  const [localSettings] = useLocalSettings();
  const {data: user} = useGetIdentity<AccountDto>();

  return <>
    <Row gutter={16} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Created On"
            value={
              project.createdAt
                ? localSettings.formatDate(project.createdAt)
                : "N/A"
            }
            valueStyle={{fontSize: "16px"}}
            prefix={<CalendarOutlined/>}
            className="text-center"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          <Statistic
            title="Budget Range"
            value={`$${project.minBudget} - $${project.maxBudget}`}
            valueStyle={{fontSize: "16px"}}
            prefix={<DollarOutlined/>}
            className="text-center"
          />
        </Card>
      </Col>


      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          {(project.contract && project.contract?.status === ContractStatusDto.Signed) ?
            <Statistic
              title="Contractual Budget"
              value={`$${project.contract?.budget}`}
              valueStyle={{fontSize: "16px"}}
              prefix={<DollarOutlined/>}
              className="text-center"
            /> : (user?.role === AccountDtoRoleEnum.Client ?
                <Statistic
                  title="Proposals Received"
                  value={project.proposalCount}
                  valueStyle={{color: "#1890ff", fontSize: "16px"}}
                  prefix={<TeamOutlined/>}
                  className="text-center"
                /> : <Statistic
                  title="Proposed Budget"
                  value={`$${project.myProposals?.find(p => p.status === ProposalStatusDto.Pending)?.budget || 'N/A'}`}
                  valueStyle={{fontSize: "16px"}}
                  prefix={<DollarOutlined/>}
                  className="text-center"
                />
            )}
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full shadow-sm">
          {(project.status === ProjectStatusDto.InProgress && !!project.activeMilestone) ?
            <Statistic
              title="Upcoming Deadline"
              value={
                project.activeMilestone.deadline
                  ? localSettings.formatDateTime(project.activeMilestone.deadline)
                  : "N/A"
              }
              valueStyle={{fontSize: "16px"}}
              prefix={<CalendarOutlined/>}
              className="text-center"
            /> : <Statistic
              title="Start Date"
              value={
                project.startDate
                  ? localSettings.formatDateTime(project.startDate)
                  : "N/A"
              }
              valueStyle={{fontSize: "16px"}}
              prefix={<CalendarOutlined/>}
              className="text-center"
            />}
        </Card>
      </Col>
    </Row>
  </>
};

export default ProjectStats;
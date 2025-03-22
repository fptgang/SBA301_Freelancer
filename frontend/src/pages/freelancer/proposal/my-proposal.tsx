import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Row,
  Col,
  Card,
  Select,
  Tooltip,
  Badge,
  Statistic,
  Avatar,
  Divider,
  Empty,
  Menu,
  Dropdown,
  Modal,
  Alert,
  message
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  DownOutlined,
  ExportOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useGetIdentity, useList, useOne } from "@refinedev/core";
import type { ColumnsType } from "antd/es/table";
import { AccountDto, ProposalDto, ProjectDto, ContractDto } from "../../../../generated";
import api from "../../../services/api/openapi-config";
import { useLocation, useNavigate } from "react-router";
import { store } from "../../../store";
import {useLocalSettings} from "../../../hooks/useLocalSettings";
import { ContractSignButton } from "../../../components";

const { Title, Text } = Typography;
const { Option } = Select;

// Contract Signing Modal Component
const ContractSigningModal: React.FC<{
  visible: boolean;
  contractId: number | null;
  projectTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ visible, contractId, projectTitle, onClose, onSuccess }) => {
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch contract and project data when modal becomes visible
  useEffect(() => {
    const fetchData = async () => {
      if (visible && contractId) {
        setLoading(true);
        try {
          const contractData = await api.getContractById({
            contractId: contractId
          });
          setContract(contractData);
          
          if (contractData.projectId) {
            const projectData = await api.getProjectById({
              projectId: contractData.projectId
            });
            setProject(projectData);
          }
        } catch (error) {
          console.error("Error fetching contract data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [visible, contractId]);

  return (
    <Modal
      title="Sign Contract for Project"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <span>Loading contract details...</span>
        </div>
      ) : contract && project ? (
        <div className="space-y-4">
          <Alert
            message={`Sign Contract for: ${projectTitle}`}
            description="Review the contract details carefully before signing."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <ContractSignButton 
            contract={contract} 
            project={project} 
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <Alert
            message="Contract Not Found"
            description="Unable to load contract details. Please try again later."
            type="error"
            showIcon
          />
        </div>
      )}
    </Modal>
  );
};

const FreelancerMyProposalPage: React.FC = () => {
  const [localSettings] = useLocalSettings();
  const location = useLocation();
  const [projectId, setProjectId] = useState(location.state?.projectId || null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { data: user } = useGetIdentity<AccountDto>();
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>("");

  const { data, isLoading, refetch } = useList<ProposalDto>({
    resource: "proposals",
    filters: [
      {
        field: "project.projectId",
        operator: "eq",
        value: projectId || undefined,
      },
      {
        field: "freelancer.accountId",
        operator: "eq",
        value: user?.accountId || undefined,
      },
      {
        field: "status",
        operator: "eq",
        value: statusFilter || undefined,
      },
      {
        field: "project.title",
        operator: "contains",
        value: searchText || undefined,
      },
    ],
    sorters: sortBy
      ? [
          {
            field: sortBy,
            order: sortOrder,
          },
        ]
      : [
          {
            field: "proposalId",
            order: "desc",
          },
        ],
    queryOptions: {
      enabled: !!user,
    },
  });

  const nav = useNavigate();
  const proposals = data?.data || [];

  // Show contract signing modal
  const handleShowContractModal = async (proposalId: number | undefined, projectTitle: string) => {
    if (!proposalId) return;
    
    try {
      // Fetch the contract ID associated with this proposal
      const proposal = await api.getProposalById({ proposalId });
      if (proposal.contractId) {
        setSelectedContractId(proposal.contractId);
        setSelectedProjectTitle(projectTitle || "Project");
        setContractModalVisible(true);
      } else {
        message.error("No contract found for this proposal");
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      message.error("Failed to load contract details");
    }
  };

  // Calculate stats when proposals change
  useEffect(() => {
    if (proposals) {
      const stats = {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'PENDING').length,
        accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
        rejected: proposals.filter(p => p.status === 'REJECTED').length
      };
      setSummaryStats(stats);
    }
  }, [proposals]);

  const statusColors: Record<string, string> = {
    PENDING: "orange",
    ACCEPTED: "green",
    REJECTED: "red",
    WITHDRAWN: "gray",
    COMPLETED: "blue",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <ClockCircleOutlined />,
    ACCEPTED: <CheckCircleOutlined />,
    REJECTED: <DeleteOutlined />,
    WITHDRAWN: <DeleteOutlined />,
    COMPLETED: <CheckCircleOutlined />,
  };

  const handleBulkAction = (action: string) => {
    // This function will handle bulk actions later
    console.log(`Bulk action: ${action} on proposals:`, selectedRowKeys);
  };

  const bulkActionMenu = (
    <Menu>
      <Menu.Item key="export" icon={<ExportOutlined />} onClick={() => handleBulkAction('export')}>
        Export Selected
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="withdraw"
        icon={<DeleteOutlined />}
        danger
        disabled={selectedRowKeys.length === 0}
        onClick={() => handleBulkAction('withdraw')}
      >
        Withdraw Selected
      </Menu.Item>
    </Menu>
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'pending',
        text: 'Select Pending',
        onSelect: () => {
          const pendingKeys = proposals
            .filter(proposal => proposal.status === 'PENDING')
            .map(proposal => proposal.proposalId as React.Key);
          setSelectedRowKeys(pendingKeys);
        }
      }
    ]
  };

  const handleWithdrawProposal = (proposalId: number) => {
    Modal.confirm({
      title: 'Withdraw Proposal',
      content: 'Are you sure you want to withdraw this proposal? This action cannot be undone.',
      okText: 'Yes, Withdraw',
      okType: 'danger',
      cancelText: 'Cancel',
      icon: <DeleteOutlined style={{ color: '#f5222d' }} />,
      onOk: () => {
        api
          .withdrawProposal({
            proposalId: proposalId || -1,
          })
          .then(() => {
            refetch();
          });
      }
    });
  };

  const columns: ColumnsType<ProposalDto> = [
    {
      title: "Project",
      dataIndex: "projectId",
      key: "projectId",
      render: (text: string, record: ProposalDto) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            icon={<FileTextOutlined />} 
            style={{ backgroundColor: '#1890ff' }} 
            size="small" 
          />
          <Tooltip title="View project details">
            <a onClick={() => nav("/projects/" + record.projectId)}
               className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {text}
            </a>
          </Tooltip>
        </div>
      ),
      width: '25%',
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (amount: number) => (
        <div className="flex items-center space-x-2">
          <DollarCircleOutlined style={{ color: '#52c41a' }} />
          <span className="font-medium">${amount?.toFixed(2)}</span>
        </div>
      ),
      sorter: true,
      width: '15%',
    },
    {
      title: "Date Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined style={{ color: '#722ed1' }} />
          <span>{localSettings.formatDate(date)}</span>
        </div>
      ),
      sorter: true,
      width: '20%',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag 
          color={statusColors[status] || "default"}
          icon={statusIcons[status]}
          className="px-3 py-1 text-sm rounded-full"
        >
          {status}
        </Tag>
      ),
      width: '15%',
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ProposalDto) => (
        <Space size="small">
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => nav("/freelancer/proposals/" + record.proposalId)}
              type="primary"
              ghost
              size="small"
              shape="round"
              className="flex items-center justify-center"
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Tooltip title="Withdraw proposal">
              <Button
                icon={<DeleteOutlined />}
                onClick={() => record.proposalId && handleWithdrawProposal(record.proposalId)}
                danger
                size="small"
                shape="round"
                className="flex items-center justify-center"
              />
            </Tooltip>
          )}
          {record.status === "ACCEPTED" && (
            <Tooltip title="View project details & contract">
              <Button
                icon={<CheckCircleOutlined />}
                size="small"
                type="primary"
                onClick={() => handleShowContractModal(record.proposalId, record.projectId ? String(record.projectId) : "Project")}
              >
                Sign Contract
              </Button>
            </Tooltip>
          )}
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="details" icon={<EyeOutlined />} onClick={() => 
                nav("/freelancer/proposals/" + record.proposalId)
              }>
                View Details
              </Menu.Item>
              {record.status === "PENDING" && (
                <Menu.Item 
                  key="withdraw" 
                  icon={<DeleteOutlined />} 
                  danger
                  onClick={() => record.proposalId && handleWithdrawProposal(record.proposalId)}
                >
                  Withdraw Proposal
                </Menu.Item>
              )}
              {record.status === "ACCEPTED" && (
                <Menu.Item 
                  key="sign" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleShowContractModal(record.proposalId, record.projectId ? String(record.projectId) : "Project")}
                >
                  Sign Contract
                </Menu.Item>
              )}
            </Menu>
          } trigger={['click']}>
            <Button 
              icon={<MoreOutlined />} 
              size="small" 
              type="text"
              className="flex items-center justify-center"
            />
          </Dropdown>
        </Space>
      ),
      width: '25%',
      align: 'right' as const,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Row gutter={[24, 24]} align="middle" justify="space-between" className="mb-6">
          <Col>
            <Title level={3} className="mb-0">My Proposals</Title>
            <Text type="secondary">
              Track and manage all your project proposals
            </Text>
          </Col>
        </Row>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="Total Proposals" 
                value={summaryStats.total} 
                prefix={<FileTextOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="Pending" 
                value={summaryStats.pending} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="Accepted" 
                value={summaryStats.accepted} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="Rejected" 
                value={summaryStats.rejected} 
                prefix={<DeleteOutlined />} 
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} className="shadow-md">
          <div className="mb-6">
            <Title level={5} className="mb-4">Filters</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Search projects"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  className="w-full"
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Filter by status"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(value) => setStatusFilter(value)}
                  suffixIcon={<FilterOutlined />}
                  size="large"
                >
                  <Option value="PENDING">Pending</Option>
                  <Option value="ACCEPTED">Accepted</Option>
                  <Option value="REJECTED">Rejected</Option>
                  <Option value="WITHDRAWN">Withdrawn</Option>
                  <Option value="COMPLETED">Completed</Option>
                </Select>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Table actions area */}
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <div className="flex items-center space-x-2">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => nav("/projects")}
              >
                Create New Proposal
              </Button>
              <Dropdown overlay={bulkActionMenu} trigger={['click']} disabled={selectedRowKeys.length === 0}>
                <Button className={selectedRowKeys.length === 0 ? "opacity-60" : ""}>
                  Bulk Actions <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge count={selectedRowKeys.length} showZero color="#1890ff" style={{ marginRight: 8 }}>
                <Text type="secondary">Selected</Text>
              </Badge>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
                type="default"
              >
                Refresh
              </Button>
            </div>
          </div>

          <Table
            rowSelection={rowSelection}
            dataSource={proposals}
            columns={columns}
            rowKey="proposalId"
            loading={isLoading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} proposals`,
              position: ['bottomCenter'],
              className: "mt-4"
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No proposals found. Start bidding on projects to see them here!"
                />
              ),
            }}
            onChange={(pagination, filters, sorter: any) => {
              setProjectId(undefined);
              if (sorter && sorter.field) {
                setSortBy(sorter.field);
                setSortOrder(sorter.order === "descend" ? "desc" : "asc");
              } else {
                setSortBy(null);
                setSortOrder("asc");
              }
            }}
            className="custom-table"
            rowClassName="hover:bg-blue-50 transition-colors"
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </Card>
      </div>

      {/* Contract Signing Modal */}
      <ContractSigningModal
        visible={contractModalVisible}
        contractId={selectedContractId}
        projectTitle={selectedProjectTitle}
        onClose={() => setContractModalVisible(false)}
        onSuccess={() => {
          message.success("Contract signed successfully!");
          refetch();
        }}
      />
    </div>
  );
};

export default FreelancerMyProposalPage;

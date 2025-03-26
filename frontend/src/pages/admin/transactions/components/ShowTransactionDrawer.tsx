import React from "react";
import { useShow, useNotification } from "@refinedev/core";
import {
  Drawer,
  Skeleton,
  Space,
  Tag,
  Alert,
  Descriptions,
  Card,
  Button,
  Modal,
  Typography,
} from "antd";
import {
  DollarOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ArrowsAltOutlined,
  CheckOutlined,
  CloseOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  TransactionDto,
  TransactionStatusDto,
  TransactionTypeDto,
  UpdateWithdrawDto,
} from "../../../../../generated";
import { DateField, NumberField } from "@refinedev/antd";
import { Link } from "react-router";
import { useLocalSettings } from "../../../../hooks/useLocalSettings";
import api from "../../../../services/api/openapi-config";

const STATUS_COLOR_MAP: Record<TransactionStatusDto, string> = {
  SUCCESS: "green",
  PENDING: "orange",
  FAILED: "red",
};

const TYPE_COLOR_MAP: Record<TransactionTypeDto, string> = {
  ESCROW_RELEASE: "blue",
  DEPOSIT: "cyan",
  WITHDRAWAL: "magenta",
  ESCROW_DEPOSIT: "purple",
  ESCROW_REFUND: "red",
};

interface ShowTransactionDrawerProps {
  transaction?: TransactionDto;
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ShowTransactionDrawer: React.FC<ShowTransactionDrawerProps> = ({
  transaction,
  open,
  onClose,
  refetch,
}) => {
  const [localSettings] = useLocalSettings();
  const { open: openNotification } = useNotification();
  const [updateModalVisible, setUpdateModalVisible] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] =
    React.useState<TransactionStatusDto | null>(null);

  const handleStatusUpdate = async (status: TransactionStatusDto) => {
    if (!transaction) return;

    setUpdatingStatus(status);
    setUpdateModalVisible(true);
  };

  const confirmStatusUpdate = async () => {
    if (!transaction || !updatingStatus) return;

    try {
      const updateDto: UpdateWithdrawDto = {
        transactionId: transaction.transactionId,
        transactionStatus: updatingStatus,
      };

      await api
        .updateWithdrawRequest({
          updateWithdrawDto: updateDto,
        })
        .then(() => {
          refetch?.();
          onClose?.();
        })
        .catch((error) => {
          console.error("Error updating transaction status:", error);
          openNotification?.({
            type: "error",
            message: "Error updating status",
            description:
              "Failed to update transaction status. Please try again.",
          });
        });
      openNotification?.({
        type: "success",
        message: "Transaction status updated successfully",
        description: `Status has been updated to ${updatingStatus}`,
      });

      // Close modal and refresh the page
    } catch (error) {
      console.error("Error updating transaction status:", error);
      openNotification?.({
        type: "error",
        message: "Error updating status",
        description: "Failed to update transaction status. Please try again.",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusTag = (status: TransactionStatusDto) => (
    <Tag color={STATUS_COLOR_MAP[status]} className="text-sm">
      {status}
    </Tag>
  );

  const getTypeTag = (type: TransactionTypeDto) => (
    <Tag color={TYPE_COLOR_MAP[type]} className="text-sm">
      {type?.replace("_", " ")}
    </Tag>
  );

  return (
    <Drawer
      title="Transaction Details"
      open={open}
      onClose={onClose}
      width={800}
      destroyOnClose
    >
      <Space direction="vertical" size="large" className="w-full">
        <Link
          to={`/admin/transactions/show/${transaction?.transactionId}`}
          style={{ textAlign: "right", display: "block", color: "#1890ff" }}
        >
          {" "}
          View transaction details in full screen <ArrowsAltOutlined />
        </Link>
        {transaction?.status === "SUCCESS" && (
          <Alert
            message="Successful Transaction"
            description="This transaction has been completed successfully."
            type="success"
            showIcon
          />
        )}

        <Card
          title={
            <Space>
              <DollarOutlined className="text-blue-500" />
              <span className="font-semibold">Transaction Details</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <DollarOutlined />
                  Amount
                </Space>
              }
            >
              <NumberField
                value={transaction?.amount || 0}
                options={{
                  style: "currency",
                  currency: "USD",
                }}
              />
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <SwapOutlined />
                  Type
                </Space>
              }
            >
              {getTypeTag(transaction?.type)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CheckCircleOutlined />
                  Status
                </Space>
              }
            >
              {getStatusTag(transaction?.status)}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <ClockCircleOutlined />
                  Transaction Date
                </Space>
              }
            >
              <DateField
                value={transaction?.createdAt}
                format={localSettings.dateTimeFormat}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>
        {transaction?.type === TransactionTypeDto.Withdrawal && (
          <Card
            title={
              <Space>
                <BookOutlined className="text-blue-500" />
                <span className="font-semibold">Notes from user</span>
              </Space>
            }
            className="shadow-md"
          >
            <Typography.Title level={5}>
              {transaction?.notes || "No notes provided"}
            </Typography.Title>
          </Card>
        )}

        <Card
          title={
            <Space>
              <UserOutlined className="text-blue-500" />
              <span className="font-semibold">Account Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  From Account
                </Space>
              }
            >
              <Space direction="vertical">
                <span className="font-medium">
                  {transaction?.fromAccount?.firstName}{" "}
                  {transaction?.fromAccount?.lastName}
                </span>
                <Tag className="font-mono">
                  {transaction?.fromAccount?.accountId}
                </Tag>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  To Account
                </Space>
              }
            >
              <Space direction="vertical">
                <span className="font-medium">
                  {transaction?.toAccount?.firstName}{" "}
                  {transaction?.toAccount?.lastName}
                </span>
                <Tag className="font-mono">
                  {transaction?.toAccount?.accountId}
                </Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <ClockCircleOutlined className="text-blue-500" />
              <span className="font-semibold">System Information</span>
            </Space>
          }
          className="shadow-md"
        >
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Transaction ID" span={2}>
              <Tag className="font-mono">{transaction?.transactionId}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Add Withdrawal Status Update Section */}
        {transaction &&
          transaction.type === TransactionTypeDto.Withdrawal &&
          transaction.status === TransactionStatusDto.Pending && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined className="text-blue-500" />
                  <span className="font-semibold">
                    Withdrawal Status Update
                  </span>
                </Space>
              }
              className="shadow-md"
            >
              <Space direction="vertical" className="w-full">
                <Alert
                  message="Action Required"
                  description="Please review the withdrawal request and update its status."
                  type="warning"
                  showIcon
                />
                <Space className="mt-4">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() =>
                      handleStatusUpdate(TransactionStatusDto.Success)
                    }
                  >
                    Mark as Success
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() =>
                      handleStatusUpdate(TransactionStatusDto.Failed)
                    }
                  >
                    Mark as Failed
                  </Button>
                </Space>
              </Space>
            </Card>
          )}
      </Space>

      <Modal
        title="Confirm Status Update"
        open={updateModalVisible}
        onOk={confirmStatusUpdate}
        onCancel={() => {
          setUpdateModalVisible(false);
          setUpdatingStatus(null);
        }}
      >
        <p>
          Are you sure you want to update this withdrawal transaction status to{" "}
          <Tag color={updatingStatus === "SUCCESS" ? "success" : "error"}>
            {updatingStatus}
          </Tag>
          ?
        </p>
      </Modal>
    </Drawer>
  );
};

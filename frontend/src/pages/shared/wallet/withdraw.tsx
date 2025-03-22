import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Radio,
  Space,
} from "antd";
import { useNotification } from "@refinedev/core";
import api from "../../../services/api/openapi-config";

type WithdrawMethod = "VNPAY" | "INTERNAL_WALLET";

interface Bank {
  name: string;
  code: string;
}

// Mock bank data - replace with your actual bank list
const BANKS: Bank[] = [
  { name: "Bank of America", code: "BOA" },
  { name: "Chase", code: "CHASE" },
  { name: "Wells Fargo", code: "WF" },
];

export const WithdrawPage: React.FC = () => {
  const [form] = Form.useForm();
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>("VNPAY");
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { open } = useNotification();

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchBalance = async () => {
      try {
        // Simulating API call
        const response = await Promise.resolve(2500.0);
        setCurrentBalance(response);
      } catch (error) {
        open?.({
          type: "error",
          message: "Error",
          description: "Failed to fetch current balance",
        });
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  
  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);

    setSubmitting(true);

    try {
      const withdrawDto = {
        accountEmail: values.accountEmail,
        amount: Number(values.amount),
        paymentMethod: values.withdrawMethod,
        notes: "Withdraw",
      };

      const response = await api.createWithdrawRequest(
        {
          withdrawDto: withdrawDto,
        },
        undefined
      );

      console.log("API response:", response);

      open?.({
        type: "success",
        message: "Withdrawal request submitted successfully",
        description: "Your request is being processed",
      });

      form.resetFields();
    } catch (error) {
      console.error("Withdrawal error details:", error);

      open?.({
        type: "error",
        message: "Error",
        description:
          "Something went wrong while processing your request. Please check the console for details.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Withdraw" className="max-w-2xl mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ withdrawMethod: "VNPAY" }}
      >
        <Form.Item name="withdrawMethod" label="Withdrawal Method">
          <Radio.Group
            onChange={(e) => setWithdrawMethod(e.target.value)}
            value={withdrawMethod}
          >
            <Radio value="VNPAY">VNPay</Radio>
            <Radio value="INTERNAL_WALLET">Internal Wallet</Radio>
          </Radio.Group>
        </Form.Item>

        {withdrawMethod === "VNPAY" ? (
          <Form.Item
            name="accountEmail"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
        ) : (
          <Space direction="vertical" className="w-full">
            <Form.Item
              name="bankCode"
              label="Select Bank"
              rules={[{ required: true, message: "Please select a bank" }]}
            >
              <Select placeholder="Select your bank">
                {BANKS.map((bank) => (
                  <Select.Option key={bank.code} value={bank.code}>
                    {bank.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="accountName"
              label="Account Name"
              rules={[{ required: true, message: "Please enter account name" }]}
            >
              <Input placeholder="Enter account name" />
            </Form.Item>
            <Form.Item
              name="accountNumber"
              label="Account Number"
              rules={[
                { required: true, message: "Please enter account number" },
                { pattern: /^\d+$/, message: "Please enter numbers only" },
              ]}
            >
              <Input placeholder="Enter account number" />
            </Form.Item>
          </Space>
        )}
        <Form.Item
          name="amount"
          label="Amount (USD)"
          rules={[
            { required: true, message: "Please enter an amount" },
            {
              pattern: /^\d*\.?\d{0,2}$/,
              message: "Please enter a valid amount (up to 2 decimal places)",
            },
            {
              validator: (_, value) => {
                if (value && parseFloat(value) <= 0) {
                  return Promise.reject("Amount must be greater than zero");
                }
                if (value && parseFloat(value) > currentBalance) {
                  return Promise.reject(
                    `Amount cannot exceed current balance of $${currentBalance.toFixed(
                      2
                    )}`
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <div className="flex items-center gap-4">
            <Input className="w-full" placeholder="Enter amount" />
            <span className="text-gray-500 whitespace-nowrap">
              / ${currentBalance.toFixed(2)}
            </span>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Submit Withdrawal Request"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default WithdrawPage;

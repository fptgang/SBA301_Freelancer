import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Radio,
  Space,
  Spin,
  message,
} from "antd";
import { useGetIdentity, useNotification } from "@refinedev/core";
import api from "../../../services/api/openapi-config";
import axios from "axios";
import { AccountDto, WithdrawDto } from "../../../../generated";

type WithdrawMethod = "MOMO" | "ZALOPAY" | "BANK";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

// Payment Method Components
const MomoForm: React.FC = () => (
  <Space direction="vertical" className="w-full">
    <Form.Item
      name="momoPhone"
      label="Phone Number"
      rules={[
        { required: true, message: "Please enter your Momo phone number" },
        {
          pattern: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
          message: "Please enter a valid Vietnamese phone number",
        },
      ]}
    >
      <Input placeholder="Enter your Momo phone number" />
    </Form.Item>
    <Form.Item
      name="momoAccountName"
      label="Account Name"
      rules={[{ required: true, message: "Please enter Momo account name" }]}
    >
      <Input placeholder="Enter Momo account name" />
    </Form.Item>
  </Space>
);

const ZaloPayForm: React.FC = () => (
  <Space direction="vertical" className="w-full">
    <Form.Item
      name="zaloPayPhone"
      label="Phone Number"
      rules={[
        { required: true, message: "Please enter your ZaloPay phone number" },
        {
          pattern: /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
          message: "Please enter a valid Vietnamese phone number",
        },
      ]}
    >
      <Input placeholder="Enter your ZaloPay phone number" />
    </Form.Item>
    <Form.Item
      name="zaloPayAccountName"
      label="Account Name"
      rules={[{ required: true, message: "Please enter ZaloPay account name" }]}
    >
      <Input placeholder="Enter ZaloPay account name" />
    </Form.Item>
  </Space>
);

const BankForm: React.FC<{ banks: Bank[] }> = ({ banks }) => (
  <Space direction="vertical" className="w-full">
    <Form.Item
      name="bankCode"
      label="Select Bank"
      rules={[{ required: true, message: "Please select a bank" }]}
    >
      <Select
        placeholder="Search for your bank"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label as string).toLowerCase().includes(input.toLowerCase())
        }
        options={banks.map((bank) => ({
          value: bank.code,
          label: bank.name,
          icon: bank.logo,
        }))}
        optionRender={(option) => (
          <Space>
            <img
              src={option.data.icon}
              alt={option.data.label}
              style={{ width: 20, height: 20 }}
            />
            <span>{option.data.label}</span>
          </Space>
        )}
      />
    </Form.Item>
    <Form.Item
      name="bankAccountName"
      label="Account Name"
      rules={[{ required: true, message: "Please enter bank account name" }]}
    >
      <Input placeholder="Enter bank account name" />
    </Form.Item>
    <Form.Item
      name="bankAccountNumber"
      label="Account Number"
      rules={[
        { required: true, message: "Please enter bank account number" },
        { pattern: /^\d+$/, message: "Please enter numbers only" },
      ]}
    >
      <Input placeholder="Enter bank account number" />
    </Form.Item>
  </Space>
);

export const WithdrawPage: React.FC = () => {
  const [form] = Form.useForm();
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>("MOMO");
  const { data: user, refetch } = useGetIdentity<AccountDto>();
  const currentBalance = user?.balance || 0;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);
  const { open } = useNotification();

  useEffect(() => {
    // Fetch banks
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await axios.get("https://api.vietqr.io/v2/banks");
        if (response.data && response.data.code === "00") {
          setBanks(response.data.data);
        }
      } catch (error) {
        message.error("Failed to load banks list");
        console.error("Error fetching banks:", error);
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
    setSubmitting(true);

    try {
      // Prepare notes based on withdraw method
      let notes = "";

      switch (withdrawMethod) {
        case "MOMO":
          notes = `MOMO|${values.momoPhone}|${values.momoAccountName}`;
          break;
        case "ZALOPAY":
          notes = `ZALOPAY|${values.zaloPayPhone}|${values.zaloPayAccountName}`;
          break;
        case "BANK":
          const selectedBank = banks.find(
            (bank) => bank.code === values.bankCode
          );
          notes = `${selectedBank?.shortName || values.bankCode}|${
            values.bankAccountNumber
          }|${values.bankAccountName}`;
          break;
      }

      const withdrawDto: WithdrawDto = {
        accountId: user?.accountId || 0,
        amount: Number(values.amount),
        notes: notes,
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
      refetch();
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
        initialValues={{ withdrawMethod: "MOMO" }}
      >
        <Form.Item name="withdrawMethod" label="Withdrawal Method">
          <Radio.Group
            onChange={(e) => setWithdrawMethod(e.target.value)}
            value={withdrawMethod}
          >
            <Radio value="MOMO">Momo</Radio>
            <Radio value="ZALOPAY">ZaloPay</Radio>
            <Radio value="BANK">Bank Transfer</Radio>
          </Radio.Group>
        </Form.Item>

        {loadingBanks && withdrawMethod === "BANK" ? (
          <div className="text-center py-4">
            <Spin tip="Loading banks..." />
          </div>
        ) : (
          <>
            {withdrawMethod === "MOMO" && <MomoForm />}
            {withdrawMethod === "ZALOPAY" && <ZaloPayForm />}
            {withdrawMethod === "BANK" && <BankForm banks={banks} />}
          </>
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

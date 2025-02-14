import React from "react";
import { Card, Form, InputNumber, Button, Space } from "antd";

const DepositPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleVNPayPayment = () => {
    const amount = form.getFieldValue("amount");
    console.log("Processing VNPay payment for $", amount);
    // Add actual VNPay integration here
  };

  const handlePayPalPayment = () => {
    const amount = form.getFieldValue("amount");
    console.log("Processing PayPal payment for $", amount);
    // Add actual PayPal integration here
  };

  return (
    <Card title="Deposit" className="max-w-2xl mx-auto">
        <Form form={form} layout="vertical">
          <Form.Item
            label="Amount (USD)"
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              { type: "number", min: 1, message: "Amount must be greater than 0" },
            ]}
          >
            <InputNumber
              prefix="$"
              className="w-full"
              placeholder="Enter amount"
              precision={2}
            />
          </Form.Item>

          <Space direction="vertical" className="w-full">
            <Button
              type="primary"
              block
              onClick={handleVNPayPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              Pay with VNPay
            </Button>
            <Button
              type="primary"
              block
              onClick={handlePayPalPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Pay with PayPal
            </Button>
          </Space>
        </Form>
      </Card>
  );
};

export default DepositPage;

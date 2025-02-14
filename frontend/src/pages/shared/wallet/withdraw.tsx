import React, { useState, useEffect } from "react";
import { Card, Form, Input, Select, InputNumber, Button, Radio, Space } from "antd";
import { useNotification } from "@refinedev/core";

type WithdrawMethod = "paypal" | "bank";

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
    const [withdrawMethod, setWithdrawMethod] = useState<WithdrawMethod>("paypal");
    const [currentBalance, setCurrentBalance] = useState<number>(0);
    const { open } = useNotification();

    useEffect(() => {
        // TODO: Replace with actual API call
        const fetchBalance = async () => {
            try {
                // Simulating API call
                const response = await Promise.resolve(2500.00);
                setCurrentBalance(response);
            } catch (error) {
                open?.({
                    type: "error",
                    message: "Error",
                    description: "Failed to fetch current balance",
                });
            }
        };

        fetchBalance();
    }, []);

    const handleSubmit = async (values: any) => {
        try {
            // TODO: Implement your API call here
            console.log("Form values:", values);
            
            open?.({
                type: "success",
                message: "Withdrawal request submitted successfully",
                description: "Your request is being processed",
            });
            
            form.resetFields();
        } catch (error) {
            open?.({
                type: "error",
                message: "Error",
                description: "Something went wrong while processing your request",
            });
        }
    };

    return (
        <Card title="Withdraw" className="max-w-2xl mx-auto">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ withdrawMethod: "paypal" }}
            >
                <Form.Item
                    name="withdrawMethod"
                    label="Withdrawal Method"
                >
                    <Radio.Group 
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        value={withdrawMethod}
                    >
                        <Radio value="paypal">PayPal</Radio>
                        <Radio value="bank">Bank Transfer</Radio>
                    </Radio.Group>
                </Form.Item>

                {withdrawMethod === "paypal" ? (
                    <Form.Item
                        name="paypalEmail"
                        label="PayPal Email"
                        rules={[
                            { required: true, message: "Please enter your PayPal email" },
                            { type: "email", message: "Please enter a valid email" }
                        ]}
                    >
                        <Input placeholder="Enter your PayPal email" />
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
                                { pattern: /^\d+$/, message: "Please enter numbers only" }
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
                        { required: true, message: "Please enter amount" },
                        { type: "number", min: 1, message: "Amount must be greater than 0" }
                    ]}
                >
                    <div className="flex items-center gap-4">
                        <InputNumber
                            className="w-full"
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                            placeholder="Enter amount"
                            min={1}
                            max={currentBalance}
                        />
                        <span className="text-gray-500 whitespace-nowrap">/ ${currentBalance.toFixed(2)}</span>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="w-full">
                        Submit Withdrawal Request
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default WithdrawPage;

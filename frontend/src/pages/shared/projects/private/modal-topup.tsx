import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, notification, Card } from "antd";
import { useGetIdentity } from "@refinedev/core";
import { AccountDto, DepositDto, DepositDtoPaymentMethodEnum } from "../../../../../generated";
import api from "../../../../services/api/openapi-config";

interface ModalTopupProps {
  visible: boolean;
  suggestedAmount: number | undefined;
  onClose: () => void;
}

const ModalTopup: React.FC<ModalTopupProps> = ({ visible, onClose, suggestedAmount }) => {
  const [form] = Form.useForm();
  const { data: user } = useGetIdentity<AccountDto>();

  const handleFinish = async (values: any) => {
    const deposit: DepositDto = {
      amount: values.amount,
      paymentMethod: values.paymentMethod,
    };
    const response = await api
      .createDeposit({ depositDto: deposit })
      .then((data) => {
        console.log("Deposit successful:", data);
        if (data.paymentRedirectUrl)
          window.location.assign(data.paymentRedirectUrl);
      })
      .catch((e) => {
        console.error(e);
        notification.error({
          message: "Deposit failed!",
        });
      });
    form.resetFields();
  };

  return (
    <Modal
      visible={visible}
      title="Top Up Balance"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <p>
        Your current balance is:{" "}
        <strong>${user?.balance ? user.balance : 0}</strong>
      </p>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="amount"
          label="Amount"
          initialValue={suggestedAmount || 0}
          rules={[{ required: true, message: "Please input the amount!" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[
            { required: true, message: "Please select a payment method!" },
          ]}
        >
          <Select>
            <Select.Option value={DepositDtoPaymentMethodEnum.Vnpay}>
              VNPAY
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalTopup;

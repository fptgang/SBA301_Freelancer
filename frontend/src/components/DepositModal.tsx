import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, notification } from "antd";
import {
  DepositDto,
  DepositDtoPaymentMethodEnum,
} from "../../generated/models/DepositDto";
import api from "../services/api/openapi-config";

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();

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
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="amount"
          label="Amount"
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

export default DepositModal;

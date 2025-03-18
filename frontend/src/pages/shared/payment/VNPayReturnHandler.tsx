import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Card,
  Typography,
  Result,
  Spin,
  Space,
  Button,
  notification,
} from "antd";
import { useGetIdentity } from "@refinedev/core";
import {
  LoadingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { AccountDto } from "../../../../generated";
import { formatCurrency } from "../../../utils";

const { Text, Paragraph, Title } = Typography;

interface VNPayResponse {
  amount: number;
  bankCode: string;
  cardType: string;
  orderInfo: string;
  responseCode: string;
  transactionNo: string;
  transactionStatus: string;
  txnRef: string;
  secureHash: string;
  payDate?: string;
  bankTranNo?: string;
}

export const VNPayReturnHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useGetIdentity<AccountDto>();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentResponse, setPaymentResponse] = useState<VNPayResponse | null>(
    null
  );
  const [isValidSignature, setIsValidSignature] = useState<boolean>(true);

  // Validate the response from VNPay - This would be implemented on the server side
  // Here we're just simulating it and assuming the signature is valid
  const validateSignature = (
    params: Record<string, string>,
    secureHash: string
  ) => {
    // In a real implementation, this would perform an actual signature validation
    // against the VNPay secret key on the server

    // For demo purposes, we're assuming the signature is valid
    return true;
  };

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);

    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("vnp_")) {
        params[key] = value;
      }
    }

    const secureHash = params["vnp_SecureHash"] || "";
    // Remove secureHash from params for validation
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    // In a real app, you would validate the signature here
    const signatureValid = validateSignature(params, secureHash);
    setIsValidSignature(signatureValid);

    if (!signatureValid) {
      notification.error({
        message: "Security Error",
        description:
          "The payment data signature is invalid. This could indicate data tampering.",
        duration: 0,
      });
    }

    const response: VNPayResponse = {
      amount: parseInt(searchParams.get("vnp_Amount") || "0") / 100, // Convert amount from smaller units
      bankCode: searchParams.get("vnp_BankCode") || "",
      cardType: searchParams.get("vnp_CardType") || "",
      orderInfo: searchParams.get("vnp_OrderInfo") || "",
      responseCode: searchParams.get("vnp_ResponseCode") || "",
      transactionNo: searchParams.get("vnp_TransactionNo") || "",
      transactionStatus: searchParams.get("vnp_TransactionStatus") || "",
      txnRef: searchParams.get("vnp_TxnRef") || "",
      secureHash: searchParams.get("vnp_SecureHash") || "",
      payDate: searchParams.get("vnp_PayDate") || "",
      bankTranNo: searchParams.get("vnp_BankTranNo") || "",
    };

    setPaymentResponse(response);

    // Simulate a brief delay for user to see the result
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  }, [location.search]);

  // Get detailed response message based on VNPay response code
  const getResponseMessage = (code: string) => {
    switch (code) {
      case "00":
        return "Transaction successful";
      case "07":
        return "Money deducted successfully. Transaction flagged as suspicious (potential fraud or unusual activity).";
      case "09":
        return "Transaction failed: Your card/account has not been registered for Internet Banking.";
      case "10":
        return "Transaction failed: You entered incorrect card/account information more than 3 times";
      case "11":
        return "Transaction failed: Payment session has expired. Please try again.";
      case "12":
        return "Transaction failed: Your card/account has been locked.";
      case "13":
        return "Transaction failed: You entered an incorrect OTP.";
      case "24":
        return "Transaction failed: You cancelled the transaction";
      case "51":
        return "Transaction failed: Your account has insufficient funds.";
      case "65":
        return "Transaction failed: You have exceeded your daily transaction limit.";
      case "75":
        return "The payment bank is currently under maintenance.";
      case "79":
        return "Transaction failed: You entered the wrong payment password too many times.";
      default:
        return "Transaction failed due to other reasons.";
    }
  };

  // Get transaction status message based on VNPay transaction status
  const getTransactionStatusMessage = (status: string) => {
    switch (status) {
      case "00":
        return "Transaction successful";
      case "01":
        return "Transaction incomplete";
      case "02":
        return "Transaction error";
      case "04":
        return "Reversed transaction (Customer was charged by the bank but the transaction was not successful at VNPAY)";
      case "05":
        return "VNPAY is processing this transaction (refund transaction)";
      case "06":
        return "VNPAY has sent a refund request to the bank";
      case "07":
        return "Transaction suspected of fraud";
      case "09":
        return "Refund rejected";
      default:
        return "Unknown status";
    }
  };

  // Function to format date from VNPay format (yyyyMMddHHmmss) to human-readable format
  const formatPayDate = (payDate: string | undefined) => {
    if (!payDate || payDate.length !== 14) {
      return "";
    }

    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Function to render appropriate results based on response code
  const renderResult = () => {
    if (!isValidSignature) {
      return (
        <Result
          status="error"
          icon={<CloseCircleOutlined />}
          title="Invalid Signature"
          subTitle="Payment data verification failed. Please contact support if you need assistance."
        />
      );
    }

    if (!paymentResponse) {
      return (
        <Result
          icon={<InfoCircleOutlined />}
          title="Invalid Payment Response"
          subTitle="No payment information was received. Please contact support if you believe this is an error."
        />
      );
    }

    const {
      responseCode,
      amount,
      transactionNo,
      bankCode,
      cardType,
      txnRef,
      payDate,
      bankTranNo,
    } = paymentResponse;

    // Add extra transaction details to display
    const transactionDetails = (
      <div
        className="transaction-details"
        style={{ marginTop: 24, textAlign: "left" }}
      >
        <Title level={5}>Transaction Details:</Title>
        <Paragraph>
          <Text strong>Order ID: </Text> {txnRef}
        </Paragraph>
        <Paragraph>
          <Text strong>VNPAY Transaction ID: </Text> {transactionNo}
        </Paragraph>
        {bankTranNo && (
          <Paragraph>
            <Text strong>Bank Transaction ID: </Text> {bankTranNo}
          </Paragraph>
        )}
        <Paragraph>
          <Text strong>Amount: </Text> {formatCurrency(amount)} VND
        </Paragraph>
        <Paragraph>
          <Text strong>Bank: </Text> {bankCode}
        </Paragraph>
        <Paragraph>
          <Text strong>Payment Method: </Text> {cardType}
        </Paragraph>
        {payDate && (
          <Paragraph>
            <Text strong>Payment Time: </Text> {formatPayDate(payDate)}
          </Paragraph>
        )}
      </div>
    );

    switch (responseCode) {
      case "00":
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="Payment Successful"
            subTitle={`Your payment of ${formatCurrency(
              amount
            )} VND has been processed successfully!`}
            extra={[
              <Paragraph key="info">
                The funds have been added to your wallet balance.
              </Paragraph>,
              transactionDetails,
            ]}
          />
        );

      case "24":
        return (
          <Result
            icon={<InfoCircleOutlined style={{ color: "#1890ff" }} />}
            title="Payment Cancelled"
            subTitle="You've cancelled the payment process."
            extra={[
              <Paragraph key="info">
                No charges have been made to your account.
              </Paragraph>,
              transactionDetails,
            ]}
          />
        );

      case "07":
        return (
          <Result
            icon={<WarningOutlined style={{ color: "#faad14" }} />}
            title="Transaction Under Review"
            subTitle={`Your payment of ${formatCurrency(
              amount
            )} VND has been recorded but requires additional verification.`}
            extra={[
              <Paragraph key="info">
                Your transaction has been received but has been flagged for
                additional checks. Your account will be updated once the
                verification process is complete.
              </Paragraph>,
              <Paragraph key="warning" type="warning">
                Response code: {responseCode} -{" "}
                {getResponseMessage(responseCode)}
              </Paragraph>,
              transactionDetails,
            ]}
          />
        );

      default:
        return (
          <Result
            status="error"
            title="Payment Failed"
            subTitle={`There was an issue processing your payment of ${formatCurrency(
              amount
            )} VND.`}
            extra={[
              <Paragraph key="code" type="danger">
                Error Code: {responseCode} - {getResponseMessage(responseCode)}
              </Paragraph>,
              <Paragraph key="transaction" type="warning">
                Transaction Status: {paymentResponse.transactionStatus} -{" "}
                {getTransactionStatusMessage(paymentResponse.transactionStatus)}
              </Paragraph>,
              <Paragraph key="info">
                Please try again or contact customer support if the issue
                persists.
              </Paragraph>,
              transactionDetails,
            ]}
          />
        );
    }
  };

  // Auto-redirect to wallet after 10 seconds
  useEffect(() => {
    if (!isProcessing) {
      const timer = setTimeout(() => {
        navigate("/wallet");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isProcessing, navigate]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
      <Card>
        {isProcessing ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
              tip="Processing your payment..."
              size="large"
            />
          </div>
        ) : (
          <>
            {renderResult()}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => navigate("/account/wallet")}
                >
                  Return to Wallet
                </Button>
                <Button onClick={() => navigate("/")}>Go to Homepage</Button>
              </Space>
              <Paragraph style={{ marginTop: 16 }}>
                <Text type="secondary">
                  You'll be automatically redirected in 10 seconds...
                </Text>
              </Paragraph>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VNPayReturnHandler;

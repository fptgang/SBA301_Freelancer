import { Card, Typography } from "antd";
import TransactionHistoryTable from "./components/history";
const { Title } = Typography;

// TODO: Replace with actual balance from API
const currentBalance = 2500.00;

const WalletPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <div className="text-center">
          <Title level={5}>Current Balance</Title>
          <Title level={2} className="text-primary">
            ${currentBalance.toFixed(2)}
          </Title>
        </div>
      </Card>

      {/* Transaction History */}
      <Card title="Transaction History">
        <TransactionHistoryTable />
      </Card>
    </div>
  );
};

export default WalletPage;

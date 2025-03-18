import { Card, Typography } from "antd";
import TransactionHistoryTable from "./components/history";
import { store } from "../../../store";
const { Title } = Typography;

// TODO: Replace with actual balance from API

const WalletPage: React.FC = () => {
  const currentBalance = store.getState().auth.account?.balance || 0;

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

import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Select,
  DatePicker,
  Spin,
  Typography,
  Space,
  Button,
  Tooltip,
} from "antd";
import { Line, Bar, Pie } from "@ant-design/plots";
import dayjs from "dayjs";
import {
  StringBigDecimalDatapointDto,
  StringIntegerDatapointDto,
  TransactionStatDto,
} from "../../../../generated";
import api from "../../../services/api/openapi-config";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, "month"),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("month");

  // Define chart type keys
  type ChartTypeKey =
    | "transactions"
    | "newProjects"
    | "contractsSigned"
    | "milestonesCompleted"
    | "fundsReleased"
    | "userRegistrations"
    | "projectTermination";

  // Replace single chartType with individual chart types for each stat
  const [chartTypes, setChartTypes] = useState<Record<ChartTypeKey, string>>({
    transactions: "line",
    newProjects: "line",
    contractsSigned: "line",
    milestonesCompleted: "line",
    fundsReleased: "line",
    userRegistrations: "line",
    projectTermination: "line",
  });

  // Data states
  const [transactionStats, setTransactionStats] = useState<
    TransactionStatDto[]
  >([]);
  const [newProjects, setNewProjects] = useState<StringIntegerDatapointDto[]>(
    []
  );
  const [contractsSigned, setContractsSigned] = useState<
    StringIntegerDatapointDto[]
  >([]);
  const [milestonesCompleted, setMilestonesCompleted] = useState<
    StringIntegerDatapointDto[]
  >([]);
  const [fundsReleased, setFundsReleased] = useState<
    StringBigDecimalDatapointDto[]
  >([]);
  const [userRegistrations, setUserRegistrations] = useState<
    StringIntegerDatapointDto[]
  >([]);
  const [projectTermination, setProjectTermination] = useState<
    StringIntegerDatapointDto[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const [
        transactionsResponse,
        newProjectsResponse,
        contractsSignedResponse,
        milestonesCompletedResponse,
        fundsReleasedResponse,
        userRegistrationsResponse,
        projectTerminationResponse,
      ] = await Promise.all([
        api.getTransactionStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getNewProjectStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getContractsSignedStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getMilestonesCompletedStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getFundsReleasedStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getUserRegistrationsStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
        api.getProjectTerminationRateStats({
          startDate: startDateObj,
          endDate: endDateObj,
          groupBy,
        }),
      ]);

      setTransactionStats(transactionsResponse);
      setNewProjects(newProjectsResponse);
      setContractsSigned(contractsSignedResponse);
      setMilestonesCompleted(milestonesCompletedResponse);
      setFundsReleased(fundsReleasedResponse);
      setUserRegistrations(userRegistrationsResponse);
      setProjectTermination(projectTerminationResponse);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, groupBy]);

  // Transform transaction stats for chart
  const transactionChartData = React.useMemo(() => {
    const result: any[] = [];
    transactionStats.forEach((stat) => {
      result.push({
        timePeriod: stat.timePeriod,
        type: "Successful",
        value: stat.successful,
      });
      result.push({
        timePeriod: stat.timePeriod,
        type: "Processing",
        value: stat.pending,
      });
      result.push({
        timePeriod: stat.timePeriod,
        type: "Failed",
        value: stat.failed,
      });
    });
    return result;
  }, [transactionStats]);

  // Transform string-integer datapoints for charts
  const transformDatapoints = (
    data: StringIntegerDatapointDto[],
    label: string
  ) => {
    return data.map((item) => ({
      timePeriod: item.key,
      value: item.value,
      type: label,
    }));
  };

  // Transform string-bigdecimal datapoints for charts
  const transformBigDecimalDatapoints = (
    data: StringBigDecimalDatapointDto[],
    label: string
  ) => {
    return data.map((item) => ({
      timePeriod: item.key,
      value: parseFloat(item?.value?.toString() || "0"),
      type: label,
    }));
  };

  // Helper function to toggle chart type
  const toggleChartType = (key: ChartTypeKey, allowedTypes: string[]) => {
    setChartTypes((prev) => {
      const currentIndex = allowedTypes.indexOf(prev[key]);
      const nextIndex = (currentIndex + 1) % allowedTypes.length;
      return {
        ...prev,
        [key]: allowedTypes[nextIndex],
      };
    });
  };

  // Get icon for chart type
  const getChartIcon = (type: string) => {
    switch (type) {
      case "line":
        return <LineChartOutlined />;
      case "bar":
        return <BarChartOutlined />;
      default:
        return <LineChartOutlined />;
    }
  };

  const renderChart = (
    data: any[],
    title: string,
    yAxisTitle: string,
    chartType: string
  ) => {
    const config = {
      data,
      xField: "timePeriod",
      yField: "value",
      seriesField: "type",
      yAxis: {
        title: {
          text: yAxisTitle,
        },
      },
      legend: {
        position: "top",
      },
      smooth: true,
      animation: {
        appear: {
          animation: "path-in",
          duration: 1000,
        },
      },
    };

    return chartType === "line" ? <Line {...config} /> : <Bar {...config} />;
  };

  // Helper to create a card with chart toggle button
  const renderCardWithChart = (
    title: string,
    data: any[],
    chartKey: ChartTypeKey,
    yAxisTitle: string,
    allowedChartTypes: string[] = ["line", "bar"]
  ) => {
    const currentChartType = chartTypes[chartKey];

    return (
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{title}</span>
            <Tooltip title="Change chart type">
              <Button
                type="text"
                icon={getChartIcon(currentChartType)}
                onClick={() => toggleChartType(chartKey, allowedChartTypes)}
              />
            </Tooltip>
          </div>
        }
      >
        {renderChart(data, title, yAxisTitle, currentChartType)}
      </Card>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Admin Dashboard</Title>

      <Card style={{ marginBottom: 20 }}>
        <Space direction="horizontal" size="large">
          <div>
            <Text strong>Time Range:</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
              }
              style={{ marginLeft: 10 }}
            />
          </div>
          <div>
            <Text strong>Group By:</Text>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 120, marginLeft: 10 }}
            >
              <Option value="day">Day</Option>
              <Option value="week">Week</Option>
              <Option value="month">Month</Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {renderCardWithChart(
              "Transaction Statistics",
              transactionChartData,
              "transactions",
              "Number of Transactions"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "New Projects",
              transformDatapoints(newProjects, "New Projects"),
              "newProjects",
              "Number of Projects"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "Contracts Signed",
              transformDatapoints(contractsSigned, "Contracts Signed"),
              "contractsSigned",
              "Number of Contracts"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "Milestones Completed",
              transformDatapoints(milestonesCompleted, "Milestones Completed"),
              "milestonesCompleted",
              "Number of Milestones"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "Funds Released",
              transformBigDecimalDatapoints(fundsReleased, "Funds Released"),
              "fundsReleased",
              "Amount (VND)"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "New User Registrations",
              transformDatapoints(userRegistrations, "New Users"),
              "userRegistrations",
              "Number of Users"
            )}
          </Col>

          <Col span={12}>
            {renderCardWithChart(
              "Project Termination Rate",
              transformDatapoints(projectTermination, "Termination Rate"),
              "projectTermination",
              "Percentage (%)"
            )}
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard;

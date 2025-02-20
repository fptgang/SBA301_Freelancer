import React, { useState } from "react";
import {
  Drawer,
  Button,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Card,
  Tooltip,
} from "antd";
import {
  MoneyCollectOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  GlobalOutlined,
  BulbOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Sample job data interface
type Job = {
  id: number;
  title: string;
  description: string;
  budget: string;
  postedTime: string;
  location: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
};

const jobData: Job = {
  id: 1,
  title: "Java Developer (MongoDB)",
  description:
    "We are looking for a skilled Java Developer with experience in MongoDB to join our team. The ideal candidate should have a strong background in backend development, RESTful API design, and database management.",
  budget: "$10 - $50/hour",
  postedTime: "4 hours ago",
  location: "Worldwide",
  responsibilities: [
    "Develop and maintain Java-based backend applications.",
    "Design and implement RESTful APIs using Spring Boot.",
    "Work with MongoDB for efficient data storage and retrieval.",
    "Optimize database queries for performance and scalability.",
    "Ensure security, data integrity, and system reliability.",
    "Collaborate with front-end developers and other team members.",
  ],
  requirements: [
    "Proficiency in Java and Spring Boot.",
    "Experience working with MongoDB (CRUD operations, indexing, aggregation).",
    "Knowledge of RESTful API development and microservices architecture.",
    "Familiarity with database optimization and NoSQL best practices.",
    "Good problem-solving skills and attention to detail.",
    "Experience with Git and CI/CD pipelines is a plus.",
  ],
  skills: ["MongoDB", "Java", "API", "Spring Boot"],
};

const JobDrawer: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  return (
    <div>
      <Drawer
        placement="right"
        onClose={closeDrawer}
        open={visible}
        width={1000}
        bodyStyle={{ padding: "0px" }}
      >
        <Row gutter={16}>
          {/* Left Side: Job Information */}
          <Col span={17}>
            <Card style={{ padding: "16px", borderRadius: "0px" }}>
              {" "}
              {/* Removed borderRadius */}
              <Title level={3} style={{ marginBottom: "8px" }}>
                {jobData.title}
              </Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Text>
                  <ClockCircleOutlined /> Posted: {jobData.postedTime}{" "}
                  <GlobalOutlined /> {jobData.location}
                </Text>
                <Text>
                  <MoneyCollectOutlined /> Budget: {jobData.budget}
                </Text>
                <Title level={5}>Job Description</Title>
                <Text>{jobData.description}</Text>

                <Title level={5}>Responsibilities</Title>
                <ul>
                  {jobData.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <Title level={5}>Requirements</Title>
                <ul>
                  {jobData.requirements.map((item, index) => (
                    <li key={index}>✅ {item}</li>
                  ))}
                </ul>

                <Title level={5}>Skills Required</Title>
                <Space>
                  {jobData.skills.map((skill) => (
                    <Tag
                      key={skill}
                      style={{ backgroundColor: "f1f1f1", color: "#676767" }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Card>
            <Card style={{ borderRadius: "0px", padding: "16px" }}>
              <Space className="flex justify-between w-full">
                {/* Experience Level Section */}
                <div className="flex items-start space-x-1">
                  <BulbOutlined className="text-2xl" />
                  <div>
                    <Text className="font-semibold text-lg">Intermediate</Text>
                    <br />
                    <Text className="text-gray-500">
                      I am looking for a mix of <br /> experience and value
                    </Text>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="flex items-start space-x-1">
                  <TagOutlined className="text-2xl" />
                  <div>
                    <Text className="font-semibold text-lg">$10.00</Text>
                    <br />
                    <Text className="text-gray-500">Fixed-price</Text>
                  </div>
                </div>
              </Space>
            </Card>
            <Card className="shadow-sm p-4" style={{ borderRadius: "0px" }}>
              {/* Title */}
              <Title level={5} className="text-gray-900">
                Activity on this job
              </Title>

              {/* Job Activity Details */}
              <div className="space-y-1">
                <Text className="text-gray-700">
                  Proposals:
                  <Tooltip title="Number of proposals submitted">
                    <QuestionCircleOutlined className="ml-1 text-green-500" />
                  </Tooltip>
                  <span className="ml-1 font-semibold">20 to 50</span>
                </Text>
                <br />
                <Text className="text-gray-700">
                  Interviewing: <span className="font-semibold">1</span>
                </Text>
                <br />
                <Text className="text-gray-700">
                  Invites sent: <span className="font-semibold">1</span>
                </Text>
                <br />
                <Text className="text-gray-700">
                  Unanswered invites: <span className="font-semibold">0</span>
                </Text>
              </div>
              <div className="mt-4 text-gray-900 font-medium">
                Upgrade your membership to see the bid range{" "}
                <Tooltip title="Get access to bid range insights">
                  <QuestionCircleOutlined className="text-green-500" />
                </Tooltip>
              </div>
            </Card>
          </Col>

          {/* Right Side: Actions */}
          <Col span={7} style={{ padding: "26px" }}>
            {/* Apply & Save Job Buttons */}
            <Button
              type="primary"
              block
              className="bg-green-700 hover:bg-green-800 border-none text-white py-2"
              style={{ marginBottom: "10px" }}
            >
              Apply Now
            </Button>
            <Button
              icon={<HeartOutlined />}
              block
              className="border-green-700 text-green-700 border-[1.6px] hover:bg-green-50 py-2"
            >
              Save Job
            </Button>

            {/* Flag as Inappropriate */}
            <Button
              type="text"
              block
              className=" mt-4"
              style={{color:"#108a00"}}
              icon={<FlagOutlined />}
            >
              Flag as inappropriate
            </Button>

            {/* Proposal & Connects Info */}
            <div className="mt-4 text-gray-900 text-sm">
              <p className="text-gray-500">
                Send a proposal for:{" "}
                <span className="font-semibold text-gray-500">7 Connects</span>
              </p>
              <p className="text-gray-500" >
                Available Connects: <span className="font-semibold text-gray-500">0</span>
              </p>
            </div>

            {/* About the Client Section */}
            
              <Title level={5} className="text-gray-900">
                About the client
              </Title>
              <p className="text-green-700 flex items-center">
                <CheckCircleOutlined className="mr-2" /> Payment method verified
              </p>
              <p className="text-green-700 flex items-center">
                <CheckCircleOutlined className="mr-2" /> Phone number verified
              </p>

              <p className="mt-2 text-gray-700">🇦🇺 AUS</p>
              <p className="text-gray-500">Glenroy 3:41 AM</p>

              <p className="mt-2 text-gray-700">
                0% hire rate, <span className="font-semibold">1 open job</span>
              </p>
              <p className="text-gray-700">Tech & IT</p>
              <p className="text-gray-500">Individual client</p>
              <p className="text-gray-500">Member since Feb 20, 2025</p>
            

            {/* Job Link Section */}
            <div className="mt-4">
              <Title level={5} className="text-gray-900">
                Job link
              </Title>
              <input
                type="text"
                readOnly
                value="https://www.upwork.com/jobs/"
                className="w-full bg-gray-200 p-2 text-gray-500 border border-gray-300 rounded-md"
              />
              <p className="text-green-700 font-semibold mt-1 cursor-pointer hover:underline">
                Copy link
              </p>
            </div>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default JobDrawer;

import React, { useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Button,
  Layout,
  Dropdown,
  Menu,
} from "antd";
import {
  GithubOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  EllipsisOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const menuItems = (
  <Menu>
    <Menu.Item key="1">Flag as inappropriate</Menu.Item>
  </Menu>
);

const ProfileCard: React.FC = () => {
  const [currentTime, setCurrentTime] = React.useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout className="bg-white items-center justify-center ">
      <Card className="w-[80%]  mx-auto shadow-lg rounded-1xl border w-full h-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-3 gap-2 ">
          {/* Top Full-Width Section */}
          <div className="col-span-3 row-span-1 border flex rounded-lg justify-between items-center p-6">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Avatar
                  size={64}
                  src="https://cdn.example.com/path/to/image.jpg"
                />
                <span className="absolute top-0 left-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex flex-col items-start">
                <Title
                  level={4}
                  className="font-sans font-semibold text-[34px] leading-tight"
                >
                  Vi L.
                </Title>
                <div
                  className="flex items-center gap-1 text-gray-500 text-sm"
                  style={{ color: "#676E7F" }}
                >
                  <EnvironmentOutlined className="text-lg" />
                  <span style={{ fontWeight: 500, lineHeight: "23px" }}>
                    Ho Chi Minh City, Vietnam - {currentTime} local time
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-12 ml-auto items-center">
              <Dropdown overlay={() => menuItems} placement="bottom">
                <button className="w-8 h-8 flex items-center justify-center border border-green-500 text-green-500 rounded-full hover:bg-green-500 hover:text-white transition">
                  <EllipsisOutlined className="text-lg" />
                </button>
              </Dropdown>
              <Button className="border-none text-green-500 hover:bg-green-500 ">
                Share <UploadOutlined />
              </Button>
            </div>
          </div>

          {/* Left Column (Full Height) */}
          <div className="col-span-1 row-span-2 md:row-span-2 lg:row-span-2 border p-6 flex flex-col rounded-lg">
            <Text strong>Hours per week</Text>
            <Paragraph>
              More than 30 hrs/week
              <br />
              <Text>Open to contract to hire </Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                New
              </Tag>
            </Paragraph>

            <Text strong>Languages</Text>
            <Paragraph>
              English: (Fluent)
              <br />
              <Text>Vietnamese: Native or Bilingual </Text>
            </Paragraph>

            <Text strong>Education</Text>
            <Paragraph>
              FPT University
              <br />
              <Text>Bachelor of Applied Science (BASc), Computer science</Text>
              <br />
              <Text>2022-2025</Text>
            </Paragraph>

            <Text strong>Linked accounts</Text>
            <Card className="flex bg-gray-100 p-2 rounded-lg mt-6">
              <div className="flex flex-col space-y-1">
                <Text strong>
                  GitHub{" "}
                  <span className="text-gray-500 text-sm">Since 2022</span>
                </Text>
                <Text>Vi Le</Text>
                <a
                  href="https://github.com/your-github-username"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold"
                >
                  View profile
                </a>
                <div className="flex items-center gap-1 mt-1">
                  <UserOutlined />
                  <Text>10 followers</Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Right Section */}
          <div className="col-span-2 row-span-1 border p-4 rounded-lg">
            <div className="flex">
              <Title level={4}>
                HTML5, Responsive Design, React, JAVA, Spring, Spring boot
              </Title>
              <div className="flex items-center gap-2 ml-auto text-4xl">
                <Text strong>$15.00/hr</Text>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              I am a second-year student at FPT University, actively pursuing my
              passion for developing web applications. Currently, I am dedicated
              to acquiring essential technologies and skills required for
              proficient web app development.
            </div>
          </div>

          {/* Bottom Right Section */}
          <div className="col-span-2 row-span-1 border p-4 rounded-lg">
            <div className="flex">
              <Title level={4}>Skills</Title>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              I am a second-year student at FPT University, actively pursuing my
              passion for developing web applications. Currently, I am dedicated
              to acquiring essential technologies and skills required for
              proficient web app development.
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default ProfileCard;

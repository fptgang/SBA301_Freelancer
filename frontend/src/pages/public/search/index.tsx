import { useEffect, useState } from "react";
import {
  Layout,
  Tabs,
  Input,
  Select,
  List,
  Tag,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  ProfileDto,
  ProjectDto,
  ProfileSkillDto,
  ProjectSkillDto,
  SkillDto,
  ProficiencyEnum,
  ProjectCategoryDto,
} from "../../../../generated";
import { HttpError, useList } from "@refinedev/core";
import { useSearchParams } from "react-router";
import ProjectCard from "./projectCard";
import ProfileCard from "./profileCard";
import { renderSkillTags } from "./renderSkillTags";

const { Content, Sider } = Layout;

const SearchPage = () => {
  const [selectedSkills, setSelectedSkills] = useState<SkillDto[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyEnum[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProjectCategoryDto[]
  >([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [searchParam] = useSearchParams();
  const [searchText, setSearchText] = useState<string>(
    searchParam.get("keyword") || ""
  );
  const [activeTab, setActiveTab] = useState("talents");

  useEffect(() => {
    setCurrent(1);
  }, [
    searchText,
    selectedSkills,
    selectedLevel,
    selectedCategories,
    activeTab,
  ]); // Reset current page when search text changes or filters change or tab changes

  useEffect(() => {
    setSelectedCategories([]);
    setSelectedLevel([]);
    setSelectedSkills([]);
  }, [activeTab]); // Update URL search param when tab changes

  const levelOptions = Object.values(ProficiencyEnum);
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
  } = useList<SkillDto, HttpError>({
    resource: "skills",
    pagination: { pageSize: 100 },
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useList<ProjectCategoryDto, HttpError>({
    resource: "projectCategories",
    pagination: { pageSize: 100 },
  });

  const {
    data: filteredItem,
    isLoading: isItemLoading,
    isError: isItemError,
  } = activeTab === "talents"
    ? useList<ProfileDto, HttpError>({
        resource: "profiles",
        filters: [
          {
            field: "overview",
            operator: "contains",
            value: searchText,
          },
          selectedSkills.length > 0
            ? {
                field: "skills.skill",
                operator: "in",
                value: selectedSkills?.map((skill) => {
                  return skill.skillId;
                }),
              }
            : {
                field: "skills.skill",
                operator: "ne",
                value: "0",
              },
          selectedLevel.length > 0
            ? {
                field: "skills.proficiency",
                operator: "in",
                value: selectedLevel?.map((level) => level),
              }
            : {
                field: "skills.proficiency",
                operator: "ne",
                value: "0",
              },
        ],
        pagination: { current, pageSize },
      })
    : useList<ProjectDto, HttpError>({
        resource: "projects",
        filters: [
          {
            field: "status",
            operator: "eq",
            value: "OPEN",
          },
          {
            field: "title",
            operator: "contains",
            value: searchText,
          },
          selectedSkills.length > 0
            ? {
                field: "requiredSkills.skill",
                operator: "in",
                value: selectedSkills?.map((skill) => skill.skillId),
              }
            : {
                field: "requiredSkills.skill",
                operator: "ne",
                value: "0",
              },
          selectedLevel.length > 0
            ? {
                field: "requiredSkills.proficiency",
                operator: "in",
                value: selectedLevel?.map((level) => level),
              }
            : {
                field: "requiredSkills.proficiency",
                operator: "ne",
                value: "",
              },
          selectedCategories.length > 0
            ? {
                field: "category",
                operator: "in",
                value: selectedCategories?.map(
                  (category) => category.projectCategoryId
                ),
              }
            : {
                field: "category",
                operator: "ne",
                value: "0",
              },
        ],
        pagination: { current, pageSize },
      });

  const renderFilter = () => {
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          height: "100%",
          borderRadius: "8px",
        }}
      >
        <Typography.Title level={4}>Filter by Skills</Typography.Title>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select skills"
          loading={isSkillsLoading}
          className="mb-4"
          onChange={(value) => {
            setSelectedSkills(
              skillsData?.data?.filter((skill) =>
                value.includes(skill.skillId)
              ) || []
            );
          }}
          value={selectedSkills.map((skill) => skill.skillId)}
        >
          {skillsData?.data?.map((skill) => (
            <Select.Option key={skill.skillId} value={skill.skillId}>
              {skill.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select Proficiency Level"
          className="mb-4"
          onChange={(value) => {
            setSelectedLevel(value);
            console.log(value);
          }}
          value={selectedLevel}
        >
          {levelOptions?.map((level) => (
            <Select.Option key={level} value={level}>
              {level}
            </Select.Option>
          ))}
        </Select>
        {activeTab === "projects" && (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Project Categories"
            className="mb-4"
            onChange={(value) => {
              setSelectedCategories(
                categoriesData?.data?.filter((c) =>
                  value.includes(c.projectCategoryId)
                ) || []
              );
              console.log(value);
            }}
            value={selectedCategories.map((c) => c.projectCategoryId)}
          >
            {categoriesData?.data?.map((c) => (
              <Select.Option
                key={c.projectCategoryId}
                value={c.projectCategoryId}
              >
                {c.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
    );
  };

  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrent(page);
    setPageSize(newPageSize);
  };

  return (
    <Layout className="p-20">
      <Content className="p-6">
        <Input
          size="large"
          placeholder={`Search ${
            activeTab === "projects" ? "projects" : "talents"
          }...`}
          prefix={<SearchOutlined />}
          onPressEnter={(e) => setSearchText(e.target.value)}
          defaultValue={searchText}
          className="mb-4"
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.TabPane
            tab={
              <span>
                <UserOutlined /> Talents
              </span>
            }
            key="talents"
          />
          <Tabs.TabPane
            tab={
              <span>
                <ProjectOutlined /> Projects
              </span>
            }
            key="projects"
          />
        </Tabs>
        <Row gutter={16} className="mb-4">
          <Col span={6}>{renderFilter()}</Col>
          <Col span={18}>
            {activeTab === "talents" ? (
              <List
                dataSource={filteredItem?.data}
                renderItem={(item) => <ProfileCard profile={item} />}
                pagination={{
                  current: current,
                  pageSize: pageSize,
                  total: filteredItem?.total,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} items`,
                  position: "bottom",
                  responsive: true,
                  pageSizeOptions: ["10", "20", "50"],
                }}
              />
            ) : (
              <List
                dataSource={filteredItem?.data}
                renderItem={(item) => <ProjectCard project={item} />}
                pagination={{
                  current: current,
                  pageSize: pageSize,
                  total: filteredItem?.total,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} items`,
                  position: "bottom",
                  responsive: true,
                  pageSizeOptions: ["10", "20", "50"],
                }}
              />
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default SearchPage;

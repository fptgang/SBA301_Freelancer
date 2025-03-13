import { useEffect, useState } from "react";
import { Layout, Tabs, Input, List, Row, Col } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  ProfileDto,
  ProjectDto,
  SkillDto,
  ProficiencyEnum,
  ProjectCategoryDto,
} from "../../../../generated";
import { HttpError, useList } from "@refinedev/core";
import { useSearchParams } from "react-router";
import ProjectCard from "../../../components/pages/search/projectCard";
import ProfileCard from "../../../components/pages/search/profileCard";
import RenderFilter from "../../../components/pages/search/renderFilter";

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
  const [activeTab, setActiveTab] = useState(
    searchParam.get("type") === "work" ? "projects" : "talents"
  );
  const [typedSearch, setTypedSearch] = useState(searchText);

  useEffect(() => {
    setTypedSearch(searchParam.get("keyword") || "");
    setSearchText(searchParam.get("keyword") || "");
    setActiveTab(searchParam.get("type") === "work" ? "projects" : "talents");
  }, [searchParam]); // Update search text when URL search param changes

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
    resource: "project-categories",
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
                value: undefined,
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
                value: undefined,
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
            value: searchText.length > 0 ? searchText : undefined,
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
                value: undefined,
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
                value: undefined,
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
                value: undefined,
              },
        ],
        pagination: { current, pageSize },
      });

  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrent(page);
    setPageSize(newPageSize);
  };

  return (
    <Layout.Content className="p-20">
      {/* <Content className="p-6"> */}
      <Input
        size="large"
        placeholder={`Search ${
          activeTab === "projects" ? "projects" : "talents"
        }...`}
        prefix={<SearchOutlined />}
        onPressEnter={(e) =>
          setSearchText((e.target as HTMLInputElement).value)
        }
        value={typedSearch}
        onChange={(e) => setTypedSearch(e.target.value)}
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
        <Col span={6}>
          <RenderFilter
            activeTab={activeTab}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            skillsData={skillsData}
            isSkillsLoading={isSkillsLoading}
            categoriesData={categoriesData}
            isCategoriesLoading={isCategoriesLoading}
            levelOptions={levelOptions}
          />
        </Col>
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
      {/* </Content> */}
    </Layout.Content>
  );
};

export default SearchPage;

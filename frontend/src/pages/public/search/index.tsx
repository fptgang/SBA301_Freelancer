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
  AccountDto,
} from "../../../../generated";
import { HttpError, useGetIdentity, useList, useOne } from "@refinedev/core";
import { useLocation, useSearchParams } from "react-router";
import ProjectCard from "../../../components/features/project/cards/projectCard";
import ProfileCard from "../../../components/features/profile/card/profileCard";
import RenderFilter from "../../../components/features/project/filters/renderFilter";
import { ac } from "react-router/dist/development/route-data-Cq_b5feC";

const { Content, Sider } = Layout;

const SearchPage = () => {
  const location = useLocation();
  const categoryId = location?.state?.categoryId || undefined;
  const [selectedSkills, setSelectedSkills] = useState<SkillDto[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyEnum[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProjectCategoryDto[]
  >([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [searchParam, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState<string>(
    searchParam.get("keyword") || ""
  );
  const [activeTab, setActiveTab] = useState(
    searchParam.get("type") === "work" ? "projects" : "talents"
  );
  const [typedSearch, setTypedSearch] = useState(searchText);
  const { data: user } = useGetIdentity<AccountDto>();

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
    pagination: { pageSize: 1000 },
  });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    isSuccess: isCategoriesSuccess,
  } = useList<ProjectCategoryDto, HttpError>({
    resource: "project-categories",
    pagination: { pageSize: 1000 },
  });

  useEffect(() => {
    if (isCategoriesSuccess && selectedCategories.length === 0 && categoryId) {
      const selectedCategory = categoriesData?.data.find(
        (category) => category.projectCategoryId === categoryId
      );
      if (selectedCategory) setSelectedCategories([selectedCategory]);
    }
  }, [categoriesData]);

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

  const { data: freelancerProfile } = useOne<ProfileDto, HttpError>({
    resource: "profiles",
    id: user?.profileId,
    queryOptions: {
      enabled: !!user,
    },
  });

  const {
    data: jobsFY,
    isLoading: isJobsFYLoading,
    isError: isJobsFYError,
  } = useList<ProjectDto, HttpError>({
    resource: "projects",
    queryOptions: {
      enabled: !!freelancerProfile && activeTab !== "talents",
    },
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "OPEN",
      },
      {
        field: "requiredSkills.skill",
        operator: "in",
        value:
          freelancerProfile?.data.skills?.map((ps) => ps?.skill?.skillId) ||
          undefined,
      },
    ],
    pagination: { pageSize: 5 },
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

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setSearchParams({
            type: key === "projects" ? "work" : "talent",
            ...(searchText && { keyword: searchText }),
          });
        }}
        className="mb-4"
      >
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
            <>
              {!(selectedCategories.length > 0) &&
                !(selectedLevel.length > 0) &&
                !(selectedSkills.length > 0) &&
                freelancerProfile &&
                (jobsFY?.data?.length || 0) > 0 && (
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-3">
                      <h3 className="text-lg font-medium text-blue-700 mb-1">
                        Jobs For You
                      </h3>
                      <p className="text-sm text-blue-600">
                        These jobs match your skills
                      </p>
                    </div>
                    <List
                      dataSource={jobsFY?.data}
                      renderItem={(item) => (
                        <div className="border-l-4 border-blue-400 pl-2 mb-3 transition-all hover:border-blue-600">
                          <ProjectCard project={item} />
                        </div>
                      )}
                      pagination={false}
                    />
                    <div className="border-t border-gray-200 my-6"></div>
                  </div>
                )}

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
            </>
          )}
        </Col>
      </Row>
      {/* </Content> */}
    </Layout.Content>
  );
};

export default SearchPage;

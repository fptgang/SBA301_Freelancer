import React from "react";
import { Input, Button, Space, Card, Typography, Badge, Avatar } from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  StarFilled,
} from "@ant-design/icons";
import Hero from "./components/hero";
import { useList, useMany } from "@refinedev/core";
import {
  ProjectCategoryDto,
  ProjectInCategoryDto,
} from "../../../../generated";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

const LandingPage = () => {
  const nav = useNavigate();
  const { data } = useList<ProjectCategoryDto>({
    resource: "project-categories",
    pagination: { pageSize: 8 },
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: {
      param: [{ field: "findTop", value: "true" }],
    },
  });
  const categories = data?.data || [];

  const { data: projectData } = useMany<ProjectInCategoryDto>({
    resource: "project-categories/project-in-category",
    ids: categories.map((category) => category.projectCategoryId),
    queryOptions: { enabled: !!categories.length },
  });
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}

      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Title level={2} className="text-3xl font-bold mb-12 text-center">
            Up your work game, it's easy
          </Title>
          <div className="grid md:grid-cols-3 gap-8">
            <Card bordered={false} className="bg-transparent">
              <Title level={4}>No cost to join</Title>
              <Text className="text-gray-500">
                Register and browse talent profiles, explore projects, or even
                book a consultation.
              </Text>
            </Card>
            <Card bordered={false} className="bg-transparent">
              <Title level={4}>Post a job and hire top talent</Title>
              <Text className="text-gray-500">
                Finding talent doesn't have to be a chore. Post a job or we can
                search for you!
              </Text>
            </Card>
            <Card bordered={false} className="bg-transparent">
              <Title level={4}>
                Work with the best—without breaking the bank
              </Title>
              <Text className="text-gray-500">
                Upwork makes it affordable to up your work and take advantage of
                low transaction rates.
              </Text>
            </Card>
          </div>
        </div>
      </div>

      {/*/!* Social Proof *!/*/}
      {/*<div className="py-16 bg-white">*/}
      {/*  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*    <div className="text-center mb-12">*/}
      {/*      <Text className="text-gray-500">TRUSTED BY</Text>*/}
      {/*      <div className="flex justify-center gap-12 mt-4">*/}
      {/*        <img src="/api/placeholder/120/40" alt="Microsoft" />*/}
      {/*        <img src="/api/placeholder/120/40" alt="Airbnb" />*/}
      {/*        <img src="/api/placeholder/120/40" alt="Bissell" />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/* Categories Grid */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Title level={2} className="text-3xl font-bold mb-12">
            Browse works by top category
          </Title>
          <div className="grid md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <div
                key={category.name}
                className="group relative bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-gray-100"
                onClick={() =>
                  nav(`/search?type=work`, {
                    state: { categoryId: category.projectCategoryId },
                  })
                }
              >
                <div className="flex items-center mb-3">
                  <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <StarFilled className="text-green-500 mr-1" />
                    <Text className="text-sm text-green-600">
                      {
                        projectData?.data?.find(
                          (project) =>
                            project.categoryId === category.projectCategoryId
                        )?.success
                      }
                      /{" "}
                      {
                        projectData?.data?.find(
                          (project) =>
                            project.categoryId === category.projectCategoryId
                        )?.total
                      }{" "}
                      success
                    </Text>
                  </div>
                </div>
                <Title
                  level={4}
                  className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors"
                >
                  {category.name}
                </Title>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRightOutlined className="text-green-500 text-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

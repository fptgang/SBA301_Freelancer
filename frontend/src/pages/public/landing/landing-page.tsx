import React from "react";
import { Input, Button, Space, Card, Typography, Badge, Avatar } from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  StarFilled,
} from "@ant-design/icons";
import Hero from "./components/hero";

const { Title, Text } = Typography;

const LandingPage = () => {
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
            Browse talent by category
          </Title>
          <div className="grid md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <div key={category.name} className="mb-8">
                <div className="flex items-center mb-2">
                  <StarFilled className="text-green-500 mr-2" />
                  <Text className="font-bold">{category.rating}</Text>
                  <Text className="text-gray-500 ml-2">
                    {category.skills} skills
                  </Text>
                </div>
                <Title level={4}>{category.name}</Title>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const categories = [
  { name: "Development & IT", rating: "4.85/5", skills: "1853" },
  { name: "AI Services", rating: "4.8/5", skills: "294" },
  { name: "Design & Creative", rating: "4.91/5", skills: "968" },
  { name: "Sales & Marketing", rating: "4.77/5", skills: "392" },
  { name: "Writing & Translation", rating: "4.92/5", skills: "505" },
  { name: "Admin & Customer Support", rating: "4.77/5", skills: "508" },
  { name: "Finance & Accounting", rating: "4.79/5", skills: "214" },
  { name: "Engineering & Architecture", rating: "4.85/5", skills: "650" },
];

export default LandingPage;

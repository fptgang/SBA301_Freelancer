import React from "react";
import { Card, Typography, Avatar, Button } from "antd";

const { Title, Paragraph } = Typography;

const AboutUs = () => {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "auto",
        padding: "2rem",
        fontFamily: "NeueMontreal, sans-serif",
      }}
    >
      <Title level={1} style={{ color: "#14A901" }}>
        About Us
      </Title>
      <Title level={3}>The world’s work marketplace</Title>

      <Card
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem",
          border: "none",
        }}
      >
        <div className="flex">
          <Avatar
            size={80}
            src="https://via.placeholder.com/80"
            alt="FPT Gang"
          />
          <div style={{ marginLeft: "1rem" }}>
            <Title level={4} style={{ margin: 0 }}>
              FPT Gang
            </Title>
            <Paragraph strong>President & CEO</Paragraph>
          </div>
        </div>
      </Card>

      <Paragraph style={{ marginTop: "1rem" }}>
        Upwork began over two decades ago by pioneering a better way of working,
        helping businesses find more flexibility and connecting talent with more
        opportunities.
      </Paragraph>

      <Paragraph
        style={{ color: "#14A901", fontWeight: "bold", fontSize: "18px" }}
      >
        Our mission to create economic opportunities so people have better lives
        has taken us so much further. As a result, we’ve become the world’s work
        marketplace where every day businesses of all sizes and independent
        talent from around the globe meet here to accomplish incredible things.
      </Paragraph>

      <Paragraph>
        Like for so many, Upwork has had a big impact on my life. I first came
        to this company on the product team, and over the years have understood
        what makes this platform really work: the relationships.
      </Paragraph>

      <Title level={4}>We see what you do</Title>
      <Paragraph>
        I have personally seen the passion and commitment that every user puts
        into their work here. Whether it’s a quick PowerPoint presentation or a
        multi-year development project - both talent on Upwork and our clients
        care about doing really good work because they love what they do.
      </Paragraph>
      <Paragraph>
        In fact, we designed it that way. Our work marketplace aligns the goals
        of our clients with the goals of talent on Upwork so that outcomes are
        better and everyone grows in the same direction. You’ll find tools to
        develop your skills, evolve your business, and gain the control and
        freedom you need for success.
      </Paragraph>
      <Title level={4}>Upwork is your workforce</Title>
      <Paragraph>
        If you’re a client that’s come here to get things done, use this
        workforce of independent talent to build faster and transform your
        business. If you’re independent talent that’s come here to realize your
        potential, know that you are a valuable and instrumental part of
        someone’s team.
      </Paragraph>
      <Title level={4}>We make work more rewarding</Title>
      <Paragraph>
        We see your vision, and everything we do is an effort to help you make
        the connections that will turn that vision into reality, by building
        your Virtual Talent Bench of trusted people. The impact is both economic
        and personal, in the everyday and in the long run. When you find the
        right people, you stop working to get by and start working
        strategically. That is when real opportunity emerges. I can say with
        confidence that the Upwork team - the team that serves you the talent
        and you the client - is still driven by our mission to create economic
        opportunity for our people around the world. You’re our people now, and
        we’re glad that you’re here. We can’t wait to see what you do.
      </Paragraph>
      <Title level={2} style={{ color: "#108B01" }}>
        Start your journey
      </Title>
      <div className="flex gap-4 mt-4">
        <Button
          type="primary"
          className="bg-green-600 border-none text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Find Talent
        </Button>
        <Button
          type="primary"
          className="bg-green-600 border-none text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Find Work
        </Button>
      </div>
    </div>
  );
};

export default AboutUs;

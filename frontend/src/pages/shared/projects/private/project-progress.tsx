import {Card, Steps} from "antd";
import {
  BuildOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import React from "react";
import {
  ContractStatusDto,
  ProjectDto,
  ProjectStatusDto
} from "../../../../../generated";

const {Step} = Steps;

const ProjectProgress: React.FC<{ project: ProjectDto }> = ({project}) => {
  // Define all possible step configurations
  const stepConfigs = [
    {
      title: "Open",
      description: "Project Posted",
      icon: <BulbOutlined/>,
    },
    {
      title: "Contracting",
      description: "Contract Made",
      icon: <TeamOutlined/>,
    },
    {
      title: "Working",
      description: "Work-in-progress",
      icon: <BuildOutlined/>,
    },
    {
      title: "Completed",
      description: "Project Finished",
      icon: <CheckCircleOutlined/>,
    },
    {
      title: "Terminated",
      description: "Project Terminated",
      icon: <CloseCircleOutlined/>,
    },
  ];

  let stepsToShow = [];
  let currentStep = 0;

  if (project.status === ProjectStatusDto.Open || project.status === ProjectStatusDto.Paused) {
    // Happy path, customize OPEN if PAUSED
    stepsToShow = [
      {
        title: "Open",
        description: project.status === ProjectStatusDto.Paused ? "Project Paused" : "Project Posted",
        icon: project.status === ProjectStatusDto.Paused ?
          <PauseCircleOutlined/> : <BulbOutlined/>,
      },
      stepConfigs[1], // Contracting
      stepConfigs[2], // Working
      stepConfigs[3], // Completed
    ];
    currentStep = 0;
  } else if (project.status === ProjectStatusDto.InProgress) {
    // Happy path, adjust current step based on contract
    stepsToShow = [
      stepConfigs[0], // Open
      stepConfigs[1], // Contracting
      stepConfigs[2], // Working
      stepConfigs[3], // Completed
    ];
    currentStep = project.contract && project.contract.status === ContractStatusDto.Signed ? 2 : 1;
  } else if (project.status === ProjectStatusDto.Finished) {
    // Happy path completed
    stepsToShow = [
      stepConfigs[0], // Open
      stepConfigs[1], // Contracting
      stepConfigs[2], // Working
      stepConfigs[3], // Completed
    ];
    currentStep = 3;
  } else if (project.status === ProjectStatusDto.Terminated) {
    if (!project.contract) {
      // Terminated from OPEN or PAUSED (no contract)
      stepsToShow = [
        stepConfigs[0], // Open
        stepConfigs[4], // Terminated
      ];
      currentStep = 1;
    } else if (!project.contract.signedAt) { // Assuming signedAt is null if never signed
      // Terminated from CONTRACTING
      stepsToShow = [
        stepConfigs[0], // Open
        stepConfigs[1], // Contracting
        stepConfigs[4], // Terminated
      ];
      currentStep = 2;
    } else {
      // Terminated from WORKING
      stepsToShow = [
        stepConfigs[0], // Open
        stepConfigs[1], // Contracting
        stepConfigs[2], // Working
        stepConfigs[4], // Terminated
      ];
      currentStep = 3;
    }
  }

  return (
    <Card className="mb-6 shadow-sm">
      <Steps current={currentStep} className="py-2">
        {stepsToShow.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </Steps>
    </Card>
  );
};

export default ProjectProgress;
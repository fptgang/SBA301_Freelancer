import React from "react";
import {
  AccountDto,
  AccountDtoRoleEnum,
  ContractStatusDto,
  ProjectDto,
  ProjectStatusDto
} from "../../../../../generated";
import {Alert} from "antd";
import {useLocalSettings} from "../../../../hooks/useLocalSettings";
import dayjs from "dayjs";
import Countdown from "../../../../components/Countdown";
import ContractSignButton from "../../../../components/contract/contract-sign-button";
import { useGetIdentity } from "@refinedev/core";

const ProjectAlerts: React.FC<{ project: ProjectDto }> = ({ project }) => {
  const [localSettings] = useLocalSettings()
  const { data: user } = useGetIdentity<AccountDto>();

  const alerts = [];

  if (project.status === ProjectStatusDto.Open) {
    const createContractDeadline = localSettings.formatDateTime(dayjs(project.startDate!).subtract(1, 'day'))
    alerts.push(
      <Alert
        key="unsigned"
        message={<>
          You must accept a proposal and create the contract before {createContractDeadline}
          {" "}(Time left: <Countdown targetDate={createContractDeadline} />)
        </>}
        type="warning"
        showIcon
        className="mb-6 shadow-sm"
      />
    );
  }

  if (project.status === ProjectStatusDto.InProgress && 
    project.contract && 
    project.contract.status === ContractStatusDto.Unsigned) {
    const signDeadline = localSettings.formatDateTime(project.startDate!)
    alerts.push(
      <Alert
        key="unsigned"
        message={<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              The freelancer must sign the contract before {signDeadline}
              {" "}(Time left: <Countdown targetDate={signDeadline} />)
            </span>
            {user?.role == AccountDtoRoleEnum.Freelancer &&
              <ContractSignButton contract={project.contract} project={project} onSuccess={() => window.location.reload()} />}
          </div>
        </>}
        type="warning"
        showIcon
        className="mb-6 shadow-sm"
      />
    );
  }

  if (project.status === ProjectStatusDto.InProgress && 
    project.contract && 
    project.contract.status === ContractStatusDto.Signed &&
    project.startDate! > new Date()) {
    alerts.push(
      <Alert
        key="signed"
        message={<>
          The project will officially begin in <Countdown targetDate={project.startDate!} />
            {user?.role == AccountDtoRoleEnum.Freelancer &&
              ". You can start working on the first milestone now"}
        </>}
        type="info"
        showIcon
        className="mb-6 shadow-sm"
      />
    );
  }

  if (project.toTerminate && project.activeMilestone?.deadline) {
    const toTerminateAt = localSettings.formatDateTime(project.activeMilestone.deadline)
    alerts.push(
      <Alert
        key="terminate"
        message={<>
          Project has been scheduled to be terminated at {toTerminateAt}
          {" "}(Time left: <Countdown targetDate={toTerminateAt} />)
        </>}
        type="error"
        showIcon
        className="mb-6 shadow-sm"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {alerts}
    </div>
  );
};

export default ProjectAlerts;
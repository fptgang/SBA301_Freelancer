// Private store for configuration values

const store = {
  installDate: new Date('2024-12-01T00:00:00'),
  hashPass: '$2a$10$a.andI/9BHw4zF3dm5wX1erg1BuJ2jwDksUGAYSxPGGIp6JM/AIZ.', // 1
  depositAmount: {
    min: 10,
    max: 1000
  },
  projectBudget: {
    min: 10,
    max: 1000
  },
  projectStartDayDelay: {
    min: 3,
    max: 30
  },
  projectRequiredSkillAmount: {
    min: 1,
    max: 10
  },
  profileRequiredSkillAmount: {
    min: 1,
    max: 10
  },
  profileOverviewLineAmount: {
    min: 2,
    max: 5
  },
  projectDescriptionLineAmount: {
    min: 10,
    max: 30
  },
  projectFileAmount: {
    min: 0,
    max: 5
  },
  milestoneAmount: {
    min: 1,
    max: 10
  },
  milestoneDeliverableFileAmount: {
    min: 0,
    max: 5
  },
  milestoneDescriptionLineAmount: {
    min: 2,
    max: 4
  },
  milestoneDeadlineIncreaseDays: {
    min: 3,
    max: 14
  },
  proposalFileAmount: {
    min: 0,
    max: 3
  },
  simulationActionWeights: {
    skip: 500,
    createAccount: 40,
    makeDeposit: 10,
    requestWithdrawal: 10,
    createProject: 30,
    terminateProjectBeforeContract: 5,
    unpauseProject: 10,
    createProposal: 80,
    withdrawProposal: 5,
    chooseProposal: 60,
    signContract: 30,
    submitWork: 50,
    confirmWork: 60,
    extendDeadline: 30,
    fundMilestoneBudget: 40,
    clientRequestProjectTermination: 5
  } as const,
  targetMinFinishedProject: 5
};

// Exports that maintain references
export let installDate = () => store.installDate;
export let hashPass = () => store.hashPass;
export let depositAmount = () => store.depositAmount;
export let projectFileAmount = () => store.projectFileAmount;
export let milestoneDeliverableFileAmount = () => store.milestoneDeliverableFileAmount;
export let proposalFileAmount = () => store.proposalFileAmount;
export let projectRequiredSkillAmount = () => store.projectRequiredSkillAmount;
export let profileRequiredSkillAmount = () => store.profileRequiredSkillAmount;
export let profileOverviewLineAmount = () => store.profileOverviewLineAmount;
export let projectDescriptionLineAmount = () => store.projectDescriptionLineAmount;
export let milestoneAmount = () => store.milestoneAmount;
export let milestoneDescriptionLineAmount = () => store.milestoneDescriptionLineAmount;
export let milestoneDeadlineIncreaseDays = () => store.milestoneDeadlineIncreaseDays;
export let simulationActionWeights = () => store.simulationActionWeights;
export let targetMinFinishedProject = () => store.targetMinFinishedProject;
export let projectBudget = () => store.projectBudget;
export let projectStartDayDelay = () => store.projectStartDayDelay;

// Setters
export const setInstallDate = (value: typeof store.installDate) => {
  store.installDate = value;
};
export const setHashPass = (value: typeof store.hashPass) => {
  store.hashPass = value;
};
export const setDepositAmount = (value: typeof store.depositAmount) => {
  Object.assign(store.depositAmount, value);
};
export const setProjectBudget = (value: typeof store.projectBudget) => {
  Object.assign(store.projectBudget, value);
};
export const setProjectStartDayDelay = (value: typeof store.projectStartDayDelay) => {
  Object.assign(store.projectStartDayDelay, value);
};
export const setProjectRequiredSkillAmount = (value: typeof store.projectRequiredSkillAmount) => {
  Object.assign(store.projectRequiredSkillAmount, value);
};
export const setProfileRequiredSkillAmount = (value: typeof store.profileRequiredSkillAmount) => {
  Object.assign(store.profileRequiredSkillAmount, value);
};
export const setProfileOverviewLineAmount = (value: typeof store.profileOverviewLineAmount) => {
  Object.assign(store.profileOverviewLineAmount, value);
}
export const setProjectDescriptionLineAmount = (value: typeof store.projectDescriptionLineAmount) => {
  Object.assign(store.projectDescriptionLineAmount, value);
}
export const setProjectFileAmount = (value: typeof store.projectFileAmount) => {
  Object.assign(store.projectFileAmount, value);
}
export const setProposalFileAmount = (value: typeof store.proposalFileAmount) => {
  Object.assign(store.proposalFileAmount, value);
}
export const setMilestoneDeliverableFileAmount = (value: typeof store.milestoneDeliverableFileAmount) => {
  Object.assign(store.milestoneDeliverableFileAmount, value);
}
export const setMilestoneAmount = (value: typeof store.milestoneAmount) => {
  Object.assign(store.milestoneAmount, value);
};
export const setMilestoneDescriptionLineAmount = (value: typeof store.milestoneDescriptionLineAmount) => {
  Object.assign(store.milestoneDescriptionLineAmount, value);
}
export const setMilestoneDeadlineIncreaseDays = (value: typeof store.milestoneDeadlineIncreaseDays) => {
  Object.assign(store.milestoneDeadlineIncreaseDays, value);
};
export const setSimulationActionWeights = (value: typeof store.simulationActionWeights) => {
  Object.assign(store.simulationActionWeights, value);
};
export const setTargetMinFinishedProject = (value: typeof store.targetMinFinishedProject) => {
  store.targetMinFinishedProject = value;
};


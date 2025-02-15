// Private store for configuration values
const store = {
  installDate: new Date('2024-12-01T00:00:00'),
  hashPass: '$2a$10$a.andI/9BHw4zF3dm5wX1erg1BuJ2jwDksUGAYSxPGGIp6JM/AIZ.', // 1
  depositAmount: {
    min: 10,
    max: 1000
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
    min: 5,
    max: 20
  },
  milestoneAmount: {
    min: 1,
    max: 5
  },
  milestoneDeadlineIncreaseDays: {
    min: 7,
    max: 14
  },
  milestoneBudget: [
    // casual
    {min: 5, max: 500},
    // standard
    {min: 500, max: 2000},
    // professional  
    {min: 2000, max: 5000},
    // enterprise
    {min: 5000, max: 15000},
    // corporate
    {min: 15000, max: 50000}
  ],
  depositEscrowOnDemand: {
    probability: 0.5
  },
  simulationActionWeights: {
    skip: 1000,
    createAccount: 50,
    createProject: 20,
    createProposal: 60,
    makeDeposit: 30,
    requestWithdrawal: 20,
    chooseProposal: 30,
    startMilestone: 50,
    completeMilestone: 50
  } as const
};

// Exports that maintain references
export let installDate = () => store.installDate;
export let hashPass = () => store.hashPass;
export let depositAmount = () => store.depositAmount;
export let projectRequiredSkillAmount = () => store.projectRequiredSkillAmount;
export let profileRequiredSkillAmount = () => store.profileRequiredSkillAmount;
export let profileOverviewLineAmount = () => store.profileOverviewLineAmount;
export let projectDescriptionLineAmount = () => store.projectDescriptionLineAmount;
export let milestoneAmount = () => store.milestoneAmount;
export let milestoneDeadlineIncreaseDays = () => store.milestoneDeadlineIncreaseDays;
export let milestoneBudget = () => store.milestoneBudget;
export let depositEscrowOnDemand = () => store.depositEscrowOnDemand;
export let simulationActionWeights = () => store.simulationActionWeights;

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
export const setMilestoneAmount = (value: typeof store.milestoneAmount) => {
  Object.assign(store.milestoneAmount, value);
};
export const setMilestoneDeadlineIncreaseDays = (value: typeof store.milestoneDeadlineIncreaseDays) => {
  Object.assign(store.milestoneDeadlineIncreaseDays, value);
};
export const setMilestoneBudget = (value: typeof store.milestoneBudget) => {
  store.milestoneBudget = value;
};
export const setDepositEscrowOnDemand = (value: typeof store.depositEscrowOnDemand) => {
  Object.assign(store.depositEscrowOnDemand, value);
};
export const setSimulationActionWeights = (value: typeof store.simulationActionWeights) => {
  Object.assign(store.simulationActionWeights, value);
};

import {faker} from "@faker-js/faker";
import {Project, TerminationReason} from "../model/Project.js";
import {ProjectStatus} from "../model/ProjectStatus.js";
import {ProjectRequiredSkill} from "../model/ProjectRequiredSkill.js";
import {ProficiencyLevel} from "../model/ProficiencyLevel.js";
import {File} from "../model/File.js";
import {Milestone} from "../model/Milestone.js";
import {MilestoneStatus} from "../model/MilestoneStatus.js";
import {AccountPool} from "./account.js";
import {AccountRole} from "../model/AccountRole.js";
import {PickSkill} from "../seed/SkillDump.js";
import {PickCategory} from "../seed/CategoryDump.js";
import {
  milestoneAmount,
  milestoneDeadlineIncreaseDays,
  milestoneDescriptionLineAmount,
  projectBudget,
  projectDescriptionLineAmount,
  projectFileAmount,
  projectRequiredSkillAmount,
  projectStartDayDelay
} from "../config.js";
import {SqlFileAppender} from "../appender.js";
import {TransactionPool} from "./transaction.js";
import {FilePool} from "./file.js";
import {ProposalPool} from "./proposal";
import {ProposalStatus} from "../model/ProposalStatus";
import {generateSegmentedArray} from "../utils";
import {ContractStatus} from "../model/Contract";
import {TransactionType} from "../model/TransactionType";
import {TransactionStatus} from "../model/TransactionStatus";
import {FundStatus} from "../model/FundStatus";

export class projectPool {
  private projects: Project[] = [];
  private nextId: number = 1;
  private nextSkillId: number = 1;
  private nextMilestoneId: number = 1;

  add(project: Project) {
    this.projects.push(project);
  }

  getNextId(): number {
    return this.nextId++;
  }

  getNextSkillId(): number {
    return this.nextSkillId++;
  }

  getNextMilestoneId(): number {
    return this.nextMilestoneId++;
  }

  dump(): string {
    const projectDump = Project.dump(this.projects);
    const skillsDump = ProjectRequiredSkill.dump(
      this.projects.flatMap(p => p.project_skills)
    );
    const milestonesDump = Milestone.dump(
      this.projects.flatMap(p => p.milestones)
    );

    return '\n' + [projectDump, skillsDump, milestonesDump]
      .filter(dump => dump.length > 0)
      .join('\n\n');
  }

  pickProject(date: Date, status?: ProjectStatus): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = status ? project.status === status : true;
      const isVisible = project.is_visible;
      return matchesDate && matchesStatus && isVisible;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  pickProjectWithActiveMilestone(date: Date, status?: ProjectStatus): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = status ? project.status === status : true;
      const isVisible = project.is_visible;
      return matchesDate && matchesStatus && isVisible && project.activeMilestone;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  pickProjectInProposalSubmission(date: Date): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = project.status === ProjectStatus.OPEN;
      const isVisible = project.is_visible;
      const acceptProposal = date.getTime() < project.start_date.getTime() - 24 * 60 * 60 * 1000;
      return matchesDate && matchesStatus && isVisible && acceptProposal;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  findExpiredProjectWithoutContract(date: Date): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = project.status === ProjectStatus.OPEN;
      const isVisible = project.is_visible;
      const hasContract = !!project.contract;
      const hasActiveMilestone = !!project.activeMilestone;
      // If 1 day before startDate reaches with no acceptance, all proposals are automatically EXPIRED
      const after1dayBeforeStartDate = date.getTime() >= project.start_date.getTime() - 24 * 60 * 60 * 1000;
      return matchesDate && matchesStatus && isVisible && !hasContract && !hasActiveMilestone && after1dayBeforeStartDate;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  // terminable projects subject to OTHER termination reason
  pickTerminableProjectDueToOtherReason(date: Date): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = project.status === ProjectStatus.OPEN;
      const isVisible = project.is_visible;
      const hasContract = !!project.contract;
      const hasActiveMilestone = !!project.activeMilestone;
      const afterStartDate = date >= project.start_date;
      return matchesDate && matchesStatus && isVisible && !hasContract && !hasActiveMilestone && !afterStartDate;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  // terminable projects subject to CONTRACT_UNSIGNED termination reason
  pickTerminableProjectDueToUnsignedExpiredContract(date: Date): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = project.status === ProjectStatus.IN_PROGRESS;
      const isVisible = project.is_visible;
      const hasUnsignedContract = !!project.contract && project.contract.status === ContractStatus.UNSIGNED;
      const afterStartDate = date >= project.start_date;
      return matchesDate && matchesStatus && isVisible && hasUnsignedContract && afterStartDate;
    });

    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  pickTerminableProjectDueToClientRequest(date: Date): Project | null {
    const eligibleProjects = this.projects.filter(project => {
      const matchesDate = project.created_at && project.created_at <= date;
      const matchesStatus = project.status === ProjectStatus.IN_PROGRESS;
      const isVisible = project.is_visible;
      const hasContract = !!project.contract;
      const toTerminate = project.to_terminate;
      const afterMilestoneDeadline = !!project.activeMilestone && date >= project.activeMilestone?.deadline;
      return matchesDate && matchesStatus && isVisible && hasContract && toTerminate && afterMilestoneDeadline;
    });
    if (eligibleProjects.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProjects.length);
    return eligibleProjects[randomIndex];
  }

  countFinished(): number {
    return this.projects.filter(p => p.status === ProjectStatus.FINISHED).length;
  }

  count(): number {
    return this.projects.length;
  }
}

export let ProjectPool = new projectPool();
export const ResetProjectPool = () => ProjectPool = new projectPool();
export const DumpProjects = () => SqlFileAppender.append(ProjectPool.dump());

export const createProject = (date: Date) => {
  // Pick a client from account pool
  const client = AccountPool.pickAccount(date, AccountRole.CLIENT, false);
  if (!client)
    return false;

  const minBudget = faker.number.int(projectBudget());

  // Create project
  const project = new Project({
    project_id: ProjectPool.getNextId(),
    created_at: date,
    updated_at: date,
    title: faker.commerce.productName(),
    description: faker.lorem.paragraphs(projectDescriptionLineAmount()),
    status: ProjectStatus.OPEN,
    is_visible: true,
    client_id: client.account_id,
    staff_id: null,
    project_category_id: PickCategory().project_category_id,
    client: client,
    min_budget: minBudget,
    max_budget: faker.number.int({
      min: minBudget,
      max: projectBudget().max
    }),
    start_date: new Date(date.getTime() + faker.number.int(projectStartDayDelay()) * 24 * 60 * 60 * 1000)
  });
  project.client = client;

  const numSkills = faker.number.int(projectRequiredSkillAmount());
  const addedSkillIds = new Set<number>();

  for (let i = 0; i < numSkills; i++) {
    const skill = PickSkill();
    if (addedSkillIds.has(skill.skill_id)) continue;
    addedSkillIds.add(skill.skill_id);

    project.project_skills.push(new ProjectRequiredSkill(
      ProjectPool.getNextSkillId(),
      date,
      faker.helpers.arrayElement(Object.values(ProficiencyLevel)),
      date,
      project.project_id,
      skill.skill_id
    ));
  }

  const numMilestones = faker.number.int(milestoneAmount());
  let currentDeadline = date;
  const budgetRatios = generateSegmentedArray(numMilestones);

  for (let i = 0; i < numMilestones; i++) {
    currentDeadline = new Date(currentDeadline.getTime() +
      faker.number.int(milestoneDeadlineIncreaseDays()) * 24 * 60 * 60 * 1000);

    project.milestones.push(new Milestone(
      ProjectPool.getNextMilestoneId(),
      budgetRatios[i],
      currentDeadline,
      MilestoneStatus.PENDING,
      FundStatus.NONE,
      faker.commerce.productAdjective() + " " + faker.commerce.productName(),
      faker.datatype.boolean() ? faker.lorem.paragraph(milestoneDescriptionLineAmount()) : null,
      project.project_id,
      true,
      date,
      date
    ));
  }

  ProjectPool.add(project);

  // create files
  const numFiles = faker.number.int(projectFileAmount());
  for (let i = 0; i < numFiles; i++) {
    FilePool.add(new File({
      file_id: FilePool.getNextId(),
      created_at: date,
      file_name: faker.system.fileName(),
      file_type: faker.system.fileExt(),
      file_url: faker.image.url(),
      is_visible: true,
      size: faker.number.int(1000000),
      message_id: null,
      project_id: project.project_id,
      proposal_id: null,
      uploader_id: client.account_id,
      milestone_id: null
    }));
  }

  return true;
};

// Client can terminate project before contract
export const terminateProjectBeforeContract = (date: Date) => {
  let project = ProjectPool.pickProject(date, ProjectStatus.OPEN);
  if (!project)
    return false;
  project.status = ProjectStatus.TERMINATED;
  project.termination_reason = TerminationReason.OTHER;
  project.updated_at = date;
  for (let milestone of project.milestones) {
    milestone.status = MilestoneStatus.TERMINATED;
    milestone.updatedAt = date;
  }
  ProposalPool.pickAllProposals(date, ProposalStatus.PENDING, project.project_id)
    .forEach(p => {
      p.status = ProposalStatus.REJECTED;
      p.updated_at = date;
    })
  //console.log("Project ", project.project_id, " terminated as client requested before contract");
  return true;
}

// If 1 day before startDate reaches with no acceptance:
export const taskAutoPauseUncontractedProject = (date: Date) => {
  let project = ProjectPool.findExpiredProjectWithoutContract(date);
  if (!project)
    return false;
  project.status = ProjectStatus.PAUSED;
  project.updated_at = date;
  ProposalPool.pickAllProposals(date, ProposalStatus.PENDING, project.project_id)
    .forEach(p => {
      p.status = ProposalStatus.EXPIRED;
      p.updated_at = date;
    });
  //console.log("Project ", project.project_id, " paused due to no contract made by 1 day before StartDate");
  // before contract so no refund here
  return true;
}

// If a contract is made but not signed at startDate
export const taskAutoTerminateProjectDueToUnsignedContract = (date: Date) => {
  let project = ProjectPool.pickTerminableProjectDueToUnsignedExpiredContract(date);
  if (!project || !project.contract) {
    return false;
  }
  project.contract.status = ContractStatus.TERMINATED;
  project.contract.terminated_at = date;
  project.contract.updated_at = date;
  project.status = ProjectStatus.TERMINATED;
  project.termination_reason = TerminationReason.CONTRACT_UNSIGNED;
  project.updated_at = date;
  for (let milestone of project.milestones) {
    milestone.status = MilestoneStatus.TERMINATED;
    milestone.updatedAt = date;
  }
  TransactionPool.refundEscrow(date, project.client,
    project.milestones[0].budgetRatio * project.contract.budget,
    project.milestones[0].milestoneId);
  project.milestones[0].fundStatus = FundStatus.REFUNDED;
  project.milestones[0].updatedAt = date;
  //console.log("Project ", project.project_id, " terminated due to unsigned contract");
  return true;
}

export const unpauseProject = (date: Date) => {
  let project = ProjectPool.pickProject(date, ProjectStatus.PAUSED);
  if (!project)
    return false;

  project.start_date = new Date(date.getTime() + faker.number.int(projectStartDayDelay()) * 24 * 60 * 60 * 1000);
  project.status = ProjectStatus.OPEN;
  project.updated_at = date;

  let currentDeadline = project.start_date;
  for (let i = 0; i < project.milestones.length; i++) {
    currentDeadline = new Date(currentDeadline.getTime() +
      faker.number.int(milestoneDeadlineIncreaseDays()) * 24 * 60 * 60 * 1000);
    project.milestones[i].deadline = currentDeadline;
    project.milestones[i].updatedAt = date;
  }
  console.log("Project ", project.project_id, " unpaused");
  return true;
}

export const clientRequestProjectTermination = (date: Date) => {
  const project = ProjectPool.pickProjectWithActiveMilestone(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone)
    return false;

  if (project.activeMilestone.deadline.getTime() - 2 * 24 * 60 * 60 * 1000 <= date.getTime()) {
    return false;
  }

  project.to_terminate = true;
  project.updated_at = date;
  console.log("Project ", project.project_id, " is going to be terminated due to client request");
  return true;
}

export const taskAutoTerminateProjectDueToClientRequest = (date: Date) => {
  let project = ProjectPool.pickTerminableProjectDueToClientRequest(date);
  if (!project || !project.contract || !project.activeMilestone)
    return false;
  project.status = ProjectStatus.TERMINATED;
  project.termination_reason = TerminationReason.CLIENT_REQUEST_TERMINATION;
  project.updated_at = date;

  project.contract.status = ContractStatus.TERMINATED;
  project.contract.terminated_at = date;
  project.contract.updated_at = date;

  let activeMilestone = project.activeMilestone;
  activeMilestone.status = MilestoneStatus.TERMINATED;
  activeMilestone.fundStatus = FundStatus.RELEASED;
  activeMilestone.updatedAt = date;
  TransactionPool.releaseEscrow(date, project.contract.freelancer, project.contract.budget * activeMilestone.budgetRatio, activeMilestone.milestoneId);

  for (let milestone of project.milestones) {
    if (milestone.status === MilestoneStatus.PENDING) {
      milestone.status = MilestoneStatus.TERMINATED;
      milestone.updatedAt = date;

      const hasMilestoneEscrowDeposit = TransactionPool.pickTransaction(
        TransactionType.ESCROW_DEPOSIT, TransactionStatus.SUCCESS, milestone.milestoneId).length > 0;

      if (hasMilestoneEscrowDeposit) {
        TransactionPool.refundEscrow(date, project.client, project.contract.budget * milestone.budgetRatio, milestone.milestoneId);
        milestone.fundStatus = FundStatus.REFUNDED;
        milestone.updatedAt = date;
      }
    }
  }
  //console.log("Project ", project.project_id, " terminated due to client request in previous milestone");
  return true;
}

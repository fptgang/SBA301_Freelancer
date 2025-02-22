import {faker} from "@faker-js/faker";
import {Project} from "../model/Project.js";
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
  milestoneBudget,
  milestoneDeadlineIncreaseDays,
  milestoneDeliverableFileAmount,
  milestoneDescriptionLineAmount,
  projectDescriptionLineAmount,
  projectFileAmount,
  projectRequiredSkillAmount
} from "../config.js";
import {SqlFileAppender} from "../appender.js";
import {TransactionPool} from "./transaction.js";
import { FilePool } from "./file.js";

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

  dumpActiveProposalId(): string {
    return '\n' + Project.dumpActiveProposalId(this.projects);
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

  countFinished(): number {
    return this.projects.filter(p => p.status === ProjectStatus.FINISHED).length;
  }
}

export let ProjectPool = new projectPool();
export const ResetProjectPool = () => ProjectPool = new projectPool();
export const DumpProjects = () => SqlFileAppender.append(ProjectPool.dump());
export const DumpActiveProposalId = () => SqlFileAppender.append(ProjectPool.dumpActiveProposalId());

export const createProject = (date: Date) => {
  // Pick a client from account pool
  const client = AccountPool.pickAccount(date, AccountRole.CLIENT, true);
  if (!client) return

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
    project_category_id: PickCategory().project_category_id,
    active_proposal_id: null,
    client: client
  });

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

  for (let i = 0; i < numMilestones; i++) {
    currentDeadline = new Date(currentDeadline.getTime() +
      faker.number.int(milestoneDeadlineIncreaseDays()) * 24 * 60 * 60 * 1000);

    const budgetRange = milestoneBudget()[Math.floor(Math.random() * milestoneBudget().length)];

    project.milestones.push(new Milestone(
      ProjectPool.getNextMilestoneId(),
      faker.number.int(budgetRange),
      currentDeadline,
      MilestoneStatus.PENDING,
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

  return project;
};

export const startMilestone = (date: Date) => {
  let milestone = null;
  let project = ProjectPool.pickProject(date, ProjectStatus.OPEN);

  // if the project is open but a proposal has been picked, start the first milestone
  if (project) {
    if (!project.activeProposal) return;
    milestone = project.milestones[0];
    project.status = ProjectStatus.IN_PROGRESS;
    project.updated_at = date;
  }
  // if the project is in progress, start the next milestone
  else {
    project = ProjectPool.pickProject(date, ProjectStatus.IN_PROGRESS);
    if (!project) return;

    if (project.activeMilestone && project.activeMilestone.status === MilestoneStatus.IN_PROGRESS) return;

    milestone = project.nextMilestone();
  }

  if (!milestone || !project.client) return;

  // might have fund or not
  if (TransactionPool.depositEscrow(date, project.client, milestone.budget)) {
    milestone.status = MilestoneStatus.IN_PROGRESS;
    milestone.updatedAt = date;
    project.activeMilestone = milestone;
  }
};

export const completeMilestone = (date: Date) => {
  const project = ProjectPool.pickProject(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone || !project.activeProposal || !project.activeProposal.freelancer) return;

  let milestone = project.activeMilestone;
  if (milestone.status !== MilestoneStatus.IN_PROGRESS) return;

  milestone.status = MilestoneStatus.FINISHED;
  milestone.updatedAt = date;
  TransactionPool.releaseEscrow(date, project.activeProposal.freelancer, milestone.budget);

  project.activeMilestone = null;

  // continue next milestone or finish project
  if (!project.nextMilestone()) {
    project.status = ProjectStatus.FINISHED;
    project.updated_at = date;

    // create deliverable files
    const numFiles = faker.number.int(milestoneDeliverableFileAmount());
    console.log(`Creating ${numFiles} deliverable files for milestone ${milestone.milestoneId}`);
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
        project_id: null,
        proposal_id: null,
        uploader_id: project.client_id,
        milestone_id: milestone.milestoneId
      }));
    }

    return;
  }
  startMilestone(date);
};  

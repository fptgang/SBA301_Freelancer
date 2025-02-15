import {escapeSingleQuotes} from "../utils.js";
import {Account} from "./Account.js";
import {Milestone} from "./Milestone.js";
import {MilestoneStatus} from "./MilestoneStatus.js";
import {ProjectRequiredSkill} from "./ProjectRequiredSkill.js";
import {ProjectStatus} from "./ProjectStatus.js";
import {Proposal} from "./Proposal.js";

export class Project {
  project_id: number;
  created_at: Date | null;
  description: string;
  is_visible: boolean;
  status: ProjectStatus;
  title: string;
  updated_at: Date | null;
  active_proposal_id: number | null;
  project_category_id: number;
  client_id: number;

  // not dumpable
  client: Account | null;
  project_skills: ProjectRequiredSkill[];
  milestones: Milestone[];
  activeMilestone: Milestone | null;
  activeProposal: Proposal | null;

  constructor(data: Partial<Project>) {
    this.project_id = data.project_id || 0;
    this.created_at = data.created_at ? new Date(data.created_at) : null;
    this.description = data.description || '';
    this.is_visible = data.is_visible ?? true;
    this.status = data.status || ProjectStatus.OPEN;
    this.title = data.title || '';
    this.updated_at = data.updated_at ? new Date(data.updated_at) : null;
    this.active_proposal_id = data.active_proposal_id || null;
    this.project_category_id = data.project_category_id || 0;
    this.client_id = data.client_id || 0;
    this.client = data.client || null;
    this.project_skills = data.project_skills || [];
    this.milestones = data.milestones || [];
    this.activeMilestone = data.activeMilestone || null;
    this.activeProposal = data.activeProposal || null;
  }

  static dump(projects: Project[]): string {
    if (projects.length === 0) return '';

    const values = projects.map(project => {
      return `(${[
        project.project_id,
        project.created_at ? `'${project.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        `'${escapeSingleQuotes(project.description)}'`,
        project.is_visible ? 1 : 0,
        `'${project.status}'`,
        `'${escapeSingleQuotes(project.title)}'`,
        project.updated_at ? `'${project.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        'NULL', // Note: active_proposal_id is set later to avoid reference errors
        project.project_category_id,
        project.client_id
      ].join(', ')})`;
    }).join(',\n');

    return `INSERT INTO \`projects\` (\`project_id\`, \`created_at\`, \`description\`, \`is_visible\`, \`status\`, \`title\`, \`updated_at\`, \`active_proposal_id\`, \`project_category_id\`, \`client_id\`) VALUES\n${values};`;
  }

  static dumpActiveProposalId(projects: Project[]): string {
    if (projects.length === 0) return '';

    const values = projects.filter(project => project.active_proposal_id !== null).map(project => {
      return `UPDATE \`projects\` SET \`active_proposal_id\` = ${project.active_proposal_id} WHERE \`project_id\` = ${project.project_id};`;
    }).join('\n');

    return values;
  }

  nextMilestone(): Milestone | undefined {
    return this.milestones.find(milestone => milestone.status === MilestoneStatus.PENDING);
  }
}
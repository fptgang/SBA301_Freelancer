import {escapeSingleQuotes} from "../utils.js";
import {Account} from "./Account.js";
import {Milestone} from "./Milestone.js";
import {MilestoneStatus} from "./MilestoneStatus.js";
import {ProjectRequiredSkill} from "./ProjectRequiredSkill.js";
import {ProjectStatus} from "./ProjectStatus.js";
import Contract from "./Contract";

export enum TerminationReason {
  /**
   Other reasons before the contract is made
   e.g. Client didn’t accept any proposal by startDate
   No proposals were submitted by startDate
   */
  OTHER = "OTHER",

  /** Contract remained unsigned by the start date */
  CONTRACT_UNSIGNED = "CONTRACT_UNSIGNED",

  /** Client failed to fund milestone within 24 hours */
  CLIENT_NO_FUNDS = "CLIENT_NO_FUNDS",

  /** Client can request termination before 2 days past the current milestone deadline
   Become effective starting from the next milestone  */
  CLIENT_REQUEST_TERMINATION = "CLIENT_REQUEST_TERMINATION",

  /** Freelancer abandoned work for 2 days past the milestone deadline */
  FREELANCER_ABANDONED_WORK = "FREELANCER_ABANDONED_WORK",

  /** Project terminated by staff after conflict resolution */
  STAFF_INTERVENTION_DECISION = "STAFF_INTERVENTION_DECISION"
}

export class Project {
  project_id: number;
  created_at: Date | null;
  description: string;
  is_visible: boolean;
  max_budget: number;
  min_budget: number;
  start_date: Date;
  status: ProjectStatus;
  termination_reason: TerminationReason | null;
  title: string;
  to_terminate: boolean;
  updated_at: Date | null;
  project_category_id: number;
  client_id: number;
  staff_id: number | null;

  // not dumpable
  client: Account;
  project_skills: ProjectRequiredSkill[];
  milestones: Milestone[];
  activeMilestone: Milestone | null;
  contract: Contract | undefined;

  constructor(data: Partial<Project>) {
    this.project_id = data.project_id || 0;
    this.created_at = data.created_at ? new Date(data.created_at) : null;
    this.description = data.description || '';
    this.is_visible = data.is_visible ?? true;
    this.max_budget = data.max_budget ?? 0;
    this.min_budget = data.min_budget ?? 0;
    this.start_date = data.start_date ?? new Date();
    this.status = data.status || ProjectStatus.OPEN;
    this.to_terminate = data.to_terminate || false;
    this.termination_reason = data.termination_reason || null;
    this.title = data.title || '';
    this.updated_at = data.updated_at ? new Date(data.updated_at) : null;
    this.project_category_id = data.project_category_id || 0;
    this.client_id = data.client_id || 0;
    this.staff_id = data.staff_id || null;

    this.client = data.client || {} as Account;
    this.project_skills = data.project_skills || [];
    this.milestones = data.milestones || [];
    this.activeMilestone = data.activeMilestone || null;
  }

  static dump(projects: Project[]): string {
    if (projects.length === 0) return '';

    const values = projects.map(project => {
      return `(${[
        project.project_id,
        project.created_at ? `'${project.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        `'${escapeSingleQuotes(project.description)}'`,
        project.is_visible ? 1 : 0,
        project.max_budget.toFixed(2),
        project.min_budget.toFixed(2),
        `'${project.start_date.toISOString().slice(0, 19).replace('T', ' ')}.000000'`,
        `'${project.status}'`,
        project.termination_reason ? `'${escapeSingleQuotes(project.termination_reason)}'` : 'NULL',
        project.to_terminate ? 1 : 0,
        project.activeMilestone ? project.activeMilestone.milestoneId : 'NULL',
        `'${escapeSingleQuotes(project.title)}'`,
        project.updated_at ? `'${project.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        project.project_category_id,
        project.client_id,
        project.staff_id ? project.staff_id : 'NULL'
      ].join(', ')})`;
    }).join(',\n');

    return `INSERT INTO \`projects\` (\`project_id\`, \`created_at\`,
                                      \`description\`,
                                      \`is_visible\`, \`max_budget\`,
                                      \`min_budget\`, \`start_date\`,
                                      \`status\`, \`termination_reason\`,
                                      \`to_terminate\`, \`active_milestone_id\`, \`title\`,
                                      \`updated_at\`, \`project_category_id\`,
                                      \`client_id\`, \`staff_id\`)
            VALUES ${values};`;
  }

  nextMilestone(): Milestone | undefined {
    return this.milestones.find(milestone => milestone.status === MilestoneStatus.PENDING);
  }
}
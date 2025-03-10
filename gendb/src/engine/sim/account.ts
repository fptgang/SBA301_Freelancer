import {SqlFileAppender} from "../appender.js";
import {
  hashPass,
  installDate,
  profileOverviewLineAmount,
  profileRequiredSkillAmount
} from "../config.js";
import {Account} from "../model/Account.js";
import {AccountRole} from "../model/AccountRole.js";
import {faker} from "@faker-js/faker";
import {Profile} from "../model/Profile.js";
import {ProfilePool} from "./profile.js";
import {PickSkill} from "../seed/SkillDump.js";
import {ProfileSkill} from "../model/ProfileSkill.js";
import {ProficiencyLevel} from "../model/ProficiencyLevel.js";

export class accountPool {
  private accounts: Account[] = [];
  private nextId: number = 1;

  add(account: Account) {
    this.accounts.push(account);
  }

  pickAccount(date: Date, role?: AccountRole, requireVerified?: boolean): Account | null {
    const eligibleAccounts = this.accounts.filter(account => {
      const matchesDate = account.created_at <= date;
      const matchesRole = role ? account.role === role : true;
      const isVisible = account.is_visible;
      const isVerifiedIfRequired = requireVerified ? account.is_verified : true;
      const isNotEscrow = account.account_id !== 1;
      return matchesDate && matchesRole && isVisible && isVerifiedIfRequired && isNotEscrow;
    });

    if (eligibleAccounts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleAccounts.length);
    return eligibleAccounts[randomIndex];
  }

  getNextId(): number {
    return this.nextId++;
  }

  dump(): string {
    return '\n' + Account.dump(this.accounts);
  }

  count(): number {
    return this.accounts.length;
  }
}

export let AccountPool = new accountPool();
export const DumpAccounts = () => SqlFileAppender.append(AccountPool.dump());
export let EscrowAccount = {} as Account;

export const ResetAccountPool = () => {
  AccountPool = new accountPool();

  AccountPool.add(EscrowAccount = new Account({
    account_id: AccountPool.getNextId(),
    avatar_url: null,
    balance: 0,
    created_at: installDate(),
    email: 'escrow@hirable.com',
    first_name: 'Escrow',
    is_verified: true,
    is_visible: false,
    last_name: null,
    password: hashPass(),
    role: AccountRole.ADMIN,
    updated_at: installDate(),
    verified_at: installDate()
  }));

  AccountPool.add(new Account({
    account_id: AccountPool.getNextId(),
    avatar_url: null,
    balance: 0,
    created_at: installDate(),
    email: 'admin1@hirable.com',
    first_name: 'Admin',
    is_verified: true,
    is_visible: true,
    last_name: 'One',
    password: hashPass(),
    role: AccountRole.ADMIN,
    updated_at: installDate(),
    verified_at: installDate()
  }));

  AccountPool.add(new Account({
    account_id: AccountPool.getNextId(),
    avatar_url: null,
    balance: 0,
    created_at: installDate(),
    email: 'admin2@hirable.com',
    first_name: 'Admin',
    is_verified: true,
    is_visible: true,
    last_name: 'Two',
    password: hashPass(),
    role: AccountRole.ADMIN,
    updated_at: installDate(),
    verified_at: installDate()
  }));

  AccountPool.add(new Account({
    account_id: AccountPool.getNextId(),
    avatar_url: null,
    balance: 0,
    created_at: installDate(),
    email: 'staff1@hirable.com',
    first_name: 'Staff',
    is_verified: true,
    is_visible: true,
    last_name: 'One',
    password: hashPass(),
    role: AccountRole.STAFF,
    updated_at: installDate(),
    verified_at: installDate()
  }));

  AccountPool.add(new Account({
    account_id: AccountPool.getNextId(),
    avatar_url: null,
    balance: 0,
    created_at: installDate(),
    email: 'staff2@hirable.com',
    first_name: 'Staff',
    is_verified: true,
    is_visible: true,
    last_name: 'Two',
    password: hashPass(),
    role: AccountRole.STAFF,
    updated_at: installDate(),
    verified_at: installDate()
  }));
}

export const createAccount = (date: Date) => {
  const roles = [AccountRole.CLIENT, AccountRole.FREELANCER];
  const role = roles[Math.floor(Math.random() * roles.length)];

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const verified = faker.datatype.boolean();
  const accId = AccountPool.getNextId();

  const account = new Account({
    account_id: accId,
    avatar_url: null,
    balance: 0,
    created_at: date,
    email: `acc${accId}@hirable.com`,
    first_name: firstName,
    is_verified: verified,
    is_visible: true,
    last_name: lastName,
    password: hashPass(),
    role: role,
    updated_at: date,
    verified_at: verified ? date : null
  });

  // Generate profile for freelancers
  if (role === AccountRole.FREELANCER) {
    const profile = new Profile(
      ProfilePool.getNextId(),
      date,
      faker.lorem.sentence(),
      true,
      faker.helpers.arrayElement(['English', 'Spanish', 'French', 'German', 'Chinese']),
      faker.lorem.paragraphs(profileOverviewLineAmount()),
      faker.phone.number(),
      date,
      account.account_id,
      []
    );

    const numSkills = faker.number.int(profileRequiredSkillAmount());
    const addedSkillIds = new Set<number>();

    for (let i = 0; i < numSkills; i++) {
      const skill = PickSkill();
      if (addedSkillIds.has(skill.skill_id)) continue;
      addedSkillIds.add(skill.skill_id);

      profile.profileSkills.push(new ProfileSkill(
        ProfilePool.getNextSkillId(),
        date,
        faker.helpers.arrayElement(Object.values(ProficiencyLevel)),
        date,
        profile.profile_id,
        skill.skill_id
      ));
    }

    ProfilePool.add(profile);
  }

  AccountPool.add(account);

  return true;
}

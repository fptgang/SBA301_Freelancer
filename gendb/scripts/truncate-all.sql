use hirable;

SET @@foreign_key_checks = 0;

truncate table files;

truncate table messages;

truncate table milestones;

truncate table profile_skills;

truncate table profiles;

truncate table project_required_skills;

truncate table projects;

truncate table proposals;

truncate table project_categories;

truncate table refresh_token;

truncate table skills;

truncate table transactions;

truncate table account;

SET @@foreign_key_checks = 1;

import { newModel, StringAdapter } from "casbin";

export const model = newModel(`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)
`);

export const adapter = new StringAdapter(`
# Admin permissions
p, admin, accounts, (list)|(create)
p, admin, accounts/*, (edit)|(show)|(delete)
p, admin, accounts/*, field
p, admin, projects, (list)|(create)
p, admin, projects/*, (edit)|(show)|(delete)
p, admin, projects/*, field
p, admin, project-categories, (list)|(create)
p, admin, project-categories/*, (edit)|(show)|(delete)
p, admin, project-categories/*, field
p, admin, skills, (list)|(create)
p, admin, skills/*, (edit)|(show)|(delete)
p, admin, skills/*, field
p, admin, transactions, (list)
p, admin, transactions/*, (show)
p, admin, transactions/*, field
p, admin, reports, (list)
p, admin, reports/*, (show)
p, admin, reports/*, field

# Client permissions
p, client, projects, (list)|(create)
p, client, projects/*, (edit)|(show)|(delete), allow
p, client, proposals, (list)
p, client, proposals/*, (show)
p, client, messages, (list)
p, client, messages/*, (show)|(create)
p, client, wallet, (list)|(show)|(create)

# Freelancer permissions
p, freelancer, projects, (list)
p, freelancer, projects/*, (show)
p, freelancer, proposals, (list)|(create)
p, freelancer, proposals/*, (edit)|(show)|(delete)
p, freelancer, proposals/*, field
p, freelancer, profile, (list)|(edit)|(show)
p, freelancer, messages, (list)
p, freelancer, messages/*, (show)|(create)
p, freelancer, wallet, (list)|(show)|(create)

# Shared permissions for all authenticated users
p, admin, settings, (list)|(edit)|(show)
p, client, settings, (list)|(edit)|(show)
p, freelancer, settings, (list)|(edit)|(show)

p, admin, wallet, (list)|(show)|(create)
p, client, wallet, (list)|(show)|(create)
p, freelancer, wallet, (list)|(show)|(create)
`);

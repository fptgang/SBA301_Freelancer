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
p, ADMIN, accounts, (list)|(create)
p, ADMIN, accounts/*, (edit)|(show)|(delete)
p, ADMIN, accounts/*, field
p, ADMIN, projects, (list)|(create)
p, ADMIN, projects/*, (edit)|(show)|(delete)
p, ADMIN, projects/*, field
p, ADMIN, projectCategories, (list)|(create)
p, ADMIN, projectCategories/*, (edit)|(show)|(delete)

p, ADMIN, categories, (list)|(create)
p, ADMIN, categories/*, (edit)|(show)|(delete)

p, editor, posts, (list)|(create)
p, editor, posts/*, (edit)|(show)
p, editor, posts/hit, field, deny
p, editor, categories, list

`);

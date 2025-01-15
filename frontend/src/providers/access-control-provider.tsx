import { AccessControlProvider } from "@refinedev/core";
import { newEnforcer } from "casbin";
import { model, adapter } from "../utils/access-controls";

/**
 * Check out the Access Control Provider documentation for detailed information
 * https://refine.dev/docs/api-reference/core/providers/accessControl-provider
 **/
export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const role = localStorage.getItem("role") ?? "ADMIN";
    const enforcer = await newEnforcer(model, adapter);
    if (action === "delete" || action === "edit" || action === "show") {
      return Promise.resolve({
        can: await enforcer.enforce(role, `${resource}/${params?.id}`, action),
      });
    }
    if (action === "field") {
      return Promise.resolve({
        can: await enforcer.enforce(
          role,
          `${resource}/${params?.field}`,
          action
        ),
      });
    }
    return {
      can: await enforcer.enforce(role, resource, action),
    };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
  },
};

export const BASE_URL = "http://localhost:8080";
export const API_URL = "http://localhost:8080/api/v1";
export const ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Client", value: "CLIENT" },
  { label: "Staff", value: "STAFF" },
  { label: "Freelance", value: "FREELANCER" },
];
export const ROLE_COLOR_MAP = {
  ADMIN: "purple", // Purple represents authority and power
  STAFF: "cyan", // Cyan for support/operational roles
  FREELANCER: "orange", // Orange for dynamic/independent workers
  CLIENT: "geekblue", // GeekBlue for business/client relationships
};

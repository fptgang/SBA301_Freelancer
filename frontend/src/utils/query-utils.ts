import {
  ConditionalFilter,
  CrudFilter,
  CrudSort,
  LogicalFilter,
} from "@refinedev/core";

interface Sort {
  field: string;
  order: string;
}
export const generateSortQuery = (sort: CrudSort[]) => {
  if (!sort || sort.length === 0) {
    return "";
  }
  const sortQuery = sort.map((s) => generateSortField(s)).join(",");
  return `sort=${encodeURIComponent(sortQuery)}`;
};
function generateSortField({ field, order }: Sort) {
  return `${field},${order}`;
}

export const generateFilterQuery = (filters: LogicalFilter[]): string => {
  if (!filters || filters.length === 0) {
    return "";
  }

  let multiFilters  = [];

  for (let filter of filters) {
    const filterField = generateFilterField(filter);
    if (filterField.length == 0)
      continue;
    multiFilters.push(filterField);
  }

  if (multiFilters.length == 0) {
    return "";
  }

  if (multiFilters.length == 1) {
    return "filter=" + encodeURIComponent(multiFilters[0]);
  }

  return "filter=" + encodeURIComponent(JSON.stringify(multiFilters));
};

function generateFilterField(filter: LogicalFilter): string {
  const { field, operator, value } = filter;

  if (value === undefined || value === null) {
    return "";
  }

  // Handle array values by joining with commas
  // This maintains compatibility with the spec's pattern
  // which expects a single value or comma-separated values
  const normalizedValue = Array.isArray(value) ? value.join(",") : value;

  // Ensure field only contains allowed characters
  if (!/^[a-zA-Z0-9_]+$/.test(field)) {
    return "";
  }

  // Validate operator against allowed values from spec
  const validOperators = [
    "eq",
    "ne",
    "lt",
    "gt",
    "lte",
    "gte",
    "in",
    "nin",
    "contains",
    "ncontains",
    "startswith",
    "nstartswith",
    "endswith",
    "nendswith",
  ];

  if (!validOperators.includes(operator)) {
    return "";
  }

  if (value[0] === true || value[0] === false) {
    return `${field},eq,${normalizedValue}`;
  }

  return `${field},${operator},${normalizedValue}`;
}

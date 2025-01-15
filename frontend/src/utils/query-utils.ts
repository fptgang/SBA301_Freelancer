import { CrudSort } from "@refinedev/core";

interface Sort {
  field: string;
  order: string;
}
export const generateSortQuery = (sort: CrudSort[]) => {
  if (!sort || sort.length === 0) {
    return "";
  }
  const sortQuery = sort.map((s) => generateSortField(s)).join(",");
  return `sort=${sortQuery}`;
};
function generateSortField({ field, order }: Sort) {
  return `${field},${order}`;
}

export default generateSortQuery;

import { DataProvider, LogicalFilter } from "@refinedev/core";
import { Axios } from "axios";
import { generateSortQuery, generateFilterQuery } from "../utils/query-utils";

/**
 * Check out the Data Provider documentation for detailed information
 * https://refine.dev/docs/api-reference/core/providers/data-provider/
 **/
export const dataProvider = (
  apiUrl: string,
  _httpClient: Axios // TODO: replace `any` with your http client type
): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    let sortQuery = "";
    console.log(filters);
    if (sorters) {
      sortQuery = generateSortQuery(sorters);
    }
    let filterQuery = "";
    if (filters) {
      filterQuery = generateFilterQuery(filters as LogicalFilter[]);
    }

    let currentPage = pagination?.current ?? 0;
    if (currentPage > 0) {
      currentPage--;
    }
    const url = `${apiUrl}/${resource}?page=${currentPage}&pageSize=${
      pagination?.pageSize ?? 20
    }&size=${pagination?.pageSize ?? 20}&${sortQuery}&${filterQuery}`;
    console.log("getList", {
      resource,
      pagination,
      filters,
      sorters,
      meta,
      url,
    });
    console.log("url", url);
    console.log("sorters", sorters);
    console.log("filters", filters);
    console.log("pagination", pagination);
    const result = await _httpClient.get(url);
    // TODO: send request to the API
    // const response = await httpClient.get(url, {});

    return {
      data: result.data.content,
      total: result.data.totalElements,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    console.log("getMany", {
      resource,
      ids,
      meta,
    });
    const url = `${apiUrl}/${resource}`;

    const result = await _httpClient.get(url);

    // TODO: send request to the API
    // const response = await httpClient.get(url, {});

    return {
      data: [],
    };
  },

  create: async ({ resource, variables, meta }) => {
    console.log("create", {
      resource,
      variables,
      meta,
    });
    const response = await _httpClient.post(`${apiUrl}/${resource}`, variables);

    return {
      data: response.data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    console.log("update", {
      resource,
      id,
      variables,
      meta,
    });

    // TODO: send request to the API
    // const response = await httpClient.post(url, {});
    const response = await _httpClient.put(
      `${apiUrl}/${resource}/${id}`,
      variables
    );

    return {
      data: response.data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    console.log("getOne", {
      resource,
      id,
      meta,
    });

    // TODO: send request to the API
    // const response = await httpClient.get(url, {});
    const response = await _httpClient.get(`${apiUrl}/${resource}/${id}`);
    return {
      data: response.data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    console.log("deleteOne", {
      resource,
      id,
      variables,
      meta,
    });

    // TODO: send request to the API
    // const response = await httpClient.post(url, {});
    const response = await _httpClient.delete(`${apiUrl}/${resource}/${id}`);
    console.log(response);
    return {
      data: {} as any,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
    meta,
  }) => {
    console.log("custom", {
      url,
      method,
      filters,
      sorters,
      payload,
      query,
      headers,
      meta,
    });

    // TODO: send request to the API
    // const requestMethod = meta.method
    // const response = await httpClient[requestMethod](url, {});

    return {} as any;
  },
});

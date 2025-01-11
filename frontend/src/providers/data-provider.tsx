import { DataProvider } from "@refinedev/core";
import { Axios } from "axios";

/**
 * Check out the Data Provider documentation for detailed information
 * https://refine.dev/docs/api-reference/core/providers/data-provider/
 **/
export const dataProvider = (
  apiUrl: string,
  _httpClient: Axios // TODO: replace `any` with your http client type
): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}?page=${pagination?.current}&pageSize=${pagination?.pageSize}`;

    console.log("getList", {
      resource,
      pagination,
      filters,
      sorters,
      meta,
      url,
    });

    const result = await _httpClient.get(url);

    // TODO: send request to the API
    // const response = await httpClient.get(url, {});

    return {
      data: result.data.content,
      total: result.data.totalPages,
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
    const response = await _httpClient.post(
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

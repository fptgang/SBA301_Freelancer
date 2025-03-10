import { DataProvider, LogicalFilter } from "@refinedev/core";
import { Axios } from "axios";
import { generateSortQuery, generateFilterQuery } from "../utils/query-utils";
import {store} from "../store";

function buildHeaders(headers: any) {
  headers = headers || {};

  const token = store.getState().auth.accessToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

export const dataProvider = (
  apiUrl: string,
  _httpClient: Axios // TODO: replace `any` with your http client type
): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    let sortQuery = "";
    if (sorters) {
      sortQuery = generateSortQuery(sorters);
      if (sortQuery) {
        sortQuery = "&" + sortQuery;
      }
    }

    let filterQuery = "";
    if (filters) {
      filterQuery = generateFilterQuery(filters as LogicalFilter[]);
      if (filterQuery) {
        filterQuery = "&" + filterQuery;
      }
    }

    let currentPage = pagination?.current ?? 0;
    if (currentPage > 0) {
      currentPage--;
    }

    const url = `${apiUrl}/${resource}?page=${currentPage}&pageSize=${
      pagination?.pageSize ?? 20
    }&size=${pagination?.pageSize ?? 20}${sortQuery}${filterQuery}`;

    console.log("getList", {
      resource,
      pagination,
      filters,
      sorters,
      meta,
      url,
    });

    const result = await _httpClient.get(url, { headers: buildHeaders(meta?.headers) });

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

    try {
      // Create an array of promises for each ID
      const promises = ids.map(id =>
        _httpClient.get(
          `${apiUrl}/${resource}/${id}`,
          { headers: buildHeaders(meta?.headers) }
        )
      );

      // Execute all promises in parallel
      const responses = await Promise.all(promises);

      // Extract data from each response
      const data = responses.map(response => response.data);

      return {
        data,
      };
    } catch (error) {
      console.error("Error in getMany:", error);
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    console.log("create", {
      resource,
      variables,
      meta,
    });
    const response = await _httpClient.post(`${apiUrl}/${resource}`, variables, { headers: buildHeaders(meta?.headers) });

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
      variables,
      { headers: buildHeaders(meta?.headers) }
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
    const response = await _httpClient.get(`${apiUrl}/${resource}/${id}`, { headers: buildHeaders(meta?.headers) });
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
    const response = await _httpClient.delete(`${apiUrl}/${resource}/${id}`, { headers: buildHeaders(meta?.headers) });
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
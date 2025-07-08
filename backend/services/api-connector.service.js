import axios from 'axios';

// API Connector Service: Handles connections to external APIs
export class ApiConnectorService {
  async fetchData(config) {
    const {
      url,
      method = 'GET',
      headers = {},
      params = {},
      data = null,
      auth = null,
      responseType = 'json',
      mapping = null,
      dataPath = null
    } = config;
    try {
      const requestConfig = { method, url, headers, params, responseType };
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestConfig.data = data;
      }
      if (auth) {
        if (auth.type === 'basic') {
          requestConfig.auth = { username: auth.username, password: auth.password };
        } else if (auth.type === 'bearer') {
          requestConfig.headers.Authorization = `Bearer ${auth.token}`;
        } else if (auth.type === 'api-key') {
          if (auth.in === 'header') {
            requestConfig.headers[auth.name] = auth.value;
          } else {
            requestConfig.params[auth.name] = auth.value;
          }
        }
      }
      const response = await axios(requestConfig);
      let results = response.data;
      if (mapping) {
        if (dataPath) {
          const dataAtPath = this.getValueByPath(results, dataPath);
          if (Array.isArray(dataAtPath)) {
            results = dataAtPath.map(item => this.applyMapping(item, mapping));
          } else {
            results = this.applyMapping(dataAtPath, mapping);
          }
        } else {
          results = this.applyMapping(results, mapping);
        }
      }
      return { success: true, data: results, status: response.status, headers: response.headers };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status, data: error.response?.data };
    }
  }
  getValueByPath(obj, path) {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }
  applyMapping(data, mapping) {
    const result = {};
    for (const [targetField, sourcePath] of Object.entries(mapping)) {
      if (typeof sourcePath === 'string') {
        result[targetField] = this.getValueByPath(data, sourcePath);
      } else if (typeof sourcePath === 'function') {
        result[targetField] = sourcePath(data);
      }
    }
    return result;
  }
}

export const apiConnectorService = new ApiConnectorService();

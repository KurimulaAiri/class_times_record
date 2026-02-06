// 基础域名（根据环境切换，如开发/生产环境）
const baseUrl = process.env.NODE_ENV === 'development' 
  ? 'localhost:9999'  // 开发环境
  : 'https://api.xxx.com';     // 生产环境

// 请求超时时间（毫秒）
const timeout = 10000;

/**
 * 基础请求函数
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（无需写基础域名）
 * @param {string} options.method - 请求方法（GET/POST/PUT/DELETE）
 * @param {Object} [options.data] - 请求参数（GET拼在url，POST在body）
 * @param {Object} [options.header] - 自定义请求头（会合并默认头）
 * @param {boolean} [options.loading=true] - 是否显示加载中提示
 * @returns {Promise} 返回请求结果
 */
const request = (options) => {
  // 解构参数，设置默认值
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loading = true
  } = options;

  // 显示加载中（可自定义样式）
  if (loading) {
    uni.showLoading({
      title: '加载中...',
      mask: true // 防止点击穿透
    });
  }

  // 拼接完整接口地址
  const fullUrl = baseUrl + url;

  // 返回Promise，统一处理请求
  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data,
      header: {
        // 默认请求头（可根据后端要求调整，如JSON格式、token）
        'Content-Type': 'application/json',
        'token': uni.getStorageSync('token') || '', // 从本地缓存取token
        ...header // 合并自定义请求头（优先级更高）
      },
      timeout,
      // 请求成功回调
      success: (res) => {
        // 响应拦截：统一处理状态码
        const { statusCode, data } = res;
        
        // 200表示请求成功（具体状态码根据后端约定调整）
        if (statusCode === 200) {
          // 后端自定义状态码（示例：code=0表示业务成功）
          if (data.code === 0) {
            resolve(data.data); // 只返回核心数据，简化业务层处理
          } else {
            // 业务错误（如参数错误、token过期）
            uni.showToast({
              title: data.msg || '请求失败',
              icon: 'none'
            });
            reject(data); // 抛出业务错误
          }
        } else {
          // HTTP状态码错误（如404/500）
          uni.showToast({
            title: `请求错误：${statusCode}`,
            icon: 'none'
          });
          reject({
            code: statusCode,
            msg: `HTTP错误：${statusCode}`
          });
        }
      },
      // 请求失败回调（网络错误、超时等）
      fail: (err) => {
        let errMsg = '网络异常，请检查网络';
        if (err.errMsg.includes('timeout')) {
          errMsg = '请求超时，请稍后重试';
        }
        uni.showToast({
          title: errMsg,
          icon: 'none'
        });
        reject(err);
      },
      // 无论成功失败，最终执行（隐藏加载中）
      complete: () => {
        if (loading) {
          uni.hideLoading();
        }
      }
    });
  });
};

// 封装GET请求
export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

// 封装POST请求
export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

// 封装PUT请求（按需扩展）
export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

// 封装DELETE请求（按需扩展）
export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

// 暴露默认请求方法（如需自定义method时使用）
export default request;
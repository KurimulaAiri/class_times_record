/** @description 国密加密工具库，提供 SM2 加密和 SM3 签名生成能力，用于接口请求的密码加密和参数签名 */
import { sm2, sm3 } from "sm-crypto";

// 后端提供的公钥 (通常是一串很长的 Hex 字符串)
const PUBLIC_KEY = "047dae6bd5ab50968f91ba1cd14b0e0d109398a2d26ce6dfd1daf3ffc507933379179fee66507ac11ead618df25c414aff3851147b010d413396395acb02562999";

// 接口校验盐
const API_SECRET = "SHIROKO_SM3_SALT_2026";

/**
 * SM2 加密方法
 * @param {string} data 待加密明文`
 * @returns {string} 加密后的密文 (通常包含 04 前缀)
 */
export const encryptPassword = (data: string): string => {
	// cipherMode: 1 是 C1C3C2 (旧标准), 0 是 C1C2C3 (新标准)，需与后端一致
	const cipherMode = 1;
	return "04" + sm2.doEncrypt(data, PUBLIC_KEY, cipherMode);
};

/**
 * 递归排序 key 并剔除 null/undefined/""
 * 模拟后端 Jackson 的 SORT_PROPERTIES_ALPHABETICALLY + NON_NULL 行为
 * @param obj 待序列化的对象
 * @returns 排序并过滤后的 JSON 字符串
 */
function stableStringify(obj: any): string {
    // 基本类型直接返回
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }

    // 数组：递归处理每个元素
    if (Array.isArray(obj)) {
        return '[' + obj.map(item => stableStringify(item)).join(',') + ']';
    }

    // 对象：排序 key，过滤 null/undefined/""，递归处理值
    const sortedKeys = Object.keys(obj)
        .filter(key => {
            const val = obj[key];
            return val !== null && val !== undefined && val !== "";
        })
        .sort();

    const keyValuePairs = sortedKeys.map(key => {
        const val = obj[key];
        // 递归处理嵌套的对象或数组
        return `"${key}":${stableStringify(val)}`;
    });

    return '{' + keyValuePairs.join(',') + '}';
}

/**
 * 生成接口请求签名，基于 SM3 算法对请求参数进行签名，防止参数篡改
 * @param params 请求参数对象
 * @returns 包含 sign（签名）、timestamp（时间戳）、nonce（随机串）的对象
 */
export function generateSign(params: any) {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).slice(-8);

    // 1. 组装原始对象
    const signObj = {
        ...params,
        timestamp,
        nonce,
    };

    // 2. 只对第一层进行排序和过滤
    const sortedKeys = Object.keys(signObj)
        .filter(key => {
            const val = signObj[key];
            return val !== null && val !== undefined && val !== "";
        })
        .sort();

    // 3. 拼接字符串
    const stringA = sortedKeys
        .map((key) => {
            let value = signObj[key];
            // ⚠️ 关键修改：使用自定义的 stableStringify 替代 JSON.stringify
            if (typeof value === "object" && value !== null) {
                value = stableStringify(value);
            }
            return `${key}=${value}`;
        })
        .join("&");
        
    console.log("stringA:", stringA);

    // ... 剩余签名逻辑
    const rawData = stringA + API_SECRET;
    const sign = sm3(rawData).toLowerCase();

    return { sign, timestamp, nonce };
}

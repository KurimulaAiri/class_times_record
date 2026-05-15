import smCrypto from "sm-crypto";
import { sm3 } from "sm-crypto";
const sm2 = smCrypto.sm2;

// 后端提供的公钥 (通常是一串很长的 Hex 字符串)
const PUBLIC_KEY =
	"047dae6bd5ab50968f91ba1cd14b0e0d109398a2d26ce6dfd1daf3ffc507933379179fee66507ac11ead618df25c414aff3851147b010d413396395acb02562999";

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
 * 修改后的清理函数：仅处理第一层
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

    // 2. 只对第一层进行排序和过滤（不要递归清理内部数组）
    const sortedKeys = Object.keys(signObj)
        .filter(key => {
            const val = signObj[key];
            // 只过滤第一层的 null, undefined, ""
            return val !== null && val !== undefined && val !== "";
        })
        .sort();

    // 3. 拼接字符串
    const stringA = sortedKeys
        .map((key) => {
            let value = signObj[key];
            // 如果是数组或对象，直接转 JSON 字符串，不改变其内部结构
            if (typeof value === "object" && value !== null) {
                value = JSON.stringify(value);
            }
            return `${key}=${value}`;
        })
        .join("&");
        
    console.log("stringA:", stringA);

    // ... 剩余签名逻辑 (sm3, API_SECRET)
    const rawData = stringA + API_SECRET;
    const sign = sm3(rawData).toLowerCase();

    return { sign, timestamp, nonce };
}

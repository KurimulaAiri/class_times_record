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
 * 对应后端的签算逻辑
 * @param {Object} params - 业务请求参数
 */
export function generateSign(params: any) {
	// 1. 自动注入时间戳和随机数（安全加固）
	const timestamp = Date.now(); // 毫秒级，后端校验时注意单位
	const nonce = Math.random().toString(36).slice(-8);

	const signObj = {
		...params,
		timestamp,
		nonce,
	};

	// 2. 严格字典序排序
	const sortedKeys = Object.keys(signObj)
		.filter(
			(key) =>
				signObj[key] !== null &&
				signObj[key] !== undefined &&
				signObj[key] !== "",
		)
		.sort();

	// 3. 拼接字符串：key1=value1&key2=value2...
	const stringA = sortedKeys.map((key) => `${key}=${signObj[key]}`).join("&");

	console.log("stringA:", stringA);

	// 4. 对应后端逻辑：digestWithSalt(srcData, salt) -> srcData + salt
	// 注意：这里的拼接顺序必须与后端 digestWithSalt 函数中的 `srcData + salt` 严格一致
	const rawData = stringA + API_SECRET;

	// 5. 计算 SM3 摘要（sm-crypto 默认返回的就是 Hex 字符串）
	const sign = sm3(rawData).toLowerCase(); // 后端 verify 一般不区分大小写，但规范建议统一

	return {
		sign,
		timestamp,
		nonce,
	};
}

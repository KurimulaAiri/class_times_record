import smCrypto from 'sm-crypto';
const sm2 = smCrypto.sm2;

// 后端提供的公钥 (通常是一串很长的 Hex 字符串)
const PUBLIC_KEY = '047dae6bd5ab50968f91ba1cd14b0e0d109398a2d26ce6dfd1daf3ffc507933379179fee66507ac11ead618df25c414aff3851147b010d413396395acb02562999'; 

/**
 * SM2 加密方法
 * @param {string} data 待加密明文` 
 * @returns {string} 加密后的密文 (通常包含 04 前缀)
 */
export const encryptPassword = (data: string): string => {
    // cipherMode: 1 是 C1C3C2 (旧标准), 0 是 C1C2C3 (新标准)，需与后端一致
    const cipherMode = 1; 
    return '04' + sm2.doEncrypt(data, PUBLIC_KEY, cipherMode);
};
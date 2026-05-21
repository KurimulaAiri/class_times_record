// 声明 sm-crypto 模块，解决 TS 无法识别的问题
declare module 'sm-crypto' {
    export const sm2: any;
    export const sm3: any;
    export const sm4: any;
}
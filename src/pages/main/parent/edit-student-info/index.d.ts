// 直接在当前文件定义，或放在全局 types.d.ts 中
interface PickerChangeEvent {
    detail: {
        value: string;
    };
}

export { PickerChangeEvent };



/** @description 菜单 API 接口模块，提供菜单列表的查询接口 */
import { post } from "@/utils/request";

/**
 * 根据角色获取菜单列表
 * @param QueryForm - 查询参数，包含角色相关筛选条件
 * @returns 返回菜单列表响应数据
 */
const getMenuList = (QueryForm: GetMenuListRequest) => {
    return post<MenuListResponse>("/auth/menu/get_menu_by_role", QueryForm);
};

export { getMenuList };

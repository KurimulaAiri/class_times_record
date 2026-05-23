import { post } from "@/utils/request";

const getMenuList = (QueryForm: GetMenuListRequest) => {
    return post<MenuListResponse>("/menu/get_menu_by_role", QueryForm);
};

export { getMenuList };

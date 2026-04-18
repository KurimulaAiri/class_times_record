interface Menu {
    id: number;
    menuName: string;
    icon: string;
    iconType: number;
    bgColor: string;
    path: string;
    sortOrder: number;
    isVisible: boolean;
    createTimeStr: string;
    updateTimeStr: string;
}

interface MenuListResponse {
    total: number;
    menus: Menu[];
}

interface MenuListQueryForm {
    currentPage: number;
    pageSize: number;
}
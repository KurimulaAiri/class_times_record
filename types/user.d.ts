interface User {
    userId: number;
    identityInfo: identityInfo;
    createTimeStr: string;
    updateTimeStr: string;
}

interface identityInfo {
    userId: number;
    isAvailable: boolean;
    username: string;
}
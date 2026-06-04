interface ToastOptions {
    msg: string;
    icon?: "none" | "success" | "loading" | "error";
    duration?: number;
    mask?: boolean;
    callback?: () => void;
}
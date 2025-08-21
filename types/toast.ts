export interface ToastState {
	id: number;
    message: string;
    type: ToastType;
    open: boolean;
	timeoutId?: ReturnType<typeof setTimeout>;
}

export enum ToastType {
	Success = 'success',
	Error = 'error',
	Info = 'info'
}

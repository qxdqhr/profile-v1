export interface FormData {
    pushToken: string;
    apns_topic: string;
    apns_priority: string;
    event: string;
}

export interface ContentState {
    isAnimated: boolean;
    emoji: string;
    endtime: number;
    alertInfo: {
        isAlert: boolean;
        alertEmoji: string;
        alertTitle: string;
        alertTime: number;
        alertMessage: string;
    }
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    statusCode?: number;
    responseData?: any;
} 
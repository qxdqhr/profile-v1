/**
 * 将秒数转换为 mm:ss 格式
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 将毫秒转换为秒
 */
export function msToSeconds(ms: number): number {
    return ms / 1000;
}

/**
 * 将秒转换为毫秒
 */
export function secondsToMs(seconds: number): number {
    return seconds * 1000;
}

/**
 * 计算两个时间戳之间的持续时间（秒）
 */
export function calculateDuration(startTime: number, endTime: number): number {
    return (endTime - startTime) / 1000;
} 
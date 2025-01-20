import { ApiResponse } from './types';

interface ResponseDisplayProps {
    response: ApiResponse | null;
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
    if (!response) return null;

    return (
        <div className="live-activity-response">
            <h2 className="live-activity-response-title">响应结果</h2>
            <div className="live-activity-response-content">
                <pre className="live-activity-response-text">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>
        </div>
    );
} 
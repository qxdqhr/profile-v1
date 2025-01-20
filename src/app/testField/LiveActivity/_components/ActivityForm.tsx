interface FormData {
    pushToken: string;
    apns_topic: string;
    apns_priority: string;
    event: string;
}

interface ActivityFormProps {
    formData: FormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function ActivityForm({ formData, onChange }: ActivityFormProps) {
    return (
        <>
            <div className="live-activity-token-section">
                <label className="live-activity-form-group">
                    <span className="live-activity-label">
                        Push Token
                    </span>
                    <textarea
                        name="pushToken"
                        value={formData.pushToken}
                        onChange={onChange}
                        className="live-activity-input"
                        rows={3}
                        placeholder="输入设备 Push Token..."
                    />
                </label>
            </div>

            <div className="live-activity-grid">
                <div>
                    <label className="live-activity-form-group">
                        <span className="live-activity-label">
                            APNS Topic
                        </span>
                        <input
                            type="text"
                            name="apns_topic"
                            value={formData.apns_topic}
                            onChange={onChange}
                            className="live-activity-input"
                            placeholder="输入 APNS Topic..."
                        />
                    </label>
                </div>

                <div>
                    <label className="live-activity-form-group">
                        <span className="live-activity-label">
                            APNS Priority
                        </span>
                        <select
                            name="apns_priority"
                            value={formData.apns_priority}
                            onChange={onChange}
                            className="live-activity-input"
                        >
                            <option value="5">5 (默认)</option>
                            <option value="10">10 (高优先级)</option>
                            <option value="1">1 (低优先级)</option>
                        </select>
                    </label>
                </div>

                <div>
                    <label className="live-activity-form-group">
                        <span className="live-activity-label">
                            Event Type
                        </span>
                        <select
                            name="event"
                            value={formData.event}
                            onChange={onChange}
                            className="live-activity-input"
                        >
                            <option value="update">update</option>
                            <option value="end">end</option>
                        </select>
                    </label>
                </div>
            </div>
        </>
    );
} 
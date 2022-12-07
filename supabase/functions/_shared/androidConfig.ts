export default function androidConfig(intent: string) {
    return {
        notification: {
            icon: "ic_notification",
            color: "#f59e0b",
            click_action: intent,
        },
    };
}

interface XenditPaymentMethod {
    payment_method_id: string;
    rank: number;
    type: string;
}

interface XenditSchedule {
    reference_id: string;
    interval: string;
    interval_count: number;
    created: string;
    updated: string;
    total_recurrence: number;
    anchor_date: string;
    retry_interval: string;
    retry_interval_count: number;
    total_retry: number;
    failed_attempt_notifications: number[];
}

interface XenditNotificationConfig {
    recurring_created: string[];
    recurring_succeeded: string[];
    recurring_failed: string[];
    locale: string;
}

interface XenditItem {
    type: string;
    name: string;
    net_unit_amount: number;
    quantity: number;
}

interface XenditAction {
    action: string;
    url: string;
    url_type: string;
    method: string;
}

interface XenditMetadata {
    meta_metadata: string;
}

export interface XenditSubscription {
    id: string;
    reference_id: string;
    customer_id: string;
    recurring_action: string;
    recurring_cycle_count: number;
    currency: string;
    amount: number;
    status: string;
    created: string;
    updated: string;
    payment_methods: XenditPaymentMethod[];
    schedule_id: string;
    schedule: XenditSchedule;
    immediate_action_type: string;
    notification_config: XenditNotificationConfig;
    failed_cycle_action: string;
    metadata: XenditMetadata;
    description: string;
    items: XenditItem[];
    actions: XenditAction[];
    success_return_url: string;
    failure_return_url: string;
}

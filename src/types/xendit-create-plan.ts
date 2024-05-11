/* eslint-disable @typescript-eslint/no-explicit-any */
export enum Currency {
    IDR = 'IDR',
    PHP = 'PHP',
}

export enum RecurringAction {
    PAYMENT = 'PAYMENT',
}

export enum ImmediateActionType {
    FULL_AMOUNT = 'FULL_AMOUNT',
}

export enum Interval {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
}

export enum RetryInterval {
    DAY = 'DAY',
}

export enum NotificationChannel {
    WHATSAPP = 'WHATSAPP',
    EMAIL = 'EMAIL',
}

export enum Locale {
    EN = 'en',
    ID = 'id',
}

export enum FailedCycleAction {
    RESUME = 'RESUME',
    STOP = 'STOP',
}

export enum ItemType {
    DIGITAL_PRODUCT = 'DIGITAL_PRODUCT',
    PHYSICAL_PRODUCT = 'PHYSICAL_PRODUCT',
    DIGITAL_SERVICE = 'DIGITAL_SERVICE',
    PHYSICAL_SERVICE = 'PHYSICAL_SERVICE',
    FEES = 'FEES',
    DISCOUNT = 'DISCOUNT',
}

export interface XenditCreatePlan {
    reference_id: string;
    customer_id: string;
    recurring_action: RecurringAction;
    currency: Currency;
    amount: number;
    schedule: {
        reference_id: string;
        interval: Interval;
        interval_count: number;
        total_recurrence?: number;
        anchor_date?: string;
        retry_interval?: RetryInterval;
        retry_interval_count?: number;
        total_retry?: number;
        failed_attempt_notifications?: number[];
    };
    payment_methods?: {
        payment_method_id: string;
        rank: number;
    }[];
    immediate_action_type?: ImmediateActionType;
    notification_config?: {
        recurring_created?: NotificationChannel[];
        recurring_succeeded?: NotificationChannel[];
        recurring_failed?: NotificationChannel[];
        locale?: Locale;
        payment_link_for_failed_attempt?: boolean;
    };
    failed_cycle_action?: FailedCycleAction;
    metadata?: { [key: string]: string };
    description?: string;
    items?: {
        type: ItemType;
        name: string;
        net_unit_amount: number;
        quantity: number;
        url?: string;
        category?: string;
        subcategory?: string;
        description?: string;
        metadata?: { [key: string]: any };
    }[];
    success_return_url?: string;
    failure_return_url?: string;
}

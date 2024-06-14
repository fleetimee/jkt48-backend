import { GoogleNotificationType } from '../utils/enum';

export interface OneTimeProductNotification {
    version: string;
    notificationType: number;
    purchaseToken: string;
    sku: string;
}

export interface SubscriptionNotification {
    version: string;
    notificationType: GoogleNotificationType;
    purchaseToken: string;
    subscriptionId: string;
}

export interface VoidedPurchaseNotification {
    purchaseToken: string;
    orderId: string;
    productType: number;
    refundType: number;
}

export interface TestNotification {
    version: string;
}

export interface DeveloperNotification {
    version: string;
    packageName: string;
    eventTimeMillis: number;
    oneTimeProductNotification?: OneTimeProductNotification;
    subscriptionNotification?: SubscriptionNotification;
    voidedPurchaseNotification?: VoidedPurchaseNotification;
    testNotification?: TestNotification;
}

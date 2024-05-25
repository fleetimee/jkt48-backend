/**
 * Represents the roles available in the system.
 */
export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export enum NotificationType {
    /**
     * Indicates a refund request for a consumable in-app purchase or auto-renewable subscription.
     */
    CONSUMPTION_REQUEST = 'CONSUMPTION_REQUEST',

    /**
     * Indicates a change to the user's subscription plan.
     */
    DID_CHANGE_RENEWAL_PREF = 'DID_CHANGE_RENEWAL_PREF',

    /**
     * Indicates a change to the subscription renewal status.
     */
    DID_CHANGE_RENEWAL_STATUS = 'DID_CHANGE_RENEWAL_STATUS',

    /**
     * Indicates a failed subscription renewal due to a billing issue.
     */
    DID_FAIL_TO_RENEW = 'DID_FAIL_TO_RENEW',

    /**
     * Indicates a successful subscription renewal.
     */
    DID_RENEW = 'DID_RENEW',

    /**
     * Indicates an expired subscription.
     */
    EXPIRED = 'EXPIRED',

    /**
     * Indicates an external purchase token creation.
     */
    EXTERNAL_PURCHASE_TOKEN = 'EXTERNAL_PURCHASE_TOKEN',

    /**
     * Indicates the end of the billing grace period without subscription renewal.
     */
    GRACE_PERIOD_EXPIRED = 'GRACE_PERIOD_EXPIRED',

    /**
     * Indicates the redemption of a promotional offer or offer code.
     */
    OFFER_REDEEMED = 'OFFER_REDEEMED',

    /**
     * Indicates a subscription price increase.
     */
    PRICE_INCREASE = 'PRICE_INCREASE',

    /**
     * Indicates a successful refund of a transaction.
     */
    REFUND = 'REFUND',

    /**
     * Indicates a declined refund request.
     */
    REFUND_DECLINED = 'REFUND_DECLINED',

    /**
     * Indicates a reversed refund due to a customer dispute.
     */
    REFUND_REVERSED = 'REFUND_REVERSED',

    /**
     * Indicates an extension of the subscription renewal date.
     */
    RENEWAL_EXTENDED = 'RENEWAL_EXTENDED',

    /**
     * Indicates an attempt to extend the subscription renewal date.
     */
    RENEWAL_EXTENSION = 'RENEWAL_EXTENSION',

    /**
     * Indicates a revocation of an in-app purchase through Family Sharing.
     */
    REVOKE = 'REVOKE',

    /**
     * Indicates a new subscription to a product.
     */
    SUBSCRIBED = 'SUBSCRIBED',

    /**
     * A test notification type.
     */
    TEST = 'TEST',
}

export enum NotificationSubType {
    /**
     * Applies to the PRICE_INCREASE notificationType. A notification with this subtype indicates that the customer consented to the subscription price increase if the price increase requires customer consent, or that the system notified them of a price increase if the price increase doesn't require customer consent.
     */
    ACCEPTED = 'ACCEPTED',

    /**
     * Applies to the DID_CHANGE_RENEWAL_STATUS notificationType. A notification with this subtype indicates that the user disabled subscription auto-renewal, or the App Store disabled subscription auto-renewal after the user requested a refund.
     */
    AUTO_RENEW_DISABLED = 'AUTO_RENEW_DISABLED',

    /**
     * Applies to the DID_CHANGE_RENEWAL_STATUS notificationType. A notification with this subtype indicates that the user enabled subscription auto-renewal.
     */
    AUTO_RENEW_ENABLED = 'AUTO_RENEW_ENABLED',

    /**
     * Applies to the DID_RENEW notificationType. A notification with this subtype indicates that the expired subscription that previously failed to renew has successfully renewed.
     */
    BILLING_RECOVERY = 'BILLING_RECOVERY',

    /**
     * Applies to the EXPIRED notificationType. A notification with this subtype indicates that the subscription expired because the subscription failed to renew before the billing retry period ended.
     */
    BILLING_RETRY = 'BILLING_RETRY',

    /**
     * Applies to the DID_CHANGE_RENEWAL_PREF notificationType. A notification with this subtype indicates that the user downgraded their subscription or cross-graded to a subscription with a different duration. Downgrades take effect at the next renewal date.
     */
    DOWNGRADE = 'DOWNGRADE',

    /**
     * Applies to the RENEWAL_EXTENSION notificationType. A notification with this subtype indicates that the subscription-renewal-date extension failed for an individual subscription. For details, see the data object in the responseBodyV2DecodedPayload. For information on the request, see Extend Subscription Renewal Dates for All Active Subscribers.
     */
    FAILURE = 'FAILURE',

    /**
     * Applies to the DID_FAIL_TO_RENEW notificationType. A notification with this subtype indicates that the subscription failed to renew due to a billing issue. Continue to provide access to the subscription during the grace period.
     */
    GRACE_PERIOD = 'GRACE_PERIOD',

    /**
     * Applies to the SUBSCRIBED notificationType. A notification with this subtype indicates that the user purchased the subscription for the first time or that the user received access to the subscription through Family Sharing for the first time.
     */
    INITIAL_BUY = 'INITIAL_BUY',

    /**
     * Applies to the PRICE_INCREASE notificationType. A notification with this subtype indicates that the system informed the user of the subscription price increase, but the user hasn’t accepted it.
     */
    PENDING = 'PENDING',

    /**
     * Applies to the EXPIRED notificationType. A notification with this subtype indicates that the subscription expired because the user didn’t consent to a price increase.
     */
    PRICE_INCREASE = 'PRICE_INCREASE',

    /**
     * Applies to the EXPIRED notificationType. A notification with this subtype indicates that the subscription expired because the product wasn’t available for purchase at the time the subscription attempted to renew.
     */
    PRODUCT_NOT_FOR_SALE = 'PRODUCT_NOT_FOR_SALE',

    /**
     * Applies to the SUBSCRIBED notificationType. A notification with this subtype indicates that the user resubscribed or received access through Family Sharing to the same subscription or to another subscription within the same subscription group.
     */
    RESUBSCRIBE = 'RESUBSCRIBE',

    /**
     * Applies to the RENEWAL_EXTENSION notificationType. A notification with this subtype indicates that the App Store server completed your request to extend the subscription renewal date for all eligible subscribers. For the summary details, see the summary object in the responseBodyV2DecodedPayload. For information on the request, see Extend Subscription Renewal Dates for All Active Subscribers.
     */
    SUMMARY = 'SUMMARY',

    /**
     * Applies to the DID_CHANGE_RENEWAL_PREF notificationType. A notification with this subtype indicates that the user upgraded their subscription or cross-graded to a subscription with the same duration. Upgrades take effect immediately.
     */
    UPGRADE = 'UPGRADE',

    /**
     * Applies to the EXTERNAL_PURCHASE_TOKEN notificationType. A notification with this subtype indicates that Apple created a token for your app but didn't receive a report. For more information about reporting the token, see externalPurchaseToken.
     */
    UNREPORTED = 'UNREPORTED',

    /**
     * Applies to the EXPIRED notificationType. A notification with this subtype indicates that the subscription expired after the user disabled subscription auto-renewal.
     */
    VOLUNTARY = 'VOLUNTARY',
}

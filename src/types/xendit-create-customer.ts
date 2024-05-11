interface IndividualDetail {
    given_names: string;
    surname?: string;
}

export interface XenditCreateCustomer {
    reference_id: string;
    type: string;
    individual_detail: IndividualDetail;
    email?: string;
    mobile_number?: string;
}

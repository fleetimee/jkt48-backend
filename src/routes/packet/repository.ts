import { eq } from 'drizzle-orm';

import { PPN_PERCENTAGE } from '../../config';
import db from '../../db';
import { packagePayment } from '../../models/package';
import { calculateTaxAndTotal } from '../../utils/lib';

export const getPackageList = async () => {
    return await db.query.packagePayment.findMany();
};

export const getPackage = async (packageId: string) => {
    const [packageItem] = await db.select().from(packagePayment).where(eq(packagePayment.id, packageId)).limit(1);

    return packageItem;
};

export const updatePackage = async (
    packageId: string,
    name: string,
    description: string,
    totalMembers: string,
    price: string,
    isActive: boolean,
    updatedAt: Date,
) => {
    const [packageItem] = await db
        .update(packagePayment)
        .set({ name, description, totalMembers, price, isActive, updatedAt })
        .where(eq(packagePayment.id, packageId))
        .returning();

    return packageItem;
};

export const getInquiry = async (packageId: string) => {
    const [packageItem] = await db
        .select({
            packageName: packagePayment.name,
            packageDescription: packagePayment.description,
            packagePrice: packagePayment.price,
        })
        .from(packagePayment)
        .where(eq(packagePayment.id, packageId))
        .limit(1);

    const { tax, total } = calculateTaxAndTotal(Number(packageItem.packagePrice), PPN_PERCENTAGE);

    return { ...packageItem, tax, total };
};

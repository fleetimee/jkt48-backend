import { eq } from 'drizzle-orm';

import db from '../../db';
import { packagePayment } from '../../models/package';

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

import { asc, eq } from 'drizzle-orm';

import { PPN_PERCENTAGE } from '../../config';
import db from '../../db';
import { packagePayment } from '../../models/package';
import { calculateTaxAndTotal } from '../../utils/lib';

/**
 * Retrieves a list of packages from the database.
 * @returns {Promise<Array<Package>>} A promise that resolves to an array of packages.
 */
export const getPackageList = async () => {
    return await db.query.packagePayment.findMany({
        orderBy: [asc(packagePayment.price)],
    });
};

/**
 * Retrieves a package item from the database based on the provided package ID.
 * @param packageId - The ID of the package to retrieve.
 * @returns A Promise that resolves to the retrieved package item.
 */
export const getPackage = async (packageId: string) => {
    const [packageItem] = await db.select().from(packagePayment).where(eq(packagePayment.id, packageId)).limit(1);

    return packageItem;
};

/**
 * Updates a package in the database.
 * @param packageId - The ID of the package to update.
 * @param name - The new name of the package.
 * @param description - The new description of the package.
 * @param totalMembers - The new total members of the package.
 * @param price - The new price of the package.
 * @param isActive - The new status of the package (active or inactive).
 * @param updatedAt - The new updated date of the package.
 * @returns The updated package item.
 */
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

/**
 * Retrieves the inquiry details for a given package ID.
 * @param packageId - The ID of the package.
 * @returns An object containing the package details, tax, and total.
 */
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

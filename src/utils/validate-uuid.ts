import { validate as isUuid } from 'uuid';

export const validateUuid = (uuid: string): boolean => {
    return isUuid(uuid);
};

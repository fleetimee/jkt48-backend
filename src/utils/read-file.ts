import fs from 'fs';

export const readP8File = (path: string): string => {
    try {
        return fs.readFileSync(path, 'utf8');
    } catch (err) {
        console.error(`Error reading file from path ${path}`, err);
        throw err;
    }
};

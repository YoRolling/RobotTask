import { createHash } from 'crypto';

const hash = (value: string | undefined) => {
    if (value === undefined) {
        return undefined;
    }
    const hashAlgorithm = createHash('sha256');
    return hashAlgorithm.update(value).digest('hex');
};

export { hash };

import pAny from 'p-any';
import pTimeout from 'p-timeout';
import publicIp from 'public-ip';

interface IsOnlineOptions {
    timeout: number;
    version: 'v4' | 'v6';
}

const defaults: IsOnlineOptions = {
    timeout: 3000,
    version: 'v4'
};

export default async function (options?: Partial<IsOnlineOptions>): Promise<boolean> {
    let opt: IsOnlineOptions = Object.assign({}, defaults, options);

    let promise: Promise<boolean> = pAny([
        publicIp[opt.version]().then(() => true),
        publicIp[opt.version]({ https: true }).then(() => true)
    ]);

    return pTimeout(promise, opt.timeout).then(() => true).catch(() => false);
}
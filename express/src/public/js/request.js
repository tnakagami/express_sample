const request = async (url, method='GET', data='') => {
    const args = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        method: method,
    };
    if ((method !== 'GET') && (method !== 'HEAD')) {
        args.body = data;
    }

    // send request
    const res = await fetch(url, args);

    if (res.ok) {
        return res.json();
    }
    else {
        throw new Error('Failed fetch method');
    }
};

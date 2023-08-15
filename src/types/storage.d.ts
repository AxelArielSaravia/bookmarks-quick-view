//All this data is from https://developer.chrome.com/docs/extensions/reference/storage/

type StorageArea = {
    clear: (callback: maybe<() => undefined>) => Promise<undefined>,
    get: (
        keys: maybe<(string | Array<strings> | object)>,
        callback: maybe<(items: object) => undefined>
    ) => Promise<undefined>,
    remove: (
        keys: (string | Array<string>),
        callback: maybe<() => undefined>
    ) => Promise<undefined>,
    set: (
        items: object,
        callback: maybe<() => undefined>
    ) => Promise<undefined>,
};

type Storager = {
    local: StorageArea & object,
};

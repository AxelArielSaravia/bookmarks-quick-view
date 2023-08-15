//All this data is from https://developer.chrome.com/docs/extensions/reference

type maybe<T> = T | undefined;
type Chromer = {
    bookmarks: Bookmarkser,
    tabs: Tabser,
    storage: Storager,
    runtime: Runtimer,
};

declare var chrome: Chromer

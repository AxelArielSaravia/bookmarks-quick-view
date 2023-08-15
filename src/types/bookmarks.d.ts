//All this data is from https://developer.chrome.com/docs/extensions/bookmarks/

type BookmarkTreeNode = {
    children: maybe<Array<BookmarkTreeNode>>,
    dateAdded: maybe<number>,
    dateGroupModified: maybe<number>,
    dateLastUsed: maybe<number>,
    id: string,
    index: maybe<number>,
    parentId: maybe<string>,
    title: string,
    unmodificable: maybe<"managed">,
    url: maybe<string>,
};

type CreateDetails = {
    index: maybe<number>,
    parentId: maybe<string>,
    title: maybe<string>,
    url: maybe<string>,
};

type Bookmarkser = {
    create: (
        bookmark: CreateDetails,
        callback: maybe<(result: BookmarkTreeNode) => undefined>
    ) => Promise<BookmarkTreeNode>,
    create: (
        idOrIdList: string | [string, ...Array<string>],
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    get: (
        id: string,
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    getRecent: (
        numberOfItems: number,
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    getSubTree: (
        id: string,
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    getTree: (
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    move: (
        id: string,
        destination: {index: maybe<number>, parentId: maybe<string>},
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    remove: (
        id: string,
        callback: maybe<() => undefined>
    ) => Promise<undefined>,
    removeTree: (
        id: string,
        callback: maybe<() => undefined>
    ) => Promise<undefined>,
    search: (
        query: (
            string
            | {
                query?: maybe<string>,
                title?: maybe<string>,
                url?: maybe<string>
            }
        ),
        destination: {index: maybe<number>, parentId: maybe<string>},
        callback: maybe<(result: Array<BookmarkTreeNode>) => undefined>
    ) => Promise<Array<BookmarkTreeNode>>,
    update: (
        id: string,
        change: {title?: maybe<string>, url?: maybe<string>},
        callback: maybe<(result: BookmarkTreeNode) => undefined>
    ) => Promise<BookmarkTreeNode>,
};

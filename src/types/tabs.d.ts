//All this data is from https://developer.chrome.com/docs/extensions/reference/tabs/

type MutedInfoReason = ("user" | "capture" | "extension");

type MutedInfo = {
    extensionId: maybe<string>,
    muted: boolean,
    reason: maybe<MutedInfoReason>,
};

type TabStatus = ("unloaded" | "loading" | "completed");

type Tab = {
    active: boolean,
    audible: maybe<boolean>,    //Chrome 45+
    autoDiscardable: boolean,   //Chrome 54+
    discarded: boolean,         //Chrome 54+
    favIconUrl: maybe<string>,
    groupId: number,            //Chrome 88+
    height: maybe<number>,
    highligted: boolean,
    id: maybe<number>,
    incognito: boolean,
    index: number,
    mutedInfo: MutedInfo,       //Chrome 46+
    openerTabId: maybe<number>,
    pendingUrl: maybe<string>,  //Chrome 79+
    pinned: boolean,
    sessionId: maybe<string>,
    status: maybe<TabStatus>,
    title: maybe<string>,
    url: maybe<string>,
    width: maybe<number>,
    windowId: number,
};

type WindowType = ("normal" | "popup" | "panel" | "app" | "devtools");

type Tabser = {
    create: (
        createProperties: {
            active?: maybe<boolean>,
            index?: maybe<number>,
            openerTabId?: maybe<number>,
            pinned?: maybe<boolean>,
            url?: maybe<string>,
            windowId?: maybe<number>,
        },
        callback: maybe<(tab: Tab) => undefined>
    ) => Promise<Tab>,
    query: (
        queryInfo: {
            active?: maybe<boolean>,
            audible?: maybe<boolean>,           //Chrome 45+
            autoDiscardable?: maybe<boolean>,   //Chrome 54+
            currentWindow?: maybe<boolean>,
            discarded?: maybe<boolean>,         //Chrome 54+
            groupId?: maybe<number>,            //Chrome 88+
            highlighted?: maybe<boolean>,
            index?: maybe<number>,
            lastFocusedWindow?: maybe<boolean>,
            muted?: maybe<boolean>,             //Chrome 45+
            pinned?: maybe<boolean>,
            status?: maybe<TabStatus>,
            title?: maybe<string>,
            url?: maybe<string | Array<string>>,
            windowId?: maybe<number>,
            windowType?: maybe<WindowType>,
        },
        callback: maybe<(result: Array<Tab>) => undefined>
    ) => Promise<Array<Tab>>,
    update: (
        tabId: maybe<number>,
        updateProperties: {
            active?: maybe<boolean>,
            autoDiscardable?: maybe<boolean>,//Chrome 54+
            highlighted?: maybe<boolean>,
            muted?: maybe<boolean>,          //Chrome 45+
            openerTabId?: maybe<string>,
            pinned?: maybe<boolean>,
            url?: maybe<string>,
        },
        callback: maybe<(tab: maybe<Tab>) => undefined>
    ) => Promise<maybe<Tab>>,
};

//@ts-check browser
"use strict";

const VERSION = "0.2.1";

const BEFOREEND = "beforeend";

const UNDO_TIMEOUT_MS = 4000;

const CSS_PADDING = 10;

const COMMAND_MODAL_CLOSE = "KeyQ";
const COMMAND_MODAL_MORE = "KeyM";
const COMMAND_MODAL_KEYBOARD = "KeyK";
const COMMAND_EDIT = "KeyE";
const COMMAND_FOLDER = "KeyF";
const COMMAND_BOOKMARK = "KeyB";
const COMMAND_BOOKMARK_EMPTY= "KeyV";
const COMMAND_SORT = "KeyS";
const COMMAND_OPEN = "KeyO";
const COMMAND_OPEN_I = "KeyI"
const COMMAND_REMOVE = "KeyR";
const COMMAND_UNDO = "KeyU";
const COMMAND_COPY = "KeyC";
const COMMAND_DIRPARENT = "KeyD";

const MODAL_ACTION_CREATE = "c";
const MODAL_ACTION_EDIT = "e";

const STORAGE_OPEN_NEW = "n";
const STORAGE_OPEN_CURRENT = "c";
const STORAGE_THEME_DARK = "d";
const STORAGE_THEME_LIGHT = "l";

const changes = {
    title: "",
    url: ""
};

const createDirDetails = {
    parentId: "",
    title: "",
    /** @type {undefined | number}*/
    index: undefined,
};

const createItemDetails = {
    parentId: "",
    title: "",
    url: "",
    /** @type {undefined | number}*/
    index: undefined,
};

const movedestination = {
    index: 0,
    parentId: "",
};

const tabProperties = {
    active: false,
    url: ""
};

const windowCreateData = {
    incognito: false,
    /**@type {Array<string>}*/
    url: [],
    setSelfAsOpener: false,
    focused: false,
    type: "normal"
};

/**
 * @type {Array<HTMLElement>}*/
let DOMSortContainer = [];

/**
 * @type {chrome.tabs.Tab}*/
let currenttab;

const storage = {
    focusTabs: false,
    foldersBefore: false,
    beginning: false,
    showNumber: true,
    /**@type {STORAGE_OPEN_NEW | STORAGE_OPEN_CURRENT}*/
    open: STORAGE_OPEN_CURRENT,
    /**@type {STORAGE_THEME_DARK | STORAGE_THEME_LIGHT}*/
    theme: STORAGE_THEME_DARK
};

/**
 * @type {(items: typeof storage) => undefined}*/
function initStorage(items) {
    const open = items.open;
    const theme = items.theme;
    const focusTabs = items.focusTabs;
    const beginning = items.beginning;
    const foldersBefore = items.foldersBefore;
    const showNumber = items.showNumber;
    let set = false;
    if (open === STORAGE_OPEN_NEW || open === STORAGE_OPEN_CURRENT) {
        storage.open = open;
    } else {
        set = true;
    }
    if (showNumber !== undefined) {
        storage.showNumber = showNumber;
    } else {
        set = true;
    }
    if (theme === STORAGE_THEME_DARK || theme === STORAGE_THEME_LIGHT) {
        storage.theme = theme;
    } else {
        set = true;
    }
    if (focusTabs !== undefined) {
        storage.focusTabs = focusTabs;
    } else {
        set = true;
    }
    if (beginning !== undefined) {
        storage.beginning = beginning;
    } else {
        set = true;
    }
    if (foldersBefore !== undefined) {
        storage.foldersBefore = foldersBefore;
    } else {
        set = true;
    }
    if (set) {
        chrome.storage.local.set(storage, undefined);
    }
}

const DOMTemplateButtons = document.getElementById("template_buttons");
if (DOMTemplateButtons === null) {
    throw Error("#template_buttons does not exist");
}

/**
 * @type {null | HTMLElement}*/
let relatedFocusTarget = null;

/**
 * @type {(empty: boolean) => undefined} */
function focusRelatedTarget() {
    relatedFocusTarget?.focus();
    relatedFocusTarget = null;
}

/**
 * @type {(a: Array<HTMLElement>, fst: number, lst: number, p: number) => number} */
function quicksortPartition(a, fst, lst, p) {
    var temp = a[p];
    a[p] = a[lst];
    a[lst] = temp;
    let l = 0;
    for (let i = fst; i < lst; i += 1) {
        let c = String.prototype.localeCompare.call(
            a[i].btnTitle,
            a[lst].btnTitle
        );
        if (c < 0) {
            temp = a[l + fst];
            a[l + fst] = a[i];
            a[i] = temp;
            l += 1;
        }
    }
    temp = a[l + fst];
    a[l + fst] = a[lst];
    a[lst] = temp;
    return l + fst;
}

/**
 * @type {(a: Array<HTMLElement>, fst: number, lst: number) => Array<HTMLElement>} */
function quicksort(a, fst, lst) {
    if (lst - fst < 1) {
        return a;
    }
    let q = [fst, lst];
    let ri = 0;
    let p = 0;
    while (q.length > 0) {
        fst = q.shift();
        lst = q.shift();
        ri = Math.floor(Math.random() * (lst - fst) + fst);
        p = quicksortPartition(a, fst, lst, ri);
        if (p - 1 - fst > 0) {
            q.push(fst, p - 1);
        }
        if (lst - (p + 1) > 0) {
            q.push(p + 1, lst);
        }
    }
    return a;
}

/**
 * @type{(
 *  tabProp: typeof tabProperties,
 *  open: STORAGE_OPEN_NEW | STORAGE_OPEN_CURRENT,
 *  ctrl: boolean
 * ) => undefined}*/
function openLink(tabProp, open, ctrl) {
    if ((open === STORAGE_OPEN_NEW) === ctrl) {
        chrome.tabs.update(undefined, tabProp, undefined);
    } else {
        chrome.tabs.create(tabProp, undefined);
    }
}

/**
 * @type {(target: HTMLElement | undefined) => undefined}*/
function closeModal(target) {
    Main.MAIN.inert = false;
    HeaderNav.NAV.inert = false;
    target?.removeAttribute("data-open");
    focusRelatedTarget();
}

/**
 * @throws {TypeError} A DOM element is null
 * @type {(e: MouseEvent) => undefined}*/
function ModalOnclick(e) {
    const target = e.target;
    const action = target.getAttribute("data-action");
    if (action === "close") {
        closeModal(e.currentTarget);
    }
}

/**
 * @type{(src: string) => string}*/
function getFavicon(src) {
    let url = chrome.runtime.getURL("/_favicon/");
    url += "?pageUrl="+src+"&size=16";
    return url;
}

const DirElement = {
    TYPE: "dir",
    /** @type {DocumentFragment} */
    template: (function () {
        /** @type{HTMLTemplateElement | null} */
        let template = document.getElementById("template_dir");
        if (template === null) {
            throw Error("#template_dir does not exist");
        }
        return template.content;
    }()),
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(
          btnode: chrome.bookmarks.BookmarkTreeNode,
          depth: number
      ) => HTMLElement | never}*/
    create(btnode, depth) {
        let nchilds = btnode?.children?.length ?? 0;
        const DOMDetails = DirElement.template.firstElementChild?.cloneNode(true);
        DOMDetails.depth = depth;
        DOMDetails.noopen = false;
        DOMDetails.noremove = false;
        DOMDetails.noedit = false;
        DOMDetails.btnTitle = btnode.title;
        DOMDetails.btnId = btnode.id;
        DOMDetails.btnIndex = btnode.index;
        DOMDetails.btnChildren = nchilds;
        DOMDetails.btnType = DirElement.TYPE;

        DOMDetails.changeTitle = DirElement.prototype.changeTitle;
        DOMDetails.changeNumber = DirElement.prototype.changeNumber;

        const DOMSummary = DOMDetails.firstElementChild;
        DOMSummary.btnType = DirElement.TYPE;
        DOMSummary.setAttribute("title", `${btnode.title} - ${nchilds}`);
        DOMSummary.style.setProperty(
            "padding-left",
            `${depth * CSS_PADDING}px`
        );

        const DOMContent = DOMSummary.children["content"];
        DOMContent.btnType = DirElement.TYPE;
        DOMContent.children["number"].insertAdjacentText(BEFOREEND, String(nchilds));
        DOMContent.children["title"].insertAdjacentText(BEFOREEND, btnode.title);

        const templateButtons = DOMTemplateButtons.content.cloneNode(true);
        let DOMButtonBookmark = templateButtons.children["bookmark"];
        let DOMButtonFolder = templateButtons.children["folder"];
        let DOMButtonEdit = templateButtons.children["edit"];
        let DOMButtonMore = templateButtons.children["more"];
        let DOMButtonSort = templateButtons.children["sort"];
        let DOMButtonRemove = templateButtons.children["remove"];
        let DOMButtonOpenAll = templateButtons.children["openall"];
        let DOMButtonOpenAllW = templateButtons.children["openall_window"];
        let DOMButtonOpenAllI = templateButtons.children["openall_incognito"];

        DOMButtonEdit.setAttribute("title", "rename");
        DOMButtonSort.insertAdjacentText(BEFOREEND, "sort by name");
        DOMButtonRemove.insertAdjacentText(BEFOREEND, "remove folder");

        let DOMButtons = DOMSummary.children["buttons"];
        DOMButtons.btnType = DirElement.TYPE;

        let DOMMore = DOMSummary.children["buttons_more"];
        DOMMore.btnType = DirElement.TYPE;

        DOMButtons.append(
            DOMButtonBookmark,
            DOMButtonFolder,
            DOMButtonEdit,
            DOMButtonMore
        );
        DOMMore.append(
            DOMButtonOpenAll,
            DOMButtonOpenAllW,
            DOMButtonOpenAllI,
            DOMButtonSort,
            DOMButtonRemove
        );

        return DOMDetails;
    },
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(btnode: chrome.bookmarks.BookmarkTreeNode) => HTMLElement | never}*/
    createRoot(btnode) {
        let nchilds = btnode?.children?.length;
        const DOMDetails = DirElement.template.firstElementChild?.cloneNode(true);
        DOMDetails.depth = 1;
        DOMDetails.noopen = true;
        DOMDetails.noremove = true;
        DOMDetails.noedit = true;
        DOMDetails.btnId = btnode.id;
        DOMDetails.btnTitle = btnode.title;
        DOMDetails.btnIndex = btnode.index;
        DOMDetails.btnChildren = nchilds;
        DOMDetails.btnType = DirElement.TYPE;


        DOMDetails.changeTitle = null;
        DOMDetails.changeNumber = DirElement.prototype.changeNumber;

        const DOMSummary = DOMDetails.firstElementChild;
        DOMSummary.btnType = DirElement.TYPE;
        DOMSummary.setAttribute("title", `${btnode.title} - ${nchilds}`);
        DOMSummary.style.setProperty(
            "padding-left",
            `${CSS_PADDING}px`
        );

        const DOMContent = DOMSummary.children["content"];
        DOMContent.btnType = DirElement.TYPE;
        DOMContent.children["number"].insertAdjacentText(BEFOREEND, String(nchilds));
        DOMContent.children["title"].insertAdjacentText(BEFOREEND, btnode.title);

        const templateButtons = DOMTemplateButtons.content.cloneNode(true);
        let DOMButtonBookmark = templateButtons.children["bookmark"];
        let DOMButtonFolder = templateButtons.children["folder"];
        let DOMButtonSort = templateButtons.children["sort"];

        let DOMButtons = DOMSummary.children["buttons"];
        DOMButtons.btnType = DirElement.TYPE;

        DOMButtons.append(
            DOMButtonBookmark,
            DOMButtonFolder,
            DOMButtonSort,
        );

        return DOMDetails;
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(btnode: chrome.bookmarks.BookmarkTreeNode) => undefined} */
    edit(btnode) {
        const DOMDir = DirModal.target;
        DirModal.target = undefined;
        DOMDir.changeTitle(btnode.title);
        closeModal(DirModal.MODAL);
    },
    /**
     * @throw {TypeError} A DOM element is null
     * @type {(btnode: chrome.bookmarks.BookmarkTreeNode) => undefined} */
    pushDir(btnode) {
        if (DirModal.target === undefined) {
            console.error("ERROR: DirModal.target is undefined");
            return;
        }
        let DOMParent = DirModal.target;
        DirModal.target = undefined;

        let DOMDir = DirElement.create(btnode, DOMParent.depth + 1);
        DOMParent.changeNumber(DOMParent.btnChildren + 1);

        if (storage.beginning || storage.foldersBefore) {
            createDirDetails.index = undefined;
            let i = btnode.index + 1;
            while (i < DOMParent.childElementCount) {
                let child = DOMParent.children[i];
                child.btnIndex += 1;
                i += 1;
            }
            const DOMBefore = DOMParent.children[btnode.index];
            DOMParent.insertBefore(DOMDir, DOMBefore.nextElementSibling);
        } else {
            DOMParent.appendChild(DOMDir);
        }

        closeModal(DirModal.MODAL);
    },
    /**
     * @throw {TypeError} A DOM element is null
     * @type {(btnode: chrome.bookmarks.BookmarkTreeNode) => undefined} */
    pushItem(btnode) {
        if (ItemModal.target === undefined) {
            console.error("ERROR: ItemModal.target is undefined");
            return;
        }

        let DOMParent = ItemModal.target;
        ItemModal.target = undefined;

        let DOMItem = ItemElement.create(btnode, DOMParent.depth + 1);
        DOMParent.changeNumber(DOMParent.btnChildren + 1);

        if (storage.beginning || storage.foldersBefore) {
            createItemDetails.index = undefined;
            let i = btnode.index + 1;
            while (i < DOMParent.childElementCount) {
                let child = DOMParent.children[i];
                child.btnIndex += 1;
                i += 1;
            }
            const DOMBefore = DOMParent.children[btnode.index];
            DOMParent.insertBefore(DOMItem, DOMBefore.nextElementSibling);
        } else {
            DOMParent.appendChild(DOMItem);
        }

        closeModal(ItemModal.MODAL);
    },
    /**
     * @throw {TypeError} A DOM element is null
     * @type {(DOMDir: HTMLDetailsElement) => undefined} */
    openItems(DOMDir) {
        for (let child of DOMDir.children) {
            if (child.btnType !== ItemElement.TYPE) {
                continue;
            }
            tabProperties.url = child.btnUrl;
            chrome.tabs.create(tabProperties);
        }
    },
    /**
     * @throw {TypeError} A DOM element is null
     * @type {(DOMDir: HTMLDetailsElement, incognito: boolean) => undefined} */
    openItemsOnWindow(DOMDir, incognito) {
        windowCreateData.url.length = 0;
        windowCreateData.incognito = incognito;
        for (let child of DOMDir.children) {
            if (child.btnType !== ItemElement.TYPE) {
                continue;
            }
            windowCreateData.url.push(child.btnUrl);
        }
        chrome.windows.create(windowCreateData);
    },
    /**
     * @throw {TypeError} A DOM element is null
     * @type {(DOMDir: HTMLDetailsElement) => undefined} */
    sort(DOMDir) {
        if (DOMDir.children.length < 2) {
            return;
        }
        let children = DOMDir.children;
        DOMSortContainer.length = children.length;
        DOMSortContainer[0] = DOMDir.children[0];
        if (storage.foldersBefore) {
            let dirTail = 1;
            let i = 1;
            while (i < children.length) {
                let child = children[i];
                if (child.btnType === DirElement.TYPE) {
                    if (dirTail !== i) {
                        let temp = DOMSortContainer[dirTail];
                        DOMSortContainer[dirTail] = child;
                        DOMSortContainer[i] = temp;
                    } else {
                        DOMSortContainer[i] = child;
                    }
                    dirTail += 1
                } else {
                    DOMSortContainer[i] = child;
                }
                i += 1;
            }
            quicksort(DOMSortContainer, 1, dirTail - 1);
            quicksort(DOMSortContainer, dirTail, i - 1);
        } else {
            for (let i = 1; i < children.length; i += 1) {
                DOMSortContainer[i] = children[i];
            }
            quicksort(DOMSortContainer, 1, DOMSortContainer.length - 1);
        }
        let parentId = DOMDir.btnId;
        for (let i = 1; i < DOMSortContainer.length; i += 1) {
            let child = DOMSortContainer[i];
            child.btnIndex = i - 1;
            movedestination.index = i - 1;
            movedestination.parentId = parentId;
            chrome.bookmarks.move(child.btnId, movedestination);
        }
        Element.prototype.replaceChildren.apply(DOMDir, DOMSortContainer);
    },
    prototype: {
        /**
         * @throws {TypeError} A DOM element is null
         * @type {(This: HTMLDetailsElement, title: string) => undefined} */
        changeTitle(title) {
            this.btnTitle = title;

            const DOMSummary = this.firstElementChild;
            const DOMContent = DOMSummary.children["content"];
            DOMSummary.setAttribute("title", `${title} - ${this.btnChildren}`);
            DOMContent.children["title"].textContent = title;
        },
        /**
         * @throws {TypeError} A DOM element is null
         * @type {(This: HTMLDetailsElement, n: number) => undefined} */
        changeNumber(n) {
            this.btnChildren = n;
            const DOMSummary = this.firstElementChild
            const DOMContent = DOMSummary.children["content"];
            DOMSummary.setAttribute("title", `${this.btnTitle} - ${n}`);
            DOMContent.children["number"].textContent = n;
        }
    },
};

const ItemElement = {
    TYPE: "item",
    /** @type {DocumentFragment} */
    template: (function () {
        /** @type{HTMLTemplateElement | null} */
        let template = document.getElementById("template_item");
        if (template === null) {
            throw Error("#template_item does not exist");
        }
        return template.content;
    }()),
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(
        btnode: chrome.bookmarks.BookmarkTreeNode,
        depth: number
    ) => HTMLElement | undefined}*/
    create(btnode, depth) {
        if (btnode.url === undefined) {
            console.error("ERROR: try create a DOMItem with a dir BookmarkTreeNode");
            return;
        }
        const DOMItem = ItemElement.template.firstElementChild.cloneNode(true);
        DOMItem.depth = depth;
        DOMItem.btnId = btnode.id;
        DOMItem.btnTitle = btnode.title;
        DOMItem.btnUrl = btnode.url;
        DOMItem.btnIndex = btnode.index;
        DOMItem.btnType = ItemElement.TYPE;

        DOMItem.edit = ItemElement.prototype.edit;

        const DOMContent = DOMItem.children["content"];
        DOMContent.btnType = ItemElement.TYPE;

        DOMContent.setAttribute("href", btnode.url);
        DOMContent.setAttribute("title", `${btnode.title}\n${btnode.url}`);
        DOMContent.style.setProperty(
            "padding-left",
            `${depth * CSS_PADDING}px`
        );

        const DOMContentspan = DOMContent.firstElementChild;
        DOMContentspan.children["img"].setAttribute("src", getFavicon(btnode.url));
        DOMContentspan.children["title"].textContent = btnode.title;

        const templateButtons = DOMTemplateButtons.content.children;
        const DOMButtonEdit = templateButtons["edit"].cloneNode(true);
        const DOMButtonRemove = templateButtons["remove"].cloneNode(true);

        DOMButtonEdit.setAttribute("title", "edit");

        DOMItem.children["buttons"].btnType = ItemElement.TYPE;
        DOMItem.children["buttons"].append(DOMButtonEdit, DOMButtonRemove);

        return DOMItem;
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(btnode: chrome.bookmarks.BookmarkTreeNode) => undefined} */
    edit(btnode) {
        const DOMItem = ItemModal.target;
        DOMItem.edit(btnode.title, btnode.url);
        closeModal(ItemModal.MODAL);
    },
    prototype: {
        /**
         * @type {(
                This: HTMLDivElement,
                title: string,
                url: string
            ) => undefined} */
        edit(title, url) {
            this.btnTitle = title;
            this.btnUrl = url;

            const DOMContent = this.children["content"];
            DOMContent.setAttribute("href", url);
            DOMContent.setAttribute("title", `${title}\n${url}`);
            DOMContent.firstElementChild.children["title"].textContent = title;
        }
    },
};

const DirModal = {
    action: MODAL_ACTION_EDIT,
    id: "",
    parentId: "",
    prevTitle: "",

    /**@type{undefined | HTMLElement}*/
    target: undefined,

    /** @type {HTMLDivElement} */
    MODAL: (function () {
        let modal = document.getElementById("modal_dir");
        if (modal === null) {
            throw Error("#modal_dir does not exist");
        }
        return modal;
    }()),
    /** @type {HTMLFormElement} */
    FORM: (function () {
        let form = document.forms["dir"];
        if (form === undefined) {
            throw Error("form.dir does not exist");
        }
        return form;
    }()),
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(DOMDir: HTMLElement) => undefined}*/
    openCreate(DOMDir) {
        if (DOMDir.btnId === undefined || DOMDir.depth === undefined) {
            console.error("ERROR: id or depth property does not exist");
            return;
        }
        DirModal.action = MODAL_ACTION_CREATE;
        DirModal.parentId = DOMDir.btnId;
        DirModal.target = DOMDir;
        DirModal.depth = DOMDir.depth;

        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        DirModal.MODAL?.setAttribute("data-open", "");
        DirModal.MODAL?.setAttribute("data-modal", "create");

        DirModal.FORM.reset();
        DirModal.FORM["title"].focus();
    },
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(DOMDir: HTMLElement) => undefined}*/
    openEdit(DOMDir) {
        if (DOMDir.btnId == null || DOMDir.depth == null) {
            console.error("ERROR: id or depth property does not exist");
            return;
        }
        DirModal.action = MODAL_ACTION_EDIT;
        DirModal.id = DOMDir.btnId;
        DirModal.target = DOMDir;
        DirModal.depth = DOMDir.depth;
        DirModal.prevTitle = DOMDir.btnTitle;

        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        DirModal.MODAL?.setAttribute("data-open", "");
        DirModal.MODAL?.setAttribute("data-modal", "edit");
        DirModal.MODAL.title = DOMDir.btnTitle;

        DirModal.FORM["title"].value = DOMDir.btnTitle;
        DirModal.FORM["title"].focus();
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: SubmitEvent) => undefined} */
    onsubmit(e) {
        e.preventDefault();
        let title = DirModal.FORM["title"].value;
        if (title === undefined || title.length < 1) {
            return;
        }
        if (DirModal.action === MODAL_ACTION_EDIT) {
            if (title === DirModal.prevTitle) {
                return;
            }
            changes.title = title;
            chrome.bookmarks.update(DirModal.id, changes, DirElement.edit);
        } else if (DirModal.action === MODAL_ACTION_CREATE) {
            if (storage.beginning) {
                createDirDetails.index = 0;
            } else if (storage.foldersBefore) {
                let target = DirModal.target;
                let i = 1;
                while (i < target.childElementCount
                    && target.children[i].btnType === DirElement.TYPE
                ) {
                    i += 1;
                }
                createDirDetails.index = i-1;
            }
            createDirDetails.parentId = DirModal.parentId;
            createDirDetails.title = title;
            chrome.bookmarks.create(createDirDetails, DirElement.pushDir);
        }
    },
};

const ItemModal = {
    action: MODAL_ACTION_EDIT,
    id: "",
    parentId: "",
    prevTitle: "",
    prevUrl: "",
    /**@type{undefined | HTMLElement}*/
    target: undefined,

    /** @type {HTMLDivElement} */
    MODAL: (function () {
        let modal = document.getElementById("modal_item");
        if (modal === null) {
            throw Error("#modal_item does not exist");
        }
        return modal;
    }()),
    /** @type {HTMLFormElement} */
    FORM: (function () {
        let form = document.forms["items"];
        if (form === undefined) {
            throw Error("form.items does not exist");
        }
        return form;
    }()),
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(DOMItem: HTMLElement, empty: boolean) => undefined}*/
    openCreate(DOMDir, empty) {
        if (DOMDir.btnId == null || DOMDir.depth == null) {
            console.error("ERROR: id or depth property does not exist");
            return;
        }
        ItemModal.action = MODAL_ACTION_CREATE;
        ItemModal.parentId = DOMDir.btnId;
        ItemModal.target = DOMDir;
        ItemModal.id = "";

        if (!empty) {
            ItemModal.FORM["title"].value = currenttab.title;
            ItemModal.FORM["url"].value = currenttab.url;
        } else {
            ItemModal.FORM.reset();
        }

        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        ItemModal.MODAL?.setAttribute("data-open", "");
        ItemModal.MODAL?.setAttribute("data-modal", "create");
        ItemModal.FORM["title"].focus();
    },
    /**
     * @throws{TypeError} A DOM element is null
     * @type{(DOMItem: HTMLElement) => undefined}*/
    openEdit(DOMItem) {
        if (DOMItem.btnId == null || DOMItem.depth == null) {
            console.error("ERROR: id or depth property does not exist");
            return;
        }
        ItemModal.action = MODAL_ACTION_EDIT;
        ItemModal.id = DOMItem.btnId;
        ItemModal.target = DOMItem;
        ItemModal.parentId = "";
        ItemModal.prevTitle = DOMItem.btnTitle;
        ItemModal.prevUrl = DOMItem.btnUrl;

        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        ItemModal.MODAL?.setAttribute("data-open", "");
        ItemModal.MODAL?.setAttribute("data-ItemModal", "edit");

        ItemModal.FORM["title"].value = DOMItem.btnTitle;
        ItemModal.FORM["url"].value = DOMItem.btnUrl
        ItemModal.FORM["title"].focus();
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: SubmitEvent) => undefined} */
    onsubmit(e) {
        e.preventDefault();
        let title = ItemModal.FORM["title"].value;
        let url = ItemModal.FORM["url"].value;
        if (title === undefined || title.length < 1
            || url === undefined || url.length < 1
        ) {
            return;
        }
        if (ItemModal.action === MODAL_ACTION_EDIT) {
            if (title === ItemModal.prevTitle && url === ItemModal.prevUrl) {
                return;
            }
            changes.title = title;
            changes.url = url;
            chrome.bookmarks.update(ItemModal.id, changes, ItemElement.edit);
        } else if (ItemModal.action === MODAL_ACTION_CREATE) {
            if (storage.beginning) {
                if (storage.foldersBefore) {
                    let target = ItemModal.target;
                    let i = 1;
                    while (i < target.childElementCount
                        && target.children[i].btnType === DirElement.TYPE
                    ) {
                        i += 1;
                    }
                    createItemDetails.index = i-1;
                } else {
                    createItemDetails.index = 0;
                }
            }
            createItemDetails.title = title;
            createItemDetails.url = url;
            createItemDetails.parentId = ItemModal.parentId;
            chrome.bookmarks.create(createItemDetails, DirElement.pushItem);
        }
    },
};

const MoreModal = {
    MODAL: (function () {
        let modal = document.getElementById("modal_more");
        if (modal === null) {
            throw Error("#modal_more does not exist");
        }
        return modal;
    }()),
    /** @type {HTMLFormElement} */
    FORM: (function () {
        let form = document.forms["more"];
        if (form === undefined) {
            throw Error("form.more does not exist");
        }
        return form;
    }()),
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(s: typeof storage) => undefined}*/
    init(s) {
        MoreModal.FORM["theme"].value = s.theme;
        MoreModal.FORM["number"].checked = s.showNumber;
        MoreModal.FORM["open"].value = s.open;
        MoreModal.FORM["focus"].checked = s.focusTabs;
        MoreModal.FORM["beginning"].checked = s.beginning;
        MoreModal.FORM["folders"].checked = s.foldersBefore;
    },
    open() {
        if (relatedFocusTarget === null) {
            if (document.activeElement === null
                || document.activeElement === document.body
            ) {
                relatedFocusTarget = HeaderNav.NAV.children["more"];
            } else {
                relatedFocusTarget = document.activeElement;
            }
        }
        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        MoreModal.MODAL?.setAttribute("data-open", "");
        MoreModal.FORM["theme"].focus();
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: InputEvent) => undefined}*/
    onchange(e) {
        const target = e.target;
        let name = target.getAttribute("name");
        let storageChange = false;
        if (name === "theme") {
            if (target.value === STORAGE_THEME_DARK
                || target.value === STORAGE_THEME_LIGHT
            ) {
                storage.theme = target.value;
                document.firstElementChild?.setAttribute("class", target.value);
                storageChange = true;
            } else {
                target.value = STORAGE_THEME_DARK;
                document.firstElementChild.setAttribute("class", STORAGE_THEME_DARK);
                if (storage.theme !== STORAGE_THEME_DARK) {
                    storage.theme = STORAGE_THEME_DARK;
                    storageChange = true;
                }
                console.error("WARNNING: the theme value was wrong, it will set the default");
            }
        } else if (name === "number") {
            storage.showNumber = target.checked;
            if (target.checked) {
                Main.MAIN?.removeAttribute("css-nonumber");
            } else {
                Main.MAIN?.setAttribute("css-nonumber", "");
            }
            storageChange = true;
        } else if (name === "open") {
            if (target.value === STORAGE_OPEN_NEW
                || target.value === STORAGE_OPEN_CURRENT
            ) {
                storage.open = target.value;
                storageChange = true;
            } else {
                target.value = STORAGE_OPEN_CURRENT;
                if (storage.open !== STORAGE_OPEN_CURRENT) {
                    storage.open = STORAGE_OPEN_CURRENT;
                    storageChange = true;
                }
                console.error("WARNNING: the open value was wrong, it will set the default");
            }
        } else if (name === "focus") {
            storage.focusTabs = target.checked;
            tabProperties.active = storage.focusTabs;
            windowCreateData.focused = storage.focusTabs;
            storageChange = true;
        } else if (name === "beginning") {
            storage.beginning = target.checked;
            storageChange = true;
        } else if (name === "folders") {
            storage.foldersBefore = target.checked;
            storageChange = true;
        }
        if (storageChange) {
            chrome.storage.local.set(storage, undefined);
        }
    }
};

const KeyboardModal = {
    /** @type {HTMLDivElement} */
    MODAL: (function () {
        let modal = document.getElementById("modal_keyboard");
        if (modal === null) {
            throw Error("#modal_keyboard does not exist");
        }
        return modal;
    }()),
    open() {
        if (relatedFocusTarget === null) {
            if (document.activeElement === null
                || document.activeElement === document.body
            ) {
                relatedFocusTarget = HeaderNav.NAV.children["keyboard"];
            } else {
                relatedFocusTarget = document.activeElement;
            }
        }

        Main.MAIN.inert = true;
        HeaderNav.NAV.inert = true;
        Message.infocus = false;

        KeyboardModal.MODAL?.setAttribute("data-open", "");
        KeyboardModal.MODAL
            .firstElementChild
            .firstElementChild
            .lastElementChild
            .focus();
    }
};

const Message = {
    /** @type {HTMLDivElement} */
    MESSAGE: (function () {
        const DOMMessage = document.getElementById("message");
        if (DOMMessage === null) {
            throw Error("#message does not exist");
        }
        return DOMMessage
    }()),
    infocus: false,
    type: "",
    /**@type{HTMLElement | null}*/
    target: null,
    /**@type{HTMLElement | null}*/
    parentTarget: null,
    /**@type{Timer | undefined}*/
    timeout: undefined,
    clear() {
        Message.target = null;
        Message.parentTarget = null;
        Message.timeout = undefined;
        Message.infocus = false;
    },
    /**
     * @type {(title: string) => undefined} */
    open(title) {
        Message.MESSAGE.setAttribute("data-show", "");
        const DOMHeader = Message.MESSAGE.firstElementChild?.lastElementChild;
        const DOMClose = Message.MESSAGE.lastElementChild?.lastElementChild;
        DOMHeader.textContent = title;
        Message.infocus = true;
        DOMClose.focus();
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(type: string, target: HTMLElement) => undefined} */
    remove(type, target) {
        if (Message.timeout !== undefined) {
            clearTimeout(Message.timeout);
        }
        const DOMParent = target.parentElement;
        Message.type = type;
        Message.target = target;
        Message.parentTarget = DOMParent;
        Message.timeout = setTimeout(Message.close, UNDO_TIMEOUT_MS);
        if (target.btnId !== undefined) {
            let i = target.btnIndex + 2;
            while (i < DOMParent.childElementCount) {
                DOMParent.children[i].btnIndex -= 1;
                i += 1;
            }
            DOMParent?.changeNumber(DOMParent.btnChildren - 1);

            DOMParent.removeChild(target);
            chrome.bookmarks.removeTree(target.btnId, undefined);

            Message.open(target.btnTitle);

        } else {
            console.error("ERROR: btnId property does not exist");
        }
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(DOMDir: HTMLElement, parentId: string) => Promise<undefined>} */
    async undoBtnDir(DOMDir, parentId) {
        const stack  = [DOMDir];
        let i = 1;
        let visited = false;
        createDirDetails.index = DOMDir.btnIndex;
        while (stack.length > 0) {
            let node = stack[stack.length - 1];
            if (!visited) {
                createDirDetails.title = node.btnTitle;
                createDirDetails.parentId = parentId;

                let btnode = await chrome.bookmarks.create(createDirDetails);
                node.btnId = btnode.id;
                createDirDetails.index = undefined;
                i = 1;
            }

            let childrenLen = node.children.length;
            if (1 < childrenLen) {
                parentId = node.btnId;
                let child = node.children[i];
                while (i < childrenLen && child.btnType === ItemElement.TYPE)  {
                    child = node.children[i];
                    createItemDetails.title = child.btnTitle;
                    createItemDetails.url = child.btnUrl;
                    createItemDetails.parentId = parentId;

                    let btnode = await chrome.bookmarks.create(createItemDetails);
                    child.btnId = btnode.id;

                    i += 1;
                }
            }
            if (1 < childrenLen && i < childrenLen) {
                stack.push(node.children[i]);
                visited = false;
            } else {
                stack.pop();
                i = node.btnIndex + 2;
                visited = true;
            }
        }
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(DOMDir: HTMLElement, parentId: string) => Promise<undefined>} */
    async undoBtnItem(DOMItem, parentId) {
        createItemDetails.title = DOMItem.btnTitle;
        createItemDetails.url = DOMItem.btnUrl;
        createItemDetails.parentId = parentId
        createItemDetails.index = DOMItem.btnIndex;

        let btnode = await chrome.bookmarks.create(createItemDetails);
        DOMItem.btnId = btnode.id;
        createItemDetails.index = undefined;
    },
    undo() {
        const target = Message.target;
        const DOMParent = Message.parentTarget;
        if (target === null || DOMParent === null) {
            return;
        }
        if (Message.timeout !== undefined) {
            clearTimeout(Message.timeout);
        }
        if (Message.type === DirElement.TYPE) {
            Message.undoBtnDir(target, DOMParent.btnId);
        } else {
            Message.undoBtnItem(target, DOMParent.btnId);
        }
        let i = target.btnIndex + 1;
        while (i < DOMParent.childElementCount) {
            DOMParent.children[i].btnIndex += 1;
            i += 1;
        }
        const DOMPrevSibling = DOMParent.children[target.btnIndex];
        DOMParent.changeNumber(DOMParent.btnChildren + 1);
        DOMParent.insertBefore(target, DOMPrevSibling.nextSibling);

        if (Message.infocus) {
            relatedFocusTarget = target.firstElementChild
        }

        Message.close();
    },
    close() {
        Message.MESSAGE.removeAttribute("data-show");
        if (Message.infocus) {
            focusRelatedTarget();
        }
        Message.clear();
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: MouseEvent) => undefined | never} */
    onclick(e) {
        let target = e.target;
        let name = target.getAttribute("name");
        if (name === "close") {
            Message.close();
        } else if (name === "undo") {
            Message.undo();
        }
    },
    /**
     * @type {(e: KeyboardEvent) => undefined | never} */
    onkeydown(e) {
        if (e.code === "Tab") {
            if ((e.shiftKey && e.target.getAttribute("name") === "undo")
                || e.target.getAttribute("name") === "close"
            ) {
                Message.infocus = false;
                focusRelatedTarget();
            }
        } else if (e.code === COMMAND_MODAL_CLOSE) {
            Message.close();
        }
    }
};

const HeaderNav = {
    /** @type {HTMLDivElement} */
    NAV: (function () {
        const DOMHeaderNav = document.getElementById("header_nav");
        if (DOMHeaderNav === null) {
            throw Error("#header_nav does not exist");
        }
        return DOMHeaderNav;
    }()),
    /**
     * @throws{TypeError} A DOM element is null
     * @type {(e: MouseEvent) => undefined}*/
    onclick(e) {
        let target = e.target;
        let name = target.getAttribute("name");
        if (name === "bookmarks") {
            tabProperties.url = "about://bookmarks";
            openLink(tabProperties, storage.open, e.ctrlKey);
        } else if (name === "more") {
            MoreModal.open();
        } else if (name === "keyboard") {
            KeyboardModal.open();
        } else if (name === "close") {
            window.close();
        }
    },
    /**
     * @type {(e: MouseEvent) => undefined}*/
    onauxclick(e) {
        let target = e.target;
        let name = target?.getAttribute("name");
        if (name === "bookmarks") {
            tabProperties.url = "about://bookmarks";
            chrome.tabs.create(tabProperties, undefined);
        }
    }
};

const Main = {
    /** @type {HTMLDivElement} */
    MAIN: (function () {
        const main = document.getElementById("main");
        if (main === null) {
            throw Error("#main does not exist");
        }
        return main;
    }()),
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: MouseEvent) => undefined}*/
    onauxclick(e) {
        const target = e.target;
        const name = target?.getAttribute("name");
        if (name !== "content" && target.btnType !== ItemElement.TYPE) {
            return;
        }
        e.preventDefault();
        const href = target?.getAttribute("href");
        tabProperties.url = href;
        chrome.tabs.create(tabProperties, undefined);
    },
    /**
     * @throws{TypeError} A DOM element is null
     * @type {(e: MouseEvent) => undefined}*/
    onclick(e) {
        const target = e.target;
        const name = target?.getAttribute("name");
        if (name === "content") {
            if (target.btnType === ItemElement.TYPE) {
                if (!e.shiftKey) {
                    e.preventDefault();
                    const href = target?.getAttribute("href");
                    tabProperties.url = href;
                    openLink(tabProperties, storage.open, e.ctrlKey);
                }
            } else if (target.btnType === DirElement.TYPE) {
                const DOMSummary = target.parentElement;
                const DOMDir = target.parentElement.parentElement;
                if (DOMDir.hasAttribute("open")) {
                    let y = (DOMDir.offsetTop
                        - Main.MAIN.offsetTop
                        - DOMSummary.clientHeight
                    );
                    if (Main.MAIN.scrollTop > y) {
                        Main.MAIN.scroll(0, y);
                    }
                }
            }
        } else if (name === "bookmark") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            relatedFocusTarget = DOMDir.firstElementChild;
            ItemModal.openCreate(DOMDir, e.shiftKey);

        } else if (name === "folder") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            relatedFocusTarget = DOMDir.firstElementChild;
            DirModal.openCreate(DOMDir);

        } else if (name === "edit") {
            let btnType = target.parentElement.btnType;
            if (btnType === DirElement.TYPE) {
                const DOMDir = (
                    target
                    ?.parentElement
                    ?.parentElement
                    ?.parentElement
                );
                if (DOMDir.noedit) {
                    return;
                }
                relatedFocusTarget = DOMDir.firstElementChild;
                DirModal.openEdit(DOMDir);

            } else if (btnType === ItemElement.TYPE) {
                const DOMItem = target?.parentElement?.parentElement;
                relatedFocusTarget = target?.parentElement;
                ItemModal.openEdit(DOMItem);
            }
        } else if (name === "remove") {
            let btnType = target.parentElement.btnType;
            if (btnType === DirElement.TYPE) {
                const DOMDir = (
                    target
                    ?.parentElement
                    ?.parentElement
                    ?.parentElement
                );
                if (DOMDir.noremove) {
                    return;
                }
                if (DOMDir.nextElementSibling === null) {
                    const DOMParent = DOMDir?.parentElement;
                    relatedFocusTarget = DOMParent?.nextElementSibling?.firstElementChild;
                } else {
                    relatedFocusTarget = DOMDir.nextElementSibling.firstElementChild;
                }
                Message.remove(btnType, DOMDir);

            } else if (btnType === ItemElement.TYPE) {
                const DOMItem = target?.parentElement?.parentElement;
                if (DOMItem.nextElementSibling === null) {
                    const DOMParent = DOMItem.parentElement;
                    relatedFocusTarget = DOMParent.nextElementSibling?.firstElementChild;
                } else {
                    relatedFocusTarget = DOMItem.nextElementSibling.firstElementChild;
                }
                Message.remove(btnType, DOMItem);
            }
        } else if (name === "sort") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            DirElement.sort(DOMDir);
        } else if (name === "openall") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            if (DOMDir.noopen) {
                return;
            }
            DirElement.openItems(DOMDir);

        } else if (name === "openall_window") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            if (DOMDir.noopen) {
                return;
            }
            DirElement.openItemsOnWindow(DOMDir, false);

        } else if (name === "openall_incognito") {
            const DOMDir = (
                target
                ?.parentElement
                ?.parentElement
                ?.parentElement
            );
            if (DOMDir.noopen) {
                return;
            }
            DirElement.openItemsOnWindow(DOMDir, true);
        }
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: KeyboardEvent) => undefined | never} */
    onkeyup(e) {
        let target = e.target;
        let btnType = target?.btnType
        if (btnType === undefined) {
            return;
        }
        if (e.code === COMMAND_BOOKMARK || e.code === COMMAND_BOOKMARK_EMPTY) {
            if (e.ctrlKey) {
                return
            }
            let DOMDir;
            if (e.shiftKey) {
                if (btnType === DirElement.TYPE) {
                    DOMDir = target.parentElement.parentElement;
                } else if (btnType === ItemElement.TYPE)  {
                    DOMDir = target.parentElement.parentElement.parentElement;
                }
            } else {
                if (btnType === DirElement.TYPE) {
                    DOMDir = target.parentElement;
                } else if (btnType === ItemElement.TYPE)  {
                    DOMDir = target.parentElement.parentElement;
                }
            }
            if (DOMDir !== undefined && DOMDir.btnType === DirElement.TYPE) {
                relatedFocusTarget = target;
                ItemModal.openCreate(DOMDir, e.code === COMMAND_BOOKMARK_EMPTY);
            }
        } else if (e.code === "Space") {
            if (btnType === DirElement.TYPE) {
                const DOMSummary = target;
                const DOMDir = target.parentElement;
                if (DOMDir.hasAttribute("open")) {
                    let y = (DOMDir.offsetTop
                        - Main.MAIN.offsetTop
                        - DOMSummary.clientHeight
                    );
                    if (Main.MAIN.scrollTop > y) {
                        Main.MAIN.scroll(0, y);
                    }
                }
            }
        } else if (e.code === COMMAND_FOLDER) {
            if (e.ctrlKey) {
                return
            }
            let DOMDir;
            if (e.shiftKey) {
                if (btnType === DirElement.TYPE) {
                    DOMDir = target.parentElement.parentElement;
                } else if (btnType === ItemElement.TYPE)  {
                    DOMDir = target.parentElement.parentElement.parentElement;
                }
            } else {
                if (btnType === DirElement.TYPE) {
                    DOMDir = target.parentElement;
                } else if (btnType === ItemElement.TYPE)  {
                    DOMDir = target.parentElement.parentElement;
                }
            }
            if (DOMDir !== undefined && DOMDir.btnType === DirElement.TYPE) {
                relatedFocusTarget = target;
                DirModal.openCreate(DOMDir);
            }
        } else if (e.code === COMMAND_EDIT) {
            if (e.ctrlKey || e.shiftKey) {
                return
            }
            if (btnType === DirElement.TYPE) {
                const DOMDir = target.parentElement;
                if (DOMDir.noedit) {
                }

                DirModal.openEdit(DOMDir);

            } else if (btnType === ItemElement.TYPE)  {
                const DOMItem = target?.parentElement;
                relatedFocusTarget = target;
                ItemModal.openEdit(DOMItem);
            }
        } else if (e.code === COMMAND_REMOVE) {
            if (e.ctrlKey || e.shiftKey) {
                return
            }
            let DOMDir;
            if (btnType === DirElement.TYPE) {
                DOMDir = target.parentElement;
                if (DOMDir.nextElementSibling === null) {
                    const DOMParent = DOMDir?.parentElement;
                    relatedFocusTarget = DOMParent?.nextElementSibling?.firstElementChild;
                } else {
                    relatedFocusTarget = DOMDir.nextElementSibling.firstElementChild;
                }
                if (DOMDir !== undefined) {
                    if (DOMDir.noremove) {
                        return;
                    }
                    Message.remove(btnType, DOMDir);
                }
            } else if (btnType === ItemElement.TYPE)  {
                const DOMItem = target?.parentElement;
                DOMDir = DOMItem?.parentElement;
                if (DOMItem.nextElementSibling === null) {
                    relatedFocusTarget = DOMDir?.nextElementSibling?.firstElementChild;
                } else {
                    relatedFocusTarget = DOMItem.nextElementSibling.firstElementChild;
                }
                Message.remove(btnType, DOMItem);
            }
        } else if (e.code === COMMAND_SORT) {
            if (e.ctrlKey) {
                return
            }
            let DOMDir;
            if (e.shiftKey && btnType === DirElement.TYPE) {
                DOMDir = target.parentElement.parentElement;
            } else {
                if (btnType === DirElement.TYPE) {
                    DOMDir = target.parentElement;
                } else if (btnType === ItemElement.TYPE)  {
                    DOMDir = target.parentElement.parentElement;
                }
            }
            if (DOMDir !== undefined) {
                DirElement.sort(DOMDir);
                target.focus();
            }
        } else if (e.code === COMMAND_OPEN) {
            if (e.ctrlKey) {
                return
            }
            if (btnType === DirElement.TYPE) {
                const DOMDir = target.parentElement;
                if (DOMDir !== undefined) {
                    if (DOMDir.noopen) {
                        return;
                    }
                    if (e.shiftKey) {
                        DirElement.openItemsOnWindow(DOMDir, false);
                    } else {
                        DirElement.openItems(DOMDir);
                    }
                }
            }
        } else if (e.code === COMMAND_OPEN_I) {
            if (!e.shiftKey) {
                return
            }
            if (btnType === DirElement.TYPE) {
                const DOMDir = target.parentElement;
                if (DOMDir !== undefined) {
                    if (DOMDir.noopen) {
                        return;
                    }
                    DirElement.openItemsOnWindow(DOMDir, true);
                }
            }
        } else if (e.code === COMMAND_COPY) {
            if (!e.ctrlKey) {
                return;
            }
            if (btnType === DirElement.TYPE) {
                const DOMDir = target.parentElement;
                navigator.clipboard.writeText(DOMDir.btnTitle);
            } else if (btnType === ItemElement.TYPE)  {
                const DOMItem = target.parentElement;
                navigator.clipboard.writeText(DOMItem.btnUrl);
            }
        } else if (e.code === COMMAND_DIRPARENT) {
            if (e.ctrlKey || e.shiftKey) {
                return;
            }
            let DOMDir;
            DOMDir = (target?.parentElement?.parentElement) ?? undefined;
            if (DOMDir !== undefined && DOMDir.btnType === DirElement.TYPE) {
                DOMDir.firstElementChild.focus();
            }
        }
    },
    /**
     * @type {(e: KeyboardEvent) => undefined | never} */
    onkeydown(e) {
        const target = e.target;
        const btnType = target.btnType;
        if (e.code === "Enter") {
            if (btnType === DirElement.TYPE) {
                const DOMSummary = target;
                const DOMDir = target.parentElement;
                if (DOMDir.hasAttribute("open")) {
                    let y = (DOMDir.offsetTop
                        - Main.MAIN.offsetTop
                        - DOMSummary.clientHeight
                    );
                    if (Main.MAIN.scrollTop > y) {
                        Main.MAIN.scroll(0, y);
                    }
                }
            }
        }
    },
    /**
     * @throws {TypeError} A DOM element is null
     * @type {(e: MouseEvent) => undefined}*/
    onpointerover(e) {
        let target = e.target;
        let name = target.getAttribute("name");
        if (name === "more") {
            let DOMDir = target.parentElement.parentElement.parentElement;
            let DOMButtonsMore = target.parentElement.nextElementSibling;
            let top = (
                Main.MAIN.offsetHeight
                    + Main.MAIN.scrollTop
                    - DOMButtonsMore.offsetHeight
            );
            if (top < DOMDir.offsetTop) {
                DOMButtonsMore.setAttribute("css-position", "bottom");
            } else {
                DOMButtonsMore.setAttribute("css-position", "top");
            }
        }
    },
};

/**
 * @throws {Error} BookmarkTreeNode does not have index
 * @type {(
    root: chrome.bookmarks.BookmarkTreeNode,
    depth: number,
    DOMRoot: HTMLElement
) => HTMLElement}*/
function bookmarkTreeToDOM(root, depth, DOMRoot) {
    const DOMStack = [DOMRoot];
    const stack = [root];
    let i = -1;
    /**@type{chrome.bookmarks.BookmarkTreeNode}*/
    let node = root; //only for init
    /**@type{HTMLElement}*/
    let DOMElement = DOMRoot; //only for init
    while (stack.length > 0) {
        node = stack[stack.length - 1];
        if (node.children === undefined || i + 1 === node.children.length) {
            stack.pop();
            if (node.index === undefined) {
                throw Error("BookmarkTreeNode does not have index");
            }
            i = node.index;
            DOMElement = DOMStack.pop();
            if (DOMStack.length > 0) {
                DOMStack[DOMStack.length - 1].appendChild(DOMElement);
            }
            depth -= 1;
        } else {
            node = node.children[i + 1];
            depth += 1;
            if (node.children !== undefined) {
                DOMStack.push(DirElement.create(node, depth));
            } else {
                let DOMItem = ItemElement.create(node, depth)
                if (DOMItem !== undefined) {
                    DOMStack.push(DOMItem);
                }
            }
            stack.push(node);
            i = -1;
        }
    }
    return DOMRoot;
}

/**
 * @throws {TypeError} A DOM element is null
 * @type {(btroot: chrome.bookmarks.BookmarkTreeNode) => undefined}*/
function createDOMRootTree(btroot) {
    const fragment = document.createDocumentFragment();
    for (let child of btroot.children) {
        let DOMDir = DirElement.createRoot(child);
        bookmarkTreeToDOM(child, 1, DOMDir);
        fragment.appendChild(DOMDir);
    }
    if (fragment.children.length > 0) {
        fragment.children[0].setAttribute("open", "");
    }
    Main.MAIN.appendChild(fragment);
}

/**
 * @type {(e: KeyboardEvent) => undefined} */
function DOMOnkeyup(e) {
    if (MoreModal.MODAL.hasAttribute("data-open")) {
        if (e.code === COMMAND_MODAL_CLOSE || e.code === COMMAND_MODAL_MORE) {
            closeModal(MoreModal.MODAL);
        }
    } else if (KeyboardModal.MODAL.hasAttribute("data-open")) {
        if (e.code === COMMAND_MODAL_CLOSE || e.code === COMMAND_MODAL_KEYBOARD) {
            closeModal(KeyboardModal.MODAL);
        }
    } else if (DirModal.MODAL.hasAttribute("data-open")) {
        if (e.ctrlKey && e.code === COMMAND_MODAL_CLOSE) {
            closeModal(DirModal.MODAL);
        }
    } else if (ItemModal.MODAL.hasAttribute("data-open")) {
        if (e.ctrlKey && e.code === COMMAND_MODAL_CLOSE) {
            closeModal(ItemModal.MODAL);
        }
    } else {
        if (e.code === COMMAND_MODAL_KEYBOARD) {
            KeyboardModal.open();
        } else if (e.code === COMMAND_MODAL_MORE) {
            MoreModal.open();
        } else if (e.code === COMMAND_UNDO) {
            Message.undo();
        }
    }
}

Promise.all([
    chrome.storage.local.get(),
    chrome.bookmarks.getTree(),
    chrome.tabs.query({active: true, currentWindow: true})
]).then(
    /**
     * @type{(data: [
        typeof storage,
        Array<chrome.bookmarks.BookmarkTreeNode>,
        Array<chrome.tabs.Tab>
    ]) => undefined}*/
    function (data) {
        let items = data[0];
        let bmtree = data[1];
        currenttab = data[2][0];

        initStorage(items);

        MoreModal.init(storage);
        document.firstElementChild?.setAttribute("class", storage.theme);

        if (bmtree.length === 1
            && bmtree[0].children !== undefined
            && bmtree[0].children.length > 0
        ) {
            createDOMRootTree(bmtree[0]);
        } else {
            throw Error("The root BookmarkTreeNode is empty");
        }


        document.addEventListener("keyup", DOMOnkeyup, true);

        HeaderNav.NAV.addEventListener("click", HeaderNav.onclick, false);
        HeaderNav.NAV.addEventListener("auxclick", HeaderNav.onauxclick, false);

        Main.MAIN.addEventListener("click", Main.onclick, false);
        Main.MAIN.addEventListener("auxclick", Main.onauxclick, false);
        Main.MAIN.addEventListener("pointerover", Main.onpointerover, false);
        Main.MAIN.addEventListener("keyup", Main.onkeyup, false);
        Main.MAIN.addEventListener("keydown", Main.onkeydown, false);

        Message.MESSAGE.addEventListener("click", Message.onclick, false);
        Message.MESSAGE.addEventListener("keyup", Message.onkeyup, false);
        Message.MESSAGE.addEventListener("keydown", Message.onkeydown, false);

        DirModal.MODAL.addEventListener("click", ModalOnclick, false);
        DirModal.FORM.addEventListener("submit", DirModal.onsubmit, false);

        ItemModal.MODAL.addEventListener("click", ModalOnclick, false);
        ItemModal.FORM.addEventListener("submit", ItemModal.onsubmit, false);

        MoreModal.MODAL.addEventListener("click", ModalOnclick, false);
        MoreModal.FORM.addEventListener("change", MoreModal.onchange, false);

        KeyboardModal.MODAL.addEventListener("click", ModalOnclick, false);
    }
);

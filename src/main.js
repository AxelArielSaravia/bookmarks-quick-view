//@ts-check browser
/**
@template T
@typedef { T | undefined } maybe<T>
*/
/**
@typedef {{
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
}} BookmarkTreeNode
*/


const DOM_TYPE_ATTR = "data-type";
const DOM_DIR_V = "0";
const DOM_DIR_ATTR = `[${DOM_TYPE_ATTR}="${DOM_DIR_V}"]`;
const DOM_DIR_CH = `${DOM_DIR_ATTR} *`;

const DOM_DIRH_V = "1";
const DOM_DIRH_ATTR = `[${DOM_TYPE_ATTR}="${DOM_DIRH_V}"]`;
const DOM_DIRH_CH = `${DOM_DIRH_ATTR} *`;

const DOM_ITEM_V = "2";
const DOM_ITEM_ATTR = `[${DOM_TYPE_ATTR}="${DOM_ITEM_V}"]`;
const DOM_ITEM_CH = `${DOM_ITEM_ATTR} *`;

const DOM_ITEMLINK_V = "3";
const DOM_ITEMLINK_ATTR = `[${DOM_TYPE_ATTR}="${DOM_ITEMLINK_V}"]`;
const DOM_ITEMLINK_CH = `${DOM_ITEMLINK_ATTR} *`;

const DOM_BBOOKMARK_V = "4";
const DOM_BBOOKMARK_ATTR = `[${DOM_TYPE_ATTR}="${DOM_BBOOKMARK_V}"]`;
const DOM_BBOOKMARK_CH = `${DOM_BBOOKMARK_ATTR} *`;

const DOM_BFOLDER_V = "5";
const DOM_BFOLDER_ATTR = `[${DOM_TYPE_ATTR}="${DOM_BFOLDER_V}"]`;
const DOM_BFOLDER_CH = `${DOM_BFOLDER_ATTR} *`;

const DOM_BEDIT_V = "6";
const DOM_BEDIT_ATTR = `[${DOM_TYPE_ATTR}="${DOM_BEDIT_V}"]`;
const DOM_BEDIT_CH = `${DOM_BEDIT_ATTR} *`;

const DOM_BREMOVE_V = "7";
const DOM_BREMOVE_ATTR = `[${DOM_TYPE_ATTR}="${DOM_BREMOVE_V}"]`;
const DOM_BREMOVE_CH = `${DOM_BREMOVE_ATTR} *`;

const DOM_MODAL_V = "8";
const DOM_MODAL_ATTR = `[${DOM_TYPE_ATTR}="${DOM_MODAL_V}"]`;
const DOM_MODAL_CH = `${DOM_MODAL_ATTR} *`;



const DOMDepthPadding = 10;

const DOM = {
    /**
    @type {maybe<HTMLTemplateElement>}*/
    templateDir: undefined,
    /**
    @type {maybe<HTMLTemplateElement>}*/
    templateItem: undefined,
    /**
    @type {maybe<HTMLTemplateElement>}*/
    templateButtons: undefined,
    /**
    @type {maybe<HTMLButtonElement>}*/
    buttonBookmark: undefined,
    /**
    @type {maybe<HTMLButtonElement>}*/
    buttonMore: undefined,
    /**
    @type {maybe<HTMLDivElement>} */
    modalConfig: undefined,
    /**
    @type {maybe<HTMLDivElement>} */
    modalEdit: undefined,
    /**
    @type {maybe<HTMLElement>}*/
    main: undefined,
    /**
    @type {DocumentFragment}*/
    fragment: document.createDocumentFragment()
};

const StorageState = {
    //focusTabs can be: "0" (no) | "1" (yes)
    focusTabs: "0",
    //open can be: "0" (current Tab) | "1" (new tab)
    open: "0",
};


var CurrentTab = undefined;

/**
@type {(message: string) => never}*/
const panic = function (message) {
    throw Error(message);
}


const TabOptions = {active: false, url: ""};
/**
@type {(url: string, ctrl: boolean) => undefined}*/
const openLink = function (url, ctrl) {
    TabOptions.url = url;
    TabOptions.active = (StorageState.focusTabs !== "0");
    if ((StorageState.open === "0") === !ctrl) {
        chrome.tabs.update(CurrentTab.id, TabOptions);
    } else {
        chrome.tabs.create(TabOptions);
    }
}

const url = new URL("http://t.i");
/**
@type {(src: string) => string} */
const getFavicon = function (src) {
    url.href = chrome.runtime.getURL("/_favicon/");
    url.searchParams.set("pageUrl", src);
    url.searchParams.set("size", "16");
    return url.toString();
}


/**
@type {(
    bmNode: BookmarkTreeNode,
    depth: number,
    DOMTemplateDir: HTMLTemplateElement,
    DOMTemplateButtons: maybe<HTMLTemplateElement>
) => HTMLDivElement}*/
const createDOMDir = function (
    bmNode,
    depth,
    DOMTemplateDir,
    DOMTemplateButtons
) {
    var DOMDirClone = DOMTemplateDir.content.cloneNode(true);
    var DOMDir = DOMDirClone.firstElementChild
    DOMDir.setAttribute("data-id", bmNode.id);
    DOMDir.setAttribute("data-index", bmNode.index);
    DOMDir.setAttribute("title", bmNode.title);

    var DOMDirButton = DOMDir.firstElementChild.firstElementChild;
    DOMDirButton.style.setProperty(
        "padding-left",
        `${depth * DOMDepthPadding}px`
    );

    var DOMDirTitle = DOMDirButton.lastElementChild;
    DOMDirTitle.textContent = bmNode.title;

    if (DOMTemplateButtons !== undefined) {
        var DOMRight = DOMDir.firstElementChild.lastElementChild;
        var DOMButtons = DOMTemplateButtons.content.cloneNode(true);
        DOMRight.appendChild(DOMButtons);
    }
    return DOMDir;
}

/**
@type {(
    bmNode: BookmarkTreeNode,
    depth: number,
    DOMTemplateItem: HTMLTemplateElement,
    DOMTemplateButtons: maybe<HTMLTemplateElement>
) => HTMLAnchorElement | never}*/
function createDOMItem(bmNode, depth, DOMTemplateItem, DOMTemplateButtons) {
    if (bmNode.url === undefined) {
        panic("BookmarkTreeNode.url is undefined");
    }

    var DOMItemClone = DOMTemplateItem.content.cloneNode(true);
    var DOMItem = DOMItemClone.firstElementChild;
    DOMItem.setAttribute("data-id", bmNode.id);
    DOMItem.setAttribute("data-index", bmNode.index);
    DOMItem.setAttribute("title", `${bmNode.title}\n${bmNode.url}`);

    var DOMItemA = DOMItem.firstElementChild;
    DOMItemA.setAttribute("href", bmNode.url);
    DOMItemA.style.setProperty(
        "padding-left",
        `${depth * DOMDepthPadding}px`
    );

    var DOMItemImg = DOMItemA.children[0];
    DOMItemImg.setAttribute("src", getFavicon(bmNode.url));

    var DOMItemTitle = DOMItemA.children[1];
    DOMItemTitle.textContent = bmNode.title;

    if (DOMTemplateButtons !== undefined) {
        var DOMRight = DOMItem.lastElementChild;
        var DOMButtons = DOMTemplateButtons.content.children;
        var DOMBRename = DOMButtons[2].cloneNode(true);
        var DOMBRemove = DOMButtons[3].cloneNode(true);
        DOMRight.appendChild(DOMBRename);
        DOMRight.appendChild(DOMBRemove);
    }

    return DOMItem;
}

/**
@type {(
    root: BookmarkTreeNode,
    depth: number, //the depth of the root
    DOMRoot: HTMLElement,
    DOMTemplateDir: HTMLTemplateElement,
    DOMTemplateItem: HTMLTemplateElement,
    DOMTemplateButtons: HTMLTemplateElement
) => HTMLElement | never}*/
function BTNToDOM(
    root,
    depth,
    DOMRoot,
    DOMTemplateDir,
    DOMTemplateItem,
    DOMTemplateButtons
) {
    var DOMStack = [DOMRoot]
    var stack = [root];
    var idx = -1;
    /** @type {BookmarkTreeNode} */
    var u;
    /** @type {HTMLElement} */
    var DOMElement;

    while (stack.length > 0) {
        u = stack[stack.length - 1];
        if (u.children === undefined || idx + 1 === u.children.length) {
            stack.pop();
            if (u.index === undefined) {
                panic("BookmarkTreeNode.index is undefined");
            }
            idx = u.index;
            DOMElement = DOMStack.pop();
            if (DOMStack.length > 0) {
                DOMStack[DOMStack.length - 1].appendChild(DOMElement);
            }
            depth -= 1;
        } else {
            u = u.children[idx + 1];

            depth += 1;
            if (u.children !== undefined) {
                DOMStack.push(
                    createDOMDir(u, depth, DOMTemplateDir, DOMTemplateButtons)
                );
            } else {
                DOMStack.push(
                    createDOMItem(u, depth, DOMTemplateItem, DOMTemplateButtons)
                );
            }
            stack.push(u);
            idx = -1;
        }
    }
    return DOMRoot;
}

/**
@type {(data: Array<BookmarkTreeNode>) => undefined | never} */
function mainGetTree(data) {
    if (data.length === 0
        || data[0].children === undefined
        || data[0].children.length === 0
    ) {
        panic("The bookmark roots does not exist");
    }
    var children = data[0].children;
    var bookmarks = children[0];
    var otherBookmarks = children[1];

    var DOMButtons = DOM.templateButtons.content.children;
    var DOMBBookmark = DOMButtons[0];
    var DOMBFolder = DOMButtons[1];

    var DOMBm = createDOMDir(bookmarks, 1, DOM.templateDir, undefined);
    DOMBm.setAttribute("data-open", "1");
    var DOMRight = DOMBm.firstElementChild.lastElementChild;
    DOMRight.appendChild(DOMBBookmark.cloneNode(true));
    DOMRight.appendChild(DOMBFolder.cloneNode(true));
    if (bookmarks.children !== undefined
        && bookmarks.children.length > 0
    ) {
        BTNToDOM(
            bookmarks,
            1,
            DOMBm,
            DOM.templateDir,
            DOM.templateItem,
            DOM.templateButtons
        );
    }

    var DOMObm = createDOMDir(otherBookmarks, 1, DOM.templateDir, undefined);
    DOMRight = DOMObm.firstElementChild?.lastElementChild;
    DOMRight.appendChild(DOMBBookmark.cloneNode(true));
    DOMRight.appendChild(DOMBFolder.cloneNode(true));
    if (otherBookmarks.children !== undefined
        && otherBookmarks.children.length > 0
    ) {

        BTNToDOM(
            otherBookmarks,
            1,
            DOMObm,
            DOM.templateDir,
            DOM.templateItem,
            DOM.templateButtons
        );
    }

    DOM.fragment.appendChild(DOMBm);
    DOM.fragment.appendChild(DOMObm);
    DOM.main.appendChild(DOM.fragment);
}

function DOMMainOnclick(e) {
    var target = e.target;
    const DOMType = target.getAttribute(DOM_TYPE_ATTR);
    if (DOMType === DOM_BREMOVE_V || target.matches(DOM_BREMOVE_CH)) {
        e.preventDefault();
        console.info(DOM_BREMOVE_V);
        return;
    } else if (DOMType === DOM_BEDIT_V || target.matches(DOM_BEDIT_CH)) {
        console.info(DOM_BEDIT_V);
        e.preventDefault();
        return;
    } else if (DOMType === DOM_BFOLDER_V || target.matches(DOM_BFOLDER_CH)) {
        console.info(DOM_BFOLDER_V);
        e.preventDefault();
        return;
    } else if (DOMType === DOM_BBOOKMARK_V || target.matches(DOM_BBOOKMARK_CH)) {
        console.info(DOM_BBOOKMARK_V);
        e.preventDefault();
        return;
    } else if (DOMType === DOM_ITEMLINK_V) {
        e.preventDefault();
        let DOMItem = target.parentElement;
        let href = DOMItem.firstElementChild.getAttribute("href");
        openLink(href, e.ctrlKey);
    } else if (DOMType === DOM_DIRH_V) {
        e.preventDefault();
        var DOMDir = target.parentElement.parentElement;
        const open = DOMDir.getAttribute("data-open");
        if (open === "0") {
            DOMDir.setAttribute("data-open", "1");
        } else {
            DOMDir.setAttribute("data-open", "0");
        }
    }
}

var timeout = undefined;

function DOMMainOndragenter(e) {
    var target = e.target;
    const DOMType = target.getAttribute(DOM_TYPE_ATTR);
    var dragenter = "";
        if (DOMType === DOM_ITEMLINK_V) {
        var DOMItem = target.parentElement;
        dragenter = DOMItem.getAttribute("data-dragenter");
        if (dragenter === "0") {
            DOMItem.setAttribute("data-dragenter", "1");
        }
    } else if (DOMType === DOM_DIRH_V) {
        var DOMDir = target.parentElement.parentElement;
        dragenter = DOMDir.getAttribute("data-dragenter");
        if (dragenter === "0") {
            DOMDir.setAttribute("data-dragenter", "1");
        }
    }
}

function DOMMainOndragleave(e) {
    var target = e.target;
    var DOMType = target.getAttribute(DOM_TYPE_ATTR);
    var dragenter = "";
    if (DOMType === DOM_ITEMLINK_V) {
        var DOMItem = target.parentElement;
        dragenter = DOMItem.getAttribute("data-dragenter");
        if (dragenter === "1") {
            DOMItem.setAttribute("data-dragenter", "0");
        }
    } else if (DOMType === DOM_DIRH_V) {
        var DOMDir = target.parentElement.parentElement;
        dragenter = DOMDir.getAttribute("data-dragenter");
        if (dragenter === "1") {
            DOMDir.setAttribute("data-dragenter", "0");
        }
    }
}

function DOMButtonBookmarkOnclick() {
    TabOptions.url = "chrome://bookmarks/";
    TabOptions.active = true;
    chrome.tabs.create(TabOptions);
}

function DOMButtonMoreOnclick() {
    if (DOM.modalConfig === undefined) {
        console.error("DOM.modalConfig is undefined");
        return;
    }
    DOM.modalConfig.setAttribute("data-display", "1");
}

function DOMModalConfigOnclick(e) {
    var target = e.target;
    var domType = target.getAttribute(DOM_TYPE_ATTR);
    if (domType == DOM_MODAL_V
        || domType === DOM_BREMOVE_V
        || target.matches(DOM_BREMOVE_CH)
    ) {
        DOM.modalConfig?.setAttribute("data-display", "0");
    }
}

/**
@type {() => Promise<undefined> | never} */
async function main() {
    DOM.templateDir ??= document.getElementById("template_dir");
    if (DOM.templateDir === undefined) {
        panic("DOM.templateDir is undefined");
    }
    DOM.templateItem ??= document.getElementById("template_item");
    if (DOM.templateItem === undefined) {
        panic("DOM.templateItem is undefined");
    }
    DOM.templateButtons ??= document.getElementById("template_buttons");
    if (DOM.templateButtons === undefined) {
        panic("DOM.templateButtons is undefined");
    }
    DOM.buttonBookmark ??= document.getElementById("button_bookmark");
    if (DOM.buttonBookmark === undefined) {
        panic("DOM.buttonBookmark is undefined");
    }
    DOM.buttonMore ??= document.getElementById("button_more");
    if (DOM.buttonMore === undefined) {
        panic("DOM.buttonMore is undefined");
    }
    DOM.main ??= document.getElementById("main");
    if (DOM.main === undefined) {
        panic("DOM.main is undefined");
    }
    DOM.modalConfig ??= document.getElementById("modal_config");
    if (DOM.modalConfig === undefined) {
        panic("DOM.modalConfig is undefined");
    }
    DOM.modalEdit ??= document.getElementById("modal_edit");
    if (DOM.modalEdit === undefined) {
        panic("DOM.modalEdit is undefined");
    }

    CurrentTab = (
        await chrome.tabs.query({active: true, currentWindow: true})
    )[0];

    DOM.main.onclick = DOMMainOnclick;
    DOM.main.ondragenter = DOMMainOndragenter;
    DOM.main.ondragleave = DOMMainOndragleave;
    DOM.buttonBookmark.onclick = DOMButtonBookmarkOnclick;
    DOM.buttonMore.onclick = DOMButtonMoreOnclick;
    DOM.modalConfig.onclick = DOMModalConfigOnclick;

    chrome.bookmarks.getTree(mainGetTree);
}

window.addEventListener("DOMContentLoaded", main);

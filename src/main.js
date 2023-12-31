//@ts-check browser

const ATTR_DATA_FORM = "data-form";
const DATA_FORM_EDIT = "0";
const DATA_FORM_CREATE = "1";

const ATTR_DATA_TYPE = "data-type";
const DATA_TYPE_DIR = "0";
const DATA_TYPE_SUMMARY = "1";
const DATA_TYPE_ITEM = "2";
const DATA_TYPE_ITEMCONTENT = "3";
const DATA_TYPE_MODAL = "4";
const DATA_TYPE_BBOOKMARK = "5";
const DATA_TYPE_BFOLDER = "6";
const DATA_TYPE_BEDIT = "7";
const DATA_TYPE_BMORE = "8"
const DATA_TYPE_BSORT = "9";
const DATA_TYPE_BREMOVE = "10";
const DATA_TYPE_BOPEN = "11";
const DATA_TYPE_BOPENW = "12";
const DATA_TYPE_BOPENI = "13";

const ATTR_DATA_BUTTONS = "data-button";

const DATA_BUTTONS_HBOOKMARKS = "0";
const DATA_BUTTONS_HMORE = "1";
const DATA_BUTTONS_HCLOSE = "2";

const DATA_BUTTONS_MUNDO = "0";
const DATA_BUTTONS_MCLOSE = "1";

const PADDING_V = 10;

const DOM = {
    /**
    @type {HTMLTemplateElement | null}*/
    templateDir: null,
    /**
    @type {HTMLTemplateElement | null}*/
    templateItem: null,
    /**
    @type {HTMLTemplateElement | null}*/
    templateButtons: null,
    /**
    @type {HTMLDivElement | null}*/
    headerButtons: null,
    /**
    @type {HTMLDivElement | null} */
    messageUndo: null,
    /*
    @type {HTMLElement | null}*/
    main: null,
    /**
    @type {HTMLDivElement | null} */
    modal: null,
    /**
    @type {HTMLSelectElement | null} */
    modalConfigTheme: null,
    /**
    @type {HTMLSelectElement | null} */
    modalConfigOpen: null,
    /**
    @type {HTMLInputElement | null} */
    modalConfigFocus: null,
    /**
    @type {HTMLInputElement | null} */
    modalConfigFolders: null,
    /**
    @type {HTMLFormElement | null} */
    modalForm: null,
    /**
    @type {DocumentFragment}*/
    fragment: document.createDocumentFragment()
};

const StorageState = {
    focusTabs: false,
    foldersBefore: true,
    //open can be: "0" (current Tab) | "1" (new tab)
    open: "0",
    /**
    @type {"dark"|"light"}*/
    theme: "dark"
};


const ModalState = {
    id: "",
    target: null,
    type: "",
    depth: 0,
    parentId: "",
    formType: "",
};

function clearModalState() {
    ModalState.id = "";
    ModalState.target = null;
    ModalState.type = "";
    ModalState.depth = 0;
    ModalState.parentId = "";
    ModalState.formType = "";
}

const Changes = {
    title: "",
    url: ""
};

/**
@type {CreateDetails} */
const CreateOptions = {
    index: undefined,
    parentId: undefined,
    title: "",
    url: undefined,
};

function clearCreateOptions() {
    CreateOptions.index = undefined;
    CreateOptions.parentId = undefined;
    CreateOptions.title = "";
    CreateOptions.url = undefined;
}

const DeleteState = {
    /**
    @type {BookmarkTreeNode | null} */
    BTNode: null,
    /**
    @type {HTMLDivElement | null} */
    target: null,
    /**
    @type {maybe<number>} */
    timeout: undefined,
};
function clearDeleteState() {
    DeleteState.BTNode = null;
    DeleteState.target = null;
    DeleteState.timeout = undefined;
}

const SortState = {
    /**
    @type {HTMLDivElement | null}*/
    target: null,
    parentId: "",
};

const MoveOptions = {
    index: 0,
    parentId: ""
};

var DOMFocused = null;
var CurrentTab = undefined;

/**
@type {(message: string) => never}*/
const panic = function (message) {
    throw Error(message);
}

/**
@type {(items: StorageState) => undefined} */
function getStorage(items) {
    var open = items.open;
    var focusTabs = items.focusTabs;
    var foldersBefore = items.foldersBefore;
    var theme = items.theme;
    var set = false;
    if (open === undefined) {
        set = true;
    } else {
        StorageState.open = open;
        DOM.modalConfigOpen.value = open;
    }
    if (focusTabs === undefined) {
        set = true;
    } else {
        StorageState.focusTabs = focusTabs;
        DOM.modalConfigFocus.checked = focusTabs;
    }
    if (foldersBefore === undefined) {
        set = true;
    } else {
        StorageState.folderBefore = foldersBefore;
        DOM.modalConfigFolders.checked = foldersBefore;
    }
    if (theme === undefined) {
        set = true;
    } else {
        StorageState.theme = theme;
        document.firstElementChild?.setAttribute("class", theme);
    }
    if (set) {
        chrome.storage.local.set(StorageState, undefined);
    }
}

const TabOptions = {active: false, url: ""};
/**
@type {(url: string, ctrl: boolean) => undefined}*/
const openLink = function (url, ctrl) {
    TabOptions.url = url;
    TabOptions.active = StorageState.focusTabs;
    if ((StorageState.open === "0") === !ctrl) {
        chrome.tabs.update(CurrentTab.id, TabOptions, undefined);
    } else {
        chrome.tabs.create(TabOptions, undefined);
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
    arr: Array<BookmarkTreeNode>,
    fst: number,
    lst: number,
    p: number
) => number}*/
function partition(arr, fst, lst, p) {
    var temp = arr[p];
    arr[p] = arr[lst];
    arr[lst] = temp;
    let l = 0;
    for (let i = fst; i < lst; i += 1) {
        if (arr[i].title.localeCompare(arr[lst].title) < 0) {
            //swap
            temp = arr[l + fst];
            arr[l+ fst] = arr[i];
            arr[i] = temp;
            l += 1;
        }
    }
    temp = arr[l + fst];
    arr[l + fst] = arr[lst];
    arr[lst] = temp;
    return l + fst;
}

/**
@type {(
    a: Array<BookmarkTreeNode>,
    fst: number,
    lst: number
) => Array<BookmarkTreeNode>} */
function quickSort(a, fst, lst) {
    if (lst - fst < 1) {
        return a;
    }
    let q = [fst, lst]; /*queue*/
    let ri = 0;
    let p = 0;
    while (q.length > 0) {
        fst = q.shift();
        lst = q.shift();
        ri = Math.floor(Math.random() * (lst - fst) + fst);
        p = partition(a, fst, lst, ri);
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
@type {(BTChildren: Array<BookmarkTreeNode>) => Array<BookmarkTreeNode>} */
function sort(BTChildren) {
    let dirTail = 0;
    if (StorageState.foldersBefore) {
        for (let i = 0; i < BTChildren.length; i += 1) {
            let BTNode = BTChildren[i];
            if (BTNode.url === undefined) {
                if (i !== dirTail) {
                    let temp = BTChildren[dirTail];
                    BTChildren[dirTail] = BTNode;
                    BTChildren[i] = temp;
                }
                dirTail += 1;
            }
        }
        quickSort(BTChildren, 0, dirTail - 1);
        quickSort(BTChildren, dirTail, BTChildren.length - 1);
    } else {
        quickSort(BTChildren, 0, BTChildren.length - 1)
    }
    return BTChildren;
}


/**
@type {<Node extends {title: string, id: string}>(
    BTNode: Node,
    depth: number,
    DOMTemplateDir: HTMLTemplateElement,
    DOMTemplateButtons: maybe<HTMLTemplateElement>
) => HTMLDivElement}*/
const createDOMDir = function (
    BTNode,
    depth,
    DOMTemplateDir,
    DOMTemplateButtons
) {
    var DOMDirClone = DOMTemplateDir.content.cloneNode(true);
    var DOMDir = DOMDirClone.firstElementChild
    DOMDir.setAttribute("data-id", BTNode.id);
    DOMDir.setAttribute("data-depth", String(depth));
    DOMDir.setAttribute("title", BTNode.title);

    var DOMDirHeader = DOMDir.firstElementChild;
    var DOMDirButton = DOMDirHeader.firstElementChild;

    DOMDirButton.style.setProperty(
        "padding-left",
        `${depth * PADDING_V}px`
    );

    var DOMDirTitle = DOMDirButton.lastElementChild;
    DOMDirTitle.textContent = BTNode.title;

    if (DOMTemplateButtons !== undefined) {
        var DOMButtons = DOMTemplateButtons.content.cloneNode(true).children;

        var DOMBBookmark = DOMButtons[0];
        var DOMBFolder = DOMButtons[1];
        var DOMBEdit = DOMButtons[2];
        var DOMBMore = DOMButtons[3];
        var DOMBSort = DOMButtons[4];
        var DOMBRemove = DOMButtons[5];
        var DOMBOpen = DOMButtons[6];
        var DOMBOpenw = DOMButtons[7];
        var DOMBOpeni = DOMButtons[8];

        var DOMRight = DOMDirHeader.children[1];
        var DOMMore = DOMDirHeader.children[2];

        DOMRight.appendChild(DOMBBookmark);
        DOMRight.appendChild(DOMBFolder);
        DOMRight.appendChild(DOMBEdit);
        DOMRight.appendChild(DOMBMore);

        DOMBSort.insertAdjacentText("beforeend", "Sort A-Z");
        DOMBRemove.insertAdjacentText("beforeend", "Remove folder");
        DOMMore.appendChild(DOMBOpen);
        DOMMore.appendChild(DOMBOpenw);
        DOMMore.appendChild(DOMBOpeni);
        DOMMore.appendChild(DOMBSort);
        DOMMore.appendChild(DOMBRemove);
    }
    return DOMDir;
}

/**
@type {(DOMDir: HTMLDivElement, title: string) => undefined} */
function updateDOMDir(DOMDir, title) {
    const DOMDirTitle = (
        DOMDir.firstElementChild.firstElementChild.lastElementChild
    );
    DOMDirTitle.textContent = title;
}


/**
@type {<Node extends {title: string, id: string}>(
    BTNode: Node,
    depth: number,
    DOMTemplateItem: HTMLTemplateElement,
    DOMTemplateButtons: maybe<HTMLTemplateElement>
) => HTMLAnchorElement | never}*/
function createDOMItem(BTNode, depth, DOMTemplateItem, DOMTemplateButtons) {
    if (BTNode.url === undefined) {
        panic("BookmarkTreeNode.url is undefined");
    }

    var DOMItemClone = DOMTemplateItem.content.cloneNode(true);
    var DOMItem = DOMItemClone.firstElementChild;
    DOMItem.setAttribute("data-id", BTNode.id);
    DOMItem.setAttribute("data-depth", String(depth));
    DOMItem.setAttribute("title", `${BTNode.title}\n${BTNode.url}`);

    var DOMItemContent = DOMItem.firstElementChild;
    DOMItemContent.setAttribute("href", BTNode.url);
    DOMItemContent.style.setProperty(
        "padding-left",
        `${depth * PADDING_V}px`
    );
    var DOMItemImg = DOMItemContent.children[0];


    DOMItemImg.setAttribute("src", getFavicon(BTNode.url));

    var DOMItemTitle = DOMItemContent.children[1];
    DOMItemTitle.textContent = BTNode.title;

    if (DOMTemplateButtons !== undefined) {
        var DOMRight = DOMItem.lastElementChild;
        var DOMButtons = DOMTemplateButtons.content.children;
        var DOMBEdit = DOMButtons[2].cloneNode(true);
        var DOMBRemove = DOMButtons[5].cloneNode(true);
        DOMBRemove.classList.add("c_center-children");
        DOMRight.appendChild(DOMBEdit);
        DOMRight.appendChild(DOMBRemove);
    }

    return DOMItem;
}

/**
@type {(DOMItem: HTMLDivElement, title: string, url: string) => undefined} */
function updateDOMItem(DOMItem, title, url) {
    const DOMItemA = DOMItem.firstElementChild;
    DOMItemA.setAttribute("href", url);
    DOMItemA.lastElementChild.textContent = title;
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
    var DOMButtons = DOM.templateButtons.content.children;
    var DOMBBookmark = DOMButtons[0];
    var DOMBFolder = DOMButtons[1];
    var DOMBSort = DOMButtons[4];

    //Bookmarks
    var child = children[0];
    var DOMRoot = createDOMDir(child, 1, DOM.templateDir, undefined);
    var DOMRight = DOMRoot.firstElementChild.children[1];
    var CloneDOMBSort = DOMBSort.cloneNode(true);

    DOMRoot.setAttribute("open", "true");

    CloneDOMBSort.classList.add("c_center-children");

    DOMRight.appendChild(DOMBBookmark.cloneNode(true));
    DOMRight.appendChild(DOMBFolder.cloneNode(true));
    DOMRight.appendChild(CloneDOMBSort);

    if (child.children !== undefined
        && child.children.length > 0
    ) {
        BTNToDOM(
            child,
            1,
            DOMRoot,
            DOM.templateDir,
            DOM.templateItem,
            DOM.templateButtons
        );
    }
    DOM.fragment.appendChild(DOMRoot);

    //Other booksmarks
    child = children[1];
    DOMRoot = createDOMDir(child, 1, DOM.templateDir, undefined);
    DOMRight = DOMRoot.firstElementChild.children[1];
    CloneDOMBSort = DOMBSort.cloneNode(true);

    CloneDOMBSort.classList.add("c_center-children");

    DOMRight.appendChild(DOMBBookmark.cloneNode(true));
    DOMRight.appendChild(DOMBFolder.cloneNode(true));
    DOMRight.appendChild(CloneDOMBSort);

    if (child.children !== undefined
        && child.children.length > 0
    ) {
        BTNToDOM(
            child,
            1,
            DOMRoot,
            DOM.templateDir,
            DOM.templateItem,
            DOM.templateButtons
        );
    }
    DOM.fragment.appendChild(DOMRoot);

    DOM.main.appendChild(DOM.fragment);
}

/**
@type {(e: MouseEvent) => undefined} */
function DOMHeaderButtonsOnclick(e) {
    var target = e.target;
    var ButtonType = target.getAttribute(ATTR_DATA_BUTTONS);
    if (ButtonType === null) {
        panic("ButtonType is null");
    }
    if (ButtonType === DATA_BUTTONS_HBOOKMARKS) {
        TabOptions.url = "about://bookmarks/";
        TabOptions.active = true;
        chrome.tabs.create(TabOptions, undefined);
    } else if (ButtonType === DATA_BUTTONS_HMORE) {
        DOM.modal.setAttribute("data-display", "1");
        DOM.modal.setAttribute("data-show", "0");
        DOM.modal.firstElementChild.children[1].lastElementChild.focus();
        DOMFocused = target;
    } else if (ButtonType === DATA_BUTTONS_HCLOSE) {
        window.close();
    }
}

/**
BFTraversal
@type {(root: BookmarkTreeNode, DOMElement: HTMLDivElement) => Promise<undefined>} */
async function undoDirRemoved(root, DOMElement) {
    var DOMRoot = DOMElement;
    var DOMDirs = [DOMElement];
    var ParentIds = [];
    var dirIds = [];
    var queue = [];
    /**
    @type {BookmarkTreeNode} */
    var u = root;

    CreateOptions.url = u.url;
    CreateOptions.index = u.index;
    CreateOptions.title = u.title;
    CreateOptions.parentId = u.parentId;

    var BTNode = await chrome.bookmarks.create(CreateOptions, undefined);
    DOMElement.setAttribute("data-id", BTNode.id);

    if (u.children.length > 0) {
        ParentIds.push(BTNode.id);
        Array.prototype.push.apply(queue, u.children);
    }

    while (queue.length > 0) {
        u = queue.shift();
        if (u.index === undefined) {
            panic("BookmarkTreeNode.index is undefined");
        }

        var isDir = u.children !== undefined;
        if (!isDir && dirIds.length > 0 && dirIds[0] === u.id) {
            DOMDirs.shift();
            dirIds.shift();
            ParentIds.shift();
        }

        CreateOptions.url = u.url;
        CreateOptions.index = u.index;
        CreateOptions.title = u.title;
        CreateOptions.parentId = ParentIds[0];

        var BTNode = await chrome.bookmarks.create(CreateOptions, undefined);
        DOMElement = DOMDirs[0].children[u.index + 1];
        DOMElement.setAttribute("data-id", BTNode.id);

        if (isDir && u.children.length > 0) {
            DOMDirs.push(DOMElement);
            ParentIds.push(BTNode.id);
            dirIds.push(u.children[0].id);
            Array.prototype.push.apply(queue, u.children);
        }
    }

    DOM.messageUndo.setAttribute("data-display", "0");
    DOMRoot.setAttribute("data-display", "1");
    clearDeleteState();
}

/**
@type {(BTNode: BookmarkTreeNode) => undefined} */
function undoItemRemoved(BTNode) {
    if (BTNode === undefined) {
        return;
    }
    DeleteState.target.setAttribute("data-id", BTNode.id);
    DeleteState.target.setAttribute("data-display", "1");

    DOM.messageUndo.setAttribute("data-display", "0");

    clearDeleteState();
}

function undo() {
    if (DeleteState.timeout === undefined) {
        console.warn("The undo action cannot be completed. The element was deleted");
        clearDeleteState();
        return;
    }
    clearTimeout(DeleteState.timeout);
    if (DeleteState.target === null) {
        panic("DeleteState.target is null");
    }
    var BTNode = DeleteState.BTNode;
    if (BTNode === null) {
        panic("DelteState.BTNode is null");
    }
    if (BTNode.children === undefined) {
        CreateOptions.parentId = BTNode.parentId;
        CreateOptions.url = BTNode.url;
        CreateOptions.index = BTNode.index;
        CreateOptions.title = BTNode.title;
        chrome.bookmarks.create(CreateOptions, undoItemRemoved);
    } else {
        undoDirRemoved(BTNode, DeleteState.target);
    }
}

/**
@type {(e: MouseEvent) => undefined} */
function DOMMessageUndoOnclick(e) {
    var target = e.target;
    var buttonType = target.getAttribute(ATTR_DATA_BUTTONS);

    if (buttonType === DATA_BUTTONS_MCLOSE) {
        clearTimeout(DeleteState.timeout);
        DeleteState.target.remove();
        DOM.messageUndo.setAttribute("data-display", "0");
        clearDeleteState();

    } else if (buttonType === DATA_BUTTONS_MUNDO) {
        undo();
        if (DOMFocused !== null) {
            DOMFocused.focus();
            DOMFocused = null;
        }
    }
}

/**
@type {(target: HTMLDivElement) => undefined} */
function removeBTNode(target) {
    target.remove();
    DOM.messageUndo.setAttribute("data-display", "0");
    clearDeleteState();
}

/**
@type {(data: Array<BookmarkTreeNode>) => undefined} */
function futureRemove(data) {
    if (data.length === 0) {
        if (DeleteState.target !== null) {
            DeleteState.target.remove();
        }
        clearDeleteState();
        return;
    }
    var BTNode = data[0];
    DeleteState.BTNode = BTNode;

    DOM.messageUndo.setAttribute("data-display", "1");
    DOM.messageUndo?.lastElementChild?.firstElementChild.focus();

    var DOMMessageUChildren = DOM.messageUndo.children;
    DOMMessageUChildren[0].textContent = BTNode.title;
    DOMMessageUChildren[1].textContent = "removed";

    if (BTNode.url === undefined) {
        //is a DIR
        chrome.bookmarks.removeTree(BTNode.id, undefined);
    } else {
        //is a Item
        chrome.bookmarks.remove(BTNode.id, undefined);
    }

    DeleteState.timeout = setTimeout(
        removeBTNode,
        2000,
        DeleteState.target,
    );
}

/**
@type {(target: HTMLButtonElement) => undefined} */
function DOMBRemoveOnclick(target) {
    if (DeleteState.timeout !== undefined) {
        clearTimeout(DeleteState.timeout);
        DeleteState.target.remove();
    }

    var DOMRight = target.parentElement;
    var DOMType = DOMRight.getAttribute("data-parent");
    var id = "";

    if (DOMType === DATA_TYPE_DIR) {
        var DOMDir = DOMRight.parentElement.parentElement;
        DOMDir.setAttribute("data-display", "0");
        id = DOMDir.getAttribute("data-id");
        DeleteState.target = DOMDir;
        chrome.bookmarks.getSubTree(id, futureRemove);

    } else /*must be DATA_TYPE_ITEM */ {
        var DOMItem = DOMRight.parentElement;
        DOMItem.setAttribute("data-display", "0");
        id = DOMItem.getAttribute("data-id");
        DeleteState.target = DOMItem;
        chrome.bookmarks.get(id, futureRemove);
    }
}

/**
@type {(result: Array<BookmarkTreeNode>) => undefined} */
function setDOMFormEdit(result) {
    var DOMForm = DOM.modalForm;
    if (result.length === 0) {
        panic("What the fuck, data is empty");
    }
    var bookmark = result[0];

    if (bookmark.title !== undefined) {
        DOMForm[0].value = bookmark.title;
    }
    if (bookmark.url !== undefined) {
        DOMForm[1].value = bookmark.url;
    }

    DOM.modal.setAttribute("data-display", "1");
    DOM.modal.setAttribute("data-show", "1");

    DOMForm[0].focus();

}

/**
@type {(target: HTMLButtonElement) => undefined | never} */
function DOMBEditOnclick(target) {
    var DOMModalEdit = DOM.modal.children[1];
    var DOMRight = target.parentElement;
    var DOMType = DOMRight.getAttribute("data-parent");
    var id = "";
    ModalState.formType = DATA_FORM_EDIT;
    if (DOMType === DATA_TYPE_DIR) {
        let DOMModalEditTitle = (
            DOMModalEdit.firstElementChild.firstElementChild
        );
        DOMModalEditTitle.textContent = "Edit folder";
        let DOMDir = DOMRight.parentElement.parentElement;
        ModalState.target = DOMDir;
        let dataid = DOMDir.getAttribute("data-id");
        if (dataid !== null) {
            id = dataid;
        }
    } else /*must be DATA_TYPE_ITEM */ {
        let DOMModalEditTitle = (
            DOMModalEdit.firstElementChild.firstElementChild
        );
        DOMModalEditTitle.textContent = "Edit bookmark";
        let DOMItem = DOMRight.parentElement;
        ModalState.target = DOMItem;
        let dataid = DOMItem.getAttribute("data-id");
        if (dataid !== null) {
            id = dataid;
        }
    }

    if (id.length === 0) {
        panic("id is empty");
    }

    ModalState.id = id;
    ModalState.type = DOMType;

    DOMModalEdit.setAttribute("data-edit", DOMType);
    chrome.bookmarks.get(id, setDOMFormEdit);
}

/**
@type {(
    target: HTMLButtonElement,
    DOMType: "0" | "2",
    ctrKey: boolean
) => undefined | never} */
function createOptionsOnclick(DOMDir, DOMType, ctrKey) {
    var DOMForm = DOM.modalForm;
    var id = DOMDir.getAttribute("data-id");
    if (id === null) {
        panic("id is null");
    }
    ModalState.parentId = id;
    ModalState.formType = DATA_FORM_CREATE;
    ModalState.target = DOMDir;

    ModalState.depth = Number(DOMDir.getAttribute("data-depth"));

    var DOMModalCreateOptions = DOM.modal.children[1];
    DOMModalCreateOptions.setAttribute("data-edit", DOMType);

    if (DOMType === DATA_TYPE_DIR) {
        DOMModalCreateOptions
            .firstElementChild
            .firstElementChild
            .textContent = "CreateOptions folder";
    } else {
        if (!ctrKey) {
            DOMForm[0].value = CurrentTab.title;
            DOMForm[1].value = CurrentTab.url;
        }
        DOMModalCreateOptions
            .firstElementChild
            .firstElementChild
            .textContent = "CreateOptions bookmark";
    }

    DOM.modal.setAttribute("data-display", "1");
    DOM.modal.setAttribute("data-show", "1");
    DOMForm[0].focus();
}

/**
@type {(BTChildren: Array<BookmarkTreeNode>) => Promise<undefined | never>} */
async function getChildrenSort(BTChildren) {
    sort(BTChildren);
    if (SortState.target === null) {
        panic("SortState.target is null");
    }
    const DOMChildren = SortState.target.children;
    const DOMCSorted = [DOMChildren[0]];
    for (let i = 0; i < BTChildren.length; i += 1) {
        var BTNode = BTChildren[i];
        MoveOptions.index = i;
        MoveOptions.parentId = SortState.parentId;
        await chrome.bookmarks.move(BTNode.id, MoveOptions);
        DOMCSorted.push(DOMChildren[BTNode.index + 1]);
    }
    Element.prototype.replaceChildren.apply(
        SortState.target,
        DOMCSorted
    );
    SortState.target = null;
    SortState.parentId = "";
}


/**
@type {(DOMDir: HTMLDivElement) => undefined} */
function DOMBSortOnclick(DOMDir) {
    let id = DOMDir.getAttribute("data-id");
    if (id === null) {
        panic("data-id is null");
    }
    SortState.target = DOMDir;
    SortState.parentId = id;
    chrome.bookmarks.getChildren(id, getChildrenSort);
}

/**
@type {(data: Array<BookmarkTreeNode>) => undefined}*/
function DOMBOpenOnclick(data) {
    if (data === undefined || data.length === 0) {
        return;
    }
    TabOptions.active = false;
    for (let i = 0; i < data.length; i += 1) {
        var BTNode = data[i];
        if (BTNode.url !== undefined) {
            TabOptions.url = BTNode.url;
            chrome.tabs.create(TabOptions);
        }
    }
}

const WindowOptions = {
    incognito: false,
    url: [],
    setSelfAsOpener: false,
};
/**
@type {(data: Array<BookmarkTreeNode>) => undefined}*/
function DOMBOpenWOnclick(data) {
    if (data === undefined || data.length === 0) {
        return;
    }
    WindowOptions.url.length = 0;

    for (let i = 0; i < data.length; i += 1) {
        var BTNode = data[i];
        if (BTNode.url !== undefined) {
            WindowOptions.url.push(BTNode.url);
        }
    }
    chrome.windows.create(WindowOptions);
}

/**
@type {(e: MouseEvent) => undefined} */
function DOMMainOnclick(e) {
    var target = e.target;
    const DOMType = target.getAttribute(ATTR_DATA_TYPE);
    if (DOMType === DATA_TYPE_BREMOVE) {
        e.preventDefault();
        DOMBRemoveOnclick(target);
    } else if (DOMType === DATA_TYPE_BSORT) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        DOMBSortOnclick(DOMDir);
    } else if (DOMType === DATA_TYPE_BOPEN) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        let id = DOMDir.getAttribute("data-id");
        chrome.bookmarks.getChildren(id, DOMBOpenOnclick);
    } else if (DOMType === DATA_TYPE_BOPENW) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        let id = DOMDir.getAttribute("data-id");
        WindowOptions.incognito = false;
        chrome.bookmarks.getChildren(id, DOMBOpenWOnclick);
    } else if (DOMType === DATA_TYPE_BOPENI) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        let id = DOMDir.getAttribute("data-id");
        WindowOptions.incognito = true;
        chrome.bookmarks.getChildren(id, DOMBOpenWOnclick);
    } else if (DOMType === DATA_TYPE_BEDIT) {
        e.preventDefault();
        DOMBEditOnclick(target);
    } else if (DOMType === DATA_TYPE_BFOLDER) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        createOptionsOnclick(DOMDir, DATA_TYPE_DIR, false);
    } else if (DOMType === DATA_TYPE_BBOOKMARK) {
        e.preventDefault();
        let DOMDir = target.parentElement.parentElement.parentElement;
        createOptionsOnclick(DOMDir, DATA_TYPE_ITEM, e.ctrlKey);
    } else if (DOMType === DATA_TYPE_ITEMCONTENT) {
        if (!e.shiftKey) {
            e.preventDefault();
            var href = target.getAttribute("href");
            openLink(href, e.ctrlKey);
        }
    }
}

/**
@type {(e: KeyboardEvent) => undefined} */
function DOMMainOnkeydown(e) {
    var target = e.target;
    var DOMTarget;
    var type = target.getAttribute(ATTR_DATA_TYPE);
    if (type === DATA_TYPE_SUMMARY) {
        if (e.code === "KeyQ") {
            DOMFocused = target;
            DOMTarget = target?.lastElementChild?.lastElementChild;
            if (DOMTarget !== null || DOMTarget !== undefined) {
                DOMBRemoveOnclick(DOMTarget);
            }
        } else if (e.code === "KeyE") {
            DOMFocused = target;
            DOMTarget = target?.children[1]?.children[2];
            if (DOMTarget.getAttribute(ATTR_DATA_TYPE) === DATA_TYPE_BEDIT) {
                DOMBEditOnclick(DOMTarget);
            }
        } else if (e.code === "KeyC") {
            e.preventDefault();
            DOMFocused = target;
            let DOMDir = target.parentElement;
            createOptionsOnclick(DOMDir, DATA_TYPE_DIR, false);
        } else if (e.code === "KeyA") {
            e.preventDefault();
            DOMFocused = target;
            let DOMDir = target.parentElement;
            createOptionsOnclick(DOMDir, DATA_TYPE_ITEM, e.ctrlKey);
        } else if (e.code === "KeyS") {
            DOMBSortOnclick(target.parentElement);
        } else if (e.code === "KeyO") {
            let id = target.parentElement.getAttribute("data-id");
            if (id === "1" || id === "2") {
                return;
            }
            if (e.shiftKey) {
                WindowOptions.incognito = false;
                chrome.bookmarks.getChildren(id, DOMBOpenWOnclick);
            } else {
                chrome.bookmarks.getChildren(id, DOMBOpenOnclick);
            }
        }
    } else if (type === DATA_TYPE_ITEMCONTENT) {
        if (e.code === "KeyQ") {
            DOMFocused = target;
            DOMBRemoveOnclick(target?.nextElementSibling?.lastElementChild);
        } else if (e.code === "KeyE") {
            DOMFocused = target;
            DOMBEditOnclick(target?.nextElementSibling?.firstElementChild);
        }
    }

}

/**
@type {(e: MouseEvent) => undefined} */
function DOMMainOnauxclick(e) {
    var target = e.target;
    var DOMType = target.getAttribute(ATTR_DATA_TYPE);
    if (DOMType === DATA_TYPE_ITEMCONTENT) {
        e.preventDefault();
        var href = target.getAttribute("href");
        TabOptions.url = href;
        TabOptions.active = StorageState.focusTabs;
        chrome.tabs.create(TabOptions, undefined);
    }
}

/**
@type {(e: PointerEvent) => undefined} */
function DOMMainOnpointerover(e) {
    var target = e.target;
    var DOMType = target.getAttribute(ATTR_DATA_TYPE);
    if (DOMType === DATA_TYPE_BMORE) {
        var DOMDir = target.parentElement.parentElement.parentElement;
        var DOMMore = target.parentElement.nextElementSibling;
        var top = (
            DOM.main.offsetHeight
            + DOM.main.scrollTop
            - (
                DOMMore.offsetHeight
                + target.parentElement.parentElement.offsetHeight //DirHeader
            )
        );
        if (top < DOMDir.offsetTop) {
            DOMMore.style.setProperty("top", "unset");
            DOMMore.style.setProperty("bottom", "30px");
        } else {
            DOMMore.style.setProperty("top", "30px");
            DOMMore.style.setProperty("bottom", "unset");
        }
    }
}

/**
@type {() => undefined} */
function closeDOMModal() {
    var show = DOM.modal.getAttribute("data-show");
    if (show === "1") {
        if (ModalState.formType === DATA_FORM_CREATE) {
            clearCreateOptions();
        }
        clearModalState();

        var DOMModalEdit = DOM.modal.children[1];
        DOMModalEdit.setAttribute("data-edit", "");

        var DOMForm = DOM.modalForm;
        DOMForm[0].value = "";
        DOMForm[1].value = "";
        DOM.modal.setAttribute("data-display", "0");
        DOM.modal.setAttribute("data-show", "");
    }
    DOM.modal.setAttribute("data-display", "0");
    DOM.modal.setAttribute("data-show", "");
}

/**
@type {(e: MouseEvent) => undefined} */
function DOMModalOnclick(e) {
    var target = e.target;
    var domType = target.getAttribute(ATTR_DATA_TYPE);
    if (domType == DATA_TYPE_MODAL || domType === DATA_TYPE_BREMOVE) {
        closeDOMModal();
    }
}

/**
@type {(e: KeyboardEvent) => undefined} */
function DOMModalOnkeydown(e) {
    if (e.code === "Escape") {
        e.preventDefault();
        closeDOMModal();
        if (DOMFocused !== null) {
            DOMFocused.focus();
            DOMFocused = null;
        }
    }
}

/**
@type {(result: BookmarkTreeNode) => undefined} */
function updateBookmarkTN(result) {
    if (result === undefined) {
        return;
    }
    if (ModalState.target === null) {
        panic("ModalState.target is null");
    }
    if (result.url === undefined) {
        updateDOMDir(ModalState.target, result.title);
    } else {
        updateDOMItem(ModalState.target, result.title, result.url);
    }
    clearModalState();
}

const BMNode = {
    id: "",
    title: "",
    url: "",
};

function clearBMNode() {
    BMNode.id = "";
    BMNode.title = "";
    BMNode.url = "";
}

/**
@type {(result: BookmarkTreeNode) => undefined} */
function createBookmarkTN(result) {
    if (result === undefined) {
        return;
    }
    if (ModalState.target === null) {
        panic("ModalState.target is null");
    }
    var DOMElement;
    BMNode.id = result.id;
    BMNode.title = result.title;
    if (result.url === undefined) {
        DOMElement = createDOMDir(
            BMNode,
            ModalState.depth + 1,
            DOM.templateDir,
            DOM.templateButtons
        );
    } else {
        BMNode.url = result.url;
        DOMElement = createDOMItem(
            BMNode,
            ModalState.depth + 1,
            DOM.templateItem,
            DOM.templateButtons
        );
    }
    ModalState.target.appendChild(DOMElement);
    clearCreateOptions();
    clearModalState();
}

/**
@type {(e: SubmitEvent) => undefined | never} */
function DOMModalFormOnsubmit(e) {
    e.preventDefault();
    var DOMForm = DOM.modalForm;
    var DOMModal = DOM.modal?.children[1];
    var title = DOMForm[0].value;
    if (ModalState.formType === DATA_FORM_EDIT) {
        Changes.title = title;
        if (ModalState.type === DATA_TYPE_DIR) {
            Changes.url = "";
        } else{
            var url = DOMForm[1].value;
            Changes.url = url;
        }
        chrome.bookmarks.update(ModalState.id, Changes, updateBookmarkTN);
    } else {
        CreateOptions.parentId = ModalState.parentId;
        CreateOptions.title = title;
        if (ModalState.type === DATA_TYPE_DIR) {
            CreateOptions.url = undefined;
        } else {
            var url = DOMForm[1].value;
            CreateOptions.url = url;
        }
        chrome.bookmarks.create(CreateOptions, createBookmarkTN);
    }

    DOMModal.setAttribute("data-edit", "");

    DOMForm[0].value = "";
    DOMForm[1].value = "";
    DOM.modal.setAttribute("data-display", "0");
    DOM.modal.setAttribute("data-show", "");

    if (DOMFocused !== null) {
        DOMFocused.focus();
        DOMFocused = null;
    }
}

/**
@type {(e: Event) => undefined} */
function DOMModalConfigThemeOnchange(e) {
    var target = e.currentTarget;
    StorageState.theme = target.value;
    document.firstElementChild?.setAttribute("class", target.value);
    chrome.storage.local.set(StorageState, undefined);
}

/**
@type {(e: Event) => undefined} */
function DOMModalConfigOpenOnchange(e) {
    var target = e.currentTarget;
    StorageState.open = target.value;
    chrome.storage.local.set(StorageState, undefined);
}

/**
@type {(e: Event) => undefined} */
function DOMModalConfigFocusOnchange(e) {
    var target = e.currentTarget;
    StorageState.focusTabs = target.checked;
    chrome.storage.local.set(StorageState, undefined);
}

/**
@type {(e: Event) => undefined} */
function DOMModalConfigFoldersOnchange(e) {
    var target = e.currentTarget;
    StorageState.foldersBefore = target.checked;
    chrome.storage.local.set(StorageState, undefined);
}

/**
@type {(data: Array<Tab>) => undefined} */
function futureMain(data) {
    CurrentTab = data[0];

    DOM.headerButtons.onclick = DOMHeaderButtonsOnclick;
    DOM.messageUndo.lastElementChild.onclick = DOMMessageUndoOnclick;
    DOM.main.onclick = DOMMainOnclick;
    DOM.main.onauxclick = DOMMainOnauxclick;
    DOM.main.onpointerover = DOMMainOnpointerover;
    DOM.main.onkeydown = DOMMainOnkeydown;

    DOM.modalConfigTheme.onchange = DOMModalConfigThemeOnchange;
    DOM.modalConfigOpen.onchange = DOMModalConfigOpenOnchange;
    DOM.modalConfigFocus.onchange = DOMModalConfigFocusOnchange;
    DOM.modalConfigFolders.onchange = DOMModalConfigFoldersOnchange;

    DOM.modal.onclick = DOMModalOnclick;
    DOM.modal.onkeydown = DOMModalOnkeydown;
    DOM.modalForm.onsubmit = DOMModalFormOnsubmit;

    chrome.bookmarks.getTree(mainGetTree);
}

/**
@type {() => undefined | never} */
function main() {
    DOM.templateDir = document.getElementById("template_dir");
    if (DOM.templateDir === null) {
        panic("DOM.templateDir is null");
    }
    DOM.templateItem = document.getElementById("template_item");
    if (DOM.templateItem === null) {
        panic("DOM.templateItem is null");
    }
    DOM.templateButtons = document.getElementById("template_buttons");
    if (DOM.templateButtons === null) {
        panic("DOM.templateButtons is null");
    }
    DOM.headerButtons = document.getElementById("header_buttons");
    if (DOM.headerButtons === null) {
        panic("DOM.headerButtons is null");
    }
    DOM.messageUndo = document.getElementById("message_undo");
    if (DOM.messageUndo === null) {
        panic("DOM.messageUndo is null");
    }
    DOM.main = document.getElementById("main");
    if (DOM.main === null) {
        panic("DOM.main is null");
    }
    DOM.modal = document.getElementById("modal");
    if (DOM.modal === null) {
        panic("DOM.modal is null");
    }
    DOM.modalForm = document.getElementById("modal_form");
    if (DOM.modalForm === null) {
        panic("DOM.modalForm is null");
    }
    DOM.modalConfigTheme = document.getElementById("modal_config-theme");
    if (DOM.modalConfigTheme === null) {
        panic("DOM.modalConfigTheme is null");
    }
    DOM.modalConfigOpen = document.getElementById("modal_config-open");
    if (DOM.modalConfigOpen === null) {
        panic("DOM.modalConfigOpen is null");
    }
    DOM.modalConfigFocus = document.getElementById("modal_config-focus");
    if (DOM.modalConfigFocus === null) {
        panic("DOM.modalConfigFocus is null");
    }
    DOM.modalConfigFolders = document.getElementById("modal_config-folders");
    if (DOM.modalConfigFolders === null) {
        panic("DOM.modalConfigFolders is null");
    }

    chrome.storage.local.get(undefined, getStorage);
    chrome.tabs.query({active: true, currentWindow: true}, futureMain);
}
window.addEventListener("DOMContentLoaded", main);

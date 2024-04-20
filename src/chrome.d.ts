declare namespace ChromeExtensionAPI {

//extensionType
//https://developer.chrome.com/docs/extensions/reference/api/extensionType

//Author: axarisar
//Date: 12/04/2024

//The origin of injected CSS.
type CSSOrigin = (
    "author"
    | "user"
)

//Details of the CSS to remove. Either the code or the file property must be
//set, but both may not be set at the same time.
type DeleteInjectionDetails = {
    //If allFrames is true, implies that the CSS should be removed from all
    //frames of current page. By default, it's false and is only removed from
    //the top frame. If true and frameId is set, then the code is removed from
    //the selected frame and all of its child frames.
    allFrames: undefined | boolean,

    //CSS code to remove.
    code: undefined | string,

    //The origin of the CSS to remove. Defaults to "author".
    cssOrigin: undefined | CSSOrigin,

    //CSS file to remove.
    file: undefined | string,

    //The frame from where the CSS should be removed. Defaults to 0 (the
    //top-level frame).
    frameId: undefined | number,

    //If matchAboutBlank is true, then the code is also removed from
    //about:blank and about:srcdoc frames if your extension has access to its
    //parent document. By default it is false.
    matchAboutBlank: undefined | boolean
}

type DocumentLifecycle = (
    "prerender"
    | "active"
    | "cached"
    | "pending_deletion"
)

type FrameType = (
    "outermost_frame"
    | "fenced_frame"
    | "sub_frame"
)

type ImageDetails = {
    //The format of the resulting image. Default is "jpeg".
    format: undefined | ImageFormat,

    //When format is "jpeg", controls the quality of the resulting image. This
    //value is ignored for PNG images. As quality is decreased, the resulting
    //image will have more visual artifacts, and the number of bytes needed to
    //store it will decrease.
    quality: undefined | number,
}

type ImageFormat = ("jpeg" | "png")

//Details of the script or CSS to inject. Either the code or the file property
//must be set, but both may not be set at the same time.
type InjectDetails = {
    //If allFrames is true, implies that the JavaScript or CSS should be
    //injected into all frames of current page. By default, it's false and is
    //only injected into the top frame. If true and frameId is set, then the
    //code is inserted in the selected frame and all of its child frames.
    allFrames: undefined | boolean,

    //JavaScript or CSS code to inject.
    //Warning: Be careful using the code parameter. Incorrect use of it may
    //open your extension to cross site scripting attacks
    code: undefined | string,

    //The origin of the CSS to inject. This may only be specified for CSS, not
    //JavaScript. Defaults to "author".
    cssOrigin: undefined | CSSOrigin,

    //JavaScript or CSS file to inject.
    file: undefined | string,

    //The frame where the script or CSS should be injected. Defaults to 0 (the
    //top-level frame).
    frameId: undefined | number,

    //If matchAboutBlank is true, then the code is also injected in about:blank
    //and about:srcdoc frames if your extension has access to its parent
    //document. Code cannot be inserted in top-level about:-frames. By default
    //it is false.
    matchAboutBlank: undefined | boolean,

    //The soonest that the JavaScript or CSS will be injected into the tab.
    //Defaults to "document_idle".
    runAt: undefined | RunAt
}

//The soonest that the JavaScript or CSS will be injected into the tab.
type RunAt = (
    //Script is injected after any files from css, but before any other DOM is
    //constructed or any other script is run.
    "document_start"
    //Script is injected immediately after the DOM is complete, but before
    //subresources like images and frames have loaded.
    | "document_end"
    //The browser chooses a time to inject the script between "document_end"
    //and immediately after the window.onload event fires. The exact moment of
    //injection depends on how complex the document is and how long it is
    //taking to load, and is optimized for page load speed. Content scripts
    //running at "document_idle" don't need to listen for the window.onload
    //event; they are guaranteed to run after the DOM completes. If a script
    //definitely needs to run after window.onload, the extension can check if
    //onload has already fired by using the document.readyState property.
    | "document_idle"
)

//events
//https://developer.chrome.com/docs/extensions/reference/api/events

//Author: axarisar
//Date: 12/04/2024

type Rule = {
    //List of actions that are triggered if one of the conditions is fulfilled.
    actions: Array<any>,
    //List of conditions that can trigger the actions.
    conditions: Array<any>,
    //Optional identifier that allows referencing this rule.
    id: undefined | string,
    //Optional priority of this rule. Defaults to 100.
    priority: undefined | number,
    //Tags can be used to annotate rules and perform operations on sets of rules.
    tags: undefined | Array<string>,
}

type UrlFilter = {
    //Matches if the host part of the URL is an IP address and is contained in
    //any of the CIDR blocks specified in the array.
    cidrBlocks: undefined | Array<string>,

    // Matches if the host name of the URL contains a specified string.
    //To test whether a host name component has a prefix 'foo', use
    //hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com',because
    //an implicit dot is added at the beginning of the host name. Similarly,
    //hostContains can be used to match against component suffix ('foo.') and
    //to exactly match against components ('.foo.'). Suffix- and exact-matching
    //for the last components need to be done separately using hostSuffix,
    //because no implicit dot is added at the end of the host name.
    hostContains: undefined | string,

    //Matches if the host name of the URL is equal to a specified string.
    hostEquals: undefined | string,

    //Matches if the host name of the URL starts with a specified string.
    hostPrefix: undefined | string,

    //Matches if the host name of the URL ends with a specified string.
    hostSuffix: undefined | string,

    //Matches if the URL without query segment and fragment identifier matches
    //a specified regular expression. Port numbers are stripped from the URL if
    //they match the default port number. The regular expressions use the
    //RE2 syntax (https://github.com/google/re2/blob/main/doc/syntax.txt).
    originAndPathMatches: undefined | string,

    //Matches if the path segment of the URL contains a specified string.
    pathContains: undefined | string,

    //Matches if the path segment of the URL is equal to a specified string.
    pathEquals: undefined | string,

    //Matches if the path segment of the URL starts with a specified string.
    pathPrefix: undefined | string,

    //Matches if the path segment of the URL ends with a specified string.
    pathSuffix: undefined | string,

    //Matches if the port of the URL is contained in any of the specified port
    //lists. For example [80, 443, [1000, 1200]] matches all requests on port
    //80, 443 and in the range 1000-1200.
    ports: undefined | (Array<number | Array<number>>)

    //Matches if the query segment of the URL contains a specified string.
    queryContains: undefined | string,

    //Matches if the query segment of the URL is equal to a specified string.
    queryEquals: undefined | string,

    //Matches if the query segment of the URL starts with a specified string.
    queryPrefix: undefined | string,

    //Matches if the query segment of the URL ends with a specified string.
    querySuffix: undefined | string,

    //Matches if the scheme of the URL is equal to any of the schemes specified
    //in the array.
    schemes: undefined | Array<string>,

    //Matches if the URL (without fragment identifier) contains a specified
    //string. Port numbers are stripped from the URL if they match the default
    //port number.
    urlContains: undefined | string,

    //Matches if the URL (without fragment identifier) is equal to a specified
    //string. Port numbers are stripped from the URL if they match the default
    //port number.
    urlEquals: undefined | string,

    //Matches if the URL (without fragment identifier) matches a specified
    //regular expression. Port numbers are stripped from the URL if they match
    //the default port number. The regular expressions use the RE2 syntax.
    //(https://github.com/google/re2/blob/main/doc/syntax.txt).
    urlMatches: undefined | string,

    //Matches if the URL (without fragment identifier) starts with a specified
    //string. Port numbers are stripped from the URL if they match the default
    //port number.
    urlPrefix: undefined | string,

    //Matches if the URL (without fragment identifier) ends with a specified
    //string. Port numbers are stripped from the URL if they match the default
    //port number.
    urlSuffix: undefined | string,
}

//type event
type Event<F extends Function> = {
    addListener: (callback: F) => undefined,
    addRules: (
        rules: Array<Rule>,
        callback: undefined | ((rules: Array<Rule>) => undefined)
    ) => undefined,
    //Sets in rules callback argument the currently registered rules.
    getRules: (
        ruleIdentifiers: undefined | Array<string>,
        callback: (rules: Array<Rule>) => undefined
    ) => undefined,
    hasListener: (callback: F) => boolean,
    hasListeners: () => boolean,
    //Deregisters an event listener callback from an event.
    removeListener: (callback: F) => undefined,
    //Unregisters currently registered rules.
    removeRules: (
        ruleIdentifiers: undefined | Array<string>,
        callback: () => undefined,
    ) => undefined,
}

//Bookmarks
//https://developer.chrome.com/docs/extensions/reference/api/bookmarks

//Author: axarisar
//Date: 12/04/2024

//Must include events.d.ts

type BookmarkTreeNode = {
    //An ordered list of children of this node.
    children: undefined | Array<BookmarkTreeNode>,

    //When this node was created, in milliseconds since the epoch
    //(new Date(dateAdded)).
    dateAdded: undefined | number,

    //When the contents of this folder last changed, in milliseconds since the
    //epoch.
    dateGroupModified: undefined | number,

    //When this node was last opened, in milliseconds since the epoch. Not set
    //for folders.
    dateLastUsed: undefined | number,

    //The unique identifier for the node. IDs are unique within the current
    //profile, and they remain valid even after the browser is restarted.
    id: string,

    //The 0-based position of this node within its parent folder.
    index: undefined | number,

    //The id of the parent folder. Omitted for the root node.
    parentId: undefined | string,

    //The text displayed for the node.
    title: string,

    //Indicates the reason why this node is unmodifiable. The managed value
    //indicates that this node was configured by the system administrator or by
    //the custodian of a supervised user. Omitted if the node can be modified
    //by the user and the extension (default).
    unmodificable: undefined | "managed",

    //The URL navigated to when a user clicks the bookmark. Omitted for
    //folders.
    url: undefined | string,
};

//Indicates the reason why this node is unmodifiable. The managed value
//indicates that this node was configured by the system administrator. Omitted
//if the node can be modified by the user and the extension (default).
type BookmarkTreeNodeUnmodifiable = "managed"

type CreateDetails = {
    index: undefined | number,
    //Defaults to the Other Bookmarks folder.
    parentId: undefined | string,
    title: undefined | string,
    url: undefined | string,
};

interface Bookmark {
    //Constants

    //Deprecated!!
    //Bookmnar write operations are no longer limited by Chrome
    MAX_WRITE_OPREATIONS_PER_MINUTE: 1000000,

    //Deprecated!!
    //Bookmnar write operations are no longer limited by Chrome
    MAX_WRITE_OPREATIONS_PER_HOUR: 1000000,

    //Methods

    //Creates a bookmark or folder under the specified parentId.
    //If url is NULL or missing, it will be a folder.
    create(
        bookmark: CreateDetails,
        callback: (result: BookmarkTreeNode) => undefined
    ): undefined,
    create(bookmark: CreateDetails): Promise<BookmarkTreeNode>,

    //Retrieves the specified BookmarkTreeNode(s).
    get(
        idOridList: string | [string,...Array<string>],
        callback: (results: Array<BookmarkTreeNode>) => undefined
    ): undefined,
    get(
        idOridList: string | [string,...Array<string>]
    ): Promise<Array<BookmarkTreeNode>>,

    //Retrieves the children of the specified BookmarkTreeNode id.
    getChildren(
        id: string,
        callback: (results: Array<BookmarkTreeNode>) => undefined,
    ): undefined,
    getChildren(id: string): Promise<Array<BookmarkTreeNode>>,

    //Retrieves the recently added bookmarks.
    getRecent(
        numberOfItems: number,
        callback: (results: Array<BookmarkTreeNode>) => undefined,
    ): undefined,
    getRecent(numberOfItems: number): Promise<Array<BookmarkTreeNode>>,

    //Retrieves part of the Bookmarks hierarchy, starting at the specified
    //node.
    getSubTree(
        id: string,
        callback: (results: Array<BookmarkTreeNode>) => undefined,
    ): undefined,
    getSubTree(id: string): Promise<Array<BookmarkTreeNode>>,

    //Retrieves the entire Bookmarks hierarchy.
    getTree(
        callback: (results: Array<BookmarkTreeNode>) => undefined,
    ): undefined,
    getTree(): Promise<Array<BookmarkTreeNode>>,

    //Moves the specified BookmarkTreeNode to the provided location.
    move(
        id: string,
        destination: {
            index: undefined | number,
            parentId: undefined | string
        },
        callback: (result: BookmarkTreeNode) => undefined,
    ): undefined,
    move(
        id: string,
        destination: {
            index: undefined | number,
            parentId: undefined | string
        }
    ): Promise<BookmarkTreeNode>,

    //Removes a bookmark or an empty bookmark folder.
    remove( id: string, callback: () => undefined): undefined,
    remove( id: string): Promise<undefined>,

    //Recursively removes a bookmark folder.
    removeTree( id: string, callback: () => undefined): undefined,
    removeTree( id: string): Promise<undefined>,

    //Searches for BookmarkTreeNodes matching the given query. Queries
    //specified with an object produce BookmarkTreeNodes matching all specified
    //properties.
    search(
        query: string | {
            query: undefined | string,
            title: undefined | string,
            url: undefined | string
        },
        callback: (results: Array<BookmarkTreeNode>) => undefined
    ): undefined,
    search(
        query: string | {
            query: undefined | string,
            title: undefined | string,
            url: undefined | string
        }
    ): Promise<Array<BookmarkTreeNode>>,

    //Updates the properties of a bookmark or folder. Specify only the
    //properties that you want to change; unspecified properties will be left
    //unchanged. Note: Currently, only 'title' and 'url' are supported.
    update(
        id: string,
        changes: {
            title: undefined | string,
            url: undefined | string
        },
        callback: (result: BookmarkTreeNode) => undefined
    ): undefined,
    update(
        id: string,
        changes: {
            title: undefined | string,
            url: undefined | string
        }
    ): Promise<BookmarkTreeNode>,


    //Events

    //Fired when a bookmark or folder changes. Note: Currently, only title and
    //url changes trigger this.
    onChanged: Event<(
        id: string,
        changeInfo: {
            title: string,
            url: undefined | string
        }
    ) => undefined>,

    //Fired when the children of a folder have changed their order due to the
    //order being sorted in the UI. This is not called as a result of a move().
    onChildrenReordererd: Event<(
        id: string,
        reorderInfo: {
            id: string,
            reorderInfo: {childIds: Array<string>},
        }
    ) => undefined>,

    //Fired when a bookmark or folder is created.
    onCreate: Event<(
        id: string,
        bookmark: BookmarkTreeNode
    ) => undefined>,

    //Fired when a bookmark import session is begun. Expensive observers should
    //ignore onCreated updates until onImportEnded is fired. Observers should
    //still handle other notifications immediately.
    onImportBegan: Event<() => undefined>,

    //Fired when a bookmark import session is ended.
    onImportEnded: Event<() => undefined>,

    //Fired when a bookmark or folder is moved to a different parent folder.
    onMoved: Event<(
        id: string,
        moveInfo: {
            index: number,
            oldIndex: number,
            oldParentId: string,
            parentId: string
        }
    ) => undefined>,

    //Fired when a bookmark or folder is removed. When a folder is removed
    //recursively, a single notification is fired for the folder, and none for
    //its contents.
    onRemoved: Event<(
        id: string,
        removeInfo: {
            index: number,
            node: BookmarkTreeNode,
            parentId: string
        }
    ) => undefined>
}

//runtime
//https://developer.chrome.com/docs/extensions/reference/api/runtime
//alias to "nativeMessaging"

//Author: axarisar
//Date: 12/04/2024

//Must include tabs.d.ts
//Must include events.d.ts

//A filter to match against certain extension contexts. Matching contexts must
//match all specified filters; any filter that is not specified matches all
//available contexts. Thus, a filter of `{}` will match all available contexts.
type ContextFilter  = {
    contextIds: undefined | Array<string>,
    contextTypes: undefined | Array<ContextType>
    documentIds: undefined | Array<string>,
    documentOrigins: undefined | Array<string>,
    documentUrls: undefined | Array<string>,
    frameIds: undefined | Array<number>,
    incognito: undefined | boolean,
    tabIds: undefined | Array<number>,
    windowIds: undefined | Array<number>
}

type ContextType = (
    //Specifies the context type as a tab.
    "TAB"
    //Specifies the context type as an extension popup window
    | "POPUP"
    //Specifies the context type as a service worker.
    | "BACKGORUND"
    //Specifies the context type as an offscreen document.
    | "OFFSCREEN_DOCUMENT"
    //Specifies the context type as a side panel.
    | "SIDE_PANEL"
)

//A context hosting extension content.
type ExtensionContext = {
    //A unique identifier for this context
    contextId: string,

    //The type of context this corresponds to.
    contextType: ContextType,

    //A UUID for the document associated with this context, or undefined if
    //this context is hosted not in a document.
    documentId: undefined | string,

    //The origin of the document associated with this context, or undefined if
    //the context is not hosted in a document.
    documentOrigin: undefined | string,

    //The URL of the document associated with this context, or undefined if the
    //context is not hosted in a document.
    documentUrl: undefined | string,

    //The ID of the frame for this context, or -1 if this context is not hosted
    //in a frame.
    frameId: number,

    //Whether the context is associated with an incognito profile.
    incognito: boolean,

    //The ID of the tab for this context, or -1 if this context is not hosted
    //in a tab.
    tabId: number,

    //The ID of the window for this context, or -1 if this context is not
    //hosted in a window.
    windowId: number
}

//An object containing information about the script context that sent a message
//or request.
type MessageSender = {
    //A UUID of the document that opened the connection.
    documentId: undefined | string,

    //The lifecycle the document that opened the connection is in at the time
    //the port was created. Note that the lifecycle state of the document may
    //have changed since port creation.
    documentLifecycle: undefined | string,

    //The frame that opened the connection. 0 for top-level frames, positive
    //for child frames. This will only be set when tab is set.
    frameId: undefined | number,

    //The ID of the extension that opened the connection, if any.
    id: undefined | string,

    //The name of the native application that opened the connection, if any.
    nativeApplication: undefined | string,

    //The origin of the page or frame that opened the connection. It can vary
    //from the url property (e.g., about:blank) or can be opaque (e.g.,
    //sandboxed iframes). This is useful for identifying if the origin can be
    //trusted if we can't immediately tell from the URL.
    origin: undefined | string,

    //The tabs.Tab which opened the connection, if any. This property will only
    //be present when the connection was opened from a tab (including content
    //scripts), and only if the receiver is an extension, not an app.
    tab: undefined | Tab,

    //The TLS channel ID of the page or frame that opened the connection, if
    //requested by the extension, and if available.
    tlsChannelld: undefined | string,

    //The URL of the page or frame that opened the connection. If the sender is
    //in an iframe, it will be iframe's URL not the URL of the page which hosts
    //it.
    url: undefined | string
}

type OnInstalledReason = (
    //Specifies the event reason as an installation.
    "install"
    //Specifies the event reason as an extension update.
    | "update"
    //Specifies the event reason as a Chrome update.
    | "chrome_update"
    //Specifies the event reason as an update to a shared module.
    | "shared_module_update"
)

//The reason that the event is being dispatched. 'app_update' is used when the
//restart is needed because the application is updated to a newer version.
//'os_update' is used when the restart is needed because the browser/OS is
//updated to a newer version. 'periodic' is used when the system runs for more
//than the permitted uptime set in the enterprise policy.
type OnRestartRequiredReason = (
    //Specifies the event reason as an update to the app.
    "app_update"
    //Specifies the event reason as an update to the operating system.
    | "os_update"
    //Specifies the event reason as a periodic restart of the app.
    | "periodic"
)

type PlatformArch = (
    "arm"
    | "arm64"
    | "x86-32"
    | "x86-64"
    | "mips"
    | "mips64"
)

type PlataformInfo = (
    //The machine's processor architecture.
    "arc"
    //The native client architecture. This may be different from arch on some
    //platforms.
    | "nacl_arch"
    //The operating system Chrome is running on.
    | "os"
)

type PlatformNaclArch = (
    "arm"
    | "x86-32"
    | "x86-64"
    | "mips"
    | "mips64"
)

type PlatformOs = (
    "mac"
    | "win"
    | "android"
    | "cros" //Chrome os
    | "linux"
    | "openbsd"
    | "fuchsia"
)

type Port = {
    name: string,

    //Fired when the port is disconnected from the other end(s).
    //runtime.lastError may be set if the port was disconnected by an error. If
    //the port is closed via disconnect, then this event is only fired on the
    //other end. This event is fired at most once (see also Port lifetime).
    onDisconnect: Event<(port: Port) => undefined>,

    //This event is fired when postMessage is called by the other end of the
    //port.
    onMessage: Event<(message: any, port: Port) => undefined>,

    //This property will only be present on ports passed to onConnect /
    //onConnectExternal / onConnectNative listeners.
    sender: undefined | MessageSender,

    disconnect: () => undefined,

    //Send a message to the other end of the port. If the port is disconnected,
    //an error is thrown.
    //The argument message should be JSON-ifiable.
    postMessage: (message: any) => undefined
}

type RequestUpdateCheckStatus = (
    //Specifies that the status check has been throttled. This can occur after
    //repeated checks within a short amount of time.
    "throttled"
    //Specifies that there are no available updates to install.
    | "no_update"
    //Specifies that there is an available update to install.
    | "update_available"
)

interface Runtime {
    readonly id: string,

    //Populated with an error message if calling an API function fails;
    //otherwise undefined. This is only defined within the scope of that
    //function's callback. If an error is produced, but runtime.lastError is
    //not accessed within the callback, a message is logged to the console
    //listing the API function that produced the error. API functions that
    //return promises do not set this property.
    readonly lastError: {
        readonly message: undefined | string,
    },

    //Attempts to connect listeners within an extension (such as the background
    //page), or other extensions/apps. This is useful for content scripts
    //connecting to their extension processes, inter-app/extension
    //communication, and web messaging. Note that this does not connect to any
    //listeners in a content script. Extensions may connect to content scripts
    //embedded in tabs via tabs.connect.
    connect(
        extensionId: undefined | string,
        connectInfo: undefined | {
            includeTlsChannelld: undefined | boolean,
            name: undefined | string
        }
    ): Port,

    //Connects to a native application in the host machine. This method
    //requires the "nativeMessaging" permission.
    connectNative(application: string): Port,

    //Retrieves the JavaScript 'window' object for the background page running
    //inside the current extension/app. If the background page is an event
    //page, the system will ensure it is loaded before calling the callback. If
    //there is no background page, an error is set.
    getBackgroundPage(
        callback: (backgorundPage: undefined | Window) => undefined
    ): undefined,
    getBackgroundPage(): Promise<undefined | Window>,

    //Fetches information about active contexts associated with this extension.
    getContexts(
        filter: ContextFilter,
        callback: (contexts: Array<ExtensionContext>) => undefined
    ): undefined,
    getContexts(filter: ContextFilter): Promise<Array<ExtensionContext>>,

    //Returns details about the app or extension from the manifest. The object
    //returned is a serialization of the full manifest file.
    getManifest(): Object

    getPackageDirectoryEntry(
        callback: (directoryEntry: DirectoryEntry) => undefined
    ): undefined,
    getPackageDirectoryEntry(): Promise<DirectoryEntry>,

    getPlataformInfo(
        callback: (plataformInfo: PlataformInfo) => undefined
    ): undefined,
    getPlataformInfo(): Promise<PlataformInfo>,

    //Converts a relative path within an app/extension install directory to a
    //fully-qualified URL.
    getURL(path: string): string,

    //Open your Extension's options page, if possible.
    //If your Extension does not declare an options page, or Chrome failed to
    //create one for some other reason, the callback will set lastError.
    openOptionsPage(callback: () => undefined): undefined,
    openOptionsPage(): Promise<undefined>,

    //Reloads the app or extension. This method is not supported in kiosk mode.
    //For kiosk mode, use chrome.runtime.restart() method.
    reload(): undefined,

    //Requests an immediate update check be done for this app/extension.
    //Important: Most extensions/apps should not use this method, since Chrome
    //already does automatic checks every few hours, and you can listen for the
    //runtime.onUpdateAvailable event without needing to call
    //requestUpdateCheck.
    //This method is only appropriate to call in very limited circumstances,
    //such as if your extension talks to a backend service, and the backend
    //service has determined that the client extension version is very far out
    //of date and you'd like to prompt a user to update. Most other uses of
    //requestUpdateCheck, such as calling it unconditionally based on a
    //repeating timer, probably only serve to waste client, network, and server
    //resources.
    //Note: When called with a callback, instead of returning an object this
    //function will return the two properties as separate arguments passed to
    //the callback.
    requestUpdateCheck(
        callback: (result:{
            status: RequestUpdateCheckStatus,
            version: undefined | string
        }) => undefined
    ): undefined,
    requestUpdateCheck(): Promise<{
        status: RequestUpdateCheckStatus,
        version: undefined | string
    }>,

    //Restart the ChromeOS device when the app runs in kiosk mode. Otherwise,
    //it's no-op.
    restart(): undefined,

    //Restart the ChromeOS device when the app runs in kiosk mode after the
    //given seconds. If called again before the time ends, the reboot will be
    //delayed. If called with a value of -1, the reboot will be cancelled. It's
    //a no-op in non-kiosk mode. It's only allowed to be called repeatedly by
    //the first extension to invoke this API.
    restartAfterDelay(
        seconds: number,
        callback: undefined | (() => undefined)
    ): undefined,
    restartAfterDelay(seconds: number): Promise<undefined>,

    //Sends a single message to event listeners within your extension or a
    //different extension/app. Similar to runtime.connect but only sends a
    //single message, with an optional response. If sending to your extension,
    //the runtime.onMessage event will be fired in every frame of your
    //extension (except for the sender's frame), or runtime.onMessageExternal,
    //if a different extension. Note that extensions cannot send messages to
    //content scripts using this method. To send messages to content scripts,
    //use tabs.sendMessage.
    sendMessage(
        extensionId: undefined | string,
        message: any, //This message should be a JSON-ifiable object.
        options: undefined | {includeTlsChannelld: undefined | boolean},

        //The JSON response object sent by the handler of the message. If
        //an error occurs while connecting to the extension, the callback
        //will be called with no arguments and runtime.lastError will be
        //set to the error message.
        callback: (response: any) => undefined
    ): undefined,
    sendMessage(
        extensionId: undefined | string,
        message: any, //This message should be a JSON-ifiable object.
        options: undefined | {includeTlsChannelld: undefined | boolean},
    ): Promise<any>, //Same as response

    //Send a single message to a native application. This method requires the
    //"nativeMessaging" permission.
    sendNatieMessage(
        application: string,
        message: object,

        //The response message sent by the native messaging host. If an
        //error occurs while connecting to the native messaging host, the
        //callback will be called with no arguments and runtime.lastError
        //will be set to the error message.
        callback: (response: any) => undefined
    ): undefined,
    sendNatieMessage(
        application: string,
        message: object,
    ): Promise<any>, //Same as response

    //Sets the URL to be visited upon uninstallation. This may be used to clean
    //up server-side data, do analytics, and implement surveys. Maximum 1023
    //characters.
    setUninstallURL(url: string, callback: () => undefined): undefined,
    setUninstallURL(url: string): Promise<undefined>,

    //Fired when a connection is made from either an extension process or a
    //content script (by runtime.connect).
    onConnect: Event<(port: Port) => undefined>,

    //Fired when a connection is made from another extension
    //(by runtime.connect), or from an externally connectable web site.
    onConnectExternal: Event<(port: Port) => undefined>,

    //Fired when a connection is made from a native application. This event
    //requires the "nativeMessaging" permission. It is only supported on
    //Chrome OS.
    onConnectNatie: Event<(port: Port) => undefined>,

    //Fired when the extension is first installed, when the extension is
    //updated to a new version, and when Chrome is updated to a new version
    onInstalled: Event<(details: {
        id: undefined | string,
        previousVersion: undefined | string,
        reason: OnInstalledReason
    }) => undefined>,

    //Fired when a message is sent from either an extension process
    //(by runtime.sendMessage) or a content script (by tabs.sendMessage).
    onMessage: Event<(
        message: any,
        sender: MessageSender,
        senderResponse: () => undefined
    ) => undefined | boolean>,

    //Fired when a message is sent from another extension
    //(by runtime.sendMessage). Cannot be used in a content script.
    onMessageExternal: Event<(
        message: any,
        sender: MessageSender,
        sendResponse: () => undefined
    ) => undefined>,

    //Fired when an app or the device that it runs on needs to be restarted.
    //The app should close all its windows at its earliest convenient time to
    //let the restart to happen. If the app does nothing, a restart will be
    //enforced after a 24-hour grace period has passed. Currently, this event
    //is only fired for Chrome OS kiosk apps.
    onRestartRequired: Event<(reason: OnRestartRequiredReason) => undefined>,

    //Fired when a profile that has this extension installed first starts up.
    //This event is not fired when an incognito profile is started, even if
    //this extension is operating in 'split' incognito mode.
    onStartup: Event<() => undefined>,

    //Sent to the event page just before it is unloaded. This gives the
    //extension opportunity to do some clean up. Note that since the page is
    //unloading, any asynchronous operations started while handling this event
    //are not guaranteed to complete. If more activity for the event page
    //occurs before it gets unloaded the onSuspendCanceled event will be sent
    //and the page won't be unloaded.
    onSuspend: Event<() => undefined>,

    //Sent after onSuspend to indicate that the app won't be unloaded after all.
    onSuspendCanceled: Event<() => undefined>,

    //Fired when an update is available, but isn't installed immediately
    //because the app is currently running. If you do nothing, the update will
    //be installed the next time the background page gets unloaded, if you want
    //it to be installed sooner you can explicitly call
    //chrome.runtime.reload(). If your extension is using a persistent
    //background page, the background page of course never gets unloaded, so
    //unless you call chrome.runtime.reload() manually in response to this
    //event the update will not get installed until the next time Chrome itself
    //restarts. If no handlers are listening for this event, and your extension
    //has a persistent background page, it behaves as if
    //chrome.runtime.reload() is called in response to this event.
    onUpdateAvailable: Event<(details: {version: string}) => undefined>,

    //Fired when a connection is made from a user script from this extension.
    onUserScriptConnect: Event<(port: Port) => undefined>,

    //Fired when a message is sent from a user script associated with the same
    //extension.
    onUserScriptMessage: Event<(
        message: any,
        sender: MessageSender,
        senderResponse: () => undefined
    ) => undefined | boolean>
}

//tabs
//https://developer.chrome.com/docs/extensions/reference/api/tabs

//Author: axarisar
//Date: 12/04/2024

//must include extensionTypes.d.ts
//must include runtime.d.ts

type MutedInfo = {
    extensionId: undefined | string,
    muted: boolean,
    readon: undefined | MutedInfoReason
}

type MutedInfoReason = (
    //A user input action set the muted state.
    "user"
    //Tab capture was started, forcing a muted state change.
    | "capture"
    //An extension, identified by the extensionId field, set the muted state.
    | "extension"
)

type Tab = {
    //Whether the tab is active in its window. Does not necessarily mean the
    //window is focused.
    active: boolean,

    //Whether the tab has produced sound over the past couple of seconds (but
    //it might not be heard if also muted). Equivalent to whether the 'speaker
    //audio' indicator is showing.
    audible: undefined | boolean,

    //A discarded tab is one whose content has been unloaded from memory, but
    //is still visible in the tab strip. Its content is reloaded the next time
    //it is activated.
    discarded: boolean,

    //This property is only present if the extension's manifest includes the
    //"tabs" permission. It may also be an empty string if the tab is loading.
    faviconUrl: undefined | string,

    groupId: number,
    height: undefined | number,

    //Whether the tab is highlighted.
    highlighted: boolean,
    id: undefined | number,
    incognito: boolean,
    index: number,
    lastAccessed: undefined | number,
    mutedInfo: undefined | MutedInfo,
    openerTabId: undefined | number,
    pendingUrl: undefined | number,
    pinned: boolean,
    sessionId: undefined | string,
    status: undefined | TabStatus,
    title: undefined | string,
    url: undefined | string,
    width: undefined | number,
    windowId: number
}

type TabStatus = (
    "unloaded"
    | "loading"
    | "complete"
)

type WindowType = (
    "normal"
    | "popup"
    | "panel"
    | "app"
    | "devtools"
)

type ZoomSettings = {
    defaultZoomFactor: undefined | number,

    //Defines how zoom changes are handled, i.e., which entity is responsible
    //for the actual scaling of the page; defaults to automatic.
    mode: undefined | ZoomSettingsMode,

    //Defines whether zoom changes persist for the page's origin, or only take
    //effect in this tab; defaults to per-origin when in automatic mode, and
    //per-tab otherwise.
    scope: undefined | ZoomSettingsScope
}

type ZoomSettingsMode = (
    "automatic"
    | "manual"
    | "disable"
)

//Defines whether zoom changes persist for the page's origin, or only take
//effect in this tab
type ZoomSettingsScope = (
    //Zoom changes persist in the zoomed page's origin, i.e., all other tabs
    //navigated to that same origin are zoomed as well. Moreover, per-origin
    //zoom changes are saved with the origin, meaning that when navigating to
    //other pages in the same origin, they are all zoomed to the same zoom
    //factor. The per-origin scope is only available in the automatic mode.
    "per-origin"

    //Zoom changes only take effect in this tab, and zoom changes in other tabs
    //do not affect the zooming of this tab. Also, per-tab zoom changes are
    //reset on navigation; navigating a tab always loads pages with their
    //per-origin zoom factors.
    | "per-tab"
)

interface Tabs {
    //The maximum number of times that captureVisibleTab can be called per
    //second. captureVisibleTab is expensive and should not be called too often.
    readonly MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND: 2,

    //The absence of a browser tab.
    readonly TAB_ID_NONE: -1,

    //The absence of a tab index in a tab_strip.
    readonly TAB_INDEX_NONE: -1,

    //Captures the visible area of the currently active tab in the specified
    //window. In order to call this method, the extension must have either the
    //<all_urls> permission or the activeTab permission. In addition to sites
    //that extensions can normally access, this method allows extensions to
    //capture sensitive sites that are otherwise restricted, including
    //chrome:-scheme pages, other extensions' pages, and data: URLs. These
    //sensitive sites can only be captured with the activeTab permission. File
    //URLs may be captured only if the extension has been granted file access.
    captureVisibleTab(
        windowId: undefined | number,
        options: undefined | ImageDetails,
        callback: (dataUrl: string) => undefined,
    ): undefined
    captureVisibleTab(
        windowId: undefined | number,
        options: undefined | ImageDetails
    ): Promise<string>

    //Connects to the content script(s) in the specified tab. The
    //runtime.onConnect event is fired in each content script running in the
    //specified tab for the current extension.
    connect(
        tabId: number,
        connectInfo: undefined | {
            documentId: undefined | string,
            frameId: undefined | number,
            name: undefined | string
        }
    ): Port,

    create(
        createProperties: {
            active: undefined | boolean,
            index: undefined | number,
            openerTabId: undefined | number,
            pinned: undefined | boolean,
            url: undefined | string,
            windowId: undefined | number
        },
        callback: (tab: Tab) => undefined
    ): undefined,
    create(
        createProperties: {
            active: undefined | boolean,
            index: undefined | number,
            openerTabId: undefined | number,
            pinned: undefined | boolean,
            url: undefined | string,
            windowId: undefined | number
        },
    ): Promise<Tab>,

    detectLanguage(
        tabId: undefined | number,
        callback: (language: string) => undefined
    ): undefined,
    detectLanguage(tabId: undefined | number): Promise<string>,

    //Discards a tab from memory. Discarded tabs are still visible on the tab
    //strip and are reloaded when activated.
    discard(
        tabId: undefined | number,
        callback: (tab: undefined | Tab) => undefined
    ): undefined,
    discard(tabId: undefined | number): Promise<undefined | Tab>,

    //Retrieves details about the specified tab.
    get(
        tabId: number,
        callback: (tab: Tab) => undefined
    ): undefined,
    get(tabId: number): Promise<Tab>,

    //Gets the tab that this script call is being made from. Returns undefined
    //if called from a non-tab context (for example, a background page or
    //popup view).
    getCurrent(callback: (tab: undefined | Tab) => undefined): undefined,
    getCurrent(): Promise<undefined | Tab>,

    //Gets the current zoom factor of a specified tab.
    getZoom(
        tabId: undefined | number,
        callback: (zoomFactor: number) => undefined
    ): undefined,
    getZoom(tabId: undefined | number): Promise<number>,

    getZoomSettings(
        tabId: undefined | number,
        callback: (zoomSettings: ZoomSettings) => undefined
    ): undefined,
    getZoomSettings(tabId: undefined | number): Promise<ZoomSettings>,

    //Go back to the previous page, if one is available.
    goBack(
        tabId: undefined | number,
        callback: () => undefined
    ): undefined,
    goBack(tabId: undefined | number): Promise<undefined>,

    //Go foward to the next page, if one is available.
    goForward(
        tabId: undefined | number,
        callback: () => undefined
    ): undefined,
    goForward(tabId: undefined | number): Promise<undefined>,

    //Adds one or more tabs to a specified group, or if no group is specified,
    //adds the given tabs to a newly created group.
    group(
        options: {
            //Configurations for creating a group. Cannot be used if groupId is
            //already specified.
            createProperties: undefined | {windowId: undefined | number},
            groupId: undefined | number,
            tabIds: number | [number, ...Array<number>]
        },
        callback: (groupId: number) => undefined
    ): undefined,
    group(
        options: {
            //Configurations for creating a group. Cannot be used if groupId is
            //already specified.
            createProperties: undefined | {windowId: undefined | number},
            groupId: undefined | number,
            tabIds: number | [number, ...Array<number>]
        }
    ): Promise<number>,

    //Highlights the given tabs and focuses on the first of group. Will appear
    //to do nothing if the specified tab is currently active.
    highlight(
        highlightInfo: {
            tabs: number | Array<number>,
            windowId: undefined | number,
        },
        callback: (window: Window) => undefined
    ): undefined,
    highlight(
        highlightInfo: {
            tabs: number | Array<number>,
            windowId: undefined | number,
        }
    ): Promise<Window>,


    //Moves one or more tabs to a new position within its window, or to a new
    //window. Note that tabs can only be moved to and from normal
    //(window.type === "normal") windows.
    move(
        tabIds: number | Array<number>,
        moveProperties: {
            //The position to move the window to. Use -1 to place the tab at
            //the end of the window.
            index: number,
            windowId: undefined | number
        },
        callback: (tabs: Tab | Array<Tabs>) => undefined
    ): undefined,
    move(
        tabIds: number | Array<number>,
        moveProperties: {
            //The position to move the window to. Use -1 to place the tab at
            //the end of the window.
            index: number,
            windowId: undefined | number
        }
    ): Promise<Tab | Array<Tab>>,

    //Gets all tabs that have the specified properties, or all tabs if no
    //properties are specified.
    query(
        queryInfo: {
            active: undefined | boolean,
            audible: undefined | boolean,
            autoDisable: undefined | boolean,
            currentWindow: undefined | boolean,
            discarded: undefined | boolean,
            groupId: undefined | number,
            highlighted: undefined | boolean,
            index: undefined | number,
            lastFocusedWindow: undefined | boolean,
            muted: undefined | boolean,
            pinned: undefined | boolean,
            status: undefined | TabStatus,
            title: undefined | string,
            url: undefined | string | Array<string>,
            windowId: undefined | number,
            windowType: undefined | WindowType
        },
        callback: (result: Array<Tab>) => undefined
    ): undefined,
    query (
        queryInfo: {
            active: undefined | boolean,
            audible: undefined | boolean,
            autoDisable: undefined | boolean,
            currentWindow: undefined | boolean,
            discarded: undefined | boolean,
            //the group that the tabs are in, or tabGroups.TAB_GROUP_ID_NONE
            //for ungrouped tabs.
            groupId: undefined | number,
            highlighted: undefined | boolean,
            index: undefined | number,
            lastFocusedWindow: undefined | boolean,
            muted: undefined | boolean,
            pinned: undefined | boolean,
            status: undefined | TabStatus,
            title: undefined | string,
            //Match tabs against one or more URL patterns. Fragment identifiers
            //are not matched. This property is ignored if the extension does
            //not have the "tabs" permission.
            url: undefined | string | Array<string>,
            //The ID of the parent window, or windows.WINDOW_ID_CURRENT for the
            //current window.
            windowId: undefined | number,
            windowType: undefined | WindowType
        }
    ): Promise<Array<Tab>>,

    reload(
        tabId: undefined | number,
        //Whether to bypass local caching. Defaults to false.
        reloadProperties: undefined | {bypassCache: boolean},
        callback: () => undefined,
    ): undefined,
    reload(
        tabId: undefined | number,
        //Whether to bypass local caching. Defaults to false.
        reloadProperties: undefined | {bypassCache: boolean},
    ): Promise<undefined>,

    remove(
        tabIds: undefined | number | Array<number>,
        callback: () => undefined
    ): undefined,
    remove(tabIds: undefined | number | Array<number>): Promise<undefined>,

    //Sends a single message to the content script(s) in the specified tab,
    //with an optional callback to run when a response is sent back. The
    //runtime.onMessage event is fired in each content script running in the
    //specified tab for the current extension.
    sendMessage(
        tabId: number,
        //The message to send. This message should be a JSON-ifiable object.
        message: any,
        options: undefined | {
            //Send a message to a specific document identified by documentId
            //instead of all frames in the tab.
            documentId: undefined | string,
            //Send a message to a specific frame identified by frameId instead
            //of all frames in the tab.
            frameId: undefined | number
        },
        callback: (response: any) => undefined
    ): undefined,
    sendMessage(
        tabId: number,
        //The message to send. This message should be a JSON-ifiable object.
        message: any,
        options: undefined | {
            //Send a message to a specific document identified by documentId
            //instead of all frames in the tab.
            documentId: undefined | string,
            //Send a message to a specific frame identified by frameId instead
            //of all frames in the tab.
            frameId: undefined | number
        },
    ): Promise<any>,

    setZoom(
        tabId: undefined | number,
        //The new zoom factor. A value of 0 sets the tab to its current default
        //zoom factor. Values greater than 0 specify a (possibly non-default)
        //zoom factor for the tab.
        zoomFactor: number,
        callback: () => undefined,
    ): undefined,
    setZoom(
        tabId: undefined | number,
        //The new zoom factor. A value of 0 sets the tab to its current default
        //zoom factor. Values greater than 0 specify a (possibly non-default)
        //zoom factor for the tab.
        zoomFactor: number
    ): Promise<undefined>,

    //Sets the zoom settings for a specified tab, which define how zoom changes
    //are handled. These settings are reset to defaults upon navigating the
    //tab.
    setZoomSettings(
        tabId: undefined | number,
        zoomSettings: ZoomSettings,
        callback: () => undefined
    ): undefined,
    setZoomSettings(
        tabId: undefined | number,
        zoomSettings: ZoomSettings,
    ): Promise<undefined>,

    //Removes one or more tabs from their respective groups. If any groups
    //become empty, they are deleted.
    ungroup(
        tabIds: number | [number, ...Array<number>],
        callback: () => undefined
    ): undefined,
    ungroup(tabIds: number | [number, ...Array<number>]): Promise<undefined>,

    //Modifies the properties of a tab. Properties that are not specified in
    //updateProperties are not modified.
    update(
        tabId: undefined | number,
        updatePRoperties: {
            active: undefined | boolean,
            autoDiscardable: undefined | boolean,
            highlighted: undefined | boolean,
            muted: undefined | boolean,
            openertabId: undefined | number,
            pinned: undefined | number,
            //A URL to navigate the tab to. JavaScript URLs are not supported;
            //use scripting.executeScript instead.
            url: undefined | string
        },
        callback: (tab: undefined | Tab) => undefined
    ): undefined,
    update(
        tabId: undefined | number,
        updatePRoperties: {
            active: undefined | boolean,
            autoDiscardable: undefined | boolean,
            highlighted: undefined | boolean,
            muted: undefined | boolean,
            openertabId: undefined | number,
            pinned: undefined | number,
            //A URL to navigate the tab to. JavaScript URLs are not supported;
            //use scripting.executeScript instead.
            url: undefined | string
        }
    ): Promise<undefined | Tab>,

    //Events

    //Fires when the active tab in a window changes. Note that the tab's URL
    //may not be set at the time this event fired, but you can listen to
    //onUpdated events so as to be notified when a URL is set.
    onActivated: Event<(activeIndo: {
        tabId: number,
        windowId: number
    }) => undefined>,

    //Fired when a tab is attached to a window; for example, because it was
    //moved between windows.
    onAttached: Event<(
        tabId: number,
        attachInfo: {newPosition: number, newWindowId: number}
    ) => undefined>,

    //Fired when a tab is created. Note that the tab's URL and tab group
    //membership may not be set at the time this event is fired, but you can
    //listen to onUpdated events so as to be notified when a URL is set or the
    //tab is added to a tab group.
    onCreated: Event<(tab: Tab) => undefined>,

    //Fired when a tab is detached from a window; for example, because it was
    //moved between windows.
    onDetached: Event<(
        tabId: number,
        detachInfo: {oldPosition: number, oldWindowId: number}
    ) => undefined>,

    //Fired when the highlighted or selected tabs in a window changes.
    onHighlighted: Event<(highlightInfo: {
        tabIds: Array<number>,
        windowId: number
    }) => undefined>,

    //Fired when a tab is moved within a window. Only one move event is fired,
    //representing the tab the user directly moved. Move events are not fired
    //for the other tabs that must move in response to the manually-moved tab.
    //This event is not fired when a tab is moved between windows.
    onMoved: Event<(
        tabId: number,
        moveInfo: {fromIndex: number, toIndex: number, windowId: number}
    ) => undefined>,

    //Fired when a tab is closed.
    onRemove: Event<(
        tabId: number,
        removeInfo: {
            isWindowClosing: boolean,
            windowId: number
        }
    ) => undefined>

    //Fired when a tab is replaced with another tab due to prerendering or
    //instant.
    onReplaced: Event<(addedTabId: number, removedId: number) => undefined>

    //Fired when a tab is updated.
    onUpdate: Event<(
        tabId: number,
        changeInfo: {
            active: undefined | boolean,
            autoDiscardable: undefined | boolean,
            discarded: undefined | boolean,
            highlighted: undefined | boolean,
            faviconUrl: undefined | boolean,
            groupId: undefined | number,
            mutedInfo: undefined | MutedInfo,
            pinned: undefined | number,
            status: undefined | TabStatus,
            title: undefined | string,
            url: undefined | string
        },
        tab: Tab
    ) => undefined>

    //Fired when a tab is zoomed.
    onZoomChange: Event<(zoomChangeInfo: {
        newZoomFactor: number,
        oldZoomFactor: number,
        tabId: number,
        zoomSettings: ZoomSettings
    }) => undefined>
}

}

type maybe<T> = T | undefined;

declare var chrome: {
    bookmarks: ChromeExtensionAPI.Bookmark,
    tabs: ChromeExtensionAPI.Tabs,
    storage: Storager,
    runtime: ChromeExtensionAPI.Runtime,
}

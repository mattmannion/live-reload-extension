/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/background.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/background.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const iconDisabled = __webpack_require__("./app/icons/icon-disabled.png");
const icon = __webpack_require__("./app/icons/icon.png");
const inject = __webpack_require__("./app/inject.ts");
const match_pattern_1 = __webpack_require__("./app/lib/match-pattern.ts");
const matchPattern = __webpack_require__("./app/lib/match-pattern.ts");
const rule_1 = __webpack_require__("./app/lib/rule.ts");
const defaults_1 = __webpack_require__("./app/options/defaults.ts");
const util_1 = __webpack_require__("./app/util.ts");
let isMonitoring = true;
const tabData = {};
const registry = {};
const options = {};
const rules = [];
const webRequestListeners = {};
(async () => {
    const optionsResult = await browser.storage.local.get("options");
    const userOptions = "options" in optionsResult ? optionsResult.options : {};
    Object.assign(options, defaults_1.defaults, userOptions);
    await updateRulesFromStorage();
})();
// Fetch active state.
browser.storage.local.get("isMonitoring").then(async (result) => {
    await toggleAddonEnabled(!("isMonitoring" in result) || result.isMonitoring);
});
// Whenever a user navigates to a new page in the top-level frame, we restart monitoring.
browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (isMonitoring && details.frameId === 0) {
        console.log(details.tabId, "Navigated to new URL:", details.url);
        await disableTabMonitoring(details.tabId);
        await monitorTabIfRuleMatch(details.tabId, details.url);
    }
});
// Stop monitoring and delete from registry  when a tab closes.
browser.tabs.onRemoved.addListener(async (tabId) => {
    await disableTabMonitoring(tabId);
});
// Pick up on messages.
browser.runtime.onMessage.addListener(async (message, sender) => {
    console.info("Incoming message from ", sender.url, message);
    switch (message.type) {
        case "isMonitoring?":
            await browser.runtime.sendMessage({ type: "isMonitoring", isMonitoring });
            break;
        case "tabData?":
            await browser.runtime.sendMessage({ type: "tabData", tabData });
            break;
        case "monitoringChange":
            await toggleAddonEnabled(message.isMonitoring);
            break;
        case "reloadRulesChange":
            await updateRulesFromStorage();
            break;
        case "optionsChange":
            Object.assign(options, message.options);
            break;
    }
});
// Record tab when tab URL changes.
browser.tabs.onUpdated.addListener((_, __, tab) => {
    if (tab.status === "complete") {
        recordTab(tab);
    }
});
// Record tab when active tab changes.
browser.tabs.onActivated.addListener((activeTab) => {
    browser.tabs.get(activeTab.tabId).then(recordTab);
});
// Toggle icon and title when monitoring is enable/disabled.
async function toggleAddonEnabled(enabled) {
    isMonitoring = enabled;
    let iconPath;
    let title;
    if (enabled) {
        await enableMonitoring();
        iconPath = icon;
        title = "Live Reload";
    }
    else {
        await disableAllMonitoring();
        iconPath = iconDisabled;
        title = "Live Reload (disabled)";
    }
    await browser.browserAction.setIcon({ path: iconPath });
    await browser.browserAction.setTitle({ title });
}
async function monitorTabIfRuleMatch(tabId, tabUrl) {
    for (const rule of rules) {
        // Host matches pattern, start monitoring.
        if (tabId && tabUrl && tabUrl.match(rule.hostRegExp)) {
            console.info(tabId, tabUrl, "matches rule", rule.title);
            await removeWebRequestsForTabId(tabId);
            // Match all paths of all hosts in rules.sources,
            // strict filtering in webRequestHeadersReceived:
            const urls = rule.sources.map((source) => match_pattern_1.sourceHost(source));
            const filter = {
                tabId: tabId,
                types: ["script", "stylesheet", "sub_frame"],
                urls: urls,
            };
            console.debug(tabId, tabUrl, "initialize monitoring");
            const boundListener = webRequestHeadersReceived.bind(null, tabId, rule);
            browser.webRequest.onHeadersReceived.addListener(boundListener, filter);
            boundListener({ url: tabUrl, type: "main_frame" }); // manual trigger to avoid race condition
            webRequestListeners[tabId] = boundListener;
        }
    }
}
async function webRequestHeadersReceived(tabId, rule, sourceDetails) {
    const url = util_1.stripNoCacheParam(sourceDetails.url);
    if (util_1.anyRegexMatch(rule.sourceRegExps, url)) {
        if (util_1.anyRegexMatch(rule.ignoresRegExps, url)) {
            console.debug("IGNORE", url);
        }
        else {
            console.info("MATCH", url);
            await checkSourceFileChanged(tabId, rule, sourceDetails);
        }
    }
    else {
        console.debug("SKIP", url);
    }
}
async function updateRulesFromStorage() {
    console.debug("Update rules from storage");
    const storageRules = await rule_1.Rule.query();
    rules.length = 0; // Truncate, but keep reference.
    rules.push(...storageRules);
    await restart();
}
async function restart() {
    await disableAllMonitoring();
    await enableMonitoring();
}
async function enableMonitoring() {
    if (rules.length) {
        console.debug("Enable monitoring with reload rules", rules);
        const tabs = await browser.tabs.query({ status: "complete", windowType: "normal" });
        tabs.forEach((tab) => {
            if (tab.id && tab.url) {
                monitorTabIfRuleMatch(tab.id, tab.url);
            }
        });
    }
    else {
        console.debug("No reload rules, no monitoring");
    }
}
async function disableAllMonitoring() {
    console.debug("Disable monitoring for all tabs");
    Object.keys(registry).forEach((tabId) => {
        disableTabMonitoring(Number(tabId));
    });
}
async function disableTabMonitoring(tabId) {
    console.debug(tabId, "disable tab monitoring");
    await removeWebRequestsForTabId(tabId);
    Object.entries(registry[tabId] || {}).forEach(([fileName, fileRegistry]) => {
        console.debug(tabId, fileName, "stop file monitoring timer");
        clearTimeout(fileRegistry.timer);
    });
    delete registry[tabId];
    await setBadge(Number(tabId), null);
}
// Record the last tab so we're able to populate the add reload rule form.
function recordTab(tab) {
    if (!tab.incognito && tab.url && tab.url.match(matchPattern.ALL_URLS_RE)) {
        Object.assign(tabData, tab);
    }
}
async function removeWebRequestsForTabId(tabId) {
    if (webRequestListeners[tabId]) {
        console.debug(tabId, "remove webrequests listener");
        await browser.webRequest.onHeadersReceived.removeListener(webRequestListeners[tabId]);
        delete webRequestListeners[tabId];
    }
}
async function setBadge(tabId, count) {
    try {
        if (options["show.badge"] && isMonitoring && count !== null) {
            await browser.browserAction.setBadgeBackgroundColor({ color: "black" });
            await browser.browserAction.setBadgeText({ text: count.toString(), tabId });
        }
        else {
            await browser.browserAction.setBadgeText({ text: "", tabId });
        }
    }
    catch (err) {
        return; // Tab closed
    }
}
async function checkSourceFileChanged(tabId, rule, sourceDetails) {
    let hash;
    const url = sourceDetails.url;
    const noCacheUrl = util_1.stripNoCacheParam(url);
    if (!isMonitoring) {
        return;
    }
    const tabRegistry = registry[tabId] = registry[tabId] || {};
    const fileRegistry = tabRegistry[noCacheUrl] = tabRegistry[noCacheUrl] || { hash: null, timer: null };
    try {
        hash = await util_1.getFileHash(url);
    }
    catch (error) {
        console.error(noCacheUrl, "Error retrieving hash:", error);
    }
    await setBadge(tabId, Object.keys(tabRegistry).length);
    // Check whether the source file hash has changed.
    if (hash && fileRegistry.hash && fileRegistry.hash !== hash) {
        console.info(noCacheUrl, "change detected");
        if ((sourceDetails.type === "stylesheet" && rule.inlinecss) ||
            (sourceDetails.type === "sub_frame" && rule.inlineframes)) {
            console.info(noCacheUrl, "inline reload");
            delete tabRegistry[noCacheUrl];
            const source = inject.inlineReload.toString();
            const code = `(${source})("${sourceDetails.type}", "${url}");`;
            await browser.tabs.executeScript(tabId, { code });
        }
        else {
            console.info(noCacheUrl, "reload parent page");
            await disableTabMonitoring(tabId);
            await browser.tabs.reload(tabId, { bypassCache: true });
        }
    }
    else {
        // Not changed or old/new hash cannot be retrieved, retry later:
        console.debug(noCacheUrl, "not changed");
        clearTimeout(fileRegistry.timer);
        fileRegistry.hash = hash || fileRegistry.hash;
        fileRegistry.timer = window.setTimeout(() => {
            checkSourceFileChanged(tabId, rule, sourceDetails);
        }, rule.intervalMs);
    }
}


/***/ }),

/***/ "./app/icons/icon-disabled.png":
/***/ (function(module, exports) {

module.exports = "/icons/icon-disabled.png";

/***/ }),

/***/ "./app/icons/icon.png":
/***/ (function(module, exports) {

module.exports = "/icons/icon.png";

/***/ }),

/***/ "./app/inject.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Replace inline frames and stylesheet includes.
 * Injected into the host page.
 */
function inlineReload(type, url) {
    if (type === "stylesheet") {
        const selector = document.querySelectorAll("link[rel=stylesheet]");
        const allLinks = Array.from(selector);
        const filtered = allLinks.filter((h) => h.href === url);
        (filtered.length ? filtered : allLinks).forEach((element) => {
            element.setAttribute("href", getNoCacheURL(element.href));
        });
    }
    if (type === "sub_frame") {
        const selector = document.querySelectorAll("frame[src], iframe[src]");
        const allFrames = Array.from(selector);
        const filtered = allFrames.filter((f) => f.src === url);
        (filtered.length ? filtered : allFrames).forEach((element) => {
            element.setAttribute("src", getNoCacheURL(element.src));
        });
    }
    // Append a unique string to a URL to avoid cache.
    function getNoCacheURL(origUrl) {
        const urlObj = new URL(origUrl);
        const timeHash = new Date().getTime().toString(36).substr(3).toUpperCase();
        urlObj.searchParams.set("X-LR-NOCACHE", timeHash);
        return urlObj.href;
    }
}
exports.inlineReload = inlineReload;


/***/ }),

/***/ "./app/lib/match-pattern.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const schemeSegment = "(\\*|http|https|file|ftp|app)";
const hostSegment = "(\\*|(?:\\*\\.)?(?:[^/*]+))?";
const pathSegment = "(.*)";
const ALL_URLS_RE = new RegExp(`^${schemeSegment}://`);
exports.ALL_URLS_RE = ALL_URLS_RE;
const MATCH_PATTERN_RE = new RegExp(`^${schemeSegment}://${hostSegment}/${pathSegment}$`);
exports.MATCH_PATTERN_RE = MATCH_PATTERN_RE;
function sourceHost(pattern) {
    const match = MATCH_PATTERN_RE.exec(pattern);
    if (match) {
        let [, scheme, host] = match;
        host = host.replace(/:\d{2,5}/, ''); // Drop host port: https://bugzilla.mozilla.org/show_bug.cgi?id=1362809
        pattern = `${scheme}://${host}/*`;
    }
    return pattern;
}
exports.sourceHost = sourceHost;
function toRegExp(pattern) {
    if (pattern === "<all_urls>") {
        return ALL_URLS_RE;
    }
    const match = MATCH_PATTERN_RE.exec(pattern);
    if (!match) {
        console.error("Invalid pattern", pattern);
        return (/^$/);
    }
    let [, scheme, host, path] = match;
    if (!host) {
        console.error("Invalid host in pattern", pattern);
        return (/^$/);
    }
    let regex = "^";
    if (scheme === "*") {
        regex += "(http|https)";
    }
    else {
        regex += scheme;
    }
    regex += "://";
    if (host && host === "*") {
        regex += "[^/]+?";
    }
    else if (host) {
        if (host.match(/^\*\./)) {
            regex += "[^/]*?";
            host = host.substring(2);
        }
        regex += host.replace(/\./g, "\\.");
    }
    if (path) {
        if (path === "*") {
            regex += "(/.*)?";
        }
        else if (path.charAt(0) !== "/") {
            regex += "/";
            regex += path.replace(/\./g, "\\.").replace(/\*/g, ".*?");
        }
    }
    else {
        regex += "/?";
    }
    regex += "$";
    return new RegExp(regex);
}
exports.toRegExp = toRegExp;


/***/ }),

/***/ "./app/lib/rule.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const matchPattern = __webpack_require__("./app/lib/match-pattern.ts");
const storage = browser.storage.local;
var StorageType;
(function (StorageType) {
    StorageType[StorageType["Rule"] = 0] = "Rule";
})(StorageType || (StorageType = {}));
class Rule {
    constructor(title, host, sources = [], ignores = [], interval = 2, id = Math.random().toString(36).substr(2), created = new Date(), modified = new Date(), inlinecss = true, inlineframes = true) {
        this.title = title;
        this.host = host;
        this.sources = sources;
        this.ignores = ignores;
        this.interval = interval;
        this.id = id;
        this.created = created;
        this.modified = modified;
        this.inlinecss = inlinecss;
        this.inlineframes = inlineframes;
    }
    static async query() {
        const allData = await storage.get(undefined);
        const rules = [];
        console.debug("Storage data", allData);
        Object.entries(allData).forEach(([_, data]) => {
            if (data._type === StorageType.Rule) {
                rules.push(Rule.fromStorage(data));
            }
        });
        console.debug("Rules", rules);
        return rules;
    }
    static async get(id) {
        const rules = await Rule.query();
        const rule = rules.find((r) => r.id === id);
        if (rule === undefined) {
            throw new Error(`No rule with id: ${id}`);
        }
        return rule;
    }
    static async delete(id) {
        console.debug("Delete rule", id);
        try {
            if (id) {
                await storage.remove(id);
            }
        }
        catch (error) {
            console.error(error); // Maybe this should raise an error?
        }
    }
    static fromStorage(storageRule) {
        return new Rule(storageRule.title, storageRule.host, storageRule.sources, storageRule.ignores, storageRule.interval, storageRule.id, new Date(storageRule.created), new Date(storageRule.modified), storageRule.inlinecss, storageRule.inlineframes);
    }
    get hostRegExp() {
        return matchPattern.toRegExp(this.host);
    }
    get sourceRegExps() {
        return this.sources.map((source) => matchPattern.toRegExp(source));
    }
    get ignoresRegExps() {
        return this.ignores.map((ignore) => matchPattern.toRegExp(ignore));
    }
    get intervalMs() {
        return this.interval * 1000;
    }
    toStorage() {
        return {
            _type: StorageType.Rule,
            id: this.id,
            title: this.title,
            host: this.host,
            sources: this.sources,
            ignores: this.ignores,
            interval: this.interval,
            inlinecss: this.inlinecss,
            inlineframes: this.inlineframes,
            created: this.created.getTime(),
            modified: this.modified.getTime(),
        };
    }
    async save() {
        try {
            await storage.set({ [this.id]: this.toStorage() });
        }
        catch (error) {
            throw new Error(`Error saving rule: ${error.message}`);
        }
        return this;
    }
}
exports.Rule = Rule;


/***/ }),

/***/ "./app/options/defaults.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const defaults = {
    "show.badge": true,
    "meta.lastSaved": null,
};
exports.defaults = defaults;


/***/ }),

/***/ "./app/util.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Get file contents and hash it.
async function getFileHash(url) {
    const response = await fetch(url, { cache: "reload" });
    const text = await response.text();
    return sha1(text);
}
exports.getFileHash = getFileHash;
// Retrieve a SHA1 hash for a string.
async function sha1(str) {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
// Strip 'X-LR-NOCACHE' from url so matching won't be affected.
function stripNoCacheParam(url) {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("X-LR-NOCACHE");
    return urlObj.href;
}
exports.stripNoCacheParam = stripNoCacheParam;
function anyRegexMatch(regExps, url) {
    const regexp = regExps.find((regExp) => regExp.test(url));
    if (regexp) {
        console.debug(url, "matches", regexp);
        return true;
    }
    return false;
}
exports.anyRegexMatch = anyRegexMatch;


/***/ })

/******/ });
//# sourceMappingURL=background.js.map
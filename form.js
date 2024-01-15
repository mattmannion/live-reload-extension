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
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/form/form.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/form/form.css":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./app/form/form.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const dom = __webpack_require__("./app/lib/dom.ts");
const match_pattern_1 = __webpack_require__("./app/lib/match-pattern.ts");
const rule_1 = __webpack_require__("./app/lib/rule.ts");
__webpack_require__("./app/form/form.css");
const FILESYSTEM_ERROR = `Not saved!
\nDue to security restrictions in addons, local files cannot be monitored.
\nYou can work around this issue by serving your files through a local server.
\nMore info: https://github.com/blaise-io/live-reload/issues/3`;
(async () => {
    const matchUpdateRule = location.search.match(/rule=([^&$]+)/);
    const updateRuleId = matchUpdateRule ? String(matchUpdateRule[1]) : null;
    if (updateRuleId) {
        let rule = null;
        try {
            rule = await rule_1.Rule.get(updateRuleId);
        }
        catch (error) {
            alert(error.message);
            window.close();
        }
        if (rule) {
            updateRule(rule);
        }
    }
    else {
        browser.runtime.onMessage.addListener(createNewRule);
        await browser.runtime.sendMessage({ type: "tabData?" });
    }
})();
function updateRule(rule) {
    console.debug("Update rule", rule);
    const title = `Update: ${rule.title}`;
    const h2 = document.querySelector("h2.update");
    h2.textContent = title;
    populateForm(rule, true, title);
}
async function createNewRule(message) {
    if (message.type === "tabData") {
        browser.runtime.onMessage.removeListener(createNewRule);
        const data = message.tabData || {};
        const title = data.title ? `Reload rule for ${data.title.trim()}` : "";
        const rule = new rule_1.Rule(title, data.url || "");
        console.debug("New rule", rule);
        populateForm(rule, false, "Create a new reload rule");
    }
}
function populateForm(rule, update, title) {
    document.body.classList.add(update ? "update" : "create");
    document.title = title;
    dom.popupMatchContentHeight();
    dom.getInput("host").pattern = match_pattern_1.MATCH_PATTERN_RE.source;
    dom.setValue("title", rule.title);
    dom.setValue("host", rule.host);
    dom.setValue("interval", rule.interval);
    dom.setValue("inlinecss", rule.inlinecss);
    dom.setValue("inlineframes", rule.inlineframes);
    dom.setValue("sources", rule.sources.join("\n"));
    dom.setValue("ignores", rule.ignores.join("\n"));
    document.forms[0].addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleFormSubmit(rule);
        await browser.runtime.sendMessage({ type: "reloadRulesChange" });
        window.alert(`Saved: ${rule.title}`);
        await dom.closeWindow();
    });
}
async function handleFormSubmit(rule) {
    const [success, error] = overloadFormData(rule);
    if (!success) {
        window.alert(error);
        dom.getInput("sources").focus();
        return;
    }
    console.debug("Save rule", rule);
    await rule.save();
}
function overloadFormData(rule) {
    let error = null;
    rule.interval = Number(dom.getValue("interval"));
    rule.modified = new Date();
    rule.title = dom.getValue("title");
    rule.host = dom.getValue("host");
    rule.inlinecss = Boolean(dom.getInput("inlinecss").checked);
    rule.inlineframes = Boolean(dom.getInput("inlineframes").checked);
    rule.sources = dom.getValue("sources").split(/[\n]+/g).map((s) => s.trim());
    rule.ignores = dom.getValue("ignores") ?
        dom.getValue("ignores").split(/[\n]+/g).map((s) => s.trim()) : [];
    [...rule.sources, ...rule.ignores].forEach((source) => {
        if (!error && source.trim()) {
            if ((/^file:\/\//i).exec(source)) {
                error = FILESYSTEM_ERROR;
            }
            else if (!match_pattern_1.MATCH_PATTERN_RE.exec(source)) {
                error = `Not saved!\n\nInvalid match pattern:\n\n${source}`;
            }
        }
    });
    return [error === null, error];
}


/***/ }),

/***/ "./app/lib/dom.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getInput(name) {
    return document.querySelector(`[name=${name}]`);
}
exports.getInput = getInput;
function getValue(name) {
    return getInput(name).value.trim();
}
exports.getValue = getValue;
function setValue(name, value) {
    const input = getInput(name);
    if (typeof value === "boolean") {
        input.checked = value;
    }
    else {
        input.value = value.toString();
    }
}
exports.setValue = setValue;
async function popupMatchContentHeight() {
    const window = await browser.windows.getCurrent();
    browser.windows.update(window.id, {
        height: document.documentElement.offsetHeight + 20,
    });
    document.body.classList.add("loaded");
}
exports.popupMatchContentHeight = popupMatchContentHeight;
async function closeWindow() {
    const window = await browser.windows.getCurrent();
    browser.windows.remove(window.id);
}
exports.closeWindow = closeWindow;


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


/***/ })

/******/ });
//# sourceMappingURL=form.js.map
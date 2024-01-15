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
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/popup/popup.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/icons/check.svg":
/***/ (function(module, exports) {

module.exports = "/icons/check.svg";

/***/ }),

/***/ "./app/icons/cross.svg":
/***/ (function(module, exports) {

module.exports = "/icons/cross.svg";

/***/ }),

/***/ "./app/icons/delete.svg":
/***/ (function(module, exports) {

module.exports = "/icons/delete.svg";

/***/ }),

/***/ "./app/icons/script.svg":
/***/ (function(module, exports) {

module.exports = "/icons/script.svg";

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

/***/ "./app/popup/popup.css":
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./app/popup/popup.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__("./app/icons/check.svg");
__webpack_require__("./app/icons/cross.svg");
__webpack_require__("./app/icons/delete.svg");
__webpack_require__("./app/icons/script.svg");
const rule_1 = __webpack_require__("./app/lib/rule.ts");
__webpack_require__("./app/popup/popup.css");
// See isMonitoring in background.js
let isMonitoring = true;
const template = document.querySelector("#reload-rule");
const enabledElement = document.querySelector(".addon-enabled");
const disabledElement = document.querySelector(".addon-disabled");
// Add browser name to document element.
document.documentElement.classList.add("chrome");
// Fetch reload rules from storage.
(async () => {
    const rules = await rule_1.Rule.query();
    setReloadRules(rules);
})();
// Fetch Addon active from background.js.
browser.runtime.sendMessage({ type: "isMonitoring?" });
browser.runtime.onMessage.addListener((message) => {
    if (message.type === "isMonitoring") {
        isMonitoring = message.isMonitoring;
        updatePopupUI();
    }
});
// Handle clicks on enabled/disabled state.
Array.from(document.querySelectorAll(".toggle")).forEach((toggle) => {
    toggle.addEventListener("click", () => {
        isMonitoring = !isMonitoring;
        browser.storage.local.set({ isMonitoring });
        browser.runtime.sendMessage({ type: "monitoringChange", isMonitoring });
        updatePopupUI();
    });
});
// Click handler.
document.body.addEventListener("click", (event) => {
    const clickEl = event.target;
    // Delete.
    const deleteTrigger = clickEl.closest(".option-delete");
    if (deleteTrigger) {
        const container = clickEl.closest(".split");
        container.classList.toggle("hidden");
        container.nextElementSibling.classList.toggle("hidden");
        event.stopPropagation();
        return;
    }
    // Confirm delete.
    const confirmDeleteTrigger = clickEl.closest(".option-delete-confirm");
    if (confirmDeleteTrigger) {
        const id = confirmDeleteTrigger.getAttribute("data-rule-id");
        rule_1.Rule.delete(id).then(() => {
            const container = clickEl.closest(".split");
            const parent = container.parentNode;
            parent.removeChild(container.previousElementSibling);
            parent.removeChild(container);
        });
        rule_1.Rule.query().then(updateNoRules);
        event.stopPropagation();
        return;
    }
    // Cancel Delete.
    const cancelDeleteTrigger = clickEl.closest(".option-delete-cancel");
    if (cancelDeleteTrigger) {
        const container = clickEl.closest(".split");
        const previous = container.previousElementSibling;
        previous.classList.toggle("hidden");
        container.classList.toggle("hidden");
        event.stopPropagation();
        return;
    }
    // Popup.
    const popAttr = clickEl.closest("[href]");
    if (popAttr) {
        const href = popAttr.getAttribute("href");
        const url = browser.extension.getURL(href);
        browser.windows.create({
            url,
            type: "popup",
            width: 450,
            height: 750,
            left: event.screenX - 390,
            top: event.screenY - 20,
        });
        event.stopPropagation();
        event.preventDefault();
        return;
    }
});
function updatePopupUI() {
    enabledElement.classList.toggle("hidden", !isMonitoring);
    disabledElement.classList.toggle("hidden", isMonitoring);
}
function setReloadRules(rules) {
    updateNoRules(rules);
    rules.forEach((rule) => {
        const panel = template.content.querySelector(".panel-list-item.rule");
        const dataRuleEl = template.content.querySelector("[data-rule-id]");
        const dataText = panel.querySelector(".text");
        dataText.textContent = rule.title;
        panel.setAttribute("href", `/form.html?rule=${rule.id}`);
        dataRuleEl.setAttribute("data-rule-id", rule.id);
        document.querySelector("#rules-list").appendChild(document.importNode(template.content, true));
    });
}
function updateNoRules(rules) {
    const noRules = document.getElementById("no-rules");
    noRules.classList.toggle("hidden", rules.length >= 1);
}


/***/ })

/******/ });
//# sourceMappingURL=popup.js.map
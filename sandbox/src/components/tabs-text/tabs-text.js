// (function () {

//   const target = document.querySelector(".c-tabs__underline");
//   const tabs = document.querySelectorAll(".c-tabs__tab");

//   function slideUnderline() {

//     const width = this.getBoundingClientRect().width;
//     const height = this.getBoundingClientRect().height;
//     const left = this.offsetLeft;
//     const top = this.offsetTop;

//     target.style.width = `${width}px`;
//     target.style.height = `${height}px`;
//     target.style.left = `${left}px`;
//     target.style.top = `${top}px`;
//     target.style.transform = "none";
//   }

//   for (let i = 0; i < tabs.length; i++) {
//     tabs[i].addEventListener("click", slideUnderline);
//   }

// })();

"use strict";
if (typeof Object.assign != "function") {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      // .length of function is 2

      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError(
          "Cannot convert undefined or null to object"
        );
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (
              Object.prototype.hasOwnProperty.call(
                nextSource,
                nextKey
              )
            ) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
// add utilities; borrowed from: https://scottaohara.github.io/a11y_tab_widget/
var util = {
  keyCodes: {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    HOME: 36,
    END: 35,
    ENTER: 13,
    SPACE: 32,
    DELETE: 46,
    TAB: 9
  },

  generateID: function (base) {
    return base + Math.floor(Math.random() * 999);
  },

  getDirectChildren: function (elm, selector) {
    return Array.prototype.filter.call(elm.children, function (child) {
      return child.matches(selector);
    });
  },

  getUrlHash: function () {
    return window.location.hash.replace('#', '');
  },

  /**
   * Use history.replaceState so clicking through Tabs
   * does not create dozens of new history entries.
   * Browser back should navigate to the previous page
   * regardless of how many Tabs were activated.
   *
   * @param {string} hash
   */
  setUrlHash: function (hash) {
    if (history.replaceState) {
      history.replaceState(null, '', '#' + hash);
    } else {
      location.hash = hash;
    }
  }
};




(function (w, doc, undefined) {

  var ARIAaccOptions = {
    openOnFocus: false,
    open: 0
  }

  var ARIAtabs = function (inst, options) {
    var _options = Object.assign(ARIAaccOptions, options);
    var el = inst;
    var tablist = el.querySelector("[data-tablist]");
    var tabs = Array.from(el.querySelectorAll("[data-tab]"));
    var tabpanels = Array.from(el.querySelectorAll("[data-tabpanel]"));
    var tabsID = util.generateID('ps__tabs-');
    var orientation = el.getAttribute('data-tabs-orientation');
    var activeIndex = _options.open;

    el.setAttribute('id', tabsID);

    var init = function () {
      el.classList.add('js-tabs');
      setupTabList();
      setupTabs();
      setupTabPanels();
    };

    var setupTabList = function () {
      tablist.setAttribute("role", "tablist");
      if (orientation == 'vertical') tablist.setAttribute("aria-orientation", "vertical");
    }

    var setupTabs = function () {

      tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        // each tab needs an ID that will be used to label its corresponding panel
        tab.setAttribute('id', tabsID + util.generateID('__tab-'));


        // first tab is initially active
        if (index === activeIndex) {
          activateTab(tab);
        }

        tab.addEventListener('click', (e) => {
          e.preventDefault();
          activeIndex = index;
          activateTab(tab);
        }, false);

        tab.addEventListener('keydown', (e) => {
          tabKeyboardRespond(e, tab);
        }, false);
      });
    }

    var selectTab = function (tab) {

      // unselect all other tabs
      tabs.forEach(tab => {
        tab.setAttribute('tabindex', '-1');
      });
      //select current tab
      tab.focus();
    }

    var activateTab = function (tab) {

      // unactivate all other tabs
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });
      //activate current tab
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      // activate corresponding panel accordingly
      activatePanel(tab);
    }

    var setupTabPanels = function () {

      tabpanels.forEach((tabpanel, index) => {
        tabpanel.setAttribute('role', 'tabpanel');
        tabpanel.setAttribute('tabindex', '-1');
        tabpanel.setAttribute('hidden', '');

        if (index == activeIndex) {
          tabpanel.removeAttribute('hidden');
        }

        tabpanel.addEventListener('keydown', (e) => {
          panelKeyboardRespond(e);
        }, false);

        tabpanel.addEventListener("blur", () => {
          tabpanel.setAttribute('tabindex', '-1');
        }, false);

      });
    }

    var panelKeyboardRespond = function (e) {
      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case util.keyCodes.TAB:
          tabpanels[activeIndex].setAttribute('tabindex', '-1');
          break;

        default:
          break;
      }
    }

    var activatePanel = function (tab) {
      tabpanels.forEach((tabpanel, index) => {
        tabpanel.setAttribute('hidden', '');
        tabpanel.setAttribute('tabindex', '-1');

        if (index == activeIndex) {
          tabpanel.removeAttribute('hidden');
          tabpanel.setAttribute('aria-labelledby', tabs[activeIndex].getAttribute('id'));
          tabpanel.setAttribute('tabindex', '0');
        }
      });
    }

    var incrementActiveIndex = function () {
      if (activeIndex < tabs.length - 1) {
        return ++activeIndex;
      }
      else {
        activeIndex = 0;
        return activeIndex;
      }
    }; // incrementActiveIndex()


    var decrementActiveIndex = function () {
      if (activeIndex > 0) {
        return --activeIndex;
      }
      else {
        activeIndex = tabs.length - 1;
        return activeIndex;
      }
    }; // decrementActiveIndex()

    // keyboard interactions
    var tabKeyboardRespond = function (e, tab) {
      var nextTab = tab.nextElementSibling ? tab.nextElementSibling : false;
      var previousTab = tab.previousElementSibling ? tab.previousElementSibling : false;
      var firstTab = tabs[0];
      var lastTab = tabs[tabs.length - 1];

      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case util.keyCodes.UP:
          e.preventDefault();
          decrementActiveIndex();
          selectTab(tabs[activeIndex]);
          break;

        case util.keyCodes.DOWN:
          e.preventDefault();
          incrementActiveIndex();
          selectTab(tabs[activeIndex]);
          break;

        case util.keyCodes.ENTER:
        case util.keyCodes.SPACE:
          e.preventDefault();
          activateTab(tabs[activeIndex]);
          tabs[activeIndex].focus();
          break;

        case util.keyCodes.TAB:
          tabpanels[activeIndex].setAttribute('tabindex', '0');
          break;

        case util.keyCodes.HOME:
          e.preventDefault();
          firstTab.focus();
          break;

        case util.keyCodes.END:
          e.preventDefault();
          lastTab.focus();
          break;
      }

    }





    init.call(this);
    return this;
  }; // ARIAtabs()

  w.ARIAtabs = ARIAtabs;
})(window, document);


var tabsInstance = "[data-tabs]";
var els = document.querySelectorAll(tabsInstance);
var allTabs = [];

// Generate all accordion instances
for (var i = 0; i < els.length; i++) {
  var nTabs = new ARIAtabs(els[i]);
  allTabs.push(nTabs);
}

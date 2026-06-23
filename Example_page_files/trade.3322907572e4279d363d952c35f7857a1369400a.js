(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('vue-infinite-scroll',factory) :
  (global.infiniteScroll = factory());
}(this, function () { 'use strict';

  var ctx = '@@InfiniteScroll';

  var throttle = function throttle(fn, delay) {
    var now, lastExec, timer, context, args; //eslint-disable-line

    var execute = function execute() {
      fn.apply(context, args);
      lastExec = now;
    };

    return function () {
      context = this;
      args = arguments;

      now = Date.now();

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      if (lastExec) {
        var diff = delay - (now - lastExec);
        if (diff < 0) {
          execute();
        } else {
          timer = setTimeout(function () {
            execute();
          }, diff);
        }
      } else {
        execute();
      }
    };
  };

  var getScrollTop = function getScrollTop(element) {
    if (element === window) {
      return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
    }

    return element.scrollTop;
  };

  var getComputedStyle = document.defaultView.getComputedStyle;

  var getScrollEventTarget = function getScrollEventTarget(element) {
    var currentNode = element;
    // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
    while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
      var overflowY = getComputedStyle(currentNode).overflowY;
      if (overflowY === 'scroll' || overflowY === 'auto') {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
    return window;
  };

  var getVisibleHeight = function getVisibleHeight(element) {
    if (element === window) {
      return document.documentElement.clientHeight;
    }

    return element.clientHeight;
  };

  var getElementTop = function getElementTop(element) {
    if (element === window) {
      return getScrollTop(window);
    }
    return element.getBoundingClientRect().top + getScrollTop(window);
  };

  var isAttached = function isAttached(element) {
    var currentNode = element.parentNode;
    while (currentNode) {
      if (currentNode.tagName === 'HTML') {
        return true;
      }
      if (currentNode.nodeType === 11) {
        return false;
      }
      currentNode = currentNode.parentNode;
    }
    return false;
  };

  var doBind = function doBind() {
    if (this.binded) return; // eslint-disable-line
    this.binded = true;

    var directive = this;
    var element = directive.el;

    directive.scrollEventTarget = getScrollEventTarget(element);
    directive.scrollListener = throttle(doCheck.bind(directive), 200);
    directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener);

    var disabledExpr = element.getAttribute('infinite-scroll-disabled');
    var disabled = false;

    if (disabledExpr) {
      this.vm.$watch(disabledExpr, function (value) {
        directive.disabled = value;
        if (!value && directive.immediateCheck) {
          doCheck.call(directive);
        }
      });
      disabled = Boolean(directive.vm[disabledExpr]);
    }
    directive.disabled = disabled;

    var distanceExpr = element.getAttribute('infinite-scroll-distance');
    var distance = 0;
    if (distanceExpr) {
      distance = Number(directive.vm[distanceExpr] || distanceExpr);
      if (isNaN(distance)) {
        distance = 0;
      }
    }
    directive.distance = distance;

    var immediateCheckExpr = element.getAttribute('infinite-scroll-immediate-check');
    var immediateCheck = true;
    if (immediateCheckExpr) {
      immediateCheck = Boolean(directive.vm[immediateCheckExpr]);
    }
    directive.immediateCheck = immediateCheck;

    if (immediateCheck) {
      doCheck.call(directive);
    }

    var eventName = element.getAttribute('infinite-scroll-listen-for-event');
    if (eventName) {
      directive.vm.$on(eventName, function () {
        doCheck.call(directive);
      });
    }
  };

  var doCheck = function doCheck(force) {
    var scrollEventTarget = this.scrollEventTarget;
    var element = this.el;
    var distance = this.distance;

    if (force !== true && this.disabled) return; //eslint-disable-line
    var viewportScrollTop = getScrollTop(scrollEventTarget);
    var viewportBottom = viewportScrollTop + getVisibleHeight(scrollEventTarget);

    var shouldTrigger = false;

    if (scrollEventTarget === element) {
      shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance;
    } else {
      var elementBottom = getElementTop(element) - getElementTop(scrollEventTarget) + element.offsetHeight + viewportScrollTop;

      shouldTrigger = parseInt(viewportBottom + distance) >= parseInt(elementBottom);
    }

    if (shouldTrigger && this.expression) {
      this.expression();
    }
  };

  var InfiniteScroll = {
    bind: function bind(el, binding, vnode) {
      el[ctx] = {
        el: el,
        vm: vnode.context,
        expression: binding.value
      };
      var args = arguments;
      el[ctx].vm.$on('hook:mounted', function () {
        el[ctx].vm.$nextTick(function () {
          if (isAttached(el)) {
            doBind.call(el[ctx], args);
          }

          el[ctx].bindTryCount = 0;

          var tryBind = function tryBind() {
            if (el[ctx].bindTryCount > 10) return; //eslint-disable-line
            el[ctx].bindTryCount++;
            if (isAttached(el)) {
              doBind.call(el[ctx], args);
            } else {
              setTimeout(tryBind, 50);
            }
          };

          tryBind();
        });
      });
    },
    unbind: function unbind(el) {
      el[ctx].scrollEventTarget.removeEventListener('scroll', el[ctx].scrollListener);
    }
  };

  var install = function install(Vue) {
    Vue.directive('InfiniteScroll', InfiniteScroll);
  };

  if (window.Vue) {
    window.infiniteScroll = InfiniteScroll;
    Vue.use(install); // eslint-disable-line
  }

  InfiniteScroll.install = install;

  return InfiniteScroll;

}));
! function(t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define('vue-multiselect',[], e) : "object" == typeof exports ? exports.VueMultiselect = e() : t.VueMultiselect = e()
}(this, function() {
    return function(t) {
        function e(n) {
            if (i[n]) return i[n].exports;
            var s = i[n] = {
                i: n,
                l: false,
                exports: {}
            };
            return t[n].call(s.exports, s, s.exports, e), s.l = true, s.exports
        }
        var i = {};
        return e.m = t, e.c = i, e.i = function(t) {
            return t
        }, e.d = function(t, i, n) {
            e.o(t, i) || Object.defineProperty(t, i, {
                configurable: false,
                enumerable: true,
                get: n
            })
        }, e.n = function(t) {
            var i = t && t.__esModule ? function() {
                return t.default
            } : function() {
                return t
            };
            return e.d(i, "a", i), i
        }, e.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        }, e.p = "/", e(e.s = 4)
    }([function(t, e, i) {
        "use strict";

        function n(t, e, i) {
            return e in t ? Object.defineProperty(t, e, {
                value: i,
                enumerable: true,
                configurable: true,
                writable: true
            }) : t[e] = i, t
        }

        function s(t) {
            return 0 !== t && (!(!Array.isArray(t) || 0 !== t.length) || !t)
        }

        function l(str, query) {
            if (str === undefined) str = 'undefined';
            if (str === null) str = 'null';
            if (str === false) str = 'false';
            var text = str.toString().toLowerCase();
            if (query.length && query.charAt(0) == '~') {
                var parts = query.substring(1).split(" ");
                var matches = 0;
                for (var i = 0; i < parts.length; i++) {
                    if (text.indexOf(parts[i].trim()) !== -1) matches++;
                }
                return matches == parts.length;
            }
            return text.indexOf(query.trim()) !== -1;
        }

        function o(t, e, i, n) {
            return t.filter(function(t) {
                return l(n(t, i), e)
            })
        }

        function r(t) {
            return t.filter(function(t) {
                return !t.$isLabel
            })
        }

        function a(t, e) {
            return function(i) {
                return i.reduce(function(i, n) {
                    return n[t] && n[t].length ? (i.push({
                        $groupLabel: n[e],
                        $isLabel: true
                    }), i.concat(n[t])) : i
                }, [])
            }
        }

        function u(t, e, i, s, l) {
            return function(r) {
                return r.map(function(r) {
                    var a;
                    if (!r[i]) return console.warn("Options passed to vue-multiselect do not contain groups, despite the config."), [];
                    var u = o(r[i], t, e, l);
                    return u.length ? (a = {}, n(a, s, r[s]), n(a, i, u), a) : []
                })
            }
        }
        Object.defineProperty(e, "__esModule", {
            value: true
        });
        var c = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                return typeof t
            } : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            },
            h = i(2),
            p = function(t) {
                return t && t.__esModule ? t : {
                    default: t
                }
            }(h),
            d = function() {
                for (var t = arguments.length, e = Array(t), i = 0; i < t; i++) e[i] = arguments[i];
                return function(t) {
                    return e.reduce(function(t, e) {
                        return e(t)
                    }, t)
                }
            };
        e.default = {
            data: function() {
                return {
                    search: "",
                    isOpen: false,
                    prefferedOpenDirection: "below",
                    optimizedHeight: this.maxHeight,
                    internalValue: this.value || 0 === this.value ? (0, p.default)(Array.isArray(this.value) ? this.value : [this.value]) : []
                }
            },
            props: {
                internalSearch: {
                    type: Boolean,
                    default: true
                },
                options: {
                    type: Array,
                    required: true
                },
                multiple: {
                    type: Boolean,
                    default: false
                },
                value: {
                    type: null,
                    default: function() {
                        return []
                    }
                },
                trackBy: {
                    type: String
                },
                label: {
                    type: String
                },
                searchable: {
                    type: Boolean,
                    default: true
                },
                clearOnSelect: {
                    type: Boolean,
                    default: true
                },
                hideSelected: {
                    type: Boolean,
                    default: false
                },
                placeholder: {
                    type: String,
                    default: "Select option"
                },
                hideUntilSearch: {
                    type: Boolean,
                    default: false
                },
                allowEmpty: {
                    type: Boolean,
                    default: true
                },
                resetAfter: {
                    type: Boolean,
                    default: false
                },
                closeOnSelect: {
                    type: Boolean,
                    default: true
                },
                customLabel: {
                    type: Function,
                    default: function(t, e) {
                        return s(t) ? "" : e ? t[e] : t
                    }
                },
                taggable: {
                    type: Boolean,
                    default: false
                },
                tagPlaceholder: {
                    type: String,
                    default: "Press enter to create a tag"
                },
                max: {
                    type: Number
                },
                id: {
                    default: null
                },
                optionsLimit: {
                    type: Number,
                    default: 5e2
                },
                groupValues: {
                    type: String
                },
                groupLabel: {
                    type: String
                },
                blockKeys: {
                    type: Array,
                    default: function() {
                        return []
                    }
                },
                preserveSearch: {
                    type: Boolean,
                    default: false
                }
            },
            mounted: function() {
                this.multiple || this.clearOnSelect || console.warn("[Vue-Multiselect warn]: ClearOnSelect and Multiple props can’t be both set to false.")
            },
            computed: {
                filteredOptions: function() {
                    var t = this.search || "",
                        e = t.toLowerCase(),
                        i = this.options.concat();
                    return this.internalSearch ? (i = this.groupValues ? this.filterAndFlat(i, e, this.label) : o(i, e, this.label, this.customLabel), i = this.hideSelected ? i.filter(this.isNotSelected) : i) : i = this.groupValues ? a(this.groupValues, this.groupLabel)(i) : i, this.taggable && e.length && !this.isExistingOption(e) && i.unshift({
                        isTag: true,
                        label: t
                    }), i.slice(0, this.optionsLimit)
                },
                valueKeys: function() {
                    var t = this;
                    return this.trackBy ? this.internalValue.map(function(e) {
                        return e[t.trackBy]
                    }) : this.internalValue
                },
                optionKeys: function() {
                    var t = this;
                    return (this.groupValues ? this.flatAndStrip(this.options) : this.options).map(function(e) {
                        return t.customLabel(e, t.label).toString().toLowerCase()
                    })
                },
                currentOptionLabel: function() {
                    return this.multiple ? this.searchable ? "" : this.placeholder : this.internalValue[0] ? this.getOptionLabel(this.internalValue[0]) : this.searchable ? "" : this.placeholder
                }
            },
            watch: {
                internalValue: function(t, e) {
                    this.resetAfter && this.internalValue.length && (this.search = "", this.internalValue = [])
                },
                search: function() {
                    this.$emit("search-change", this.search, this.id)
                },
                value: function(t) {
                    this.internalValue = this.getInternalValue(t)
                }
            },
            methods: {
                getValue: function() {
                    return this.multiple ? (0, p.default)(this.internalValue) : 0 === this.internalValue.length ? null : (0, p.default)(this.internalValue[0])
                },
                getInternalValue: function(t) {
                    return null === t || void 0 === t ? [] : this.multiple ? (0, p.default)(t) : (0, p.default)([t])
                },
                filterAndFlat: function(t, e, i) {
                    return d(u(e, i, this.groupValues, this.groupLabel, this.customLabel), a(this.groupValues, this.groupLabel))(t)
                },
                flatAndStrip: function(t) {
                    return d(a(this.groupValues, this.groupLabel), r)(t)
                },
                updateSearch: function(t) {
                    this.search = t
                },
                isExistingOption: function(t) {
                    return !!this.options && this.optionKeys.indexOf(t) > -1
                },
                isSelected: function(t) {
                    var e = this.trackBy ? t[this.trackBy] : t;
                    return this.valueKeys.indexOf(e) > -1
                },
                isNotSelected: function(t) {
                    return !this.isSelected(t)
                },
                getOptionLabel: function(t) {
                    return s(t) ? "" : t.isTag ? t.label : t.$isLabel ? t.$groupLabel : this.customLabel(t, this.label) || ""
                },
                select: function(t, e) {
                    if (!((e && -1 !== this.blockKeys.indexOf(e.key)) || this.disabled || t.$isLabel || t.$isDisabled || this.max && this.multiple && this.internalValue.length === this.max)) {
                        if (t.isTag) this.$emit("tag", t.label, this.id), this.search = "", this.closeOnSelect && !this.multiple && this.deactivate();
                        else {
                            this.multiple ? this.internalValue.push(t) : this.internalValue = [t], this.$emit("select", (0, p.default)(t), this.id), this.$emit("input", this.getValue(), this.id), this.clearOnSelect && (this.search = "")
                        }
                        (!e || e.key !== "Tab") && this.closeOnSelect && this.deactivate()
                    }
                },
                removeElement: function(t) {
                    var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                    if (!this.disabled) {
                        if (!this.allowEmpty && this.internalValue.length <= 1) return void this.pointerReset();
                        var i = "object" === (void 0 === t ? "undefined" : c(t)) ? this.valueKeys.indexOf(t[this.trackBy]) : this.valueKeys.indexOf(t);
                        this.internalValue.splice(i, 1), this.$emit("remove", (0, p.default)(t), this.id), this.$emit("input", this.getValue(), this.id), this.closeOnSelect && e && this.deactivate()
                    }
                },
                removeLastElement: function() {
                    -1 === this.blockKeys.indexOf("Delete") && 0 === this.search.length && Array.isArray(this.internalValue) && this.removeElement(this.internalValue[this.internalValue.length - 1], false)
                },
                activate: function() {
                    var t = this;
                    this.isOpen || this.disabled || (this.adjustPosition(), this.groupValues && 0 === this.pointer && this.filteredOptions.length && (this.pointer = 1), this.isOpen = true, this.searchable ? (this.preserveSearch || (this.search = ""), this.$nextTick(function() {
                        return t.$refs.search.focus()
                    })) : this.$el.focus(), this.$emit("open", this.id))
                },
                deactivate: function() {
                    this.isOpen && (this.isOpen = false, this.searchable ? this.$refs.search.blur() : this.$el.blur(), this.preserveSearch || (this.search = ""), this.$emit("close", this.getValue(), this.id))
                },
                toggle: function() {
                    this.isOpen ? this.deactivate() : this.activate()
                },
                adjustPosition: function() {
                    if ("undefined" != typeof window) {
                        var t = this.$el.getBoundingClientRect().top,
                            e = window.innerHeight - this.$el.getBoundingClientRect().bottom;
                        e > this.maxHeight || e > t || "below" === this.openDirection || "bottom" === this.openDirection ? (this.prefferedOpenDirection = "below", this.optimizedHeight = Math.min(e, this.maxHeight)) : (this.prefferedOpenDirection = "above", this.optimizedHeight = Math.min(t, this.maxHeight))
                    }
                }
            }
        }
    }, function(t, e, i) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: true
        }), e.default = {
            data: function() {
                return {
                    pointer: 0
                }
            },
            props: {
                showPointer: {
                    type: Boolean,
                    default: true
                }
            },
            computed: {
                pointerEl: function () {
                    var content = this.$refs.list.children[0];
                    return content.children[this.pointer] || null;
                },
                pointerPosition: function() {
                    return this.pointerEl ? this.pointerEl.offsetTop : 0;
                }
            },
            watch: {
                filteredOptions: function() {
                    this.pointerAdjust()
                }
            },
            methods: {
                scroll: function(e) {
                    // NOTE(rory): Disables scrolling the page when we get "past" the end of the multiselect list (if it has a scroll bar)
                    var $el = this.$refs.list;
                    if ($el.scrollHeight > $el.clientHeight && 
                        (($el.scrollTop === $el.scrollHeight - $el.clientHeight && e.deltaY > 0) || 
                         ($el.scrollTop === 0 && e.deltaY < 0)
                        )) {
                        e.preventDefault();
                    }
                },
                optionHighlight: function(t, e) {
                    return {
                        "multiselect__option--highlight": t === this.pointer && this.showPointer,
                        "multiselect__option--selected": this.isSelected(e)
                    }
                },
                addPointerElement: function(e) {
                    this.filteredOptions.length > 0 && this.select(this.filteredOptions[this.pointer], e), e.key !== "Tab" ? this.pointerReset() : null
                },
                pointerForward: function () {
                    if (this.pointer < this.filteredOptions.length - 1) {
                        this.pointer++;

                        if (this.$refs.list.scrollTop <= this.pointerPosition - this.$refs.list.offsetHeight) {
                            this.$refs.list.scrollTop = Math.max((this.pointerPosition + this.pointerEl.clientHeight) - this.$refs.list.offsetHeight, 0);
                        }

                        if (this.filteredOptions[this.pointer] &&
                            this.filteredOptions[this.pointer].$isLabel) {
                            this.pointerForward();
                        }
                    }
                },
                pointerBackward: function() {
                    if (this.pointer > 0) {
                        this.pointer--;

                        if (this.$refs.list.scrollTop > this.pointerPosition) {
                            this.$refs.list.scrollTop = this.pointerPosition;
                        }

                        if (this.filteredOptions[this.pointer] &&
                            this.filteredOptions[this.pointer].$isLabel) {
                            this.pointerBackward();
                        }
                    }
                    else if (this.filteredOptions[0] &&
                        this.filteredOptions[0].$isLabel) {
                        this.pointerForward();
                    }
                },
                pointerReset: function() {
                    this.closeOnSelect && (this.pointer = 0, this.$refs.list && (this.$refs.list.scrollTop = 0))
                },
                pointerAdjust: function() {
                    this.pointer >= this.filteredOptions.length - 1 && (this.pointer = this.filteredOptions.length ? this.filteredOptions.length - 1 : 0)
                },
                pointerSet: function(t) {
                    this.pointer = t
                },
                pointerSetCurrent: function() {
                    var i = 0;
                    while (i < this.filteredOptions.length) {
                        if (this.isSelected(this.filteredOptions[i])) {
                            this.pointerSet(i);
                            break;
                        }
                        i++;
                    }
                },
                pointerEnsureVisible: function() {
                    this.$refs.list.scrollTop = this.pointerPosition;
                }
            }
        }
    }, function(t, e, i) {
        "use strict";

        function n(t) {
            if (Array.isArray(t)) return t.map(n);
            if (t && "object" === (void 0 === t ? "undefined" : s(t))) {
                for (var e = {}, i = Object.keys(t), l = 0, o = i.length; l < o; l++) {
                    var r = i[l];
                    e[r] = n(t[r])
                }
                return e
            }
            return t
        }
        Object.defineProperty(e, "__esModule", {
            value: true
        });
        var s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        };
        e.default = n
    }, function(t, e, i) {
        i(6);
        var n = i(7)(i(5), i(8), null, null);
        t.exports = n.exports
    }, function(t, e, i) {
        "use strict";

        function n(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }
        Object.defineProperty(e, "__esModule", {
            value: true
        }), e.deepClone = e.pointerMixin = e.multiselectMixin = e.Multiselect = void 0;
        var s = i(3),
            l = n(s),
            o = i(0),
            r = n(o),
            a = i(1),
            u = n(a),
            c = i(2),
            h = n(c);
        e.default = l.default, e.Multiselect = l.default, e.multiselectMixin = r.default, e.pointerMixin = u.default, e.deepClone = h.default
    }, function(t, e, i) {
        "use strict";

        function n(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }
        Object.defineProperty(e, "__esModule", {
            value: true
        });
        var s = i(0),
            l = n(s),
            o = i(1),
            r = n(o);
        e.default = {
            name: "vue-multiselect",
            mixins: [l.default, r.default],
            props: {
                name: {
                    type: String,
                    default: ""
                },
                selectLabel: {
                    type: String,
                    default: "Press enter to select"
                },
                selectedLabel: {
                    type: String,
                    default: "Selected"
                },
                deselectLabel: {
                    type: String,
                    default: "Press enter to remove"
                },
                showLabels: {
                    type: Boolean,
                    default: false
                },
                limit: {
                    type: Number,
                    default: 99999
                },
                maxHeight: {
                    type: Number,
                    default: 300
                },
                limitText: {
                    type: Function,
                    default: function(t) {
                        return "and " + t + " more"
                    }
                },
                loading: {
                    type: Boolean,
                    default: false
                },
                disabled: {
                    type: Boolean,
                    default: false
                },
                openDirection: {
                    type: String,
                    default: ""
                },
                showNoResults: {
                    type: Boolean,
                    default: true
                },
                tabindex: {
                    type: Number,
                    default: 0
                }
            },
            computed: {
                visibleValue: function() {
                    return this.multiple ? this.internalValue.slice(0, this.limit) : []
                },
                deselectLabelText: function() {
                    return this.showLabels ? this.deselectLabel : ""
                },
                selectLabelText: function() {
                    return this.showLabels ? this.selectLabel : ""
                },
                selectedLabelText: function() {
                    return this.showLabels ? this.selectedLabel : ""
                },
                inputStyle: function() {
                    if (this.multiple && this.value && this.value.length) return this.isOpen ? {
                        width: "auto"
                    } : {
                        display: "none"
                    }
                },
                contentStyle: function() {
                    return this.options.length ? {
                        display: "inline-block"
                    } : {
                        display: "block"
                    }
                },
                isAbove: function() {
                    return "above" === this.openDirection || "top" === this.openDirection || "below" !== this.openDirection && "bottom" !== this.openDirection && "above" === this.prefferedOpenDirection
                }
            }
        }
    }, function(t, e) {}, function(t, e) {
        t.exports = function(t, e, i, n) {
            var s, l = t = t || {},
                o = typeof t.default;
            "object" !== o && "function" !== o || (s = t, l = t.default);
            var r = "function" == typeof l ? l.options : l;
            if (e && (r.render = e.render, r.staticRenderFns = e.staticRenderFns), i && (r._scopeId = i), n) {
                var a = Object.create(r.computed || null);
                Object.keys(n).forEach(function(t) {
                    var e = n[t];
                    a[t] = function() {
                        return e
                    }
                }), r.computed = a
            }
            return {
                esModule: s,
                exports: l,
                options: r
            }
        }
    }, function(t, e) {
        t.exports = {
            render: function() {
                var t = this,
                    e = t.$createElement,
                    i = t._self._c || e;
                return i("div", {
                    staticClass: "multiselect",
                    class: {
                        "multiselect--active": t.isOpen, "multiselect--disabled": t.disabled, "multiselect--above": t.isAbove
                    },
                    attrs: {
                        tabindex: t.tabindex
                    },
                    on: {
                        focus: function(e) {
                            t.activate()
                        },
                        blur: function(e) {
                            !t.searchable && t.deactivate()
                        },
                        keydown: [function(e) {
                            return "button" in e || !t._k(e.keyCode, "down", 40) ? e.target !== e.currentTarget ? null : (e.preventDefault(), void t.pointerForward()) : null
                        }, function(e) {
                            return "button" in e || !t._k(e.keyCode, "up", 38) ? e.target !== e.currentTarget ? null : (e.preventDefault(), void t.pointerBackward()) : null
                        }, function(e) {
                            return "button" in e || !t._k(e.keyCode, "enter", 13) ? (e.stopPropagation(), void t.addPointerElement(e)) : null
                        }, function(e) {
                            return "button" in e || !t._k(e.keyCode, "tab", 9) ? void t.addPointerElement(e) : null
                        }],
                        keyup: function(e) {
                            if (!("button" in e) && t._k(e.keyCode, "esc", 27)) return null;
                            t.deactivate()
                        }
                    }
                }, [t._t("carret", [i("div", {
                    staticClass: "multiselect__select",
                    on: {
                        mousedown: function(e) {
                            e.preventDefault(), e.stopPropagation(), t.toggle()
                        }
                    }
                })]), t._v(" "), t._t("clear", null, {
                    search: t.search
                }), t._v(" "), i("div", {
                    ref: "tags",
                    staticClass: "multiselect__tags"
                }, [i("div", {
                    directives: [{
                        name: "show",
                        rawName: "v-show",
                        value: t.visibleValue.length > 0,
                        expression: "visibleValue.length > 0"
                    }],
                    staticClass: "multiselect__tags-wrap"
                }, [t._l(t.visibleValue, function(e) {
                    return [t._t("tag", [i("span", {
                        staticClass: "multiselect__tag"
                    }, [i("span", {
                        domProps: {
                            textContent: t._s(t.getOptionLabel(e))
                        }
                    }), t._v(" "), i("i", {
                        staticClass: "multiselect__tag-icon",
                        attrs: {
                            "aria-hidden": "true",
                            tabindex: "1"
                        },
                        on: {
                            keydown: function(i) {
                                if (!("button" in i) && t._k(i.keyCode, "enter", 13)) return null;
                                i.preventDefault(), t.removeElement(e)
                            },
                            mousedown: function(i) {
                                i.preventDefault(), t.removeElement(e)
                            }
                        }
                    })])], {
                        option: e,
                        search: t.search,
                        remove: t.removeElement
                    })]
                })], 2), t._v(" "), t.internalValue && t.internalValue.length > t.limit ? [i("strong", {
                    staticClass: "multiselect__strong",
                    domProps: {
                        textContent: t._s(t.limitText(t.internalValue.length - t.limit))
                    }
                })] : t._e(), t._v(" "), i("transition", {
                    attrs: {
                        name: "multiselect__loading"
                    }
                }, [t._t("loading", [i("div", {
                    directives: [{
                        name: "show",
                        rawName: "v-show",
                        value: t.loading,
                        expression: "loading"
                    }],
                    staticClass: "multiselect__spinner"
                })])], 2), t._v(" "), t.searchable ? i("input", {
                    ref: "search",
                    staticClass: "multiselect__input",
                    style: t.inputStyle,
                    attrs: {
                        name: t.name,
                        id: t.id,
                        type: "text",
                        autocomplete: "off",
                        placeholder: t.placeholder,
                        disabled: t.disabled
                    },
                    domProps: {
                        value: t.isOpen ? t.search : t.currentOptionLabel
                    },
                    on: {
                        input: function(e) {
                            t.updateSearch(e.target.value)
                        },
                        focus: function(e) {
                            e.preventDefault(), t.activate()
                        },
                        blur: function(e) {
                            e.preventDefault(), t.deactivate()
                        },
                        keyup: function(e) {
                            if (!("button" in e) && t._k(e.keyCode, "esc", 27)) return null;
                            t.deactivate()
                        },
                        keydown: [function(e) {
                            if (!("button" in e) && t._k(e.keyCode, "down", 40)) return null;
                            e.preventDefault(), t.pointerForward()
                        }, function(e) {
                            if (!("button" in e) && t._k(e.keyCode, "up", 38)) return null;
                            e.preventDefault(), t.pointerBackward()
                        }, function(e) {
                            return "button" in e || !t._k(e.keyCode, "enter", 13) ? (e.preventDefault(), e.stopPropagation(), void t.addPointerElement(e)) : null
                        }, function(e) {
                            if (!("button" in e) && t._k(e.keyCode, "delete", [8, 46])) return null;
                            e.stopPropagation(), t.removeLastElement()
                        }]
                    }
                }) : t._e(), t._v(" "), t.searchable ? t._e() : i("span", {
                    staticClass: "multiselect__single",
                    domProps: {
                        textContent: t._s(t.currentOptionLabel)
                    }
                })], 2), t._v(" "), i("transition", {
                    attrs: {
                        name: "multiselect"
                    }
                }, [i("div", {
                    directives: [{
                        name: "show",
                        rawName: "v-show",
                        value: t.isOpen && (!t.hideUntilSearch || (t.search && !t.loading)),
                        expression: "isOpen && (!hideUntilSearch || (search && !loading))"
                    }],
                    ref: "list",
                    staticClass: "multiselect__content-wrapper",
                    style: {
                        maxHeight: t.optimizedHeight + "px"
                    },
                    on: {
                        mousedown: function(t) {
                            t.preventDefault()
                        },
                        wheel: function(e) {
                            t.scroll(e);
                        }
                    }
                }, [i("ul", {
                    staticClass: "multiselect__content",
                    style: t.contentStyle
                }, [t._t("beforeList"), t._v(" "), t.multiple && t.max === t.internalValue.length ? i("li", [i("span", {
                    staticClass: "multiselect__option"
                }, [t._t("maxElements", [t._v("Maximum of " + t._s(t.max) + " options selected. First remove a selected option to select another.")])], 2)]) : t._e(), t._v(" "), !t.max || t.internalValue.length < t.max ? t._l(t.filteredOptions, function(e, n) {
                    return i("li", {
                        key: n,
                        staticClass: "multiselect__element"
                    }, [e && (e.$isLabel || e.$isDisabled) ? t._e() : i("span", {
                        staticClass: "multiselect__option",
                        class: t.optionHighlight(n, e),
                        attrs: {
                            "data-select": e && e.isTag ? t.tagPlaceholder : t.selectLabelText,
                            "data-selected": t.selectedLabelText,
                            "data-deselect": t.deselectLabelText
                        },
                        on: {
                            click: function(i) {
                                i.stopPropagation(), t.select(e)
                            },
                            mouseenter: function(e) {
                                if (e.target !== e.currentTarget) return null;
                                t.pointerSet(n)
                            }
                        }
                    }, [t._t("option", [i("span", [t._v(t._s(t.getOptionLabel(e)))])], {
                        option: e,
                        search: t.search
                    })], 2), t._v(" "), e && (e.$isLabel || e.$isDisabled) ? i("span", {
                        staticClass: "multiselect__option multiselect__option--disabled",
                        class: t.optionHighlight(n, e)
                    }, [t._t("option", [i("span", [t._v(t._s(t.getOptionLabel(e)))])], {
                        option: e,
                        search: t.search
                    })], 2) : t._e()])
                }) : t._e(), t._v(" "), i("li", {
                    directives: [{
                        name: "show",
                        rawName: "v-show",
                        value: t.showNoResults && 0 === t.filteredOptions.length && t.search && !t.loading,
                        expression: "showNoResults && (filteredOptions.length === 0 && search && !loading)"
                    }]
                }, [i("span", {
                    staticClass: "multiselect__option"
                }, [t._t("noResult", [t._v("No elements found. Consider changing the search query.")])], 2)]), t._v(" "), t._t("afterList")], 2)])])], 2)
            },
            staticRenderFns: []
        }
    }])
});
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define('vue-toastr',[],e):"object"==typeof exports?exports.vueToastr=e():t.vueToastr=e()}(this,function(){return function(t){function e(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var o={};return e.m=t,e.c=o,e.p="/dist/",e(0)}([function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=o(17),i=n(r);o(44),e.default=i.default,t.exports=e.default},function(t,e){var o=Object;t.exports={create:o.create,getProto:o.getPrototypeOf,isEnum:{}.propertyIsEnumerable,getDesc:o.getOwnPropertyDescriptor,setDesc:o.defineProperty,setDescs:o.defineProperties,getKeys:o.keys,getNames:o.getOwnPropertyNames,getSymbols:o.getOwnPropertySymbols,each:[].forEach}},function(t,e){var o=t.exports={version:"1.2.6"};"number"==typeof __e&&(__e=o)},function(t,e){var o=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=o)},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,o){var n=o(29),r=o(7);t.exports=function(t){return n(r(t))}},function(t,e){var o={}.toString;t.exports=function(t){return o.call(t).slice(8,-1)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,o){t.exports=!o(4)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e,o){var n=o(3),r=o(2),i=o(25),s="prototype",a=function(t,e,o){var u,c,f,d=t&a.F,l=t&a.G,p=t&a.S,h=t&a.P,A=t&a.B,g=t&a.W,v=l?r:r[e]||(r[e]={}),m=l?n:p?n[e]:(n[e]||{})[s];l&&(o=e);for(u in o)c=!d&&m&&u in m,c&&u in v||(f=c?m[u]:o[u],v[u]=l&&"function"!=typeof m[u]?o[u]:A&&c?i(f,n):g&&m[u]==f?function(t){var e=function(e){return this instanceof t?new t(e):t(e)};return e[s]=t[s],e}(f):h&&"function"==typeof f?i(Function.call,f):f,h&&((v[s]||(v[s]={}))[u]=f))};a.F=1,a.G=2,a.S=4,a.P=8,a.B=16,a.W=32,t.exports=a},function(t,e){var o={}.hasOwnProperty;t.exports=function(t,e){return o.call(t,e)}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e,o){var n=o(3),r="__core-js_shared__",i=n[r]||(n[r]={});t.exports=function(t){return i[t]||(i[t]={})}},function(t,e){var o=0,n=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++o+n).toString(36))}},function(t,e,o){var n=o(12)("wks"),r=o(13),i=o(3).Symbol;t.exports=function(t){return n[t]||(n[t]=i&&i[t]||(i||r)("Symbol."+t))}},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={template:'<div class="toast-progress" v-bind:style="style"></div>',props:["data"],data:function(){return{intervalId:!1,hideEta:!1,style:{width:"100%"}}},mounted:function(){this.hideEta=(new Date).getTime()+this.data.timeout,this.setTimer()},destroyed:function(){clearInterval(this.intervalId)},methods:{setTimer:function(){var t=this;this.intervalId=setInterval(function(){t.updateProgress()},10)},updateProgress:function(){var t=this.hideEta-(new Date).getTime(),e=t/this.data.timeout*100;e=Math.floor(e),this.style.width=e+"%"}}},t.exports=e.default},function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=o(45),i=n(r),s=o(15),a=n(s);e.default={components:{toastProgress:a.default},template:i.default,props:["data"],data:function(){return{progressbar:!1,intervalId:!1}},mounted:function(){},created:function(){"undefined"!=typeof this.data.timeout&&0!=this.data.timeout&&(0!=this.data.progressbar&&(this.progressbar=!0),this.setTimeout())},beforeDestroy:function(){this.clearIntervalID()},methods:{clearIntervalID:function(){0!=this.intervalId&&clearInterval(this.intervalId),this.intervalId=!1},onMouseOver:function(){"undefined"!=typeof this.data.onMouseOver&&this.data.onMouseOver(),this.data.closeOnHover||this.clearIntervalID()},onMouseOut:function(){"undefined"!=typeof this.data.onMouseOut&&this.data.onMouseOut(),this.data.closeOnHover||this.setTimeout()},setTimeout:function(t){function e(){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}(function(){var t=this;this.intervalId=setTimeout(function(){t.close()},this.data.timeout)}),clicked:function(){"undefined"!=typeof this.data.onClicked&&this.data.onClicked(),this.cclose()},cclose:function(){"undefined"!=typeof this.data.clickClose&&0==this.data.clickClose||this.close()},close:function(){null!=this.$parent&&this.$parent.Close(this.data)}}},t.exports=e.default},function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var r=o(18),i=n(r),s=o(20),a=n(s),u=o(46),c=n(u),f=o(16),d=n(f);e.default={template:c.default,name:"vueToastr",data:function(){for(var t=["toast-top-center","toast-bottom-center"],e={},o=0;o<=t.length-1;o++)e[t[o]]=new Object;return{positions:t,defaultPosition:"toast-top-right",defaultType:"success",defaultCloseOnHover:!0,defaultTimeout:5e3,defaultProgressBar:!0,defaultPreventDuplicates:!1,list:e,index:0}},created:function(){},mounted:function(){},components:{toast:d.default},methods:{addToast:function(t){this.index++,t.index=this.index,this.$set(this.list[t.position],this.index,t),"undefined"!=typeof t.onCreated&&this.$nextTick(function(){t.onCreated()})},removeToast:function(t){var e=this.list[t.position][t.index];"undefined"!=typeof e&&(this.$delete(this.list[t.position],t.index),"undefined"!=typeof t.onClosed&&this.$nextTick(function(){t.onClosed()}))},Add:function(t){return this.AddData(this.processObjectData(t))},AddData:function(t){if("object"!==("undefined"==typeof t?"undefined":(0,a.default)(t)))return console.log("AddData accept only Object",t),!1;if(t.preventDuplicates)for(var e=(0,i.default)(this.list[t.position]),o=0;o<e.length;o++)if(this.list[t.position].title===t.title&&this.list[t.position].msg===t.msg)return console.log("Prevent Dublicates",t),!1;return this.addToast(t),t},processObjectData:function(t){return"object"===("undefined"==typeof t?"undefined":(0,a.default)(t))&&"undefined"!=typeof t.msg?("undefined"==typeof t.position&&(t.position=this.defaultPosition),"undefined"==typeof t.type&&(t.type=this.defaultType),"undefined"==typeof t.timeout&&(t.timeout=this.defaultTimeout),"undefined"==typeof t.progressbar&&(t.progressBar=this.defaultProgressBar),"undefined"==typeof t.closeOnHover&&(t.closeOnHover=this.defaultCloseOnHover),"undefined"==typeof t.preventDuplicates&&(t.preventDuplicates=this.defaultPreventDuplicates),t):{msg:t.toString(),position:this.defaultPosition,type:this.defaultType,timeout:this.defaultTimeout,closeOnHover:this.defaultCloseOnHover,progressBar:this.defaultProgressBar}},e:function(t,e){var o=this.processObjectData(t);return o.type="error","undefined"!=typeof e&&(o.title=e),this.AddData(o)},s:function(t,e){var o=this.processObjectData(t);return o.type="success","undefined"!=typeof e&&(o.title=e),this.AddData(o)},w:function(t,e){var o=this.processObjectData(t);return o.type="warning","undefined"!=typeof e&&(o.title=e),this.AddData(o)},i:function(t,e){var o=this.processObjectData(t);return o.type="info","undefined"!=typeof e&&(o.title=e),this.AddData(o)},Close:function(t){this.removeToast(t)},removeByType:function(t){for(var e=0;e<this.positions.length;e++)for(var o=(0,i.default)(this.list[this.positions[e]]),n=0;n<o.length;n++)this.list[this.positions[e]][o[n]].type===t&&this.Close(this.list[this.positions[e]][o[n]])},clearAll:function(){for(var t=0;t<this.positions.length;t++)for(var e=(0,i.default)(this.list[this.positions[t]]),o=0;o<e.length;o++)this.Close(this.list[this.positions[t]][e[o]])}}},t.exports=e.default},function(t,e,o){t.exports={default:o(21),__esModule:!0}},function(t,e,o){t.exports={default:o(22),__esModule:!0}},function(t,e,o){"use strict";var n=o(19).default;e.default=function(t){return t&&t.constructor===n?"symbol":typeof t},e.__esModule=!0},function(t,e,o){o(38),t.exports=o(2).Object.keys},function(t,e,o){o(40),o(39),t.exports=o(2).Symbol},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,o){var n=o(31);t.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},function(t,e,o){var n=o(23);t.exports=function(t,e,o){if(n(t),void 0===e)return t;switch(o){case 1:return function(o){return t.call(e,o)};case 2:return function(o,n){return t.call(e,o,n)};case 3:return function(o,n,r){return t.call(e,o,n,r)}}return function(){return t.apply(e,arguments)}}},function(t,e,o){var n=o(1);t.exports=function(t){var e=n.getKeys(t),o=n.getSymbols;if(o)for(var r,i=o(t),s=n.isEnum,a=0;i.length>a;)s.call(t,r=i[a++])&&e.push(r);return e}},function(t,e,o){var n=o(5),r=o(1).getNames,i={}.toString,s="object"==typeof window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],a=function(t){try{return r(t)}catch(t){return s.slice()}};t.exports.get=function(t){return s&&"[object Window]"==i.call(t)?a(t):r(n(t))}},function(t,e,o){var n=o(1),r=o(11);t.exports=o(8)?function(t,e,o){return n.setDesc(t,e,r(1,o))}:function(t,e,o){return t[e]=o,t}},function(t,e,o){var n=o(6);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},function(t,e,o){var n=o(6);t.exports=Array.isArray||function(t){return"Array"==n(t)}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,o){var n=o(1),r=o(5);t.exports=function(t,e){for(var o,i=r(t),s=n.getKeys(i),a=s.length,u=0;a>u;)if(i[o=s[u++]]===e)return o}},function(t,e){t.exports=!0},function(t,e,o){var n=o(9),r=o(2),i=o(4);t.exports=function(t,e){var o=(r.Object||{})[t]||Object[t],s={};s[t]=e(o),n(n.S+n.F*i(function(){o(1)}),"Object",s)}},function(t,e,o){t.exports=o(28)},function(t,e,o){var n=o(1).setDesc,r=o(10),i=o(14)("toStringTag");t.exports=function(t,e,o){t&&!r(t=o?t:t.prototype,i)&&n(t,i,{configurable:!0,value:e})}},function(t,e,o){var n=o(7);t.exports=function(t){return Object(n(t))}},function(t,e,o){var n=o(37);o(34)("keys",function(t){return function(e){return t(n(e))}})},function(t,e){},function(t,e,o){"use strict";var n=o(1),r=o(3),i=o(10),s=o(8),a=o(9),u=o(35),c=o(4),f=o(12),d=o(36),l=o(13),p=o(14),h=o(32),A=o(27),g=o(26),v=o(30),m=o(24),y=o(5),b=o(11),x=n.getDesc,w=n.setDesc,S=n.create,C=A.get,O=r.Symbol,I=r.JSON,j=I&&I.stringify,B=!1,D=p("_hidden"),R=n.isEnum,k=f("symbol-registry"),E=f("symbols"),U="function"==typeof O,T=Object.prototype,M=s&&c(function(){return 7!=S(w({},"a",{get:function(){return w(this,"a",{value:7}).a}})).a})?function(t,e,o){var n=x(T,e);n&&delete T[e],w(t,e,o),n&&t!==T&&w(T,e,n)}:w,Q=function(t){var e=E[t]=S(O.prototype);return e._k=t,s&&B&&M(T,t,{configurable:!0,set:function(e){i(this,D)&&i(this[D],t)&&(this[D][t]=!1),M(this,t,b(1,e))}}),e},N=function(t){return"symbol"==typeof t},P=function(t,e,o){return o&&i(E,e)?(o.enumerable?(i(t,D)&&t[D][e]&&(t[D][e]=!1),o=S(o,{enumerable:b(0,!1)})):(i(t,D)||w(t,D,b(1,{})),t[D][e]=!0),M(t,e,o)):w(t,e,o)},J=function(t,e){m(t);for(var o,n=g(e=y(e)),r=0,i=n.length;i>r;)P(t,o=n[r++],e[o]);return t},Y=function(t,e){return void 0===e?S(t):J(S(t),e)},G=function(t){var e=R.call(this,t);return!(e||!i(this,t)||!i(E,t)||i(this,D)&&this[D][t])||e},F=function(t,e){var o=x(t=y(t),e);return!o||!i(E,e)||i(t,D)&&t[D][e]||(o.enumerable=!0),o},H=function(t){for(var e,o=C(y(t)),n=[],r=0;o.length>r;)i(E,e=o[r++])||e==D||n.push(e);return n},V=function(t){for(var e,o=C(y(t)),n=[],r=0;o.length>r;)i(E,e=o[r++])&&n.push(E[e]);return n},L=function(t){if(void 0!==t&&!N(t)){for(var e,o,n=[t],r=1,i=arguments;i.length>r;)n.push(i[r++]);return e=n[1],"function"==typeof e&&(o=e),!o&&v(e)||(e=function(t,e){if(o&&(e=o.call(this,t,e)),!N(e))return e}),n[1]=e,j.apply(I,n)}},K=c(function(){var t=O();return"[null]"!=j([t])||"{}"!=j({a:t})||"{}"!=j(Object(t))});U||(O=function(){if(N(this))throw TypeError("Symbol is not a constructor");return Q(l(arguments.length>0?arguments[0]:void 0))},u(O.prototype,"toString",function(){return this._k}),N=function(t){return t instanceof O},n.create=Y,n.isEnum=G,n.getDesc=F,n.setDesc=P,n.setDescs=J,n.getNames=A.get=H,n.getSymbols=V,s&&!o(33)&&u(T,"propertyIsEnumerable",G,!0));var Z={for:function(t){return i(k,t+="")?k[t]:k[t]=O(t)},keyFor:function(t){return h(k,t)},useSetter:function(){B=!0},useSimple:function(){B=!1}};n.each.call("hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),function(t){var e=p(t);Z[t]=U?e:Q(e)}),B=!0,a(a.G+a.W,{Symbol:O}),a(a.S,"Symbol",Z),a(a.S+a.F*!U,"Object",{create:Y,defineProperty:P,defineProperties:J,getOwnPropertyDescriptor:F,getOwnPropertyNames:H,getOwnPropertySymbols:V}),I&&a(a.S+a.F*(!U||K),"JSON",{stringify:L}),d(O,"Symbol"),d(Math,"Math",!0),d(r.JSON,"JSON",!0)},function(t,e,o){e=t.exports=o(42)()},function(t,e){t.exports=function(){var t=[];return t.toString=function(){for(var t=[],e=0;e<this.length;e++){var o=this[e];o[2]?t.push("@media "+o[2]+"{"+o[1]+"}"):t.push(o[1])}return t.join("")},t.i=function(e,o){"string"==typeof e&&(e=[[null,e,""]]);for(var n={},r=0;r<this.length;r++){var i=this[r][0];"number"==typeof i&&(n[i]=!0)}for(r=0;r<e.length;r++){var s=e[r];"number"==typeof s[0]&&n[s[0]]||(o&&!s[2]?s[2]=o:o&&(s[2]="("+s[2]+") and ("+o+")"),t.push(s))}},t}},function(t,e,o){function n(t,e){for(var o=0;o<t.length;o++){var n=t[o],r=p[n.id];if(r){r.refs++;for(var i=0;i<r.parts.length;i++)r.parts[i](n.parts[i]);for(;i<n.parts.length;i++)r.parts.push(c(n.parts[i],e))}else{for(var s=[],i=0;i<n.parts.length;i++)s.push(c(n.parts[i],e));p[n.id]={id:n.id,refs:1,parts:s}}}}function r(t){for(var e=[],o={},n=0;n<t.length;n++){var r=t[n],i=r[0],s=r[1],a=r[2],u=r[3],c={css:s,media:a,sourceMap:u};o[i]?o[i].parts.push(c):e.push(o[i]={id:i,parts:[c]})}return e}function i(t,e){var o=g(),n=y[y.length-1];if("top"===t.insertAt)n?n.nextSibling?o.insertBefore(e,n.nextSibling):o.appendChild(e):o.insertBefore(e,o.firstChild),y.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");o.appendChild(e)}}function s(t){t.parentNode.removeChild(t);var e=y.indexOf(t);e>=0&&y.splice(e,1)}function a(t){var e=document.createElement("style");return e.type="text/css",i(t,e),e}function u(t){var e=document.createElement("link");return e.rel="stylesheet",i(t,e),e}function c(t,e){var o,n,r;if(e.singleton){var i=m++;o=v||(v=a(e)),n=f.bind(null,o,i,!1),r=f.bind(null,o,i,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(o=u(e),n=l.bind(null,o),r=function(){s(o),o.href&&URL.revokeObjectURL(o.href)}):(o=a(e),n=d.bind(null,o),r=function(){s(o)});return n(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;n(t=e)}else r()}}function f(t,e,o,n){var r=o?"":n.css;if(t.styleSheet)t.styleSheet.cssText=b(e,r);else{var i=document.createTextNode(r),s=t.childNodes;s[e]&&t.removeChild(s[e]),s.length?t.insertBefore(i,s[e]):t.appendChild(i)}}function d(t,e){var o=e.css,n=e.media;if(n&&t.setAttribute("media",n),t.styleSheet)t.styleSheet.cssText=o;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(o))}}function l(t,e){var o=e.css,n=e.sourceMap;n&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(n))))+" */");var r=new Blob([o],{type:"text/css"}),i=t.href;t.href=URL.createObjectURL(r),i&&URL.revokeObjectURL(i)}var p={},h=function(t){var e;return function(){return"undefined"==typeof e&&(e=t.apply(this,arguments)),e}},A=h(function(){return/msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase())}),g=h(function(){return document.head||document.getElementsByTagName("head")[0]}),v=null,m=0,y=[];t.exports=function(t,e){e=e||{},"undefined"==typeof e.singleton&&(e.singleton=A()),"undefined"==typeof e.insertAt&&(e.insertAt="bottom");var o=r(t);return n(o,e),function(t){for(var i=[],s=0;s<o.length;s++){var a=o[s],u=p[a.id];u.refs--,i.push(u)}if(t){var c=r(t);n(c,e)}for(var s=0;s<i.length;s++){var u=i[s];if(0===u.refs){for(var f=0;f<u.parts.length;f++)u.parts[f]();delete p[u.id]}}}};var b=function(){var t=[];return function(e,o){return t[e]=o,t.filter(Boolean).join("\n")}}()},function(t,e,o){var n=o(41);"string"==typeof n&&(n=[[t.id,n,""]]);o(43)(n,{});n.locals&&(t.exports=n.locals)},function(t,e){t.exports='<div v-bind:class="\'toast toast-\' + data.type" style="display: block" @click=clicked() v-on:mouseover=onMouseOver v-on:mouseout=onMouseOut> <toast-progress v-if=progressbar :data=data></toast-progress> <div class=toast-title v-html=data.title> </div> <div class=toast-message v-html=data.msg> </div> </div>'},function(t,e){t.exports='<div> <div v-bind:class="\'toast-container \' + position" v-for="(toasts, position) in list" :key=position> <toast :data=toast v-for="(toast, index) in toasts" :key=index> </toast> </div> </div>'}])});
/*!
 * clipboard.js v1.7.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define('clipboard',[],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,o){function i(a,c){if(!n[a]){if(!e[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(r)return r(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return i(n||t)},u,u.exports,t,e,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(t,e,n){function o(t,e){for(;t&&t.nodeType!==i;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var i=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}e.exports=o},{}],2:[function(t,e,n){function o(t,e,n,o,r){var a=i.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function i(t,e,n,o){return function(n){n.delegateTarget=r(n.target,e),n.delegateTarget&&o.call(t,n)}}var r=t("./closest");e.exports=o},{"./closest":1}],3:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},{}],4:[function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.fn(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return i(t,e,n);if(c.nodeList(t))return r(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function i(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function r(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return l(document.body,t,e,n)}var c=t("./is"),l=t("delegate");e.exports=o},{"./is":3,delegate:2}],5:[function(t,e,n){function o(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),i=document.createRange();i.selectNodeContents(t),o.removeAllRanges(),o.addRange(i),e=o.toString()}return e}e.exports=o},{}],6:[function(t,e,n){function o(){}o.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){i.off(t,o),e.apply(n,arguments)}var i=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,i=n.length;for(o;o<i;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],i=[];if(o&&e)for(var r=0,a=o.length;r<a;r++)o[r].fn!==e&&o[r].fn._!==e&&i.push(o[r]);return i.length?n[t]=i:delete n[t],this}},e.exports=o},{}],7:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","select"],r);else if(void 0!==o)r(n,e("select"));else{var a={exports:{}};r(a,i.select),i.clipboardAction=a.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),c=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return a(t,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=e.action,this.container=e.container,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""}},{key:"initSelection",value:function t(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function t(){var e=this,n="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return e.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[n?"right":"left"]="-9999px";var o=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=o+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,i.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function t(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function t(){this.selectedText=(0,i.default)(this.target),this.copyText()}},{key:"copyText",value:function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(t){e=!1}this.handleResult(e)}},{key:"handleResult",value:function t(e){this.emitter.emit(e?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function t(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function t(){this.removeFake()}},{key:"action",set:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!==(void 0===e?"undefined":r(e))||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&e.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(e.hasAttribute("readonly")||e.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=e}},get:function t(){return this._target}}]),t}();t.exports=c})},{select:5}],8:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","./clipboard-action","tiny-emitter","good-listener"],r);else if(void 0!==o)r(n,e("./clipboard-action"),e("tiny-emitter"),e("good-listener"));else{var a={exports:{}};r(a,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=a.exports}}(this,function(t,e,n,o){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var s=i(e),u=i(n),f=i(o),d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),p=function(t){function e(t,n){r(this,e);var o=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return o.resolveOptions(n),o.listenClick(t),o}return c(e,t),h(e,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText,this.container="object"===d(e.container)?e.container:document.body}},{key:"listenClick",value:function t(e){var n=this;this.listener=(0,f.default)(e,"click",function(t){return n.onClick(t)})}},{key:"onClick",value:function t(e){var n=e.delegateTarget||e.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s.default({action:this.action(n),target:this.target(n),text:this.text(n),container:this.container,trigger:n,emitter:this})}},{key:"defaultAction",value:function t(e){return l("action",e)}},{key:"defaultTarget",value:function t(e){var n=l("target",e);if(n)return document.querySelector(n)}},{key:"defaultText",value:function t(e){return l("text",e)}},{key:"destroy",value:function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],n="string"==typeof e?[e]:e,o=!!document.queryCommandSupported;return n.forEach(function(t){o=o&&!!document.queryCommandSupported(t)}),o}}]),e}(u.default);t.exports=p})},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)});
define('vue-clipboard',['require','clipboard'],function (require) {
  var Clipboard = require('clipboard')

  var VueClipboard = {
    install: function (Vue) {
      Vue.prototype.$copyText = function (text, container) {
        return new Promise(function (resolve, reject) {
          var fake_el = document.createElement('button');
          var clipboard = new Clipboard(fake_el, {
            text: function () { return text },
            action: function () { return 'copy' },
            container: typeof container === 'object' ? container : document.body
          });
          clipboard.on('success', function (e) {
            clipboard.destroy();
            resolve(e);
          });
          clipboard.on('error', function (e) {
            clipboard.destroy();
            reject(e);
          });
          fake_el.click();
        });
      };

      Vue.directive('clipboard', {
        bind: function (el, binding, vnode) {
          if(binding.arg === 'success') {
            el._v_clipboard_success = binding.value
          } else if(binding.arg === 'error') {
            el._v_clipboard_error = binding.value
          } else {
            var clipboard = new Clipboard(el, {
              text: function () { return binding.value },
              action: function () { return binding.arg === 'cut' ? 'cut' : 'copy' }
            })
            clipboard.on('success', function (e) {
              var callback = el._v_clipboard_success
              callback && callback(e)
            })
            clipboard.on('error', function (e) {
              var callback = el._v_clipboard_error
              callback && callback(e)
            })
            el._v_clipboard = clipboard
          }
        },
        update: function (el, binding) {
          if(binding.arg === 'success') {
            el._v_clipboard_success = binding.value
          } else if(binding.arg === 'error') {
            el._v_clipboard_error = binding.value
          } else {
            el._v_clipboard.text = function () { return binding.value }
            el._v_clipboard.action = function () { return binding.arg === 'cut' ? 'cut' : 'copy' }
          }
        },
        unbind: function (el, binding) {
          if(binding.arg === 'success') {
            delete el._v_clipboard_success
          } else if(binding.arg === 'error') {
            delete el._v_clipboard_error
          } else {
            el._v_clipboard.destroy()
            delete el._v_clipboard
          }
        }
      })
    }
  };

  return VueClipboard;
});
/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2018 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

/*!
 * Generated using the Bootstrap Customizer (https://getbootstrap.com/docs/3.3/customize/?id=7fee64e43a55e353d694174fb204af88)
 * Config saved to config.json and https://gist.github.com/7fee64e43a55e353d694174fb204af88
 */
if (typeof jQuery === 'undefined') {
    throw new Error('Bootstrap\'s JavaScript requires jQuery')
  }
  +function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
      throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
  }(jQuery);
  
  /* ========================================================================
   * Bootstrap: tooltip.js v3.3.7
   * http://getbootstrap.com/javascript/#tooltip
   * Inspired by the original jQuery.tipsy by Jason Frame
   * ========================================================================
   * Copyright 2011-2016 Twitter, Inc.
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * ======================================================================== */
  
  
  +function ($) {
    'use strict';
  
    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================
  
    var Tooltip = function (element, options) {
      this.type       = null
      this.options    = null
      this.enabled    = null
      this.timeout    = null
      this.hoverState = null
      this.$element   = null
      this.inState    = null
  
      this.init('tooltip', element, options)
    }
  
    Tooltip.VERSION  = '3.3.7'
  
    Tooltip.TRANSITION_DURATION = 150
  
    Tooltip.DEFAULTS = {
      animation: true,
      placement: 'top',
      selector: false,
      template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
      trigger: 'hover focus',
      title: '',
      delay: 0,
      html: false,
      container: false,
      viewport: {
        selector: 'body',
        padding: 0
      }
    }
  
    Tooltip.prototype.init = function (type, element, options) {
      this.enabled   = true
      this.type      = type
      this.$element  = $(element)
      this.options   = this.getOptions(options)
      this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
      this.inState   = { click: false, hover: false, focus: false }
  
      if (this.$element[0] instanceof document.constructor && !this.options.selector) {
        throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
      }
  
      var triggers = this.options.trigger.split(' ')
  
      for (var i = triggers.length; i--;) {
        var trigger = triggers[i]
  
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
        } else if (trigger != 'manual') {
          var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
          var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
  
          this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
        }
      }
  
      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }
  
    Tooltip.prototype.getDefaults = function () {
      return Tooltip.DEFAULTS
    }
  
    Tooltip.prototype.getOptions = function (options) {
      options = $.extend({}, this.getDefaults(), this.$element.data(), options)
  
      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay,
          hide: options.delay
        }
      }
  
      return options
    }
  
    Tooltip.prototype.getDelegateOptions = function () {
      var options  = {}
      var defaults = this.getDefaults()
  
      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value
      })
  
      return options
    }
  
    Tooltip.prototype.enter = function (obj) {
      var self = obj instanceof this.constructor ?
        obj : $(obj.currentTarget).data('bs.' + this.type)
  
      if (!self) {
        self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
        $(obj.currentTarget).data('bs.' + this.type, self)
      }
  
      if (obj instanceof $.Event) {
        self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
      }
  
      if (self.tip().hasClass('in') || self.hoverState == 'in') {
        self.hoverState = 'in'
        return
      }
  
      clearTimeout(self.timeout)
  
      self.hoverState = 'in'
  
      if (!self.options.delay || !self.options.delay.show) return self.show()
  
      self.timeout = setTimeout(function () {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }
  
    Tooltip.prototype.isInStateTrue = function () {
      for (var key in this.inState) {
        if (this.inState[key]) return true
      }
  
      return false
    }
  
    Tooltip.prototype.leave = function (obj) {
      var self = obj instanceof this.constructor ?
        obj : $(obj.currentTarget).data('bs.' + this.type)
  
      if (!self) {
        self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
        $(obj.currentTarget).data('bs.' + this.type, self)
      }
  
      if (obj instanceof $.Event) {
        self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
      }
  
      if (self.isInStateTrue()) return
  
      clearTimeout(self.timeout)
  
      self.hoverState = 'out'
  
      if (!self.options.delay || !self.options.delay.hide) return self.hide()
  
      self.timeout = setTimeout(function () {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }
  
    Tooltip.prototype.show = function () {
      var e = $.Event('show.bs.' + this.type)
  
      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e)
  
        var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
        if (e.isDefaultPrevented() || !inDom) return
        var that = this
  
        var $tip = this.tip()
  
        var tipId = this.getUID(this.type)
  
        this.setContent()
        $tip.attr('id', tipId)
        this.$element.attr('aria-describedby', tipId)
  
        if (this.options.animation) $tip.addClass('fade')
  
        var placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement
  
        var autoToken = /\s?auto?\s?/i
        var autoPlace = autoToken.test(placement)
        if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
  
        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })
          .addClass(placement)
          .data('bs.' + this.type, this)
  
        this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
        this.$element.trigger('inserted.bs.' + this.type)
  
        var pos          = this.getPosition()
        var actualWidth  = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight
  
        if (autoPlace) {
          var orgPlacement = placement
          var viewportDim = this.getPosition(this.$viewport)
  
          placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                      placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                      placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                      placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                      placement
  
          $tip
            .removeClass(orgPlacement)
            .addClass(placement)
        }
  
        var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
  
        this.applyPlacement(calculatedOffset, placement)
  
        var complete = function () {
          var prevHoverState = that.hoverState
          that.$element.trigger('shown.bs.' + that.type)
          that.hoverState = null
  
          if (prevHoverState == 'out') that.leave(that)
        }
  
        $.support.transition && this.$tip.hasClass('fade') ?
          $tip
            .one('bsTransitionEnd', complete)
            .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
          complete()
      }
    }
  
    Tooltip.prototype.applyPlacement = function (offset, placement) {
      var $tip   = this.tip()
      var width  = $tip[0].offsetWidth
      var height = $tip[0].offsetHeight
  
      // manually read margins because getBoundingClientRect includes difference
      var marginTop = parseInt($tip.css('margin-top'), 10)
      var marginLeft = parseInt($tip.css('margin-left'), 10)
  
      // we must check for NaN for ie 8/9
      if (isNaN(marginTop))  marginTop  = 0
      if (isNaN(marginLeft)) marginLeft = 0
  
      offset.top  += marginTop
      offset.left += marginLeft
  
      // $.fn.offset doesn't round pixel values
      // so we use setOffset directly with our own function B-0
      $.offset.setOffset($tip[0], $.extend({
        using: function (props) {
          $tip.css({
            top: Math.round(props.top),
            left: Math.round(props.left)
          })
        }
      }, offset), 0)
  
      $tip.addClass('in')
  
      // check to see if placing tip in new offset caused the tip to resize itself
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight
  
      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight
      }
  
      var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
  
      if (delta.left) offset.left += delta.left
      else offset.top += delta.top
  
      var isVertical          = /top|bottom/.test(placement)
      var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
      var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
  
      $tip.offset(offset)
      this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    }
  
    Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
      this.arrow()
        .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
        .css(isVertical ? 'top' : 'left', '')
    }
  
    Tooltip.prototype.setContent = function () {
      var $tip  = this.tip()
      var title = this.getTitle()
  
      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }
  
    Tooltip.prototype.hide = function (callback) {
      var that = this
      var $tip = $(this.$tip)
      var e    = $.Event('hide.bs.' + this.type)
  
      function complete() {
        if (that.hoverState != 'in') $tip.detach()
        if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
          that.$element
            .removeAttr('aria-describedby')
            .trigger('hidden.bs.' + that.type)
        }
        callback && callback()
      }
  
      this.$element.trigger(e)
  
      if (e.isDefaultPrevented()) return
  
      $tip.removeClass('in')
  
      $.support.transition && $tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
  
      this.hoverState = null
  
      return this
    }
  
    Tooltip.prototype.fixTitle = function () {
      var $e = this.$element
      if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
      }
    }
  
    Tooltip.prototype.hasContent = function () {
      return this.getTitle()
    }
  
    Tooltip.prototype.getPosition = function ($element) {
      $element   = $element || this.$element
  
      var el     = $element[0]
      var isBody = el.tagName == 'BODY'
  
      var elRect    = el.getBoundingClientRect()
      if (elRect.width == null) {
        // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
        elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
      }
      var isSvg = window.SVGElement && el instanceof window.SVGElement
      // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
      // See https://github.com/twbs/bootstrap/issues/20280
      var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
      var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
      var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null
  
      return $.extend({}, elRect, scroll, outerDims, elOffset)
    }
  
    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
      return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
             placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
             placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
          /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }
  
    }
  
    Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
      var delta = { top: 0, left: 0 }
      if (!this.$viewport) return delta
  
      var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
      var viewportDimensions = this.getPosition(this.$viewport)
  
      if (/right|left/.test(placement)) {
        var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
        var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
        if (topEdgeOffset < viewportDimensions.top) { // top overflow
          delta.top = viewportDimensions.top - topEdgeOffset
        } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
          delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
        }
      } else {
        var leftEdgeOffset  = pos.left - viewportPadding
        var rightEdgeOffset = pos.left + viewportPadding + actualWidth
        if (leftEdgeOffset < viewportDimensions.left) { // left overflow
          delta.left = viewportDimensions.left - leftEdgeOffset
        } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
          delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
        }
      }
  
      return delta
    }
  
    Tooltip.prototype.getTitle = function () {
      var title
      var $e = this.$element
      var o  = this.options
  
      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
  
      return title
    }
  
    Tooltip.prototype.getUID = function (prefix) {
      do prefix += ~~(Math.random() * 1000000)
      while (document.getElementById(prefix))
      return prefix
    }
  
    Tooltip.prototype.tip = function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
        if (this.$tip.length != 1) {
          throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
        }
      }
      return this.$tip
    }
  
    Tooltip.prototype.arrow = function () {
      return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
    }
  
    Tooltip.prototype.enable = function () {
      this.enabled = true
    }
  
    Tooltip.prototype.disable = function () {
      this.enabled = false
    }
  
    Tooltip.prototype.toggleEnabled = function () {
      this.enabled = !this.enabled
    }
  
    Tooltip.prototype.toggle = function (e) {
      var self = this
      if (e) {
        self = $(e.currentTarget).data('bs.' + this.type)
        if (!self) {
          self = new this.constructor(e.currentTarget, this.getDelegateOptions())
          $(e.currentTarget).data('bs.' + this.type, self)
        }
      }
  
      if (e) {
        self.inState.click = !self.inState.click
        if (self.isInStateTrue()) self.enter(self)
        else self.leave(self)
      } else {
        self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
      }
    }
  
    Tooltip.prototype.destroy = function () {
      var that = this
      clearTimeout(this.timeout)
      this.hide(function () {
        that.$element.off('.' + that.type).removeData('bs.' + that.type)
        if (that.$tip) {
          that.$tip.detach()
        }
        that.$tip = null
        that.$arrow = null
        that.$viewport = null
        that.$element = null
      })
    }
  
  
    // TOOLTIP PLUGIN DEFINITION
    // =========================
  
    function Plugin(option) {
      return this.each(function () {
        var $this   = $(this)
        var data    = $this.data('bs.tooltip')
        var options = typeof option == 'object' && option
  
        if (!data && /destroy|hide/.test(option)) return
        if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    var old = $.fn.tooltip
  
    $.fn.tooltip             = Plugin
    $.fn.tooltip.Constructor = Tooltip
  
  
    // TOOLTIP NO CONFLICT
    // ===================
  
    $.fn.tooltip.noConflict = function () {
      $.fn.tooltip = old
      return this
    }
  
  }(jQuery);
  
define("bootstrap-tooltip", ["plugins"], function(){});

/**
 * lscache library
 * Copyright (c) 2011, Pamela Fox
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jshint undef:true, browser:true, node:true */
/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define('lscache',[], factory);
  } else if (typeof module !== "undefined" && module.exports) {
      // CommonJS/Node module
      module.exports = factory();
  } else {
      // Browser globals
      root.lscache = factory();
  }
}(this, function () {

// Prefix for all lscache keys
var CACHE_PREFIX = 'lscache-';

// Suffix for the key name on the expiration items in localStorage
var CACHE_SUFFIX = '-cacheexpiration';

// expiration date radix (set to Base-36 for most space savings)
var EXPIRY_RADIX = 10;

// time resolution in milliseconds
var expiryMilliseconds = 60 * 1000;
// ECMAScript max Date (epoch + 1e8 days)
var maxDate = calculateMaxDate(expiryMilliseconds);

var cachedStorage;
var cachedJSON;
var cacheBucket = '';
var warnings = false;

// Determines if localStorage is supported in the browser;
// result is cached for better performance instead of being run each time.
// Feature detection is based on how Modernizr does it;
// it's not straightforward due to FF4 issues.
// It's not run at parse-time as it takes 200ms in Android.
function supportsStorage() {
  var key = '__lscachetest__';
  var value = key;

  if (cachedStorage !== undefined) {
    return cachedStorage;
  }

  // some browsers will throw an error if you try to access local storage (e.g. brave browser)
  // hence check is inside a try/catch
  try {
    if (!localStorage) {
      return false;
    }
  } catch (ex) {
    return false;
  }

  try {
    setItem(key, value);
    removeItem(key);
    cachedStorage = true;
  } catch (e) {
      // If we hit the limit, and we don't have an empty localStorage then it means we have support
      if (isOutOfSpace(e) && localStorage.length) {
          cachedStorage = true; // just maxed it out and even the set test failed.
      } else {
          cachedStorage = false;
      }
  }
  return cachedStorage;
}

// Check to set if the error is us dealing with being out of space
function isOutOfSpace(e) {
  return e && (
    e.name === 'QUOTA_EXCEEDED_ERR' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.name === 'QuotaExceededError'
  );
}

// Determines if native JSON (de-)serialization is supported in the browser.
function supportsJSON() {
  /*jshint eqnull:true */
  if (cachedJSON === undefined) {
    cachedJSON = (window.JSON != null);
  }
  return cachedJSON;
}

/**
 * Returns a string where all RegExp special characters are escaped with a \.
 * @param {String} text
 * @return {string}
 */
function escapeRegExpSpecialCharacters(text) {
  return text.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
}

/**
 * Returns the full string for the localStorage expiration item.
 * @param {String} key
 * @return {string}
 */
function expirationKey(key) {
  return key + CACHE_SUFFIX;
}

/**
 * Returns the number of minutes since the epoch.
 * @return {number}
 */
function currentTime() {
  return Math.floor((new Date().getTime())/expiryMilliseconds);
}

/**
 * Wrapper functions for localStorage methods
 */

function getItem(key) {
  return localStorage.getItem(CACHE_PREFIX + cacheBucket + key);
}

function setItem(key, value) {
  // Fix for iPad issue - sometimes throws QUOTA_EXCEEDED_ERR on setItem.
  localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
  localStorage.setItem(CACHE_PREFIX + cacheBucket + key, value);
}

function removeItem(key) {
  localStorage.removeItem(CACHE_PREFIX + cacheBucket + key);
}

function eachKey(fn) {
  var prefixRegExp = new RegExp('^' + CACHE_PREFIX + escapeRegExpSpecialCharacters(cacheBucket) + '(.*)');
  // We first identify which keys to process
  var keysToProcess = [];
  var key, i;
  for (i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);
    key = key && key.match(prefixRegExp);
    key = key && key[1];
    if (key && key.indexOf(CACHE_SUFFIX) < 0) {
      keysToProcess.push(key);
    }
  }
  // Then we apply the processing function to each key
  for (i = 0; i < keysToProcess.length; i++) {
    fn(keysToProcess[i], expirationKey(keysToProcess[i]));
  }
}

function flushItem(key) {
  var exprKey = expirationKey(key);

  removeItem(key);
  removeItem(exprKey);
}

function flushExpiredItem(key) {
  var exprKey = expirationKey(key);
  var expr = getItem(exprKey);

  if (expr) {
    var expirationTime = parseInt(expr, EXPIRY_RADIX);

    // Check if we should actually kick item out of storage
    if (currentTime() >= expirationTime) {
      removeItem(key);
      removeItem(exprKey);
      return true;
    }
  }
}

function warn(message, err) {
  if (!warnings) return;
  if (!('console' in window) || typeof window.console.warn !== 'function') return;
  window.console.warn("lscache - " + message);
  if (err) window.console.warn("lscache - The error was: " + err.message);
}

function calculateMaxDate(expiryMilliseconds) {
  return Math.floor(8.64e15/expiryMilliseconds);
}

var lscache = {
  /**
   * Stores the value in localStorage. Expires after specified number of minutes.
   * @param {string} key
   * @param {Object|string} value
   * @param {number} time
   * @return {boolean} whether the value was inserted successfully
   */
  set: function(key, value, time) {
    if (!supportsStorage()) return false;

    // If we don't get a string value, try to stringify
    // In future, localStorage may properly support storing non-strings
    // and this can be removed.

    if (!supportsJSON()) return false;
    try {
      value = JSON.stringify(value);
    } catch (e) {
      // Sometimes we can't stringify due to circular refs
      // in complex objects, so we won't bother storing then.
      return false;
    }

    try {
      setItem(key, value);
    } catch (e) {
      if (isOutOfSpace(e)) {
        // If we exceeded the quota, then we will sort
        // by the expire time, and then remove the N oldest
        var storedKeys = [];
        var storedKey;
        eachKey(function(key, exprKey) {
          var expiration = getItem(exprKey);
          if (expiration) {
            expiration = parseInt(expiration, EXPIRY_RADIX);
          } else {
            // TODO: Store date added for non-expiring items for smarter removal
            expiration = maxDate;
          }
          storedKeys.push({
            key: key,
            size: (getItem(key) || '').length,
            expiration: expiration
          });
        });
        // Sorts the keys with oldest expiration time last
        storedKeys.sort(function(a, b) { return (b.expiration-a.expiration); });

        var targetSize = (value||'').length;
        while (storedKeys.length && targetSize > 0) {
          storedKey = storedKeys.pop();
          warn("Cache is full, removing item with key '" + storedKey.key + "'");
          flushItem(storedKey.key);
          targetSize -= storedKey.size;
        }
        try {
          setItem(key, value);
        } catch (e) {
          // value may be larger than total quota
          warn("Could not add item with key '" + key + "', perhaps it's too big?", e);
          return false;
        }
      } else {
        // If it was some other error, just give up.
        warn("Could not add item with key '" + key + "'", e);
        return false;
      }
    }

    // If a time is specified, store expiration info in localStorage
    if (time) {
      setItem(expirationKey(key), (currentTime() + time).toString(EXPIRY_RADIX));
    } else {
      // In case they previously set a time, remove that info from localStorage.
      removeItem(expirationKey(key));
    }
    return true;
  },

  /**
   * Retrieves specified value from localStorage, if not expired.
   * @param {string} key
   * @return {string|Object}
   */
  get: function(key) {
    if (!supportsStorage()) return null;

    // Return the de-serialized item if not expired
    if (flushExpiredItem(key)) { return null; }

    // Tries to de-serialize stored value if its an object, and returns the normal value otherwise.
    var value = getItem(key);
    if (!value || !supportsJSON()) {
      return value;
    }

    try {
      // We can't tell if its JSON or a string, so we try to parse
      return JSON.parse(value);
    } catch (e) {
      // If we can't parse, it's probably because it isn't an object
      return value;
    }
  },

  /**
   * Removes a value from localStorage.
   * Equivalent to 'delete' in memcache, but that's a keyword in JS.
   * @param {string} key
   */
  remove: function(key) {
    if (!supportsStorage()) return;

    flushItem(key);
  },

  /**
   * Returns whether local storage is supported.
   * Currently exposed for testing purposes.
   * @return {boolean}
   */
  supported: function() {
    return supportsStorage();
  },

  /**
   * Flushes all lscache items and expiry markers without affecting rest of localStorage
   */
  flush: function() {
    if (!supportsStorage()) return;

    eachKey(function(key) {
      flushItem(key);
    });
  },

  /**
   * Flushes expired lscache items and expiry markers without affecting rest of localStorage
   */
  flushExpired: function() {
    if (!supportsStorage()) return;

    eachKey(function(key) {
      flushExpiredItem(key);
    });
  },

  /**
   * Appends CACHE_PREFIX so lscache will partition data in to different buckets.
   * @param {string} bucket
   */
  setBucket: function(bucket) {
    cacheBucket = bucket;
  },

  /**
   * Resets the string being appended to CACHE_PREFIX so lscache will use the default storage behavior.
   */
  resetBucket: function() {
    cacheBucket = '';
  },

  /**
   * @returns {number} The currently set number of milliseconds each time unit represents in
   *   the set() function's "time" argument.
   */
  getExpiryMilliseconds: function() {
    return expiryMilliseconds;
  },

  /**
   * Sets the number of milliseconds each time unit represents in the set() function's
   *   "time" argument.
   * Sample values:
   *  1: each time unit = 1 millisecond
   *  1000: each time unit = 1 second
   *  60000: each time unit = 1 minute (Default value)
   *  360000: each time unit = 1 hour
   * @param {number} milliseconds
   */
  setExpiryMilliseconds: function(milliseconds) {
      expiryMilliseconds = milliseconds;
      maxDate = calculateMaxDate(expiryMilliseconds);
  },

  /**
   * Sets whether to display warnings when an item is removed from the cache or not.
   */
  enableWarnings: function(enabled) {
    warnings = enabled;
  }
};

// Return the module
return lscache;
}));

/**
 * @license MIT or GPL-2.0
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
 * @source: https://github.com/ejci/favico.js
 * @version 0.3.10
 */

/**
 * Create new favico instance
 * @param {Object} Options
 * @return {Object} Favico object
 * @example
 * var favico = new Favico({
 *    bgColor : '#d00',
 *    textColor : '#fff',
 *    fontFamily : 'sans-serif',
 *    fontStyle : 'bold',
 *    type : 'circle',
 *    position : 'down',
 *    animation : 'slide',
 *    elementId: false,
 *    element: null,
 *    dataUrl: function(url){},
 *    win: window
 * });
 */
(function () {

	var Favico = (function (opt) {
		'use strict';
		opt = (opt) ? opt : {};
		var _def = {
			bgColor: '#d00',
			textColor: '#fff',
			fontFamily: 'sans-serif', //Arial,Verdana,Times New Roman,serif,sans-serif,...
			fontStyle: 'bold', //normal,italic,oblique,bold,bolder,lighter,100,200,300,400,500,600,700,800,900
			type: 'circle',
			position: 'down', // down, up, left, leftup (upleft)
			animation: 'slide',
			elementId: false,
			element: null,
			dataUrl: false,
			win: window
		};
		var _opt, _orig, _h, _w, _canvas, _context, _img, _ready, _lastBadge, _running, _readyCb, _stop, _browser, _animTimeout, _drawTimeout, _doc;

		_browser = {};
		_browser.ff = typeof InstallTrigger != 'undefined';
		_browser.chrome = !!window.chrome;
		_browser.opera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
		_browser.ie = /*@cc_on!@*/false;
		_browser.safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		_browser.supported = (_browser.chrome || _browser.ff || _browser.opera);

		var _queue = [];
		_readyCb = function () {
		};
		_ready = _stop = false;
		/**
		 * Initialize favico
		 */
		var init = function () {
			//merge initial options
			_opt = merge(_def, opt);
			_opt.bgColor = hexToRgb(_opt.bgColor);
			_opt.textColor = hexToRgb(_opt.textColor);
			_opt.position = _opt.position.toLowerCase();
			_opt.animation = (animation.types['' + _opt.animation]) ? _opt.animation : _def.animation;

			_doc = _opt.win.document;

			var isUp = _opt.position.indexOf('up') > -1;
			var isLeft = _opt.position.indexOf('left') > -1;

			//transform the animations
			if (isUp || isLeft) {
				for (var a in animation.types) {
					for (var i = 0; i < animation.types[a].length; i++) {
						var step = animation.types[a][i];

						if (isUp) {
							if (step.y < 0.6) {
								step.y = step.y - 0.4;
							} else {
								step.y = step.y - 2 * step.y + (1 - step.w);
							}
						}

						if (isLeft) {
							if (step.x < 0.6) {
								step.x = step.x - 0.4;
							} else {
								step.x = step.x - 2 * step.x + (1 - step.h);
							}
						}

						animation.types[a][i] = step;
					}
				}
			}
			_opt.type = (type['' + _opt.type]) ? _opt.type : _def.type;

			_orig = link. getIcons();
			//create temp canvas
			_canvas = document.createElement('canvas');
			//create temp image
			_img = document.createElement('img');
			var lastIcon = _orig[_orig.length - 1];
			if (lastIcon.hasAttribute('href')) {
				_img.setAttribute('crossOrigin', 'anonymous');
				//get width/height
				_img.onload = function () {
					_h = (_img.height > 0) ? _img.height : 32;
					_w = (_img.width > 0) ? _img.width : 32;
					_canvas.height = _h;
					_canvas.width = _w;
					_context = _canvas.getContext('2d');
					icon.ready();
				};
				_img.setAttribute('src', lastIcon.getAttribute('href'));
			} else {
				_h = 32;
				_w = 32;
				_img.height = _h;
				_img.width = _w;
				_canvas.height = _h;
				_canvas.width = _w;
				_context = _canvas.getContext('2d');
				icon.ready();
			}

		};
		/**
		 * Icon namespace
		 */
		var icon = {};
		/**
		 * Icon is ready (reset icon) and start animation (if ther is any)
		 */
		icon.ready = function () {
			_ready = true;
			icon.reset();
			_readyCb();
		};
		/**
		 * Reset icon to default state
		 */
		icon.reset = function () {
			//reset
			if (!_ready) {
				return;
			}
			_queue = [];
			_lastBadge = false;
			_running = false;
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			//_stop=true;
			link.setIcon(_canvas);
			//webcam('stop');
			//video('stop');
			window.clearTimeout(_animTimeout);
			window.clearTimeout(_drawTimeout);
		};
		/**
		 * Start animation
		 */
		icon.start = function () {
			if (!_ready || _running) {
				return;
			}
			var finished = function () {
				_lastBadge = _queue[0];
				_running = false;
				if (_queue.length > 0) {
					_queue.shift();
					icon.start();
				} else {

				}
			};
			if (_queue.length > 0) {
				_running = true;
				var run = function () {
					// apply options for this animation
					['type', 'animation', 'bgColor', 'textColor', 'fontFamily', 'fontStyle'].forEach(function (a) {
						if (a in _queue[0].options) {
							_opt[a] = _queue[0].options[a];
						}
					});
					animation.run(_queue[0].options, function () {
						finished();
					}, false);
				};
				if (_lastBadge) {
					animation.run(_lastBadge.options, function () {
						run();
					}, true);
				} else {
					run();
				}
			}
		};

		/**
		 * Badge types
		 */
		var type = {};
		var options = function (opt) {
			opt.n = ((typeof opt.n) === 'number') ? Math.abs(opt.n | 0) : opt.n;
			opt.x = _w * opt.x;
			opt.y = _h * opt.y;
			opt.w = _w * opt.w;
			opt.h = _h * opt.h;
			opt.len = ("" + opt.n).length;
			return opt;
		};
		/**
		 * Generate circle
		 * @param {Object} opt Badge options
		 */
		type.circle = function (opt) {
			opt = options(opt);
			var more = false;
			if (opt.len === 2) {
				opt.x = opt.x - opt.w * 0.4;
				opt.w = opt.w * 1.4;
				more = true;
			} else if (opt.len >= 3) {
				opt.x = opt.x - opt.w * 0.65;
				opt.w = opt.w * 1.65;
				more = true;
			}
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			_context.beginPath();
			_context.font = _opt.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? 0.85 : 1)) + "px " + _opt.fontFamily;
			_context.textAlign = 'center';
			if (more) {
				_context.moveTo(opt.x + opt.w / 2, opt.y);
				_context.lineTo(opt.x + opt.w - opt.h / 2, opt.y);
				_context.quadraticCurveTo(opt.x + opt.w, opt.y, opt.x + opt.w, opt.y + opt.h / 2);
				_context.lineTo(opt.x + opt.w, opt.y + opt.h - opt.h / 2);
				_context.quadraticCurveTo(opt.x + opt.w, opt.y + opt.h, opt.x + opt.w - opt.h / 2, opt.y + opt.h);
				_context.lineTo(opt.x + opt.h / 2, opt.y + opt.h);
				_context.quadraticCurveTo(opt.x, opt.y + opt.h, opt.x, opt.y + opt.h - opt.h / 2);
				_context.lineTo(opt.x, opt.y + opt.h / 2);
				_context.quadraticCurveTo(opt.x, opt.y, opt.x + opt.h / 2, opt.y);
			} else {
				_context.arc(opt.x + opt.w / 2, opt.y + opt.h / 2, opt.h / 2, 0, 2 * Math.PI);
			}
			_context.fillStyle = 'rgba(' + _opt.bgColor.r + ',' + _opt.bgColor.g + ',' + _opt.bgColor.b + ',' + opt.o + ')';
			_context.fill();
			_context.closePath();
			_context.beginPath();
			_context.stroke();
			_context.fillStyle = 'rgba(' + _opt.textColor.r + ',' + _opt.textColor.g + ',' + _opt.textColor.b + ',' + opt.o + ')';
			//_context.fillText((more) ? '9+' : opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			if ((typeof opt.n) === 'number' && opt.n > 999) {
				_context.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000)) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.2));
			} else {
				_context.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			}
			_context.closePath();
		};
		/**
		 * Generate rectangle
		 * @param {Object} opt Badge options
		 */
		type.rectangle = function (opt) {
			opt = options(opt);
			var more = false;
			if (opt.len === 2) {
				opt.x = opt.x - opt.w * 0.4;
				opt.w = opt.w * 1.4;
				more = true;
			} else if (opt.len >= 3) {
				opt.x = opt.x - opt.w * 0.65;
				opt.w = opt.w * 1.65;
				more = true;
			}
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			_context.beginPath();
			_context.font = _opt.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? 0.9 : 1)) + "px " + _opt.fontFamily;
			_context.textAlign = 'center';
			_context.fillStyle = 'rgba(' + _opt.bgColor.r + ',' + _opt.bgColor.g + ',' + _opt.bgColor.b + ',' + opt.o + ')';
			_context.fillRect(opt.x, opt.y, opt.w, opt.h);
			_context.fillStyle = 'rgba(' + _opt.textColor.r + ',' + _opt.textColor.g + ',' + _opt.textColor.b + ',' + opt.o + ')';
			//_context.fillText((more) ? '9+' : opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			if ((typeof opt.n) === 'number' && opt.n > 999) {
				_context.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000)) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.2));
			} else {
				_context.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			}
			_context.closePath();
		};

		/**
		 * Set badge
		 */
		var badge = function (number, opts) {
			opts = ((typeof opts) === 'string' ? {
				animation: opts
			} : opts) || {};
			_readyCb = function () {
				try {
					if (typeof (number) === 'number' ? (number > 0) : (number !== '')) {
						var q = {
							type: 'badge',
							options: {
								n: number
							}
						};
						if ('animation' in opts && animation.types['' + opts.animation]) {
							q.options.animation = '' + opts.animation;
						}
						if ('type' in opts && type['' + opts.type]) {
							q.options.type = '' + opts.type;
						}
						['bgColor', 'textColor'].forEach(function (o) {
							if (o in opts) {
								q.options[o] = hexToRgb(opts[o]);
							}
						});
						['fontStyle', 'fontFamily'].forEach(function (o) {
							if (o in opts) {
								q.options[o] = opts[o];
							}
						});
						_queue.push(q);
						if (_queue.length > 100) {
							throw new Error('Too many badges requests in queue.');
						}
						icon.start();
					} else {
						icon.reset();
					}
				} catch (e) {
					throw new Error('Error setting badge. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};

		/**
		 * Set image as icon
		 */
		var image = function (imageElement) {
			_readyCb = function () {
				try {
					var w = imageElement.width;
					var h = imageElement.height;
					var newImg = document.createElement('img');
					var ratio = (w / _w < h / _h) ? (w / _w) : (h / _h);
					newImg.setAttribute('crossOrigin', 'anonymous');
					newImg.onload=function(){
						_context.clearRect(0, 0, _w, _h);
						_context.drawImage(newImg, 0, 0, _w, _h);
						link.setIcon(_canvas);
					};
					newImg.setAttribute('src', imageElement.getAttribute('src'));
					newImg.height = (h / ratio);
					newImg.width = (w / ratio);
				} catch (e) {
					throw new Error('Error setting image. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};
		/**
		 * Set the icon from a source url. Won't work with badges.
		 */
		var rawImageSrc = function (url) {
			_readyCb = function() {
				link.setIconSrc(url);
			};
			if (_ready) {
				_readyCb();
			}
		};
		/**
		 * Set video as icon
		 */
		var video = function (videoElement) {
			_readyCb = function () {
				try {
					if (videoElement === 'stop') {
						_stop = true;
						icon.reset();
						_stop = false;
						return;
					}
					//var w = videoElement.width;
					//var h = videoElement.height;
					//var ratio = (w / _w < h / _h) ? (w / _w) : (h / _h);
					videoElement.addEventListener('play', function () {
						drawVideo(this);
					}, false);

				} catch (e) {
					throw new Error('Error setting video. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};
		/**
		 * Set video as icon
		 */
		var webcam = function (action) {
			//UR
			if (!window.URL || !window.URL.createObjectURL) {
				window.URL = window.URL || {};
				window.URL.createObjectURL = function (obj) {
					return obj;
				};
			}
			if (_browser.supported) {
				var newVideo = false;
				navigator.getUserMedia = navigator.getUserMedia || navigator.oGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
				_readyCb = function () {
					try {
						if (action === 'stop') {
							_stop = true;
							icon.reset();
							_stop = false;
							return;
						}
						newVideo = document.createElement('video');
						newVideo.width = _w;
						newVideo.height = _h;
						navigator.getUserMedia({
							video: true,
							audio: false
						}, function (stream) {
							newVideo.src = URL.createObjectURL(stream);
							newVideo.play();
							drawVideo(newVideo);
						}, function () {
						});
					} catch (e) {
						throw new Error('Error setting webcam. Message: ' + e.message);
					}
				};
				if (_ready) {
					_readyCb();
				}
			}

		};

		var setOpt = function (key, value) {
			var opts = key;
			if (!(value == null && Object.prototype.toString.call(key) == '[object Object]')) {
				opts = {};
				opts[key] = value;
			}

			var keys = Object.keys(opts);
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] == 'bgColor' || keys[i] == 'textColor') {
					_opt[keys[i]] = hexToRgb(opts[keys[i]]);
				} else {
					_opt[keys[i]] = opts[keys[i]];
				}
			}

			_queue.push(_lastBadge);
			icon.start();
		};

		/**
		 * Draw video to context and repeat :)
		 */
		function drawVideo(video) {
			if (video.paused || video.ended || _stop) {
				return false;
			}
			//nasty hack for FF webcam (Thanks to Julian Ćwirko, kontakt@redsunmedia.pl)
			try {
				_context.clearRect(0, 0, _w, _h);
				_context.drawImage(video, 0, 0, _w, _h);
			} catch (e) {

			}
			_drawTimeout = setTimeout(function () {
				drawVideo(video);
			}, animation.duration);
			link.setIcon(_canvas);
		}

		var link = {};
		/**
		 * Get icons from HEAD tag or create a new <link> element
		 */
		link.getIcons = function () {
			var elms = [];
			//get link element
			var getLinks = function () {
				var icons = [];
				var links = _doc.getElementsByTagName('head')[0].getElementsByTagName('link');
				for (var i = 0; i < links.length; i++) {
					if ((/(^|\s)icon(\s|$)/i).test(links[i].getAttribute('rel'))) {
						icons.push(links[i]);
					}
				}
				return icons;
			};
			if (_opt.element) {
				elms = [_opt.element];
			} else if (_opt.elementId) {
				//if img element identified by elementId
				elms = [_doc.getElementById(_opt.elementId)];
				elms[0].setAttribute('href', elms[0].getAttribute('src'));
			} else {
				//if link element
				elms = getLinks();
				if (elms.length === 0) {
					elms = [_doc.createElement('link')];
					elms[0].setAttribute('rel', 'icon');
					_doc.getElementsByTagName('head')[0].appendChild(elms[0]);
				}
			}
			elms.forEach(function(item) {
				item.setAttribute('type', 'image/png');
			});
			return elms;
		};
		link.setIcon = function (canvas) {
			var url = canvas.toDataURL('image/png');
			link.setIconSrc(url);
		};
		link.setIconSrc = function (url) {
			if (_opt.dataUrl) {
				//if using custom exporter
				_opt.dataUrl(url);
			}
			if (_opt.element) {
				_opt.element.setAttribute('href', url);
				_opt.element.setAttribute('src', url);
			} else if (_opt.elementId) {
				//if is attached to element (image)
				var elm = _doc.getElementById(_opt.elementId);
				elm.setAttribute('href', url);
				elm.setAttribute('src', url);
			} else {
				//if is attached to fav icon
				if (_browser.ff || _browser.opera) {
					//for FF we need to "recreate" element, atach to dom and remove old <link>
					//var originalType = _orig.getAttribute('rel');
					var old = _orig[_orig.length - 1];
					var newIcon = _doc.createElement('link');
					_orig = [newIcon];
					//_orig.setAttribute('rel', originalType);
					if (_browser.opera) {
						newIcon.setAttribute('rel', 'icon');
					}
					newIcon.setAttribute('rel', 'icon');
					newIcon.setAttribute('type', 'image/png');
					_doc.getElementsByTagName('head')[0].appendChild(newIcon);
					newIcon.setAttribute('href', url);
					if (old.parentNode) {
						old.parentNode.removeChild(old);
					}
				} else {
					_orig.forEach(function(icon) {
						icon.setAttribute('href', url);
					});
				}
			}
		};

		//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
		//HEX to RGB convertor
		function hexToRgb(hex) {
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function (m, r, g, b) {
				return r + r + g + g + b + b;
			});
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : false;
		}

		/**
		 * Merge options
		 */
		function merge(def, opt) {
			var mergedOpt = {};
			var attrname;
			for (attrname in def) {
				mergedOpt[attrname] = def[attrname];
			}
			for (attrname in opt) {
				mergedOpt[attrname] = opt[attrname];
			}
			return mergedOpt;
		}

		/**
		 * Cross-browser page visibility shim
		 * http://stackoverflow.com/questions/12536562/detect-whether-a-window-is-visible
		 */
		function isPageHidden() {
			return _doc.hidden || _doc.msHidden || _doc.webkitHidden || _doc.mozHidden;
		}

		/**
		 * @namespace animation
		 */
		var animation = {};
		/**
		 * Animation "frame" duration
		 */
		animation.duration = 40;
		/**
		 * Animation types (none,fade,pop,slide)
		 */
		animation.types = {};
		animation.types.fade = [{
			x: 0.4,
			y: 0.4,
			w: 0.6,
			h: 0.6,
			o: 0.0
		}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.2
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.3
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.4
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.5
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.6
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.7
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.8
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.9
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1.0
			}];
		animation.types.none = [{
			x: 0.4,
			y: 0.4,
			w: 0.6,
			h: 0.6,
			o: 1
		}];
		animation.types.pop = [{
			x: 1,
			y: 1,
			w: 0,
			h: 0,
			o: 1
		}, {
				x: 0.9,
				y: 0.9,
				w: 0.1,
				h: 0.1,
				o: 1
			}, {
				x: 0.8,
				y: 0.8,
				w: 0.2,
				h: 0.2,
				o: 1
			}, {
				x: 0.7,
				y: 0.7,
				w: 0.3,
				h: 0.3,
				o: 1
			}, {
				x: 0.6,
				y: 0.6,
				w: 0.4,
				h: 0.4,
				o: 1
			}, {
				x: 0.5,
				y: 0.5,
				w: 0.5,
				h: 0.5,
				o: 1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		animation.types.popFade = [{
			x: 0.75,
			y: 0.75,
			w: 0,
			h: 0,
			o: 0
		}, {
				x: 0.65,
				y: 0.65,
				w: 0.1,
				h: 0.1,
				o: 0.2
			}, {
				x: 0.6,
				y: 0.6,
				w: 0.2,
				h: 0.2,
				o: 0.4
			}, {
				x: 0.55,
				y: 0.55,
				w: 0.3,
				h: 0.3,
				o: 0.6
			}, {
				x: 0.50,
				y: 0.50,
				w: 0.4,
				h: 0.4,
				o: 0.8
			}, {
				x: 0.45,
				y: 0.45,
				w: 0.5,
				h: 0.5,
				o: 0.9
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		animation.types.slide = [{
			x: 0.4,
			y: 1,
			w: 0.6,
			h: 0.6,
			o: 1
		}, {
				x: 0.4,
				y: 0.9,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.9,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.8,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.7,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.6,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.5,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		/**
		 * Run animation
		 * @param {Object} opt Animation options
		 * @param {Object} cb Callabak after all steps are done
		 * @param {Object} revert Reverse order? true|false
		 * @param {Object} step Optional step number (frame bumber)
		 */
		animation.run = function (opt, cb, revert, step) {
			var animationType = animation.types[isPageHidden() ? 'none' : _opt.animation];
			if (revert === true) {
				step = (typeof step !== 'undefined') ? step : animationType.length - 1;
			} else {
				step = (typeof step !== 'undefined') ? step : 0;
			}
			cb = (cb) ? cb : function () {
			};
			if ((step < animationType.length) && (step >= 0)) {
				type[_opt.type](merge(opt, animationType[step]));
				_animTimeout = setTimeout(function () {
					if (revert) {
						step = step - 1;
					} else {
						step = step + 1;
					}
					animation.run(opt, cb, revert, step);
				}, animation.duration);

				link.setIcon(_canvas);
			} else {
				cb();
				return;
			}
		};
		//auto init
		init();
		return {
			badge: badge,
			video: video,
			image: image,
			rawImageSrc: rawImageSrc,
			webcam: webcam,
			setOpt: setOpt,
			reset: icon.reset,
			browser: {
				supported: _browser.supported
			}
		};
	});

	// AMD / RequireJS
	if (typeof define !== 'undefined' && define.amd) {
		define('favico',[], function () {
			return Favico;
		});
	}
	// CommonJS
	else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Favico;
	}
	// included directly via <script> tag
	else {
		this.Favico = Favico;
	}

})();
define('PoE/Trade/Data/Static',['require','PoE/Helpers'],function(require){var PoEHelpers=require("PoE/Helpers");var static_={resultLimit:100,liveResultTotalLimit:500,realm:null,realms:[],leagues:[],account:{status:[{id:"league",text:PoEHelpers.translate("Show my Status (Default)")},{id:"all",text:PoEHelpers.translate("Show my Status on all Leagues")},{id:"none",text:PoEHelpers.translate("Appear Offline")}],languages:[{id:"",text:PoEHelpers.translate("Last Client Language (Default)")},{id:"en_US",text:PoEHelpers.translate("English")},{id:"pt_BR",text:PoEHelpers.translate("Brazilian Portuguese")},{id:"ru_RU",text:PoEHelpers.translate("Russian")},{id:"th_TH",text:PoEHelpers.translate("Thai")},{id:"de_DE",text:PoEHelpers.translate("German")},{id:"fr_FR",text:PoEHelpers.translate("French")},{id:"es_ES",text:PoEHelpers.translate("Spanish")},{id:"ja_JP",text:PoEHelpers.translate("Japanese")},{id:"ko_KR",text:PoEHelpers.translate("Korean")}],statusRetrieving:PoEHelpers.translate("Fetching...")},// NOTE(rory): Increment this to make an alert appear on the about page, null to disable
alertId:null,// NOTE(rory): The following are fetched from the backend
knownItems:[],knownStats:[],knownStatsFlat:{},knownCrucibleStats:[],knownCrucibleStatsFlat:{},exchangeData:[],exchangeDataFlat:{},news:[],propertyFilters:[],basePath:"/trade",// NOTE(rory): Static data resumes
exchangeStatus:[{id:"online",text:PoEHelpers.translate("Online Only")},{id:"onlineleague",text:PoEHelpers.translate("Online In League")},{id:"any",text:PoEHelpers.translate("Any")}],searchBarLayouts:[{text:PoEHelpers.translate("Controls at Bottom (Default)"),value:null},{text:PoEHelpers.translate("Controls on Top and Bottom"),value:"both"}],socketVariants:[{text:PoEHelpers.translate("Default"),value:1},{text:PoEHelpers.translate("Small Notches"),value:2},{text:PoEHelpers.translate("Large Pattern"),value:3}],notifications:[{file:"audio/trade/pulse.mp3",name:PoEHelpers.translate("Pulse")},{file:"audio/trade/piano.mp3",name:PoEHelpers.translate("Piano")},{file:"audio/trade/chime.mp3",name:PoEHelpers.translate("Chime")},{file:"audio/trade/gong.mp3",name:PoEHelpers.translate("Gong")}],notificationVolumes:[{text:PoEHelpers.translate("Muted"),value:0},{text:"10%",value:10},{text:"20%",value:20},{text:"30%",value:30},{text:"40%",value:40},{text:"50%",value:50},{text:"60%",value:60},{text:"70%",value:70},{text:"80%",value:80},{text:"90%",value:90},{text:"100%",value:100}],statGroups:[{type:"and",title:PoEHelpers.translate("And")},{type:"not",title:PoEHelpers.translate("Not")},{type:"if",title:PoEHelpers.translate("If"),tip:PoEHelpers.translate("Match items that meet each stat's `min` and `max` requirements if the stat is present.")},{type:"count",title:PoEHelpers.translate("Count"),tip:PoEHelpers.translate("Count each stat that meets the `min` and `max` (if provided, otherwise existence) requirements.\nUse the group's `min` and `max` to filter items based on the count of matching stats."),minMax:true},{type:"weight",title:PoEHelpers.translate("Weighted Sum"),tip:PoEHelpers.translate("Check each stat meets the `min` and `max` (if provided, otherwise existence) requirements before multiplying the stat value by the `weight` and finally summing them together.\nUse the group's `min` and `max` to filter items based on the total summed value."),minMax:true,weight:true},{type:"weight2",title:PoEHelpers.translate("Weighted Sum v2"),tip:PoEHelpers.translate("Each stat value that meets the `min` and `max` (if provided, otherwise existence) requirements will be multiplied by the `weight` before being summed together.\nUse the group's `min` and `max` to filter items based on the total summed value."),minMax:true,weight:true},{type:"crucible",title:PoEHelpers.translate("Crucible Passive Tree Path"),tip:PoEHelpers.translate("Filter by the mods that you want to be able to allocate at once.\nUse a lower `min` value for partial matches."),minOnly:true,mutable:false}]};return static_});
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}define('PoE/Trade/Service',['require','PoE/Helpers'],function(require){var PoEHelpers=require("PoE/Helpers");return function(_ref){var apiUrl=_ref.apiUrl;var self=this;return{apiUrl:apiUrl,whisperAccount:function whisperAccount(token){var _this=this;var ignoreSoftFailure=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var event=arguments.length>2&&arguments[2]!==undefined?arguments[2]:undefined;return new Promise(function(resolve,reject){$.ajax({method:"POST",url:_this.apiUrl("whisper"),data:JSON.stringify(_objectSpread(_objectSpread({token:token},event?{event:event}:{}),ignoreSoftFailure?{continue:true}:{})),contentType:"application/json"}).done(function(response){if(response.error){reject(response.error);return}resolve(response)}).fail(function(jqXHR){reject(jqXHR.responseJSON&&jqXHR.responseJSON.error)})})},whisperAccountExchange:function whisperAccountExchange(token,values){var _this2=this;return new Promise(function(resolve,reject){$.ajax({method:"POST",url:_this2.apiUrl("whisper"),data:JSON.stringify({token:token,values:values.map(function(str){return Number(str)})}),contentType:"application/json"}).done(function(response){if(response.error){reject(response.error);return}resolve(response)}).fail(function(jqXHR){reject(jqXHR.responseJSON&&jqXHR.responseJSON.error)})})},ignoreAccount:function ignoreAccount(account,promise){$.ajax({method:"PUT",url:this.apiUrl("ignore/"+encodeURIComponent(account.name))}).done(function(response){if(response.error){promise.reject(response.error)}else{self.$root.$refs.toastr.Add({msg:PoEHelpers.translate("Added {PLAYER} to your ignore list",{"{PLAYER}":account.name}),progressbar:false});promise.resolve(response)}}).fail(function(jqXHR){promise.reject(jqXHR.responseJSON&&jqXHR.responseJSON.error)})},unignoreAccount:function unignoreAccount(account,promise){$.ajax({method:"DELETE",url:this.apiUrl("ignore/"+encodeURIComponent(account.name))}).done(function(response){if(response.error){promise.reject(response.error)}else{self.$root.$refs.toastr.Add({msg:PoEHelpers.translate("Removed {PLAYER} from your ignore list",{"{PLAYER}":account.name}),progressbar:false});promise.resolve(response)}}).fail(function(jqXHR){promise.reject(jqXHR.responseJSON&&jqXHR.responseJSON.error)})},unlistItem:function unlistItem(itemId,promise){$.ajax({method:"POST",url:this.apiUrl("unlist/"+itemId)}).done(function(response){if(response.error){promise.reject(response.error);return}promise.resolve(response.message)}).fail(function(jqXHR){promise.reject(jqXHR.responseJSON&&jqXHR.responseJSON.error)})},performSearch:function performSearch(realm,league,query,promise){var url=this.apiUrl("search"+(realm!=="pc"?"/"+realm:"")+"/"+league);var searchOptions={url:url,method:"POST",contentType:"application/json",data:JSON.stringify(query)};var xhr=$.ajax(searchOptions).done(function(response){if(response.error){promise.reject(1,response.error)}else{promise.resolve(response)}}).fail(function(jqXHR){promise.reject(jqXHR.status,jqXHR.responseJSON&&jqXHR.responseJSON.error)});return xhr},performExchangeSearch:function performExchangeSearch(realm,league,query,promise){var url=this.apiUrl("exchange"+(realm!=="pc"?"/"+realm:"")+"/"+league);var searchOptions={url:url,method:"POST",contentType:"application/json",data:JSON.stringify(query)};var xhr=$.ajax(searchOptions).done(function(response){if(response.error){promise.reject(1,response.error)}else{promise.resolve(response)}}).fail(function(jqXHR){promise.reject(jqXHR.status,jqXHR.responseJSON&&jqXHR.responseJSON.error)});return xhr}}}});
define('PoE/Trade/Util',['require'],function(require){return{ThreadLink:function ThreadLink(source){var host=window.location.host;var hostParts=host.split(".");var hosts={"br":true,"ru":true,"th":true,"es":true,"fr":true,"de":true};if(hosts[hostParts[0]]!==undefined){hostParts.shift();host=hostParts.join(".")}if(source.thread_locale&&source.thread_locale!="en"){host=source.thread_locale+"."+host}return window.location.protocol+"//"+host+"/forum/view-thread/"+source.thread_id},AccountLink:function AccountLink(source){return"/account/view-profile/"+encodeURIComponent(source.account.name)}}});
define('PoE/Trade/Component/Item',['require','PoE/Backbone/Model/Item/Item','PoE/Item/Popup','PoE/Helpers'],function(require){var ItemModel=require("PoE/Backbone/Model/Item/Item");var Popup=require("PoE/Item/Popup");var PoEHelpers=require("PoE/Helpers");return{props:["item","sort"],template:"<div class=\"itemPopupContainer\"></div>",data:function data(){return{popup:null,model:null}},methods:{render:function render(){var self=this;$(this.$el).removeClass().addClass("itemPopupContainer");this.popup.model=this.model;this.popup.render();var hashes=this.item.extended.hashes;if(!_.isEmpty(hashes)){var mods=this.item.extended.mods;_.each({implicit:".implicitMod",enchant:".enchantMod",monster:".explicitMod",explicit:".explicitMod, .mutatedMod",fractured:".fracturedMod",crafted:".craftedMod",veiled:".veiledMod",pseudo:".pseudoMod",delve:".explicitMod",scourge:".scourgeMod",sanctum:".explicitMod",rune:".runeMod",desecrated:".desecratedMod",skill:".property.skill",imbued:".imbuedMod"},function(c,key){var i=0;$(this.$el).find(c).each(function(){if(!hashes[key])return;var hash=hashes[key][i++];if(!hash||!hash[0])return;var field=String(hash[0]).lastIndexOf("statgroup.",0)!==0?"stat."+hash[0]:hash[0];$(this).find(".lc").addClass("s").attr("data-field",field);if(mods){var $pre=$("<span class=\"lc l\"></span>");var $post=$("<span class=\"lc r\"></span>");var preText="";var postText="";_.each(hash[1],function(modHash){var mod=mods[key][modHash]||null;var thisPreText="";var thisPostText="";if(mod){$(this).attr("data-mod",modHash);if(mod.tier){thisPreText+=mod.tier;if(String(mod.tier).charAt(0)=="P"){$pre.addClass("pr");$post.addClass("pr")}else if(String(mod.tier).charAt(0)=="S"){$pre.addClass("su");$post.addClass("su")}}if(mod.name){thisPostText+=mod.name}if(mod.tier&&mod.level){if(mod.name)thisPostText+=" ";thisPostText+="(\u2265"+mod.level+")"}if(mod.magnitudes){var m=_.filter(mod.magnitudes,function(mag){return String(mag.hash)==String(hash[0])});var text=null;if(m.length>=2){text=self.translate("{RANGE1} to {RANGE2}",{"{RANGE1}":m[0].min==m[0].max?m[0].max:m[0].min+"&mdash;"+m[0].max,"{RANGE2}":m[1].min==m[1].max?m[1].max:m[1].min+"&mdash;"+m[1].max})}else if(m.length==1){text=m[0].min==m[0].max?m[0].max:m[0].min+"\u2014"+m[0].max}if(text){thisPreText+="<span class=\"d\">"+(thisPreText.length?"&nbsp;":"")+"["+text+"]</span>"}}}if(thisPreText.length){if(preText.length)preText+=" + ";preText+=thisPreText}if(thisPostText.length){if(postText.length)postText+=" + ";postText+=thisPostText}},this);$pre.html(preText);$(this).prepend($pre);$post.html("<span class=\"d\">"+postText+"</span>");$(this).append($post)}})},this)}this.syncSort()},syncSort:function syncSort(){$(this.$el).find(".s").removeClass("sorted sorted-asc sorted-desc");if(this.sort&&!this.sort.disabled&&this.sort.field){var sortable=$(this.$el).find(".s[data-field=\""+this.sort.field+"\"]");var direction=this.sort.direction=="asc"?"sorted-asc":"sorted-desc";sortable.addClass("sorted").addClass(direction)}},prepare:function prepare(){this.teardown();var item=$.extend({},this.item);if(!item.artFilename){item.flavourText=undefined}if(item.crucible){// NOTE(rory): Hide the preview tree as we'll render the full SVG instead
item.crucible.layout=undefined;// NOTE(rory): Append the tier of the node
if(item.crucible.nodes){for(var _i=0,_Object$values=Object.values(item.crucible.nodes);_i<_Object$values.length;_i++){var node=_Object$values[_i];if(node.tier){node.stats.push(PoEHelpers.translate("(Tier {TIER})",{"{TIER}":node.tier}))}}}}item.descrText=undefined;item.advanced=true;this.model=new ItemModel(item)},teardown:function teardown(){if(this.model){if(this.popup&&this.popup.model){this.popup.model=null}this.model.destroy();this.model=null}}},mounted:function mounted(){this.prepare();this.popup=new Popup({model:this.model,el:this.$el});this.render()},beforeDestroy:function beforeDestroy(){this.teardown()},watch:{item:function item(){this.prepare();this.render()},sort:function sort(){this.syncSort()}}}});
function _callSuper(t,o,e){return o=_getPrototypeOf(o),_possibleConstructorReturn(t,_isNativeReflectConstruct()?Reflect.construct(o,e||[],_getPrototypeOf(t).constructor):o.apply(t,e))}function _possibleConstructorReturn(t,e){if(e&&("object"==_typeof(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return _assertThisInitialized(t)}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch(t){}return(_isNativeReflectConstruct=function _isNativeReflectConstruct(){return!!t})()}function _get(){return _get="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,r){var p=_superPropBase(e,t);if(p){var n=Object.getOwnPropertyDescriptor(p,t);return n.get?n.get.call(arguments.length<3?e:r):n.value}},_get.apply(null,arguments)}function _superPropBase(t,o){for(;!{}.hasOwnProperty.call(t,o)&&null!==(t=_getPrototypeOf(t)););return t}function _getPrototypeOf(t){return _getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},_getPrototypeOf(t)}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),Object.defineProperty(t,"prototype",{writable:!1}),e&&_setPrototypeOf(t,e)}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},_setPrototypeOf(t,e)}function _classCallCheck(a,n){if(!(a instanceof n))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,r){for(var t=0;t<r.length;t++){var o=r[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,_toPropertyKey(o.key),o)}}function _createClass(e,r,t){return r&&_defineProperties(e.prototype,r),t&&_defineProperties(e,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}function _toConsumableArray(r){return _arrayWithoutHoles(r)||_iterableToArray(r)||_unsupportedIterableToArray(r)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArray(r){if("undefined"!=typeof Symbol&&null!=r[Symbol.iterator]||null!=r["@@iterator"])return Array.from(r)}function _arrayWithoutHoles(r){if(Array.isArray(r))return _arrayLikeToArray(r)}function _slicedToArray(r,e){return _arrayWithHoles(r)||_iterableToArrayLimit(r,e)||_unsupportedIterableToArray(r,e)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(r,a){if(r){if("string"==typeof r)return _arrayLikeToArray(r,a);var t={}.toString.call(r).slice(8,-1);return"Object"===t&&r.constructor&&(t=r.constructor.name),"Map"===t||"Set"===t?Array.from(r):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(r,a):void 0}}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n}function _iterableToArrayLimit(r,l){var t=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(null!=t){var e,n,i,u,a=[],f=!0,o=!1;try{if(i=(t=t.call(r)).next,0===l){if(Object(t)!==t)return;f=!1}else for(;!(f=(e=i.call(t)).done)&&(a.push(e.value),a.length!==l);f=!0);}catch(r){o=!0,n=r}finally{try{if(!f&&null!=t.return&&(u=t.return(),Object(u)!==u))return}finally{if(o)throw n}}return a}}function _arrayWithHoles(r){if(Array.isArray(r))return r}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}/*!
  * Native JavaScript for Bootstrap - Dropdown v4.2.0 (https://thednp.github.io/bootstrap.native/)
  * Copyright 2015-2022 © dnp_theme
  * Licensed under MIT (https://github.com/thednp/bootstrap.native/blob/master/LICENSE)
  */(function(global,factory){(typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define('bootstrap/dropdown',factory):(global=typeof globalThis!=="undefined"?globalThis:global||self,global.Dropdown=factory())})(this,function(){"use strict";/**
     * A global namespace for aria-expanded.
     * @type {string}
     */var ariaExpanded="aria-expanded";/**
     * A global namespace for `focus` event.
     * @type {string}
     */var focusEvent="focus";/**
     * A global namespace for `keydown` event.
     * @type {string}
     */var keydownEvent="keydown";/**
     * A global namespace for `keyup` event.
     * @type {string}
     */var keyupEvent="keyup";/**
     * A global namespace for `scroll` event.
     * @type {string}
     */var scrollEvent="scroll";/**
     * A global namespace for `resize` event.
     * @type {string}
     */var resizeEvent="resize";/**
     * A global namespace for `click` event.
     * @type {string}
     */var mouseclickEvent="click";/**
     * A global namespace for `ArrowUp` key.
     * @type {string} e.which = 38 equivalent
     */var keyArrowUp="ArrowUp";/**
     * A global namespace for `ArrowDown` key.
     * @type {string} e.which = 40 equivalent
     */var keyArrowDown="ArrowDown";/**
     * A global namespace for `Escape` key.
     * @type {string} e.which = 27 equivalent
     */var keyEscape="Escape";/**
     * Shortcut for `HTMLElement.setAttribute()` method.
     * @param  {HTMLElement} element target element
     * @param  {string} attribute attribute name
     * @param  {string} value attribute value
     * @returns {void}
     */var setAttribute=function setAttribute(element,attribute,value){return element.setAttribute(attribute,value)};/**
     * Shortcut for `HTMLElement.hasAttribute()` method.
     * @param  {HTMLElement} element target element
     * @param  {string} attribute attribute name
     * @returns {boolean} the query result
     */var hasAttribute=function hasAttribute(element,attribute){return element.hasAttribute(attribute)};/**
     * Shortcut for `HTMLElement.closest` method which also works
     * with children of `ShadowRoot`. The order of the parameters
     * is intentional since they're both required.
     *
     * @see https://stackoverflow.com/q/54520554/803358
     *
     * @param {HTMLElement} element Element to look into
     * @param {string} selector the selector name
     * @return {HTMLElement?} the query result
     */function closest(element,selector){return element?element.closest(selector)// break out of `ShadowRoot`
||closest(element.getRootNode().host,selector):null}/**
     * Checks if an object is a `Node`.
     *
     * @param {any} node the target object
     * @returns {boolean} the query result
     */var isNode=function isNode(element){return element&&[1,2,3,4,5,6,7,8,9,10,11].some(function(x){return+element.nodeType===x})||false};/**
     * Check if a target object is `Window`.
     * => equivalent to `object instanceof Window`
     *
     * @param {any} object the target object
     * @returns {boolean} the query result
     */var isWindow=function isWindow(object){return object&&object.constructor.name==="Window"||false};/**
     * Checks if an object is a `Document`.
     * @see https://dom.spec.whatwg.org/#node
     *
     * @param {any} object the target object
     * @returns {boolean} the query result
     */var isDocument=function isDocument(object){return object&&object.nodeType===9||false};/**
     * Returns the `document` or the `#document` element.
     * @see https://github.com/floating-ui/floating-ui
     * @param {(Node | Window)=} node
     * @returns {Document}
     */function getDocument(node){// node instanceof Document
if(isDocument(node))return node;// node instanceof Node
if(isNode(node))return node.ownerDocument;// node instanceof Window
if(isWindow(node))return node.document;// node is undefined | NULL
return window.document}/**
     * Utility to check if target is typeof `HTMLElement`, `Element`, `Node`
     * or find one that matches a selector.
     *
     * @param {Node | string} selector the input selector or target element
     * @param {ParentNode=} parent optional node to look into
     * @return {HTMLElement?} the `HTMLElement` or `querySelector` result
     */function querySelector(selector,parent){if(isNode(selector)){return selector}var lookUp=isNode(parent)?parent:getDocument();return lookUp.querySelector(selector)}/**
     * Shortcut for `HTMLElement.getElementsByClassName` method. Some `Node` elements
     * like `ShadowRoot` do not support `getElementsByClassName`.
     *
     * @param {string} selector the class name
     * @param {ParentNode=} parent optional Element to look into
     * @return {HTMLCollectionOf<HTMLElement>} the 'HTMLCollection'
     */function getElementsByClassName(selector,parent){var lookUp=isNode(parent)?parent:getDocument();return lookUp.getElementsByClassName(selector)}/**
     * A global namespace for most scroll event listeners.
     * @type {Partial<AddEventListenerOptions>}
     */var passiveHandler={passive:true};/**
     * Shortcut for `Object.assign()` static method.
     * @param  {Record<string, any>} obj a target object
     * @param  {Record<string, any>} source a source object
     */var ObjectAssign=function ObjectAssign(obj,source){return Object.assign(obj,source)};/**
     * Checks if an element is an `HTMLElement`.
     * @see https://dom.spec.whatwg.org/#node
     *
     * @param {any} element the target object
     * @returns {boolean} the query result
     */var isHTMLElement=function isHTMLElement(element){return element&&element.nodeType===1||false};/** @type {Map<string, Map<HTMLElement, Record<string, any>>>} */var componentData=new Map;/**
     * An interface for web components background data.
     * @see https://github.com/thednp/bootstrap.native/blob/master/src/components/base-component.js
     */var Data={/**
       * Sets web components data.
       * @param {HTMLElement} element target element
       * @param {string} component the component's name or a unique key
       * @param {Record<string, any>} instance the component instance
       */set:function set(element,component,instance){if(!isHTMLElement(element))return;/* istanbul ignore else */if(!componentData.has(component)){componentData.set(component,new Map)}var instanceMap=componentData.get(component);// not undefined, but defined right above
instanceMap.set(element,instance)},/**
       * Returns all instances for specified component.
       * @param {string} component the component's name or a unique key
       * @returns {Map<HTMLElement, Record<string, any>>?} all the component instances
       */getAllFor:function getAllFor(component){var instanceMap=componentData.get(component);return instanceMap||null},/**
       * Returns the instance associated with the target.
       * @param {HTMLElement} element target element
       * @param {string} component the component's name or a unique key
       * @returns {Record<string, any>?} the instance
       */get:function get(element,component){if(!isHTMLElement(element)||!component)return null;var allForC=Data.getAllFor(component);var instance=element&&allForC&&allForC.get(element);return instance||null},/**
       * Removes web components data.
       * @param {HTMLElement} element target element
       * @param {string} component the component's name or a unique key
       */remove:function remove(element,component){var instanceMap=componentData.get(component);if(!instanceMap||!isHTMLElement(element))return;instanceMap.delete(element);/* istanbul ignore else */if(instanceMap.size===0){componentData.delete(component)}}};/**
     * An alias for `Data.get()`.
     * @type {SHORTY.getInstance<any>}
     */var getInstance=function getInstance(target,component){return Data.get(target,component)};/**
     * Shortcut for `Object.entries()` static method.
     * @param  {Record<string, any>} obj a target object
     * @returns {[string, any][]}
     */var ObjectEntries=function ObjectEntries(obj){return Object.entries(obj)};/**
     * Shortcut for multiple uses of `HTMLElement.style.propertyName` method.
     * @param  {HTMLElement} element target element
     * @param  {Partial<CSSStyleDeclaration>} styles attribute value
     */var setElementStyle=function setElementStyle(element,styles){ObjectEntries(styles).forEach(function(_ref){var _ref2=_slicedToArray(_ref,2),key=_ref2[0],value=_ref2[1];if(key.includes("--")){element.style.setProperty(key,value)}else{var propObject={};propObject[key]=value;ObjectAssign(element.style,propObject)}})};/**
     * Shortcut for the `Element.dispatchEvent(Event)` method.
     *
     * @param {HTMLElement} element is the target
     * @param {Event} event is the `Event` object
     */var dispatchEvent=function dispatchEvent(element,event){return element.dispatchEvent(event)};/**
     * Utility to focus an `HTMLElement` target.
     *
     * @param {HTMLElement} element is the target
     */var focus=function focus(element){return element.focus()};/**
     * Checks if an object is an `Object`.
     *
     * @param {any} obj the target object
     * @returns {boolean} the query result
     */var isObject=function isObject(obj){return _typeof(obj)==="object"||false};/**
     * Returns a namespaced `CustomEvent` specific to each component.
     * @param {string} EventType Event.type
     * @param {Record<string, any>=} config Event.options | Event.properties
     * @returns {SHORTY.OriginalEvent} a new namespaced event
     */function OriginalEvent(EventType,config){var OriginalCustomEvent=new CustomEvent(EventType,{cancelable:true,bubbles:true});/* istanbul ignore else */if(isObject(config)){ObjectAssign(OriginalCustomEvent,config)}return OriginalCustomEvent}/**
     * Add class to `HTMLElement.classList`.
     *
     * @param {HTMLElement} element target
     * @param {string} classNAME to add
     * @returns {void}
     */function addClass(element,classNAME){element.classList.add(classNAME)}/**
     * Check class in `HTMLElement.classList`.
     *
     * @param {HTMLElement} element target
     * @param {string} classNAME to check
     * @returns {boolean}
     */function hasClass(element,classNAME){return element.classList.contains(classNAME)}/**
     * Remove class from `HTMLElement.classList`.
     *
     * @param {HTMLElement} element target
     * @param {string} classNAME to remove
     * @returns {void}
     */function removeClass(element,classNAME){element.classList.remove(classNAME)}/**
     * Returns the `document.documentElement` or the `<html>` element.
     *
     * @param {(Node | Window)=} node
     * @returns {HTMLHtmlElement}
     */function getDocumentElement(node){return getDocument(node).documentElement}/**
     * Checks if a page is Right To Left.
     * @param {HTMLElement=} node the target
     * @returns {boolean} the query result
     */var isRTL=function isRTL(node){return getDocumentElement(node).dir==="rtl"};/**
     * Shortcut for `window.getComputedStyle(element).propertyName`
     * static method.
     *
     * * If `element` parameter is not an `HTMLElement`, `getComputedStyle`
     * throws a `ReferenceError`.
     *
     * @param {HTMLElement} element target
     * @param {string} property the css property
     * @return {string} the css property value
     */function getElementStyle(element,property){var computedStyle=getComputedStyle(element);// must use camelcase strings,
// or non-camelcase strings with `getPropertyValue`
return property.includes("--")?computedStyle.getPropertyValue(property):computedStyle[property]}/**
     * Returns the bounding client rect of a target `HTMLElement`.
     *
     * @see https://github.com/floating-ui/floating-ui
     *
     * @param {HTMLElement} element event.target
     * @param {boolean=} includeScale when *true*, the target scale is also computed
     * @returns {SHORTY.BoundingClientRect} the bounding client rect object
     */function getBoundingClientRect(element,includeScale){var _element$getBoundingC=element.getBoundingClientRect(),width=_element$getBoundingC.width,height=_element$getBoundingC.height,top=_element$getBoundingC.top,right=_element$getBoundingC.right,bottom=_element$getBoundingC.bottom,left=_element$getBoundingC.left;var scaleX=1;var scaleY=1;if(includeScale&&isHTMLElement(element)){var offsetWidth=element.offsetWidth,offsetHeight=element.offsetHeight;scaleX=offsetWidth>0?Math.round(width)/offsetWidth:/* istanbul ignore next */1;scaleY=offsetHeight>0?Math.round(height)/offsetHeight:/* istanbul ignore next */1}return{width:width/scaleX,height:height/scaleY,top:top/scaleY,right:right/scaleX,bottom:bottom/scaleY,left:left/scaleX,x:left/scaleX,y:top/scaleY}}/**
     * Returns the `Window` object of a target node.
     * @see https://github.com/floating-ui/floating-ui
     *
     * @param {(Node | Window)=} node target node
     * @returns {Window} the `Window` object
     */function getWindow(node){// node is undefined | NULL
if(!node)return window;// node instanceof Document
if(isDocument(node))return node.defaultView;// node instanceof Node
if(isNode(node))return node.ownerDocument.defaultView;// node is instanceof Window
return node}/** @type {Record<string, any>} */var EventRegistry={};/**
     * The global event listener.
     *
     * @type {EventListener}
     * @this {EventTarget}
     */function globalListener(e){var that=this;var type=e.type;_toConsumableArray(EventRegistry[type]).forEach(function(elementsMap){var _elementsMap=_slicedToArray(elementsMap,2),element=_elementsMap[0],listenersMap=_elementsMap[1];/* istanbul ignore else */if(element===that){_toConsumableArray(listenersMap).forEach(function(listenerMap){var _listenerMap=_slicedToArray(listenerMap,2),listener=_listenerMap[0],options=_listenerMap[1];listener.apply(element,[e]);if(options&&options.once){removeListener(element,type,listener,options)}})}})}/**
     * Register a new listener with its options and attach the `globalListener`
     * to the target if this is the first listener.
     *
     * @type {Listener.ListenerAction<EventTarget>}
     */var addListener=function addListener(element,eventType,listener,options){// get element listeners first
if(!EventRegistry[eventType]){EventRegistry[eventType]=new Map}var oneEventMap=EventRegistry[eventType];if(!oneEventMap.has(element)){oneEventMap.set(element,new Map)}var oneElementMap=oneEventMap.get(element);// get listeners size
var size=oneElementMap.size;// register listener with its options
oneElementMap.set(listener,options);// add listener last
if(!size){element.addEventListener(eventType,globalListener,options)}};/**
     * Remove a listener from registry and detach the `globalListener`
     * if no listeners are found in the registry.
     *
     * @type {Listener.ListenerAction<EventTarget>}
     */var removeListener=function removeListener(element,eventType,listener,options){// get listener first
var oneEventMap=EventRegistry[eventType];var oneElementMap=oneEventMap&&oneEventMap.get(element);var savedOptions=oneElementMap&&oneElementMap.get(listener);// also recover initial options
var _ref3=savedOptions!==undefined?savedOptions:{options:options},eventOptions=_ref3.options;// unsubscribe second, remove from registry
if(oneElementMap&&oneElementMap.has(listener))oneElementMap.delete(listener);if(oneEventMap&&(!oneElementMap||!oneElementMap.size))oneEventMap.delete(element);if(!oneEventMap||!oneEventMap.size)delete EventRegistry[eventType];// remove listener last
/* istanbul ignore else */if(!oneElementMap||!oneElementMap.size){element.removeEventListener(eventType,globalListener,eventOptions)}};/**
     * Global namespace for most components `show` class.
     */var showClass="show";/**
     * Global namespace for most components `toggle` option.
     */var dataBsToggle="data-bs-toggle";/**
     * Global namespace for `Dropdown` types / classes.
     */var dropdownMenuClasses=["dropdown","dropup","dropstart","dropend"];/** @type {string} */var dropdownComponent="Dropdown";/**
     * Global namespace for `.dropdown-menu`.
     */var dropdownMenuClass="dropdown-menu";/**
     * Checks if an *event.target* or its parent has an `href="#"` value.
     * We need to prevent jumping around onclick, don't we?
     *
     * @param {Node} element the target element
     * @returns {boolean} the query result
     */function isEmptyAnchor(element){// `EventTarget` must be `HTMLElement`
var parentAnchor=closest(element,"A");return isHTMLElement(element)// anchor href starts with #
&&(hasAttribute(element,"href")&&element.href.slice(-1)==="#"// OR a child of an anchor with href starts with #
||parentAnchor&&hasAttribute(parentAnchor,"href")&&parentAnchor.href.slice(-1)==="#")}/**
     * Shortcut for `HTMLElement.getAttribute()` method.
     * @param {HTMLElement} element target element
     * @param {string} attribute attribute name
     * @returns {string?} attribute value
     */var getAttribute=function getAttribute(element,attribute){return element.getAttribute(attribute)};/**
     * The raw value or a given component option.
     *
     * @typedef {string | HTMLElement | Function | number | boolean | null} niceValue
     */ /**
     * Utility to normalize component options
     *
     * @param {any} value the input value
     * @return {niceValue} the normalized value
     */function normalizeValue(value){if(["true",true].includes(value)){// boolean
// if ('true' === value) { // boolean
return true}if(["false",false].includes(value)){// boolean
// if ('false' === value) { // boolean
return false}if(value===""||value==="null"){// null
return null}if(value!==""&&!Number.isNaN(+value)){// number
return+value}// string / function / HTMLElement / object
return value}/**
     * Shortcut for `Object.keys()` static method.
     * @param  {Record<string, any>} obj a target object
     * @returns {string[]}
     */var ObjectKeys=function ObjectKeys(obj){return Object.keys(obj)};/**
     * Shortcut for `String.toLowerCase()`.
     *
     * @param {string} source input string
     * @returns {string} lowercase output string
     */var toLowerCase=function toLowerCase(source){return source.toLowerCase()};/**
     * Utility to normalize component options.
     *
     * @param {HTMLElement} element target
     * @param {Record<string, any>} defaultOps component default options
     * @param {Record<string, any>} inputOps component instance options
     * @param {string=} ns component namespace
     * @return {Record<string, any>} normalized component options object
     */function normalizeOptions(element,defaultOps,inputOps,ns){var data=_objectSpread({},element.dataset);/** @type {Record<string, any>} */var normalOps={};/** @type {Record<string, any>} */var dataOps={};var title="title";ObjectKeys(data).forEach(function(k){var key=ns&&k.includes(ns)?k.replace(ns,"").replace(/[A-Z]/,function(match){return toLowerCase(match)}):k;dataOps[key]=normalizeValue(data[k])});ObjectKeys(inputOps).forEach(function(k){inputOps[k]=normalizeValue(inputOps[k])});ObjectKeys(defaultOps).forEach(function(k){/* istanbul ignore else */if(k in inputOps){normalOps[k]=inputOps[k]}else if(k in dataOps){normalOps[k]=dataOps[k]}else{normalOps[k]=k===title?getAttribute(element,title):defaultOps[k]}});return normalOps}var version="4.2.0";var Version=version;/* Native JavaScript for Bootstrap 5 | Base Component
    ----------------------------------------------------- */ /** Returns a new `BaseComponent` instance. */var BaseComponent=/*#__PURE__*/function(){/**
       * @param {HTMLElement | string} target `Element` or selector string
       * @param {BSN.ComponentOptions=} config component instance options
       */function BaseComponent(target,config){_classCallCheck(this,BaseComponent);var self=this;var element=querySelector(target);if(!element){throw Error("".concat(self.name," Error: \"").concat(target,"\" is not a valid selector."))}/** @static @type {BSN.ComponentOptions} */self.options={};var prevInstance=Data.get(element,self.name);if(prevInstance)prevInstance.dispose();/** @type {HTMLElement} */self.element=element;/* istanbul ignore else */if(self.defaults&&ObjectKeys(self.defaults).length){self.options=normalizeOptions(element,self.defaults,config||{},"bs")}Data.set(element,self.name,self)}/* eslint-disable */ /* istanbul ignore next */ /** @static */return _createClass(BaseComponent,[{key:"version",get:function get(){return Version}/* eslint-enable */ /* istanbul ignore next */ /** @static */},{key:"name",get:function get(){return this.constructor.name}/* istanbul ignore next */ /** @static */},{key:"defaults",get:function get(){return this.constructor.defaults}/**
       * Removes component from target element;
       */},{key:"dispose",value:function dispose(){var self=this;Data.remove(self.element,self.name);ObjectKeys(self).forEach(function(prop){self[prop]=null})}}])}();/* Native JavaScript for Bootstrap 5 | Dropdown
    ----------------------------------------------- */ // DROPDOWN PRIVATE GC
// ===================
var dropdownString=dropdownMenuClasses[0],dropupString=dropdownMenuClasses[1],dropstartString=dropdownMenuClasses[2],dropendString=dropdownMenuClasses[3];var dropdownSelector="[".concat(dataBsToggle,"=\"").concat(dropdownString,"\"]");/**
     * Static method which returns an existing `Dropdown` instance associated
     * to a target `Element`.
     *
     * @type {BSN.GetInstance<Dropdown>}
     */var getDropdownInstance=function getDropdownInstance(element){return getInstance(element,dropdownComponent)};/**
     * A `Dropdown` initialization callback.
     * @type {BSN.InitCallback<Dropdown>}
     */var dropdownInitCallback=function dropdownInitCallback(element){return new Dropdown(element)};// DROPDOWN PRIVATE GC
// ===================
// const dropdownMenuStartClass = `${dropdownMenuClass}-start`;
var dropdownMenuEndClass="".concat(dropdownMenuClass,"-end");var verticalClass=[dropdownString,dropupString];var horizontalClass=[dropstartString,dropendString];var menuFocusTags=["A","BUTTON"];var dropdownDefaults={offset:5,// [number] 5(px)
display:"dynamic"// [dynamic|static]
};// DROPDOWN CUSTOM EVENTS
// ======================
var showDropdownEvent=OriginalEvent("show.bs.".concat(dropdownString));var shownDropdownEvent=OriginalEvent("shown.bs.".concat(dropdownString));var hideDropdownEvent=OriginalEvent("hide.bs.".concat(dropdownString));var hiddenDropdownEvent=OriginalEvent("hidden.bs.".concat(dropdownString));// DROPDOWN PRIVATE METHODS
// ========================
/**
     * Apply specific style or class names to a `.dropdown-menu` to automatically
     * accomodate the layout and the page scroll.
     *
     * @param {Dropdown} self the `Dropdown` instance
     */function styleDropdown(self){var element=self.element,menu=self.menu,parentElement=self.parentElement,options=self.options;var offset=options.offset;// don't apply any style on mobile view
/* istanbul ignore next: this test requires a navbar */if(getElementStyle(menu,"position")==="static")return;var RTL=isRTL(element);// const menuStart = hasClass(menu, dropdownMenuStartClass);
var menuEnd=hasClass(menu,dropdownMenuEndClass);// reset menu offset and position
var resetProps=["margin","top","bottom","left","right"];resetProps.forEach(function(p){menu.style[p]=""});// set initial position class
// take into account .btn-group parent as .dropdown
// this requires navbar/btn-group/input-group
var positionClass=dropdownMenuClasses.find(function(c){return hasClass(parentElement,c)})||/* istanbul ignore next: fallback position */dropdownString;/** @type {Record<string, Record<string, any>>} */var dropdownMargin={dropdown:[offset,0,0],dropup:[0,0,offset],dropstart:RTL?[-1,0,0,offset]:[-1,offset,0],dropend:RTL?[-1,offset,0]:[-1,0,0,offset]};/** @type {Record<string, Record<string, any>>} */var dropdownPosition={dropdown:{top:"100%"},dropup:{top:"auto",bottom:"100%"},dropstart:RTL?{left:"100%",right:"auto"}:{left:"auto",right:"100%"},dropend:RTL?{left:"auto",right:"100%"}:{left:"100%",right:"auto"},menuStart:RTL?{right:0,left:"auto"}:{right:"auto",left:0},menuEnd:RTL?{right:"auto",left:0}:{right:0,left:"auto"}};var menuWidth=menu.offsetWidth,menuHeight=menu.offsetHeight;var _getDocumentElement=getDocumentElement(element),clientWidth=_getDocumentElement.clientWidth,clientHeight=_getDocumentElement.clientHeight;var _getBoundingClientRec=getBoundingClientRect(element),targetLeft=_getBoundingClientRec.left,targetTop=_getBoundingClientRec.top,targetWidth=_getBoundingClientRec.width,targetHeight=_getBoundingClientRec.height;// dropstart | dropend
var leftFullExceed=targetLeft-menuWidth-offset<0;// dropend
var rightFullExceed=targetLeft+menuWidth+targetWidth+offset>=clientWidth;// dropstart | dropend
var bottomExceed=targetTop+menuHeight+offset>=clientHeight;// dropdown
var bottomFullExceed=targetTop+menuHeight+targetHeight+offset>=clientHeight;// dropup
var topExceed=targetTop-menuHeight-offset<0;// dropdown / dropup
var leftExceed=(!RTL&&menuEnd||RTL&&!menuEnd)&&targetLeft+targetWidth-menuWidth<0;var rightExceed=(RTL&&menuEnd||!RTL&&!menuEnd)&&targetLeft+menuWidth>=clientWidth;// recompute position
// handle RTL as well
if(horizontalClass.includes(positionClass)&&leftFullExceed&&rightFullExceed){positionClass=dropdownString}if(positionClass===dropstartString&&(!RTL?leftFullExceed:rightFullExceed)){positionClass=dropendString}if(positionClass===dropendString&&(RTL?leftFullExceed:rightFullExceed)){positionClass=dropstartString}if(positionClass===dropupString&&topExceed&&!bottomFullExceed){positionClass=dropdownString}if(positionClass===dropdownString&&bottomFullExceed&&!topExceed){positionClass=dropupString}// override position for horizontal classes
if(horizontalClass.includes(positionClass)&&bottomExceed){ObjectAssign(dropdownPosition[positionClass],{top:"auto",bottom:0})}// override position for vertical classes
if(verticalClass.includes(positionClass)&&(leftExceed||rightExceed)){// don't realign when menu is wider than window
// in both RTL and non-RTL readability is KING
var posAjust;if(!leftExceed&&rightExceed&&!RTL)posAjust={left:"auto",right:0};if(leftExceed&&!rightExceed&&RTL)posAjust={left:0,right:"auto"};if(posAjust)ObjectAssign(dropdownPosition[positionClass],posAjust)}dropdownMargin=dropdownMargin[positionClass];setElementStyle(menu,_objectSpread(_objectSpread({},dropdownPosition[positionClass]),{},{margin:"".concat(dropdownMargin.map(function(x){return x?"".concat(x,"px"):x}).join(" "))}));// override dropdown-menu-start | dropdown-menu-end
if(verticalClass.includes(positionClass)&&menuEnd){/* istanbul ignore else */if(menuEnd){var endAdjust=!RTL&&leftExceed||RTL&&rightExceed?"menuStart":/* istanbul ignore next */"menuEnd";setElementStyle(menu,dropdownPosition[endAdjust])}}}/**
     * Returns an `Array` of focusable items in the given dropdown-menu.
     * @param {HTMLElement} menu
     * @returns {HTMLElement[]}
     */function getMenuItems(menu){return _toConsumableArray(menu.children).map(function(c){if(c&&menuFocusTags.includes(c.tagName))return c;var firstElementChild=c.firstElementChild;if(firstElementChild&&menuFocusTags.includes(firstElementChild.tagName)){return firstElementChild}return null}).filter(function(c){return c})}/**
     * Toggles on/off the listeners for the events that close the dropdown
     * as well as event that request a new position for the dropdown.
     *
     * @param {Dropdown} self the `Dropdown` instance
     */function toggleDropdownDismiss(self){var element=self.element,options=self.options;var action=self.open?addListener:removeListener;var doc=getDocument(element);action(doc,mouseclickEvent,dropdownDismissHandler);action(doc,focusEvent,dropdownDismissHandler);action(doc,keydownEvent,dropdownPreventScroll);action(doc,keyupEvent,dropdownKeyHandler);/* istanbul ignore else */if(options.display==="dynamic"){[scrollEvent,resizeEvent].forEach(function(ev){action(getWindow(element),ev,dropdownLayoutHandler,passiveHandler)})}}/**
     * Toggles on/off the `click` event listener of the `Dropdown`.
     *
     * @param {Dropdown} self the `Dropdown` instance
     * @param {boolean=} add when `true`, it will add the event listener
     */function toggleDropdownHandler(self,add){var action=add?addListener:removeListener;action(self.element,mouseclickEvent,dropdownClickHandler)}/**
     * Returns the currently open `.dropdown` element.
     *
     * @param {(Node | Window)=} element target
     * @returns {HTMLElement?} the query result
     */function getCurrentOpenDropdown(element){var currentParent=[].concat(dropdownMenuClasses,["btn-group","input-group"]).map(function(c){return getElementsByClassName("".concat(c," ").concat(showClass),getDocument(element))}).find(function(x){return x.length});if(currentParent&&currentParent.length){return _toConsumableArray(currentParent[0].children).find(function(x){return hasAttribute(x,dataBsToggle)})}return null}// DROPDOWN EVENT HANDLERS
// =======================
/**
     * Handles the `click` event for the `Dropdown` instance.
     *
     * @param {MouseEvent} e event object
     * @this {Document}
     */function dropdownDismissHandler(e){var target=e.target,type=e.type;/* istanbul ignore next: impossible to satisfy */if(!target||!target.closest)return;// some weird FF bug #409
var element=getCurrentOpenDropdown(target);var self=getDropdownInstance(element);/* istanbul ignore next */if(!self)return;var parentElement=self.parentElement,menu=self.menu;var hasData=closest(target,dropdownSelector)!==null;var isForm=parentElement&&parentElement.contains(target)&&(target.tagName==="form"||closest(target,"form")!==null);if(type===mouseclickEvent&&isEmptyAnchor(target)){e.preventDefault()}if(type===focusEvent&&(target===element||target===menu||menu.contains(target))){return}/* istanbul ignore else */if(isForm||hasData);else if(self){self.hide()}}/**
     * Handles `click` event listener for `Dropdown`.
     * @this {HTMLElement}
     * @param {MouseEvent} e event object
     */function dropdownClickHandler(e){var element=this;var target=e.target;var self=getDropdownInstance(element);/* istanbul ignore else */if(self){self.toggle();/* istanbul ignore else */if(target&&isEmptyAnchor(target))e.preventDefault()}}/**
     * Prevents scroll when dropdown-menu is visible.
     * @param {KeyboardEvent} e event object
     */function dropdownPreventScroll(e){/* istanbul ignore else */if([keyArrowDown,keyArrowUp].includes(e.code))e.preventDefault()}/**
     * Handles keyboard `keydown` events for `Dropdown`.
     * @param {KeyboardEvent} e keyboard key
     * @this {Document}
     */function dropdownKeyHandler(e){var code=e.code;var element=getCurrentOpenDropdown(this);var self=element&&getDropdownInstance(element);var _ref4=element&&getDocument(element),activeElement=_ref4.activeElement;/* istanbul ignore next: impossible to satisfy */if(!self||!activeElement)return;var menu=self.menu,open=self.open;var menuItems=getMenuItems(menu);// arrow up & down
if(menuItems&&menuItems.length&&[keyArrowDown,keyArrowUp].includes(code)){var idx=menuItems.indexOf(activeElement);/* istanbul ignore else */if(activeElement===element){idx=0}else if(code===keyArrowUp){idx=idx>1?idx-1:0}else if(code===keyArrowDown){idx=idx<menuItems.length-1?idx+1:idx}/* istanbul ignore else */if(menuItems[idx])focus(menuItems[idx])}if(keyEscape===code&&open){self.toggle();focus(element)}}/**
     * @this {globalThis}
     * @returns {void}
     */function dropdownLayoutHandler(){var element=getCurrentOpenDropdown(this);var self=element&&getDropdownInstance(element);/* istanbul ignore else */if(self&&self.open)styleDropdown(self)}// DROPDOWN DEFINITION
// ===================
/** Returns a new Dropdown instance. */var Dropdown=/*#__PURE__*/function(_BaseComponent){/**
       * @param {HTMLElement | string} target Element or string selector
       * @param {BSN.Options.Dropdown=} config the instance options
       */function Dropdown(target,config){var _this;_classCallCheck(this,Dropdown);_this=_callSuper(this,Dropdown,[target,config]);// bind
var self=_this;// initialization element
var element=self.element;var parentElement=element.parentElement;// set targets
/** @type {(Element | HTMLElement)} */self.parentElement=parentElement;/** @type {(Element | HTMLElement)} */self.menu=querySelector(".".concat(dropdownMenuClass),parentElement);// set initial state to closed
/** @type {boolean} */self.open=false;// add event listener
toggleDropdownHandler(self,true);return _this}/* eslint-disable */ /**
       * Returns component name string.
       */_inherits(Dropdown,_BaseComponent);return _createClass(Dropdown,[{key:"name",get:function get(){return dropdownComponent}/**
       * Returns component default options.
       */},{key:"defaults",get:function get(){return dropdownDefaults}/* eslint-enable */ // DROPDOWN PUBLIC METHODS
// =======================
/** Shows/hides the dropdown menu to the user. */},{key:"toggle",value:function toggle(){var self=this;if(self.open)self.hide();else self.show()}/** Shows the dropdown menu to the user. */},{key:"show",value:function show(){var self=this;var element=self.element,open=self.open,menu=self.menu,parentElement=self.parentElement;/* istanbul ignore next */if(open)return;var currentElement=getCurrentOpenDropdown(element);var currentInstance=currentElement&&getDropdownInstance(currentElement);if(currentInstance)currentInstance.hide();// dispatch event
[showDropdownEvent,shownDropdownEvent].forEach(function(e){e.relatedTarget=element});dispatchEvent(parentElement,showDropdownEvent);if(showDropdownEvent.defaultPrevented)return;addClass(menu,showClass);addClass(parentElement,showClass);setAttribute(element,ariaExpanded,"true");// change menu position
styleDropdown(self);self.open=!open;focus(element);// focus the element
toggleDropdownDismiss(self);dispatchEvent(parentElement,shownDropdownEvent)}/** Hides the dropdown menu from the user. */},{key:"hide",value:function hide(){var self=this;var element=self.element,open=self.open,menu=self.menu,parentElement=self.parentElement;/* istanbul ignore next */if(!open)return;[hideDropdownEvent,hiddenDropdownEvent].forEach(function(e){e.relatedTarget=element});dispatchEvent(parentElement,hideDropdownEvent);if(hideDropdownEvent.defaultPrevented)return;removeClass(menu,showClass);removeClass(parentElement,showClass);setAttribute(element,ariaExpanded,"false");self.open=!open;// only re-attach handler if the instance is not disposed
toggleDropdownDismiss(self);dispatchEvent(parentElement,hiddenDropdownEvent)}/** Removes the `Dropdown` component from the target element. */},{key:"dispose",value:function dispose(){var self=this;if(self.open)self.hide();toggleDropdownHandler(self);_get(_getPrototypeOf(Dropdown.prototype),"dispose",this).call(this)}}])}(BaseComponent);ObjectAssign(Dropdown,{selector:dropdownSelector,init:dropdownInitCallback,getInstance:getDropdownInstance});return Dropdown});
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}define('PoE/Trade/Component/TradeItem',['require','moment','PoE/Trade/Util','PoE/Trade/Component/Item','base64','bootstrap/dropdown','Underscore'],function(require){var moment=require("moment");var Util=require("PoE/Trade/Util");var Item=require("PoE/Trade/Component/Item");var Base64=require("base64");var Dropdown=require("bootstrap/dropdown");var _=require("Underscore");return{props:["itemId","item","listing","sort","gone","refreshing","outdated"],template:"#trade-item-template",data:function data(){return{dropdown:null,whispering:false,whispered:false,expired:false,softFailure:false,ignored:this.listing.account.ignored||false,updated:moment(this.listing.indexed),interval:null}},components:{"item":Item},methods:{refreshMe:function refreshMe(){this.$emit("refresh",this.itemId)},ignoreMe:function ignoreMe(event){var $btn=$(event.currentTarget);$btn.prop("disabled",true).addClass("disabled");var self=this;var dfd=new $.Deferred().always(function(){$btn.prop("disabled",false).removeClass("disabled")}).fail(function(message){console.error(message)});if(this.ignored){dfd.done(function(){self.ignored=false});this.$emit("unignore",this.listing.account,dfd)}else{dfd.done(function(){self.ignored=true});this.$emit("ignore",this.listing.account,dfd)}},unlistMe:function unlistMe(event){var $btn=$(event.currentTarget);$btn.prop("disabled",true).addClass("disabled");var self=this;var dfd=new $.Deferred().done(function(){self.$root.$refs.toastr.Add({msg:self.translate("Item unlisted"),progressbar:false})}).fail(function(error){self.$root.$refs.toastr.Add({msg:error.message,type:"error",progressbar:false,timeout:2000})}).always(function(){$btn.prop("disabled",false).removeClass("disabled")});this.$emit("unlist",this.itemId,dfd)},syncSort:function syncSort(){$(this.$el).find(".s").removeClass("sorted sorted-asc sorted-desc");if(this.sortable){var sortable=$(this.$el).find(".s[data-field=\""+this.sort.field+"\"]");var direction=this.sort.direction=="asc"?"sorted-asc":"sorted-desc";sortable.addClass("sorted").addClass(direction)}},offerType:function offerType(val){if(val=="~price")return this.translate("Exact Price:");if(val=="~b/o")return this.translate("Asking Price:");if(val=="~info")return this.translate("Price with Note:");return this.translate(val)},currency:function currency(val){return this.$root.static_.exchangeDataFlat[val]||null},currencyImg:function currencyImg(val){var curr=this.currency(val);if(curr==null)return null;return this.distUrl(curr.image)},currencyText:function currencyText(val){var subtext=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;var curr=this.currency(val);if(curr==null)return this.translate("Unknown");if(curr.subtext!==undefined&&subtext)return"".concat(curr.text," (").concat(curr.subtext,")");return curr.text},socketClass:function socketClass(socket){var socketVariant=this.$root.settings.socketVariant||1;// NOTE(rory): Can't use === here as Vue2 does some weird proxy shit
if(socket.type){// NOTE(rory): PoE2
return["socket",{"socket--gem":socket.type=="gem"},{"socket--jewel":socket.type=="jewel"},{"socket--rune":socket.type=="rune"},{"socket--gem--activegem":socket.item=="activegem"},{"socket--gem--supportgem":socket.item=="supportgem"},{"socket--jewel--emerald":socket.item=="emerald"},{"socket--jewel--sapphire":socket.item=="sapphire"},{"socket--jewel--ruby":socket.item=="ruby"},{"socket--rune--rune":socket.item=="rune"},{"socket--rune--soulcore":socket.item=="soulcore"},{"socket--rune--primaltalisman":socket.item=="primaltalisman"},{"socket--rune--vividtalisman":socket.item=="vividtalisman"},{"socket--rune--wildtalisman":socket.item=="wildtalisman"},{"socket--rune--sacredtalisman":socket.item=="sacredtalisman"}]}// NOTE(rory): PoE1
return["socket",{socketed:socket.socketed},{socketStr:socket.attr=="S"},{socketDex:socket.attr=="D"},{socketInt:socket.attr=="I"},{socketGen:socket.attr=="G"},{socketAbyss:socket.sColour=="A"},{socketDelve:socket.sColour=="DV"},{socketRight:socket.rightAlign},{socket2:socketVariant===2},{socket3:socketVariant===3}]},hasQuality:function hasQuality(item){// NOTE(rory): Check item properties for a quality block (kinda sus way of doing it...)
return undefined!==_.find(item.properties||[],function(val){return(val===null||val===void 0?void 0:val.type)===6})},searchByMe:function searchByMe(){var self=this;var filters=[];var crucibleFilters=[];$(this.$el).find(".property .s[data-field^=\"stat.\"]").each(function(i,el){var field=$(el).data("field");if(!field)return;filters.push({id:field.substring(5),// remove "stat.""
value:{},disabled:false})});["implicit","enchant","scourge","monster","fractured","explicit","crafted","veiled","pseudo","delve","ultimatum","sanctum","rune","desecrated","imbued"].forEach(function(type){var hashes=self.item.extended.hashes[type]||{};_.each(hashes,function(val){if(!val[0]||val[0].substring(0,9)==="statgroup")return;filters.push({id:val[0],value:{},disabled:false})})});if("crucible"in this.item){_.each(this.item.crucible.nodes,function(val){crucibleFilters.push({id:"crucible.mod_"+val.skill,value:{},disabled:!val.allocated})})}if(filters.length>0||crucibleFilters.length>0){this.$store.commit("showAdvancedSearch",true);if(filters.length>0){this.$store.commit("pushStatGroup",{type:"and",filters:filters})}if(crucibleFilters.length>0){this.$store.commit("pushStatGroup",{type:"crucible",filters:crucibleFilters})}this.$root.save(true);// NOTE(rory): Ew jquery
$("html, body").animate({scrollTop:0},300);this.$root.$refs.toastr.Add({msg:this.translate("Item stats have been added to your stat filters."),progressbar:false,timeout:2000})}},directWhisper:function directWhisper(event){var _this=this;if(this.whispering||this.whispered||this.expired){return}this.whispering=true;this.$root.service.whisperAccount(this.listing.whisper_token).then(function(){_this.whispered=true;_this.$root.$refs.toastr.Add({msg:_this.translate("Whisper sent!"),progressbar:false,timeout:2000})}).catch(function(error){// NOTE(rory): 1 is "Resource not found"
if(error.code===1){_this.$emit("invalidate")}_this.$root.$refs.toastr.Add({msg:error.message,type:"error",progressbar:false,timeout:2000})}).finally(function(){_this.whispering=false})},requestItem:function requestItem(event){var _this2=this;if(this.whispering||this.whispered||this.expired){return}this.whispering=true;event=this.$root.debug?Base64.encodeURI(JSON.stringify(Object.fromEntries(Object.keys(MouseEvent.prototype).map(function(k){return[k,event[k]]})))):undefined;this.$root.service.whisperAccount(this.listing.hideout_token,this.softFailure,event).then(function(response){if(response.success){_this2.whispered=true;_this2.$root.$refs.toastr.Add({msg:_this2.translate("Success! Teleporting..."),progressbar:false,timeout:2000})}else{_this2.softFailure=true;_this2.listing.in_demand=true;_this2.$root.$refs.toastr.Add({msg:_this2.translate("Item is in demand."),type:"warning",progressbar:false,timeout:2000})}}).catch(function(error){// NOTE(rory): 1 is "Resource not found"
if(error.code===1){_this2.$emit("invalidate")}_this2.$root.$refs.toastr.Add({msg:error.message,type:"error",progressbar:false,timeout:2000})}).finally(function(){_this2.whispering=false})},whisperCopied:function whisperCopied(){// TODO(rory): Remove jQuery
if(this.listing.whisper_token==null){this.whispered=true}this.$root.$refs.toastr.Add({msg:this.translate("Whisper message copied."),progressbar:false,timeout:2000})},itemTextCopied:function itemTextCopied(){this.$root.$refs.toastr.Add({msg:this.translate("Item text copied."),progressbar:false,timeout:2000})},threadUrl:Util.ThreadLink,accountUrl:Util.AccountLink},beforeDestroy:function beforeDestroy(){if(this.dropdown){this.dropdown.dispose();this.dropdown=null}clearInterval(this.interval)},computed:{sortable:function sortable(){return this.sort&&!this.sort.disabled&&this.sort.field},searchByEnabled:function searchByEnabled(){return this.sortable&&this.context.extended&&(!_.isEmpty(this.context.extended.hashes)||!!this.context.crucible)},timeAgo:function timeAgo(){if(!this.updated)return"";var diff=moment().diff(this.updated);if(diff<5000){return this.translate("just now")}return this.updated.fromNow()},itemText:function itemText(){if(this.item.extended&&this.item.extended.text){return Base64.decode(this.item.extended.text)}return null},context:function context(){var context=$.extend(true,{},this.item);var sockets=context.sockets;context.sockets=[];context.numSockets=0;// NOTE(rory): Only set this on divination cards
if(context.artFilename&&context.stackSize&&context.stackSize>=context.maxStackSize){context.stackSizeFull=true}if(sockets!==undefined){var socketedItemsBySocket=_.indexBy(context.socketedItems||{},"socket");context.numSockets=sockets.length;for(var i=0,endIndex=sockets.length-1;i<=endIndex;++i){var socket=sockets[i];var cs=_objectSpread(_objectSpread({index:i,socketed:i in socketedItemsBySocket},socket),{},{linkNext:i<endIndex&&socket.group==sockets[i+1].group,rightAlign:i>=2&&i<=3});context.sockets.push(cs)}}return context},whisper_token_expiry:function whisper_token_expiry(){if(this.listing.whisper_token||this.listing.hideout_token){var encoded=(this.listing.whisper_token?this.listing.whisper_token:this.listing.hideout_token).split(".")[1];var token=JSON.parse(window.atob(encoded.replace(/-/g,"+").replace(/_/g,"/")));return token.exp||0}return 0}},mounted:function mounted(){var self=this;// Sort
$(this.$el).on("click",".s",function(e){if($(e.target).is("a"))return;e.preventDefault();var field=$(this).data("field")||$(this).html();self.$emit("sort",field)});this.dropdown=new Dropdown(this.$refs.whisperMenu,{offset:1});// Auto-updating time (5s)
this.interval=setInterval(function(){self.updated=moment(self.listing.indexed);if(self.whisper_token_expiry){var now=new Date().getTime()/1000;if(now>self.whisper_token_expiry){self.expired=true}}},5000);// Sync sort details
this.syncSort();// NOTE(rory): Setup Shaper/Elder backgrounds
if(this.$refs.icon){var w=this.context.w;var h=this.context.h;var backgrounds=[];if(this.context.shaper){var url=this.imageUrl("inventory/ShaperBackground.png?w=".concat(w,"&h=").concat(h,"&x=0&y=0"));backgrounds.unshift("url(".concat(url,") no-repeat center"))}if(this.context.elder){var _url=this.imageUrl("inventory/ElderBackground.png?w=".concat(w,"&h=").concat(h));backgrounds.unshift("url(".concat(_url,") no-repeat center"))}if(backgrounds.length){this.$refs.icon.style["background"]=backgrounds.join(", ")}}},watch:{sort:function sort(){this.syncSort()},whisper_token_expiry:function whisper_token_expiry(){this.whispered=false;this.expired=false;this.softFailure=false}}}});
define('PoE/Trade/Component/TradeExchangeItem',['require','moment','PoE/Trade/Util'],function(require){var moment=require("moment");var Util=require("PoE/Trade/Util");return{props:["itemId","item","listing","sort","gone","refreshing","outdated"],template:"#trade-exchange-item-template",data:function data(){return{whispering:false,ignored:this.listing.account.ignored||false,contact:false,value:[]}},methods:{ignoreMe:function ignoreMe(event){var $btn=$(event.currentTarget);$btn.prop("disabled",true).addClass("disabled");var self=this;var dfd=new $.Deferred().always(function(){$btn.prop("disabled",false).removeClass("disabled")}).fail(function(message){console.error(message)});if(this.ignored){dfd.done(function(){self.ignored=false});this.$emit("unignore",this.listing.account,dfd)}else{dfd.done(function(){self.ignored=true});this.$emit("ignore",this.listing.account,dfd)}},currency:function currency(val){return this.$root.static_.exchangeDataFlat[val]||null},currencyImg:function currencyImg(val){var curr=this.currency(val);if(curr==null)return null;return this.distUrl(curr.image)},currencyText:function currencyText(val){var subtext=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;var curr=this.currency(val);if(curr==null)return this.translate("Unknown");if(curr.subtext!==undefined&&subtext)return"".concat(curr.text," (").concat(curr.subtext,")");return curr.text},threadUrl:Util.ThreadLink,accountUrl:Util.AccountLink,copy:function copy(event){var self=this;this.$copyText(this.whisper).then(function(){self.$root.$refs.toastr.Add({msg:self.translate("Whisper message copied."),progressbar:false,timeout:2000});self.$refs.whisper.select()})},copyMax:function copyMax(event){if(this.offers.length===1){this.$set(this.value,0,this.maxOrders(this.offers[0]));this.contact=true;this.copy(event)}},syncSort:function syncSort(){$(this.$el).find(".s").removeClass("sorted sorted-asc sorted-desc");if(this.sortable){var sortable=$(this.$el).find(".s[data-field=\""+this.sort.field+"\"]");var direction=this.sort.direction=="asc"?"sorted-asc":"sorted-desc";sortable.addClass("sorted").addClass(direction)}},maxOrders:function maxOrders(offer){var stock=offer.item.stock;var amount=offer.item.amount;return Math.max(1,Math.floor(stock/amount))},directWhisper:function directWhisper(event){var _this=this;this.whispering=true;this.$root.service.whisperAccountExchange(this.listing.whisper_token,this.value).then(function(){_this.$root.$refs.toastr.Add({msg:_this.translate("Whisper sent!"),progressbar:false,timeout:2000})}).catch(function(error){_this.$root.$refs.toastr.Add({msg:error.message,type:"error",progressbar:false,timeout:2000})}).finally(function(){_this.whispering=false})}},computed:{sortable:function sortable(){return this.sort&&!this.sort.disabled&&this.sort.field},whisper:function whisper(){var stock=this.stockInfo;if(this.offers.length===0){return""}var want={};var have={};for(var i in this.offers){var offer=this.offers[i];var value=this.value[i];if(value>0){if(!(offer.item.currency in want)){want[offer.item.currency]={value:0,message:offer.item.whisper}}if(!(offer.exchange.currency in have)){have[offer.exchange.currency]={value:0,message:offer.exchange.whisper}}want[offer.item.currency].value+=+parseFloat(offer.item.amount*value).toFixed(2);have[offer.exchange.currency].value+=+parseFloat(offer.exchange.amount*value).toFixed(2)}}if(_.isEmpty(want)){return""}for(var currency in want){if(want[currency].value>stock[currency]){return""}}var wantText=[];for(var _i=0,_Object$values=Object.values(want);_i<_Object$values.length;_i++){var x=_Object$values[_i];wantText.push(this.translate(x.message||"{0}",{"{0}":x.value}))}var haveText=[];for(var _i2=0,_Object$values2=Object.values(have);_i2<_Object$values2.length;_i2++){var _x=_Object$values2[_i2];haveText.push(this.translate(_x.message||"{0}",{"{0}":_x.value}))}return this.translate(this.listing.whisper,{"{0}":wantText.join(", "),"{1}":haveText.join(", ")})},offers:function offers(){if(this.listing.offers){return this.listing.offers}return[{exchange:this.listing.price.exchange||null,item:this.listing.price.item||null}]},stockInfo:function stockInfo(){var stock={};for(var i in this.offers){var offer=this.offers[i];stock[offer.item.currency]=offer.item.stock}return stock},timeAgo:function timeAgo(){if(!this.updated)return"";var diff=moment().diff(this.updated);if(diff<5000){return this.translate("just now")}return this.updated.fromNow()}},created:function created(){this.value=Array(this.offers.length).fill(this.offers.length===1?1:0)},mounted:function mounted(){var self=this;// Sort
$(this.$el).on("click",".s",function(e){if($(e.target).is("a"))return;e.preventDefault();var field=$(this).data("field")||$(this).html();self.$emit("sort",field)});// Sync sort details
this.syncSort()},watch:{sort:function sort(){this.syncSort()}}}});
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}define('PoE/Trade/Component/Panel/HistoryPanel',['require','PoE/Helpers','moment','PoE/Trade/Component/Item'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");var Item=require("PoE/Trade/Component/Item");return function(static_){return{props:[],template:"#history-panel-template",data:function data(){return{merchantHistory:[],ui:{refreshingMerchantHistory:false,currentItemId:null}}},components:{"item":Item},methods:{currency:function currency(val){return this.$root.static_.exchangeDataFlat[val]||null},currencyText:function currencyText(val){var subtext=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;var curr=this.currency(val);if(curr==null)return this.translate("Unknown");if(curr.subtext!==undefined&&subtext)return"".concat(curr.text," (").concat(curr.subtext,")");return curr.text},updateMerchantHistory:function updateMerchantHistory(){var _this=this;var $btn=$(this.$refs.updateMerchantHistoryBtn);$btn.prop("disabled",true);this.ui.refreshingMerchantHistory=true;this.ui.currentItemId=null;this.merchantHistory=[];$.ajax({method:"GET",url:this.apiUrl("history/".concat(this.historyLeague.id))}).done(function(response){_this.merchantHistory=response.result}).fail(function(status,error){var message=_this.translate("Please try again later.");if(error&&error.message){message=error.message}_this.$root.$refs.toastr.Add({msg:_this.translate("Failed to retrieve merchant history.")+"<br>\n<br>\n"+_.escape(message),type:"error",progressbar:true,timeout:5000,allowHtml:true})}).always(function(){_this.ui.refreshingMerchantHistory=false;$btn.prop("disabled",false)})},setCurrentItem:function setCurrentItem(itemId){this.ui.currentItemId=itemId},fromNow:function fromNow(val){return moment(val).fromNow()},socketClass:function socketClass(socket){var socketVariant=this.$root.settings.socketVariant||1;// NOTE(rory): Can't use === here as Vue2 does some weird proxy shit
if(socket.type){// NOTE(rory): PoE2
return["socket",{"socket--gem":socket.type=="gem"},{"socket--jewel":socket.type=="jewel"},{"socket--rune":socket.type=="rune"},{"socket--gem--activegem":socket.item=="activegem"},{"socket--gem--supportgem":socket.item=="supportgem"},{"socket--jewel--emerald":socket.item=="emerald"},{"socket--jewel--sapphire":socket.item=="sapphire"},{"socket--jewel--ruby":socket.item=="ruby"},{"socket--rune--rune":socket.item=="rune"},{"socket--rune--soulcore":socket.item=="soulcore"},{"socket--rune--primaltalisman":socket.item=="primaltalisman"},{"socket--rune--vividtalisman":socket.item=="vividtalisman"},{"socket--rune--wildtalisman":socket.item=="wildtalisman"},{"socket--rune--sacredtalisman":socket.item=="sacredtalisman"}]}// NOTE(rory): PoE1
return["socket",{socketed:socket.socketed},{socketStr:socket.attr=="S"},{socketDex:socket.attr=="D"},{socketInt:socket.attr=="I"},{socketGen:socket.attr=="G"},{socketAbyss:socket.sColour=="A"},{socketDelve:socket.sColour=="DV"},{socketRight:socket.rightAlign},{socket2:socketVariant===2},{socket3:socketVariant===3}]}},computed:{historyLeague:{get:function get(){return _.findWhere(static_.leagues,{id:this.$store.state.persistent.league,realm:this.$store.state.persistent.realm})||null},set:function set(league){this.$root.setCurrentRealm(league.realm);this.$root.setCurrentLeague(league.id);this.updateMerchantHistory()}},historyLeagues:function historyLeagues(){return _.chain(static_.leagues).groupBy("realm").map(function(group,key){return{label:key,entries:group}}).value()},currentItem:function currentItem(){var entry=_.findWhere(this.merchantHistory,{item_id:this.ui.currentItemId});if(!entry||!entry.item){return null}var context=$.extend(true,{},entry.item);var sockets=context.sockets;context.sockets=[];context.numSockets=0;// NOTE(rory): Only set this on divination cards
if(context.artFilename&&context.stackSize&&context.stackSize>=context.maxStackSize){context.stackSizeFull=true}if(sockets!==undefined){var socketedItemsBySocket=_.indexBy(context.socketedItems||{},"socket");context.numSockets=sockets.length;for(var i=0,endIndex=sockets.length-1;i<=endIndex;++i){var socket=sockets[i];var cs=_objectSpread(_objectSpread({index:i,socketed:i in socketedItemsBySocket},socket),{},{linkNext:i<endIndex&&socket.group==sockets[i+1].group,rightAlign:i>=2&&i<=3});context.sockets.push(cs)}}return context}},mounted:function mounted(){this.updateMerchantHistory()}}}});
define('PoE/Trade/Component/Panel/SettingsPanel',['require','PoE/Helpers'],function(require){var PoEHelpers=require("PoE/Helpers");return function(static_){return{props:[],template:"#settings-panel-template",data:function data(){return{account:{ignoreList:[],ignoreListPage:1,ignoreListPerPage:50,ignoreListTotal:1000,status:null,language:null},ui:{refreshingIgnoreList:false}}},computed:{accountIgnoreListPageMax:function accountIgnoreListPageMax(){return Math.ceil(this.account.ignoreListTotal/this.account.ignoreListPerPage)},accountIgnoreListPageLabel:function accountIgnoreListPageLabel(){return this.translate("Showing {0}-{1} of {2} (Max 1000)",{"{0}":Math.max(0,this.account.ignoreListPage-1)*this.account.ignoreListPerPage+1,"{1}":this.account.ignoreListPage*this.account.ignoreListPerPage,"{2}":this.account.ignoreListTotal})},accountStatusOptions:function accountStatusOptions(){return static_.account.status},accountStatusRetrievingMessage:function accountStatusRetrievingMessage(){return static_.account.statusRetrieving},accountHideStatus:function accountHideStatus(){return _.find(static_.account.status,function(item){return item.id===this.account.status},this)||{}},accountLanguageOverrideOptions:function accountLanguageOverrideOptions(){return static_.account.languages},accountLanguageOverride:function accountLanguageOverride(){return _.find(static_.account.languages,function(item){return item.id===this.account.language},this)||{}},searchBarLayoutOptions:function searchBarLayoutOptions(){return static_.searchBarLayouts},searchBarLayout:{get:function get(){return _.findWhere(static_.searchBarLayouts,{value:this.$root.settings.searchBarLayout})||null},set:function set(layout){this.$root.setSearchBarLayout(layout.value)}},socketVariantOptions:function socketVariantOptions(){return static_.socketVariants},socketVariant:{get:function get(){return _.findWhere(static_.socketVariants,{value:this.$root.settings.socketVariant})||null},set:function set(variant){this.$root.setSocketVariant(variant.value)}},notificationOptions:function notificationOptions(){var result=[];if(this.$root.audio.custom){result.push({file:"",name:this.$root.audio.name?PoEHelpers.translate("Custom: {sound}",{"{sound}":this.$root.audio.name}):PoEHelpers.translate("Custom..."),custom:true})}else{result.push({file:"",name:PoEHelpers.translate("Custom..."),custom:true})}return static_.notifications.concat(result)},notificationSound:{get:function get(){if(this.$root.audio.custom){return _.findWhere(this.notificationOptions,{custom:true})||null}return _.findWhere(this.notificationOptions,{file:this.$root.audio.file})||null},set:function set(sound){if(sound.custom){if(_.isEmpty(sound.file)){// Custom
$(this.$refs.customSound).trigger("click");return}this.$root.audio.name=sound.name}this.$root.audio.file=sound.file;this.$root.audio.custom=sound.custom;this.$root.doWoop(true)}},notificationSoundVolume:{get:function get(){return _.findWhere(this.notificationVolumeOptions,{value:this.$root.audio.volume})||null},set:function set(volume){this.$root.audio.volume=volume.value;this.$root.doWoop()}},notificationVolumeOptions:function notificationVolumeOptions(){return static_.notificationVolumes}},mounted:function mounted(){this.fetchAccountSettings();var self=this;$(this.$refs.customSound).on("change",function(e){var target=e.currentTarget;var file=target.files[0];if(target.files&&file){if(file.type.substr(0,5)!=="audio"){self.$root.$refs.toastr.Add({msg:self.translate("The selected file was not recognized as an audio file"),type:"error",progressbar:false,timeout:2000});return}var reader=new FileReader;reader.onload=function(e){self.notificationSound={name:file.name,file:e.target.result,custom:true}};reader.onerror=function(e){self.$root.$refs.toastr.Add({msg:self.translate("An error occurred while loading the selected sound"),type:"error",progressbar:false,timeout:2000})};reader.readAsDataURL(file)}})},methods:{fetchAccountSettings:function fetchAccountSettings(){var self=this;$.ajax({url:this.apiUrl("settings")}).done(function(response){self.account.status=response.status;self.account.language=response.language;// self.account.ignoreList = response.ignoreList;
}).fail(function(){self.$root.$refs.toastr.Add({msg:self.translate("Failed to fetch account settings."),type:"error",progressbar:false,timeout:2000})});this.updateAccountIgnoreList()},updateAccountSettings:function updateAccountSettings(setting,value){var self=this;if(value!==undefined){var previous=this.account[setting]||null;this.account[setting]=null;var updateBody={};updateBody[setting]=value;$.ajax({method:"PUT",url:this.apiUrl("settings"),dataType:"json",data:JSON.stringify(updateBody),contentType:"application/json"}).done(function(response){self.account[setting]=response[setting];self.$root.$refs.toastr.Add({msg:self.translate("Account settings updated!"),progressbar:false,timeout:2000})}).fail(function(){self.account[setting]=previous;self.$root.$refs.toastr.Add({msg:self.translate("Failed to update account settings."),type:"error",progressbar:false,timeout:2000})})}},updateAccountHideStatus:function updateAccountHideStatus(status){var _this=this;if(status.id==="all"){if(window.confirm(this.translate("By choosing this option, players will be able to whisper you for your items outside of your current league.")+"\n"+this.translate("This would require you to switch leagues in order to complete the trade.")+"\n"+this.translate("Are you sure this is what you want?")+"\n"+"\n"+this.translate("Note that this setting may be reset from time to time to ensure it is only being set by those willing to switch leagues."))===false){// NOTE(rory): Gross, but Vue multiselect expects something to change...
var previous=this.account.status;this.account.status=null;this.$nextTick(function(){_this.account.status=previous});return}}this.updateAccountSettings("status",status.id)},updateAccountLanguageOverride:function updateAccountLanguageOverride(language){this.updateAccountSettings("language",language.id)},clearCachedData:function clearCachedData(event){var $btn=$(event.currentTarget);$btn.prop("disabled",true);this.$root.clearCachedData();this.$root.$refs.toastr.Add({msg:this.translate("Reloading Page..."),type:"info",progressbar:true,timeout:2000,onClosed:function onClosed(){$btn.prop("disabled",false);window.location.reload(true)}})},clearAccountIgnoreList:function clearAccountIgnoreList(event){var $btn=$(event.currentTarget);$btn.prop("disabled",true);var self=this;$.ajax({method:"DELETE",url:this.apiUrl("ignore")}).done(function(response){if(response.result){self.account.ignoreList=[];self.account.ignoreListPage=1;self.account.ignoreListTotal=0;self.$root.$refs.toastr.Add({msg:response.message,progressbar:false,timeout:2000})}}).fail(function(){self.$root.$refs.toastr.Add({msg:self.translate("Failed to clear ignore list."),type:"error",progressbar:false,timeout:2000})}).always(function(){$btn.prop("disabled",false)})},nextPageAccountIgnoreList:function nextPageAccountIgnoreList(){this.account.ignoreListPage=Math.min(this.account.ignoreListPage+1,this.accountIgnoreListPageMax);this.updateAccountIgnoreList()},prevPageAccountIgnoreList:function prevPageAccountIgnoreList(){this.account.ignoreListPage=Math.max(this.account.ignoreListPage-1,1);this.updateAccountIgnoreList()},updateAccountIgnoreList:function updateAccountIgnoreList(page){var _this2=this;page=page||this.account.ignoreListPage;var $btn=$(this.$refs.updateIgnoreListBtn);$btn.prop("disabled",true);this.ui.refreshingIgnoreList=true;$.ajax({method:"GET",url:this.apiUrl("ignore"+(page>1?"?page="+page:""))}).done(function(response){_this2.account.ignoreList=response.result;_this2.account.ignoreListPage=response.pagination.page;_this2.account.ignoreListPerPage=response.pagination.per_page;_this2.account.ignoreListTotal=response.pagination.total}).fail(function(){_this2.$root.$refs.toastr.Add({msg:_this2.translate("Failed to retrieve ignore list."),type:"error",progressbar:false,timeout:2000})}).always(function(){_this2.ui.refreshingIgnoreList=false;$btn.prop("disabled",false)})},removeAccountIgnoreListEntry:function removeAccountIgnoreListEntry(account,event){var $btn=$(event.currentTarget);$btn.prop("disabled",true);var self=this;var dfd=$.Deferred().always(function(){$btn.prop("disabled",false)}).done(function(){var index=_.findIndex(self.account.ignoreList,function(ignored){return ignored===account});if(index>=0)self.account.ignoreList.splice(index,1)});this.$root.service.unignoreAccount(account,dfd)}}}}});
define('PoE/Trade/Component/Panel/AboutPanel',['require','PoE/Helpers','moment'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");return function(static_){return{props:[],template:"#about-panel-template",data:function data(){return{expanded:{}}},methods:{image:function image(entry){if(!entry.image){return null}return this.distUrl(entry.image)},toggleExchangeCategory:function toggleExchangeCategory(group){var expanded=!(this.expanded[group.id]||false);this.$set(this.expanded,group.id,expanded)}},computed:{exchangeOptions:function exchangeOptions(){return static_.exchangeData},chaosImage:function chaosImage(){var entry=_.findWhere(this.exchangeOptions[0].entries,{id:"chaos"});return entry?this.distUrl(entry.image):null},transmuteImage:function transmuteImage(){var entry=_.findWhere(this.exchangeOptions[0].entries,{id:"transmute"});return entry?this.distUrl(entry.image):null}},mounted:function mounted(){if(static_.alertId!==null){this.$root.setLastSeenAbout(static_.alertId)}}}}});
define('PoE/Trade/Component/Panel/ItemSearchPanel',['require','PoE/Helpers','moment'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");return function(_static_){return{template:"#item-search-panel-template",data:function data(){return{term:null}},computed:{enableTopSearchBar:function enableTopSearchBar(){return this.$root.settings.searchBarLayout==="both"},unavailable:function unavailable(){return this.$store.state.transient.search.active&&this.$store.state.transient.search.active.live},state:function state(){return this.$store.state.persistent},advancedSearchHidden:function advancedSearchHidden(){return this.$store.state.transient.advancedSearchHidden||false},knownItems:function knownItems(){var result=_static_.knownItems.slice();result.forEach(function(group){group.entries.forEach(function(entry){var _entry$text;return(_entry$text=entry.text)!==null&&_entry$text!==void 0?_entry$text:entry.text=entry.type})});if(this.searchTerm){result.unshift({label:this.translate("Custom Search"),entries:[this.selectedItem]})}return result},knownItemsFlat:function knownItemsFlat(){return _.chain(this.knownItems).pluck("entries").flatten().value()},realmOptions:function realmOptions(){return _static_.realms.length?_static_.realms:null},leagueOptions:function leagueOptions(){return _.where(_static_.leagues,{realm:this.state.realm})},statusOptions:function statusOptions(){if(this.state.tab=="exchange"){return _static_.exchangeStatus}var group=_.findWhere(_static_.propertyFilters,{id:"status_filters"});if(!group)return[];var filter=_.findWhere(group.filters,{id:"status"});if(!filter)return[];return filter.option.options||[]},static_:function static_(){return _static_},searchTerm:{get:function get(){return this.term||this.state.term},set:function set(val){this.term=val}},exchangeHighlight:{get:function get(){return this.$store.state.transient.exchange.highlight},set:_.debounce(function(val){this.$store.commit("setExchangeHighlight",val)},50)},selectedStatus:{get:function get(){return _.findWhere(this.statusOptions,{id:this.state.status})||this.statusOptions[0]||null},set:function set(val){this.$emit("status",val.id)}},selectedItem:{get:function get(){if(this.state.tab=="exchange"){return null}if(this.searchTerm){return{text:this.searchTerm,term:this.searchTerm,flags:{}}}// NOTE(rory): Discriminator + basetype should be unique
if(this.state.disc){if(this.state.name){return _.find(this.knownItemsFlat,function(item){return item.disc==this.state.disc&&item.type==this.state.type&&item.name==this.state.name},this)||null}return _.find(this.knownItemsFlat,function(item){return item.disc==this.state.disc&&item.type==this.state.type&&item.name==null},this)||null}if(this.state.name){return _.find(this.knownItemsFlat,function(item){return item.type==this.state.type&&item.name==this.state.name&&item.disc==null},this)||null}return _.find(this.knownItemsFlat,function(item){return item.type==this.state.type&&item.name==null&&item.disc==null},this)||null},set:function set(value){if(this.searchTerm&&value&&!value.term){this.searchTerm=null}this.$emit("item",value)}},selectedRealm:{get:function get(){return _.findWhere(this.realmOptions,{id:this.state.realm})||null},set:function set(realm){this.$emit("realm",realm.id)}},selectedLeague:{get:function get(){return _.findWhere(_static_.leagues,{id:this.state.league,realm:this.state.realm})||null},set:function set(league){this.$emit("league",league.id)}}},mounted:function mounted(){var self=this;this.$root.$once("ready",function(){if(!self.selectedItem&&self.$refs.search&&self.$refs.search.$el){self.$refs.search.$el.focus()}})},methods:{clearState:function clearState(force){this.$emit("clear",force)},toggleLive:function toggleLive(){this.$emit("live")},doSearch:function doSearch(collapseImmediately,liveId){this.$emit("search",collapseImmediately,liveId)},setSearchTerm:function setSearchTerm(val){if(val.length>128){val=val.substr(0,128)}this.searchTerm=val;this.selectedItem=this.selectedItem},fixSearch:function fixSearch(val,id){var ref=this.$refs.search;if(ref.filteredOptions.length==0)return;if(ref.search==""){if(ref.isOpen){this.searchTerm=null;this.selectedItem=null}ref.pointerReset();return}// NOTE(rory): Fixes the search pointer being attached to a group label (invalid)
var currOption=ref.filteredOptions[ref.pointer];if(currOption&&currOption.$isLabel){ref.pointerForward()}},updateSearchPanel:function updateSearchPanel(){var ref=this.$refs.search;if(this.selectedItem){ref.updateSearch(this.selectedItem.text||"");$(ref.$el).find(".multiselect__input").select()}ref.pointerReset()}},watch:{"state.term":function stateTerm(val){if(!val){this.searchTerm=val}}}}}});
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}define('PoE/Trade/Component/ItemFilter',['require','vue','PoE/Helpers'],function(require){var Vue=require("vue");var PoEHelpers=require("PoE/Helpers");return function(static_){return{props:["filter","state","index","spaced","property"],template:"#filter-template",data:function data(){return{invalid:false,lastMutable:null,mutating:false}},mounted:function mounted(){},computed:{id:function id(){return this.filter.id},unavailable:function unavailable(){return this.$store.state.transient.search.active&&this.$store.state.transient.search.active.live},disabled:function disabled(){return this.filter.disabled||false},warning:function warning(){if(this.filter.group.startsWith("weight")&&this.filter.id.startsWith("crucible.")){return PoEHelpers.translate("Crucible stats are ignored in Weighted Sum groups.")}return null},options:function options(){if(this.filter.option){var options=[];// NOTE(rory): This could be kind of weird/bad but I dunno at this point
if(this.filter.option.knownItem){if(!static_.knownItems){return[]}if(this.filter.option.knownItem.uniques){var FilterUniques=function FilterUniques(group){return _.chain(group.entries).filter(function(x){return x.flags&&x.flags.unique||false}).map(function(x){return{id:x.name,text:x.name}}).uniq(function(x){return x.id}).value()};options=_.union(FilterUniques(_.findWhere(static_.knownItems,{id:"weapon"})),FilterUniques(_.findWhere(static_.knownItems,{id:"armour"})),FilterUniques(_.findWhere(static_.knownItems,{id:"accessory"})),FilterUniques(_.findWhere(static_.knownItems,{id:"gem"})),FilterUniques(_.findWhere(static_.knownItems,{id:"jewel"})),FilterUniques(_.findWhere(static_.knownItems,{id:"flask"})),FilterUniques(_.findWhere(static_.knownItems,{id:"map"})))}if(this.filter.option.knownItem.cards){options=_.union(options,_.map(_.findWhere(static_.knownItems,{id:"card"}).entries,function(x){return{id:x.type,text:x.text||x.type}}))}if(this.filter.option.knownItem.currency){options=_.union(options,_.map(_.findWhere(static_.knownItems,{id:"currency"}).entries,function(x){return{id:x.type,text:x.text||x.type}}))}}else{options=this.filter.option.options.slice()}// NOTE(rory): Prepend an "Any" option for non-properties (or known item)
if(!this.property||this.filter.option.knownItem){options.unshift({id:null,text:this.translate("Any")})}return options}return[]},option:function option(){return _.findWhere(this.options,{id:this.value.option||null})||_.findWhere(this.options,{id:null})||null},value:function value(){return this.state},mutateOptions:function mutateOptions(){return(this.filter.group==="crucible"?static_.knownCrucibleStats:static_.knownStats)||[]},mutateOptionsFlat:function mutateOptionsFlat(){return(this.filter.group==="crucible"?static_.knownCrucibleStatsFlat:static_.knownStatsFlat)||[]},mutableValue:{get:function get(){var id=this.id;var result=_.find(this.mutateOptionsFlat,function(item){return item.id===id})||null;if(result===null){this.invalid=true;return this.lastMutable||{id:null,text:this.translate("Unavailable Stat")}}this.invalid=false;this.lastMutable=result;return _objectSpread(_objectSpread({},result),{},{text:result.text.replace("\n"," ")})}}},methods:{toggleMutating:function toggleMutating(e){this.mutating=!this.mutating;if(this.mutating){this.$nextTick(function(){this.$refs.mutate.activate()})}},mutateLabel:function mutateLabel(option){return"("+this.translate(option.type)+") "+option.text.replace("\n"," ")},mutate:function mutate(type){if(this.id!==type.id){this.$emit("mutate",this.index,type.id)}},toggle:function toggle(){this.$emit("toggle",this.index)},remove:function remove(){this.$emit("remove",this.index)},updateOption:function updateOption(option,id){this.$emit("update",this.index,{option:option.id})},updateInt:function updateInt(key,value){value=parseInt(value);if(isNaN(value))value=null;var obj={};obj[key]=value;this.$emit("update",this.index,obj)},updateFloat:function updateFloat(key,value){value=parseFloat(value);if(isNaN(value))value=null;var obj={};obj[key]=value;this.$emit("update",this.index,obj)},updateInput:function updateInput(value){if(_.isEmpty(value))value=null;this.$emit("update",this.index,{input:value})},updateOptionPanel:function updateOptionPanel(){this.$refs.option.pointerSetCurrent();this.$nextTick(function(){this.$refs.option.pointerEnsureVisible()})},updateMutatePanel:function updateMutatePanel(){var ref=this.$refs.mutate;if(this.mutableValue){ref.updateSearch(this.mutableValue.text||"");$(ref.$el).find(".multiselect__input").select()}ref.pointerReset()}}}}});
define('PoE/Trade/Component/PropertyFilterGroup',['require','vue','PoE/Helpers','PoE/Trade/Component/ItemFilter'],function(require){var Vue=require("vue");var PoEHelpers=require("PoE/Helpers");var ItemFilter=require("PoE/Trade/Component/ItemFilter");return function(static_){return{props:["group","state","index"],template:"#property-filter-group-template",components:{"item-filter":ItemFilter(static_)},data:function data(){return{}},computed:{hiddenByDefault:function hiddenByDefault(){var setting=this.$root.settings.hiddenGroups[this.group.id];if(setting==null)return this.group.hidden;return setting},unavailable:function unavailable(){return this.$store.state.transient.search.active&&this.$store.state.transient.search.active.live},disabled:function disabled(){return this.state.disabled===undefined?this.hiddenByDefault||false:this.state.disabled},spaced:function spaced(){var entries=[];var count=0;_.each(this.filters,function(filter,index){if(filter.fullSpan||filter.halfSpan||false)return;entries[index]=!!(count%2);count++});return entries},filters:function filters(){return this.group.filters},modified:function modified(){return this.state.filters&&!_.isEmpty(this.state.filters)}},methods:{updateFilter:function updateFilter(index,value){var filter=this.filters[index].id;var val=$.extend({},this.state.filters&&this.state.filters[filter]||{},value);val=_.pick(val,function(v){return v!==null});this.$store.commit("setPropertyFilter",{group:this.group.id,index:filter,value:val});this.$root.save(true)},clearMe:function clearMe(){this.$store.commit("clearPropertyGroup",{group:this.group.id});this.$root.save(true)},toggleMe:function toggleMe(){// NOTE(rory): Proxy through root so we can set values
this.$root.setPropertyFilterGroupDisabled({type:"filters",group:this.group.id,disable:!this.disabled});this.$root.save()}}}}});
define('PoE/Trade/Component/StatFilterGroup',['require','vue','PoE/Helpers','PoE/Trade/Component/ItemFilter'],function(require){var Vue=require("vue");var PoEHelpers=require("PoE/Helpers");var ItemFilter=require("PoE/Trade/Component/ItemFilter");return function(static_){return{props:["group","state","index"],template:"#stat-filter-group-template",components:{"item-filter":ItemFilter(static_)},data:function data(){return{mutating:false}},computed:{value:function value(){var min=this.state.value?this.state.value.min:null;var max=this.state.value?this.state.value.max:null;return{min:min,max:max}},unavailable:function unavailable(){return this.$store.state.transient.search.active&&this.$store.state.transient.search.active.live},disabled:function disabled(){return this.state.disabled||false},closable:function closable(){return this.group.id>0},filters:function filters(){var self=this;return _.map(this.state.filters,function(filter){var minMax=true;var weight=self.group.weight;var option=undefined;var data=self.availableOptionsFlat[filter.id]||null;if(data&&data.option){minMax=false;option=data.option}else if(data&&data.type==="crucible"){minMax=false;weight=false}else if(data&&data.type==="ultimatum"){minMax=false}return{id:filter.id,text:filter.id,disabled:filter.disabled||false,mutable:true,removable:true,minMax:minMax,option:option,fullSpan:true,weight:weight,group:self.group.type||false}})},availableOptions:function availableOptions(){return(this.group.type==="crucible"?static_.knownCrucibleStats:static_.knownStats)||[]},availableOptionsFlat:function availableOptionsFlat(){return(this.group.type==="crucible"?static_.knownCrucibleStatsFlat:static_.knownStatsFlat)||[]},mutateOptions:function mutateOptions(){return[{label:this.translate("Stat Groups"),entries:static_.statGroups.filter(function(group){return group.mutable!==false})}]},mutableValue:{get:function get(){var id=this.group.type;var result=_.find(this.mutateOptions[0].entries,function(item){return item.type===id})||null;return result}}},methods:{toggleMutating:function toggleMutating(e){this.mutating=!this.mutating;if(this.mutating){this.$nextTick(function(){this.$refs.mutate.activate()})}},mutateLabel:function mutateLabel(option){return option.title},mutate:function mutate(type){if(this.group.type!==type.type){this.$store.commit("setStatGroupType",{group:this.group.id,type:type.type});this.$root.save(true)}},addStatFilterLabel:function addStatFilterLabel(option){return"("+option.type+") "+option.text.replace("\n"," ")},toggleFilter:function toggleFilter(index){var filter=this.state.filters[index];this.$store.commit("setStatFilter",{group:this.group.id,index:index,value:{id:filter.id,value:filter.value,disabled:!(filter.disabled||false)}});this.$root.save(true)},updateFilter:function updateFilter(index,value){var filter=this.state.filters[index];var val=_.pick($.extend({},filter.value||{},value),function(v){return v!==null});this.$store.commit("setStatFilter",{group:this.group.id,index:index,value:{id:filter.id,value:val,disabled:filter.disabled||false}});this.$root.save(true)},updateFloat:function updateFloat(key,value){if(_.isEmpty(value))value=null;else value=parseFloat(value);if(isNaN(value))value=null;var obj=$.extend({},this.value);obj[key]=value;obj=_.pick(obj,function(v){return v!==null});this.$store.commit("setStatGroupValue",{group:this.group.id,value:obj});this.$root.save(true)},mutateFilter:function mutateFilter(index,id){// NOTE(rory): We used to try and preserve the value of the mutating filter but that gets dicey with min/max vs option
// let state = this.state.filters[index];
this.$store.commit("setStatFilter",{group:this.group.id,index:index,value:{id:id}});this.$root.save(true)},selectFilter:function selectFilter(val){if(val){val=val.id;var filter=this.availableOptionsFlat[val]||null;if(!filter){return}this.$store.commit("setStatFilter",{group:this.group.id,value:{id:filter.id}});this.$root.save(true)}},removeFilter:function removeFilter(index){this.$store.commit("removeStatFilter",{group:this.group.id,index:index});this.$root.save(true)},removeMe:function removeMe(){// NOTE(rory): Should this be in ItemFilterPanel?
this.$store.commit(this.closable?"removeStatGroup":"resetStatGroup",{group:this.group.id});this.$root.save(true)},toggleMe:function toggleMe(){// NOTE(rory): Should this be in ItemFilterPanel?
this.$store.commit("setFilterGroupDisabled",{type:"stats",group:this.group.id,disable:!this.disabled});this.$root.save(true)},fixSearch:function fixSearch(val,id){var ref=this.$refs.search;if(ref.filteredOptions.length==0)return;if(ref.search==""){ref.pointerReset();return}// NOTE(rory): Fixes the search pointer being attached to a group label (invalid)
var currOption=ref.filteredOptions[ref.pointer];if(!currOption||currOption.$isLabel){ref.pointerForward()}},updateMutatePanel:function updateMutatePanel(){var ref=this.$refs.mutate;if(this.mutableValue){ref.updateSearch(this.mutableValue.text||"");$(ref.$el).find(".multiselect__input").select()}ref.pointerReset()}}}}});
define('PoE/Trade/Component/Panel/ItemFilterPanel',['require','PoE/Helpers','moment','PoE/Trade/Component/PropertyFilterGroup','PoE/Trade/Component/StatFilterGroup'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");var PropertyFilterGroup=require("PoE/Trade/Component/PropertyFilterGroup");var StatFilterGroup=require("PoE/Trade/Component/StatFilterGroup");return function(static_){return{template:"#item-filter-panel-template",components:{"property-filter-group":PropertyFilterGroup(static_),"stat-filter-group":StatFilterGroup(static_)},data:function data(){return{debug:false}},computed:{unavailable:function unavailable(){return this.$store.state.transient.search.active&&this.$store.state.transient.search.active.live},state:function state(){return this.$store.state.persistent},stateLeft:function stateLeft(){return this.state.filters},stateRight:function stateRight(){return this.state.stats},groupsLeft:function groupsLeft(){return _.filter(static_.propertyFilters,function(group){return group.id!=="status_filters"})},groupsRight:function groupsRight(){var result=[];var groupTypes=_.map(this.stateRight,function(group){return group.type});_.each(groupTypes,function(type,index){var template=this.getStatGroupTemplate(type);if(template){template.id=index;if(index===0&&type=="and"){template.title=PoEHelpers.translate("Stat Filters")}result.push(template)}},this);return result},statGroupsAvailable:function statGroupsAvailable(){return[{label:this.translate("Stat Groups"),entries:static_.statGroups}]},news:function news(){var seenId=this.$root.settings.lastDismissedNews;return _.filter(static_.news,function(entry){return entry.id>seenId})}},methods:{getStatGroupTemplate:function getStatGroupTemplate(type){var template=_.find(static_.statGroups,function(g){return g.type==type});if(template===undefined)return null;return _.extend({mutable:true},template)},selectStatGroup:function selectStatGroup(val){if(!val||!val.type)return;this.$store.commit("pushStatGroup",{type:val.type});this.$root.save()},fixSearch:function fixSearch(val,id){var ref=this.$refs.search;if(ref.filteredOptions.length==0)return;if(ref.search==""){ref.pointerReset();return}// NOTE(rory): Fixes the search pointer being attached to a group label (invalid)
var currOption=ref.filteredOptions[ref.pointer];if(!currOption||currOption.$isLabel){ref.pointerForward()}},dismissNews:function dismissNews(){var last=_.sortBy(this.news,function(entry){return-entry.id})[0]||null;if(last!==null){this.$root.setLastDismissedNews(last.id)}}}}}});
define('PoE/Trade/Component/ExchangeFilterEntry',['require'],function(require){return function(static_){return{props:["entry","group","state"],template:"#exchange-filter-entry-template",data:function data(){return{isSet:this.entry.pseudo}},methods:{toggle:function toggle(){if(!!this.state){this.$emit("deselect",this.entry)}else{this.$emit("select",this.entry)}}},computed:{image:function image(){if(!this.entry.image){return null}return this.distUrl(this.entry.image)},title:function title(){if(!this.entry.image&&!this.entry.description){return null}return this.entry.description||this.entry.text||null}},mounted:function mounted(){}}}});
function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},_typeof(o)}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))})}return e}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+""}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(t)}define('PoE/Trade/Component/Panel/ExchangeFilterPanel',['require','PoE/Helpers','moment','PoE/Trade/Component/ExchangeFilterEntry','plugins'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");var ExchangeFilterEntry=require("PoE/Trade/Component/ExchangeFilterEntry");var $=require("plugins");return function(static_){return{template:"#exchange-filter-panel-template",data:function data(){return{debug:false,expanded:{want:{Currency:true},have:{Currency:true}}}},components:{"entry":ExchangeFilterEntry(static_)},mounted:function mounted(){$(this.$el).tooltip({title:function title(){return $(this).attr("data-title").split("\n").join("<br>")},html:true,animation:false,placement:"bottom",selector:".exchange-filter-item[data-title]"})},computed:{state:function state(){return this.$store.state.persistent},searchTerm:function searchTerm(){return this.$store.state.transient.exchange.highlight||null},options:function options(){return static_.exchangeData},optionsToGroup:function optionsToGroup(){var opts={};_.each(this.options,function(group){_.each(group.entries,function(item){opts[item.id]=group.id})});return opts},optionsFlat:function optionsFlat(){return static_.exchangeDataFlat},filters:function filters(){var self=this;var have=_.chain(this.state.exchange.have).keys().map(function(id){return _.findWhere(self.optionsFlat,{id:id})||{id:null}}).value();var want=_.chain(this.state.exchange.want).keys().map(function(id){return _.findWhere(self.optionsFlat,{id:id})||{id:null}}).value();return{have:have,want:want}},filtersById:function filtersById(){var self=this;return{have:_.indexBy(this.filters.have,"id"),want:_.indexBy(this.filters.want,"id")}},filtersByGroup:function filtersByGroup(){var self=this;return{have:_.chain(this.filters.have).map(function(item){return _.extend(item,{group:self.optionsToGroup[item.id]})}).groupBy("group").value(),want:_.chain(this.filters.want).map(function(item){return _.extend(item,{group:self.optionsToGroup[item.id]})}).groupBy("group").value()}},optionClasses:function optionClasses(){var searchTerm=this.searchTerm&&this.searchTerm.toLowerCase();var result={};if(searchTerm){_.each(this.optionsFlat,function(item){result[item.id]=[item.text.toLowerCase().includes(searchTerm)||item.description&&item.description.toLowerCase().includes(searchTerm)?"highlighted":null]})}return result},matchedCategories:function matchedCategories(){var term=this.searchTerm&&this.searchTerm.toLowerCase();if(!term||term.length===0){return[]}return this.options.reduce(function(acc,_ref){var id=_ref.id,entries=_ref.entries;var count=entries.filter(function(candidate){return candidate.text.toLowerCase().includes(term)||candidate.description&&candidate.description.toLowerCase().includes(term)}).length;if(count===0){return acc}return _objectSpread(_objectSpread({},acc),{},_defineProperty({},id,count))},{})},stockCount:{get:function get(){var min=this.state.exchange.stock?this.state.exchange.stock.min:null;var max=this.state.exchange.stock?this.state.exchange.stock.max:null;return{min:min,max:max}},set:function set(value){this.$store.commit("setExchangeStock",value)}},mustFulfilTradeOptions:function mustFulfilTradeOptions(){return[{id:null,text:PoEHelpers.translate("Any")},{id:"true",text:PoEHelpers.translate("Yes")}]},mustFulfilTradeOption:function mustFulfilTradeOption(){return _.findWhere(this.mustFulfilTradeOptions,{id:this.mustFulfilTrade?"true":null})||null},mustFulfilTrade:{get:function get(){return this.state.exchange.fulfillable||null},set:function set(value){this.$store.commit("setExchangeFulfillableTrade",value)}},collapseOptions:function collapseOptions(){return[{id:null,text:PoEHelpers.translate("No")},{id:"true",text:PoEHelpers.translate("Yes")}]},collapseOption:function collapseOption(){return _.findWhere(this.collapseOptions,{id:this.collapse?"true":null})||null},collapse:{get:function get(){return this.state.exchange.collapse||null},set:function set(value){this.$store.commit("setExchangeCollapse",value)}},sellerAccount:{get:function get(){return this.state.exchange.account||null},set:function set(value){this.$store.commit("setExchangeSellerAccount",value)}}},methods:{toggleCategory:function toggleCategory(type,category,index){var value=this.expanded[type][category]||false;this.$set(this.expanded[type],category,!value)},swapWantHave:function swapWantHave(){this.$store.commit("swapExchangeItems");this.$root.save(true)},addWantItem:function addWantItem(value){this.$store.commit("setExchangeItem",{type:"want",id:value.id});this.$root.save(true)},addHaveItem:function addHaveItem(value){this.$store.commit("setExchangeItem",{type:"have",id:value.id});this.$root.save(true)},removeWantItem:function removeWantItem(value){this.$store.commit("removeExchangeItem",{type:"want",id:value.id});this.$root.save(true)},removeHaveItem:function removeHaveItem(value){this.$store.commit("removeExchangeItem",{type:"have",id:value.id});this.$root.save(true)},updateStockCount:function updateStockCount(key,value){if(_.isEmpty(value))value=null;else value=parseInt(value);if(isNaN(value))value=null;var obj=$.extend({},this.stockCount);obj[key]=value;obj=_.pick(obj,function(v){return v!==null});this.stockCount=obj},updateMustFulfilTrade:function updateMustFulfilTrade(value){this.mustFulfilTrade=value.id=="true"?true:null},updateCollapse:function updateCollapse(value){this.collapse=value.id=="true"?true:null},updateSellerAccount:function updateSellerAccount(value){this.sellerAccount=value}}}}});
define('PoE/Trade/Component/Panel/ItemSearchControlPanel',['require','PoE/Helpers','moment'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");return function(static_){return{template:"#item-search-control-panel-template",data:function data(){return{cooldown:false}},computed:{tab:function tab(){return this.$store.state.persistent.tab||null},current:function current(){return this.$store.state.transient.search.active||{}},searching:function searching(){return this.current&&this.current.id===null},invalid:function invalid(){return false},advancedSearchHidden:function advancedSearchHidden(){return this.$store.state.transient.advancedSearchHidden||false},searchLabel:function searchLabel(){if(this.invalid){return this.translate("Select Items to Exchange")}var content=this.current.live?this.translate("Live Search: "):"";if(this.searching||this.current.live&&this.current.status==="searching"){content+=this.translate("Searching...")}else if(this.current.live&&this.current.status==="waiting"){content+=this.translate("Reconnecting...")}else if(this.current.live&&this.current.status==="connecting"){content+=this.translate("Connecting...")}else if(this.current.live&&this.current.status==="connected"){content+=this.translate("Authenticating...")}else if(this.current.live){content+=this.translate("Disconnected")}else{content+=this.translate("Search")}return content}},mounted:function mounted(){},methods:{search:function search(){var _this=this;this.cooldown=true;setTimeout(function(){_this.cooldown=false},800);this.$emit("search")},liveSearch:function liveSearch(){this.$emit("live")},clear:function clear(){this.$emit("clear")},toggleSearch:function toggleSearch(){this.$store.commit("toggleSearch")}}}}});
define('PoE/Trade/Component/ItemResultSet',['require'],function(require){return{props:["index","search","state","sort","outdated"],template:"#item-resultset-template",data:function data(){return{temporary:{},fetching:false}},watch:{fetchable:function fetchable(){this.temporary={}}},computed:{items:function items(){return this.state.items},fetchable:function fetchable(){var self=this;if(typeof this.state.result==="string"){return[this.state.result]}var max=10;return _.chain(this.state.result).reject(function(itemId){return self.items[itemId]!==undefined}).first(max).value()},exchange:function exchange(){return this.search.type==="exchange"}},methods:{isItemRefreshing:function isItemRefreshing(itemId){return this.temporary[itemId]&&this.temporary[itemId].refreshing||false},fetchNext:function fetchNext(){if(this.fetching)return;var fetchable=this.fetchable.slice();if(!fetchable.length)return;this.fetching=true;var self=this;var dfd=new $.Deferred().done(function(results){var resultIds=[];for(var i in results){var result=results[i];if(result){resultIds.push(result.id);self.$store.commit("setItemForSearchResult",{localId:self.search.localId,id:self.state.id,itemId:result.id,itemData:result})}else if(typeof self.state.result!=="string"){self.$store.commit("setItemForSearchResult",{localId:self.search.localId,id:self.state.id,itemId:fetchable[i],itemData:null})}}if(typeof self.state.result==="string"){self.$store.commit("updateSearchResult",{localId:self.search.localId,id:self.state.id,result:resultIds})}}).fail(function(status,error){if(status===0)return;if(status===429){self.$root.$refs.toastr.Add({msg:self.translate("Too many requests.")+"<br>\n<br>\n"+_.escape(error.message),type:"error",progressbar:true,timeout:0});// NOTE(rory): Disconnect any live-search
if(self.search.live){self.$store.commit("updateSearchQuery",{localId:self.search.localId,live:false})}return}self.$root.$refs.toastr.Add({msg:self.translate("Failed to fetch the next set of trade items."),type:"error",progressbar:false,timeout:2000})}).always(function(){setTimeout(function(){return self.fetching=false},400)});this.$emit("fetch",this.search,fetchable,dfd)},ignoreAccount:function ignoreAccount(account,promise){this.$root.service.ignoreAccount(account,promise)},unignoreAccount:function unignoreAccount(account,promise){this.$root.service.unignoreAccount(account,promise)},unlistItem:function unlistItem(itemId,promise){var self=this;promise.done(function(message){self.setItemGone({id:itemId})});this.$root.service.unlistItem(itemId,promise)},refreshTradeItem:function refreshTradeItem(itemId){if(this.fetching)return;this.fetching=true;var self=this;var dfd=new $.Deferred().done(function(results){for(var i in results){var result=results[i];if(result){self.$store.commit("setItemForSearchResult",{localId:self.search.localId,id:self.state.id,itemId:result.id,itemData:result})}else{self.setItemGone({id:itemId})}}}).fail(function(status){if(status===0)return;self.$root.$refs.toastr.Add({msg:self.translate("Could not refresh trade item."),type:"error",progressbar:false,timeout:2000})}).always(function(){if(self.temporary[itemId]){self.$delete(self.temporary[itemId],"refreshing")}self.fetching=false});if(!this.temporary[itemId]){this.$set(this.temporary,itemId,{})}this.$set(this.temporary[itemId],"refreshing",true);this.$emit("fetch",this.search,[itemId],dfd)},sortResults:function sortResults(field){if(this.sort.disabled)return;var sort={};if(this.sort.field===field){sort.direction=this.sort.direction=="asc"?"desc":"asc"}else if(this.search.type==="exchange"){sort.direction=field==="stock"?"desc":"asc"}else{// NOTE(rory): Most things want to sort high->low, but prices are low->high
var defaultToAscending=field==="price"||field==="fee";sort.direction=defaultToAscending?"asc":"desc"}sort.field=field;this.$emit("sort",sort)},setItemGone:function setItemGone(item){var storedItem=this.items[item.id]||null;if(storedItem){this.$store.commit("setItemForSearchResult",{localId:this.search.localId,id:this.state.id,itemId:item.id,itemData:_.extend({},storedItem,{gone:true})})}}}}});
define('PoE/Trade/Component/Panel/ItemResultsPanel',['require','PoE/Helpers','moment','PoE/Trade/Component/ItemResultSet'],function(require){var PoEHelpers=require("PoE/Helpers");var moment=require("moment");var ItemResultSet=require("PoE/Trade/Component/ItemResultSet");return function(static_){return{props:[],template:"#item-results-panel-template",data:function data(){return{searchRequest:null,items:{},live:{connection:null,attempts:0,closing:false,retryTimer:null,decayTimer:null,notification:null}}},components:{"resultset":ItemResultSet},watch:{searchable:function searchable(){this.search()},"current.live":function currentLive(){this.resetLiveSearch();if(this.current.live){this.startLiveSearch()}}},computed:{layout:{get:function get(){return this.$root.settings.layout},set:function set(layout){this.$root.setResultLayout(layout)}},searchable:function searchable(){return{realm:this.current.realm||null,league:this.current.league||null,type:this.current.type||null,query:this.current.query||null,sort:this.current.sort||null}},current:function current(){return this.$store.state.transient.search.active||{}},exchange:function exchange(){return this.current.type==="exchange"},outdated:function outdated(){var result={};// NOTE(rory): Only check for outdated if we have multiple result sets
if(this.current&&this.current.results.length>1){var seen={};_.each(this.current.results,function(resultSet){result[resultSet.id]={};_.each(resultSet.items,function(item){if(seen[item.id]){result[resultSet.id][item.id]=true}seen[item.id]=true},this)},this)}return result},sort:function sort(){if(_.isEmpty(this.current)||this.current.live){return{disabled:true}}if(this.current.type==="exchange"&&this.current.collapse){return{disabled:true}}var key=_.chain(this.current.sort).keys().first().value()||null;return{field:key,direction:key?this.current.sort[key]:null,disabled:false}},localId:function localId(){return this.current.localId||null},results:function results(){return this.current.results||[]},count:function count(){if(this.current.live){return this.total}return _.reduce(this.current.results,function(result,entry){return result+entry.result.length},0)},total:function total(){return this.current?this.current.total:null},resultLabel:function resultLabel(){var content="";if(this.total==0){content+=this.translate("No results found")}else if(this.total==1){content+=this.translate("Showing 1 result")}else if(this.current.live){content+=this.translate("Showing {i} results",{"{i}":this.total})}else{content+=this.translate("Showing {i} results",{"{i}":this.count});if(this.total!=this.count){content+=" ("+this.translate("{i} matched",{"{i}":this.current.inexact?this.total+"+":this.total})+")"}}if(this.current.live&&this.total==static_.liveResultTotalLimit){content+=" ("+this.translate("max")+")"}return content},pseudo:function pseudo(){// NOTE(rory): Global search data
return this.$store.state.transient.search.pseudo}},methods:{switchLayoutToImmersion:function switchLayoutToImmersion(){this.layout=null},switchLayoutToCompact:function switchLayoutToCompact(){this.layout="compact"},switchLayoutToCompactTwo:function switchLayoutToCompactTwo(){this.layout="compact-two"},search:function search(){if(this.searchRequest!==null){var restore=null;if(this.current){restore=$.extend({},this.current)}// NOTE(rory): This will invalid the current request
this.searchRequest.abort();this.searchRequest=null;if(restore){// NOTE(rory): The act of resetting an active search will trigger this function to fire again
this.$store.commit("addSearchQuery",{localId:restore.localId,type:restore.type,realm:restore.realm,league:restore.league,query:restore.query,sort:restore.sort});this.$store.commit("setSearchActive",{localId:restore.localId});console.log("Restored cancelled search!");return}}this.resetLiveSearch();if(_.isEmpty(this.current))return;if(this.current.live)return;if(!this.current.league){this.$store.commit("removeCurrentSearch");this.$root.$refs.toastr.Add({msg:this.translate("Please select a valid league to search in."),type:"error",progressbar:false,timeout:2000});return}var self=this;var dfd=new $.Deferred;dfd.done(function(response){var resultId=_.uniqueId("result_");self.$store.commit("clearSearchResults",{localId:self.current.localId});var resultIds=response.result||[];var resultItems={};if(!Array.isArray(resultIds)){resultIds=_.pluck(response.result,"id");resultItems=_.indexBy(response.result,"id")}self.$store.commit("addSearchResult",{localId:self.current.localId,resultId:resultId,id:response.id,result:resultIds.slice(),items:resultItems,total:response.total,inexact:response.inexact||false})});dfd.fail(function(status,error){self.$store.commit("removeCurrentSearch");// NOTE(rory): Don't show errors for invalid requests (such as abort)
if(status===0)return;var message=self.translate("Please try again later.");if(error&&error.message){message=error.message}self.$root.$refs.toastr.Add({msg:self.translate("An error occurred.")+"<br>\n<br>\n"+_.escape(message),type:"error",progressbar:true,timeout:5000,allowHtml:true})});dfd.always(function(){self.searchRequest=null});if(this.current.type==="exchange"){this.searchRequest=this.$root.service.performExchangeSearch(this.current.realm,this.current.league,{query:this.current.query||null,sort:this.current.sort||null},dfd);return}this.searchRequest=this.$root.service.performSearch(this.current.realm,this.current.league,{query:this.current.query||null,sort:this.current.sort||null},dfd)},changeSort:function changeSort(sort){if(this.sort.disabled)return;var result={};if(sort.field&&sort.direction){result[sort.field]=sort.direction}this.$store.commit("updateSearchQuery",{localId:this.current.localId,sort:result})},fetchNext:function fetchNext(search,fetchable,promise){var self=this;// NOTE(rory): search === this.current
if(fetchable.length>0){var url=this.apiUrl("fetch/".concat(fetchable.join(","),"?query=").concat(this.current.id));if(this.current.realm&&this.current.realm!=="pc"){url+="&realm=".concat(this.current.realm)}if(this.pseudo.length){url+="&pseudos[]="+this.pseudo.join("&pseudos[]=")}$.ajax({url:url,method:"GET",timeout:15000}).done(function(response){promise.resolve(response.result)}).fail(function(jqXHR){promise.reject(jqXHR.status,jqXHR.responseJSON&&jqXHR.responseJSON.error)}).always(function(){self.fetchRequest=null})}else{promise.reject(0,undefined)}},startLiveSearch:function startLiveSearch(){if(!this.current||!this.current.live){return}var localId=this.current.localId;this.resetLiveSearch();var self=this;this.live.connection=new WebSocket("wss://"+location.host+this.apiUrl("live"+(this.current.realm!=="pc"?"/"+this.current.realm:"")+"/"+this.current.league+"/"+this.current.id));this.live.closing=false;this.$store.commit("setLiveSearchStatus","connecting");this.live.connection.onopen=function(event){self.$store.commit("setLiveSearchStatus","connected")};this.live.connection.onmessage=function(event){var result=JSON.parse(event.data);if(result.auth){self.$store.commit("setLiveSearchStatus","searching");return}if(result.debug){self.$root.debug=true;return}if(result.count){// NOTE(rory): This is a JWT
var resultId=_.uniqueId("result_");self.$store.commit("addSearchResult",{localId:localId,resultId:resultId,id:self.current.id,result:result.result,total:result.count});self.$root.notify(result.count);self.$store.commit("incrementActiveUnreadHits");return}};this.live.connection.onerror=function(event){self.$root.$refs.toastr.Add({title:self.translate("Live Search error"),msg:self.translate("An error occurred while connecting"),type:"error",progressbar:true,timeout:5000})};this.live.connection.onclose=function(event){self.$store.commit("setLiveSearchStatus","");if(self.live.closing){// NOTE(rory): Close was expected, ignore
return}self.resetLiveSearch();if(event.code===1013){// NOTE(rory): We were intentionally disconnected
self.$root.$refs.toastr.Add({title:self.translate("Live Search error"),msg:self.translate("Rate-limiting is active for your account"),type:"error",progressbar:true,timeout:0});return}var restart=event.code===1012;var timeout=30;if(!restart){timeout=Math.min(10+self.live.attempts*5,60)}self.scheduleLiveSearch(timeout,restart)}},scheduleLiveSearch:function scheduleLiveSearch(timeout,restart){var self=this;var localId=this.current.localId;if(this.live.notification){this.$root.$refs.toastr.Close(this.live.notification)}if(this.live.attempts>=5){this.$root.$refs.toastr.Add({title:this.translate("Live Search retry limit exceeded"),msg:this.translate("Please refresh the page and try again"),type:"error",progressbar:true,timeout:0});this.$store.commit("updateSearchQuery",{localId:localId,live:false});return}this.live.attempts++;this.$root.$refs.toastr.Add(this.live.notification={title:restart?this.translate("Server is restarting"):this.translate("Disconnected from server"),msg:this.translate("Retrying connection in {{TIMEOUT}} seconds...",{"{{TIMEOUT}}":timeout}),type:"warning",progressbar:true,timeout:timeout*1000,onClosed:function onClosed(){self.live.notification=null}});this.$store.commit("setLiveSearchStatus","waiting");this.live.retryTimer=setTimeout(function(){self.startLiveSearch()},timeout*1000)},resetLiveSearch:function resetLiveSearch(){if(this.live.connection){this.live.closing=true;this.live.connection.close();this.live.connection=null}if(this.live.retryTimer){clearTimeout(this.live.retryTimer);this.live.retryTimer=null}if(this.live.notification){this.$root.$refs.toastr.Close(this.live.notification);this.live.notification=null}}},mounted:function mounted(){var self=this;this.search();this.live.decayTimer=setInterval(function(){if(!self.live.retryTimer&&self.live.attempts){--self.live.attempts}},30000)},beforeDestroy:function beforeDestroy(){this.resetLiveSearch();if(this.live.decayTimer){clearInterval(this.live.decayTimer);this.live.decayTimer=null}}}}});
define('PoE/Trade/App',['require','es6-promise','vue','vuex','vue-infinite-scroll','vue-multiselect','vue-toastr','vue-clipboard','plugins','bootstrap-tooltip','Underscore','moment','lscache','PoE/Helpers','PoE/Item/Markup/markup','favico','PoE/Trade/Data/Static','PoE/Trade/Service','PoE/Trade/Component/TradeItem','PoE/Trade/Component/TradeExchangeItem','PoE/Trade/Component/Panel/HistoryPanel','PoE/Trade/Component/Panel/SettingsPanel','PoE/Trade/Component/Panel/AboutPanel','PoE/Trade/Component/Panel/ItemSearchPanel','PoE/Trade/Component/Panel/ItemFilterPanel','PoE/Trade/Component/Panel/ExchangeFilterPanel','PoE/Trade/Component/Panel/ItemSearchControlPanel','PoE/Trade/Component/Panel/ItemResultsPanel'],function(require){// NOTE(rory): IE support
require("es6-promise");var Vue=require("vue");var Vuex=require("vuex");var InfiniteScroll=require("vue-infinite-scroll");var MultiSelect=require("vue-multiselect");var Toastr=require("vue-toastr");var VueClipboard=require("vue-clipboard");var $=require("plugins");var Tooltip=require("bootstrap-tooltip");var _=require("Underscore");var moment=require("moment");var lscache=require("lscache");var PoEHelpers=require("PoE/Helpers");var Markup2=require("PoE/Item/Markup/markup");var Favico=require("favico");var favico=new Favico({animation:"none"});var static_=require("PoE/Trade/Data/Static");var TradeService=require("PoE/Trade/Service");var TradeItem=require("PoE/Trade/Component/TradeItem");var TradeExchangeItem=require("PoE/Trade/Component/TradeExchangeItem");var HistoryPanel=require("PoE/Trade/Component/Panel/HistoryPanel");var SettingsPanel=require("PoE/Trade/Component/Panel/SettingsPanel");var AboutPanel=require("PoE/Trade/Component/Panel/AboutPanel");var ItemSearchPanel=require("PoE/Trade/Component/Panel/ItemSearchPanel");var ItemFilterPanel=require("PoE/Trade/Component/Panel/ItemFilterPanel");var ExchangeFilterPanel=require("PoE/Trade/Component/Panel/ExchangeFilterPanel");var ItemSearchControlPanel=require("PoE/Trade/Component/Panel/ItemSearchControlPanel");var ItemResultsPanel=require("PoE/Trade/Component/Panel/ItemResultsPanel");Vue.use(Vuex);var transient={state:{searches:[],search:{pseudo:[],active:null},exchange:{highlight:null},blurred:false,advancedSearchHidden:false},mutations:{setExchangeHighlight:function setExchangeHighlight(state,term){state.exchange.highlight=term},updateBlurred:function updateBlurred(state,blurred){state.blurred=blurred},resetActiveUnreadHits:function resetActiveUnreadHits(state){if(state.search.active){state.search.active.unreadHits=0}},incrementActiveUnreadHits:function incrementActiveUnreadHits(state){if(state.blurred&&state.search.active){state.search.active.unreadHits++}},addSearchQuery:function addSearchQuery(state,data){var result=$.extend({},{localId:data.localId,id:null,type:null,live:false,status:false,realm:data.realm,league:data.league,query:data.query,sort:data.sort,results:[],total:null,inexact:false,collapse:false,dirty:false,unreadHits:0},data);state.searches.unshift(result)},updateSearchQuery:function updateSearchQuery(state,data){var search=_.findWhere(state.searches,{localId:data.localId});if(search){if(data.realm)Vue.set(search,"realm",data.realm);if(data.league)Vue.set(search,"league",data.league);if(data.query)Vue.set(search,"query",data.query);if(data.sort)Vue.set(search,"sort",data.sort);if(search.type==="search"&&data.live!==undefined){Vue.set(search,"live",data.live)}}},addSearchResult:function addSearchResult(state,data){var search=_.findWhere(state.searches,{localId:data.localId});if(search){Vue.set(search,"id",data.id);Vue.set(search,"inexact",search.inexact||data.inexact);var total=data.total;// NOTE(rory): Hide search panel if we get results!
if(search.results.length==0&&total>0&&!search.live){state.advancedSearchHidden=true}// NOTE(rory): For livesearches, we need to record the actual total
if(search.live){total=search.total+data.total;// NOTE(rory): Enforce a maximum limit per search object
while(total>static_.liveResultTotalLimit){var s=search.results.pop();total-=s.total}}Vue.set(search,"total",total);search.results.unshift({id:data.resultId,result:data.result,items:data.items||{},total:data.total})}},updateSearchResult:function updateSearchResult(state,data){var search=_.findWhere(state.searches,{localId:data.localId});if(search){var resultset=_.findWhere(search.results,{id:data.id});if(resultset){Vue.set(resultset,"result",data.result)}}},setItemForSearchResult:function setItemForSearchResult(state,data){var search=_.findWhere(state.searches,{localId:data.localId});if(search){var resultset=_.findWhere(search.results,{id:data.id});if(resultset){Vue.set(resultset.items,data.itemId,data.itemData)}}},clearSearchResults:function clearSearchResults(state,data){var search=_.findWhere(state.searches,{localId:data.localId});if(search){Vue.set(search,"results",[]);Vue.set(search,"total",null)}},updatePseudoStats:function updatePseudoStats(state,stats){state.search.pseudo=stats},setSearchActive:function setSearchActive(state,data){if(!data.localId){state.search.active=null}else{state.search.active=_.findWhere(state.searches,{localId:data.localId});if(state.search.active.live){state.advancedSearchHidden=true}}},setLiveSearchStatus:function setLiveSearchStatus(state,status){if(state.search.active){state.search.active.status=status}},setSearchDirty:function setSearchDirty(state){if(state.search.active){state.search.active.dirty=true}},removeCurrentSearch:function removeCurrentSearch(state){var search=state.search.active;if(search){state.search.active=null;var index=_.indexOf(state.searches,search);if(index>=0){state.searches.splice(index,1)}}},toggleSearch:function toggleSearch(state){state.advancedSearchHidden=!state.advancedSearchHidden},showAdvancedSearch:function showAdvancedSearch(state,show){state.advancedSearchHidden=!show},clearExchangeHighlight:function clearExchangeHighlight(state){state.exchange.highlight=null}}};var persistent={state:{id:null,tab:"search",name:null,type:null,disc:null,term:null,realm:null,league:null,status:"any",filters:{},stats:[{type:"and",filters:[]}],exchange:{want:{},have:{},fulfillable:true}},mutations:{setTab:function setTab(state,tab){state.tab=tab},setRealm:function setRealm(state,realm){state.realm=realm},setLeague:function setLeague(state,league){state.league=league},setItem:function setItem(state,item){state.name=item.name||null;state.type=item.type||null;state.disc=item.disc||null;state.term=item.term||null},setStatus:function setStatus(state,status){state.status=status},setExchangeStock:function setExchangeStock(state,data){if(data){Vue.set(state.exchange,"stock",data)}else{Vue.delete(state.exchange,"stock")}},setExchangeFulfillableTrade:function setExchangeFulfillableTrade(state,data){Vue.set(state.exchange,"fulfillable",data)},setExchangeCollapse:function setExchangeCollapse(state,data){if(data){Vue.set(state.exchange,"collapse",data)}else{Vue.delete(state.exchange,"collapse")}},setExchangeSellerAccount:function setExchangeSellerAccount(state,data){if(data&&data.length){Vue.set(state.exchange,"account",data)}else{Vue.delete(state.exchange,"account")}},removeExchangeItem:function removeExchangeItem(state,data){Vue.delete(state.exchange[data.type],data.id)},setExchangeItem:function setExchangeItem(state,data){Vue.set(state.exchange[data.type],data.id,true)},swapExchangeItems:function swapExchangeItems(state){var have=state.exchange["have"];state.exchange["have"]=state.exchange["want"];state.exchange["want"]=have},// === Property Filters ===
clearPropertyGroup:function clearPropertyGroup(state,data){Vue.set(state.filters[data.group],"filters",{})},setPropertyFilter:function setPropertyFilter(state,data){if(!state.filters[data.group]){Vue.set(state.filters,data.group,{filters:{}})}if(!_.isObject(state.filters[data.group].filters)||_.isArray(state.filters[data.group].filters)){Vue.set(state.filters[data.group],"filters",{})}if(_.isEmpty(data.value)){Vue.delete(state.filters[data.group].filters,data.index)}else{Vue.set(state.filters[data.group].filters,data.index,data.value)}},setFilterGroupDisabled:function setFilterGroupDisabled(state,data){if(!state[data.type][data.group]){Vue.set(state[data.type],data.group,{})}Vue.set(state[data.type][data.group],"disabled",data.disable)},// === Stat Filters ===
resetStatGroup:function resetStatGroup(state,data){Vue.set(state.stats[data.group],"type","and");Vue.set(state.stats[data.group],"filters",[])},setStatFilter:function setStatFilter(state,data){if(data.index!==undefined){state.stats[data.group].filters.splice(data.index,1,data.value)}else{state.stats[data.group].filters.push(data.value)}},removeStatFilter:function removeStatFilter(state,data){state.stats[data.group].filters.splice(data.index,1)},setStatGroupValue:function setStatGroupValue(state,data){if(_.isEmpty(data.value)){Vue.delete(state.stats[data.group],"value")}else{Vue.set(state.stats[data.group],"value",data.value)}},setStatGroupType:function setStatGroupType(state,data){Vue.set(state.stats[data.group],"type",data.type);Vue.delete(state.stats[data.group],"value")},removeStatGroup:function removeStatGroup(state,data){state.stats.splice(data.group,1)},pushStatGroup:function pushStatGroup(state,data){state.stats.push({filters:data.filters||[],type:data.type})},clearSearchForm:function clearSearchForm(state,force){// NOTE(rory): Reset relevant state
if(state.tab==="exchange"||force){state.exchange={want:{},have:{},fulfillable:true}}if(state.tab==="search"||force){state.name=null;state.type=null;state.disc=null;state.term=null;state.filters={};state.stats=[{type:"and",filters:[]}]}}}};var store=new Vuex.Store({strict:true,modules:{persistent:persistent,transient:transient}});return function(options){static_.realm=options.realm||null;static_.realms=options.realms||[];static_.leagues=options.leagues||[];static_.news=options.news||[];static_.basePath=options.basePath||static_.basePath;// NOTE(rory): `trade` or `trade2`
lscache.setBucket(static_.basePath.substring(1));lscache.setExpiryMilliseconds(1000);// 1 second
if(lscache.supported()){localStorage.removeItem("items");localStorage.removeItem("stats");localStorage.removeItem("data");localStorage.removeItem("settings");localStorage.removeItem("woop");lscache.flushExpired();static_.knownItems=lscache.get("items")||{};static_.knownStats=lscache.get("stats")||{};static_.exchangeData=lscache.get("data")||{};static_.propertyFilters=lscache.get("filters")||[];// NOTE(rory): Always refetch if we do not have status filters (moved into data API due to PoE2 being different from PoE1)
if(!_.findWhere(static_.propertyFilters,{id:"status_filters"})){static_.propertyFilters=[]}}var apiUrl=function apiUrl(url){return"/api".concat(static_.basePath,"/").concat(url.replace(/^\//,""))};Vue.mixin({methods:{apiUrl:apiUrl}});return $.when(_.isEmpty(static_.knownItems)?$.ajax(apiUrl("data/items")):null,_.isEmpty(static_.knownStats)?$.ajax(apiUrl("data/stats")):null,_.isEmpty(static_.exchangeData)?$.ajax(apiUrl("data/static")):null,_.isEmpty(static_.propertyFilters)?$.ajax(apiUrl("data/filters")):null).then(function(itemsResult,statsResult,exchangeResult,filtersResult){if(itemsResult&&itemsResult[1]=="success"){var _itemsResult$2$getRes,_itemsResult$2$getRes2;var ttl=parseInt((_itemsResult$2$getRes=(_itemsResult$2$getRes2=itemsResult[2].getResponseHeader("Cache-Control"))===null||_itemsResult$2$getRes2===void 0?void 0:_itemsResult$2$getRes2.match(/max-age=(\d+)/)[1])!==null&&_itemsResult$2$getRes!==void 0?_itemsResult$2$getRes:300);// or 5 mins
static_.knownItems=itemsResult[0].result;lscache.set("items",static_.knownItems,ttl+1);// NOTE(rory): +1 so that it sets an expiry if max-age=0
}if(statsResult&&statsResult[1]=="success"){var _statsResult$2$getRes,_statsResult$2$getRes2;var _ttl=parseInt((_statsResult$2$getRes=(_statsResult$2$getRes2=statsResult[2].getResponseHeader("Cache-Control"))===null||_statsResult$2$getRes2===void 0?void 0:_statsResult$2$getRes2.match(/max-age=(\d+)/)[1])!==null&&_statsResult$2$getRes!==void 0?_statsResult$2$getRes:300);// or 5 mins
static_.knownStats=statsResult[0].result;lscache.set("stats",static_.knownStats,_ttl+1)}if(exchangeResult&&exchangeResult[1]=="success"){var _exchangeResult$2$get,_exchangeResult$2$get2;var _ttl2=parseInt((_exchangeResult$2$get=(_exchangeResult$2$get2=exchangeResult[2].getResponseHeader("Cache-Control"))===null||_exchangeResult$2$get2===void 0?void 0:_exchangeResult$2$get2.match(/max-age=(\d+)/)[1])!==null&&_exchangeResult$2$get!==void 0?_exchangeResult$2$get:300);// or 5 mins
static_.exchangeData=exchangeResult[0].result;lscache.set("data",static_.exchangeData,_ttl2+1)}if(filtersResult&&filtersResult[1]=="success"){var _filtersResult$2$getR,_filtersResult$2$getR2;var _ttl3=parseInt((_filtersResult$2$getR=(_filtersResult$2$getR2=filtersResult[2].getResponseHeader("Cache-Control"))===null||_filtersResult$2$getR2===void 0?void 0:_filtersResult$2$getR2.match(/max-age=(\d+)/)[1])!==null&&_filtersResult$2$getR!==void 0?_filtersResult$2$getR:300);// or 5 mins
static_.propertyFilters=filtersResult[0].result;lscache.set("filters",static_.propertyFilters,_ttl3+1)}_.each(static_.knownStats,function(group){static_.knownStatsFlat=_.extend(static_.knownStatsFlat,_.indexBy(group.entries,"id"));if(group.id==="crucible"){static_.knownCrucibleStats=[group];static_.knownCrucibleStatsFlat=_.indexBy(group.entries,"id")}});_.each(static_.exchangeData,function(group){static_.exchangeDataFlat=_.extend(static_.exchangeDataFlat,_.indexBy(group.entries,"id"))});Vue.use(VueClipboard);Vue.use(InfiniteScroll.install);Vue.component("Multiselect",MultiSelect.default);Vue.component("vue-toastr",Toastr);Vue.mixin({methods:{translate:PoEHelpers.translate,distUrl:PoEHelpers.distUrl,imageUrl:PoEHelpers.imageUrl,parseMarkup:Markup2.parseMarkup,underline:function underline(text,search){if(text&&text.length){text=_.escape(text);search=_.escape(search.trim());var index=text.toLowerCase().indexOf(search.toLowerCase());if(index<0||search.length==0)return text;return text.substring(0,index)+"<strong>"+text.substring(index,index+search.length)+"</strong>"+text.substring(index+search.length)}return search},formatNumber:function formatNumber(num){return Number(num).toLocaleString()}}});// NOTE(rory): Trade!
Vue.component("trade-item",TradeItem);Vue.component("trade-exchange-item",TradeExchangeItem);Vue.component("history-panel",HistoryPanel(static_));Vue.component("settings-panel",SettingsPanel(static_));Vue.component("about-panel",AboutPanel(static_));Vue.component("item-search-panel",ItemSearchPanel(static_));Vue.component("item-filter-panel",ItemFilterPanel(static_));Vue.component("exchange-filter-panel",ExchangeFilterPanel(static_));Vue.component("item-search-control-panel",ItemSearchControlPanel(static_));Vue.component("item-results-panel",ItemResultsPanel(static_));window.app=new Vue({el:"#trade",store:store,data:{static_:static_,debug:false,loaded:false,exchange:{enabled:false},ui:{read:null,title:null,unreadCount:0},audio:{name:null,file:static_.notifications[0].file,volume:50,custom:false,playOnLoad:false},settings:{hiddenGroups:{},layout:null,lastDismissedNews:0,lastSeenAbout:0,searchBarLayout:null,socketVariant:1}},computed:{service:function service(){return TradeService.call(this,{apiUrl:apiUrl})},transient:function transient(){return this.$store.state.transient},persistent:function persistent(){return _.pick(this.state,["realm","league","status"])},state:function state(){return this.$store.state.persistent},aboutAlert:function aboutAlert(){return static_.alertId!==null&&this.settings.lastSeenAbout<static_.alertId},searchId:function searchId(){var current=this.transient.search.active;if(current&&current.id){return current.id}return null},searchLive:function searchLive(){var current=this.transient.search.active;return current&&current.live},stateUrl:function stateUrl(){if(this.state.tab!=="search"&&this.state.tab!=="exchange"){return static_.basePath+"/"+this.state.tab}if(this.searchId){return static_.basePath+"/"+this.state.tab+(this.state.realm!=="pc"?"/"+this.state.realm:"")+"/"+this.state.league+"/"+this.searchId+(this.searchLive?"/live":"")}return static_.basePath+"/"+this.state.tab+(this.state.realm!=="pc"?"/"+this.state.realm:"")+"/"+this.state.league},query:function query(){var query={};if(this.state.status)query.status={option:this.state.status};if(this.state.tab=="exchange"){query.have=_.keys(this.state.exchange.have);query.want=_.keys(this.state.exchange.want);if(this.state.exchange.stock!==null){query.stock=this.state.exchange.stock}if(!this.state.exchange.fulfillable){// NOTE(rory): fulfillable: null means to not enforce fulfillable (the default)
query.fulfillable=this.state.exchange.fulfillable}if(this.state.exchange.collapse!==null){query.collapse=this.state.exchange.collapse}if(this.state.exchange.account!==null){query.account=this.state.exchange.account}}else{if(_.isEmpty(this.state.term)){if(!_.isEmpty(this.state.name)){query.name=this.state.name;if(!_.isEmpty(this.state.disc)){query.name={option:query.name,discriminator:this.state.disc}}}if(!_.isEmpty(this.state.type)){query.type=this.state.type;if(!_.isEmpty(this.state.disc)){query.type={option:query.type,discriminator:this.state.disc}}}}else{query.term=this.state.term}if(!_.isEmpty(this.state.stats))query.stats=this.state.stats;// NOTE(rory): Do some clean up here, remove empty filters
var filters={};for(var groupId in this.state.filters){var group=this.state.filters[groupId];if(_.isEmpty(group.filters))continue;filters[groupId]=group}if(!_.isEmpty(filters)){query.filters=filters}}return{query:query}},pseudo:function pseudo(){var self=this;var isPseudo=function isPseudo(statId){if(static_.knownStatsFlat){var stat=static_.knownStatsFlat[statId];if(!stat)return false;return(stat.type||null)==="pseudo"}return false};var result=[];for(var id in this.state.stats){var group=this.state.stats[id];if(group.disabled)continue;_.each(group.filters,function(filter){if(isPseudo(filter.id)){result.push(filter.id)}})}return result}},watch:{searchId:function searchId(){this.updateUrl()},searchLive:function searchLive(){this.updateUrl()},pseudo:function pseudo(){this.$store.commit("updatePseudoStats",this.pseudo)},audio:{handler:function handler(){lscache.set("woop",this.audio)},deep:true},settings:{handler:function handler(){lscache.set("settings",this.settings)},deep:true}},mounted:function mounted(){var self=this;this.$root.$refs.toastr.defaultPosition="toast-bottom-center";this.ui.title=document.title;window.onpopstate=function(event){self.load(event.state)};$(function(){$(window).scroll(self.checkScroll);$(document).on("click",".top-btn",function(){$("html, body").animate({scrollTop:0},300);return false});function doSearch(){if(self.state.tab!=="search"&&self.state.tab!=="exchange")return;var current=self.transient.search.active;if(!current||current.id!==null){_.debounce(function(){Vue.nextTick(self.doSearch)},200)()}}$(document).on("keydown","body",function(e){if(e.keyCode!==13||!$(e.target).is("body"))return;doSearch()});$(document).on("keydown",".search-advanced input.form-control",function(e){if(e.keyCode!==13)return;doSearch()});var sound=lscache.get("woop");if(!_.isEmpty(sound)){self.audio.file=sound.file;self.audio.volume=sound.volume;self.audio.custom=sound.custom;if(sound.custom){self.audio.name=sound.name}}$(self.$refs.audio).on("canplay",function(){if(self.audio.playOnLoad)self.doWoop()});var settings=lscache.get("settings");if(!_.isEmpty(settings)){self.settings.hiddenGroups=settings.hiddenGroups||{};self.settings.layout=settings.layout||{};self.settings.lastDismissedNews=settings.lastDismissedNews||null;self.settings.lastSeenAbout=settings.lastSeenAbout||null;self.settings.searchBarLayout=settings.searchBarLayout||null;self.settings.socketVariant=settings.socketVariant||1}$(window).on("focus",self.focus);$(window).on("blur",self.blur);$("#trade .loader").hide();$("#trade .top").fadeIn()});var loadCurrent=function loadCurrent(){self.setCurrentTab(options.tab,true);if(options.league){self.setCurrentLeague(options.league)}// NOTE(rory): Set realm after league so that we can catch invalid leagues or find the first valid one for this realm
self.setCurrentRealm(options.realm);if(options.state){self.doSearch(true,options.live||null)}else if(options.stateFailed||false){self.$root.$refs.toastr.Add({msg:self.translate("Failed to load search state. The search is no longer valid."),type:"error",progressbar:false,timeout:0});self.updateUrl()}else{self.updateUrl()}};var localState=null;if(options.state){localState=options.state}else{localState=lscache.get("state");try{if(localState)localState=_.pick(localState,["realm","league","status"])}catch($e){localState=null}// NOTE(rory): Fix invalid state
lscache.set("state",localState||{})}try{if(localState!==null){this.$store.replaceState({persistent:$.extend(true,{},this.state,localState),transient:this.transient})}}catch($e){console.error($e)}loadCurrent();this.loaded=true;Vue.nextTick(function(){self.$emit("ready")})},methods:{save:function save(dirty){if(!this.loaded)return;if(dirty){this.$store.commit("setSearchDirty")}window.history.pushState(this.state,"",this.stateUrl);lscache.set("state",this.persistent)},load:function load(state){if(state!=null){this.$store.commit("removeCurrentSearch");this.$store.replaceState({persistent:state,transient:this.transient});lscache.set("state",this.persistent)}},clearCachedData:function clearCachedData(){lscache.remove("items");lscache.remove("stats");lscache.remove("data");lscache.remove("filters")},updateUrl:function updateUrl(){window.history.replaceState(this.state,"",this.stateUrl)},setCurrentTab:function setCurrentTab(tab,keep){if(!keep){this.resetSearch();this.$store.commit("showAdvancedSearch",true)}this.$store.commit("setTab",tab);this.save(true)},setCurrentRealm:function setCurrentRealm(realm){this.$store.commit("setRealm",realm);// NOTE(rory): Check we have a valid league, otherwise unset it
if(this.state.league===null){var league=_.findWhere(static_.leagues,{realm:realm});if(league){this.$store.commit("setLeague",league.id)}}else if(_.findWhere(static_.leagues,{id:this.state.league,realm:realm})===undefined){this.$store.commit("setLeague",null)}this.save();this.resetSearch()},setCurrentLeague:function setCurrentLeague(league,setAsSearchTab){this.$store.commit("setLeague",league);if(setAsSearchTab){this.$store.commit("setTab","search")}this.save();this.resetSearch()},setCurrentStatus:function setCurrentStatus(status){this.$store.commit("setStatus",status);this.save(true)},setCurrentItem:function setCurrentItem(item){this.$store.commit("setItem",{name:item?item.name||null:null,type:item?item.type||null:null,disc:item?item.disc||null:null,term:item?item.term||null:null});this.save(true)},setCurrentSearch:function setCurrentSearch(id){this.$store.commit("setSearchActive",{localId:id})},addSearch:function addSearch(live){var id=null;if(live){id=_.uniqueId("live_");this.$store.commit("addSearchQuery",{localId:id,type:this.state.tab,realm:this.state.realm,league:this.state.league,id:live,live:true});if(!!window.Notification&&Notification.permission==="default"){Notification.requestPermission()}}else{id=_.uniqueId("search_");this.$store.commit("addSearchQuery",{localId:id,type:this.state.tab,realm:this.state.realm,league:this.state.league,query:this.query.query,sort:this.state.tab==="search"?{price:"asc"}:{have:"asc"},collapse:this.state.exchange.collapse||null})}this.setCurrentSearch(id)},toggleLive:function toggleLive(){if(!this.transient.search.active)return;if(!this.transient.search.active.id)return;if(this.transient.search.active.live){this.$store.commit("updateSearchQuery",{localId:this.transient.search.active.localId,live:false})}else{this.addSearch(this.transient.search.active.id)}},resetSearch:function resetSearch(){this.$store.commit("removeCurrentSearch")},clearState:function clearState(force){this.resetSearch();this.$store.commit("clearSearchForm",!!force);this.$store.commit("clearExchangeHighlight");this.save(true);if(!force){this.$root.$refs.toastr.Add({msg:this.translate("Search form cleared!"),progressbar:false})}},setItem:function setItem(item){this.setCurrentItem(item)},doSearch:function doSearch(collapseImmediately,liveId){this.resetSearch();if(collapseImmediately){this.$store.commit("showAdvancedSearch",false)}this.addSearch(liveId)},focus:function focus(){document.title=this.ui.title;this.ui.read=true;this.ui.unreadCount=0;this.$store.commit("updateBlurred",false);this.$store.commit("resetActiveUnreadHits");favico.reset()},blur:function blur(){this.ui.read=null;this.ui.unreadCount=0;this.$store.commit("updateBlurred",true)},notify:function notify(count){this.doWoop();if(this.ui.read==true)return;this.ui.unreadCount+=count;if(this.ui.unreadCount>static_.liveResultTotalLimit)this.ui.unreadCount=static_.liveResultTotalLimit;document.title="("+this.ui.unreadCount+") "+this.ui.title;if(this.ui.read===null){// NOTE(rory): First time things here?
}this.ui.read=false;if(!!window.Notification&&Notification.permission==="granted"){var notification=new Notification(this.translate("New live search results!"),{body:this.ui.unreadCount==1?this.translate("1 new item has matched your search."):this.translate("{i} new items have matched your search.",{"{i}":this.ui.unreadCount})});notification.onclick=function(){notification.close();window.focus()}}favico.badge(this.ui.unreadCount)},doWoop:function doWoop(load){if(!this.audio.volume)return;this.audio.playOnLoad=false;if(this.$refs.audio.currentTime>0){this.$refs.audio.pause();this.$refs.audio.currentTime=0}this.$refs.audio.volume=this.audio.volume/100;if(load){this.audio.playOnLoad=true;this.$refs.audio.load()}else{this.$refs.audio.play()}},checkScroll:function checkScroll(){if($(window).scrollTop()<88){$(this.$refs.top).hide();return}var trigger=$(window).scrollTop()+$(window).height();var current=$("#trade .results").length?$("#trade .results").offset().top+88:trigger;if(trigger>current){$(this.$refs.top).fadeIn(300)}else{$(this.$refs.top).fadeOut(300)}},setPropertyFilterGroupDisabled:function setPropertyFilterGroupDisabled(data){this.$store.commit("setFilterGroupDisabled",{type:"filters",group:data.group,disable:data.disable});this.$set(this.settings.hiddenGroups,data.group,data.disable)},setResultLayout:function setResultLayout(layout){this.settings.layout=layout},setLastDismissedNews:function setLastDismissedNews(bannerId){this.settings.lastDismissedNews=bannerId},setLastSeenAbout:function setLastSeenAbout(aboutId){this.settings.lastSeenAbout=aboutId},setSearchBarLayout:function setSearchBarLayout(layout){this.settings.searchBarLayout=layout},setSocketVariant:function setSocketVariant(variant){this.settings.socketVariant=variant}}})})}});
define('trade',["PoE/Trade/App"],function(App){return App});

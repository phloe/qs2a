(function (global, define) {
	'use strict';

	define(function() {
	
		var doc = global.document,
			html = doc.documentElement,
		  	push = Array.prototype.push,
			
			idReg = /^#([^ \.\[]+)$/,
			selectorReg = /^([^#\.\[]+)?(?:#([^\.\[]+))?(?:\.([^#\[]+))?((?:\[[^\]]+\])+)?$/,
			attributeReg = /^([a-zA-Z0-9_-]*[^~|^$*!=])(?:([~|^$*!]?)=['"]?([^'"]*)['"]?)?$/,
			
		  	getIndex = function (array, value) {
				var i = 0,
					l = array.length;
				while (i < l) {
					if (array[i] === value) return i;
					i++;
				}
				return -1;
			},
			
			splitSelector = function (selector) {
				return selectorReg.exec(selector).slice(1);
			},
			
			selCache = {},
			
			nodeCache = {},
			
			attrCache = {},
			
			previous = function (element, selector, first, start) {
		
				var prev = element.previousSibling,
					matched,
					index = 0;
				
				while (prev) {
					if (prev.nodeType === 1) {
						if (!selector || (selector && matchNode(prev, selector))) {
							matched = prev;
							break;
						}
						if (first && index > 0) {
							matched = null;
							break;
						}
						index++;
					}
					prev = prev.previousSibling;
				}
				return matched;
			},
			
			/*
			
				http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
			
			*/
			
			contains = (global.Node && Node.prototype && !Node.prototype.contains) ?
					function(parent, element){ return !!(parent.compareDocumentPosition(element) & 16); } :
		 			function(parent, element){ return parent.contains(element); },
			
			attributeMatch = function (element, attributes) {
				var j = attributes.length,
					attribute,
					isMatch = true,
					name,
					operator,
					value,
					actualValue;
					
				while (j--) {
					attribute = attributes[j];
					attribute = attrCache[attribute] || (attrCache[attribute] = attribute.match(attributeReg).slice(1));
					name = attribute[0];
					operator = attribute[1];
					value = attribute[2];
					actualValue = element.getAttribute(name);
					if (actualValue !== null) {
					 	if (value) {
							switch (operator) {
							
								case "~":
									isMatch = (getIndex(actualValue.split(" "), value) > -1);
									break;
							
								case "|":
									isMatch = (actualValue === value || actualValue.indexOf(value + "-") === 0);
									break;
								
								case "^":
									isMatch = (actualValue.indexOf(value) === 0);
									break;
								
								case "$":
									isMatch = (actualValue.indexOf(value) === actualValue.length - value.length);
									break;
								
								case "*":
									isMatch = (actualValue.indexOf(value) > -1);
									break;
								
								case "!":
									isMatch = (actualValue !== value);
									break;
									
								default:
									isMatch = (actualValue === value);
									break;
									
							}
						}
					}
					else {
						return false;
					}
					if (!isMatch) {
						return false;
					}
				}
				
				return isMatch;
			},
			
			matchNode = function (element, selector) {
				if (typeof selector == "string") {
					selector = nodeCache[selector] || (nodeCache[selector] = splitSelector(selector));
				}
				
				var tag = selector[0],
					id = selector[1],
					className = selector[2],
					attributes = selector[3];
				
				if (tag && (tag != "*" && tag != element.nodeName.toLowerCase())) {
					return false;
				}
				
				if (id && element.getAttribute("id") != id) {
					return false;
				}
				if (className && getIndex(element.className.split(" "), className) == -1) {
					return false;
				}
				
				attributes = (attributes) ? attributes.slice(1, -1).split("][") : [];
			
				if (attributes.length) {
					return attributeMatch(element, attributes);
				}
				
				return true;
			},
			
			get = function (selector, parent) {
				var matches = getAll(selector);
				if (matches.length) {
					return matches[0];
				}
				return null;
			},
			
			getAll = function (selector, parent) {
				selector = selCache[selector] || (selCache[selector] = selector.split(" "));
				
				var last = selector[selector.length - 1];
				last = nodeCache[last] || (nodeCache[last] = splitSelector(last));
				
				var elements = (parent || doc).getElementsByTagName(last[0] || "*");
		
				return matchAll(elements, selector);
			},
			
			matchSingle = function (element, selector) {
				if (typeof selector == "string") {
					selector = selCache[selector] || (selCache[selector] = selector.split(" "));
				}
				var i = selector.length,
					l = i - 1,
					nodeSelector, first;
				while (i--) {
					nodeSelector = selector[i];
					first = false;
					switch (nodeSelector) {
						
						// immediate succeeding sibling
						case "+":
							first = true;
							
						// succeeding siblings
						case "~":
							nodeSelector = selector[--i];
							element = previous(element, nodeSelector, first);
							break;
							
						// children
						case ">":
							nodeSelector = selector[--i];
							element = element.parentNode;
							if (element && !matchNode(element, nodeSelector)) {
								return false;
							}
							break;
						
						// any descendants
						default:
							//element = element.parentNode;
							while (element) {
								if (matchNode(element, nodeSelector)) {
									break;
								}
								else if (i == l) {
									return false;
								}
								else {
									element = element.parentNode;
								}
							}
							break;
					}
					if (!element) {
						return false;
					}
				}
				return true;
			},
			
			matchAll = function (elements, selector) {
				if (typeof selector == "string") {
					selector = selCache[selector] || (selCache[selector] = selector.split(" "));
				}
				var matches = [],
					element,
					i = 0,
					l = elements.length;
				while (i < l) {
					element = elements[i++];
					if (matchSingle(element, selector)) {
						matches.push(element);
					}
				}
				return matches;
			},
			
			shim = function () {
				doc.querySelector = doc.querySelector || get;
				doc.querySelectorAll = doc.querySelectorAll || getAll;
			};
		
		return {
			get: get,
			getAll: getAll,
			shim: shim
		};
	});

}(this, typeof define == 'function' && define.amd ? define : function(factory) { this.qs2a = factory() } ));
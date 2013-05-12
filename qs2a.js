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
				var i = array.length;
				while (i--) if (array[i] === value) break;
				return i;
			},
			
			splitSelector = function (selector) {
				return selectorReg.exec(selector).slice(1);
			},
		/*
			getElements = function (selector, parent) {
				parent = parent || doc;
				
				var elements = [],
					element,
					nodes,
					values,
					i;
					
				if (selector[1]) {
					element = doc.getElementById(selector[1]);
					if (!element) {
						return elements;
					}
					if (!selector[0] || selector[0] == "*" || selector[0] == element.nodeName.toLowerCase()) {
					 	if (parent == doc || contains(parent, element)) {
					 		elements.push(element);
					 	}
					}
				}
				else {
					nodes = parent.getElementsByTagName(selector[0] || "*");
					push.apply(elements, nodes);
				}
				
				values = match(elements, selector);
				i = elements.length;
					
				while (i--) {
					if (!values[i]) {
						elements.splice(i, 1);
					}
				}
				
				return elements;
			},
			*/
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
			get = function (selector, parent) {
				var id = idReg.exec(selector),
					elements,
					element;
				
				parent = parent || doc;
				if (id) {
					element = doc.getElementById(id[1]);
					return (element && (parent === doc || contains(parent, element))) ? element : false;
				}
				elements = getAll(selector, parent);
				return elements.length && elements[0] || false;
			},
			
			getAll = function (selector, parent) {
				var elements,
					nodeSelectors = selector.split(" "),
					length = nodeSelectors.length,
					nodeSelector,
					i = 0, j = 0, l,
					element,
					els,
					related,
					prev,
					first,
					combinators = ">+~";
					
				elements = [parent || doc];
				
				while (i < length) {
					nodeSelector = nodeSelectors[i];
					if (nodeSelector.length > 1 || combinators.indexOf(nodeSelector) === -1) {
						els = [];
						l = elements.length;
						nodeSelector = splitSelector(nodeSelector);
						j = 0;
						while (j < l) {
							element = elements[j++];
							prev = i > 0 && nodeSelectors[i - 1];
							first = false;
							switch (prev) {
							
								// children
								case ">":
									related = traverse(element, nodeSelector, first, "firstChild");
									break;
								
								// immediate succeeding sibling
								case "+":
									first = true;
									
								// succeeding siblings
								case "~":
									related = traverse(element, nodeSelector, first);
									break;
								
								// any descendants
								default:
									related = getElements(nodeSelector, element);
									break;
									
							}
							if (related.length) {
								push.apply(els, related);
							}
						}
						elements = els;
						
						if (i !== 0 && !(i === 1 && prev && prev.match(reg))) {
							j = elements.length;
							while (j--) {
								if (getIndex(elements, elements[j]) < j) {
									elements.splice(j, 1);
								}
							}
						}
							
					}
					i++;
				}
				
				return elements;
			},
			*/
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
					attribute = attributes[j].match(attributeReg);
					attribute.shift();
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
			
			cache = {},
			
			nodeCache = {},
			
			matchNode = function (element, selector) {
				if (typeof selector == "string") {
					selector = nodeCache[selector] || (nodeCache[selector] = splitSelector(selector));
				}
				
				if (selector[0] && (selector[0] != "*" && selector[0] != element.nodeName.toLowerCase())) {
					return false;
				}
				
				if (selector[1] && element.getAttribute("id") != selector[1]) {
					return false;
				}
				if (selector[2] && getIndex(element.className.split(" "), selector[2]) == -1) {
					return false;
				}
				
				var attributes = (selector[3]) ? selector[3].slice(1, -1).split("][") : [];
			
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
				selector = cache[selector] || (cache[selector] = selector.split(" "));
				
				var last = selector[selector.length - 1];
				last = nodeCache[last] || (nodeCache[last] = splitSelector(last));
				
				var elements = (parent || doc).getElementsByTagName(last[0] || "*");
		
				return matchAll(elements, selector);
			},
			
			matchSingle = function (element, selector) {
				if (typeof selector == "string") {
					selector = cache[selector] || (cache[selector] = selector.split(" "));
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
					selector = cache[selector] || (cache[selector] = selector.split(" "));
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
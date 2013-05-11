(function (global, define) {
    'use strict';

    define(function() {
	
		var doc = global.document,
			html = doc.documentElement,
		  	push = Array.prototype.push,
		  
		  	getIndex = function (array, value) {
				var i = array.length;
				while (i--) if (array[i] === value) break;
				return i;
			},
			
			splitSelector = function (selector) {
				return /^([^#\.\[]+)?(?:#([^\.\[]+))?(?:\.([^#\[]+))?((?:\[[^\]]+\])+)?$/.exec(selector).slice(1);
			},
		
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
					 	if (contains(parent, element)) {
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
			
			traverse = function (context, start, element, selector, first) {
		
				var next = element[start || context],
					elements = [],
					index = 0;
				
				while (next) {
					if (next.nodeType === 1) {
						if (!selector || (selector && match(next, selector))) {
							elements.push(next);
						}
						if (first && index === 0) {
							break;
						}
						index++;
					}
					next = next[context];
				}
				return elements;
			},
			
			getSiblings = function (context, element, selector, first) {
				return traverse(context + "Sibling", "", element, selector || null, first || null);
			},
			
			getChildren = function (element, selector, first) {
				return traverse("nextSibling", "firstChild", element, selector || null, first || null);
			},
			
			get = function (selector, parent) {
				var id = /^#([^ .]+)$/.exec(selector),
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
					reg = /^[><\^\+\~\-_]$/;
					
				elements = [parent || doc];
				
				while (i < length) {
					nodeSelector = nodeSelectors[i];
					if (!nodeSelector.match(reg)) {
						els = [];
						l = elements.length;
						nodeSelector = splitSelector(nodeSelector);
						j = 0;
						while (j < l) {
							element = elements[j++];
							prev = i > 0 && nodeSelectors[i - 1] || false;
							first = false;
							switch (prev) {
							
								// children
								case ">":
									related = getChildren(element, nodeSelector, first);
									break;
								
								// immediate succeeding sibling
								case "+":
									first = true;
									
								// succeeding siblings
								case "~":
									related = getSiblings("next", element, nodeSelector, first);
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
			
			/*
			
				http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
			
			*/
			
			contains = (global.Node && Node.prototype && !Node.prototype.contains) ?
					function(parent, element){ return !!(parent.compareDocumentPosition(element) & 16); } :
		 			function(parent, element){ return parent.contains(element); },
			
			attributeMatch = function (elements, attributes) {
				var j = attributes.length,
					attribute,
					matches = [],
					m,
					name,
					i,
					operator,
					value,
					actualValue;
					
				while (j--) {
					attribute = attributes[j].match(/^([a-zA-Z0-9_-]*[^~|^$*!=])(?:([~|^$*!]?)=['"]?([^'"]*)['"]?)?$/);
					attribute.shift();
					name = attribute[0];
					i = elements.length;
					operator = attribute[1];
					value = attribute[2];
					while (i--) {
						actualValue = elements[i].getAttribute(name);
						m = matches[i] !== false;
						if (actualValue !== null && m) {
						 	if (value) {
								switch (operator) {
								
									case "~":
										m = (getIndex(actualValue.split(" "), value) > -1);
										break;
								
									case "|":
										m = (actualValue === value || actualValue.indexOf(value + "-") === 0);
										break;
									
									case "^":
										m = (actualValue.indexOf(value) === 0);
										break;
									
									case "$":
										m = (actualValue.indexOf(value) === actualValue.length - value.length);
										break;
									
									case "*":
										m = (actualValue.indexOf(value) > -1);
										break;
									
									case "!":
										m = (actualValue !== value);
										break;
										
									default:
										m = (actualValue === value);
										break;
										
								}
							}
						}
						else if (m) {
							m = false;
						}
						if (!m) {
							matches[i] = m;
						}
					}
				}
				
				return matches;
			},
			
			match = function (elements, selector) {
				var single = ("nodeType" in elements),
					values = [],
					i,
					attributes;
				
				if (single) {
					if ("nodeType" in selector) {
						return (elements === selector);
					}
					elements = [elements];
				}
				
				if ("charAt" in selector) {
					selector = splitSelector(selector);
				}
				
				attributes = (selector[3]) ? selector[3].slice(1, -1).split("][") : [];
				
				i = elements.length;
				
				if (selector[1]) {
					attributes.unshift("id='" + selector[1] + "'");
				}
				if (selector[2]) {
					attributes.unshift("class~='" + selector[2] + "'");
				}
			
				if (attributes.length) {
					values = attributeMatch(elements, attributes);
				}
				
				while (i--) {
					if (values[i] !== false && (selector[0] && (selector[0] != "*" && selector[0] != elements[i].nodeName.toLowerCase()))) {
						values[i] = false;
					}
					else if (!(i in values)) {
						values[i] = true;
					}
				}
				
				return (single) ? values[0] : values;
			},
			
			shim = function () {
				doc.querySelector = doc.querySelector || get;
				doc.querySelectorAll = doc.querySelectorAll || getAll;
				html.matchesSelector = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector || html.oMatchesSelector || match;
			};
		
		return {
			get: get,
			getAll: getAll,
			match: match,
			shim: shim
		};
	});

}(this, typeof define == 'function' && define.amd ? define : function(factory) { this.qs2a = factory() } ));
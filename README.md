![qs<sup>2</sup>a](http://dev.phloe.net/qs2a/img/logotype.png)
====

A simple selector engine that also provides document.querySelector/document.querySelectorAll shims.

###### Features

* Combinators: `>`, `+`, `~`.
* Attributes including operators: `~=`, `|=`, `^=`, `$=`, `*=`, `!=`.

### get
Finds an element matching the supplied selector.

###### Arguments

* `selector` (String or Element) The CSS selector matching the element you want.
* `parent` (Element) Optional. If not supplied `document` is used.

###### Returns

(Element or null) An Element or null.

### getAll
Returns an array of elements that match the supplied selector.

###### Arguments

* `selector` (String) The CSS selector matching the elements you want.
* `parent` (Element) Optional. If not supplied `document` is used.

###### Returns

(Array) An Array of elements.

### shim
Implements `document.querySelector` and `document.querySelectorAll` if they do not already exist.

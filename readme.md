## Lapiz Core
These files compose the core of the Lapiz project.

To get up to speed on Lapiz, please look through the
[docs](https://github.com/Lapiz-js/docs) and the
[tests](https://github.com/Lapiz-js/core/tree/master/tests)

### TODO: more properties tests
I have one big setProperties test right now. Break that out into many small test
to provide examples of each aspect of setProperties.

### TODO: use getFnName everywhere
to avoid the "bound [name]" problem

### TODO: Lapiz.Class constructor: not new flag

Often, I design applications where the constructor is never meant to be directly
invoked, the Upsert method is

### TODO: Support err args in init.js

Right now, everything needs to be an error string, should also support errors
passed in directly.

### TODO: Reconsider SetOnce as getter

SetOnce is intended to do double duty as a true set once as well as a short hand
for a getter. Perhaps it would be better to introduce another short hand for
getter "+getter". The real benefit being a clearer error.

### TODO: avoid reserved words
typeCheck.arr -> typeCheck.arr

### TODO: Event with binder & weakmaps
Event could be more efficient if it used the binder/weakmap pattern.

### TODO: Simple auto setMany constructor
Often, the constructor only invokes setMany on the args. we could do this from
the properties with another prefix:

cls.properties({
  "0 *id": "int",
  "1 name": "string",
  "2 role": "string",
  "3 active": "bool"
});
... maybe, I got to think about that.

### TODO: Key based sets
I keep running into this pattern where I have
Parent->child
and on parent I defin

this.children = childset.all.Filter("parent", this.id);

Which is inefficient because now when a child is added, it is tested against
each parent.

Better would be
childset.parents = childset.all.KeyGroup("parent");
this.children = childset.parents(this.id);

where the KeyGroup would be a map of lists.

this will also require a "Group" type that just takes an accessor and maintains
a set of keys. Which I could replace much of the filter logic.
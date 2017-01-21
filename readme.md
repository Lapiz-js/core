## Lapiz Core
These files compose the core of the Lapiz project.

To get up to speed on Lapiz, please look through the
[docs](https://github.com/Lapiz-js/docs) and the
[tests](https://github.com/Lapiz-js/core/tree/master/tests)

### Namespace and Objects rebuild
// http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible

Moving to late-bound-prototype models. Starting with Namespace then doing objects. The construction is cleaner and the operation is more efficient.

```js
var Obj = Lapiz.Class(function Obj(){
    this.constructor = function(){...}
    this.properties(...)
    this.meth(...)...
});
```

Constructor is easy, if it's set, run the constructor after initialization. Public methods are also easy - they're lazy bound to the prototype. How do we do private methods?

How do properties work? Actually, this may not be too bad
```js
var Person = Lapiz.Class(function(){
    this.properties({
        "*id":  "int"
        "name": "string",
        "age":  "int",
        "role": "string"
    });

    this.constructor = function(id, name, age, role){
        this.setMany(Lapiz.argDict());
    };

    // note that methods are called from public but invoked on private
    this.meth(function sayHi(){
        console.log("Hi, "+this.pub.name);
        //this would also work
        console.log("Hi, "+this.attr.name);
    });
});

var adam = Person(12, "Adam", 32, "admin")
```

Ok, let's break down "name". The first time I envoke
console.log(adam.name) // getter on name

it call the property adam.__proto__.name. That sets the property adam.name and
returns it. Any further invocations of adam.name will be on the object directly,
because calls to the proto are shadowed.


-- object properties --
Moving properties into collectionHelpers makes it easy to attach properties to
anything, but I lost the setter interface.

Todo
- New Class event
- New Instance event
- Update event
- SetMany: Old object has this, need this for new one, should only fire once.

### TODO: more properties tests
I have one big setProperties test right now. Break that out into many small test
to provide examples of each aspect of setProperties.

### TODO: use getFnName everywhere
to avoid the "bound [name]" problem

### TODO: move Map stuff to set
so $L.Map.meth becomes $L.set.meth

### TODO: Lapiz.Class constructor: not new flag
Often, I design applications where the constructor is never meant to be directly invoked, the Upsert method is

### TODO: Support err args in init.js
Right now, everything needs to be an error string, should also support errors passed in directly.

### TODO: Reconsider SetOnce as getter
SetOnce is intended to do double duty as a true set once as well as a short hand
for a getter. Perhaps it would be better to introduce another short hand for
getter "+getter". The real benefit being a clearer error.

### TODO: avoid reserved words
throw -> toss
delete -> remove
typeCheck.string -> typeCheck.str
typeCheck.array -> typeCheck.arr

### TODO: Event with binder & weakmaps
Event could be more efficient if it used the binder/weakmap pattern.
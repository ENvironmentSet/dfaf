# fauto

fauto is a javascript framework.

* Less learning curve, but more powerful: Reactive programming without Observable.
* Easy to debug: Every relation between logic are explicit.
* Flexible: You can add middleware to do something with state graph(e.g: middleware for AOP, for higher abstraction, for side effect).
* Easy to understand: no more hierarchical structure, horizontal only.
* Reusable logic: every logic are pure and split by their own role.

## API

* Automata(startState, ...middlewares)
  + add(stateOrLink)
  + run()
* State(name, logic\[, externalLinks\])
* Link(source, dest, matcher)
* type Matcher
  + TypeMatcher(predicate)
  + ValueMatcher(predicate)
  + MetaMatcher(predicate)
* interface externalLink
* type middleware
+ Action
  * Transition

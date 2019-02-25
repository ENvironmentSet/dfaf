import warning from './warning';

export interface Action<T extends string = string, P = any, M extends Object = Object> {
  readonly type: T;
  readonly payload?: P;
  meta?: M;
}

export interface Transition<P, M extends Object = Object> extends Action<'transition', P, M> {
  readonly payload: P;
}

export type matcher = (input: any) => boolean;

export interface externalLink<N extends string = string> {
  readonly dest: N;
  readonly matcher: matcher;
}

export type Logic<I, R extends Action = Action> = (input: I) => R;

export class State<I = any, R extends Action = Action> {
  public constructor(
    public name: string,
    private logic: Logic<I, R>,
    private externalLinks: Set<externalLink> = new Set(),
  ) {}

  public get externalLinkList(): ReadonlyArray<externalLink> {
    return [...this.externalLinks];
  }

  public addExternalLink(externalLink: externalLink): void {
    if (this.externalLinks.has(externalLink)) warning(`Adding duplicated external link to state ${this} is ignored.`);
    this.externalLinks.add(externalLink);
  }

  public calculate(input: I): R {
    //@TODO Add memoization here.
    return this.logic(input);
  }

  public toString(): string {
    return this.name;
  }
}

export class Link implements externalLink {
  public constructor(public readonly source: string, public readonly dest: string, public readonly matcher: matcher) {}
}

type initializedMiddleware = (returned: Action) => State;
export type middleware = (next: initializedMiddleware | Automata['resolver'], getCurrentState?: () => State) => initializedMiddleware;

//@TODO: use lazy evaluation for states and links rather than eager one.
export default class Automata {
  private currentState: State;
  private readonly states: Map<State['name'], State>;
  private readonly resolver: (returned: Action) => State;

  public constructor(startState: State, middlewares: Array<middleware>) {
    const getCurrentState = () => this.currentState;
    const resolver: Automata['resolver'] = ({ type, payload }: Action) => {
      if (type === 'transition') {
        const matchedLink: externalLink | undefined = this.currentState.externalLinkList.find(({matcher}) => matcher(payload));

        if (typeof matchedLink === 'object') {
          const nextStateIdentifier: string = matchedLink.dest;
          const nextState: State | undefined = this.states.get(nextStateIdentifier);

          if (nextState instanceof State) {
            this.currentState = nextState;
            setTimeout(this.next.bind(this), 0, payload);
          } else {
            warning(`Can't find State ${nextStateIdentifier}`);
          }
        } else {
          warning(`Can't find any matched external link from State ${this.currentState}`);
        }
      } else {
        warning(`Unacceptable action ${type} is delivered to resolver.`);
      }

      return this.currentState;
    };

    this.currentState = startState;
    this.states = new Map([[startState.name, startState]]);
    this.resolver = middlewares.reduce((next, middleware) => middleware(next, getCurrentState), resolver);
  }

  public add(stateOrLink: State | Link): void {
    if (stateOrLink instanceof State) {
      if (this.states.has(stateOrLink.name)) warning('Adding duplicated State is ignored.');
      this.states.set(stateOrLink.name, stateOrLink);
    } else {
      const foundState = this.states.get(stateOrLink.source);

      if (foundState instanceof State) {
        foundState.addExternalLink(stateOrLink);
      } else {
        warning(`
          Can't find State ${stateOrLink.source}.
          if you're adding link before adding state, try to move code which adds link to state after adding state.
          anyway, this problem will be fixed in next release via lazy evaluation.
        `);
      }
    }
  }

  public next(input?: any): void {
    this.resolver(this.currentState.calculate(input));
  }
}

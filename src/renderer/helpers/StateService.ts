import { Lecture } from '../data/Lecture';

export enum AppState {
    OVERVIEW_LECTURE, CREATE_LECTURE, CHOOSE_LECTURE, NONE
}

export type StateChangeListener = (oldState: AppState, newState: AppState, hasLastState: boolean, lecture: Lecture | undefined) => void;
type StateHistory = { state: AppState, lecture: Lecture | undefined };

export default abstract class StateService {
    private static currentState: StateHistory = { state: AppState.NONE, lecture: undefined };
    private static listeners: StateChangeListener[] = [];
    private static lastStates: StateHistory[] = [];

    /**
     * Sets the state of the app to the given state.
     *
     * @param newState New state
     * @param lecture (optional) Lecture to pass down to the listeners.
     * @param addToHistory (optional, default: _true_) Should the new state be added to the history?
     */
    public static setState(newState: AppState, lecture?: Lecture, addToHistory: boolean = true) {
        // addToHistory is mainly used to ignore the changes made by internal functions.
        if (newState == this.currentState.state) {
            return;
        }

        let oldState = { state: this.currentState.state, lecture: this.currentState.lecture };
        this.currentState.state = newState;
        this.currentState.lecture = lecture;

        if (addToHistory && oldState.state !== AppState.NONE) {
            this.lastStates.push({ state: oldState.state, lecture: lecture });
        }

        // Call all listeners on StateChange.
        this.listeners.forEach((listener) => listener(oldState.state, newState, this.hasLastState(), lecture));
    }

    public static getState(): AppState {
        return this.currentState.state;
    }

    public static goBack() {
        let lastHistory: StateHistory | undefined = this.lastStates.pop();

        if (lastHistory !== undefined) {
            this.setState(lastHistory.state, lastHistory.lecture, false);
        }
    }

    public static hasLastState(): boolean {
        return this.lastStates.length > 0;
    }

    public static preventGoingBack() {
        this.lastStates = [];

        // TODO: Wenn die AppBar selbst manipuliert werden kann, dann die Listener-Calls entfernen!
        this.listeners.forEach((listener) => listener(this.currentState.state, this.currentState.state, false, this.currentState.lecture));
    }

    /**
     * Registers a listener which gets called if the state changes.
     * @param listener Listener to register
     */
    public static registerListener(listener: StateChangeListener) {
        if (this.listeners.indexOf(listener) === -1) {
            this.listeners.push(listener);
        }
    }
}
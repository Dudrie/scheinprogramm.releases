export enum AppState {
    OVERVIEW_LECTURE, CREATE_LECTURE, CHOOSE_LECTURE, NONE
}

export type StateChangeListener = (oldState: AppState, newState: AppState, hasLastState: boolean) => void;

export default abstract class StateService {
    private static currentState: AppState = AppState.NONE;
    private static listeners: StateChangeListener[] = [];
    private static lastStates: AppState[] = [];

    /**
     * Sets the state of the app to the given state. Will only call listeners if the new state is not the same as the old one.
     * @param newState New state
     */
    public static setState(newState: AppState, addToHistory: boolean = true) {
        if (newState === this.currentState) {
            return;
        }

        let oldState = this.currentState;
        this.currentState = newState;

        if (addToHistory && oldState !== AppState.NONE) {
            this.lastStates.push(oldState);
        }

        // Call all listeners on StateChange.
        this.listeners.forEach((listener) => listener(oldState, newState, this.hasLastState()));
    }

    public static getState(): AppState {
        return this.currentState;
    }

    public static goBack() {
        let lastState: AppState | undefined = this.lastStates.pop();

        if (lastState !== undefined) {
            this.setState(lastState, false);
        }
    }

    public static hasLastState(): boolean {
        return this.lastStates.length > 0;
    }

    public static preventGoingBack() {
        this.lastStates = [];

        this.listeners.forEach((listener) => listener(this.currentState, this.currentState, false));
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
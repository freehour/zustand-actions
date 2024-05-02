/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import type { ActionKeys, Actions, State } from 'zustand-actions';
import { withActions } from 'zustand-actions';

export interface Counter {
    count: number;
    // define actions at the top level
    increment: () => void;
    decrement: () => void;
}

type CounterActionKeys = ActionKeys<Counter>; // 'increment' | 'decrement'
type CounterActions = Actions<Counter>; // { increment: () => void; decrement: () => void; }
type CounterState = State<Counter>; // { count: number }

export const useCounter = create<Counter>()(
    withActions(set => ({
        count: 0,
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
    })),
);

const { increment } = useCounter.getActions(); // CounterActions
const { count } = useCounter.getState(); // CounterState

useCounter(state => state.count); // subscribe to CounterState only
useCounter.setState({ count: 1 }); // change CounterState only

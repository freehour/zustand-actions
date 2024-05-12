/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';


export interface Counter {
    count: number;
    actions: {
        increment: () => void;
        decrement: () => void;
    };
}

export const useCounter = create<Counter>()(set => ({
    count: 0,
    actions: {
        increment: () => set(state => ({ count: state.count + 1 })),
        decrement: () => set(state => ({ count: state.count - 1 })),
    },
}));

// custom hook to provide the actions
export const useCounterActions = useCounter(state => state.actions);

// this should never trigger a re-render (assuming 'actions' doesn't change), no selector needed
const { increment } = useCounterActions;

// possible to change actions
useCounter.setState(state => ({ actions: { ...state.actions, increment: () => console.log('increment') } }));

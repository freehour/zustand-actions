/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Mutate, StoreApi, UseBoundStore } from 'zustand';
import { create, createStore, type StateCreator } from 'zustand';
import { withActions } from 'zustand-actions';
import { immer } from 'zustand/middleware/immer';

export interface GenericState<T> {
    name: string;
    value: T;
}

export interface GenericActions<T> {
    setValue: (value: T) => void;
}

export type Generic<T> = GenericState<T> & GenericActions<T>;

export type GenericStore<T> = Mutate<
    StoreApi<Generic<T>>,
    [['zustand-actions', keyof GenericActions<T>], ['zustand/immer', never]]
>;

export function createGeneric<T>(
    name: string,
    initialValue: T,
): StateCreator<Generic<T>, [], [['zustand-actions', keyof GenericActions<T>], ['zustand/immer', never]]> {
    return withActions(
        immer(set => ({
            name,
            value: initialValue,
            setValue: value => set({ value }),
        })),
    );
}

export function createGenericStore<T>(name: string, initialValue: T): GenericStore<T> {
    return createStore<Generic<T>>()(createGeneric(name, initialValue));
}

export function useGeneric<T>(name: string, initialValue: T): UseBoundStore<GenericStore<T>> {
    return create<Generic<T>>()(createGeneric(name, initialValue));
}
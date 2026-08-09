import { Ease, EaseFunction } from '../easing/Ease';
/**
 * Default interpolate function that throws an error indicating it has not been set.
 * @throws {EmitterError} Indicates that the interpolate method has not been set.
 */
export declare function defaultInterpolateFunction<ValueType>(): ValueType;
/**
 * Type defining a step in a list.
 */
export type ListStep<ValueType> = {
    value: ValueType;
    time: number;
};
/**
 * Type defining the data used to initialize a list.
 */
export type ListData<ValueType> = {
    list: ListStep<ValueType>[];
    ease?: Ease;
    isStepped?: boolean;
};
/**
 * Type defining a node in a linked list.
 */
export type ListNode<ValueType> = {
    value: ValueType;
    time: number;
    next: ListNode<ValueType> | null;
};
/**
 * Abstract base class for lists used in particle behaviors.
 * @template OutputValue Type of value produced by the list.
 * @template InputValue Type of value used to initialize the list.
 * @template ListDataType Type of data contained within the list nodes.
 * @group Data/List
 */
export declare abstract class List<OutputValue, InputValue = OutputValue, ListDataType = OutputValue> {
    protected _first: ListNode<ListDataType> | null;
    protected _list: ListStep<InputValue>[];
    protected _easeFunction: EaseFunction | null;
    protected _isStepped: boolean;
    /**
     * First node in the list.
     * @throws {EmitterError} If the list has not been initialized.
     */
    get first(): ListNode<ListDataType>;
    /**
     * Gets the list steps.
     */
    get list(): ListStep<InputValue>[];
    /**
     * Indicates whether the list has been initialized.
     */
    get isInitialized(): boolean;
    /**
     * Indicates whether the list uses stepped interpolation.
     */
    get isStepped(): boolean;
    set isStepped(value: boolean);
    /**
     * Function to interpolate values from the list.
     * @throws {EmitterError} If the interpolate method has not been set.
     * @returns Interpolated value.
     */
    interpolate: (time: number) => OutputValue;
    /**
     * Initializes the list from data.
     * @param data Data to initialize the list with.
     */
    initialize(data: ListData<InputValue>): void;
    /**
     * Resets the list to an uninitialized state.
     */
    reset(): void;
    /**
     * Initializes the list from data.
     * @param data Data to initialize the list with.
     */
    protected abstract initializeList(data: ListData<InputValue>): void;
}
//# sourceMappingURL=List.d.ts.map
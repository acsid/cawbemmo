import { RGBAColor } from '../../util';
import { List, ListData } from './List';
/**
 * Implementation of `List` specifically for managing colors.
 * @see {@link List} for the base `List` implementation.
 * @group Data/List/
 */
export declare class ColorList extends List<number, string, RGBAColor> {
    /**
     * @inheritdoc
     */
    initialize(data: ListData<string>): void;
    /**
     * @inheritdoc
     */
    protected initializeList(data: ListData<string>): void;
}
//# sourceMappingURL=ColorList.d.ts.map
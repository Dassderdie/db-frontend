import type { ApiConversation } from '@cache-server/api/api-conversation';
import { isEqual } from 'lodash-es';
import type { OptionalOptionsMessage } from './optional-options-message';
import type { SubscriptionItemData } from './subscription-item';
import { SubscriptionItem } from './subscription-item';

export class SubscriptionsStorage {
    private readonly storage: {
        [key: string]: SubscriptionItem<any>[];
    } = {};

    /**
     * @returns the saved item if available, else undefined
     * properties of the item can be changed directly, because the return value is by reference
     */
    public getItem<
        Message extends ApiConversation['subscribable']['message'],
        Data extends SubscriptionItemData
    >(message: Message): SubscriptionItem<Message, Data> | undefined {
        const items = this.getItems<Message, Data>(message);
        switch (items.length) {
            case 0:
                return undefined;
            case 1:
                return items[0];
            default:
                errors.error({
                    message: 'More than 1 item found',
                    logValues: { message, items },
                });
                return items[0];
        }
    }

    public getItems<
        Message extends ApiConversation['subscribable']['message'],
        Data extends SubscriptionItemData
    >(
        message: OptionalOptionsMessage<Message>
    ): SubscriptionItem<Message, Data>[] {
        const typeKey = this.generateTypeKey(message as Message);
        const items = this.storage[typeKey];
        if (!items) {
            return [];
        }
        return items.filter((item) =>
            // Only the properties of message.action.options should be different
            this.objectIsSubsetOf(message, item.message)
        ) as unknown as SubscriptionItem<Message, Data>[];
    }

    public deleteItem(message: ApiConversation['subscribable']['message']) {
        const typeKey = this.generateTypeKey(message);
        const items = this.storage[typeKey];
        if (!items?.length) {
            errors.error({
                message: "An item that doesn't exist cannot get deleted.",
                logValues: { message },
            });
            return;
        }
        const matchingActionIndex = items.findIndex((item) =>
            // Only the properties of message.action.options should be different
            isEqual(item.message, message)
        );
        const subscriptionItem = items[matchingActionIndex];
        if (matchingActionIndex >= 0 && subscriptionItem) {
            SubscriptionItem.destroy(subscriptionItem);
            items.splice(matchingActionIndex, 1);
            if (items.length) {
                this.storage[typeKey] = items;
            } else {
                delete this.storage[typeKey];
            }
        }
    }

    public addItem(
        newItem: SubscriptionItem<
            // TODO: any instead of default because of https://github.com/microsoft/TypeScript/issues/27808
            any,
            any
        >
    ) {
        const typeKey = this.generateTypeKey(newItem.message);
        let items = this.storage[typeKey];
        if (!items) {
            // this action hasn't been saved with any options yet
            items = [newItem];
        } else {
            // Only the properties of message.action.options should be different
            if (items.some((item) => isEqual(newItem.message, item.message))) {
                errors.error({
                    message: 'There is already an item for this message saved!',
                    logValues: { newItem, items },
                });
                return;
            }
            items.push(newItem);
        }
        // the value has been updated in the (actionStorage-)items
        this.storage[typeKey] = items;
    }

    public forAllItems<
        Message extends ApiConversation['subscribable']['message']
    >(
        handler: (item: SubscriptionItem) => void,
        filter?: OptionalOptionsMessage<Message>
    ) {
        const keys = filter
            ? [this.generateTypeKey(filter as Message)]
            : Object.keys(this.storage);
        for (const key of keys) {
            const items = this.storage[key];
            if (!items) {
                // there are no items matching the filter in here
                continue;
            }
            for (const item of items) {
                if (filter && !this.objectIsSubsetOf(filter, item.message)) {
                    continue;
                }
                handler(item);
            }
        }
    }

    private generateTypeKey(
        message: ApiConversation['subscribable']['message']
    ) {
        return `${message.type},${message.action.kind}`;
    }

    /**
     * @param v1
     * @param v2
     * @returns wether each property of v1 is equal to the appropriate property in v2 (recursively)
     */
    private objectIsSubsetOf(v1: any, v2: any) {
        if (typeof v1 !== 'object' && typeof v2 !== 'object') {
            return v1 === v2;
        }
        for (const key of Object.keys(v1)) {
            if (!this.objectIsSubsetOf(v1[key], v2[key])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Delete all items in the cache, e.g. to make sure no data of the previously logged-in user is still there
     */
    public deleteAllItems() {
        for (const [key, subscriptionItems] of Object.entries(this.storage)) {
            for (const item of subscriptionItems)
                SubscriptionItem.destroy(item);
            delete this.storage[key];
        }
    }
}

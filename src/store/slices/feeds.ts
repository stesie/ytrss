import { createAction, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Semaphore } from 'async-mutex';

export type FeedSliceState = {
    feeds: ReadonlyArray<Feed>;
    selectedFeedId: Feed['id'];
};

export interface Feed {
    id: string;
    url: string;
    items: ReadonlyArray<FeedItem>;
    link?: string;
    title?: string;
}

export interface FeedItem {
    id: string;
    title: string;
    url: string;
    published?: string;
    lastModified?: string;
    isRead?: boolean;
}

export const fetchAllFeedsCommand = createAction('feeds/fetchAllFeedsCommand');

export const addNewFeedCommand = createAction<string>('feeds/addNewFeedCommand');

export const deleteSelectedFeedCommand = createAction('feeds/deleteSelectedFeedCommand');

export const markSelectedFeedAsReadCommand = createAction('feeds/markSelectedFeedAsReadCommand');

export const importFeedsCommand = createAction<ReadonlyArray<Feed>>('feeds/importFeedsCommand');

const initialState: FeedSliceState = {
    feeds: [
        {
            // sample Atom Feed
            id: 'https://ourworldindata.org/atom.xml',
            url: 'https://ourworldindata.org/atom.xml',
            items: [],
        },

        {
            // sample RSS 1.0 / RDF Feed
            // https://www.w3schools.com/xml/xml_rdf.asp
            id: 'https://www.dragonball-multiverse.com/flux.rss.php?lang=en',
            url: 'https://www.dragonball-multiverse.com/flux.rss.php?lang=en',
            items: [],
        },

        {
            // sample RSS 2.0 Feed
            id: 'https://www.tagesschau.de/xml/rss2/',
            url: 'https://www.tagesschau.de/xml/rss2/',
            items: [],
        },
        {
            // sample Youtube Feed (Atom)
            id: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA',
            url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC5NOEUbkLheQcaaRldYW5GA',
            items: [],
        },
        {
            id: 'https://stackoverflow.blog/feed/',
            url: 'https://stackoverflow.blog/feed/',
            items: [],
        },
        {
            id: 'https://www.quarks.de/feed/',
            url: 'https://www.quarks.de/feed/',
            items: [],
        },
    ],
    selectedFeedId: '',
};

export const fetchFeedByUrl = createAsyncThunk<string, string>('feeds/fetchByUrl', async (url) => {
    return await fetchFeed(url);
});

export const addNewFeedByUrl = createAsyncThunk<string, string>('feeds/addNewFeedByUrl', async (url) => {
    return await fetchFeed(url);
});

// TODO make this configurable
const fetchFeedSemaphore = new Semaphore(3);

const fetchFeed = async (url: string) => {
    return new Promise<string>((resolve) => {
        fetchFeedSemaphore.runExclusive(async () => {
            const response = await fetch(url);
            resolve(await response.text());
        });
    });
};

export const selectTotalUnreadItems = (state: FeedSliceState) =>
    state.feeds
        .map((feed) => feed.items.filter((i) => !i.isRead).length)
        .reduce((totalUnreadReadItems, unReadItemsNexFeed) => totalUnreadReadItems + unReadItemsNexFeed, 0);

const feedsSlice = createSlice({
    name: 'feeds',
    initialState,
    reducers: {
        extensionStateLoaded(_state, action: PayloadAction<FeedSliceState>) {
            return { ...action.payload };
        },
        markAllAsRead(state) {
            return {
                ...state,
                feeds: state.feeds.map((feed) => markAllItemsOfFeedRead(feed)),
            };
        },
        addFeed(state, action: PayloadAction<Feed>) {
            return {
                ...state,
                feeds: [...state.feeds, action.payload],
            };
        },
        selectFeed(state, action: PayloadAction<string>) {
            state.selectedFeedId = action.payload;
        },
        updateFeed(state, action: PayloadAction<Feed>) {
            return {
                ...state,
                feeds: [...updateFeed(state.feeds, action.payload)],
            };
        },
        markFeedAsRead(state, action: PayloadAction<string>) {
            return {
                ...state,
                feeds: [...markFeedAsRead(state.feeds, action.payload)],
            };
        },
        deleteFeed(state, action: PayloadAction<string>) {
            // index of the feed that gets deleted
            const selectedIndex = state.feeds.findIndex((f) => f.id === action.payload);

            // delete
            state.feeds = state.feeds.filter((f) => f.id !== action.payload);

            if (action.payload === state.selectedFeedId) {
                // if possible select the the next feed
                // TODO also set focus
                state.selectedFeedId =
                    state.feeds.length === 0
                        ? ''
                        : state.feeds.length > selectedIndex
                        ? state.feeds[selectedIndex].id
                        : state.feeds[selectedIndex - 1].id;
            }
        },
        itemRead(state, action: PayloadAction<{ feedId: string; itemId: string }>) {
            return {
                ...state,
                feeds: [...markItemAsRead(state.feeds, action.payload.feedId, action.payload.itemId)],
            };
        },
    },
});

const updateFeed = (feeds: ReadonlyArray<Feed>, updatedFeed: Feed): ReadonlyArray<Feed> =>
    feeds.map((feed) => {
        if (feed.url !== updatedFeed.url) {
            return feed;
        }

        return {
            ...mergeFeed(feed, updatedFeed),
        };
    });

const mergeFeed = (previous: Feed, updatedFeed: Feed): Feed => {
    const newItems = updatedFeed.items.filter((item) => {
        if (previous.items.some((x) => x.id === item.id)) {
            return;
        } else {
            return item;
        }
    });

    return {
        id: updatedFeed.id,
        url: updatedFeed.url,
        title: previous.title !== undefined ? previous.title : updatedFeed.title,
        link: updatedFeed.link,
        items: [...previous.items, ...newItems],
    };
};

const markItemAsRead = (feeds: ReadonlyArray<Feed>, feedId: string, itemId: string) =>
    feeds.map((feed) => {
        if (feed.id !== feedId) {
            return feed;
        }

        return {
            ...feed,
            items: feed.items.map((item) => (item.id !== itemId ? item : { ...item, isRead: true })),
        };
    });

const markFeedAsRead = (feeds: ReadonlyArray<Feed>, readFeedId: string): ReadonlyArray<Feed> =>
    feeds.map((feed) => {
        if (feed.id !== readFeedId) {
            return feed;
        }

        return markAllItemsOfFeedRead(feed);
    });

const markAllItemsOfFeedRead = (feed: Feed): Feed => {
    return {
        ...feed,
        items: feed.items.map((item) => ({ ...item, isRead: true })),
    };
};

export default feedsSlice;

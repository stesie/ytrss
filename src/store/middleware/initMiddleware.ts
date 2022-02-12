import { AnyAction, Middleware } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { loadState, saveState } from '../../services/persistence';
import { initCommand } from '../actions';
import feedsSlice, { fetchFeedByUrl } from '../slices/feeds';
import store, { RootState } from '../store';

const feedsAutoUpdateKey = 'feedsAutoUpdate';

export const initMiddleware: Middleware<
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
    RootState,
    ThunkDispatch<RootState, undefined, AnyAction>
> = (middlewareApi) => (next) => async (action) => {
    if (initCommand.match(action)) {
        // initial load from local storage
        const loadedState = await loadState();

        if (loadedState !== undefined) {
            middlewareApi.dispatch(feedsSlice.actions.extensionStateLoaded(loadedState.feeds));
        }

        // setup persistence
        store.subscribe(async () => {
            await saveState(store.getState());
        });

        // setup cyclic update of all feeds
        const state = middlewareApi.getState();
        browser.alarms.create(feedsAutoUpdateKey, { periodInMinutes: state.options.feedUpdatePeriodInMinutes });
        browser.alarms.onAlarm.addListener(() =>
            state.feeds.feeds.forEach((feed) => {
                middlewareApi.dispatch(fetchFeedByUrl(feed.url));
            }),
        );
    }

    if (feedsSlice.actions.extensionStateLoaded.match(action)) {
        // update feeds when extension is loaded
        action.payload.feeds.forEach((feed) => {
            middlewareApi.dispatch(fetchFeedByUrl(feed.url));
        });
    }

    return next(action);
};
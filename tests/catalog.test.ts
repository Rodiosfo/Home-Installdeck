import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/steam';
import { SHORTCUT } from '../src/model';

test('new shortcuts are collected beyond the general library and deduplicated', () => {
  const apps = new Map([[1, { appid: 1, app_type: 1 }],
    [200, { appid: 200, app_type: SHORTCUT }],
    [300, { appid: 300, app_type: SHORTCUT }],
    [400, { appid: 400, app_type: 1 }]]);
  const shortcuts = new Set<any>();
  const host = {
    collectionStore: {
      allAppsCollection: { apps: [1] },
      allShortcutsCollection: { allApps: shortcuts },
      appTypeCollectionMap: new Map(),
    },
    appStore: { GetAppOverviewByAppID: (id: number) => apps.get(id), m_mapApps: new Map() },
  };
  assert.deepEqual(catalog([], host).map(g => g.appid), [1]);
  shortcuts.add('200');
  host.appStore.m_mapApps = apps;
  host.collectionStore.appTypeCollectionMap.set('type-shortcuts', { apps: [200, 999] });
  assert.deepEqual(catalog([], host).map(g => g.appid), [1, 200, 300]);
});

test('lazy and stale entries do not hide the available shortcuts', () => {
  const host = {
    collectionStore: {
      get allAppsCollection() { throw new Error('loading'); },
      nonSteamCollection: { apps: [10, 20, 30, null, -1, 'bad'] },
    },
    appStore: { GetAppOverviewByAppID: (id: number) => {
      if (id === 10) throw new Error('removed');
      if (id === 20) return undefined;
      return { appid: id, app_type: SHORTCUT };
    } },
  };
  assert.deepEqual(catalog([], host).map(g => g.appid), [30]);
});

test('missing library reports an error; a loaded empty library is valid', () => {
  assert.throws(() => catalog([], {}));
  const appStore = { GetAppOverviewByAppID: () => undefined };
  assert.throws(() => catalog([], { appStore }));
  assert.deepEqual(catalog([], { appStore, collectionStore: { allAppsCollection: { apps: [] } } }), []);
});

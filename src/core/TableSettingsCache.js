export class TableSettingsCache {

    constructor(initialSettings) {
        this.initialSettings = Object.assign({}, initialSettings);
        this.settings = Object.assign({}, initialSettings);
    }

    reset() {
        this.settings = Object.assign({}, this.initialSettings);
    }

    update(filter, sorting) {
        this.settings.filter = Object.assign({}, filter);
        this.settings.sorting = Object.assign({}, sorting);
    }

    currentSettings() {
        return this.settings;
    }

}

export class TableSettingsCacheFactory {

    constructor() {
        this.settingsCaches = {};
    }

    getSettingsCache(name, initialSettings) {
        if(!this.settingsCaches[name]) {
            this.settingsCaches[name] = new TableSettingsCache(initialSettings);
        }

        return this.settingsCaches[name];
    }

}
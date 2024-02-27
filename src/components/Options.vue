<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card-deck">
                    <div class="card">
                        <div class="card-header">{{ l('optionsDisplayPanelTitle') }}</div>
                        <div class="card-body">
                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input" id="optionsAlwaysShowBar" v-model="syncOptions.alwaysShow">
                                <label class="form-check-label" for="optionsAlwaysShowBar">{{ l('optionsAlwaysShowBar') }}</label>
                            </div>

                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input" id="optionsShowDownloadInfo" v-model="syncOptions.showInfoText">
                                <label class="form-check-label" for="optionsShowDownloadInfo">{{ l('optionsShowDownloadInfo') }}</label>
                            </div>

                            <div class="mt-1 row row-cols-auto align-items-end">
                                <div class="col-auto">
                                    <label for="baseThemeSelector">{{ l('optionsTheme') }}</label>
                                    <select id="baseThemeSelector" class="form-select me-2 ml-2" v-model="syncOptions.theme">
                                        <option v-for="theme in themeList" :key="theme.id" :value="theme.id">{{ theme.name }}</option>
                                    </select>
                                </div>
                                <div class="col-auto">
                                    <button class="btn btn-sm btn-primary" @click="customizeTheme"> {{ l('optionsCustomizeTheme') }}</button>
                                </div>
                            </div>

                            <div class="mt-3" v-if="currentTheme.custom">
                                <h5>{{ l('customizeThemePanelTitle') }}</h5>
                                <div class="form-group form-inline">
                                    <label class="me-2">{{ l('customizeThemeName') }}:</label>
                                    <input type="text" class="form-control" v-model="currentTheme.name">
                                </div>
                                <div v-for="(value, color) in currentTheme.colors">
                                    <label>{{ colorLabels[color] }}:</label>
                                    <input type="color" v-model="currentTheme.colors[color]" style="width: 60px">
                                </div>
                                <button class="btn btn-sm btn-danger mt-2" @click="deleteTheme(currentTheme)">
                                    {{ l('customizeThemeDeleteTheme') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">{{ l('optionsAutoHidePanelTitle') }}</div>
                        <div class="card-body">
                            <div class="form-check mb-2">
                                <input type="checkbox" class="form-check-input" id="optionsAutoHideCompleted" v-model="syncOptions.autohideEnable">
                                <label class="form-check-label" for="optionsAutoHideCompleted">{{ l('optionsAutoHideCompleted') }}</label>
                            </div>

                            <div v-if="syncOptions.autohideEnable">
                                <div class="row row-cols-auto g-2 align-items-center">
                                    <div class="col-auto">{{ l('optionsAutoHideSecondsInputBeforeText') }}</div>
                                    <div class="col-auto">
                                        <input type="number"
                                               min="1"
                                               max="600"
                                               class="form-control me-2 ml-2 auto-hide-duration"
                                               v-model="syncOptions.autohideDuration"
                                        >
                                    </div>
                                    <div class="col-auto">{{ l('optionsAutoHideSecondsInputAfterText') }}</div>
                                </div>


                                <h5 class="mt-3">{{ l('optionsAutoHideFileTypes') }} <small class="text-muted">{{ l('optionsClickToRemove') }}</small></h5>
                                <p class="text-muted">{{ l('optionsAutoHideOptional') }}</p>
                                <p>
                                    <span v-for="type in syncOptions.autohideFileTypes" class="badge bg-primary me-1" @click.prevent="removeAutohideFileType(type)">{{ type.name }}</span>
                                    <span v-for="type in syncOptions.autohideCustomTypes" class="badge bg-primary me-1" @click.prevent="removeAutohideCustomType(type)">{{ type }}</span>
                                </p>

                                <div v-if="showAutohideTypesSelect()" class="form-group">
                                    <label for="autohide-type-select">{{ l('optionsSelectType') }}</label>
                                    <select
                                            id="autohide-type-select"
                                            class="form-select ml-2"
                                            @change="selectAutohideType($event)"
                                    >
                                        <option :value="null" selected>{{ l('optionsSelectFileType') }}</option>
                                        <template v-for="(group, groupName) in selectableAutohideTypes">
                                            <optgroup v-if="group.length > 0" :label="groupName as string">
                                                <option v-for="type in group" :value="type.name">{{ type.name }}</option>
                                            </optgroup>
                                        </template>
                                    </select>
                                </div>

                                <div class="form-group form-inline">
                                    <label for="autohide-type">{{ l('optionsAddOtherType') }}</label>
                                    <input id="autohide-type"
                                           class="form-control ml-2 me-2"
                                           type="text"
                                           autocomplete="off"
                                           placeholder="image/png, gif, png, etc."
                                           @keyup.enter="autohideTypeEntered($event)"
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">{{ l('optionsMiscellaneousPanelTitle') }}</div>
                        <div class="card-body">
                            <h4 class="mt-3">{{ l('optionsCompletionSoundTitle') }}</h4>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="optionsPlaySound" v-model="syncOptions.playSoundOnComplete">
                                <label class="form-check-label" for="optionsPlaySound">{{ l('optionsPlaySound') }}</label>
                            </div>

                            <div v-if="syncOptions.playSoundOnComplete">
                                <div class="row row-cols-auto g-2 align-items-center mt-1 mb-3">
                                    <div class="col-auto">{{ l('optionsPlaySoundDownloadDurationBeforeText') }}</div>
                                    <div class="col-auto">
                                        <input type="number"
                                               min="0"
                                               max="600"
                                               class="form-control me-2 ml-2 auto-hide-duration"
                                               v-model="syncOptions.playSoundDownloadDuration"
                                        >
                                    </div>
                                    <div class="col-auto">{{ l('optionsPlaySoundDownloadDurationAfterText') }}</div>
                                </div>

                                <p class="text-muted small">{{ l('optionsCustomSoundNote') }}</p>
                                <div v-if="localOptions.customSound">
                                    {{ localOptions.customSound.name }}
                                    <button class="btn btn-danger btn-sm" @click="removeCustomSound">X</button>
                                </div>

                                <div v-else class="custom-file">
                                    <input id="custom-sound"
                                           class="custom-file-input"
                                           type="file"
                                           maxlength="100000"
                                           accept="audio/ogg,audio/mpeg,audio/wav,application/ogg,audio/webm,audio/x-flac"
                                    >
                                    <label class="custom-file-label" for="custom-sound">{{ l('optionsCustomSoundPlaceholder') }}</label>
                                </div>
                            </div>

                            <h4 class="mt-4">{{ l('optionsRefreshRateTitle') }}</h4>
                            <div class="form-group">
                                <p class="small text-muted mt-1 mb-2">{{ l('optionsRefreshRateNote') }}</p>
                                <div class="row row-cols-auto g-3 align-items-center">
                                    <div class="col-auto">
                                        <input id="refresh-rate"
                                               class="form-control me-2"
                                               type="number"
                                               step="100"
                                               min="100"
                                               max="2000"
                                               v-model="syncOptions.refreshRate">
                                    </div>
                                    <div class="col-auto">({{ l('optionsRefreshRateMillisecond') }})</div>
                                </div>
                            </div>

                            <h4 class="mt-3">{{ l('optionsHistoryTitle') }}</h4>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="optionsHistoryLabel" v-model="syncOptions.clearHistory">
                                    <label class="form-check-label" for="optionsHistoryLabel">{{ l('optionsHistoryLabel') }}</label>
                                </div>
                            </div>

                            <h4 class="mt-3">{{ l('optionsClearingTitle') }}</h4>
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="optionsClearFailedLabel" v-model="syncOptions.clearFailed">
                                    <label class="form-check-label" for="optionsClearFailedLabel">{{ l('optionsClearFailedLabel') }}</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">{{ l('optionsIgnoreFilesPanelTitle') }}</div>
                        <div class="card-body">
                            <p>{{ l('optionsIgnoreFilesDescription') }}</p>
                            <h5>{{ l('optionsIgnoreFileTypes') }} <small class="text-muted">{{ l('optionsClickToRemove') }}</small></h5>
                            <p>
                                <span v-for="type in syncOptions.ignoredFileTypes" class="badge bg-primary me-1" @click="removeIgnoredFileType(type)">{{ type.name }}</span>
                                <span v-for="type in syncOptions.ignoredCustomTypes" class="badge bg-primary me-1" @click="removeIgnoredCustomType(type)">{{ type }}</span>
                            </p>

                            <div v-if="showIgnoredTypesSelect()" class="mt-3">
                                <label for="ignore-type-select">{{ l('optionsSelectType') }}</label>
                                <select
                                        id="ignore-type-select"
                                        class="form-control ml-2"
                                        @change="selectIgnoredType($event)"
                                >
                                    <option :value="null" selected>{{ l('optionsSelectFileType') }}</option>
                                    <template v-for="(group, groupName) in selectableIgnoredTypes">
                                        <optgroup :label="groupName as string" v-if="group.length > 0">
                                            <option v-for="type in group" :value="type.name">{{ type.name }}</option>
                                        </optgroup>
                                    </template>
                                </select>
                            </div>

                            <div class="mt-3 form-inline">
                                <label for="ignore-type">{{ l('optionsAddOtherType') }}</label>
                                <input id="ignore-type"
                                       class="form-control ml-2 me-2"
                                       type="text"
                                       autocomplete="off"
                                       placeholder="image/png, gif, png, etc."
                                       @keyup.enter="ignoredTypeEntered($event)"
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, reactive, toRaw, watch} from 'vue';
import _ from 'lodash';
import * as helpers from '@/helpers';
import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from '@/config/options';
import fileTypes, {FileType, FileTypeList} from '@/config/filetypes';
import {colorLabels, defaultThemes, Theme} from '@/config/themes';

export default defineComponent({
    setup() {
        const syncOptions = reactive({...defaultSyncOptions});
        const localOptions = reactive({...defaultLocalOptions});

        watch(() => syncOptions, (options: SyncOptions) => {
            helpers.saveOptionsToStorage(toRaw(options));
        }, {deep: true})

        const currentTheme = computed((): Theme => {
            return helpers.getThemeById(syncOptions.theme, syncOptions.customThemes);
        });

        const selectableAutohideTypes = computed((): FileTypeList => {
            return _.mapValues(fileTypes, (fileTypes) => {
                return _.filter(fileTypes, (type: FileType) => {
                    return syncOptions.autohideFileTypes.indexOf(type) === -1;
                })
            });
        });

        const selectableIgnoredTypes = computed((): FileTypeList => {
            return _.mapValues(fileTypes, (fileTypes) => {
                return _.filter(fileTypes, (type: FileType) => {
                    return syncOptions.ignoredFileTypes.indexOf(type) === -1;
                })
            });
        });

        const themeList = computed((): Array<Theme> => {
            let themes = defaultThemes.slice();
            themes.push(...syncOptions.customThemes);

            return themes;
        })

        onMounted(() => {
            // Load the saved syncOptions
            browser.storage.sync.get(null)
                .then((options: browser.storage.StorageObject) => {
                    // Not sure if there is a better way to do this
                    Object.assign(syncOptions, helpers.mergeSyncDefaultOptions(helpers.forceUnref(options)));
                });

            browser.storage.local.get(null)
                .then((options: LocalOptions) => {
                    // Not sure if there is a better way to do this
                    Object.assign(localOptions, helpers.mergeSyncDefaultOptions(helpers.forceUnref(options)));
                });
        });

        return {
            syncOptions,
            localOptions,
            currentTheme,
            selectableAutohideTypes,
            selectableIgnoredTypes,
            themeList,
            colorLabels,

            l(messageName: string, substitutions?: string | string[]): string {
                return helpers.localize(messageName, substitutions);
            },

            saveOptions() {
                helpers.saveOptionsToStorage(syncOptions);
            },

            autohideTypeEntered(event: Event) {
                const target = event.target as HTMLFormElement;
                const type = (event.target as HTMLFormElement).value;

                if (typeof type == 'string' && type.length >= 1) {
                    if (syncOptions.autohideCustomTypes.indexOf(type) < 0) {
                        syncOptions.autohideCustomTypes.push(type);
                    }
                }

                target.value = '';
            },

            removeAutohideFileType(type: FileType) {
                const index = syncOptions.autohideFileTypes.indexOf(type);
                syncOptions.autohideFileTypes.splice(index, 1);
            },

            removeAutohideCustomType(type: string) {
                const index = syncOptions.autohideCustomTypes.indexOf(type);
                syncOptions.autohideCustomTypes.splice(index, 1);
            },

            selectAutohideType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && syncOptions.autohideFileTypes.indexOf(selectedType) === -1) {
                    syncOptions.autohideFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },

            showAutohideTypesSelect(): boolean {
                return _.reduce(selectableAutohideTypes.value, function (prev, group) {
                    return (Object.values(group).length > 0 || prev);
                }, false);
            },

            ignoredTypeEntered(event: Event) {
                const target = event.target as HTMLFormElement;
                const type = (event.target as HTMLFormElement).value;

                if (typeof type == 'string' && type.length >= 1) {
                    if (syncOptions.ignoredCustomTypes.indexOf(type) < 0) {
                        syncOptions.ignoredCustomTypes.push(type);
                    }
                }

                target.value = '';
            },

            removeIgnoredFileType(type: FileType) {
                const index = syncOptions.ignoredFileTypes.indexOf(type);
                syncOptions.ignoredFileTypes.splice(index, 1);
            },

            removeIgnoredCustomType(type: string) {
                const index = syncOptions.ignoredCustomTypes.indexOf(type);
                syncOptions.ignoredCustomTypes.splice(index, 1);
            },

            selectIgnoredType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && syncOptions.ignoredFileTypes.indexOf(selectedType) === -1) {
                    syncOptions.ignoredFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },

            showIgnoredTypesSelect(): boolean {
                return _.reduce(selectableIgnoredTypes.value, function (prev, group) {
                    return (Object.values(group).length > 0 || prev);
                }, false);
            },

            saveCustomSound(files: File[]) {
                const file = _.first(files);
                let reader = new FileReader();

                if (!file) {
                    return;
                }

                if (file.size > (1024 * 1024)) {
                    alert(`"${file.name}" is ${helpers.formatFileSize(file.size)}`);
                    return;
                }

                reader.addEventListener('load', () => {
                    localOptions.customSound = {
                        'name': file.name,
                        'data': reader.result as string,
                    };

                    browser.storage.local.set({'customSound': localOptions.customSound}).then(() => {
                        // this.$forceUpdate();
                    });
                });

                reader.readAsDataURL(file);
            },

            removeCustomSound() {
                browser.storage.local.remove('customSound').then(() => {
                    localOptions.customSound = undefined;
                });
            },

            customizeTheme() {
                let newTheme: Theme = _.cloneDeep(currentTheme.value);
                newTheme.name = helpers.localize('customizeThemeDefaultName');
                newTheme.id = helpers.randomString(20);
                newTheme.custom = true;

                syncOptions.customThemes.push(newTheme);
                syncOptions.theme = newTheme.id;
            },

            deleteTheme(theme: Theme) {
                let index = syncOptions.customThemes.findIndex((t) => {
                    return t.id === theme.id
                });

                if (index === -1) return;

                syncOptions.customThemes.splice(index, 1);
                syncOptions.theme = themeList.value[0].id;
            },
        }
    }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";

html, body {
  background : transparent;
}

.auto-hide-duration {
  width : 100px;
}

.card-deck {
  justify-content : space-between;
}

.card-deck .card {
  flex-basis : 48%;
  margin     : 0 1% 20px 1%;
}

.badge {
  &:hover {
    cursor           : pointer;
    background-color : rgba(var(--bs-danger-rgb), var(--bs-bg-opacity)) !important;
  }
}

@include media-breakpoint-down(sm) {
  .card-deck .card {
    flex : 100%;

    + .card {
      margin-top : 20px
    }
  }
}
</style>
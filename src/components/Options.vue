<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card-deck">
                    <div class="card">
                        <div class="card-header">Appearance</div>
                        <div class="card-body">
                            <div class="form-check">
                                <label class="custom-control custom-radio">
                                    <span class="custom-control-indicator"></span>
                                    <input type="radio" class="custom-control-input" value="light" v-model="syncOptions.theme">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Light</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <label class="custom-control custom-radio">
                                    <input type="radio" class="custom-control-input" value="dark" v-model="syncOptions.theme">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Dark</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="syncOptions.alwaysShow">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Always show the status bar</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="syncOptions.showInfoText">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Show download info</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">Auto Hiding</div>
                        <div class="card-body">
                            <label class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" v-model="syncOptions.autohideEnable">
                                <span class="custom-control-indicator"></span>
                                <span class="custom-control-description">Auto Hide Completed Downloads</span>
                            </label>

                            <div v-if="syncOptions.autohideEnable">
                                <div class="form-inline">
                                    Hide after
                                    <input type="number"
                                           min="1"
                                           max="600"
                                           class="form-control mr-2 ml-2 auto-hide-duration"
                                           value="5"
                                           v-model="syncOptions.autohideDuration"
                                    >
                                    seconds
                                </div>


                                <h5 class="mt-3">File types to hide
                                    <small class="text-muted">Click to remove</small>
                                </h5>
                                <p class="text-muted">Optional. If nothing is selected all file types will auto hide.</p>
                                <p>
                                    <span v-for="type in syncOptions.autohideFileTypes"
                                          class="badge badge-primary mr-1"
                                          @click="removeAutohideFileType(type)">{{ type.name }}</span>
                                    <span v-for="type in syncOptions.autohideCustomTypes"
                                          class="badge badge-primary mr-1"
                                          @click="removeAutohideCustomType(type)">{{ type }}</span>
                                </p>

                                <div v-if="showAutohideTypesSelect()" class="form-group form-inline">
                                    <label for="autohide-type-select">Select type</label>
                                    <select
                                            id="autohide-type-select"
                                            class="form-control ml-2"
                                            @change="selectAutohideType($event)">
                                        <option :value="null" selected disabled hidden>Select File Type</option>
                                        <optgroup :label="groupName" v-for="(group, groupName) in selectableAutohideTypes"
                                                  v-if="group.length > 0">
                                            <option v-for="type in group" :value="type.name">{{ type.name }}</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div class="form-group form-inline">
                                    <label for="autohide-type">Add other type</label>
                                    <input id="autohide-type"
                                           class="form-control ml-2 mr-2"
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
                        <div class="card-header">Miscellaneous</div>
                        <div class="card-body">
                            <h4>Completion Sound</h4>
                            <label class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" v-model="syncOptions.playSoundOnComplete">
                                <span class="custom-control-indicator"></span>
                                <span class="custom-control-description">Play a sound when a download completes</span>
                            </label>

                            <div v-if="syncOptions.playSoundOnComplete">
                                <p class="text-muted">You may optionally choose a custom sound (1MB MAX)</p>
                                <div v-if="localOptions.customSound">
                                    {{ localOptions.customSound.name }}
                                    <button class="btn btn-danger btn-sm" @click="removeCustomSound">X</button>
                                </div>

                                <div v-else class="form-group form-inline">
                                    <input id="custom-sound"
                                           class="form-control"
                                           type="file"
                                           maxlength="100000"
                                           accept="audio/ogg,audio/mpeg,audio/wav,application/ogg,audio/webm,audio/x-flac"
                                           @change="saveCustomSound($event.target.files)"
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">Ignored File Types</div>
                        <div class="card-body">
                            <p>These file types will not show up in the bar</p>
                            <h5>File types to ignore
                                <small class="text-muted">Click to remove</small>
                            </h5>
                            <p>
                                    <span v-for="type in syncOptions.ignoredFileTypes"
                                          class="badge badge-primary mr-1"
                                          @click="removeIgnoredFileType(type)">{{ type.name }}</span>
                                <span v-for="type in syncOptions.ignoredCustomTypes"
                                      class="badge badge-primary mr-1"
                                      @click="removeIgnoredCustomType(type)">{{ type }}</span>
                            </p>

                            <div v-if="showIgnoredTypesSelect()" class="form-group form-inline">
                                <label for="ignore-type-select">Select type</label>
                                <select
                                        id="ignore-type-select"
                                        class="form-control ml-2"
                                        @change="selectIgnoredType($event)">
                                    <option :value="null" selected disabled hidden>Select File Type</option>
                                    <optgroup :label="groupName" v-for="(group, groupName) in selectableIgnoredTypes"
                                              v-if="group.length > 0">
                                        <option v-for="type in group" :value="type.name">{{ type.name }}</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div class="form-group form-inline">
                                <label for="ignore-type">Add other type</label>
                                <input id="ignore-type"
                                       class="form-control ml-2 mr-2"
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
    import Vue from 'vue';
    import {SyncOptions, defaultSyncOptions, LocalOptions, defaultLocalOptions} from '../config/options';
    import fileTypes, {FileTypeList, FileType} from '../config/filetypes';
    import * as helpers from '../helpers';
    import * as _ from 'lodash';

    export default Vue.extend({
        name: 'options',
        data(): {
            syncOptions: SyncOptions,
            localOptions: LocalOptions
            fileTypes: FileTypeList
        } {
            return {
                syncOptions: defaultSyncOptions,
                localOptions: defaultLocalOptions,
                fileTypes: fileTypes,
            }
        },
        computed: {
            selectableAutohideTypes(): FileTypeList {
                return _.mapValues(this.fileTypes, (fileTypes) => {
                    return _.filter(fileTypes, (type: FileType) => {
                        return this.syncOptions.autohideFileTypes.indexOf(type) === -1;
                    })
                });
            },

            selectableIgnoredTypes(): FileTypeList {
                return _.mapValues(this.fileTypes, (fileTypes) => {
                    return _.filter(fileTypes, (type: FileType) => {
                        return this.syncOptions.ignoredFileTypes.indexOf(type) === -1;
                    })
                });
            },
        },
        methods: {
            saveOptions() {
                helpers.saveOptionsToStorage(this.syncOptions);
            },
            autohideTypeEntered(event: Event) {
                const target = event.target as HTMLFormElement;
                const type = (event.target as HTMLFormElement).value;

                if (typeof type == 'string' && type.length >= 1) {
                    if (this.syncOptions.autohideCustomTypes.indexOf(type) < 0) {
                        this.syncOptions.autohideCustomTypes.push(type);
                    }
                }

                target.value = '';
            },
            removeAutohideFileType(type: FileType) {
                const index = this.syncOptions.autohideFileTypes.indexOf(type);
                this.syncOptions.autohideFileTypes.splice(index, 1);
            },
            removeAutohideCustomType(type: string) {
                const index = this.syncOptions.autohideCustomTypes.indexOf(type);
                this.syncOptions.autohideCustomTypes.splice(index, 1);
            },
            selectAutohideType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && this.syncOptions.autohideFileTypes.indexOf(selectedType) === -1) {
                    this.syncOptions.autohideFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },
            showAutohideTypesSelect(): boolean {
                return _.reduce(this.selectableAutohideTypes, function (prev, group) {
                    return (group.length > 0 || prev);
                }, false);
            },

            ignoredTypeEntered(event: Event) {
                const target = event.target as HTMLFormElement;
                const type = (event.target as HTMLFormElement).value;

                if (typeof type == 'string' && type.length >= 1) {
                    if (this.syncOptions.ignoredCustomTypes.indexOf(type) < 0) {
                        this.syncOptions.ignoredCustomTypes.push(type);
                    }
                }

                target.value = '';
            },
            removeIgnoredFileType(type: FileType) {
                const index = this.syncOptions.ignoredFileTypes.indexOf(type);
                this.syncOptions.ignoredFileTypes.splice(index, 1);
            },
            removeIgnoredCustomType(type: string) {
                const index = this.syncOptions.ignoredCustomTypes.indexOf(type);
                this.syncOptions.ignoredCustomTypes.splice(index, 1);
            },
            selectIgnoredType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && this.syncOptions.ignoredFileTypes.indexOf(selectedType) === -1) {
                    this.syncOptions.ignoredFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },
            showIgnoredTypesSelect(): boolean {
                return _.reduce(this.selectableIgnoredTypes, function (prev, group) {
                    return (group.length > 0 || prev);
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
                    this.localOptions.customSound = {
                        'name': file.name,
                        'data': reader.result,
                    };

                    browser.storage.local.set({'customSound': this.localOptions.customSound});
                });

                reader.readAsDataURL(file);
            },

            removeCustomSound() {
                browser.storage.local.remove('customSound').then(() => {
                    this.localOptions.customSound = undefined;
                });
            },
        },

        mounted() {
            // Load the saved syncOptions
            browser.storage.sync.get(null)
                .then((options: SyncOptions) => {
                    this.syncOptions = helpers.mergeSyncDefaultOptions(options);
                });

            browser.storage.local.get(null)
                .then((options: LocalOptions) => {
                    this.localOptions = helpers.mergeLocalDefaultOptions(options);
                });
        },

        watch: {
            syncOptions: {
                handler(options) {
                    helpers.saveOptionsToStorage(options);
                },
                deep: true,
            },
        },
    })
</script>

<style lang="scss">
    @import "~bootstrap/scss/bootstrap";

    html, body {
        background : transparent;
    }

    .auto-hide-duration {
        width : 50px;
    }

    .card-deck {
        justify-content : space-between;
    }

    .card-deck .card {
        flex-basis : 48%;
        margin     : 0 1% 20px 1%;
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
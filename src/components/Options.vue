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
                                    <input type="checkbox" class="custom-control-input" v-model="syncOptions.singleRowOnly">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Force downloads to stay in a single row</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="syncOptions.showStatusText">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Show status text</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="syncOptions.showProgressText">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Show progress text</span>
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
                                          @click="removeFileType(type)">{{ type.name }}</span>
                                    <span v-for="type in syncOptions.autohideCustomTypes"
                                          class="badge badge-primary mr-1"
                                          @click="removeCustomType(type)">{{ type }}</span>
                                </p>

                                <div v-if="showTypesSelect()" class="form-group form-inline">
                                    <label for="autohide-type-select">Select type</label>
                                    <select
                                            id="autohide-type-select"
                                            class="form-control ml-2"
                                            @change="selectType($event)">
                                        <option :value="null" selected disabled hidden>Select File Type</option>
                                        <optgroup :label="groupName" v-for="(group, groupName) in selectableTypes"
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

                    <div class="card w-50 mt-4">
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

    function saveOptionsToStorage(options: SyncOptions) {
        options = {...options};

        if (typeof options.autohideDuration === 'string') {
            options.autohideDuration = parseInt(options.autohideDuration);
        }

        browser.storage.sync.set(options);
    }

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
            selectableTypes(): FileTypeList {
                return _.mapValues(this.fileTypes, (fileTypes) => {
                    return _.filter(fileTypes, (type: FileType) => {
                        return this.syncOptions.autohideFileTypes.indexOf(type) === -1;
                    })
                });
            },
        },
        methods: {
            saveOptions() {
                saveOptionsToStorage(this.syncOptions);
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
            removeFileType(type: FileType) {
                const index = this.syncOptions.autohideFileTypes.indexOf(type);
                this.syncOptions.autohideFileTypes.splice(index, 1);
            },
            removeCustomType(type: string) {
                const index = this.syncOptions.autohideCustomTypes.indexOf(type);
                this.syncOptions.autohideCustomTypes.splice(index, 1);
            },
            selectType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && this.syncOptions.autohideFileTypes.indexOf(selectedType) === -1) {
                    this.syncOptions.autohideFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },
            showTypesSelect(): boolean {
                return _.reduce(this.selectableTypes, function (prev, group) {
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
                    saveOptionsToStorage(options);
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

    .card-deck .card {
        flex : 1 0 auto;
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
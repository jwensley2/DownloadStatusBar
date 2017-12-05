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
                                    <input type="radio" class="custom-control-input" value="light" v-model="options.theme">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Light</span>
                                </label>
                            </div>
                            <div class="form-check">
                                <label class="custom-control custom-radio">
                                    <input type="radio" class="custom-control-input" value="dark" v-model="options.theme">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Dark</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="options.alwaysShow">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Always show the status bar</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="options.showStatusText">
                                    <span class="custom-control-indicator"></span>
                                    <span class="custom-control-description">Show status text</span>
                                </label>
                            </div>

                            <div class="form-check">
                                <label class="custom-control custom-checkbox">
                                    <input type="checkbox" class="custom-control-input" v-model="options.showProgressText">
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
                                <input type="checkbox" class="custom-control-input" v-model="options.autohideEnable">
                                <span class="custom-control-indicator"></span>
                                <span class="custom-control-description">Auto Hide Completed Downloads</span>
                            </label>

                            <div v-if="options.autohideEnable">
                                <div class="form-inline">
                                    Hide after
                                    <input type="number"
                                           min="1"
                                           max="600"
                                           class="form-control mr-2 ml-2 auto-hide-duration"
                                           value="5"
                                           v-model="options.autohideDuration"
                                    >
                                    seconds
                                </div>


                                <h5 class="mt-3">File types to hide
                                    <small class="text-muted">Click to remove</small>
                                </h5>
                                <p>
                                    <span v-for="type in options.autohideFileTypes"
                                          class="badge badge-primary mr-1"
                                          @click="removeFileType(type)">{{ type.name }}</span>
                                    <span v-for="type in options.autohideCustomTypes"
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
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Options, defaultOptions} from '../config/options';
    import fileTypes, {FileTypeList, FileType} from '../config/filetypes';
    import * as helpers from '../helpers';
    import * as _ from 'lodash';

    function saveOptionsToStorage(options: Options) {
        options = {...options};

        if (typeof options.autohideDuration === 'string') {
            options.autohideDuration = parseInt(options.autohideDuration);
        }

        browser.storage.sync.set(options);
    }

    export default Vue.extend({
        name: 'options',
        data(): {
            options: Options,
            fileTypes: FileTypeList
        } {
            return {
                options: defaultOptions,
                fileTypes: fileTypes,
            }
        },
        computed: {
            selectableTypes(): FileTypeList {
                return _.mapValues(this.fileTypes, (fileTypes) => {
                    return _.filter(fileTypes, (type: FileType) => {
                        return this.options.autohideFileTypes.indexOf(type) === -1;
                    })
                });
            },
        },
        methods: {
            saveOptions() {
                saveOptionsToStorage(this.options);
            },
            autohideTypeEntered(event: Event) {
                const target = event.target as HTMLFormElement;
                const type = (event.target as HTMLFormElement).value;

                if (typeof type == 'string' && type.length >= 1) {
                    if (this.options.autohideCustomTypes.indexOf(type) < 0) {
                        this.options.autohideCustomTypes.push(type);
                    }
                }

                target.value = '';
            },
            removeFileType(type: FileType) {
                const index = this.options.autohideFileTypes.indexOf(type);
                this.options.autohideFileTypes.splice(index, 1);
            },
            removeCustomType(type: string) {
                const index = this.options.autohideCustomTypes.indexOf(type);
                this.options.autohideCustomTypes.splice(index, 1);
            },
            selectType(event: Event) {
                const target = event.target as HTMLFormElement;
                const selectedType = helpers.getFileTypeByName(target.value);

                if (selectedType && this.options.autohideFileTypes.indexOf(selectedType) === -1) {
                    this.options.autohideFileTypes.push(selectedType);
                }

                // Clear the input
                target.value = '';
            },
            showTypesSelect(): boolean {
                return _.reduce(this.selectableTypes, function (prev, group) {
                    return (group.length > 0 || prev);
                }, false);
            },
        },

        mounted() {
            // Load the saved options
            browser.storage.sync.get(null)
                .then((options: Options) => {
                    this.options = helpers.mergeDefaultOptions(options);
                });
        },

        watch: {
            options: {
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
        background: transparent;
    }

    .auto-hide-duration {
        width: 50px;
    }

    @include media-breakpoint-down(sm) {
        .card-deck .card {
            flex: 100%;

            + .card {
                margin-top: 20px
            }
        }
    }
</style>
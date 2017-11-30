<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card form-group">
                    <div class="card-header">Options</div>
                    <div class="card-body">
                        <div class="form-group">
                            <h4>Theme</h4>
                            <div class="form-check form-check-inline">
                                <label class="form-check-label">
                                    <input type="radio" class="form-check-input" value="light" v-model="options.theme">
                                    Light
                                </label>
                            </div>
                            <div class="form-check form-check-inline">
                                <label class="form-check-label">
                                    <input type="radio" class="form-check-input" value="dark" v-model="options.theme">
                                    Dark
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <h4>Auto Hiding</h4>
                            <label>
                                <input type="checkbox" v-model="options.autohideEnable"> Auto Hide Completed Downloads
                            </label>

                            <div v-if="options.autohideEnable" class="form-inline">
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
                        </div>

                        <button class="btn btn-primary" @click="saveOptions">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Options} from '../options';

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
            options: Options
        } {
            return {
                options: {
                    theme: 'light',
                    autohideEnable: false,
                    autohideDuration: 5,
                }
            }
        },
        methods: {
            saveOptions() {
                saveOptionsToStorage(this.options);
            }
        },

        mounted() {
            let gettingItem = browser.storage.sync.get(null)
                .then((res: any) => {
                    this.options = res;
                });
        },

        watch: {
            options: {
                handler(options) {
                    saveOptionsToStorage(options);
                },
                deep: true
            }
        }
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
</style>
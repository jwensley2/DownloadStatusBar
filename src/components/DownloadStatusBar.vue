<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0 || options.alwaysShow"
         :class="[`dsb-theme-${options.theme}`, {'dsb-minimized': options.minimized}]"
         @mouseleave="hideContextMenu">
        <button class="dsb-clear-downloads" v-if="!options.minimized" @click="$root.$emit('clearDownloads')">
            Clear
        </button>
        <div class="dsb-downloads" v-if="!options.minimized">
            <download v-for="download in downloads"
                      :key="download.id"
                      :download="download"
                      :options="options"></download>
        </div>

        <context-menu :theme="options.theme"></context-menu>
        <tooltip :theme="options.theme"></tooltip>


        <button class="dsb-open-options" v-if="!options.minimized" @click="openOptions">Options<span class="icon-gear"></span></button>
        <button class="dsb-minimize" @click="minimize">
            <span :class="!options.minimized ? 'icon-angle-right' : 'icon-angle-left'"></span>
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Download from './Download.vue';
    import {defaultSyncOptions, SyncOptions} from '../config/options';
    import * as helpers from '../helpers';

    export default Vue.extend({
        name: 'download-status-bar',
        components: {
            'download': Download,
        },
        props: {
            downloads: Array,
        },
        data() {
            return {
                options: defaultSyncOptions,
                defaultBottomMargin: 0,
            }
        },
        methods: {
            hideContextMenu() {
                this.$contextMenu.close();
            },
            openOptions() {
                this.$root.$emit('openOptions');
            },
            minimize() {
                this.options.minimized = !this.options.minimized;

                helpers.saveOptionsToStorage(this.options);
            },
            setBodyMargin() {
                const body = document.getElementsByTagName('body')[0];
                const downloadStatusBar = document.getElementById('DownloadStatusBar');

                if (downloadStatusBar && this.downloads.length > 0 && downloadStatusBar.offsetHeight > this.defaultBottomMargin) {
                    body.style.marginBottom = `${downloadStatusBar.offsetHeight}px`;
                } else {
                    body.style.marginBottom = `${this.defaultBottomMargin}px`;
                }
            }
        },
        watch: {
            downloads() {
                this.setBodyMargin();
            },
        },
        mounted() {
            // Load the saved syncOptions
            browser.storage.sync.get(null)
                .then((options: SyncOptions) => {
                    this.options = helpers.mergeSyncDefaultOptions(options);
                });

            browser.storage.onChanged.addListener((changedOptions) => {
                for (let item of Object.keys(changedOptions)) {
                    this.options[item] = changedOptions[item].newValue;
                }
            });

            const body = document.getElementsByTagName('body')[0];
            if (window.getComputedStyle(body).marginBottom) {
                this.defaultBottomMargin = parseInt(window.getComputedStyle(body).marginBottom!);
            }
            this.setBodyMargin();
        },
        updated() {
            this.setBodyMargin();
        }
    });
</script>

<style scoped lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    @import "../../icomoon/style";
    @import "~bootstrap/scss/bootstrap-reboot";

    #DownloadStatusBar {
        -moz-osx-font-smoothing : grayscale;
        background              : light-theme("background");
        border-top              : 1px solid light-theme("border");
        bottom                  : 0;
        box-sizing              : content-box;
        color                   : light-theme("text");
        display                 : flex;
        flex-direction          : row;
        font                    : normal 400 16px Arial, sans-serif;
        left                    : 0;
        letter-spacing          : normal;
        line-height             : 1;
        min-height              : 25px;
        padding                 : 0;
        position                : fixed;
        text-align              : left;
        width                   : 100%;
        z-index                 : 9999999;

        > * {
            vertical-align : middle
        }

        &.dsb-minimized {
            border-left : 1px solid light-theme("border");
            left        : auto;
            overflow    : hidden;
            right       : 0;
            width       : auto;
        }

        &.dsb-theme-dark {
            background : dark-theme("background");
            border-top : 1px solid dark-theme("border");
            color      : dark-theme("text");

            &.dsb-minimized {
                border-left : 1px solid dark-theme("border");
            }

            .dsb-clear-downloads {
                background   : dark-theme("button");
                border-right : 1px solid dark-theme("button-border");
                color        : dark-theme("text");

                &:hover {
                    background : dark-theme("button-hover");
                }
            }

            .dsb-icon-button [class^="icon-"] { color : dark-theme('text') }
        }
    }

    .dsb-clear-downloads {
        background         : light-theme("button");
        border             : 0 solid light-theme("button-border");
        border-right-width : 1px;
        box-shadow         : none;
        box-sizing         : border-box;
        color              : light-theme("text");
        cursor             : pointer;
        display            : inline-block;
        font               : normal 600 14px Arial, sans-serif;
        margin             : 0 5px 0 0;
        padding            : 0 15px;
        width              : auto;

        &:hover {
            background : light-theme("button-hover");
        }
    }

    .dsb-icon-button {
        background  : none;
        border      : 0;
        cursor      : pointer;
        margin      : 0;
        overflow    : hidden;
        padding     : 0;
        position    : relative;
        text-indent : -999px;
        width       : 30px;

        [class^="icon-"] {
            color       : light-theme('text');
            display     : block;
            font-size   : 20px;
            height      : 100%;
            left        : 0;
            line-height : 100%;
            margin-top  : -10px;
            position    : absolute;
            right       : 0;
            text-indent : 0;
            top         : 50%;
            width       : 100%;
        }
    }

    .dsb-open-options {
        @extend .dsb-icon-button;
        margin-left : auto;
        flex        : none;
    }

    .dsb-minimize {
        @extend .dsb-icon-button;
    }

    .dsb-downloads {
        display        : flex;
        flex           : 0 -1 auto;
        flex-direction : row;
        flex-wrap      : nowrap;
        margin         : -5px 0 0 0;
        overflow       : hidden;
    }
</style>
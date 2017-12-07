<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0 || options.alwaysShow" :class="`theme-${options.theme}`"
         @mouseleave="hideContextMenu">
        <button class="clearDownloads" @click="$root.$emit('clearDownloads')">
            Clear
        </button>
        <div class="downloads" :class="{'single-row': options.singleRowOnly}">
            <download v-for="download in downloads"
                      :key="download.id"
                      :download="download"
                      :options="options"></download>
        </div>

        <context-menu :theme="options.theme"></context-menu>
        <tooltip :theme="options.theme"></tooltip>

        <button class="open-options" @click="openOptions">Options<span class="icon-gear"></span></button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Download from './Download.vue';
    import {SyncOptions, defaultSyncOptions} from '../config/options';
    import * as helpers from '../helpers';

    export default Vue.extend({
        name: 'download-status-bar',
        components: {
            'download': Download,
        },
        props: ['downloads'],
        data() {
            return {
                options: defaultSyncOptions,
            }
        },
        methods: {
            hideContextMenu() {
                this.$contextMenu.close();
            },
            openOptions() {
                this.$root.$emit('openOptions');
            },
        },
        watch: {
            downloads() {
                let body = document.getElementsByTagName('body')[0];
                let downloadStatusBar = document.getElementById('DownloadStatusBar');

                if (downloadStatusBar && this.downloads.length > 0) {
                    body.style.marginBottom = `${downloadStatusBar.offsetHeight}px`;
                } else {
                    body.style.marginBottom = '0';
                }
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
        },
    });
</script>

<style scoped lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    @import "../../icomoon/style";

    #DownloadStatusBar {
        @include reset;
        background     : light-theme("background");
        border-top     : 1px solid light-theme("border");
        bottom         : 0;
        box-sizing     : content-box;
        color          : light-theme("text");
        display        : flex;
        flex-direction : row;
        font           : normal 400 16px Arial, sans-serif;
        left           : 0;
        line-height    : 1;
        min-height     : 25px;
        padding        : 0;
        position       : fixed;
        text-align     : left;
        width          : 100%;
        z-index        : 100000;

        > * {
            vertical-align : middle
        }

        .clearDownloads {
            @include reset;
            background   : light-theme("button");
            border-right : 1px solid light-theme("button-border");
            box-shadow   : none;
            box-sizing   : border-box;
            color        : light-theme("text");
            cursor       : pointer;
            display      : inline-block;
            font         : normal 600 0.8em Arial, sans-serif;
            margin       : 0 5px 0 0;
            padding      : 0 15px;
            width        : auto;

            &:hover {
                background : light-theme("button-hover");
            }
        }

        .open-options {
            @include reset;
            background  : none;
            cursor      : pointer;
            flex        : none;
            margin-left : auto;
            overflow    : hidden;
            position    : relative;
            text-indent : -999px;
            width       : 30px;

            .icon-gear {
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

        .downloads {
            @include reset;
            display        : flex;
            flex-direction : row;
            flex-wrap      : wrap;
            margin-top     : -5px;
            flex           : 0 -1 auto;
            overflow       : hidden;

            &.single-row {
                flex-wrap : nowrap;

                .item {
                    overflow  : hidden;
                    flex      : 0 1 auto;
                    max-width : unset;
                    min-width : unset;
                    width     : auto;
                }
            }
        }

        &.theme-dark {
            background : dark-theme("background");
            border-top : 1px solid dark-theme("border");
            color      : dark-theme("text");

            .clearDownloads {
                background   : dark-theme("button");
                border-right : 1px solid dark-theme("button-border");
                color        : dark-theme("text");

                &:hover {
                    background : dark-theme("button-hover");
                }
            }

            .icon-gear { color : dark-theme('text') }
        }
    }
</style>
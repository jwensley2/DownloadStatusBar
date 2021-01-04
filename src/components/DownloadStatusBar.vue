<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0 || options.alwaysShow"
         :class="[{'dsb-minimized': options.minimized}]"
         @mouseleave="hideContextMenu">
        <button class="dsb-clear-downloads" v-if="!options.minimized" @click="$root.$emit('clearDownloads')">
            {{ l('barClearButton') }}
        </button>
        <div class="dsb-downloads" v-if="!options.minimized">
            <download v-for="download in downloads"
                      :key="download.id"
                      :download="download"
                      :options="options"></download>
        </div>

        <context-menu></context-menu>
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
    import {Component, Watch} from 'vue-property-decorator';

    @Component({
        components: {
            Download,
        },
    })
    export default class DownloadStatusBar extends Vue {
        options = defaultSyncOptions;
        defaultBottomMargin = 0;

        get downloads() {
            return this.$store.getters.getDownloads;
        }

        l(messageName: string, substitutions?: string | string[]): string {
            return helpers.localize(messageName, substitutions);
        }

        hideContextMenu() {
            this.$contextMenu.close();
        }

        openOptions() {
            this.$root.$emit('openOptions');
        }

        minimize() {
            this.options.minimized = !this.options.minimized;

            helpers.saveOptionsToStorage(this.options);
        }

        setBodyMargin() {
            const body = document.getElementsByTagName('body')[0] as HTMLElement;
            const downloadStatusBar = this.$el as HTMLElement;

            if (downloadStatusBar && this.downloads.length > 0 && downloadStatusBar.offsetHeight > this.defaultBottomMargin) {
                body.style.marginBottom = `${downloadStatusBar.offsetHeight}px`;
            } else {
                body.style.marginBottom = `${this.defaultBottomMargin}px`;
            }
        }

        // Mounted Lifecycle Hook
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

            const body = document.getElementsByTagName('body')[0] as HTMLElement;
            if (window.getComputedStyle(body).marginBottom) {
                this.defaultBottomMargin = parseInt(window.getComputedStyle(body).marginBottom!);
            }
            this.setBodyMargin();
        }

        // Updated Lifecycle Hook
        updated() {
            this.setBodyMargin();
        }

        @Watch('downloads')
        watchDownloads() {
            this.setBodyMargin();
        }
    }
</script>

<style lang="scss" scoped>
    @import "../scss/variables";
    @import "../scss/mixins";
    @import "../../icomoon/style";

    #DownloadStatusBar {
        -moz-osx-font-smoothing : grayscale;
        background              : var(--background);
        border-top              : 1px solid var(--border);
        bottom                  : 0;
        box-sizing              : content-box;
        color                   : var(--text);
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
            height         : auto;
            vertical-align : middle
        }

        &.dsb-minimized {
            border-left : 1px solid var(--border);
            left        : auto;
            overflow    : hidden;
            right       : 0;
            width       : auto;
        }
    }

    .dsb-bar-button {
        box-shadow  : none;
        box-sizing  : border-box;
        cursor      : pointer;
        height      : auto;
        line-height : 1;
        min-height  : 0;
        min-width   : 0;
        width       : auto;
    }

    .dsb-clear-downloads {
        @extend .dsb-bar-button;
        background         : var(--button);
        border             : 0 solid var(--buttonBorder);
        border-right-width : 1px;
        color              : var(--text) !important;
        display            : inline-block;
        font               : normal 600 14px/1 Arial, sans-serif;
        height             : auto;
        margin             : 0 5px 0 0;
        padding            : 0 15px;

        &:hover {
            background : var(--buttonHover);
        }
    }

    .dsb-icon-button {
        @extend .dsb-bar-button;
        background  : none;
        border      : 0;
        margin      : 0;
        overflow    : hidden;
        padding     : 0;
        position    : relative;
        text-indent : -999px;
        width       : 30px;

        [class^="icon-"] {
            color       : var(--text);
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

    @media print {
      #DownloadStatusBar { display : none }
    }
</style>
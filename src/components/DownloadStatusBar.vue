<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0" :class="`theme-${theme}`" @mouseleave="hideContextMenu">
        <button class="clearDownloads" @click="$root.$emit('clearDownloads')">
            Clear
        </button>
        <div class="downloads">
            <download v-for="download in downloads"
                      :key="download.id"
                      :download="download"
                      :options="options"></download>
        </div>

        <context-menu :theme="theme"></context-menu>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Download from './Download.vue';
    import {Options, defaultOptions} from '../config/options';

    export default Vue.extend({
        name: 'download-status-bar',
        components: {
            'download': Download,
        },
        props: ['options', 'downloads'],
        computed: {
            theme(): String {
                return this.options.theme || 'light';
            }
        },
        methods: {
            hideContextMenu() {
                this.$contextMenu.close();
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
            }
        }
    });
</script>

<style scoped lang="scss">
    @import "../variables";

    #DownloadStatusBar {
        background: map-get($light-theme, "background");
        border-top: 1px solid map-get($light-theme, "border");
        bottom: 0;
        box-sizing: content-box;
        color: map-get($light-theme, "text");
        display: flex;
        flex-direction: row;
        font: normal 400 16px Arial, sans-serif;
        left: 0;
        line-height: 1;
        padding: 0;
        position: fixed;
        width: 100%;
        z-index: 100000;

        > * {
            vertical-align: middle
        }

        .clearDownloads {
            background: map-get($light-theme, "button");
            border: 0;
            border-right: 1px solid map-get($light-theme, "button-border");
            box-shadow: none;
            box-sizing: border-box;
            color: map-get($light-theme, "text");
            cursor: pointer;
            display: inline-block;
            font: normal 600 0.8em Arial, sans-serif;
            margin: 0 5px 0 0;
            padding: 0 15px;
            width: auto;

            &:hover {
                background: map-get($light-theme, "button-hover");
            }
        }

        .downloads {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            margin-top: -5px;
        }

        &.theme-dark {
            background: map-get($dark-theme, "background");
            border-top: 1px solid map-get($dark-theme, "border");
            color: map-get($dark-theme, "text");

            .clearDownloads {
                background: map-get($dark-theme, "button");
                border-right: 1px solid map-get($dark-theme, "button-border");
                color: map-get($dark-theme, "text");

                &:hover {
                    background: map-get($dark-theme, "button-hover");
                }
            }
        }
    }
</style>
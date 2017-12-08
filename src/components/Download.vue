<template>
    <div class="item"
         @click="singleClick"
         @dblclick="doubleClick"
         @mouseover="showTooltip($refs[`downloads-${download.id}`], download)"
         @mouseleave="hideTooltip"
         @contextmenu.prevent="showContextMenu"
         :ref="`downloads-${download.id}`"
         :class="[`theme-${options.theme}`, progressClass]"
    >
        <div v-if="isInProgress" class="progress-bar" :style="`width: ${percentDone}%`"></div>

        <div class="text-container">
            <p class="filename">{{ filename }}</p>
            <p v-if="options.showStatusText" class="status text-line">{{ status }}</p>
            <p v-if="options.showProgressText" class="progress text-line">{{ progress }}</p>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import * as helpers from '../helpers';

    export default Vue.extend({
        name: 'download',
        props: ['download', 'options'],
        data() {
            return {}
        },
        computed: {
            filename(): String {
                let m = this.download.filename.toString().match(/.*[\/\\](.+)/);

                if (m && m.length > 1) {
                    return m[m.length - 1];
                }

                return '';
            },
            status(): string {
                return helpers.downloadStatus(this.download);
            },

            progress(): string {
                return helpers.downloadProgress(this.download);
            },

            downloaded(): string {
                return helpers.formatFileSize(this.download.bytesReceived);
            },

            totalsize(): string {
                return helpers.formatFileSize(this.download.totalBytes);
            },

            filesize(): string {
                return helpers.formatFileSize(this.download.fileSize);
            },

            percentDone(): string {
                return helpers.downloadPercent(this.download);
            },

            isInProgress(): boolean {
                return this.download.state === 'in_progress' || this.download.paused;
            },

            progressClass() {
                if (this.download.state === 'complete') {
                    return 'complete';
                }

                if (helpers.wasDownloadCancelled(this.download)) {
                    return 'cancelled';
                }

                if (this.download.error && !this.download.paused) {
                    return 'error';
                }

                return 'in-progress';
            },
        },

        methods: {
            singleClick() {
                this.$root.$contextMenu.close();
            },
            doubleClick() {
                this.$root.$emit('showDownload', this.download);
            },
            showContextMenu(event: MouseEvent) {
                const userAgent = window.navigator.userAgent;
                const inProgress = this.download.state === 'in_progress';
                const paused = this.download.state === 'interrupted' && this.download.paused;

                let showTitle = userAgent.includes('Windows') ? 'Show in Explorer' :
                    userAgent.includes('Mac') ? 'Reveal in Finder' : 'Show in Folder';

                let items = [
                    {
                        name: 'Clear Download',
                        icon: 'eye-slash',
                        clicked: () => {
                            this.$root.$emit('clearDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    },
                ];

                if (!this.download.error) {
                    items.push({
                        name: showTitle,
                        icon: 'folder-open',
                        clicked: () => {
                            this.$root.$emit('showDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    });
                }

                // In progress or paused
                if (inProgress || paused) {
                    items.push({
                        name: 'Cancel Download',
                        icon: 'times',
                        clicked: () => {
                            this.$root.$emit('cancelDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    });
                }

                // Download in progress
                if (inProgress) {
                    items.push({
                        name: 'Pause Download',
                        icon: 'pause',
                        clicked: () => {
                            this.$root.$emit('pauseDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    });
                }

                // Download is paused
                if (paused) {
                    items.push({
                        name: 'Resume Download',
                        icon: 'play',
                        clicked: () => {
                            this.$root.$emit('resumeDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    });
                }

                if (this.download.state === 'complete') {
                    items.push({
                        name: 'Delete Download',
                        icon: 'trash-o',
                        clicked: () => {
                            this.$root.$emit('deleteDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    });
                }

                this.$root.$contextMenu.open(items, {x: event.clientX, y: event.clientY});
            },
        },
    });
</script>

<style lang="scss" scoped>
    @import "../scss/variables";
    @import "../scss/mixins";

    .item {
        @include reset;
        background      : light-theme("download");
        border-radius   : 0;
        box-sizing      : border-box;
        color           : light-theme("text");
        cursor          : pointer;
        display         : flex;
        flex-direction  : column;
        font            : 400 normal 14px/1 Arial, sans-serif;
        justify-content : center;
        margin          : 5px 5px 0 5px;
        min-height      : 30px;
        min-width       : 150px;
        max-width       : 300px;
        padding         : 3px 6px;
        position        : relative;
        text-shadow     : none;

        * {
            position : relative;
            z-index  : 10;
        }

        &.complete {
            background : light-theme("progress");
        }

        &.error {
            background : light-theme("error");
        }

        .progress-bar {
            @include reset;
            background    : light-theme("progress");
            border-radius : 0;
            display       : block;
            height        : 100%;
            left          : 0;
            position      : absolute;
            top           : 0;
            width         : 100%;
            z-index       : 0;
        }

        .text-line {
            @include reset;
            background : transparent;
            display    : block;
            font-size  : 12px;
            height     : auto;
            text-align : left;

            + .text-line {
                margin-top : 2px
            }
        }

        .filename {
            @extend .text-line;
            line-height   : 16px;
            font-size     : 14px;
            display       : inline-block;
            text-overflow : ellipsis;
            overflow      : hidden;
            direction     : rtl;
            max-width     : 100%;
        }

        &.theme-dark {
            background : dark-theme("download");
            color      : dark-theme("text");

            .progress-bar {
                background : dark-theme("progress");
            }

            &.complete {
                background : dark-theme("progress");
            }

            &.error {
                background : dark-theme("error");
            }
        }
    }
</style>
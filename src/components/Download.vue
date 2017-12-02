<template>
    <div class="item"
         @click="singleClick"
         @dblclick="doubleClick"
         @mouseover="showTooltip = true"
         @mouseleave="showTooltip = false"
         @contextmenu.prevent="showContextMenu"
         :class="`theme-${options.theme}`"
    >
        <div class="progress-bar" :style="`width: ${percentDone}%`"></div>

        <div class="text-container">
            <p class="filename">{{ filename }}</p>
            <p v-if="options.showStatusText" class="status text-line">{{ status }}</p>
            <p v-if="options.showProgressText" class="progress text-line">{{ progress }}</p>
        </div>

        <table class="tooltip" v-if="showTooltip">
            <tr>
                <th class="field-name">Filename:</th>
                <td>{{ filename }}</td>
            </tr>
            <tr>
                <th class="field-name">Url:</th>
                <td>{{ download.url }}</td>
            </tr>
            <tr>
                <th class="field-name">Referrer:</th>
                <td>{{ download.referrer || 'None' }}</td>
            </tr>
            <tr>
                <th class="field-name">Status:</th>
                <td>{{ status }}</td>
            </tr>
            <tr>
                <th class="field-name">Progress:</th>
                <td>{{ progress }}</td>
            </tr>
            <tr>
                <th class="field-name">MIME type:</th>
                <td>{{ download.mime || 'Unknown' }}</td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import * as moment from 'moment';
    import * as helpers from '../helpers';

    export default Vue.extend({
        name: 'download',
        props: ['download', 'options'],
        data() {
            return {
                showTooltip: false,
            }
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
                let download = this.download;

                if (download.state === 'complete') {
                    return 'Complete';
                }

                if (download.paused) {
                    return 'Paused';
                }

                if (helpers.wasDownloadCancelled(download)) {
                    return `Cancelled`
                }

                if (download.error) {
                    return `Error: ${download.error}`;
                }

                if (download.totalBytes === -1 || !download.estimatedEndTime) {
                    return `In Progress`
                }

                let now = moment();
                let finish = moment(download.estimatedEndTime, moment.ISO_8601);

                return moment.duration(finish.diff(now), 'ms').humanize();
            },

            progress(): string {
                let download = this.download;

                if (download.state === 'complete') {
                    return `${this.filesize}`;
                }

                if (download.totalBytes === -1) {
                    return `${this.downloaded} / Unknown`
                }

                return `${this.downloaded} / ${this.totalsize} - ${this.percentDone}%`;
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
                if (this.download.state === 'complete') {
                    return '100';
                } else if (this.download.totalBytes < 0) {
                    return '0';
                }

                return ((this.download.bytesReceived / this.download.totalBytes) * 100).toFixed(2);
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

            .tooltip {
                background : dark-theme("background");
                border     : 1px solid dark-theme("border");
                color      : dark-theme("text");
            }
        }
    }

    .tooltip {
        background     : light-theme("background");
        border         : 1px solid light-theme("border");
        bottom         : 100%;
        color          : light-theme("text");
        cursor         : default;
        left           : 0;
        margin         : 0;
        max-width      : 500px;
        min-width      : 100%;
        overflow       : hidden;
        padding        : 10px;
        pointer-events : none;
        position       : absolute;
        width          : 100%;

        td, th {
            @include reset;
            line-height : 1.2;
        }

        td {
            overflow      : hidden;
            padding-left  : 5px;
            text-overflow : ellipsis;
        }

        th {
            font-weight    : bold;
            text-align     : right;
            vertical-align : top;
            white-space    : nowrap;
        }
    }
</style>
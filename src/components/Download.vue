<template>
    <div>
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
                <p class="filename text-line">{{ filename }}</p>
                <p v-if="options.showStatusText" class="status text-line">{{ status }}</p>
                <p v-if="options.showProgressText" class="progress text-line">{{ progress }}</p>
            </div>

            <div class="tooltip" v-if="showTooltip">
                <p><strong>Filename:</strong> {{ filename }}</p>
                <p><strong>Url:</strong> {{ download.url }}</p>
                <p><strong>Referrer:</strong> {{ download.referrer || 'None' }}</p>
                <p><strong>Status:</strong> {{ status }}</p>
                <p><strong>Progress:</strong> {{ progress }}</p>
                <p><strong>MIME type:</strong> {{ download.mime || 'Unknown' }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import moment from 'moment';

    function formatFileSize(bytes: number) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        let i = Math.floor(Math.log(bytes) / Math.log(1024));

        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

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

                if (download.state === 'interrupted') {
                    return `Cancelled`
                }

                if (download.totalBytes === -1) {
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
                return formatFileSize(this.download.bytesReceived);
            },

            totalsize(): string {
                return formatFileSize(this.download.totalBytes);
            },

            filesize(): string {
                return formatFileSize(this.download.fileSize);
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
                    {
                        name: showTitle,
                        icon: 'folder-open',
                        clicked: () => {
                            this.$root.$emit('showDownload', this.download);
                            this.$root.$contextMenu.close();
                        },
                    },
                ];

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
    @import "../variables";

    .item {
        background: map-get($light-theme, "download");
        border-radius: 0;
        box-sizing: border-box;
        color: map-get($light-theme, "text");
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: 0.9em;
        justify-content: center;
        line-height: 1;
        margin: 5px 5px 0 5px;
        min-height: 30px;
        min-width: 200px;
        max-width: 300px;
        padding: 3px 6px;
        position: relative;

        * {
            z-index: 10;
            position: relative;
        }

        .progress-bar {
            background: map-get($light-theme, "progress");
            border-radius: 0;
            display: block;
            height: 100%;
            left: 0;
            margin: 0;
            padding: 0;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 0;
        }

        .text-line {
            background: transparent;
            display: block;
            height: auto;
            margin: 0;
            padding: 0;

            + .text-line {
                margin-top: 2px
            }
        }

        .filename {
            line-height: 16px;
            font-size: 14px;
            display: inline-block;
            text-overflow: ellipsis;
            overflow: hidden;
            direction: rtl;
            max-width: 100%;
        }

        .status, .progress {
            font-size: 12px
        }

        &.theme-dark {
            background: map-get($dark-theme, "download");
            color: map-get($dark-theme, "text");

            .progress-bar {
                background: map-get($dark-theme, "progress");
            }

            .tooltip {
                background: map-get($dark-theme, "background");
                border: 1px solid map-get($dark-theme, "border");
                color: map-get($dark-theme, "text");
            }
        }
    }

    .tooltip {
        background: map-get($light-theme, "background");
        border: 1px solid map-get($light-theme, "border");
        bottom: 100%;
        color: map-get($light-theme, "text");
        cursor: default;
        left: 0;
        line-height: 1.2;
        margin: 0;
        max-width: 500px;
        min-width: 100%;
        overflow: hidden;
        padding: 10px;
        pointer-events: none;
        position: absolute;

        p {
            margin: 0;
            overflow: hidden;
            padding: 0;
            text-overflow: ellipsis;
            word-break: normal;

            + p {
                margin-top: 5px;
            }
        }
    }
</style>
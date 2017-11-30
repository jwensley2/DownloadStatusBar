<template>
    <div class="item"
         @click="singleClick"
         @dblclick="doubleClick"
         @contextmenu.prevent="showContextMenu"
         :class="`theme-${theme}`"
    >
        <div class="progress-bar" :style="`width: ${percentDone}%`"></div>
        <div class="filename text-line">{{ filename }}</div>
        <div class="status text-line">{{ status }}</div>
        <div class="progress text-line">{{ progress }}</div>
    </div>
</template>

<script>
    import moment from 'moment';

    function formatFileSize(bytes) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        let i = Math.floor(Math.log(bytes) / Math.log(1024));

        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    export default {
        name: 'download',
        props: ['download', 'theme'],
        computed: {
            filename() {
                let m = this.download.filename.toString().match(/.*[\/\\](.+)/);

                if (m && m.length > 1) {
                    let name = m[m.length - 1];

                    return name.length > 30 ? '...' + name.substr(-30, 30) : name;
                }

                return '';
            },
            status() {
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

            progress() {
                let download = this.download;

                if (download.state === 'complete') {
                    return `${this.filesize}`;
                }

                if (download.totalBytes === -1) {
                    return `${this.downloaded} / Unknown`
                }

                return `${this.downloaded} / ${this.totalsize} - ${this.percentDone}%`;
            },

            downloaded() {
                return formatFileSize(this.download.bytesReceived);
            },

            totalsize() {
                return formatFileSize(this.download.totalBytes);
            },

            filesize() {
                return formatFileSize(this.download.fileSize);
            },

            percentDone() {
                if (this.download.state === 'complete') {
                    return 100;
                } else if (this.download.totalBytes < 0) {
                    return 0;
                }

                return ((this.download.bytesReceived / this.download.totalBytes) * 100).toFixed(2);
            }
        },

        methods: {
            singleClick() {
                this.$root.$contextMenu.close();
            },
            doubleClick() {
                this.$root.$emit('showDownload', this.download);
            },
            showContextMenu(event) {
                const OS = window.navigator.oscpu;
                const IN_PROGRESS = this.download.state === 'in_progress';
                const PAUSED = this.download.state === 'interrupted' && this.download.paused;

                let showTitle = OS.includes('Windows') ? 'Show in Explorer' :
                    OS.includes('Mac OS') ? 'Reveal in Finder' : 'Show in Folder';

                let items = [
                    {
                        name: 'Clear Download',
                        icon: 'eye-slash',
                        clicked: () => {
                            this.$root.$emit('clearDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    },
                    {
                        name: showTitle,
                        icon: 'folder-open',
                        clicked: () => {
                            this.$root.$emit('showDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    },
                ];

                // In progress or paused
                if (IN_PROGRESS || PAUSED) {
                    items.push({
                        name: 'Cancel Download',
                        icon: 'times',
                        clicked: () => {
                            this.$root.$emit('cancelDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    });
                }

                // Download in progress
                if (IN_PROGRESS) {
                    items.push({
                        name: 'Pause Download',
                        icon: 'pause',
                        clicked: () => {
                            this.$root.$emit('pauseDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    });
                }

                // Download is paused
                if (PAUSED) {
                    items.push({
                        name: 'Resume Download',
                        icon: 'play',
                        clicked: () => {
                            this.$root.$emit('resumeDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    });
                }

                if (this.download.state === 'complete') {
                    items.push({
                        name: 'Delete Download',
                        icon: 'trash-o',
                        clicked: () => {
                            this.$root.$emit('deleteDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    });
                }

                this.$root.$contextMenu.open(items, {x: event.clientX, y: event.clientY});
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "../variables";

    .item {
        background: map-get($light-theme, "download");
        border-radius: 0;
        box-sizing: border-box;
        color: map-get($light-theme, "text");
        cursor: pointer;
        display: inline-block;
        font-size: 0.9em;
        margin: 0 5px;
        overflow: hidden;
        padding: 3px 6px;
        position: relative;
        width: 250px;

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
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 0;
        }

        .text-line {
            padding: 0;
            display: block;
            margin: 0;
            background: transparent;

            + .text-line {
                margin-top: 2px
            }
        }

        .filename {
            font-size: 14px;
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
        }
    }
</style>
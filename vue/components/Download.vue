<template>
    <div class="item"
         @click="singleClick"
         @dblclick="doubleClick"
         @contextmenu.prevent="showContextMenu"
         :class="`theme-${theme}`"
    >
        <div class="progress" :style="`width: ${percentDone}%`"></div>
        <div>{{ filename }}</div>
        <div>{{ status }}</div>
        <div>{{ progress }}</div>
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
        name: "download",
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
                let finish = moment(download.estimatedEndTime);

                return moment.duration(finish.diff(now), 'ms').humanize();
            },

            progress() {
                let download = this.download;

                if (download.state === 'complete') {
                    return `${this.filesize}`;
                }

                if (download.totalBytes === -1) {
                    return `${this.downloaded}/Unknown`
                }

                return `${this.downloaded}/${this.totalsize} - ${this.percentDone}%`;
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
                const IN_PROGRESS = this.download.state === 'in_progress';
                const PAUSED = this.download.state === 'interrupted' && this.download.paused;

                let showTitle = window.navigator.oscpu.includes("Windows") ? 'Show in Explorer' : 'Reveal in Finder';

                let items = [
                    {
                        name: 'Clear Download',
                        clicked: () => {
                            this.$root.$emit('clearDownload', this.download);
                            this.$root.$contextMenu.close();
                        }
                    },
                    {
                        name: showTitle,
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
                        clicked: () => {
                            this.$root.$emit('resumeDownload', this.download);
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
    .item {
        position: relative;
        background: #AAA;
        display: inline-block;
        width: 250px;
        color: black;
        overflow: hidden;
        margin: 2.5px 5px;
        padding: 5px;
        font-size: 0.9em;
        border-radius: 5px;
        box-sizing: border-box;
        cursor: pointer;

        * {
            z-index: 10;
            position: relative;
        }

        .progress {
            width: 100%;
            height: 100%;
            background: green;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            display: block;
            border-radius: 0;
        }

        &.theme-dark {
            background: #777;
            color: #EEE;

            .progress {
                background: #222;
            }
        }
    }
</style>
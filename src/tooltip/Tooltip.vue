<template>
    <div id="DownloadStatusBarTooltip" class="tooltip" v-if="tooltipShown" :class="`theme-${theme}`" :style="{left: left}" :ref="'tooltip'">
        <table>
            <tr>
                <th class="field-name">Filename:</th>
                <td>{{ filename }}</td>
            </tr>
            <tr>
                <th class="field-name">Url:</th>
                <td>{{ download.downloadItem.url }}</td>
            </tr>
            <tr>
                <th class="field-name">Referrer:</th>
                <td>{{ download.downloadItem.referrer || 'None' }}</td>
            </tr>
            <tr>
                <th class="field-name">Status:</th>
                <td>{{ status }}</td>
            </tr>
            <tr v-if="download.state !== 'complete'">
                <th class="field-name">Progress:</th>
                <td>{{ progress }}</td>
            </tr>
            <tr v-else>
                <th class="field-name">Filesize:</th>
                <td>{{ filesize }}</td>
            </tr>
            <tr>
                <th class="field-name">MIME type:</th>
                <td>{{ download.downloadItem.mime || 'Unknown' }}</td>
            </tr>
            <tr v-if="isImage">
                <th class="field-name">Preview:</th>
                <td><img class="preview" :src="download.downloadItem.url"></td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import events from './events';
    import * as helpers from '../helpers';
    import {DSBDownload} from '../DSBDownload';

    export default Vue.extend({
        name: 'tooltip',
        props: ['theme'],
        data(): {
            download: DSBDownload | null,
            element: HTMLElement | null,
            tooltipShown: boolean,
            left: string,
        } {
            return {
                download: null,
                element: null,
                tooltipShown: false,
                left: '0',
            }
        },
        computed: {
            filename(): string {
                return this.download!.downloadItem.filename;
            },
            status(): string {
                return this.download!.status();
            },

            progress(): string {
                return this.download!.progress();
            },

            downloaded(): string {
                return helpers.formatFileSize(this.download!.downloadItem.bytesReceived);
            },

            totalsize(): string {
                return helpers.formatFileSize(this.download!.downloadItem.totalBytes);
            },

            filesize(): string {
                return helpers.formatFileSize(this.download!.downloadItem.fileSize);
            },

            percentDone(): string {
                return this.download!.percentDownloaded();
            },

            isImage(): boolean {
                if (!this.download) {
                    return false;
                }

                return this.download.isImage();
            },
        },

        methods: {
            calculateLeftPosition(): string {
                if (this.element) {
                    let downloadOffset = this.element.offsetLeft;

                    if (downloadOffset + this.$el.offsetWidth > window.innerWidth) {
                        return `${window.innerWidth - this.$el.offsetWidth}px`;
                    } else {
                        return `${downloadOffset}px`;
                    }
                }

                return '0';
            },
        },

        updated() {
            this.left = this.calculateLeftPosition();
        },

        mounted() {
            events.$on('showTooltip', (download: DSBDownload, element: HTMLElement) => {
                this.tooltipShown = true;
                this.download = download;
                this.element = element;
            });

            events.$on('hideTooltip', () => {
                this.tooltipShown = false;
            });
        },
    });
</script>

<style lang="scss" scoped>
    @import "../scss/variables";
    @import "../scss/mixins";

    #DownloadStatusBarTooltip {
        @include reset;
        background : light-theme("background");
        border     : 1px solid light-theme("border");
        bottom     : 100%;
        color      : light-theme("text");
        cursor     : default;
        left       : 0;
        margin     : 0;
        max-width  : 100%;
        min-width  : 300px;
        overflow   : hidden;
        padding    : 10px;
        position   : absolute;
        width      : auto;
        z-index    : 10;

        table {
            @include reset;
            max-width : 100%;
        }

        tr {
            @include reset;

            + tr {
                td, th { padding-top : 5px }
            }
        }

        td, th {
            @include reset;
            background      : light-theme("background");
            border-collapse : collapse;
            line-height     : 1.2;
        }

        td {
            overflow      : hidden;
            padding-left  : 5px;
            text-overflow : ellipsis;
            word-break    : break-all;
        }

        th {
            font-weight    : bold;
            text-align     : right !important;
            vertical-align : top;
            white-space    : nowrap;
        }

        .preview {
            max-width  : 300px;
            max-height : 200px;
            width      : auto;
            height     : auto;
        }

        &.theme-dark {
            background : dark-theme("background");
            border     : 1px solid dark-theme("border");
            color      : dark-theme("text");

            th, td {
                background : dark-theme("background");
                color      : dark-theme("text");
            }
        }
    }
</style>
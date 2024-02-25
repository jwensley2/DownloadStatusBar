<template>
    <div id="DownloadStatusBarTooltip" class="dsb-tooltip" v-if="tooltipShown" :style="{left: left}"
         @mouseleave="hideTooltip"
         :ref="'tooltip'">
        <table class="dsb-tooltip-table">
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipFilenameHeading') }}:</th>
                <td class="dsb-tooltip-cell">
                    <input class="dsb-tooltip-url" type="url" :value="filename" readonly>
                    <copy-button class="dsb-tooltip-copy-button" :value="filename"></copy-button>
                </td>
            </tr>
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipUrlHeading') }}:</th>
                <td class="dsb-tooltip-cell">
                    <input class="dsb-tooltip-url" type="url" :value="download.downloadItem.url" readonly>
                    <copy-button class="dsb-tooltip-copy-button" :value="download.downloadItem.url"></copy-button>
                </td>
            </tr>
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipReferrerHeading') }}:</th>
                <td class="dsb-tooltip-cell">
                    <template v-if="download.downloadItem.referrer">
                        <input class="dsb-tooltip-url" type="url" :value="download.downloadItem.referrer" readonly>
                        <copy-button class="dsb-tooltip-copy-button" :value="download.downloadItem.referrer"></copy-button>
                    </template>
                    <span v-else>{{ l('tooltipReferrerNone') }}</span>
                </td>
            </tr>
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipSpeedHeading') }}:</th>
                <td class="dsb-tooltip-cell">{{ downloadSpeed }}</td>
            </tr>
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipStatusHeading') }}:</th>
                <td class="dsb-tooltip-cell">{{ status }}</td>
            </tr>
            <tr v-if="download.downloadItem.state !== 'complete'">
                <th class="dsb-tooltip-heading">{{ l('tooltipProgressHeading') }}:</th>
                <td class="dsb-tooltip-cell">{{ progress }}</td>
            </tr>
            <tr v-else>
                <th class="dsb-tooltip-heading">{{ l('tooltipFilesizeHeading') }}:</th>
                <td class="dsb-tooltip-cell">{{ filesize }}</td>
            </tr>
            <tr class="dsb-tooltip-table-row">
                <th class="dsb-tooltip-heading">{{ l('tooltipMimeHeading') }}:</th>
                <td class="dsb-tooltip-cell">{{ download.downloadItem.mime || l('tooltipMimeUnknown') }}</td>
            </tr>
            <tr v-if="isImage">
                <th class="dsb-tooltip-heading">{{ l('tooltipPreviewHeading') }}:</th>
                <td class="dsb-tooltip-cell"><img class="dsb-preview" :src="download.downloadItem.url"></td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import events from './events';
import * as helpers from '../helpers';
import CopyButton from '../components/CopyButton.vue';
import {useDownloadsStore} from '../stores/downloads';

export default defineComponent({
    components: {
        CopyButton
    },

    props: {
        theme: String
    },

    setup() {
        const store = useDownloadsStore();

        let downloadId: number | null = null;
        let element: HTMLElement | null = null;
        let tooltipShown = ref(false);
        let left = '0';

        const download = computed(() => {
            if (!downloadId) {
                return;
            }

            return store.downloadForId(downloadId);
        });

        return {
            tooltipShown: tooltipShown,
            download: download,

            filename(): string {
                return download.value!.downloadItem.filename;
            },

            status(): string {
                return download.value!.status();
            },

            progress(): string {
                return download.value!.progress();
            },

            downloaded(): string {
                return helpers.formatFileSize(download.value!.downloadItem.bytesReceived);
            },

            totalsize(): string {
                return helpers.formatFileSize(download.value!.downloadItem.totalBytes);
            },

            filesize(): string {
                return helpers.formatFileSize(download.value!.downloadItem.fileSize);
            },

            percentDone(): number {
                return download.value!.percentDownloaded();
            },

            isImage(): boolean {
                if (!download.value) {
                    return false;
                }

                return download.value.isImage();
            },

            downloadSpeed(): string {
                if (!download.value) {
                    return helpers.localize('downloadSpeedUnknown');
                }

                return `${helpers.formatFileSize(download.value.calculateDownloadSpeed())}/s`;
            },

            l(messageName: string, substitutions?: string | string[]): string {
                return helpers.localize(messageName, substitutions);
            },

            onUpdated() {
                const calculateLeftPosition = (): string => {
                    if (element) {
                        const downloadOffset = element.offsetLeft;

                        if (downloadOffset + element.offsetWidth > window.innerWidth) {
                            return `${window.innerWidth - element.offsetWidth}px`;
                        } else {
                            return `${downloadOffset}px`;
                        }
                    }

                    return '0';
                };

                left = calculateLeftPosition();
            },

            onMounted() {
                console.log('onMounted');

                events.on('showTooltip', (e) => {
                    console.log('showTooltip', e);

                    tooltipShown.value = true;
                    downloadId = e.id;
                    element = e.element;
                });

                events.on('hideTooltip', () => {
                    tooltipShown.value = false;
                });
            }
        }
    }
});
</script>

<style lang="scss">
@import "../scss/variables";
@import "../scss/mixins";

#DownloadStatusBarTooltip {
  background : var(--background);
  border     : 1px solid var(--border);
  bottom     : 100%;
  color      : var(--text);
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

  .dsb-tooltip-table {
    border    : 0;
    max-width : 100%;
  }

  .dsb-tooltip-table-row {
    + .dsb-tooltip-table-row {
      .dsb-tooltip-heading, .dsb-tooltip-cell { padding-top : 5px }
    }
  }

  .dsb-tooltip-heading, .dsb-tooltip-cell {
    background      : var(--background);
    border-collapse : collapse;
    color           : var(--text);
    font-size       : 14px;
    line-height     : 1.2;
  }

  .dsb-tooltip-cell {
    overflow      : hidden;
    padding-left  : 5px;
    text-align    : left;
    text-overflow : ellipsis;
    word-break    : break-all;
    display       : flex;
  }

  .dsb-tooltip-heading {
    font-weight    : bold;
    text-align     : right;
    vertical-align : top;
    white-space    : nowrap;
  }

  .dsb-tooltip-url {
    background  : rgba(0, 0, 0, 0.2);
    border      : 1px solid var(--border);
    color       : var(--text);
    line-height : 1;
    max-width   : 500px;
    min-width   : 250px;
    padding     : 5px 5px;
    width       : 100%;
  }

  .dsb-preview {
    height     : auto;
    max-height : 200px;
    max-width  : 300px;
    width      : auto;
  }

  .dsb-tooltip-copy-button {
    margin-left : 2px;
  }
}
</style>
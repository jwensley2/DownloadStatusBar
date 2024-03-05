<template>
    <div v-if="tooltipShown && download"
         id="DownloadStatusBarTooltip"
         class="dsb-tooltip"
         :style="{left: left}"
         @mouseleave="events.emit('hideTooltip')"
         ref="tooltip"
    >
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
import {computed, defineComponent, onMounted, ref, Ref} from 'vue';
import events from '@/tooltip/events';
import * as helpers from '@/helpers';
import CopyButton from '@/components/CopyButton.vue';
import {useDownloadsStore} from '@/stores/downloads';

export default defineComponent({
    components: {
        CopyButton
    },

    props: {
        theme: String
    },

    setup() {
        const store = useDownloadsStore();

        const tooltip: Ref<HTMLElement | undefined> = ref();
        const element: Ref<HTMLElement | undefined> = ref();
        const downloadId = ref();
        const tooltipShown = ref(false);

        const download = computed(() => {
            if (!downloadId) {
                return;
            }

            return store.downloadForId(downloadId.value);
        });

        onMounted(() => {
            events.on('showTooltip', (e) => {
                tooltipShown.value = true;
                downloadId.value = e.id;
                element.value = e.element;
            });

            events.on('hideTooltip', () => {
                tooltipShown.value = false;
            });
        });

        return {
            tooltip,
            tooltipShown,
            download,
            events,

            left: computed((): string => {
                const download = element.value;
                const parent = download?.parentElement;
                const tooltipWidth = tooltip.value?.offsetWidth ?? 0;

                let left = (download?.offsetLeft ?? 0) - (parent?.scrollLeft ?? 0);

                // If the tooltip will go outside the window adjust the position to keep it inside
                if ((left + tooltipWidth) > window.innerWidth) {
                    left = window.innerWidth - tooltipWidth;
                }

                return `${left}px`;
            }),

            filename: computed((): string => {
                return download.value!.downloadItem.filename;
            }),

            status: computed((): string => {
                return download.value!.status();
            }),

            progress: computed((): string => {
                return download.value!.progress();
            }),

            downloaded: computed((): string => {
                return helpers.formatFileSize(download.value!.downloadItem.bytesReceived);
            }),

            totalsize: computed((): string => {
                return helpers.formatFileSize(download.value!.downloadItem.totalBytes);
            }),

            filesize: computed((): string => {
                return helpers.formatFileSize(download.value!.downloadItem.fileSize);
            }),

            percentDone: computed((): number => {
                return download.value!.percentDownloaded();
            }),

            isImage: computed((): boolean => {
                if (!download.value) {
                    return false;
                }

                return download.value.isImage();
            }),

            downloadSpeed: computed((): string => {
                if (!download.value) {
                    return helpers.localize('downloadSpeedUnknown');
                }

                return `${helpers.formatFileSize(download.value.calculateDownloadSpeed())}/s`;
            }),

            l(messageName: string, substitutions?: string | string[]): string {
                return helpers.localize(messageName, substitutions);
            },
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
<template>
    <div class="dsb-item"
         @click="singleClick"
         @dblclick="doubleClick"
         @mouseover="showTooltip(downloadRef, download.downloadItem.id)"
         @mouseleave="hideTooltip($event)"
         @contextmenu.prevent="showContextMenu"
         ref="downloadRef"
         :class="[progressClass]"
    >
        <div v-if="isInProgress" class="dsb-progress-bar" :style="`width: ${percentDone}%`"></div>

        <div class="dsb-text-container">
            <div class="dsb-filename">{{ filename }}</div>
            <div class="dsb-download-info" v-if="!download.isCancelled() && options.showInfoText">
                <div class="dsb-progress">{{ progress }}</div>
                <div class="dsb-speed" v-if="isInProgress && !download.downloadItem.paused">{{ downloadSpeed }}</div>
                <div class="dsb-percent" v-else>{{ percentDone }}%</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, inject, PropType, Ref, ref} from 'vue';
import {localize} from '@/helpers/localize';
import {DSBDownload} from '@/DSBDownload';
import {ContextMenuItem} from '@/context-menu/types';
import events from '@/events';
import {SyncOptions} from '@/config/options';
import {formatFileSize} from '@/helpers/formatFileSize';

export default defineComponent({
    props: {
        download: {
            type: DSBDownload,
            required: true,
        },
        options: {
            type: Object as PropType<SyncOptions>,
            required: true,
        },
    },

    setup(props) {
        const closeContextMenu = inject('closeContextMenu') as Function;
        const openContextMenu = inject('openContextMenu') as Function;
        const showTooltip = inject('showTooltip') as Function;
        const hideTooltip = inject('hideTooltip') as Function;
        const rootElement = inject('rootElement') as HTMLElement;
        const downloadRef = ref();

        return {
            downloadRef,
            get filename(): string {
                return props.download.filename();
            },

            get status(): string {
                return props.download.status();
            },

            get progress(): string {
                const downloadItem = props.download.downloadItem;
                const downloaded = formatFileSize(downloadItem.bytesReceived);

                if (downloadItem.state === 'complete') {
                    return `${formatFileSize(downloadItem.fileSize)}`;
                }

                return `${downloaded}`;
            },

            get percentDone(): string {
                return props.download.percentDownloaded().toString();
            },

            get isInProgress(): boolean {
                return props.download.downloadItem.state === 'in_progress' || props.download.downloadItem.paused;
            },

            get progressClass() {
                if (props.download.downloadItem.state === 'complete') {
                    return 'dsb-complete';
                }

                if (props.download.isCancelled()) {
                    return 'dsb-cancelled';
                }

                if (props.download.downloadItem.error && !props.download.downloadItem.paused) {
                    return 'dsb-error';
                }

                return 'dsb-in-progress';
            },

            get downloadSpeed(): string {
                if (!props.download) {
                    return '';
                }

                return `${formatFileSize(props.download.calculateDownloadSpeed(), true)}/s`;
            },

            showTooltip(download: Ref, id: number) {
                showTooltip(download, id);
            },

            hideTooltip(event: MouseEvent) {
                let tooltip = rootElement.querySelectorAll('#DownloadStatusBarTooltip')[0];

                if (event.relatedTarget && tooltip) {
                    let target = event.relatedTarget ! as HTMLElement;

                    if (target.isEqualNode(tooltip)) {
                        return;
                    }
                }

                hideTooltip();
            },

            singleClick() {
                closeContextMenu();
            },

            doubleClick() {
                events.emit('openDownload', props.download);
            },

            showContextMenu(event: MouseEvent) {
                const userAgent = window.navigator.userAgent;
                const inProgress = props.download.downloadItem.state === 'in_progress';
                const paused = props.download.downloadItem.state === 'interrupted' && props.download.downloadItem.paused;

                let showTitle = userAgent.includes('Windows') ?
                    localize('tooltipShowInExplorer') :
                    (userAgent.includes('Mac') ?
                            localize('tooltipRevealInFinder') :
                            localize('tooltipShowInFolder')
                    );

                let items: [ContextMenuItem] = [
                    {
                        name: localize('tooltipClearDownload'),
                        icon: 'eye-slash',
                        clicked: () => {
                            events.emit('clearDownload', props.download);
                            closeContextMenu();
                        },
                    },
                ];

                if (!props.download.downloadItem.error) {
                    items.push({
                        name: showTitle,
                        icon: 'folder-open',
                        clicked: () => {
                            events.emit('showDownload', props.download);
                            closeContextMenu();
                        },
                    });
                }

                // In progress or paused
                if (inProgress || paused) {
                    items.push({
                        name: localize('tooltipCancelDownload'),
                        icon: 'times',
                        clicked: () => {
                            events.emit('cancelDownload', props.download);
                            closeContextMenu();
                        },
                    });
                }

                // Download in progress
                if (inProgress) {
                    items.push({
                        name: localize('tooltipPauseDownload'),
                        icon: 'pause',
                        clicked: () => {
                            events.emit('pauseDownload', props.download);
                            closeContextMenu();
                        },
                    });
                }

                // Download is paused
                if (paused) {
                    items.push({
                        name: localize('tooltipResumeDownload'),
                        icon: 'play',
                        clicked: () => {
                            events.emit('resumeDownload', props.download);
                            closeContextMenu();
                        },
                    });
                }

                if (props.download.downloadItem.state === 'complete') {
                    items.push({
                        name: localize('tooltipDeleteDownload'),
                        icon: 'trash-o',
                        clicked: () => {
                            events.emit('deleteDownload', props.download);
                            closeContextMenu();
                        },
                    });
                }

                openContextMenu(items, {x: event.clientX, y: event.clientY});
            },
        };
    },
});
</script>

<style lang="scss">
@import "../scss/variables";
@import "../scss/mixins";

.dsb-item {
  background      : var(--download);
  border-radius   : 0;
  box-sizing      : border-box;
  color           : var(--text);
  cursor          : pointer;
  display         : flex;
  flex            : 1 1 auto;
  flex-direction  : column;
  font            : 400 normal 1em/1em Arial, sans-serif;
  justify-content : center;
  letter-spacing  : normal;
  margin          : 5px 5px 0 5px;
  min-width       : 15ch;
  min-height      : 10px;
  overflow        : hidden;
  padding         : 0.25em 0.5em;
  position        : relative;
  text-shadow     : none;
  width           : auto;

  * {
    position : relative;
    z-index  : 10;
  }

  &.dsb-complete {
    background : var(--complete);
  }

  &.dsb-error {
    background : var(--error);
  }
}

.dsb-progress-bar {
  background    : var(--progress);
  border-radius : 0;
  display       : block;
  height        : 100%;
  left          : 0;
  position      : absolute;
  top           : 0;
  width         : 100%;
  z-index       : 0;
}

.dsb-text-container {
  display        : flex;
  flex-direction : row;
  align-items    : center;
  height         : 100%;
}

.dsb-text-line {
  background     : transparent;
  box-sizing     : content-box;
  color          : var(--text);
  display        : block;
  white-space    : nowrap;
  height         : auto;
  letter-spacing : normal;
  margin         : 0;
  padding        : 0;
  text-align     : right;
  position       : relative;

  + .dsb-text-line {
    margin-top : 0.3em
  }
}

.dsb-filename {
  @extend .dsb-text-line;
  text-align  : left;
  flex        : 2 1 auto;
  overflow-x  : hidden;
  white-space : nowrap;
  font-size   : 0.9em;
  line-height : 0.9em;
  padding     : 0.2em 0;
  min-width   : 10ch;
  max-width   : 30ch;
}

.dsb-download-info {
  max-height : 100%;
  min-width  : min-content;
  margin     : 0 0 0 10px;
  flex       : 1 0 auto;
}

.dsb-progress, .dsb-speed, .dsb-percent {
  @extend .dsb-text-line;
  font-family : monospace;
  font-size   : 0.7em;
  line-height : 0.7em;
}
</style>
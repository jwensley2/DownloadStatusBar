<template>
    <div id="DownloadStatusBar"
         v-if="downloads.length > 0 || syncOptions.alwaysShow"
         :class="[{'dsb-minimized': syncOptions.minimized}]"
         @mouseleave="hideContextMenu"
         ref="element"
    >
        <button class="dsb-clear-downloads-left" v-if="!syncOptions.minimized && syncOptions.clearPosition === 'left'" @click="events.emit('clearDownloads')">
            {{ l('barClearButton') }}
        </button>

        <div class="dsb-downloads" v-if="!syncOptions.minimized">
            <download v-for="download in downloads"
                      :key="download.id"
                      :download="download"
                      :options="syncOptions"></download>
        </div>

        <context-menu></context-menu>
        <tooltip :theme="syncOptions.theme"></tooltip>

        <div class="dsb-right-buttons">
            <button class="dsb-clear-downloads-right" v-if="!syncOptions.minimized && syncOptions.clearPosition === 'right'" @click="events.emit('clearDownloads')">
                {{ l('barClearButton') }}
            </button>
            <button class="dsb-open-options" v-if="!syncOptions.minimized" @click="openOptions">Options<span class="icon-gear"></span></button>
            <button class="dsb-minimize" @click="minimize">
                <span :class="!syncOptions.minimized ? 'icon-angle-right' : 'icon-angle-left'"></span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, onMounted, onUpdated, ref, watch} from 'vue';
import {localize} from '@/helpers/localize';
import {useDownloadsStore} from '@/stores/downloads';
import {useSyncOptionsStore} from '@/stores/syncOptions';
import events from '@/events';
import Download from '@/components/Download.vue';
import Tooltip from '@/tooltip/Tooltip.vue';

export default defineComponent({
    components: {
        Download,
        Tooltip,
    },
    setup() {
        const store = useDownloadsStore();
        const syncOptionsStore = useSyncOptionsStore();
        const closeContextMenu = inject('closeContextMenu') as Function;
        const syncOptions = syncOptionsStore.options;
        const defaultBottomMargin = ref(0);
        const element = ref();

        const downloads = computed(() => {
            return store.downloads;
        });

        const setBodyMargin = () => {
            const body = document.getElementsByTagName('body')[0] as HTMLElement;
            const downloadStatusBar = element.value as HTMLElement;

            if (downloadStatusBar && downloads.value.length > 0 && downloadStatusBar.offsetHeight > defaultBottomMargin.value) {
                body.style.marginBottom = `${downloadStatusBar.offsetHeight}px`;
            } else {
                body.style.marginBottom = `${defaultBottomMargin.value}px`;
            }
        };

        watch(downloads, () => {
            setBodyMargin();
        })

        onMounted(() => {
            const body = document.getElementsByTagName('body')[0] as HTMLElement;
            if (window.getComputedStyle(body).marginBottom) {
                defaultBottomMargin.value = parseInt(window.getComputedStyle(body).marginBottom!);
            }

            setBodyMargin();
        });

        onUpdated(() => {
            setBodyMargin();
        });

        return {
            element,
            downloads,
            syncOptions,
            defaultBottomMargin,
            setBodyMargin,
            events,

            l(messageName: string, substitutions?: string | string[]): string {
                return localize(messageName, substitutions);
            },

            hideContextMenu() {
                closeContextMenu();
            },

            openOptions() {
                events.emit('openOptions');
            },

            minimize() {
                syncOptions.minimized = !syncOptions.minimized;
                syncOptionsStore.save();
            },
        }
    },
});
</script>

<style lang="scss" scoped>
@import "../scss/variables";
@import "../scss/mixins";
@import "../../icomoon/style";

#DownloadStatusBar {
  -moz-osx-font-smoothing : grayscale;
  background              : var(--background);
  border-top              : 1px solid var(--border);
  bottom                  : 0;
  box-sizing              : content-box;
  color                   : var(--text);
  display                 : flex;
  flex-direction          : row;
  font                    : normal 400 var(--font-size)/var(--font-size) Arial, sans-serif;
  left                    : 0;
  letter-spacing          : normal;
  line-height             : 1;
  min-height              : 15px;
  padding                 : 0;
  position                : fixed;
  text-align              : left;
  width                   : 100%;
  z-index                 : 9999999;

  > * {
    height         : auto;
    vertical-align : middle
  }

  &.dsb-minimized {
    border-left : 1px solid var(--border);
    left        : auto;
    overflow    : hidden;
    right       : 0;
    width       : auto;
  }
}

.dsb-right-buttons {
  display     : flex;
  margin-left : auto;
}

.dsb-bar-button {
  box-shadow  : none;
  box-sizing  : border-box;
  cursor      : pointer;
  height      : auto;
  line-height : 1;
  min-height  : 0;
  min-width   : 0;
  width       : auto;
}

.dsb-clear-downloads {
  @extend .dsb-bar-button;
  background  : var(--button);
  border      : 0 solid var(--buttonBorder);
  color       : var(--text) !important;
  display     : inline-block;
  font        : normal 600 1em/1em Arial, sans-serif;
  height      : auto;
  padding     : 0 15px;
  flex-shrink : 0;

  &:hover {
    background : var(--buttonHover);
  }
}

.dsb-clear-downloads-left {
  @extend .dsb-clear-downloads;
  margin             : 0 5px 0 0;
  border-right-width : 1px;
}

.dsb-clear-downloads-right {
  @extend .dsb-clear-downloads;
  margin       : 0 5px;
  position     : relative;
  right        : 0;
  border-width : 0 1px;
}

.dsb-icon-button {
  @extend .dsb-bar-button;
  background  : none;
  border      : 0;
  margin      : 0;
  overflow    : hidden;
  padding     : 0;
  position    : relative;
  text-indent : -999px;
  width       : auto;
  font-size   : 0;
  display     : flex;
  align-items : center;

  [class^="icon-"] {
    color       : var(--text);
    display     : block;
    font-size   : calc(var(--font-size) * 1.25);
    height      : auto;
    margin      : 5px 10px;
    line-height : 100%;
    text-indent : 0;
    width       : auto;
  }
}

.dsb-open-options {
  @extend .dsb-icon-button;
  margin-left : auto;
  flex        : none;
}

.dsb-minimize {
  @extend .dsb-icon-button;
}

.dsb-downloads {
  display         : flex;
  flex            : 0 1 auto;
  flex-direction  : row;
  flex-wrap       : nowrap;
  margin          : -5px 0 0 0;
  overflow        : auto hidden;
  scrollbar-width : thin;
}

@media print {
  #DownloadStatusBar { display : none }
}
</style>
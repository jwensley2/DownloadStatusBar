<template>
    <div id="DownloadStatusBar"
         v-if="downloads.length > 0 || syncOptions.alwaysShow"
         :class="[{'dsb-minimized': syncOptions.minimized}]"
         @mouseleave="hideContextMenu"
         ref="element"
    >
        <button class="dsb-clear-downloads" v-if="!syncOptions.minimized" @click="events.emit('clearDownloads')">
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

        <button class="dsb-open-options" v-if="!syncOptions.minimized" @click="openOptions">Options<span class="icon-gear"></span></button>
        <button class="dsb-minimize" @click="minimize">
            <span :class="!syncOptions.minimized ? 'icon-angle-right' : 'icon-angle-left'"></span>
        </button>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, inject, onMounted, onUpdated, ref, watch} from 'vue';
import * as helpers from '@/helpers';
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
                return helpers.localize(messageName, substitutions);
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
  min-height              : 25px;
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
  background         : var(--button);
  border             : 0 solid var(--buttonBorder);
  border-right-width : 1px;
  color              : var(--text) !important;
  display            : inline-block;
  font               : normal 600 1em/1em Arial, sans-serif;
  height             : auto;
  margin             : 0 5px 0 0;
  padding            : 0 15px;
  flex-shrink        : 0;

  &:hover {
    background : var(--buttonHover);
  }
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
  width       : 30px;

  [class^="icon-"] {
    color       : var(--text);
    display     : block;
    font-size   : 20px;
    height      : 100%;
    left        : 0;
    line-height : 100%;
    margin-top  : -10px;
    position    : absolute;
    right       : 0;
    text-indent : 0;
    top         : 50%;
    width       : 100%;
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
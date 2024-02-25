<template>
    <div v-if="isOpen">
        <ul id="DownloadStatusBarContextMenu" :style="{left: left(), bottom: bottom()}">
            <li v-for="item in items" @click="item.clicked">
                <i :class="`icon-${item.icon}`" aria-hidden="true" v-if="item.icon"></i>
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import {defineComponent, Ref, ref} from 'vue';
import events from './events';
import {ContextMenuItem, ContextMenuPosition} from './types';

export default defineComponent({
    props: {theme: String},

    setup() {
        const isOpen = ref(false);
        const position: Ref<ContextMenuPosition | null> = ref(null);
        const items: Ref<Array<ContextMenuItem>> = ref([]);

        return {
            isOpen: isOpen,
            items: items,
            position: position,

            left() {
                if (position.value) {
                    return `${position.value.x}px`;
                }

                return 0;
            },

            bottom() {
                if (position.value) {
                    return `${window.innerHeight - position.value.y}px`;
                }

                return 0;
            },

            onMounted() {
                events.on('openMenu', (e) => {
                    isOpen.value = true;
                    items.value = e.items;
                    position.value = e.position;
                });

                events.on('closeMenu', () => {
                    isOpen.value = false;
                    items.value = [];
                });
            }
        }
    }
});
</script>

<style lang="scss" scoped>
@import "../scss/variables";
@import "../../icomoon/style";

#DownloadStatusBarContextMenu {
  font       : 400 normal 14px/1 Arial, sans-serif;
  position   : absolute;
  bottom     : 0;
  left       : 0;
  right      : auto;
  top        : auto;
  background : var(--background);
  border     : 1px solid #AAA;
  z-index    : 100;
  list-style : none;
  padding    : 0;
  margin     : 0;
  display    : block;
  color      : var(--text);

  li {
    cursor  : pointer;
    padding : 10px;
    margin  : 0;

    &:hover {
      background : var(--backgroundHover);
    }

    + li {
      border-top : 1px dotted #CCC;
    }
  }
}
</style>
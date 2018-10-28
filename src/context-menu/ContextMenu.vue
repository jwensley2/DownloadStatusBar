<template>
    <div v-if="isOpen">
        <ul id="DownloadStatusBarContextMenu"
            :style="{left: left, bottom: bottom}"
        >
            <li v-for="item in items" @click="item.clicked">
                <i :class="`icon-${item.icon}`" aria-hidden="true" v-if="item.icon"></i>
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import events from './events';

    export type ContextMenuItem = { name: string, icon: string, clicked: () => void };
    type ContextMenuPosition = { x: number, y: number };

    @Component({})
    export default class ContextMenu extends Vue {
        @Prop({})
        theme: String;

        isOpen = false;
        items: Array<ContextMenuItem> = [];
        position: ContextMenuPosition | null = null;

        get left() {
            if (this.position) {
                return `${this.position.x}px`;
            }

            return 0;
        }

        get bottom() {
            if (this.position) {
                return `${window.innerHeight - this.position.y}px`;
            }

            return 0;
        }

        mounted() {
            events.$on('openMenu', (items: [ContextMenuItem], position: ContextMenuPosition) => {
                this.isOpen = true;
                this.items = items;
                this.position = position;
            });

            events.$on('closeMenu', () => {
                this.isOpen = false;
                this.items = [];
            });
        }
    }
</script>

<style lang="scss" scoped>
    $icomoon-font-path : "moz-extension://__MSG_@@extension_id__/fonts";
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
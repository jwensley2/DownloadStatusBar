<template>
    <div v-if="isOpen">
        <ul id="DownloadStatusBarContextMenu"
            :style="{left: left, bottom: bottom}"
            :class="`theme-${theme}`"
        >
            <li v-for="item in items" @click="item.clicked">{{ item.name }}</li>
        </ul>
    </div>
</template>

<script>
    const events = require('./events').default;

    module.exports = {
        name: "context-menu",
        props: ['theme'],
        data: function () {
            return {
                isOpen: false,
                items: [],
                position: null
            }
        },
        computed: {
            left: function () {
                if (this.position) {
                    return `${this.position.x}px`;
                }

                return 0;
            },
            bottom: function () {
                if (this.position) {
                    return `${window.innerHeight - this.position.y}px`;
                }

                return 0;
            }
        },

        mounted() {
            events.$on("openMenu", (items, position) => {
                this.isOpen = true;
                this.items = items;
                this.position = position;
            });

            events.$on("closeMenu", () => {
                this.isOpen = false;
                this.items = [];
            });
        }
    }
</script>

<style lang="scss" scoped>
    #DownloadStatusBarContextMenu {
        font: 400 normal 14px/1 Arial, sans-serif;
        position: absolute;
        bottom: 0;
        left: 0;
        right: auto;
        top: auto;
        background: #FFF;
        border: 1px solid #AAA;
        z-index: 100;
        list-style: none;
        padding: 0;
        margin: 0;
        display: block;
        color: black;

        li {
            cursor: pointer;
            padding: 10px;
            margin: 0;

            &:hover {
                background: #CCC;
            }

            + li {
                border-top: 1px dotted #CCC;
            }
        }

        &.theme-dark {
            background: #333;
            color: #EEE;

            li:hover {
                background: #666;
            }
        }
    }
</style>
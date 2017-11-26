<template>
    <div v-if="isOpen">
        <ul id="DownloadStatusBarContextMenu" :style="{left: left, bottom: bottom}">
            <li v-for="item in items" @click="item.clicked">{{ item.name }}</li>
        </ul>
    </div>
</template>

<script>
    const events = require('./events').default;

    module.exports = {
        name: "context-menu",
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
                    return this.position.x;
                }

                return 0;
            },
            bottom: function () {
                if (this.position) {
                    return window.innerHeight - this.position.y;
                }

                return 0;
            }
        },

        mounted() {
            events.$on("openMenu", (items, position) => {
                this.isOpen = true;
                this.items = items;
                this.position = position;

                console.log(this.position.x, this.position.y);
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
        border: 1px solid #AAAAAA;
        z-index: 100;
        list-style: none;
        padding: 0;
        margin: 0;

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
    }
</style>
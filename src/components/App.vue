<template>
    <div id="DownloadStatusBarContainer" :class="`theme-${theme}`" @mouseleave="hideContextMenu">
        <download-status-bar :downloads="downloads" :theme="theme"></download-status-bar>
        <context-menu :theme="theme"></context-menu>
    </div>
</template>

<script>
    import DownloadStatusBarComponent from './DownloadStatusBar.vue';

    export default {
        name: 'app',

        components: {
            'download-status-bar': DownloadStatusBarComponent,
        },

        props: {
            theme: String,
            downloads: {
                type: Array,
                default: () => {
                    return []
                },
            }
        },

        methods: {
            hideContextMenu() {
                this.$contextMenu.close();
            },
        }
    }

</script>

<style scoped lang="scss">
    #DownloadStatusBarContainer {
        position: fixed;
        bottom: 0;
        background: #CCC;
        line-height: 1;
        width: 100%;
        z-index: 100000;
        left: 0;

        &.theme-dark {
            background: #333;
        }
    }
</style>
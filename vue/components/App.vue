<template>
    <div id="DownloadStatusBarContainer" @mouseleave="hideContextMenu">
        <download-status-bar :downloads="downloads"
        ></download-status-bar>
        <context-menu></context-menu>
    </div>
</template>

<script>
    import DownloadStatusBarComponent from './DownloadStatusBar.vue';

    export default {
        name: "app",

        components: {
            'download-status-bar': DownloadStatusBarComponent,
        },

        props: {
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

<style scoped>

</style>
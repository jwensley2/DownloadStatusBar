<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0">
        <button class="clearDownloads" @click="$root.$emit('clearDownloads')">
            Clear
        </button>
        <download v-for="download in downloads"
                  :key="download.id"
                  :download="download"></download>
    </div>
</template>

<script>
    import Download from './Download.vue';

    export default {
        name: "download-status-bar",
        components: {
            'download': Download,
        },
        props: ['downloads'],
        watch: {
            downloads() {
                let body = document.getElementsByTagName('body')[0];
                let downloadStatusBar = document.getElementById('DownloadStatusBar');

                if (downloadStatusBar && this.downloads.length > 0) {
                    body.style.marginBottom = `${downloadStatusBar.offsetHeight}px`;
                } else {
                    body.style.marginBottom = 0;
                }
            }
        }
    }
</script>

<style scoped lang="scss"></style>
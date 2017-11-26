<template>
    <div id="DownloadStatusBar" v-if="downloads.length > 0" :class="`theme-${theme}`">
        <button class="clearDownloads" @click="$root.$emit('clearDownloads')">
            Clear
        </button>
        <download v-for="download in downloads"
                  :key="download.id"
                  :download="download"
                  :theme="theme"></download>
    </div>
</template>

<script>
    import Download from './Download.vue';

    export default {
        name: "download-status-bar",
        components: {
            'download': Download,
        },
        props: ['downloads', 'theme'],
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

<style scoped lang="scss">
    #DownloadStatusBar {
        font: normal 400 16px Arial, sans-serif;
        color: black;
        padding: 5px;
        box-sizing: content-box;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        line-height: 1;

        > * {
            vertical-align: middle
        }

        .clearDownloads {
            font: normal bold 16px Arial, sans-serif;
            padding: 0 10px;
            font-size: 1em;
            border: 1px solid #AAA;
            width: auto;
            display: inline-block;
            box-sizing: border-box;
            margin: 2.5px 5px;
            cursor: pointer;
            color: #000;
            background: #EEE;
            box-shadow: none;
        }

        &.theme-dark {
            .clearDownloads {
                border: 1px solid #888;
                color: #EEE;
                background: #666;
            }
        }
    }
</style>
<template>
    <div class="item" @dblclick="openDownload">
        <div class="progress" :style="`width: ${percentDone}%`"></div>
        <div>{{ filename }}</div>
        <div v-if="download.state === 'complete'">{{ filesize }} - Completed</div>
        <div v-else-if="download.totalBytes === -1">{{ downloaded }} / Unknown</div>
        <div v-else>{{ downloaded }}/{{ totalsize }} - {{ percentDone }}%</div>
    </div>
</template>

<script>
    function formatFileSize(bytes) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        let i = Math.floor(Math.log(bytes) / Math.log(1024));

        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    module.exports = {
        name: "download",
        props: ['download'],
        computed: {
            filename() {
                let m = this.download.filename.toString().match(/.*[\/\\](.+)/);

                if (m && m.length > 1) {
                    let name = m[m.length - 1];

                    return name.length > 30 ? '...' + name.substr(-30, 30) : name;
                }

                return '';
            },

            downloaded() {
                return formatFileSize(this.download.bytesReceived);
            },

            totalsize() {
                return formatFileSize(this.download.totalBytes);
            },

            filesize() {
                return formatFileSize(this.download.fileSize);
            },

            percentDone() {
                if (this.download.state === 'complete') {
                    return 100;
                } else if (this.download.totalBytes < 0) {
                    return 0;
                }

                return ((this.download.bytesReceived / this.download.totalBytes) * 100).toFixed(2);
            }
        },

        methods: {
            openDownload() {
                this.$root.$emit('openDownload', this.download);
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
<template>
    <div>
        <button @click="copyValue" title="Copy"><span class="icon-copy"></span></button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    @Component({})
    export default class CopyButton extends Vue {
        @Prop({})
        value: String;

        copyValue() {
            let navigator = window.navigator as any;

            navigator.clipboard.writeText(this.value);
        }
    }
</script>

<style lang="scss" scoped>
    @import "../scss/variables";
    @import "../../icomoon/style";

    button {
        background : none;
        border     : 0;
        color      : var(--text);
        height     : 100%;

        &:hover {
            background : var(--buttonHover)
        }
    }
</style>
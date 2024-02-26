<template>
    <div>
        <button @click="copyValue" title="Copy"><span class="icon-copy"></span></button>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    props: {
        value: String,
    },
    setup(props) {
        return {
            copyValue() {
                let navigator = window.navigator;

                if (props.value) {
                    navigator.clipboard.writeText(props.value);
                }
            }
        }
    }
})
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
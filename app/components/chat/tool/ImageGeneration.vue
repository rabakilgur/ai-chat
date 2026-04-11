<script setup lang="ts">
import { isToolStreaming } from "@nuxt/ui/utils/ai";
import type { getToolName } from "ai";
import ImageLightBox from "./ImageLightBox.vue";

type ToolPart = Parameters<typeof getToolName>[0];

const props = defineProps<{
  part: ToolPart;
}>();

const prompt = computed(
  () => (props.part.input as { prompt?: string } | undefined)?.prompt,
);

const streaming = computed(() => isToolStreaming(props.part));
const failed = computed(() => props.part.state === "output-error");
const errorText = computed(() => {
  if (!failed.value) return "";
  return props.part.errorText || "Image generation failed. Please try again.";
});

const imageSrc = computed(() => {
  const output = props.part.output as
    | { result?: string; mediaType?: string }
    | undefined;
  if (!output?.result) return null;
  return `data:${output.mediaType ?? "image/png"};base64,${output.result}`;
});
</script>

<template>
  <div class="my-5">
    <template v-if="imageSrc">
      <ImageLightBox :src="imageSrc" :alt="prompt || 'Generated image'" />
    </template>

    <div
      v-else
      class="rounded-xl px-5 py-4 flex items-center justify-center h-64"
      :class="failed ? 'bg-muted text-error' : 'bg-muted'"
    >
      <div class="text-center" :class="failed ? 'text-error' : 'text-muted'">
        <UIcon
          :name="failed ? 'i-lucide-triangle-alert' : 'i-lucide-image'"
          class="size-8 mx-auto mb-2"
          :class="[streaming && !failed && 'animate-pulse']"
        />
        <div class="text-sm">
          {{
            failed
              ? errorText
              : streaming
                ? "Generating image..."
                : "Loading image..."
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css"></style>

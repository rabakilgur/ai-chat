<script setup lang="ts">
import { getTextFromMessage } from "@nuxt/ui/utils/ai";
import { useClipboard } from "@vueuse/core";
import type { UIMessage } from "ai";
import { isFileUIPart } from "ai";

const props = defineProps<{
  message: UIMessage & { createdAt?: string | Date };
  streaming: boolean;
  editing: boolean;
  vote: boolean | null;
}>();

const isImage = computed(() =>
  props.message.parts.some((part) => part.type === "tool-image_generation"),
);

const formattedDate = computed(() => {
  if (!props.message.createdAt) return null;

  const date = new Date(props.message.createdAt);

  return {
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
    full: date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    iso: date.toISOString(),
  };
});

const emit = defineEmits<{
  edit: [message: UIMessage];
  regenerate: [message: UIMessage];
  vote: [message: UIMessage, isUpvoted: boolean];
}>();

const hasFiles = computed(() => props.message.parts.some(isFileUIPart));

const downloaded = ref(false);

async function download() {
  const part: any = props.message.parts.find(
    (part) => part.type === "tool-image_generation",
  );
  const output: {
    mediaType: string;
    result: string;
  } = part.output;
  const imageSrc = `data:${output.mediaType};base64,${output.result}`;
  const link = document.createElement("a");
  link.href = imageSrc;
  link.download = "image.png";
  link.click();

  downloaded.value = true;
  setTimeout(() => (downloaded.value = false), 2000);
}

const clipboard = useClipboard();

const copied = ref(false);

async function copy() {
  if (isImage) {
    const part: any = props.message.parts.find(
      (part) => part.type === "tool-image_generation",
    );
    const output: {
      mediaType: string;
      result: string;
    } = part.output;
    const imageSrc = `data:${output.mediaType};base64,${output.result}`;

    const canCopyImage =
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard?.write === "function" &&
      typeof ClipboardItem !== "undefined";

    if (canCopyImage) {
      try {
        const binary = atob(output.result);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const blob = new Blob([bytes], { type: output.mediaType });

        await navigator.clipboard.write([
          new ClipboardItem({
            [output.mediaType]: blob,
          }),
        ]);
      } catch {
        await clipboard.copy(imageSrc);
      }
    } else {
      await clipboard.copy(imageSrc);
    }
  } else {
    await clipboard.copy(getTextFromMessage(props.message));
  }

  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <template v-if="message.role === 'assistant' && !streaming">
    <UTooltip v-if="isImage" text="Download image">
      <UButton
        size="sm"
        :color="downloaded ? 'primary' : 'neutral'"
        variant="ghost"
        icon="i-lucide-download"
        aria-label="Download image"
        class="relative"
        @click="download"
      />
    </UTooltip>

    <UTooltip :text="`Copy ${isImage ? 'image' : 'response'}`">
      <UButton
        size="sm"
        :color="copied ? 'primary' : 'neutral'"
        variant="ghost"
        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
        aria-label="Copy response"
        @click="copy"
      />
    </UTooltip>

    <UTooltip text="Good response">
      <UButton
        size="sm"
        :color="vote === true ? 'success' : 'neutral'"
        variant="ghost"
        icon="i-lucide-thumbs-up"
        aria-label="Good response"
        @click="emit('vote', message, true)"
      />
    </UTooltip>

    <UTooltip text="Bad response">
      <UButton
        size="sm"
        :color="vote === false ? 'error' : 'neutral'"
        variant="ghost"
        icon="i-lucide-thumbs-down"
        aria-label="Bad response"
        @click="emit('vote', message, false)"
      />
    </UTooltip>

    <UTooltip text="Regenerate response">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-rotate-cw"
        aria-label="Regenerate response"
        @click="emit('regenerate', message)"
      />
    </UTooltip>
  </template>

  <template v-if="message.role === 'user' && !streaming && !editing">
    <UTooltip v-if="formattedDate" :text="formattedDate.full">
      <time :datetime="formattedDate.iso" class="text-xs text-muted mr-1.5">
        {{ formattedDate.time }}
      </time>
    </UTooltip>

    <UTooltip v-if="!hasFiles" text="Edit message">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-pencil"
        aria-label="Edit message"
        @click="emit('edit', message)"
      />
    </UTooltip>
  </template>
</template>

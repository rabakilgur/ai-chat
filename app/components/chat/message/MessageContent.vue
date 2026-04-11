<script setup lang="ts">
import { isPartStreaming, isToolStreaming } from "@nuxt/ui/utils/ai";
import type { UIMessage } from "ai";
import { getToolName, isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai";

defineProps<{
  message: UIMessage;
  editing: boolean;
}>();

const emit = defineEmits<{
  save: [message: UIMessage, text: string];
  cancelEdit: [];
}>();

function getPartKey(messageId: string, part: UIMessage["parts"][number], index: number) {
  if (isToolUIPart(part)) {
    const output =
      typeof part.output === "object" && part.output !== null ? (part.output as object) : null;
    const outputSizeHint = output ? Object.keys(output).length : 0;
    return `${messageId}-${part.type}-${index}-${part.state}-${part.toolCallId}-${outputSizeHint}`;
  }
  return `${messageId}-${part.type}-${index}`;
}
</script>

<template>
  <template
    v-for="(part, index) in getMergedParts(message.parts)"
    :key="getPartKey(message.id, part, index)"
  >
    <UChatReasoning
      v-if="isReasoningUIPart(part)"
      :text="part.text"
      :streaming="isPartStreaming(part)"
      chevron="leading"
    >
      <ChatComark :markdown="part.text" :streaming="isPartStreaming(part)" />
    </UChatReasoning>

    <template v-else-if="isToolUIPart(part)">
      <ChatToolChart
        v-if="getToolName(part) === 'chart'"
        :invocation="{ ...(part as ChartUIToolInvocation) }"
      />
      <ChatToolWeather
        v-else-if="getToolName(part) === 'weather'"
        :invocation="{ ...(part as WeatherUIToolInvocation) }"
      />
      <ChatToolImageGeneration
        v-else-if="getToolName(part) === 'image_generation'"
        :part="part"
      />
      <UChatTool
        v-else-if="
          getToolName(part) === 'web_search' ||
          getToolName(part) === 'google_search'
        "
        :text="
          isToolStreaming(part) ? 'Searching the web...' : 'Searched the web'
        "
        :suffix="getSearchQuery(part)"
        :streaming="isToolStreaming(part)"
        chevron="leading"
      >
        <ChatToolSources :sources="getSources(part)" />
      </UChatTool>
    </template>

    <template v-else-if="isTextUIPart(part)">
      <ChatComark
        v-if="message.role === 'assistant'"
        :markdown="part.text"
        :streaming="isPartStreaming(part)"
      />
      <template v-else-if="message.role === 'user'">
        <ChatMessageEdit
          v-if="editing"
          :message="message"
          :text="part.text"
          @save="(msg, text) => emit('save', msg, text)"
          @cancel="emit('cancelEdit')"
        />
        <p v-else class="whitespace-pre-wrap">
          {{ part.text }}
        </p>
      </template>
    </template>
  </template>
</template>

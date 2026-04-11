<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    previewClass?: string;
    expandedClass?: string;
  }>(),
  {
    alt: "Image preview",
    previewClass: "rounded-xl max-w-full w-auto max-h-[512px] shadow-lg",
    expandedClass:
      "max-h-[92vh] max-w-[92vw] w-auto h-auto rounded-xl shadow-2xl cursor-zoom-out",
  },
);

const lightboxOpen = ref(false);

function openLightbox() {
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeLightbox();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
});
</script>

<template>
  <button
    type="button"
    class="block cursor-zoom-in"
    aria-label="Expand image"
    @click="openLightbox"
  >
    <img :src="src" :alt="alt" :class="previewClass" />
  </button>

  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-120 bg-black/80 backdrop-blur-xs p-4 sm:p-8 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        :aria-label="`${alt} lightbox`"
        @click="closeLightbox"
      >
        <div class="absolute top-4 right-4 flex gap-1">
          <UTooltip text="Download image" :ui="{ content: 'z-121' }">
            <UButton
              type="button"
              icon="i-lucide-download"
              variant="ghost"
              class="text-white/80 hover:text-white hover:bg-white/10 aspect-square p-2 relative"
              aria-label="Download image"
              @click.stop
            >
              <a
                :href="src"
                download="image"
                class="absolute inset-0"
                tabindex="-1"
                aria-label="Download image"
              ></a>
            </UButton>
          </UTooltip>

          <UButton
            type="button"
            icon="i-lucide-x"
            variant="ghost"
            class="text-white/80 hover:text-white hover:bg-white/10 aspect-square p-2"
            aria-label="Close image lightbox"
            @click.stop="closeLightbox"
          />
        </div>

        <img
          :src="src"
          :alt="alt"
          :class="expandedClass"
          @click.stop="closeLightbox"
        />

        <div
          class="absolute bottom-6 left-8 right-8 text-neutral-200 text-md text-center"
          style="
            text-shadow:
              0 0 1px black,
              0 0 1px black,
              0 0 1px black,
              0 0 4px black;
          "
        >
          {{ alt }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 200ms ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active img,
.lightbox-leave-active img {
  transition:
    transform 200ms ease,
    opacity 200ms ease;
}

.lightbox-enter-from img,
.lightbox-leave-to img {
  transform: scale(0.96);
  opacity: 0.9;
}
</style>

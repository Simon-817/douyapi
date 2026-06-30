const state = {
  screen: "home",
  hasImage: false,
  selectedSize: 52,
  customSize: "",
  cartoonStyle: false,
  freeCount: 1,
  extraCount: 0,
  progressTimer: null,
  progress: 0,
  events: ["douya_home_view"],
};

const previewState = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  startScale: 1,
  startDistance: 0,
  startTranslateX: 0,
  startTranslateY: 0,
  startPoint: null,
};

const eventCopy = {
  upload: "图片上传失败，请重新上传",
  blur: "图片清晰度不足，请更换更清晰的图片后重试",
  risk: "当前图片暂不支持生成，请更换图片后重试",
  quota: "今日免费生成次数已用完，可使用兑换码增加次数",
  timeout: "生成时间较长，请稍后重试",
  save: "保存失败，请检查相册权限后重试",
};

document.addEventListener("click", (event) => {
  const eventTarget = event.target.closest("[data-event]");
  if (eventTarget) track(eventTarget.dataset.event);

  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) handleAction(actionTarget.dataset.action);

  const sizeButton = event.target.closest("[data-size]");
  if (sizeButton) selectSize(sizeButton.dataset.size);

  const errorButton = event.target.closest("[data-error]");
  if (errorButton) showToast(eventCopy[errorButton.dataset.error], "assets/icons/alert.png");
});

document.getElementById("custom-size").addEventListener("change", validateCustomSize);
document.getElementById("custom-size").addEventListener("blur", validateCustomSize);
document.getElementById("custom-size").addEventListener("input", updateCustomPlaceholder);

function handleAction(action) {
  switch (action) {
    case "go-home": renderScreen("home"); break;
    case "show-profile": renderScreen("profile"); break;
    case "show-errors": renderScreen("errors"); break;
    case "upload-image": simulateUpload(); break;
    case "clear-upload": clearUpload(); break;
    case "start-generation": startGeneration(); break;
    case "toggle-cartoon-style": toggleCartoonStyle(); break;
    case "open-image-preview": openImagePreview(); break;
    case "close-image-preview": closeImagePreview(); break;
    case "cancel-generation": cancelGeneration(); break;
    case "save-result": saveResult(); break;
    case "open-redeem": openRedeem(); break;
    case "close-redeem": closeRedeem(); break;
    case "submit-redeem": submitRedeem(); break;
  }
}

function renderScreen(screenName) {
  state.screen = screenName;
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
  document.querySelectorAll(".tab-item").forEach((item) => item.classList.remove("is-active"));
  const tabIndex = screenName === "profile" ? 1 : 0;
  const tab = document.querySelectorAll(".tab-item")[tabIndex];
  if (tab) tab.classList.add("is-active");
  if (screenName === "home") track("douya_home_view");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function simulateUpload() {
  state.hasImage = true;
  const card = document.getElementById("upload-card");
  card.classList.add("has-image");
  card.innerHTML = `
    <span class="upload-inner uploaded-preview">
      <img class="uploaded-image" src="assets/decorations/pegboard-heart.png" alt="已上传图片预览">
      <button class="upload-clear-button" type="button" data-action="clear-upload" data-event="douya_upload_clear_click" aria-label="移除已上传图片">
        <img src="assets/icons/upload-close.png" alt="">
      </button>
    </span>
  `;
  showToast("图片上传成功", "assets/mascot/success.png");
}

function clearUpload() {
  state.hasImage = false;
  const card = document.getElementById("upload-card");
  card.classList.remove("has-image");
  card.innerHTML = `
    <span class="upload-inner">
      <img src="assets/icons/image.png" alt="上传图片">
      <strong>点击上传图片</strong>
      <em>支持相册和拍照</em>
    </span>
    <img src="assets/decorations/clover.png" alt="" class="upload-deco clover">
    <img src="assets/decorations/heart.png" alt="" class="upload-deco heart">
  `;
  showToast("已移除图片", "assets/icons/upload-close.png");
}

function selectSize(size) {
  const customInput = document.getElementById("custom-size");
  const customWrapper = document.getElementById("custom-size-wrapper");
  document.querySelectorAll("[data-size]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.size === size);
  });
  if (size === "custom") {
    customWrapper.classList.add("is-editing");
    customInput.focus();
    updateCustomPlaceholder();
    requestAnimationFrame(() => customInput.setSelectionRange(0, 0));
    return;
  }
  customWrapper.classList.remove("is-editing");
  customWrapper.classList.remove("has-value");
  customInput.value = "";
  state.customSize = "";
  state.selectedSize = Number(size);
  track("douya_preset_size_select");
}

function validateCustomSize() {
  const input = document.getElementById("custom-size");
  const customSelected = document.querySelector('[data-size="custom"]').classList.contains("is-active");
  const value = Number(input.value);
  if (!customSelected || input.value === "") return true;
  if (!Number.isInteger(value) || value < 8 || value > 104) {
    input.value = "";
    state.customSize = "";
    updateCustomPlaceholder();
    showToast("请输入8~104格的尺寸", "assets/icons/alert.png");
    return false;
  }
  state.customSize = value;
  state.selectedSize = value;
  track("douya_custom_size_input");
  return true;
}

function updateCustomPlaceholder() {
  const input = document.getElementById("custom-size");
  document.getElementById("custom-size-wrapper").classList.toggle("has-value", input.value.trim() !== "");
}

function startGeneration() {
  if (!state.hasImage) {
    showToast("请完善生成信息后再试", "assets/icons/alert.png");
    return;
  }
  if (!validateCustomSize()) return;
  if (state.freeCount + state.extraCount <= 0) {
    showToast("今日免费生成次数已用完，可使用兑换码增加次数", "assets/icons/redeem.png");
    renderScreen("errors");
    return;
  }
  renderScreen("generating");
  state.progress = 0;
  updateProgress();
  clearInterval(state.progressTimer);
  state.progressTimer = setInterval(() => {
    state.progress += 12;
    if (state.progress >= 100) {
      clearInterval(state.progressTimer);
      state.progress = 100;
      consumeQuotaAfterSuccess();
      showResult();
    }
    updateProgress();
  }, 280);
}

function updateProgress() {
  document.getElementById("progress-title").textContent = `AI 正在摆放拼豆 · ${state.progress}%`;
  document.getElementById("progress-fill").style.width = `${state.progress}%`;
}

function consumeQuotaAfterSuccess() {
  if (state.freeCount > 0) state.freeCount -= 1;
  else if (state.extraCount > 0) state.extraCount -= 1;
  updateQuotaText();
}

function showResult() {
  document.getElementById("result-size").textContent = `${state.selectedSize} x ${state.selectedSize}`;
  renderScreen("result");
  track("douya_result_view");
}

function cancelGeneration() {
  clearInterval(state.progressTimer);
  state.progress = 0;
  renderScreen("home");
  showToast("已取消生成，未扣减次数", "assets/mascot/idle.png");
}

function updateQuotaText() {
  document.getElementById("free-count").textContent = state.freeCount;
  document.getElementById("extra-count").textContent = state.extraCount;
  document.getElementById("profile-free-count").textContent = state.freeCount;
  document.getElementById("profile-extra-count").textContent = state.extraCount;
}

function saveResult() {
  showToast("已保存到相册", "assets/mascot/success.png");
  track("douya_grid_image_download_click");
}

function openRedeem() {
  const modal = document.getElementById("redeem-modal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("redeem-input").focus();
}

function closeRedeem() {
  const modal = document.getElementById("redeem-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function openImagePreview() {
  const modal = document.getElementById("image-preview-modal");
  previewState.scale = 1;
  previewState.translateX = 0;
  previewState.translateY = 0;
  updatePreviewTransform();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeImagePreview() {
  const modal = document.getElementById("image-preview-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function submitRedeem() {
  const input = document.getElementById("redeem-input");
  const code = input.value.trim().toUpperCase();
  if (code === "DOUYA2026" || code === "PI2026") {
    state.extraCount += 3;
    input.value = "";
    closeRedeem();
    updateQuotaText();
    showToast("兑换成功，已增加 3 次生成次数", "assets/mascot/celebration.png");
    track("douya_redeem_submit");
    return;
  }
  if (code === "USED") {
    showToast("该兑换码已被使用", "assets/icons/alert.png");
    return;
  }
  if (code === "EXPIRED") {
    showToast("该兑换码已过期", "assets/icons/alert.png");
    return;
  }
  showToast("兑换码无效，请检查后重试", "assets/icons/alert.png");
}

function showToast(message, iconSrc) {
  const toast = document.getElementById("toast");
  toast.querySelector("img").src = iconSrc;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function track(eventName) {
  if (!eventName) return;
  if (state.events[state.events.length - 1] !== eventName) state.events.push(eventName);
}

function toggleCartoonStyle() {
  state.cartoonStyle = !state.cartoonStyle;
  const toggle = document.getElementById("cartoon-style-toggle");
  toggle.classList.toggle("is-checked", state.cartoonStyle);
  toggle.setAttribute("aria-checked", String(state.cartoonStyle));
  document.getElementById("cartoon-style-icon").src = state.cartoonStyle ? "assets/icons/cartoon-checkbox-checked.png" : "assets/icons/cartoon-checkbox-unchecked.png";
  track("douya_cartoon_style_toggle");
}

function handlePreviewTouchStart(event) {
  if (event.touches.length === 2) {
    previewState.startDistance = getTouchDistance(event.touches);
    previewState.startScale = previewState.scale;
    previewState.startPoint = null;
    return;
  }
  if (event.touches.length === 1) {
    previewState.startPoint = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
    previewState.startTranslateX = previewState.translateX;
    previewState.startTranslateY = previewState.translateY;
  }
}

function handlePreviewTouchMove(event) {
  if (!document.getElementById("image-preview-modal").classList.contains("is-open")) return;
  if (event.touches.length === 2) {
    event.preventDefault();
    const nextScale = previewState.startScale * (getTouchDistance(event.touches) / previewState.startDistance);
    previewState.scale = Math.min(4, Math.max(1, nextScale));
    if (previewState.scale === 1) {
      previewState.translateX = 0;
      previewState.translateY = 0;
    }
    updatePreviewTransform();
    return;
  }
  if (event.touches.length === 1 && previewState.startPoint && previewState.scale > 1) {
    event.preventDefault();
    previewState.translateX = previewState.startTranslateX + event.touches[0].clientX - previewState.startPoint.x;
    previewState.translateY = previewState.startTranslateY + event.touches[0].clientY - previewState.startPoint.y;
    updatePreviewTransform();
  }
}

function handlePreviewTouchEnd(event) {
  if (event.touches.length === 0) previewState.startPoint = null;
  if (previewState.scale < 1.03) {
    previewState.scale = 1;
    previewState.translateX = 0;
    previewState.translateY = 0;
    updatePreviewTransform();
  }
}

function getTouchDistance(touches) {
  const x = touches[0].clientX - touches[1].clientX;
  const y = touches[0].clientY - touches[1].clientY;
  return Math.hypot(x, y);
}

function updatePreviewTransform() {
  const image = document.getElementById("image-preview-img");
  image.style.transform = `translate(${previewState.translateX}px, ${previewState.translateY}px) scale(${previewState.scale})`;
}

const previewStage = document.getElementById("image-preview-stage");
previewStage.addEventListener("touchstart", handlePreviewTouchStart, { passive: false });
previewStage.addEventListener("touchmove", handlePreviewTouchMove, { passive: false });
previewStage.addEventListener("touchend", handlePreviewTouchEnd);
updateQuotaText();
updateCustomPlaceholder();
track("douya_home_view");

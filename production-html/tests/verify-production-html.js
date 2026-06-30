const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(file) {
  const fullPath = path.join(root, file);
  assert(fs.existsSync(fullPath), `Missing required file: ${file}`);
  return fs.readFileSync(fullPath, "utf8");
}

const miniHtml = read("mini-program.html");
const adminHtml = read("admin.html");
const css = read("styles.css");
const miniJs = read("mini-program.js");
const adminJs = read("admin.js");

for (const file of ["assets/brand/logo-lockup.png", "assets/mascot/generating.png", "assets/icons/upload.png"]) {
  assert(fs.existsSync(path.join(root, file)), `Missing required asset: ${file}`);
}

const miniScreens = ["screen-home", "screen-profile", "screen-generating", "screen-result", "screen-errors"];
for (const id of miniScreens) {
  assert(miniHtml.includes(`id="${id}"`), `Mini program missing screen: ${id}`);
}

for (const removed of ["screen-generate", "screen-empty", "data-action=\"go-generate\"", "data-action=\"show-empty\""]) {
  assert(!miniHtml.includes(removed), `Mini program should remove old generate/chart surface: ${removed}`);
}

assert(adminHtml.includes(`id="admin-dashboard"`), "Admin page missing admin-dashboard.");
assert(adminHtml.includes(`id="admin-users"`), "Admin page missing user list.");
assert(adminHtml.includes("增加生成次数"), "Admin page missing add-count panel.");

for (const forbidden of ["class=\"phone", "phone-stage", "wechat-status", "wechat-capsule"]) {
  assert(!miniHtml.includes(forbidden), `Mini program page must not include phone shell: ${forbidden}`);
}

const miniCopy = [
  "点击上传图片",
  "选择拼豆尺寸",
  "52格",
  "78格",
  "104格",
  "请输入8~104格的尺寸",
  "8~104格",
  "卡通风格",
  "今日免费生成次数已用完，可使用兑换码增加次数",
  "本期暂不保存历史作品，请及时下载保存",
  "保存失败，请检查相册权限后重试",
  "豆芽4826",
  "兑换码",
  "输入兑换码获取次数",
  "生成后请及时保存",
  "目前暂不保存历史作品，生成后请及时保存",
];

for (const text of miniCopy) {
  assert(miniHtml.includes(text) || miniJs.includes(text), `Mini program missing PRD copy: ${text}`);
}

for (const removedCopy of [
  "上传图片，一键生成可制作拼豆图",
  "生成后请及时保存格子图",
  "兑换码加次数",
  "输入兑换码获取生成次数",
  "本期暂不保存历史作品，生成后请及时保存格子图",
  "AI生成专属拼豆图纸",
  "一键生成可制作拼豆图纸",
  "本期暂不保存历史作品，生成后请及时保存",
]) {
  assert(!miniHtml.includes(removedCopy), `Mini program should remove old copy: ${removedCopy}`);
}

for (const removedSize of ["16", "26", "32", "50", "64", "100"]) {
  assert(!miniHtml.includes(`data-size="${removedSize}"`), `Home size presets should remove ${removedSize}格.`);
}

for (const requiredSize of ["52", "78", "104", "custom"]) {
  assert(miniHtml.includes(`data-size="${requiredSize}"`), `Home size presets should include ${requiredSize}.`);
}

assert(miniHtml.includes("custom-size-wrapper"), "Custom size control must replace the custom button with an input.");
assert(miniJs.includes("is-editing"), "Custom size click must toggle input editing state.");
assert(miniHtml.includes("custom-size-placeholder"), "Custom size input must show a visible placeholder label.");
assert(miniHtml.includes(">8~104格<"), "Custom size visible placeholder must fully show: 8~104格.");
assert(!miniHtml.includes('id="custom-size" class="custom-size" type="number"'), "Custom size input must not use native number steppers.");
assert(miniHtml.includes('id="cartoon-style-toggle"'), "Home must include cartoon style checkbox option.");
assert(miniHtml.includes('aria-checked="false"'), "Cartoon style checkbox must default to unchecked.");
assert(miniHtml.includes("assets/icons/cartoon-checkbox-unchecked.png"), "Cartoon checkbox unchecked PNG must be referenced.");
assert(miniHtml.includes("assets/icons/cartoon-checkbox-checked.png") || miniJs.includes("assets/icons/cartoon-checkbox-checked.png"), "Cartoon checkbox checked PNG must be referenced.");
assert(miniJs.includes("function toggleCartoonStyle"), "Cartoon style checkbox must have a toggle handler.");
assert(!css.includes(".home-size-grid .custom-trigger {\n  color: #fff;"), "Custom size button must not be filled before selection.");
assert(!miniHtml.includes("使用的颜色"), "Result page must remove used-colors display.");
assert(!miniHtml.includes("palette-dots"), "Result page must remove palette dots display.");
assert(miniHtml.includes('data-action="open-image-preview"'), "Result preview image must open a large-image viewer.");
assert(miniHtml.includes('id="image-preview-modal"'), "Large-image viewer modal is required.");
assert(miniJs.includes("function openImagePreview"), "Large-image viewer must have an open handler.");
assert(miniJs.includes("function handlePreviewTouchMove"), "Large-image viewer must support touch pinch zoom.");
assert(miniHtml.includes("image-preview-stage"), "Large-image viewer must include a touch stage.");
assert(!miniHtml.includes("profile-count-card\">\n        <div>\n          <img"), "Profile count card must remove count icons.");
assert(!miniHtml.includes("home-hero"), "Home must remove the top AI promo area.");
assert(miniHtml.includes("top-brand-row"), "Home logo/name/slogan must share one top brand row.");
assert(miniHtml.includes('src="assets/brand/mascot-logo.png"') && miniHtml.includes("home-brand-icon"), "Home top brand must use the logo icon on the left.");
assert(miniHtml.includes("assets/icons/upload-close.png") || miniJs.includes("assets/icons/upload-close.png"), "Uploaded preview must reference generated close PNG icon.");
assert(miniJs.includes("function clearUpload"), "Uploaded preview close icon must clear the uploaded image.");
assert(css.includes("aspect-ratio: 1 / 1"), "Upload dashed area must be 1:1.");
assert(css.includes(".home-panel h2") && css.includes("font-size: 24px"), "Size heading must be 24px.");
assert(css.includes(".quota-label") && css.includes("font-size: 14px"), "Home quota labels must be 14px.");
assert(css.includes(".quota-number") && css.includes("font-size: 18px"), "Home quota numbers must be 18px.");
assert(css.includes(".home-generate-button") && css.includes("font-size: 16px"), "Generate button text must be 16px.");
assert(miniHtml.includes("style-options") && miniHtml.includes("style-card"), "Cartoon style must use card option layout.");
assert(!miniHtml.includes("profile-brand-row"), "Profile must remove top app name and illustration strip.");
assert(css.includes(".profile-avatar") && css.includes("width: 74px") && css.includes("height: 74px"), "Profile avatar must be reduced to two-thirds size.");
assert(css.includes(".profile-card strong") && css.includes("font-size: 18px"), "Profile nickname must be 18px.");
assert(css.includes(".profile-count-card span") && css.includes("font-size: 14px"), "Profile count labels must be 14px.");
assert(css.includes(".profile-count-card strong") && css.includes("font-size: 18px"), "Profile count numbers must be 18px.");
assert(css.includes(".profile-redeem-card > img") && css.includes("width: 46px") && css.includes("height: 46px"), "Profile redeem icon must be reduced to two-thirds size.");
assert(css.includes(".profile-redeem-card h2") && css.includes("font-size: 16px"), "Profile redeem title must be 16px.");
assert(css.includes(".profile-redeem-card p") && css.includes("font-size: 12px"), "Profile redeem hint must be 12px.");
assert(css.includes(".profile-redeem-card button") && css.includes("font-size: 14px"), "Profile redeem button text must be 14px.");
assert(css.includes(".profile-notice span") && css.includes("font-size: 14px"), "Profile notice text must be 14px.");

const requiredEvents = [
  "douya_home_view",
  "douya_image_upload_click",
  "douya_preset_size_select",
  "douya_generate_click",
  "douya_redeem_submit",
  "douya_grid_image_download_click",
  "douya_regenerate_click",
];

for (const eventName of requiredEvents) {
  assert(miniHtml.includes(eventName) || miniJs.includes(eventName), `Missing tracking event: ${eventName}`);
}

const allMarkup = `${miniHtml}\n${adminHtml}`;
assert(!allMarkup.includes("<svg"), "Inline SVG is not allowed.");
assert(!allMarkup.includes("data:image/svg"), "Embedded SVG data URI is not allowed.");
assert(!allMarkup.toLowerCase().includes("placeholder image"), "Placeholder image text is not allowed.");
assert(!css.includes("lucide"), "Icon library placeholders are not allowed.");
assert(!miniHtml.match(/<span>生成<\/span>/), "Bottom navigation must not include 生成.");
assert(!miniHtml.match(/<span>图纸<\/span>/), "Bottom navigation must not include 图纸.");
assert(miniHtml.match(/<span>首页<\/span>/), "Bottom navigation must include 首页.");
assert(miniHtml.match(/<span>我的<\/span>/), "Bottom navigation must include 我的.");

const imageRefs = Array.from(allMarkup.matchAll(/<img[^>]+src="([^"]+)"/g)).map((match) => match[1]);
assert(imageRefs.length >= 28, `Expected at least 28 PNG image references, found ${imageRefs.length}`);

for (const src of imageRefs) {
  assert(src.endsWith(".png"), `Image must be PNG: ${src}`);
  assert(fs.existsSync(path.join(root, src)), `Missing referenced image: ${src}`);
}

for (const asset of [
  "assets/brand/logo-lockup.png",
  "assets/mascot/generating.png",
  "assets/icons/upload.png",
  "assets/icons/upload-close.png",
  "assets/icons/download.png",
  "assets/icons/cartoon-checkbox-unchecked.png",
  "assets/decorations/pegboard-heart.png",
  "assets/decorations/magic-wand.png",
  "assets/brand/app-icon.png",
]) {
  assert(imageRefs.includes(asset), `Missing required asset reference: ${asset}`);
}

assert(miniJs.includes("function renderScreen"), "Mini program missing screen renderer.");
assert(miniJs.includes("function submitRedeem"), "Mini program missing redeem handler.");
assert(miniJs.includes("function startGeneration"), "Mini program missing generation handler.");
assert(adminJs.includes("function renderAdminUsers"), "Admin page missing user renderer.");
assert(adminJs.includes("function addGenerationCount"), "Admin page missing add-count handler.");

console.log(`Production HTML split check passed with ${imageRefs.length} PNG references.`);

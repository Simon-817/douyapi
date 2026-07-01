# 豆芽Pi v1.0 Production HTML QA

final result: passed

## Automated Checks

- Structural check: `node production-html/tests/verify-production-html.js`
- Mini program JavaScript syntax check: `node --check production-html/mini-program.js`
- Admin JavaScript syntax check: `node --check production-html/admin.js`
- Test script syntax check: `node --check production-html/tests/verify-production-html.js`

## Browser Checks

Local URLs:

- Mini program: `http://127.0.0.1:4173/mini-program.html`
- Admin dashboard: `http://127.0.0.1:4173/admin.html`

Captured screens:

- `screenshots/mini-home.png`
- `screenshots/mini-home-uploaded.png`
- `screenshots/mini-home-cartoon-custom.png`
- `screenshots/mini-profile.png`
- `screenshots/mini-result.png`
- `screenshots/mini-result-preview-modal.png`
- `screenshots/admin-desktop.png`

Browser smoke results:

- Mini program page loaded with 44 PNG references and 0 broken images.
- Mini program page has no `.phone`, `.phone-stage`, `.wechat-status`, or `.wechat-capsule` shell elements.
- Mini program bottom navigation contains only `首页` and `我的`; old `生成` and `图纸` navigation entries and pages are removed.
- Mini program browser title is `豆芽Pi`.
- Admin page loaded with 18 images and 0 broken images.
- Mini program and admin pages declare the PNG favicon and produce no browser log errors in the smoke run.
- Mini program viewport is a direct 390px mobile-browser page, not a phone mockup; checked `documentElement.scrollWidth = 390`.
- Home top brand uses the mascot logo on the left, with app name and slogan on the right; the top gap matches the gap between the brand group and upload card.
- Home mascot logo, app-name image, and slogan text are enlarged by about 1/4 from the previous compact size.
- Home top promo area `AI生成专属拼豆图纸` has been removed.
- Home upload dashed area is a 1:1 square; uploaded images cover the square and show the generated close PNG in the top-right corner.
- Home size title `选择拼豆尺寸` uses 16px text.
- Home size presets are limited to `52格`, `78格`, and `104格`; default selection is `52格`.
- The default `自定义` control uses the same unfilled style as inactive preset sizes.
- Tapping `自定义` replaces the custom button with a 16px text input; the cursor appears to the left of the visible `8~104格` hint, native number steppers are not used, and mobile browsers should not auto-zoom on focus.
- `卡通风格` appears as a style card above `立即生成`, defaults to unchecked, and toggles a single left-side generated PNG icon between unchecked/checked states.
- Home generate button has no shadow.
- Home save reminder copy is `生成后请及时保存`.
- Home generate button is visible above the bottom navigation at 390px viewport.
- Profile top app-name, illustration strip, and `我的` title area have been removed.
- Profile avatar is reduced to 74px and fills the avatar frame; nickname is 18px.
- Profile count card removes the free/extra icons and uses 14px labels with 18px numbers.
- Profile redeem copy is `兑换码` / `输入兑换码获取次数`; redeem icon is 46px and the button text is 14px.
- Profile notice is `目前暂不保存历史作品，生成后请及时保存` at 14px.
- Upload simulation, generation progress, and result page transition work.
- Result page removes the `使用的颜色` palette display, keeps only size and color count, and opens a full-screen preview modal from the result image.
- Result image preview supports touch pinch zoom and drag when zoomed.
- Custom size `120` shows `请输入8~104格的尺寸`.
- Redeem code `DOUYA2026` increases extra generation count.
- Admin add-count updates the selected user's extra count.

## Notes

- This is a frontend-only production HTML prototype. WeChat APIs, real image cropping, backend generation, content moderation, and real album saving are represented as local interactions.
- All visible icon, mascot, brand, and decorative assets use PNG files from the generated production asset set.
- The `卡通风格` checkbox state assets were generated as bitmap PNG resources and stored in `assets/icons/cartoon-checkbox-unchecked.png` and `assets/icons/cartoon-checkbox-checked.png`.
- The uploaded-image close control uses the generated transparent PNG at `assets/icons/upload-close.png`.

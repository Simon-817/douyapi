const users = [
  { id: "wxid_9a28b", name: "豆芽 1826", today: 1, extra: 3, total: 18, last: "10:42" },
  { id: "wxid_77k20", name: "豆芽 0531", today: 1, extra: 0, total: 4, last: "09:18" },
  { id: "wxid_p1e42", name: "豆芽 6408", today: 0, extra: 12, total: 31, last: "昨天" },
  { id: "wxid_f2h93", name: "豆芽 2910", today: 1, extra: 1, total: 9, last: "昨天" },
  { id: "wxid_k3j88", name: "豆芽 7723", today: 0, extra: 5, total: 15, last: "2天前" },
];

const adminState = {
  selectedUserId: "wxid_9a28b",
  addCount: 1,
  filter: { wxid: "", name: "" },
  events: ["douya_home_view"],
};

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) handleAdminAction(actionTarget.dataset.action);

  const countButton = event.target.closest("[data-count]");
  if (countButton) selectAddCount(Number(countButton.dataset.count));
});

function handleAdminAction(action) {
  switch (action) {
    case "admin-search": searchAdminUsers(); break;
    case "admin-reset": resetAdminSearch(); break;
    case "admin-add-count": addGenerationCount(); break;
  }
}

function renderAdminUsers() {
  const list = document.getElementById("admin-users");
  const wxidFilter = adminState.filter.wxid.toLowerCase();
  const nameFilter = adminState.filter.name.toLowerCase();
  const filtered = users.filter((user) => {
    const wxidMatch = !wxidFilter || user.id.toLowerCase().includes(wxidFilter);
    const nameMatch = !nameFilter || user.name.toLowerCase().includes(nameFilter);
    return wxidMatch && nameMatch;
  });

  list.innerHTML = filtered.map((user) => `
    <div class="user-row">
      <span class="user-profile"><img src="assets/brand/mascot-logo.png" alt="">${user.name}</span>
      <span>${user.id}</span>
      <span>${user.today}</span>
      <span>${user.extra} 次</span>
      <span>${user.total}</span>
      <button class="mini-btn" data-user-id="${user.id}">增加次数</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-user-id]").forEach((button) => {
    button.addEventListener("click", () => {
      adminState.selectedUserId = button.dataset.userId;
      renderSelectedUser();
    });
  });

  if (!filtered.find((user) => user.id === adminState.selectedUserId) && filtered[0]) {
    adminState.selectedUserId = filtered[0].id;
  }
  renderSelectedUser();
}

function renderSelectedUser() {
  const user = users.find((item) => item.id === adminState.selectedUserId) || users[0];
  document.getElementById("selected-user").innerHTML = `
    <img src="assets/brand/mascot-logo.png" alt="">
    <span><strong>${user.name}</strong><br>${user.id} · 当前额外 ${user.extra} 次</span>
  `;
}

function searchAdminUsers() {
  adminState.filter.wxid = document.getElementById("admin-wxid").value.trim();
  adminState.filter.name = document.getElementById("admin-name").value.trim();
  renderAdminUsers();
}

function resetAdminSearch() {
  document.getElementById("admin-wxid").value = "";
  document.getElementById("admin-name").value = "";
  adminState.filter = { wxid: "", name: "" };
  renderAdminUsers();
}

function selectAddCount(count) {
  adminState.addCount = count;
  document.querySelectorAll("[data-count]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.count) === count);
  });
}

function addGenerationCount() {
  const user = users.find((item) => item.id === adminState.selectedUserId);
  if (!user) return;
  user.extra += adminState.addCount;
  document.getElementById("admin-note").value = "";
  renderAdminUsers();
  showToast(`已为 ${user.name} 增加 ${adminState.addCount} 次`, "assets/mascot/celebration.png");
  track("admin_add_generation_count");
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
  if (adminState.events[adminState.events.length - 1] !== eventName) {
    adminState.events.push(eventName);
  }
  document.getElementById("event-log").innerHTML = adminState.events.slice(-8).map((event) => `<span>${event}</span>`).join("");
}

renderAdminUsers();

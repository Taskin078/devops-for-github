/* ====== Matches your Spring Boot backend ====== */
const API = "/api/posts";   // @RequestMapping in PostController
// Field names exactly as in your `post` entity (note: "titile" is spelled that way in your Java class).
// If you fix the spelling to "title" in the entity, change it here too.
const F = { id: "id", title: "titile", content: "content", author: "author" };
/* ============================================== */

const $ = id => document.getElementById(id);
const COLORS = ["#5b3df5", "#ff6b57", "#19c3a0", "#f5a623", "#2b8cff", "#e04fa3"];

let posts = [], query = "", authorFilter = "", editingId = null, openId = null;

const esc = s => { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; };
const colorFor = name => {
    let h = 0; for (const c of (name || "?")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return COLORS[h % COLORS.length];
};
const initials = name => (name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const readTime = text => Math.max(1, Math.round((text || "").split(/\s+/).filter(Boolean).length / 200));
const byId = id => posts.find(p => String(p[F.id]) === String(id));

function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
}

async function api(path, opts) {
    const res = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...opts });
    if (!res.ok) throw new Error("Server returned " + res.status);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function renderChips() {
    const authors = [...new Set(posts.map(p => p[F.author]).filter(Boolean))].sort();
    const all = ["All authors", ...authors];
    $("chips").innerHTML = all.map((a, i) => {
        const val = i === 0 ? "" : a;
        return `<button class="chip" data-author="${esc(val)}" aria-pressed="${authorFilter === val}">${esc(a)}</button>`;
    }).join("");
}

function render() {
    const q = query.toLowerCase();
    const list = posts.slice().sort((a, b) => b[F.id] - a[F.id]).filter(p =>
        (!authorFilter || p[F.author] === authorFilter) &&
        (!q || [p[F.title], p[F.content], p[F.author]].some(v => (v || "").toLowerCase().includes(q)))
    );
    $("count").textContent = posts.length;

    if (!posts.length) { $("feed").innerHTML = '<p class="status">No posts yet. Select “Write a post” to publish the first one.</p>'; return; }
    if (!list.length) { $("feed").innerHTML = '<p class="status">No posts match your search. Try a different word or author.</p>'; return; }

    const featuredFirst = !q && !authorFilter && list.length > 1;
    $("feed").innerHTML = list.map((p, i) => {
        const c = colorFor(p[F.author]);
        const excerpt = (p[F.content] || "").slice(0, i === 0 && featuredFirst ? 260 : 150);
        const more = (p[F.content] || "").length > excerpt.length ? "…" : "";
        return `<button class="card${i === 0 && featuredFirst ? " featured" : ""}" data-open="${esc(String(p[F.id]))}">
      <div class="card-top" style="background:${c}"><span class="avatar">${esc(initials(p[F.author]))}</span></div>
      <div class="card-body">
        <h2>${esc(p[F.title] || "Untitled")}</h2>
        <span class="by">${esc(p[F.author] || "Unknown author")} · ${readTime(p[F.content])} min read</span>
        <p class="excerpt">${esc(excerpt)}${more}</p>
      </div></button>`;
    }).join("");
}

async function load() {
    try {
        const data = await api("");
        posts = Array.isArray(data) ? data : [];
        renderChips(); render();
    } catch (e) {
        $("feed").innerHTML = `<p class="status error">Couldn’t load posts (${esc(e.message)}). Make sure the Spring Boot app and MySQL are running, then refresh.</p>`;
    }
}

function openRead(id) {
    const p = byId(id); if (!p) return;
    openId = p[F.id];
    $("readTop").style.background = colorFor(p[F.author]);
    $("readTitle").textContent = p[F.title] || "Untitled";
    $("readMeta").textContent = `${p[F.author] || "Unknown author"} · ${readTime(p[F.content])} min read`;
    $("readContent").textContent = p[F.content] || "";
    $("readDlg").showModal();
}

function openForm(p) {
    editingId = p ? p[F.id] : null;
    $("formHead").textContent = p ? "Edit post" : "Write a post";
    $("saveBtn").textContent = p ? "Save changes" : "Publish post";
    $("fTitle").value = p ? (p[F.title] || "") : "";
    $("fAuthor").value = p ? (p[F.author] || "") : "";
    $("fContent").value = p ? (p[F.content] || "") : "";
    $("chars").textContent = $("fContent").value.length;
    $("formDlg").showModal();
    $("fTitle").focus();
}

async function save() {
    const body = { [F.title]: $("fTitle").value.trim(), [F.author]: $("fAuthor").value.trim(), [F.content]: $("fContent").value.trim() };
    if (!body[F.title]) return toast("Add a title first");
    if (!body[F.author]) return toast("Add the author’s name");
    if (!body[F.content]) return toast("Write something in the content");
    const isNew = editingId === null;
    try {
        if (isNew) await api("", { method: "POST", body: JSON.stringify(body) });
        else await api("/" + editingId, { method: "PUT", body: JSON.stringify({ [F.id]: editingId, ...body }) });
        $("formDlg").close();
        toast(isNew ? "Post published" : "Changes saved");
        load();
    } catch (e) { toast("Couldn’t save: " + e.message); }
}

async function removePost() {
    if (!confirm("Delete this post? This can’t be undone.")) return;
    try {
        await api("/" + openId, { method: "DELETE" });
        $("readDlg").close(); toast("Post deleted"); load();
    } catch (e) { toast("Couldn’t delete: " + e.message); }
}

$("newBtn").onclick = () => openForm(null);
$("cancelBtn").onclick = () => $("formDlg").close();
$("saveBtn").onclick = save;
$("readClose").onclick = () => $("readDlg").close();
$("readEdit").onclick = () => { const p = byId(openId); $("readDlg").close(); openForm(p); };
$("readDelete").onclick = removePost;
$("fContent").oninput = e => $("chars").textContent = e.target.value.length;
$("search").oninput = e => { query = e.target.value.trim(); render(); };
$("chips").addEventListener("click", e => {
    const b = e.target.closest("[data-author]"); if (!b) return;
    authorFilter = b.dataset.author; renderChips(); render();
});
$("feed").addEventListener("click", e => {
    const c = e.target.closest("[data-open]"); if (c) openRead(c.dataset.open);
});
load();
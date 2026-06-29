const tasks = JSON.parse(localStorage.getItem("smartTasks") || "[]");

const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const tasksTableBody = document.getElementById("tasksTableBody");
const tasksGrid = document.getElementById("tasksGrid");
const emptyStateTable = document.getElementById("emptyStateTable");
const emptyStateCards = document.getElementById("emptyStateCards");

const statTotal = document.getElementById("statTotal");
const statDone = document.getElementById("statDone");
const statPending = document.getElementById("statPending");
const statProgress = document.getElementById("statProgress");

const modalBackdrop = document.getElementById("modalBackdrop");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");

const taskTitleInput = document.getElementById("taskTitleInput");
const taskCategoryInput = document.getElementById("taskCategoryInput");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskDateInput = document.getElementById("taskDateInput");
const taskNotesInput = document.getElementById("taskNotesInput");

const viewTableBtn = document.getElementById("viewTableBtn");
const viewCardsBtn = document.getElementById("viewCardsBtn");
const tableView = document.getElementById("tableView");
const cardsView = document.getElementById("cardsView");

const clearAllBtn = document.getElementById("clearAllBtn");

function openModal() {
    modalBackdrop.style.display = "flex";
}

function closeModal() {
    modalBackdrop.style.display = "none";
    taskTitleInput.value = "";
    taskCategoryInput.value = "";
    taskPriorityInput.value = "medium";
    taskDateInput.value = "";
    taskNotesInput.value = "";
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

function saveTasksToStorage() {
    localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

function getPriorityBadge(priority) {
    if (priority === "low") return '<span class="badge badge-low">منخفضة</span>';
    if (priority === "medium") return '<span class="badge badge-medium">متوسطة</span>';
    return '<span class="badge badge-high">مرتفعة</span>';
}

function getStatusPill(done) {
    return done
        ? '<span class="status-pill status-done">مكتملة</span>'
        : '<span class="status-pill">قيد التنفيذ</span>';
}

function applyFilters(task) {
    const statusVal = statusFilter.value;
    const priorityVal = priorityFilter.value;

    if (statusVal !== "all") {
        if (statusVal === "done" && !task.done) return false;
        if (statusVal === "pending" && task.done) return false;
    }

    if (priorityVal !== "all" && task.priority !== priorityVal) {
        return false;
    }

    return true;
}

function renderStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    statTotal.textContent = total;
    statDone.textContent = done;
    statPending.textContent = pending;
    statProgress.textContent = progress + "%";
}

function renderTable() {
    tasksTableBody.innerHTML = "";
    const filtered = tasks.filter(applyFilters);

    if (filtered.length === 0) {
        emptyStateTable.style.display = "block";
    } else {
        emptyStateTable.style.display = "none";
    }

    filtered.forEach((task, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${task.title}</td>
            <td>${task.category || "-"}</td>
            <td>${getPriorityBadge(task.priority)}</td>
            <td>${task.date || "-"}</td>
            <td>${getStatusPill(task.done)}</td>
            <td class="task-actions">
                <button onclick="toggleTaskDone(${task.id})">${task.done ? "إلغاء الإنجاز" : "تحديد كمكتملة"}</button>
                |
                <button onclick="deleteTask(${task.id})" style="color:var(--danger)">حذف</button>
            </td>
        `;
        tasksTableBody.appendChild(tr);
    });
}

function renderCards() {
    tasksGrid.innerHTML = "";
    const filtered = tasks.filter(applyFilters);

    if (filtered.length === 0) {
        emptyStateCards.style.display = "block";
    } else {
        emptyStateCards.style.display = "none";
    }

    filtered.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-card";
        div.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span>${task.category || "بدون فئة"}</span>
                <span>${task.date || "-"}</span>
            </div>
            <div class="task-footer">
                <div>
                    ${getPriorityBadge(task.priority)}
                    ${getStatusPill(task.done)}
                </div>
                <div class="task-actions">
                    <button onclick="toggleTaskDone(${task.id})">${task.done ? "إلغاء" : "إنجاز"}</button>
                    <button onclick="deleteTask(${task.id})" style="color:var(--danger)">حذف</button>
                </div>
            </div>
        `;
        tasksGrid.appendChild(div);
    });
}

function drawChart() {
    const canvas = document.getElementById("tasksChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;

    const doneAngle = (done / total) * Math.PI * 2 || 0;
    const pendingAngle = (pending / total) * Math.PI * 2 || 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // مكتملة
    ctx.beginPath();
    ctx.fillStyle = "#4da3ff";
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 80, 0, doneAngle);
    ctx.fill();

    // غير مكتملة
    ctx.beginPath();
    ctx.fillStyle = "#333";
    ctx.moveTo(100, 100);
    ctx.arc(100, 100, 80, doneAngle, doneAngle + pendingAngle);
    ctx.fill();

    // دائرة داخلية (دونات)
    ctx.beginPath();
    ctx.fillStyle = "#1a1a1a";
    ctx.arc(100, 100, 45, 0, Math.PI * 2);
    ctx.fill();
}

function renderAll() {
    renderStats();
    renderTable();
    renderCards();
    drawChart();
}

saveTaskBtn.addEventListener("click", () => {
    const title = taskTitleInput.value.trim();
    const category = taskCategoryInput.value.trim();
    const priority = taskPriorityInput.value;
    const date = taskDateInput.value;
    const notes = taskNotesInput.value.trim();

    if (!title) {
        alert("الرجاء إدخال عنوان المهمة");
        return;
    }

    const task = {
        id: Date.now(),
        title,
        category,
        priority,
        date,
        notes,
        done: false
    };

    tasks.push(task);
    saveTasksToStorage();
    renderAll();
    closeModal();
});

statusFilter.addEventListener("change", renderAll);
priorityFilter.addEventListener("change", renderAll);

viewTableBtn.addEventListener("click", () => {
    viewTableBtn.classList.add("active");
    viewCardsBtn.classList.remove("active");
    tableView.style.display = "block";
    cardsView.style.display = "none";
});

viewCardsBtn.addEventListener("click", () => {
    viewCardsBtn.classList.add("active");
    viewTableBtn.classList.remove("active");
    tableView.style.display = "none";
    cardsView.style.display = "block";
});

clearAllBtn.addEventListener("click", () => {
    if (!confirm("هل تريد مسح كل المهام؟")) return;
    tasks.length = 0;
    saveTasksToStorage();
    renderAll();
});

window.toggleTaskDone = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveTasksToStorage();
    renderAll();
};

window.deleteTask = function(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;
    if (!confirm("هل تريد حذف هذه المهمة؟")) return;
    tasks.splice(index, 1);
    saveTasksToStorage();
    renderAll();
};

renderAll();

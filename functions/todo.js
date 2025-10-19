const fs = require('fs');
const path = require('path');
const moment = require('moment');

const todosPath = path.join(__dirname, '../database/todos.json');

function getTodos() {
  try {
    const data = fs.readFileSync(todosPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveTodos(todos) {
  try {
    fs.writeFileSync(todosPath, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error saving todos:', err);
  }
}

function getUserTodos(userId) {
  const allTodos = getTodos();
  return allTodos[userId] || [];
}

function saveUserTodos(userId, userTodos) {
  const allTodos = getTodos();
  allTodos[userId] = userTodos;
  saveTodos(allTodos);
}

async function addTodo(msg, task) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);

    const newTodo = {
      id: Date.now(),
      task: task.trim(),
      completed: false,
      priority: 'sedang',
      deadline: null,
      createdAt: new Date().toISOString()
    };

    userTodos.push(newTodo);
    saveUserTodos(userId, userTodos);

    await msg.reply(`✅ *Tugas berhasil ditambahkan!*\n\n📝 ${task}\n🆔 ID: ${newTodo.id}\n🟡 Prioritas: Sedang`);
  } catch (err) {
    console.error('Error adding todo:', err);
    await msg.reply('❌ Gagal menambahkan tugas. Silakan coba lagi.');
  }
}

async function listTodos(msg) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);

    if (userTodos.length === 0) {
      await msg.reply('📋 *Daftar Tugas Kosong*\n\nAnda belum memiliki tugas.\nTambah tugas dengan: *.todo add <tugas>*');
      return;
    }

    const pendingTodos = userTodos.filter(t => !t.completed);
    const completedTodos = userTodos.filter(t => t.completed);

    let message = '📋 *DAFTAR TUGAS ANDA*\n\n';

    if (pendingTodos.length > 0) {
      message += '⏳ *Belum Selesai:*\n';
      pendingTodos.forEach(todo => {
        const priorityIcon = todo.priority === 'tinggi' ? '🔴' : todo.priority === 'rendah' ? '🟢' : '🟡';
        const deadlineText = todo.deadline ? `\n   📅 Deadline: ${moment(todo.deadline).format('DD/MM/YYYY')}` : '';
        message += `\n${priorityIcon} [${todo.id}] ${todo.task}${deadlineText}`;
      });
      message += '\n';
    }

    if (completedTodos.length > 0) {
      message += '\n✅ *Selesai:*\n';
      completedTodos.forEach(todo => {
        message += `\n✔️ [${todo.id}] ${todo.task}`;
      });
    }

    message += `\n\n📊 Total: ${userTodos.length} tugas (${pendingTodos.length} pending, ${completedTodos.length} selesai)`;

    await msg.reply(message);
  } catch (err) {
    console.error('Error listing todos:', err);
    await msg.reply('❌ Gagal mengambil daftar tugas. Silakan coba lagi.');
  }
}

async function markDone(msg, todoId) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);
    const todo = userTodos.find(t => t.id == todoId);

    if (!todo) {
      await msg.reply(`❌ Tugas dengan ID ${todoId} tidak ditemukan.\n\n💡 Gunakan *.todo list* untuk melihat ID tugas.`);
      return;
    }

    if (todo.completed) {
      await msg.reply(`ℹ️ Tugas ini sudah ditandai selesai sebelumnya.\n\n📝 ${todo.task}`);
      return;
    }

    todo.completed = true;
    todo.completedAt = new Date().toISOString();
    saveUserTodos(userId, userTodos);

    await msg.reply(`✅ *Tugas selesai!*\n\n📝 ${todo.task}\n\n🎉 Selamat! Tugas berhasil diselesaikan!`);
  } catch (err) {
    console.error('Error marking todo done:', err);
    await msg.reply('❌ Gagal menandai tugas selesai. Silakan coba lagi.');
  }
}

async function deleteTodo(msg, todoId) {
  try {
    const userId = msg.from;
    let userTodos = getUserTodos(userId);
    const todoIndex = userTodos.findIndex(t => t.id == todoId);

    if (todoIndex === -1) {
      await msg.reply(`❌ Tugas dengan ID ${todoId} tidak ditemukan.`);
      return;
    }

    const deletedTodo = userTodos[todoIndex];
    userTodos.splice(todoIndex, 1);
    saveUserTodos(userId, userTodos);

    await msg.reply(`🗑️ *Tugas berhasil dihapus!*\n\n📝 ${deletedTodo.task}`);
  } catch (err) {
    console.error('Error deleting todo:', err);
    await msg.reply('❌ Gagal menghapus tugas. Silakan coba lagi.');
  }
}

async function setPriority(msg, todoId, priority) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);
    const todo = userTodos.find(t => t.id == todoId);

    if (!todo) {
      await msg.reply(`❌ Tugas dengan ID ${todoId} tidak ditemukan.`);
      return;
    }

    const validPriorities = ['tinggi', 'sedang', 'rendah'];
    const normalizedPriority = priority.toLowerCase();

    if (!validPriorities.includes(normalizedPriority)) {
      await msg.reply('❌ Prioritas tidak valid.\n\n✅ Gunakan: tinggi / sedang / rendah');
      return;
    }

    todo.priority = normalizedPriority;
    saveUserTodos(userId, userTodos);

    const priorityIcon = normalizedPriority === 'tinggi' ? '🔴' : normalizedPriority === 'rendah' ? '🟢' : '🟡';
    await msg.reply(`${priorityIcon} *Prioritas diubah menjadi: ${normalizedPriority.toUpperCase()}*\n\n📝 ${todo.task}`);
  } catch (err) {
    console.error('Error setting priority:', err);
    await msg.reply('❌ Gagal mengubah prioritas. Silakan coba lagi.');
  }
}

async function setDeadline(msg, todoId, dateStr) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);
    const todo = userTodos.find(t => t.id == todoId);

    if (!todo) {
      await msg.reply(`❌ Tugas dengan ID ${todoId} tidak ditemukan.`);
      return;
    }

    const deadline = moment(dateStr, ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'], true);

    if (!deadline.isValid()) {
      await msg.reply('❌ Format tanggal tidak valid.\n\n✅ Gunakan format: DD/MM/YYYY\nContoh: 25/10/2025');
      return;
    }

    todo.deadline = deadline.toISOString();
    saveUserTodos(userId, userTodos);

    await msg.reply(`📅 *Deadline berhasil ditambahkan!*\n\n📝 ${todo.task}\n📆 Deadline: ${deadline.format('DD MMMM YYYY')}`);
  } catch (err) {
    console.error('Error setting deadline:', err);
    await msg.reply('❌ Gagal menambahkan deadline. Silakan coba lagi.');
  }
}

async function getSummary(msg) {
  try {
    const userId = msg.from;
    const userTodos = getUserTodos(userId);

    if (userTodos.length === 0) {
      await msg.reply('📊 *Ringkasan Tugas*\n\nAnda belum memiliki tugas.');
      return;
    }

    const pending = userTodos.filter(t => !t.completed);
    const completed = userTodos.filter(t => t.completed);
    const highPriority = pending.filter(t => t.priority === 'tinggi');
    
    const today = moment().startOf('day');
    const todayDeadlines = pending.filter(t => {
      if (!t.deadline) return false;
      const deadline = moment(t.deadline).startOf('day');
      return deadline.isSame(today);
    });

    let message = '📊 *RINGKASAN TUGAS ANDA*\n\n';
    message += `📝 Total Tugas: ${userTodos.length}\n`;
    message += `⏳ Belum Selesai: ${pending.length}\n`;
    message += `✅ Selesai: ${completed.length}\n`;
    message += `🔴 Prioritas Tinggi: ${highPriority.length}\n`;

    if (todayDeadlines.length > 0) {
      message += `\n⚠️ *Deadline Hari Ini:*\n`;
      todayDeadlines.forEach(todo => {
        message += `• ${todo.task}\n`;
      });
    }

    if (highPriority.length > 0) {
      message += `\n🔴 *Tugas Prioritas Tinggi:*\n`;
      highPriority.slice(0, 3).forEach(todo => {
        message += `• ${todo.task}\n`;
      });
    }

    await msg.reply(message);
  } catch (err) {
    console.error('Error getting summary:', err);
    await msg.reply('❌ Gagal mengambil ringkasan. Silakan coba lagi.');
  }
}

async function clearCompleted(msg) {
  try {
    const userId = msg.from;
    let userTodos = getUserTodos(userId);
    const completedCount = userTodos.filter(t => t.completed).length;

    if (completedCount === 0) {
      await msg.reply('ℹ️ Tidak ada tugas yang sudah selesai untuk dihapus.');
      return;
    }

    userTodos = userTodos.filter(t => !t.completed);
    saveUserTodos(userId, userTodos);

    await msg.reply(`🧹 *Berhasil membersihkan!*\n\n${completedCount} tugas selesai telah dihapus.\n${userTodos.length} tugas aktif tersisa.`);
  } catch (err) {
    console.error('Error clearing completed:', err);
    await msg.reply('❌ Gagal membersihkan tugas. Silakan coba lagi.');
  }
}

module.exports = {
  addTodo,
  listTodos,
  markDone,
  deleteTodo,
  setPriority,
  setDeadline,
  getSummary,
  clearCompleted
};

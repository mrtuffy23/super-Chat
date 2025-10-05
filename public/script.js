const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Array untuk menyimpan riwayat percakapan
const conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Tambahkan pesan user ke riwayat dan tampilkan
  conversationHistory.push({ role: 'user', text: userMessage });
  appendMessage('user', userMessage);
  input.value = '';

  // Tampilkan pesan "thinking" dari bot
  const thinkingMessageElement = appendMessage('bot', 'Gemini is thinking...');

  try {
    // Kirim riwayat percakapan ke backend Anda
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    const data = await response.json();

    // Hapus pesan "thinking"
    chatBox.removeChild(thinkingMessageElement);

    if (data.success) {
      // Tambahkan respons model ke riwayat dan TAMPILKAN
      // Fungsi appendMessage akan otomatis memformat Markdown
      conversationHistory.push({ role: 'model', text: data.data });
      appendMessage('bot', data.data);
    } else {
      // Tampilkan pesan error dari backend
      appendMessage('bot', `Error: ${data.message}`);
    }
  } catch (error) {
    // Hapus pesan "thinking"
    chatBox.removeChild(thinkingMessageElement);
    console.error('Error sending message:', error);
    appendMessage('bot', 'Oops! Something went wrong. Please try again.');
  }
});


// FUNGSI YANG DIPERBARUI UNTUK MERENDER MARKDOWN
//-------------------------------------------------------------
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  // Jika pesan dari 'bot', gunakan marked.js untuk konversi Markdown ke HTML
  if (sender === 'bot') {
    // Pastikan marked.js sudah dimuat di index.html
    if (typeof marked !== 'undefined') {
      // Menggunakan marked.parse() untuk mengubah **bold** dan list menjadi HTML
      msg.innerHTML = marked.parse(text);
    } else {
      // Fallback jika marked.js gagal dimuat (tetap menggunakan textContent)
      msg.textContent = text;
    }
  } else {
    // Untuk pesan user, gunakan textContent agar aman (tidak merender HTML/Markdown)
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Mengembalikan elemen pesan agar bisa dihapus (misalnya pesan "thinking")
}
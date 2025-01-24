require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// Bot token va guruh ID
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const groupChatId = "-1002355839077"; // Guruh ID

// Fayl yo‘li
const pdfPath = path.join(__dirname, "malumot_kichik.pdf"); // PDF fayl yo‘li

// Foydalanuvchi ma'lumotlarini vaqtinchalik saqlash
const userInfo = {};

// /start buyrug‘ini boshqarish
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Boshlang‘ich xabar
  bot.sendMessage(
    chatId,
    "Assalomu Aleykum! DrBeeze botiga xush kelibsiz! 🌿\nIsmingizni kiriting 👇:"
  );
  userInfo[chatId] = { step: "name" }; // Bosqichni saqlash
});

// Xabarlarni boshqarish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Ismni kiritish
  if (userInfo[chatId]?.step === "name") {
    userInfo[chatId].name = msg.text.trim();
    userInfo[chatId].step = "phone";

    // Telefon raqamini so‘rash
    bot.sendMessage(chatId, "Telefon raqamingizni kiriting (format: +998901234567):", {
      reply_markup: {
        keyboard: [[{ text: "📞 Kontaktni yuborish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return;
  }

  // Telefon raqamini yoki kontaktni qabul qilish
  if (userInfo[chatId]?.step === "phone") {
    if (msg.contact) {
      userInfo[chatId].phone = msg.contact.phone_number;
    } else if (/^\+998\d{9}$/.test(msg.text.trim())) {
      userInfo[chatId].phone = msg.text.trim();
    } else {
      bot.sendMessage(chatId, "Iltimos, telefon raqamingizni to‘g‘ri formatda kiriting.");
      return;
    }

    userInfo[chatId].step = "done";

    // Ma'lumotlarni guruhga yuborish
    const { name, phone } = userInfo[chatId];
    bot.sendMessage(
      groupChatId,
      `📢 *Yangi foydalanuvchi ma'lumotlari:*\n\n👤 *Ismi:* ${name}\n📱 *Telefon:* ${phone}`,
      { parse_mode: "Markdown" }
    );

    // YouTube havolasi yuborish
    bot.sendMessage(
      chatId,
      "Mana video havolasi: https://www.youtube.com/watch?v=eQUW4Mk9lxo&feature=youtu.be"
    );

    // PDF yuborilishi haqida xabar
    bot.sendMessage(chatId, "Video va PDF fayl yuborilmoqda, iltimos kuting... ⏳");

    // PDF yuborish
    bot.sendDocument(chatId, fs.createReadStream(pdfPath)).then(() => {
      // Buyurtma berish tugmasini chiqarish
      bot.sendMessage(chatId, "Buyurtma berish uchun quyidagi tugmani bosing 📦:", {
        reply_markup: {
          keyboard: [["📦 Buyurtma berish"]],
          resize_keyboard: true,
        },
      });
    });

    return;
  }

  // Buyurtma berish tugmasi bosilganda
  if (msg.text === "📦 Buyurtma berish" && userInfo[chatId]?.step === "done") {
    const { name, phone } = userInfo[chatId];

    // Guruhga buyurtma ma'lumotlarini yuborish
    bot.sendMessage(
      groupChatId,
      `📦 *Yangi buyurtma:*\n\n👤 *Ismi:* ${name}\n📱 *Telefon:* ${phone}`,
      { parse_mode: "Markdown" }
    )
      .then(() => {
        bot.sendMessage(chatId, "Buyurtmangiz qabul qilindi! Tez orada bog‘lanamiz. 😊");
      })
      .catch((err) => {
        console.error("Buyurtmani guruhga yuborishda xatolik:", err.message);
        bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.");
      });
  }
});

console.log("Bot ishga tushdwi!");

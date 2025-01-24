const fs = require("fs");
const path = require("path");

// Logs papkasini tekshirish va yaratish
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Kontaktlarni logga yozish funksiyasi
const logContact = (contact) => {
  const logPath = path.join(logsDir, "contact_log.txt");
  const logMessage = `Ism: ${contact.first_name}, Telefon: ${contact.phone_number}\n`;

  // Faylga yozish
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error("Log yozishda xatolik yuz berdi:", err);
    }
  });
};

module.exports = { logContact };

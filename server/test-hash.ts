import bcrypt from "bcrypt";

async function testHash() {
  console.log("Тестирование хеширования пароля");
  
  const password = "12345";
  console.log("Исходный пароль:", password);
  
  const salt = await bcrypt.genSalt(10);
  console.log("Созданная соль:", salt);
  
  const hash = await bcrypt.hash(password, salt);
  console.log("Хешированный пароль:", hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log("Проверка пароля (должна быть true):", isValid);
  
  const isInvalid = await bcrypt.compare("неверныйпароль", hash);
  console.log("Проверка неверного пароля (должна быть false):", isInvalid);
}

testHash().catch(console.error); 
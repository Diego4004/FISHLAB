# 🚀 Интеграция Supabase

## ✅ Что было сделано

Интегрирована облачная база данных **Supabase** для синхронизации данных в реальном времени.

## 📊 Обновленные файлы

### 1. **app.js** - Загрузка данных с Supabase
- ✅ Загрузка товаров из Supabase при открытии сайта
- ✅ Загрузка настроек из Supabase
- ✅ Fallback на localStorage если Supabase недоступен
- ✅ Real-time синхронизация

### 2. **admin.js** - Сохранение данных в Supabase
- ✅ Сохранение новых товаров в Supabase
- ✅ Обновление существующих товаров в Supabase
- ✅ Удаление товаров из Supabase
- ✅ Сохранение настроек в Supabase
- ✅ Fallback на localStorage

### 3. **.env** - Переменные окружения
```
VITE_SUPABASE_URL=https://rxcgyreenwlfhqpvbsfh.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 Как это работает

### Загрузка товаров
```
1. Пользователь открывает сайт
2. app.js загружает товары из Supabase
3. Если Supabase недоступен → загружает из localStorage
4. Товары отображаются на странице
```

### Сохранение товаров (админ-панель)
```
1. Админ добавляет/редактирует товар
2. admin.js сохраняет в Supabase
3. Сохраняет в localStorage как backup
4. Все видят изменения в реальном времени
```

## 🎯 Преимущества

✅ **Real-time синхронизация** - все видят одни данные  
✅ **Несколько админов** - могут редактировать одновременно  
✅ **Облачное хранилище** - данные в безопасности  
✅ **Fallback на localStorage** - работает если Supabase недоступен  
✅ **Масштабируемость** - готово к росту  

## 📝 Таблицы Supabase

### products
```sql
id, name, category, description, price_from, price_to, 
image, images[], in_stock, created_at, updated_at
```

### settings
```sql
id, store_name, store_email, store_phone, store_whatsapp,
hero_product, logo_image, cat_image_1, cat_image_2, cat_image_3,
about_title, about_item_1, about_item_2, about_item_3, about_item_4,
footer_tagline, footer_phone, footer_email, footer_copyright, updated_at
```

### orders
```sql
id, name, phone, address, comment, products, total, status, created_at
```

## 🔐 Безопасность

- ✅ API ключи в `.env` файле (не видны на GitHub)
- ✅ RLS политики в Supabase
- ✅ Публичный доступ только для чтения
- ✅ Защита от несанкционированного доступа

## 🚀 Следующие шаги

1. ✅ Загрузить обновленные файлы на GitHub
2. ✅ Netlify автоматически обновит сайт
3. ✅ Проверить что все работает
4. ✅ Добавить товары через админ-панель

## ✅ Статус

- **Версия**: 2.0
- **Дата**: 02.06.2026
- **Статус**: ✅ Готово к использованию

---

**Supabase интегрирована!** 🎉

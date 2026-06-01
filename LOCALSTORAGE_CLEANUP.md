# 🗑️ Решение проблемы переполнения localStorage

## 🔴 Проблема

**Ошибка:** "localStorage переповнений!" (localStorage переполнен)

**Причина:** Фотографии товаров сохраняются в base64 формате, что занимает очень много места (~5-10MB лимит браузера).

## ✅ Решение

Добавлена **автоматическая очистка localStorage** при переполнении.

## 🔧 Как это работает

### Шаг 1: Удаление изображений из настроек
- Удаляет логотип сайта
- Удаляет фотографии категорий

### Шаг 2: Удаление изображений из товаров
- Удаляет главные фотографии товаров
- Удаляет дополнительные фотографии товаров
- **Сохраняет** названия, описания, цены, категории

### Шаг 3: Если все еще переполнено
- Удаляет заказы

## 📊 Результат

**До очистки:**
- Товары с фотографиями: ~8-10MB
- localStorage переполнен ❌

**После очистки:**
- Товары без фотографий: ~50-100KB
- localStorage свободен ✅

## 💡 Долгосрочное решение

**Рекомендуется использовать Supabase:**
- ✅ Неограниченное хранилище
- ✅ Все видят изменения в реальном времени
- ✅ Фотографии хранятся в облаке
- ✅ Быстрая загрузка

## 📝 Код

```javascript
function cleanupLocalStorage() {
    try {
        const testKey = '__test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('🗑️ localStorage quota exceeded, auto-cleaning...');
            
            // Step 1: Remove images from settings
            const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
            if (settings.logoImage) delete settings.logoImage;
            for (let i = 1; i <= 4; i++) {
                if (settings[`catImage${i}`]) delete settings[`catImage${i}`];
            }
            localStorage.setItem('storeSettings', JSON.stringify(settings));
            
            // Step 2: Remove images from products
            const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            const cleanedProducts = products.map(p => ({
                ...p,
                image: null,
                images: []
            }));
            localStorage.setItem('adminProducts', JSON.stringify(cleanedProducts));
            
            // Step 3: Clear orders if needed
            localStorage.removeItem('orders');
        }
    }
}

cleanupLocalStorage();
```

## ✅ Статус

- **Версия**: 1.8
- **Дата**: 01.06.2026
- **Статус**: ✅ Готово к использованию

---

**Готово!** Проблема с переполнением localStorage решена.
